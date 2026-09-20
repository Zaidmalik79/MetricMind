<<<<<<< HEAD
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
=======
from typing import Optional
from fastapi import APIRouter, Query
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

@router.get(
    "/api/dashboard/filters",
    summary="Get Available Dashboard Filter Options",
    description="Returns distinct regions, categories, and timeframes for interactive dashboard selectors."
)
def get_dashboard_filters():
    filters = ChartService.get_filter_options()
    return {
        "status": "success",
        "filters": filters
    }

@router.get(
    "/api/dashboard/interactive",
    summary="Get Interactive Dashboard Analytics",
    description="Returns filtered KPIs, monthly time-series, category shares, regional rankings, and top products."
)
def get_interactive_dashboard(
    region: Optional[str] = Query(None, description="Filter by geographic region"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    timeframe: Optional[str] = Query(None, description="Timeframe filter e.g. Q1, Q2, Q3, Q4, All Time"),
    metric: Optional[str] = Query("revenue", description="Active metric focus e.g. revenue, profit, orders")
):
    data = ChartService.get_interactive_dashboard(
        region=region,
        category=category,
        timeframe=timeframe,
        metric=metric
    )
    return data
>>>>>>> dd7d397 (Add backend API charts module)
