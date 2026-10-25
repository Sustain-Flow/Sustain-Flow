from typing import TypedDict, Any
from langgraph.graph import StateGraph, END
from .state import InvestigationState


class GraphState(TypedDict, total=False):
    # LangGraph carries this JSON-serializable state between nodes.
    case_id: str
    anomaly: str
    observations: list[dict[str, Any]]
    hypotheses: list[dict[str, Any]]
    evidence_for: list[dict[str, Any]]
    evidence_against: list[dict[str, Any]]
    rejected_hypotheses: list[dict[str, Any]]
    queries_executed: list[dict[str, Any]]
    investigation_steps: list[dict[str, Any]]
    next_action: str
    recommendation: dict[str, Any] | None
    human_decision: str
    post_intervention_result: dict[str, Any] | None
    status: str
    step_count: int
    max_steps: int
    uncertainty_reason: str | None
    pending_query_ids: list[str]
    query_results: list[dict[str, Any]]
    critique: dict[str, Any] | None
    scenario: str
from . import nodes


def _as_dict(state):
    return state.model_dump() if hasattr(state, "model_dump") else state


def _route_after_plan(state: dict) -> str:
    state = _as_dict(state)
    return "query_data" if state.get("pending_query_ids") else "generate_hypotheses"


def _route_after_evaluation(state: dict) -> str:
    state = _as_dict(state)
    # max_steps bounds investigation/evaluation cycles, not individual trace events.
    # One cycle contains several nodes (query, hypotheses, critic, evaluation).
    max_steps = state.get("max_steps", 8)
    completed_cycles = sum(
        1 for step in state.get("investigation_steps", [])
        if step.get("action") == "evaluate"
    )
    critique = state.get("critique") or {}
    hypotheses = state.get("hypotheses") or []

    if completed_cycles >= max_steps:
        return "stop"
    if critique.get("missing_evidence"):
        # Only one bounded follow-up path is currently implemented; no unbounded retry.
        already_queried = {q.get("query_id") for q in state.get("queries_executed", [])}
        if "production_context" not in already_queried:
            return "planner"
        return "stop"
    supported = any(h.get("status") == "supported" and h.get("confidence", 0) >= 0.6 for h in hypotheses)
    if supported:
        return "recommend"
    if any(h.get("status") == "inconclusive" for h in hypotheses):
        return "stop"
    return "recommend"


def build_graph():
    graph = StateGraph(GraphState)
    graph.add_node("planner", nodes.planner)
    graph.add_node("query_data", nodes.query_data)
    graph.add_node("generate_hypotheses", nodes.generate_hypotheses)
    graph.add_node("critic", nodes.critic)
    graph.add_node("evaluate_evidence", nodes.evaluate_evidence)
    graph.add_node("recommend", nodes.recommend)
    graph.add_node("stop", nodes.stop)

    graph.set_entry_point("planner")
    graph.add_conditional_edges("planner", _route_after_plan, {
        "query_data": "query_data",
        "generate_hypotheses": "generate_hypotheses",
    })
    graph.add_edge("query_data", "generate_hypotheses")
    graph.add_edge("generate_hypotheses", "critic")
    graph.add_edge("critic", "evaluate_evidence")
    graph.add_conditional_edges("evaluate_evidence", _route_after_evaluation, {
        "planner": "planner",
        "recommend": "recommend",
        "stop": "stop",
    })
    graph.add_edge("recommend", "stop")
    graph.add_edge("stop", END)
    return graph.compile()


def run_investigation(case_id: str = "case-demo-001", scenario: str = "A",
                      max_steps: int = 8) -> dict:
    initial = InvestigationState(
        case_id=case_id,
        anomaly="Packing has elevated idle energy and energy per order alongside high WIP.",
        scenario=scenario,
        status="investigating",
        max_steps=max_steps,
    )
    return build_graph().invoke(initial.model_dump())
