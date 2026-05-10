from pydantic import BaseModel
from typing import List

class Clause(BaseModel):
    clause_text: str
    explanation: str
    risk_score: int

class AnalysisResult(BaseModel):
    summary: str
    overall_score: int
    high_risk: List[Clause]
    safe_clauses: List[Clause]
    source_type: str  # "pdf" or "url"
    source_name: str  # filename or URL
