"""Human-readable evidence report generation."""
from __future__ import annotations
import json
from pathlib import Path
from typing import Any


def render_markdown(result: dict[str, Any]) -> str:
    lines = [
        f"# SustainFlow Investigation Report — Scenario {result.get('scenario', 'unknown')}",
        "",
        f"- **Case:** `{result.get('case_id', 'unknown')}`",
        f"- **Status:** `{result.get('status', 'unknown')}`",
        "- **Data status:** Synthetic demonstration data; not real factory telemetry.",
        "",
        "## Executive summary",
    ]
    rec = result.get('recommendation')
    if rec:
        lines += [
            "A queue-related waste hypothesis is sufficiently supported by the current demo evidence.",
            "The proposed experiment is **not approved or executed automatically**.",
            "", "## Proposed next step", f"- **Intervention:** {rec.get('proposed_intervention')}",
            f"- **Rationale:** {rec.get('rationale')}",
            f"- **Evidence score:** {rec.get('confidence')} — {rec.get('confidence_note')}",
            f"- **Human approval required:** {rec.get('requires_human_approval')}",
            "", "### Guardrails",
        ]
        lines += [f"- {g}" for g in rec.get('guardrails', [])]
    else:
        lines += [
            "No intervention is recommended from the available evidence.",
            f"**Reason:** {result.get('uncertainty_reason') or 'Evidence does not justify an intervention.'}",
        ]
    lines += ["", "## Evidence and hypotheses"]
    for h in result.get('hypotheses', []):
        lines += ["", f"### {h.get('id')}: {h.get('explanation')}",
                  f"- **Assessment:** `{h.get('status')}`",
                  f"- **Evidence-weighting score:** {h.get('confidence')} (heuristic, not probability)"]
        if h.get('rejection_reason'):
            lines.append(f"- **Reason rejected:** {h['rejection_reason']}")
        for e in h.get('evidence_for', []):
            lines.append(f"- **Supports:** {e.get('description')} _(source: `{e.get('source')}`, strength: {e.get('strength')})_")
        for e in h.get('evidence_against', []):
            lines.append(f"- **Counters:** {e.get('description')} _(source: `{e.get('source')}`, strength: {e.get('strength')})_")
    critique = result.get('critique') or {}
    lines += ["", "## Missing evidence and caveats"]
    missing = critique.get('missing_evidence') or []
    lines += [f"- {item}" for item in missing] if missing else ["- No required evidence gap was flagged by this demo workflow."]
    lines += ["- The evidence score is a transparent heuristic; it is not calibrated and does not prove causation.",
              "- Synthetic results must not be represented as measured factory savings.",
              "", "## Investigation trace"]
    for step in result.get('investigation_steps', []):
        lines.append(f"{step.get('step')}. **{step.get('action')}** — {step.get('summary')}")
    lines += ["", "## Data sources queried"]
    for q in result.get('queries_executed', []):
        lines.append(f"- `{q.get('query_id')}` — source `{q.get('source')}`, rows returned: {q.get('row_count')}")
    return "\n".join(lines) + "\n"


def write_report(result: dict[str, Any], output_dir: str | Path = "outputs") -> tuple[Path, Path]:
    out = Path(output_dir); out.mkdir(parents=True, exist_ok=True)
    scenario = result.get('scenario', 'unknown')
    md_path = out / f"scenario_{scenario}_report.md"
    json_path = out / f"scenario_{scenario}_result.json"
    md_path.write_text(render_markdown(result), encoding='utf-8')
    json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False, default=str) + "\n", encoding='utf-8')
    return md_path, json_path
