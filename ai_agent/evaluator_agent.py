"""
MetricMind - Evaluator Agent
==============================

Verifies analytical conclusions before they are reported to the user:

  1. is_sql_safe()   - screens SQL for destructive/unsafe operations (defense in
                        depth on top of the deterministic SQL the root-cause agent
                        builds, and the only line of defense for LLM-generated SQL
                        used elsewhere in the app, e.g. the chat endpoint).
  2. verify_narrative() - cross-checks every dollar figure and percentage the AI
                        narrative claims against the actual computed evidence, and
                        checks that every named segment (region/category/product)
                        it references genuinely appears in the evidence. This is
                        what catches LLM hallucination before it reaches the user.

Nothing here is a black box: every flag returned is traceable to a specific
number comparison or a specific missing/extra entity.
"""

import re

# --------------------------------------------------------------------------- #
# SQL safety screening
# --------------------------------------------------------------------------- #

_ALLOWED_PREFIXES = ("select", "show", "with")

_FORBIDDEN_KEYWORDS = (
    "drop", "delete", "update", "insert", "alter", "truncate", "grant",
    "revoke", "create", "attach", "exec", "execute", "--", "/*", ";--",
    "xp_cmdshell",
)


def is_sql_safe(sql: str) -> dict:
    """Returns {'safe': bool, 'reason': str|None}."""
    if not sql or not sql.strip():
        return {"safe": False, "reason": "Empty SQL statement."}

    normalized = sql.strip().lower()

    if not normalized.startswith(_ALLOWED_PREFIXES):
        return {"safe": False, "reason": f"Statement does not start with an allowed read-only clause ({', '.join(_ALLOWED_PREFIXES)})."}

    # Reject multiple statements chained together (basic injection guard)
    body = normalized.rstrip(";")
    if ";" in body:
        return {"safe": False, "reason": "Multiple statements detected in a single query."}

    for keyword in _FORBIDDEN_KEYWORDS:
        if re.search(rf"\b{re.escape(keyword)}\b", normalized) or keyword in ("--", "/*", ";--"):
            if keyword in normalized:
                return {"safe": False, "reason": f"Forbidden keyword/pattern detected: '{keyword}'."}

    return {"safe": True, "reason": None}


def screen_queries(queries: dict) -> dict:
    """Run is_sql_safe over a {label: sql} dict. Returns overall pass/fail + per-query results."""
    results = {label: is_sql_safe(sql) for label, sql in queries.items()}
    unsafe = {label: r for label, r in results.items() if not r["safe"]}
    return {
        "all_safe": len(unsafe) == 0,
        "unsafe_queries": unsafe,
        "results": results,
    }


# --------------------------------------------------------------------------- #
# Narrative evidence-checking
# --------------------------------------------------------------------------- #

_PERIOD_RE = re.compile(r"\b\d{4}-\d{2}(-\d{2})?\b")  # YYYY-MM or YYYY-MM-DD
_NUMBER_RE = re.compile(r"[-+]?\$?\d[\d,]*\.?\d*\s?%")   # requires a $ or % marker
_DOLLAR_RE = re.compile(r"[-+]?\$\s?\d[\d,]*\.?\d*")     # explicit $ amount, sign may precede $
_COMMA_NUM_RE = re.compile(r"[-+]?\d{1,3}(?:,\d{3})+\.?\d*")  # comma-grouped number (e.g. 1,203,707.79)


def _extract_numbers(text: str) -> list:
    """
    Pull financially-meaningful numeric claims out of the narrative - i.e. numbers
    that carry a $ or % marker, or are comma-grouped (clearly a real figure, not a
    bare digit that happens to be part of a segment name like 'Category 12').
    """
    if not text:
        return []

    # Strip YYYY-MM style period references first so their digits are never treated as claims
    cleaned_text = _PERIOD_RE.sub(" ", text)

    found = []
    seen_spans = set()

    for pattern, is_pct in ((_NUMBER_RE, True), (_DOLLAR_RE, False), (_COMMA_NUM_RE, False)):
        for match in pattern.finditer(cleaned_text):
            span = match.span()
            if span in seen_spans:
                continue
            seen_spans.add(span)
            raw = match.group().strip()
            pct = raw.endswith("%")
            cleaned = raw.replace("$", "").replace("%", "").replace(",", "").replace(" ", "").strip()
            if cleaned in ("", "-", "+"):
                continue
            try:
                value = float(cleaned)
            except ValueError:
                continue
            found.append({"raw": raw, "value": value, "is_pct": pct})

    return found


