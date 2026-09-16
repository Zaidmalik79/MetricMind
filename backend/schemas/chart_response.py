from pydantic import BaseModel
from typing import List, Dict, Any


class ChartResponse(BaseModel):
    status: str
    charts: Dict[str, List[Dict[str, Any]]]