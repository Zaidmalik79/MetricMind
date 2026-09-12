"""
MetricMind - Root Cause Investigation Agent
=============================================

Investigates *why* a business metric changed between two periods.

Pipeline:
  1. build_*_query()      -> deterministic, parameterized SQL (never LLM-written,
                              so it is safe by construction; still passed through
                              evaluator_agent.is_sql_safe() as defense in depth)
  2. compute_root_cause() -> pure-python driver / contribution analysis on the
                              query results returned by the backend
  3. generate_narrative() -> Gemini-powered (or rule-based fallback) explanation
                              grounded in the computed evidence
  4. generate_recommendation() -> Gemini-powered (or rule-based fallback) actions

This module never talks to a database directly - the backend's QueryService
executes the SQL this module builds and hands the rows back in.
"""

from typing import Optional

from ai_agent.gemini_client import generate_text

# --------------------------------------------------------------------------- #
# Metric + dimension registry
# --------------------------------------------------------------------------- #

METRICS = {
    "revenue": {"table": "sales", "column": "SalesAmount", "agg": "SUM", "label": "Revenue"},
    "sales": {"table": "sales", "column": "SalesAmount", "agg": "SUM", "label": "Revenue"},
    "profit": {"table": "sales", "column": "Profit", "agg": "SUM", "label": "Profit"},
    "orders": {"table": "sales", "column": "OrderID", "agg": "COUNT", "label": "Orders"},
    "quantity": {"table": "sales", "column": "Quantity", "agg": "SUM", "label": "Units Sold"},
}

# dimension key -> (join clause, group-by column expression, display column, join needed)
#
# NOTE: customer/products are stored denormalized in this dataset (one row per sale
# rather than one row per entity), so a plain join fans out SUM()s massively. Joining
# against a DISTINCT subquery keeps the dimension side a clean 1-row-per-entity table.
DIMENSIONS = {
    "region": {
        "select": 'c."Region"',
        "join": 'JOIN (SELECT DISTINCT "CustomerID", "Region" FROM customer) c ON s."CustomerID" = c."CustomerID"',
        "label": "Region",
    },
    "category": {
        "select": 'p."Category"',
        "join": 'JOIN (SELECT DISTINCT "ProductID", "Category" FROM products) p ON s."ProductID" = p."ProductID"',
        "label": "Category",
    },
    "product": {
        "select": 'p."ProductName"',
        "join": 'JOIN (SELECT DISTINCT "ProductID", "ProductName" FROM products) p ON s."ProductID" = p."ProductID"',
        "label": "Product",
    },
}

DEFAULT_DIMENSIONS = ["region", "category", "product"]


def resolve_metric(metric: str) -> dict:
    key = (metric or "revenue").strip().lower()
    return METRICS.get(key, METRICS["revenue"])


def _period_filter_sql() -> str:
    """PostgreSQL expression converting the text OrderDate ('DD-MM-YYYY') into a YYYY-MM period."""
    return 'TO_CHAR(TO_DATE(s."OrderDate", \'DD-MM-YYYY\'), \'YYYY-MM\')'


# --------------------------------------------------------------------------- #
# SQL builders (deterministic - not LLM generated)
# --------------------------------------------------------------------------- #

def build_available_periods_query() -> str:
    period = _period_filter_sql()
    return (
        f'SELECT DISTINCT {period} AS period '
        f'FROM sales s '
        f'ORDER BY period DESC;'
    )


def build_overall_query(metric: str, period: str) -> str:
    """Total metric value for a single YYYY-MM period."""
    m = resolve_metric(metric)
    period_expr = _period_filter_sql()
    return (
        f'SELECT {m["agg"]}(s."{m["column"]}") AS metric_value '
        f'FROM sales s '
        f'WHERE {period_expr} = \'{period}\';'
    )


def build_breakdown_query(metric: str, dimension: str, period: str) -> str:
    """Metric broken down by a dimension (region / category / product) for one period."""
    m = resolve_metric(metric)
    d = DIMENSIONS[dimension]
    period_expr = _period_filter_sql()
    return (
        f'SELECT {d["select"]} AS segment, {m["agg"]}(s."{m["column"]}") AS metric_value '
        f'FROM sales s '
        f'{d["join"]} '
        f'WHERE {period_expr} = \'{period}\' '
        f'GROUP BY {d["select"]} '
        f'ORDER BY metric_value DESC;'
    )


def build_investigation_queries(metric: str, current_period: str, baseline_period: str,
                                 dimensions: Optional[list] = None) -> dict:
    """Return every SQL statement needed for a full investigation, keyed by purpose."""
    dims = dimensions or DEFAULT_DIMENSIONS
    queries = {
        "overall_current": build_overall_query(metric, current_period),
        "overall_baseline": build_overall_query(metric, baseline_period),
    }
    for dim in dims:
        queries[f"breakdown_{dim}_current"] = build_breakdown_query(metric, dim, current_period)
        queries[f"breakdown_{dim}_baseline"] = build_breakdown_query(metric, dim, baseline_period)
    return queries


# --------------------------------------------------------------------------- #
# Pure-python root cause computation (operates on already-executed query rows)
# --------------------------------------------------------------------------- #

def _rows_to_map(rows: list) -> dict:
    """[{'segment': 'Region 1', 'metric_value': 123}, ...] -> {'Region 1': 123.0}"""
    out = {}
    for row in rows or []:
        seg = row.get("segment")
        val = row.get("metric_value")
        out[seg] = float(val) if val is not None else 0.0
    return out


