from typing import Any, Literal
from pydantic import BaseModel, Field


class Evidence(BaseModel):
    description: str
    source: str
    strength: Literal["weak", "moderate", "strong"] = "moderate"
    supports_hypothesis: bool


class Hypothesis(BaseModel):
    id: str
    explanation: str
    evidence_for: list[Evidence] = Field(default_factory=list)
    evidence_against: list[Evidence] = Field(default_factory=list)
    confidence: float = 0.0
    status: Literal[
        "proposed", "investigating", "supported", "rejected", "inconclusive"
    ] = "proposed"
    rejection_reason: str | None = None


class InvestigationStep(BaseModel):
    step: int
    action: str
    summary: str
    details: dict[str, Any] = Field(default_factory=dict)


class InvestigationState(BaseModel):
    # Shared contract: coordinate field names with Ibrahim before backend integration.
    case_id: str
    anomaly: str
    observations: list[dict[str, Any]] = Field(default_factory=list)
    hypotheses: list[Hypothesis] = Field(default_factory=list)
    evidence_for: list[Evidence] = Field(default_factory=list)
    evidence_against: list[Evidence] = Field(default_factory=list)
    rejected_hypotheses: list[dict[str, Any]] = Field(default_factory=list)
    queries_executed: list[dict[str, Any]] = Field(default_factory=list)
    investigation_steps: list[InvestigationStep] = Field(default_factory=list)
    next_action: str = "plan"
    recommendation: dict[str, Any] | None = None
    human_decision: Literal["pending", "approved", "modified", "rejected"] = "pending"
    post_intervention_result: dict[str, Any] | None = None
    status: Literal[
        "pending", "investigating", "recommendation_ready", "needs_human_review",
        "inconclusive", "step_limit_reached", "error"
    ] = "pending"
    step_count: int = 0
    max_steps: int = 8
    uncertainty_reason: str | None = None
    # Internal control fields for the graph
    pending_query_ids: list[str] = Field(default_factory=list)
    query_results: list[dict[str, Any]] = Field(default_factory=list)
    critique: dict[str, Any] | None = None
    scenario: Literal["A", "B", "C"] = "A"
