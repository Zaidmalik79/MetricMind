from typing import Optional, List
from pydantic import BaseModel, Field


class InvestigateRequest(BaseModel):
    metric: str = Field(..., description="Target business metric to investigate: revenue, profit, orders, quantity")
    current_period: Optional[str] = Field(None, description="Primary YYYY-MM period under investigation")
    baseline_period: Optional[str] = Field(None, description="Baseline YYYY-MM comparison period")
    dimensions: Optional[List[str]] = Field(default=["category", "region", "product"], description="List of breakdown dimensions")