def compute_root_cause(metric: str, current_period: str, baseline_period: str,
                        overall_current: float, overall_baseline: float,
                        breakdowns: dict, top_n: int = 5) -> dict:
    """
    breakdowns: { "region": {"current": [rows], "baseline": [rows]}, "category": {...}, ... }
    Returns a fully evidence-backed dict - every number here is traceable to a SQL result.
    """
    m = resolve_metric(metric)
    overall_current = float(overall_current or 0.0)
    overall_baseline = float(overall_baseline or 0.0)
    overall_delta = overall_current - overall_baseline
    overall_pct = (overall_delta / overall_baseline * 100.0) if overall_baseline else None

    drivers = []
    per_dimension = {}

    for dim_key, data in breakdowns.items():
        cur_map = _rows_to_map(data.get("current"))
        base_map = _rows_to_map(data.get("baseline"))
        segments = set(cur_map) | set(base_map)

        dim_rows = []
        for seg in segments:
            cur_val = cur_map.get(seg, 0.0)
            base_val = base_map.get(seg, 0.0)
            delta = cur_val - base_val
            pct_of_overall_change = (delta / overall_delta * 100.0) if overall_delta else 0.0
            dim_rows.append({
                "segment": seg,
                "dimension": DIMENSIONS[dim_key]["label"],
                "current_value": round(cur_val, 2),
                "baseline_value": round(base_val, 2),
                "delta": round(delta, 2),
                "pct_of_overall_change": round(pct_of_overall_change, 1),
            })

        dim_rows.sort(key=lambda r: abs(r["delta"]), reverse=True)
        per_dimension[dim_key] = dim_rows
        drivers.extend(dim_rows)

    # Rank all segments across all dimensions by absolute contribution to the overall change
    drivers.sort(key=lambda r: abs(r["delta"]), reverse=True)
    top_drivers = drivers[:top_n]
    top_positive = [d for d in drivers if d["delta"] > 0][:top_n]
    top_negative = [d for d in drivers if d["delta"] < 0][:top_n]

    return {
        "metric": m["label"],
        "current_period": current_period,
        "baseline_period": baseline_period,
        "overall_current": round(overall_current, 2),
        "overall_baseline": round(overall_baseline, 2),
        "overall_delta": round(overall_delta, 2),
        "overall_pct_change": round(overall_pct, 2) if overall_pct is not None else None,
        "direction": "increase" if overall_delta > 0 else ("decrease" if overall_delta < 0 else "flat"),
        "top_drivers": top_drivers,
        "top_positive_drivers": top_positive,
        "top_negative_drivers": top_negative,
        "per_dimension": per_dimension,
    }


# --------------------------------------------------------------------------- #
# Narrative + recommendation generation
# --------------------------------------------------------------------------- #

def _fallback_narrative(evidence: dict) -> str:
    """Deterministic narrative built directly from evidence numbers - always accurate."""
    metric = evidence["metric"]
    direction = evidence["direction"]
    pct = evidence["overall_pct_change"]
    pct_txt = f"{abs(pct):.1f}%" if pct is not None else "an unquantifiable rate"

    article = "an" if direction == "increase" else "a"
    delta_txt = f"${evidence['overall_delta']:,.2f}" if evidence['overall_delta'] >= 0 else f"-${abs(evidence['overall_delta']):,.2f}"
    lines = [
        f"{metric} moved from {evidence['baseline_period']} to {evidence['current_period']}, "
        f"{article} {direction} of {pct_txt} ({delta_txt})."
    ]

    top_pos = evidence["top_positive_drivers"][:2]
    top_neg = evidence["top_negative_drivers"][:2]

    if top_pos:
        parts = [f"{d['segment']} (+${d['delta']:,.2f})" for d in top_pos]
        lines.append("Largest positive contributors: " + ", ".join(parts) + ".")
    if top_neg:
        parts = [f"{d['segment']} (-${abs(d['delta']):,.2f})" for d in top_neg]
        lines.append("Largest negative contributors: " + ", ".join(parts) + ".")

    return " ".join(lines)


def generate_narrative(evidence: dict) -> str:
    """Ask Gemini to explain the change, grounded strictly in the computed evidence."""
    prompt = f"""
You are a Senior Business Analyst investigating a metric change.

Evidence (already computed from the database - use ONLY these numbers, never invent new ones):
{evidence}

Instructions:
- Explain WHY the metric changed, citing the specific segments (region/category/product) and their dollar deltas from the evidence.
- Every number you state must come directly from the evidence above.
- Do not mention segments that are not present in the evidence.
- 3-4 sentences, professional business language.
- Return ONLY the explanation text, no headings, no markdown.
"""
    result = generate_text(prompt)
    if result and len(result.strip()) > 5:
        return result.strip()
    return _fallback_narrative(evidence)


def _fallback_recommendation(evidence: dict) -> str:
    recs = []
    for d in evidence["top_negative_drivers"][:2]:
        recs.append(f"- Investigate the drop in {d['segment']} ({d['dimension']}), down ${abs(d['delta']):,.2f}.")
    for d in evidence["top_positive_drivers"][:2]:
        recs.append(f"- Double down on {d['segment']} ({d['dimension']}), which contributed +${d['delta']:,.2f}.")
    if not recs:
        recs.append("- No significant segment-level shifts were detected; monitor next period for emerging trends.")
    return "\n".join(recs)


def generate_recommendation(evidence: dict) -> str:
    prompt = f"""
You are a Senior Business Strategy Consultant.

Evidence (already computed from the database - use ONLY these numbers, never invent new ones):
{evidence}

Instructions:
- Return exactly 3-4 actionable recommendations as bullet points, grounded strictly in the evidence above.
- Reference the actual segment names and dollar figures from the evidence where relevant.
- Do not include introductions or explanations.
- Return ONLY the bullet points.
"""
    result = generate_text(prompt)
    if result and len(result.strip()) > 5:
        return result.strip()
    return _fallback_recommendation(evidence)
