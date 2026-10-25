# SustainFlow Agent Core

SustainFlow investigates factory resource-waste anomalies, compares competing explanations, and produces evidence-backed recommendations with explicit human approval.

> **Demo-data notice:** `data/factory_observations.csv` is synthetic time-series data created for repeatable testing. It is not real factory telemetry and must not be presented as measured savings.

## 1. Setup (Windows PowerShell)

```powershell
cd D:\SustainFlow\sustainflow_agent_core
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m pytest -q
```

## 2. Run the demo and generate reports

Run all three decision cases:

```powershell
python -m app.demo
```

Run one case only:

```powershell
python -m app.demo --scenario A
```

Reports are written to `outputs/` as Markdown (`scenario_A_report.md`) and JSON (`scenario_A_result.json`). The reports contain the status, hypotheses, supporting/counter evidence, missing evidence, trace, query sources, and safety guardrails.

## 3. Expected demo behavior

| Scenario | Purpose | Expected status | Recommendation |
|---|---|---|---|
| A | Queue metrics are elevated and timing supports the queue hypothesis | `recommendation_ready` | Bounded experiment; human approval required |
| B | Cleaning/production context is a plausible alternative | `needs_human_review` | None |
| C | Time-ordering evidence is missing | `inconclusive` | None |

The evidence score is a transparent weighting heuristic, not a calibrated probability or proof of causation.

## 4. Data adapter and safety

- `app/tools.py` reads the CSV using Python's standard library.
- The agent can request only `packing_metrics` and `production_context` query IDs.
- Arbitrary SQL is rejected; do not pass model-generated SQL to a database.
- Replace the adapter with Zetaris or an approved backend API only after the team agrees on the query contract, credentials, and data schema.
- Live factory settings are never changed by this demo.

## 5. Suggested 3-minute demo script

1. **Problem (20 sec):** A factory stage has high WIP and energy use. The system should investigate, not jump straight to a fix.
2. **Scenario A (60 sec):** Run `python -m app.demo --scenario A`; open `outputs/scenario_A_report.md`. Show the CSV-derived metrics, evidence, competing hypotheses, and human-approved experiment proposal.
3. **Scenario B (40 sec):** Run `python -m app.demo --scenario B`; show that a cleaning event/production change is a competing explanation and no queue intervention is recommended.
4. **Scenario C (30 sec):** Run `python -m app.demo --scenario C`; show the missing timing evidence and `inconclusive` status.
5. **Trust and impact (30 sec):** Show the trace, allowlisted read-only queries, synthetic-data disclaimer, and human-approval guardrails. Explain that actual savings must be measured after a real approved experiment.

## 6. Current limitations

- Demo records are synthetic.
- The planner and hypothesis rules are deterministic; they are not a general-purpose LLM planner.
- Confidence scores are heuristic.
- No live intervention or actual factory integration is enabled.
