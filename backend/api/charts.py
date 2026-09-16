from fastapi import APIRouter
from backend.services.chart_service import ChartService
from backend.schemas.chart_response import ChartResponse

router = APIRouter()

@router.get(
    "/charts",
    response_model=ChartResponse,
    summary="Get Dashboard Charts",
    description="Returns bar, line, and pie chart data for the frontend dashboard."
)
def get_charts():

    charts = ChartService.get_all_charts()

    return {
        "status": "success",
        "charts": charts
    }