from backend.services.query_service import QueryService
from backend.utils.logger import logger

from ai_agent import root_cause_agent as rca
from ai_agent import evaluator_agent as evaluator


class InvestigationService:
    """
    Orchestrates a full root-cause investigation:
      1. Resolve current/baseline periods (auto-detect from data if not given)
      2. Build + safety-screen the deterministic analytical SQL
      3. Execute it via QueryService
      4. Compute evidence-backed drivers with the root cause agent
      5. Generate a Gemini-powered (or fallback) narrative + recommendation
      6. Evidence-check the narrative with the evaluator agent before returning it
    """

    @staticmethod
    def _resolve_periods(current_period, baseline_period):
        rows = QueryService.execute_query(rca.build_available_periods_query())
        periods = [r["period"] for r in rows if r.get("period")]
        periods.sort(reverse=True)

        if not periods:
            raise ValueError("No dated sales records found to investigate.")

        if current_period is None:
            current_period = periods[0]

        if baseline_period is None:
            idx = periods.index(current_period) if current_period in periods else 0
            if idx + 1 >= len(periods):
                raise ValueError(f"No prior period available before {current_period} to compare against.")
            baseline_period = periods[idx + 1]

        return current_period, baseline_period

    @staticmethod
    def investigate(metric: str, current_period: str = None, baseline_period: str = None,
                     dimensions: list = None) -> dict:
        dims = dimensions or rca.DEFAULT_DIMENSIONS
        dims = [d for d in dims if d in rca.DIMENSIONS] or rca.DEFAULT_DIMENSIONS

        current_period, baseline_period = InvestigationService._resolve_periods(current_period, baseline_period)

        queries = rca.build_investigation_queries(metric, current_period, baseline_period, dims)

        # --- Safety screen every generated query before running any of them --- #
        safety = evaluator.screen_queries(queries)
        if not safety["all_safe"]:
            logger.warning(f"Unsafe SQL blocked in investigation: {safety['unsafe_queries']}")
            return {
                "status": "error",
                "message": "One or more generated queries failed the safety check.",
                "sql_safety": safety,
            }

        # --- Execute --- #
        overall_current = QueryService.execute_query(queries["overall_current"])
        overall_baseline = QueryService.execute_query(queries["overall_baseline"])

        overall_current_val = (overall_current[0].get("metric_value") if overall_current else 0) or 0
        overall_baseline_val = (overall_baseline[0].get("metric_value") if overall_baseline else 0) or 0

        breakdowns = {}
        for dim in dims:
            breakdowns[dim] = {
                "current": QueryService.execute_query(queries[f"breakdown_{dim}_current"]),
                "baseline": QueryService.execute_query(queries[f"breakdown_{dim}_baseline"]),
            }

        # --- Compute evidence --- #
        evidence = rca.compute_root_cause(
            metric, current_period, baseline_period,
            overall_current_val, overall_baseline_val, breakdowns,
        )

        # --- Generate + verify narrative (regenerate once with the deterministic
        #     fallback if the AI narrative doesn't check out against the evidence) --- #
        narrative = rca.generate_narrative(evidence)
        verification = evaluator.verify_narrative(narrative, evidence)

        if not verification["verified"]:
            logger.warning(f"AI narrative failed evidence check, falling back to deterministic narrative: {verification['flags']}")
            narrative = rca._fallback_narrative(evidence)
            verification = evaluator.verify_narrative(narrative, evidence)
            verification["regenerated"] = True
        else:
            verification["regenerated"] = False

        recommendation = rca.generate_recommendation(evidence)

        return {
            "status": "success",
            "metric": evidence["metric"],
            "current_period": current_period,
            "baseline_period": baseline_period,
            "overall": {
                "current_value": evidence["overall_current"],
                "baseline_value": evidence["overall_baseline"],
                "delta": evidence["overall_delta"],
                "pct_change": evidence["overall_pct_change"],
                "direction": evidence["direction"],
            },
            "top_drivers": evidence["top_drivers"],
            "top_positive_drivers": evidence["top_positive_drivers"],
            "top_negative_drivers": evidence["top_negative_drivers"],
            "per_dimension": evidence["per_dimension"],
            "narrative": narrative,
            "recommendation": recommendation,
            "verification": verification,
            "sql_safety": safety,
            "generated_sql": queries,
        }
