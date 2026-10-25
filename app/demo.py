"""Run the three decision cases and save reports for the hackathon demo."""
import argparse
from pathlib import Path
from .graph import run_investigation
from .reporting import write_report


def main():
    parser = argparse.ArgumentParser(description="Run SustainFlow's synthetic factory investigation demo")
    parser.add_argument("--scenario", choices=["A", "B", "C", "all"], default="all")
    parser.add_argument("--output-dir", default="outputs")
    args = parser.parse_args()
    scenarios = ["A", "B", "C"] if args.scenario == "all" else [args.scenario]
    for scenario in scenarios:
        result = run_investigation(case_id=f"sustainflow-demo-{scenario.lower()}", scenario=scenario)
        md, js = write_report(result, args.output_dir)
        print(f"\nScenario {scenario}: {result['status']}")
        print(f"Recommendation: {'YES (human approval required)' if result.get('recommendation') else 'NO'}")
        print(f"Report: {md}")
        print(f"Machine-readable result: {js}")
        print(f"Trace steps: {len(result.get('investigation_steps', []))}")

if __name__ == "__main__":
    main()
