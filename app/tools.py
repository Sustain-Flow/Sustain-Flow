"""Read-only allowlisted queries over a transparent synthetic time-series CSV.

Replace this adapter with Zetaris or an approved backend API when available.
No raw SQL is accepted from the agent.
"""
from __future__ import annotations
import csv
from pathlib import Path
from typing import Any

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "factory_observations.csv"
ALLOWED_QUERIES = {"packing_metrics", "production_context"}
VALID_SCENARIOS = {"A", "B", "C"}


def _load_rows(scenario: str) -> list[dict[str, Any]]:
    if not DATA_PATH.exists():
        return []
    with DATA_PATH.open("r", newline="", encoding="utf-8") as handle:
        raw = [r for r in csv.DictReader(handle) if r.get("scenario") == scenario]
    parsed = []
    for r in raw:
        parsed.append({
            "timestamp": r["timestamp"], "stage": r["stage"],
            "wip": float(r["wip"]), "wip_policy": float(r["wip_policy"]),
            "idle_energy_kwh": float(r["idle_energy_kwh"]),
            "idle_energy_baseline_kwh": float(r["idle_energy_baseline_kwh"]),
            "energy_per_order_kwh": float(r["energy_per_order_kwh"]),
            "energy_per_order_baseline_kwh": float(r["energy_per_order_baseline_kwh"]),
            "production_volume_pct_change": float(r["production_volume_pct_change"]),
            "scheduled_cleaning": bool(int(r["scheduled_cleaning"])),
            "maintenance_event": bool(int(r["maintenance_event"])),
            "queue_increase_precedes_energy": (None if r["queue_increase_precedes_energy"] == "" else r["queue_increase_precedes_energy"].lower() == "true"),
            "data_quality": r["data_quality"],
        })
    return parsed


def run_sql(query_id: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    """Execute one of two predefined read-only query contracts.

    `query_id` is an allowlisted operation, not SQL. `params` accepts scenario A/B/C.
    The CSV is synthetic demonstration data, not actual factory telemetry.
    """
    if query_id not in ALLOWED_QUERIES:
        return {"rows": [], "row_count": 0, "source": "synthetic_factory_csv", "error": "Query is not allowlisted."}
    params = params or {}
    scenario = params.get("scenario", "A")
    if scenario not in VALID_SCENARIOS:
        return {"rows": [], "row_count": 0, "source": "synthetic_factory_csv", "error": "Unknown scenario."}
    rows = _load_rows(scenario)
    if not rows:
        return {"rows": [], "row_count": 0, "source": "synthetic_factory_csv", "error": "No observations found for scenario."}

    if query_id == "packing_metrics":
        n = len(rows)
        wip_avg = sum(r["wip"] for r in rows) / n
        idle_actual = sum(r["idle_energy_kwh"] for r in rows)
        idle_baseline = sum(r["idle_energy_baseline_kwh"] for r in rows)
        epo_actual = sum(r["energy_per_order_kwh"] for r in rows)
        epo_baseline = sum(r["energy_per_order_baseline_kwh"] for r in rows)
        row = {
            "stage": rows[0]["stage"], "observations": n,
            "period_start": rows[0]["timestamp"], "period_end": rows[-1]["timestamp"],
            "wip_avg": round(wip_avg, 1), "wip_policy": rows[0]["wip_policy"],
            "idle_energy_pct_above_baseline": round((idle_actual / idle_baseline - 1) * 100),
            "energy_per_order_pct_above_baseline": round((epo_actual / epo_baseline - 1) * 100),
            "rework_concentrated": True,
            "data_quality": "synthetic_demo_data",
        }
    else:
        row = {
            "observations": len(rows),
            "production_volume_pct_change": rows[-1]["production_volume_pct_change"],
            "scheduled_cleaning": any(r["scheduled_cleaning"] for r in rows),
            "maintenance_event": any(r["maintenance_event"] for r in rows),
            "queue_increase_precedes_energy": rows[-1]["queue_increase_precedes_energy"],
            "period_start": rows[0]["timestamp"], "period_end": rows[-1]["timestamp"],
            "data_quality": "synthetic_demo_data",
        }
    return {"rows": [row], "row_count": 1, "source": f"factory_observations.csv:{scenario}:{query_id}", "error": None}
