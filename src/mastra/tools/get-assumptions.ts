import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { zetarisClient } from '../../providers/zetaris.js';
import { DEFAULT_ASSUMPTIONS } from '../../domain/simulation.js';

export const getAssumptionsTool = createTool({
  id: 'get_assumptions',
  description: 'Retrieve factory engineering assumptions (idle kW, running kW, CO2 factor, rinse water per stop, throughput targets).',
  inputSchema: z.object({}),
  outputSchema: z.object({
    idle_power_kw: z.number(),
    running_power_kw: z.number(),
    grid_kg_co2_per_kwh: z.number(),
    water_l_per_restart: z.number(),
    min_throughput_pct: z.number(),
    source: z.string(),
  }),
  execute: async () => {
    try {
      const res = await zetarisClient.runSql('SELECT * FROM PRODUCTION_RAW.resource_assumptions LIMIT 1');
      if (res.records && res.records.length > 0) {
        const row = res.records[0] as any;
        return {
          idle_power_kw: Number(row.idle_power_kw || DEFAULT_ASSUMPTIONS.idlePowerKw),
          running_power_kw: Number(row.running_power_kw || DEFAULT_ASSUMPTIONS.runningPowerKw),
          grid_kg_co2_per_kwh: Number(row.grid_kg_co2_per_kwh || DEFAULT_ASSUMPTIONS.gridKgCo2PerKwh),
          water_l_per_restart: Number(row.water_l_per_restart || DEFAULT_ASSUMPTIONS.waterLPerRestart),
          min_throughput_pct: Number(row.min_throughput_pct || DEFAULT_ASSUMPTIONS.minThroughputPct),
          source: String(row.source || 'TEAM ASSUMPTION'),
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      idle_power_kw: DEFAULT_ASSUMPTIONS.idlePowerKw,
      running_power_kw: DEFAULT_ASSUMPTIONS.runningPowerKw,
      grid_kg_co2_per_kwh: DEFAULT_ASSUMPTIONS.gridKgCo2PerKwh,
      water_l_per_restart: DEFAULT_ASSUMPTIONS.waterLPerRestart,
      min_throughput_pct: DEFAULT_ASSUMPTIONS.minThroughputPct,
      source: 'TEAM ASSUMPTION (fallback)',
    };
  },
});
