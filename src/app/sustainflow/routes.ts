import { Hono } from 'hono';
import type { AppEnv } from '../../http-context.js';
import { executeInvestigation, type InvestigationRunResult } from '../../mastra/workflows/investigation-flow.js';
import { simulateIntervention, AVAILABLE_INTERVENTIONS } from '../../domain/simulation.js';
import { renderSustainFlowHtml } from './ui.js';
import * as fs from 'fs';
import * as path from 'path';

const REPLAY_FILE = path.resolve(process.cwd(), 'src/mastra/data/replay-run.json');

// In-memory run cache
let latestRun: InvestigationRunResult | null = null;

// Ensure data directory exists
const dataDir = path.dirname(REPLAY_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function registerSustainFlowRoutes(app: Hono<AppEnv>) {
  // Serve UI directly at root / and /sustainflow
  app.get('/', (c) => c.html(renderSustainFlowHtml()));
  app.get('/sustainflow', (c) => c.html(renderSustainFlowHtml()));

  const router = new Hono<AppEnv>();

  // GET /api/sustain/cases/latest (supports ?replay=1)
  router.get('/cases/latest', async (c) => {
    const replay = c.req.query('replay') === '1';

    if (replay && fs.existsSync(REPLAY_FILE)) {
      try {
        const saved = JSON.parse(fs.readFileSync(REPLAY_FILE, 'utf-8'));
        return c.json({ source: 'replay', data: saved });
      } catch (e) {
        // fall back
      }
    }

    if (latestRun) {
      return c.json({ source: 'live_memory', data: latestRun });
    }

    // If none yet, trigger a fresh one
    try {
      const run = await executeInvestigation();
      latestRun = run;
      fs.writeFileSync(REPLAY_FILE, JSON.stringify(run, null, 2), 'utf-8');
      return c.json({ source: 'fresh_run', data: run });
    } catch (err: any) {
      return c.json({ error: err.message || String(err) }, 500);
    }
  });

  // POST /api/sustain/cases/investigate - Trigger fresh investigation against Zetaris
  router.post('/cases/investigate', async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const runId = body.runId || `case_${Date.now()}`;
      const run = await executeInvestigation(runId);
      latestRun = run;

      // Persist as replay file for demo video rock-solid stability
      fs.writeFileSync(REPLAY_FILE, JSON.stringify(run, null, 2), 'utf-8');

      return c.json({ success: true, data: run });
    } catch (err: any) {
      return c.json({ error: err.message || String(err) }, 500);
    }
  });

  // POST /api/sustain/cases/approve - Human operator approval
  router.post('/cases/approve', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const interventionId = body.interventionId || 'opt_5l_feed_guide';
    const operatorNotes = body.notes || 'Approved for next scheduled maintenance window';

    if (!latestRun) {
      if (fs.existsSync(REPLAY_FILE)) {
        latestRun = JSON.parse(fs.readFileSync(REPLAY_FILE, 'utf-8'));
      } else {
        latestRun = await executeInvestigation();
      }
    }

    if (latestRun) {
      latestRun.status = 'approved';
      latestRun.simulation = simulateIntervention(interventionId);
      latestRun.traces.push({
        id: `trace_${latestRun.traces.length + 1}`,
        step: latestRun.traces.length + 1,
        type: 'decision',
        title: 'Operator Authorization Granted',
        text: `Intervention '${interventionId}' approved by Plant Operator. Notes: "${operatorNotes}". Work order queued for implementation.`,
        timestamp: new Date().toISOString(),
      });
      latestRun.traces.push({
        id: `trace_${latestRun.traces.length + 1}`,
        step: latestRun.traces.length + 1,
        type: 'simulation',
        title: 'Modeled Post-Intervention Verification',
        text: `Verified modeled reduction of ${latestRun.simulation.savings.stoppagesReduced} stoppages, ${latestRun.simulation.savings.energyKwhSaved} kWh idle energy saved, and ${latestRun.simulation.savings.waterLitersSaved.toLocaleString()} L water preserved.`,
        confidence: 0.98,
        timestamp: new Date().toISOString(),
      });

      fs.writeFileSync(REPLAY_FILE, JSON.stringify(latestRun, null, 2), 'utf-8');
    }

    return c.json({ success: true, status: 'approved', data: latestRun });
  });

  // POST /api/sustain/cases/simulate - Test different interventions
  router.post('/cases/simulate', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const interventionId = body.interventionId || 'opt_5l_feed_guide';
    const result = simulateIntervention(interventionId);
    return c.json({ success: true, data: result });
  });

  // GET /api/sustain/interventions - Available interventions
  router.get('/interventions', (c) => {
    return c.json({ interventions: AVAILABLE_INTERVENTIONS });
  });

  app.route('/api/sustain', router);
}
