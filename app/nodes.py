from typing import Any
from .state import Evidence, Hypothesis, InvestigationState, InvestigationStep
from .tools import run_sql


def _record(state: InvestigationState, action: str, summary: str, details: dict[str, Any] | None = None):
    state.step_count += 1
    state.investigation_steps.append(InvestigationStep(
        step=state.step_count, action=action, summary=summary, details=details or {}
    ))


def planner(state: InvestigationState) -> dict[str, Any]:
    state = InvestigationState.model_validate(state)
    """Deterministic initial planner; later replace decision logic with provider-backed planner."""
    if not state.observations:
        plan = ["packing_metrics"]
        reason = "Inspect the stage with the reported resource-flow anomaly."
    elif not any(q.get("query_id") == "production_context" for q in state.queries_executed):
        plan = ["production_context"]
        reason = "Check competing explanations and time ordering before assigning cause."
    else:
        plan = []
        reason = "Required evidence queries have been collected."
    _record(state, "plan", reason, {"query_ids": plan})
    state.pending_query_ids = plan
    state.next_action = "query_data" if plan else "generate_hypotheses"
    return state.model_dump()


def query_data(state: InvestigationState) -> dict[str, Any]:
    state = InvestigationState.model_validate(state)
    results = []
    for query_id in state.pending_query_ids:
        result = run_sql(query_id, {"scenario": state.scenario})
        item = {"query_id": query_id, **result}
        state.queries_executed.append(item)
        results.append(item)
        if result["error"]:
            state.uncertainty_reason = f"Query {query_id} failed: {result['error']}"
    state.query_results = results
    if not state.observations:
        state.observations = [
            {"name": "reported_anomaly", "value": state.anomaly, "source": "case_input"}
        ]
    _record(state, "query_data", f"Executed {len(results)} allowlisted query/queries.", {"results": results})
    state.pending_query_ids = []
    state.next_action = "generate_hypotheses"
    return state.model_dump()


def generate_hypotheses(state: InvestigationState) -> dict[str, Any]:
    state = InvestigationState.model_validate(state)
    data: dict[str, Any] = {}
    for result in state.queries_executed:
        if result.get("error") is None and result.get("rows"):
            data[result["query_id"]] = result["rows"][0]

    metrics = data.get("packing_metrics", {})
    context = data.get("production_context", {})
    hypotheses = [
        Hypothesis(
            id="H1",
            explanation="Packing queue accumulation is contributing to idle-energy waste.",
            status="investigating",
        ),
        Hypothesis(
            id="H2",
            explanation="A production/cleaning event explains the apparent resource increase without a persistent queue-caused problem.",
            status="investigating",
        ),
    ]
    if metrics:
        hypotheses[0].evidence_for.append(Evidence(
            description=f"WIP average {metrics.get('wip_avg')} exceeds policy {metrics.get('wip_policy')}.",
            source="packing_metrics", strength="strong", supports_hypothesis=True
        ))
        if metrics.get("idle_energy_pct_above_baseline") is not None:
            hypotheses[0].evidence_for.append(Evidence(
                description=f"Idle energy is {metrics['idle_energy_pct_above_baseline']}% above baseline.",
                source="packing_metrics", strength="moderate", supports_hypothesis=True
            ))
    if context:
        if context.get("scheduled_cleaning") or abs(context.get("production_volume_pct_change", 0)) >= 15:
            hypotheses[1].evidence_for.append(Evidence(
                description="Scheduled cleaning or a large production-volume change coincides with the anomaly.",
                source="production_context", strength="strong", supports_hypothesis=True
            ))
        if context.get("queue_increase_precedes_energy") is False:
            hypotheses[0].evidence_against.append(Evidence(
                description="Available timing does not show queue increase preceding the energy increase.",
                source="production_context", strength="strong", supports_hypothesis=False
            ))
    state.hypotheses = hypotheses
    _record(state, "hypothesise", "Generated competing explanations from collected evidence.",
            {"hypothesis_ids": [h.id for h in hypotheses]})
    state.next_action = "critic"
    return state.model_dump()


