import { describe, it, expect } from 'vitest';
import { MarkovianEngine } from '../src/mastra/engine/markovian.js';

describe('Meterless Markovian Engine', () => {
  it('initializes in detecting state with empty bounded memory', () => {
    const engine = new MarkovianEngine();
    const state = engine.getState();
    expect(state.step).toBe(0);
    expect(state.status).toBe('detecting');
    expect(state.rejectedHypotheses).toHaveLength(0);
  });

  it('progresses through hypothesis, refutation, and evidence accumulation', () => {
    const engine = new MarkovianEngine();

    // 1. Anomaly confirmed
    engine.transition({
      type: 'ANOMALY_CONFIRMED',
      payload: { anomaly: 'Stoppage rate increased to 29 stops/1k units' },
    });
    expect(engine.getState().status).toBe('hypothesizing');

    // 2. Initial hypothesis formed: Overall volume spike
    engine.transition({
      type: 'HYPOTHESIS_FORMED',
      payload: { hypothesis: 'Higher production speed or monthly volume caused line wear', initialConfidence: 0.35 },
    });
    expect(engine.getState().activeHypothesis).toBe('Higher production speed or monthly volume caused line wear');

    // 3. Critic refutes volume hypothesis with SQL query evidence
    engine.transition({
      type: 'HYPOTHESIS_REFUTED',
      payload: {
        hypothesis: 'Higher production speed or monthly volume caused line wear',
        refutedBy: 'Average monthly units produced in Sep-Nov (34.7k) was lower than July (38k)',
        sqlEvidence: 'SELECT month, SUM(production_units) FROM daily_metrics GROUP BY month',
        newHypothesis: 'Introduction of new 5L bottle SKU on Sep 2nd caused micro-stoppages',
        newConfidence: 0.70,
      },
    });
    expect(engine.getState().rejectedHypotheses).toHaveLength(1);
    expect(engine.getState().activeHypothesis).toContain('5L bottle SKU');

    // 4. Evidence confirmed: 5L bottle has double stoppage rate
    engine.transition({
      type: 'EVIDENCE_CONFIRMED',
      payload: {
        claim: '5L stoppage rate is 60.1 stops/1k units vs 3L at 28.3 stops/1k units',
        sqlQuery: 'SELECT product_type_l, AVG(stops_per_1k_units) FROM daily_metrics GROUP BY product_type_l',
        metricValue: '60.1 vs 28.3',
      },
    });
    expect(engine.getState().confidenceScore).toBeGreaterThanOrEqual(0.90);

    // 5. Context remains compact
    const flatContext = engine.toFlatContext();
    expect(flatContext).toContain('[MARKOVIAN_STATE');
    expect(flatContext).toContain('REFUTED BY');
  });
});
