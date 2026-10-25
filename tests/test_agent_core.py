from app.graph import run_investigation
from app.tools import run_sql


def test_query_tool_rejects_arbitrary_sql():
    result = run_sql("DROP TABLE factory")
    assert result["error"] == "Query is not allowlisted."
    assert result["rows"] == []


def test_query_tool_rejects_unknown_scenario():
    result = run_sql("packing_metrics", {"scenario": "Z"})
    assert result["error"] == "Unknown scenario."


def test_scenario_a_recommends_only_a_human_approved_experiment():
    result = run_investigation(scenario="A")
    assert result["investigation_steps"]
    assert result["queries_executed"]
    assert result["status"] == "recommendation_ready"
    assert result["recommendation"] is not None
    assert result["recommendation"]["hypothesis_id"] == "H1"
    assert result["recommendation"]["requires_human_approval"] is True
    assert result["human_decision"] == "pending"


def test_scenario_b_does_not_recommend_queue_intervention_for_alternative_cause():
    result = run_investigation(scenario="B")
    by_id = {h["id"]: h for h in result["hypotheses"]}
    assert by_id["H1"]["status"] == "rejected"
    assert by_id["H2"]["status"] == "supported"
    assert len(by_id["H2"]["evidence_for"]) == 1
    assert result["recommendation"] is None
    assert result["status"] == "needs_human_review"
    assert result["critique"] is not None


def test_scenario_c_is_inconclusive_when_timing_evidence_is_missing():
    result = run_investigation(scenario="C")
    assert result["status"] == "inconclusive"
    assert result["recommendation"] is None
    assert result["critique"]["missing_evidence"]
    assert all(h["status"] == "inconclusive" for h in result["hypotheses"])


def test_step_budget_is_respected():
    result = run_investigation(scenario="A", max_steps=1)
    evaluations = [s for s in result["investigation_steps"] if s["action"] == "evaluate"]
    assert len(evaluations) <= 1


def test_factory_metrics_are_aggregated_from_synthetic_csv():
    result = run_sql("packing_metrics", {"scenario": "A"})
    assert result["error"] is None
    row = result["rows"][0]
    assert row["observations"] == 5
    assert row["wip_avg"] == 5.8
    assert row["idle_energy_pct_above_baseline"] == 21
    assert row["energy_per_order_pct_above_baseline"] == 16
    assert row["data_quality"] == "synthetic_demo_data"


def test_report_includes_synthetic_data_disclaimer():
    from app.reporting import render_markdown
    result = run_investigation(scenario="A")
    report = render_markdown(result)
    assert "Synthetic demonstration data" in report
    assert "human" in report.lower()
    assert "not a calibrated probability" in report
