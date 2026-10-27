/**
 * Meterless Engine: Markovian Bounded Context
 * Reference: github.com/Meterless/Meterless (engines/markovian)
 * 
 * Instead of passing unbounded conversation history and bloating token context,
 * Markovian maintains a strictly bounded, structured state transition matrix:
 * S_{t+1} = f(S_t, Observation_t)
 */

export interface MarkovianInvestigationState {
  step: number;
  anomalyDetected: boolean;
  activeHypothesis: string | null;
  confidenceScore: number; // 0.0 to 1.0
  confirmedEvidence: Array<{
    claim: string;
    sqlQuery: string;
    metricValue: string | number;
  }>;
  rejectedHypotheses: Array<{
    hypothesis: string;
    refutedBy: string;
    sqlEvidence: string;
  }>;
  currentTradeOffs: {
    energySavingsEstKwh: number;
    waterSavingsEstL: number;
    workloadImpact: string;
  } | null;
  status: 'detecting' | 'hypothesizing' | 'refuting' | 'recommending' | 'awaiting_approval' | 'completed';
}

export class MarkovianEngine {
  private state: MarkovianInvestigationState;
  private readonly maxTransitions: number;

  constructor(initialAnomaly = false, maxTransitions = 8) {
    this.maxTransitions = maxTransitions;
    this.state = {
      step: 0,
      anomalyDetected: initialAnomaly,
      activeHypothesis: null,
      confidenceScore: 0.0,
      confirmedEvidence: [],
      rejectedHypotheses: [],
      currentTradeOffs: null,
      status: 'detecting',
    };
  }

  getState(): Readonly<MarkovianInvestigationState> {
    return { ...this.state };
  }

  /**
   * Compact prompt representation to send to LLM.
   * Flat, token-efficient state summary.
   */
  toFlatContext(): string {
    return [
      `[MARKOVIAN_STATE step=${this.state.step}/${this.maxTransitions} status=${this.state.status}]`,
      `Anomaly: ${this.state.anomalyDetected ? 'CONFIRMED' : 'UNCONFIRMED'}`,
      `Active Hypothesis: ${this.state.activeHypothesis || 'NONE'} (confidence: ${(this.state.confidenceScore * 100).toFixed(0)}%)`,
      `Confirmed Evidence: ${this.state.confirmedEvidence.map(e => `[${e.claim} -> ${e.metricValue}]`).join(', ') || 'None'}`,
      `Rejected Hypotheses: ${this.state.rejectedHypotheses.map(r => `[${r.hypothesis} REFUTED BY: ${r.refutedBy}]`).join(', ') || 'None'}`,
    ].join('\n');
  }

  transition(action: {
    type: 'ANOMALY_CONFIRMED' | 'HYPOTHESIS_FORMED' | 'HYPOTHESIS_REFUTED' | 'EVIDENCE_CONFIRMED' | 'RECOMMENDATION_READY' | 'APPROVED';
    payload: any;
  }): MarkovianInvestigationState {
    this.state.step += 1;

    switch (action.type) {
      case 'ANOMALY_CONFIRMED':
        this.state.anomalyDetected = true;
        this.state.status = 'hypothesizing';
        break;

      case 'HYPOTHESIS_FORMED':
        this.state.activeHypothesis = action.payload.hypothesis;
        this.state.confidenceScore = action.payload.initialConfidence || 0.4;
        this.state.status = 'refuting';
        break;

      case 'HYPOTHESIS_REFUTED':
        this.state.rejectedHypotheses.push({
          hypothesis: action.payload.hypothesis,
          refutedBy: action.payload.refutedBy,
          sqlEvidence: action.payload.sqlEvidence,
        });
        if (this.state.activeHypothesis === action.payload.hypothesis) {
          this.state.activeHypothesis = action.payload.newHypothesis || null;
          this.state.confidenceScore = action.payload.newConfidence || 0.3;
        }
        break;

      case 'EVIDENCE_CONFIRMED':
        this.state.confirmedEvidence.push({
          claim: action.payload.claim,
          sqlQuery: action.payload.sqlQuery,
          metricValue: action.payload.metricValue,
        });
        this.state.confidenceScore = Math.min(0.95, this.state.confidenceScore + 0.25);
        break;

      case 'RECOMMENDATION_READY':
        this.state.status = 'awaiting_approval';
        this.state.currentTradeOffs = action.payload.tradeOffs;
        break;

      case 'APPROVED':
        this.state.status = 'completed';
        break;
    }

    return this.getState();
  }
}