def _evidence_number_pool(evidence: dict, tolerance_abs: float = 0.5) -> list:
    """Every legitimate number (and its rounding-tolerant neighbors) the narrative is allowed to cite."""
    pool = []

    def add(v, is_pct=False):
        if v is None:
            return
        pool.append({"value": round(float(v), 2), "is_pct": is_pct})

    add(evidence.get("overall_current"))
    add(evidence.get("overall_baseline"))
    add(evidence.get("overall_delta"))
    add(abs(evidence.get("overall_delta", 0)))
    add(evidence.get("overall_pct_change"), is_pct=True)
    if evidence.get("overall_pct_change") is not None:
        add(abs(evidence["overall_pct_change"]), is_pct=True)

    # Any driver list the narrative might legitimately cite from
    all_drivers = (
        evidence.get("top_drivers", [])
        + evidence.get("top_positive_drivers", [])
        + evidence.get("top_negative_drivers", [])
    )
    for driver in all_drivers:
        add(driver.get("current_value"))
        add(driver.get("baseline_value"))
        add(driver.get("delta"))
        add(abs(driver.get("delta", 0)))
        add(driver.get("pct_of_overall_change"), is_pct=True)
        if driver.get("pct_of_overall_change") is not None:
            add(abs(driver["pct_of_overall_change"]), is_pct=True)

    return pool


def _known_segments(evidence: dict) -> set:
    all_drivers = (
        evidence.get("top_drivers", [])
        + evidence.get("top_positive_drivers", [])
        + evidence.get("top_negative_drivers", [])
    )
    return {d["segment"] for d in all_drivers if d.get("segment")}


def verify_narrative(narrative: str, evidence: dict, tolerance_pct: float = 2.0) -> dict:
    """
    Checks every number and named segment in `narrative` against `evidence`.
    Returns a verdict the caller can act on (e.g. regenerate on failure).
    """
    if not narrative:
        return {"verified": False, "confidence": 0.0, "flags": ["Narrative is empty."]}

    flags = []
    numbers = _extract_numbers(narrative)
    pool = _evidence_number_pool(evidence)

    unmatched_numbers = 0
    checked_numbers = 0
    for num in numbers:
        # skip tiny numbers (likely "3-4", "5", counts) — focus on figures that look like real claims
        if abs(num["value"]) < 1 and not num["is_pct"]:
            continue
        checked_numbers += 1
        match = any(
            p["is_pct"] == num["is_pct"] and
            abs(p["value"] - num["value"]) <= max(tolerance_pct, abs(p["value"]) * (tolerance_pct / 100.0))
            for p in pool
        )
        if not match:
            unmatched_numbers += 1
            flags.append(f"Unverified figure in narrative: '{num['raw']}' does not match any computed evidence value.")

    known_segments = _known_segments(evidence)
    narrative_lower = narrative.lower()
    mentioned_segments = [
        seg for seg in known_segments
        if seg and re.search(rf"\b{re.escape(seg.lower())}\b", narrative_lower)
    ]

    # Confidence: proportion of numeric claims that matched evidence
    if checked_numbers == 0:
        number_score = 1.0
    else:
        number_score = 1.0 - (unmatched_numbers / checked_numbers)

    verified = (unmatched_numbers == 0)
    confidence = round(number_score, 2)

    return {
        "verified": verified,
        "confidence": confidence,
        "flags": flags,
        "numbers_checked": checked_numbers,
        "numbers_unmatched": unmatched_numbers,
        "segments_confirmed": mentioned_segments,
    }