def critic(state: InvestigationState) -> dict[str, Any]:
    state = InvestigationState.model_validate(state)
    by_id = {h.id: h for h in state.hypotheses}
    h1, h2 = by_id["H1"], by_id["H2"]
    context_result = next((q for q in state.queries_executed if q["query_id"] == "production_context"), None)
    context = (context_result or {}).get("rows", [{}])[0]

    missing = []
    if context.get("queue_increase_precedes_energy") is None:
        missing.append("Time-aligned queue and energy measurements.")
    if context.get("scheduled_cleaning") or abs(context.get("production_volume_pct_change", 0)) >= 15:
        h1.evidence_against.append(Evidence(
            description="A coincident cleaning event or major production-volume change is a plausible alternative explanation.",
            source="production_context", strength="strong", supports_hypothesis=False
        ))

    state.critique = {
        "verdict": "needs_more_evidence" if missing else "competing_explanation_found" if h2.evidence_for else "evidence_reviewed",
        "missing_evidence": missing,
        "counterevidence": [e.description for e in h1.evidence_against],
        "alternative_explanation": h2.explanation if h2.evidence_for else None,
    }
    _record(state, "critic", "Checked the leading hypothesis against alternatives and missing evidence.", state.critique)
    state.next_action = "evaluate_evidence"
    return state.model_dump()


def evaluate_evidence(state: InvestigationState) -> dict[str, Any]:
    state = InvestigationState.model_validate(state)
    for hypothesis in state.hypotheses:
        positive = sum({"weak": 1, "moderate": 2, "strong": 3}[e.strength]
                       for e in hypothesis.evidence_for)
        negative = sum({"weak": 1, "moderate": 2, "strong": 3}[e.strength]
                       for e in hypothesis.evidence_against)
        # Transparent heuristic only; not a calibrated probability.
        total = positive + negative
        hypothesis.confidence = round(positive / total, 2) if total else 0.0
        if negative >= positive and negative > 0:
            hypothesis.status = "rejected"
            hypothesis.rejection_reason = "Counter-evidence is at least as strong as supporting evidence."
            state.rejected_hypotheses.append({
                "id": hypothesis.id,
                "explanation": hypothesis.explanation,
                "reason": hypothesis.rejection_reason,
                "evidence_for": [e.model_dump() for e in hypothesis.evidence_for],
                "evidence_against": [e.model_dump() for e in hypothesis.evidence_against],
            })
        elif state.critique and state.critique.get("missing_evidence"):
            hypothesis.status = "inconclusive"
        else:
            hypothesis.status = "supported" if positive else "inconclusive"

    _record(state, "evaluate", "Updated evidence-weighted confidence and hypothesis status.",
            {"confidence": {h.id: h.confidence for h in state.hypotheses}})
    state.next_action = "route_after_evaluation"
    return state.model_dump()


def recommend(state: InvestigationState) -> dict[str, Any]:
    state = InvestigationState.model_validate(state)
    # Only H1 supports the queue-related intervention. H2 supports an alternative
    # explanation and must never trigger a queue intervention recommendation.
    h1 = next((h for h in state.hypotheses if h.id == "H1"), None)
    if h1 is None or h1.status != "supported" or h1.confidence < 0.6:
        state.recommendation = None
        if state.critique and state.critique.get("missing_evidence"):
            state.status = "inconclusive"
            state.uncertainty_reason = state.uncertainty_reason or (
                "Time-aligned queue and energy measurements are missing."
            )
        else:
            state.status = "needs_human_review"
            state.uncertainty_reason = state.uncertainty_reason or (
                "The queue-related hypothesis is not sufficiently supported; review the competing explanation."
            )
        _record(state, "decision", "No queue intervention recommended; evidence is insufficient or an alternative explanation is stronger.",
                {"reason": state.uncertainty_reason, "status": state.status})
        state.next_action = "stop"
        return state.model_dump()

    state.recommendation = {
        "hypothesis_id": h1.id,
        "rationale": h1.explanation,
        "confidence": h1.confidence,
        "confidence_note": "Evidence-weighting heuristic, not a calibrated probability or proof of causation.",
        "proposed_intervention": "Run a bounded, human-approved Packing WIP/release-batch experiment.",
        "guardrails": [
            "Do not change live factory settings automatically.",
            "Define throughput and safety stop conditions before the experiment.",
            "Compare against a baseline and label all simulated results as synthetic."
        ],
        "requires_human_approval": True,
    }
    state.status = "recommendation_ready"
    state.next_action = "stop"
    _record(state, "recommend", "Prepared a human-reviewed experiment recommendation.", state.recommendation)
    return state.model_dump()


def stop(state: InvestigationState) -> dict[str, Any]:
    state = InvestigationState.model_validate(state)
    if state.status == "investigating":
        if state.critique and state.critique.get("missing_evidence"):
            state.status = "inconclusive"
            state.uncertainty_reason = state.uncertainty_reason or "Required timing evidence is missing."
        else:
            state.status = "needs_human_review"
            state.uncertainty_reason = state.uncertainty_reason or "Investigation stopped without a validated recommendation."
    _record(state, "stop", "Investigation terminated.", {"status": state.status})
    state.next_action = "stop"
    return state.model_dump()
