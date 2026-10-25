"""Compact console runner. Use `python -m app.demo` to also save reports."""
from .graph import run_investigation

if __name__ == "__main__":
    for scenario in ("A", "B", "C"):
        result = run_investigation(scenario=scenario)
        print(f"\n=== Scenario {scenario} | status={result['status']} ===")
        print("Recommendation:", "YES — human approval required" if result.get("recommendation") else "NO")
        print("Hypotheses:")
        for h in result.get("hypotheses", []):
            print(f"  {h['id']} [{h['status']}] score={h['confidence']}: {h['explanation']}")
        print("Trace:")
        for step in result.get("investigation_steps", []):
            print(f"  {step['step']}. {step['action']}: {step['summary']}")
