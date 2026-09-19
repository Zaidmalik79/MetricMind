from fastapi import APIRouter

from backend.schemas.investigate import InvestigateRequest
from backend.services.investigation_service import InvestigationService
from backend.utils.logger import logger

router = APIRouter()


@router.post(
    "/api/investigate",
    summary="Investigate why a metric changed",
    description=(
        "Root-cause analysis endpoint. Compares a metric between two periods, breaks the "
        "change down by region/category/product, generates an AI narrative explanation, and "
        "evidence-checks that narrative against the underlying numbers before returning it."
    ),
)
def investigate(request: InvestigateRequest):
    try:
        logger.info(
            f"Investigation requested: metric={request.metric} "
            f"current={request.current_period} baseline={request.baseline_period}"
        )
        result = InvestigationService.investigate(
            metric=request.metric,
            current_period=request.current_period,
            baseline_period=request.baseline_period,
            dimensions=request.dimensions,
        )
        return result
    except ValueError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": f"Investigation failed: {e}"}
