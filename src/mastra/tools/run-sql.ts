import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { zetarisClient } from '../../providers/zetaris.js';

export const runSqlTool = createTool({
  id: 'run_sql',
  description: `Execute a read-only SQL query against the Zetaris enterprise data catalog (PRODUCTION_RAW).
Available Tables in Zetaris:
1. PRODUCTION_RAW.daily_metrics:
   - run_id (string, e.g. '2022-09-02_5L')
   - date (string, YYYY-MM-DD)
   - month (string, YYYY-MM)
   - product_type_l (numeric: 3 or 5)
   - production_units (numeric count of finished bottles)
   - operation_h (numeric operating hours)
   - pause_h (numeric total pause/idle hours)
   - efficiency (numeric 0.0 - 1.0)
   - downtime_events (total stoppage count)
   - micro_stops (stops <= 5 min)
   - medium_stops (stops 5-30 min)
   - long_stops (stops >= 30 min)
   - stops_per_1k_units (stoppage rate per 1,000 units produced)
   - downtime_min_per_1k_units (lost minutes per 1,000 units)

2. PRODUCTION_RAW.resource_assumptions:
   - idle_power_kw (e.g. 18.0)
   - running_power_kw (e.g. 45.0)
   - grid_kg_co2_per_kwh (e.g. 0.40)
   - water_l_per_restart (e.g. 25.0)
   - min_throughput_pct (e.g. 95.0)
   - note (team assumption disclaimers)

3. PRODUCTION_RAW.downtime_event_log:
   - event_id, run_id, date, start_time, end_time, stop_type (micro, medium, long), downtime_minutes.

Usage note: Always query aggregated metrics like AVG, SUM, or filter by month or product_type_l. Use LIMIT 20 max.`,
  inputSchema: z.object({
    sql: z.string().describe('The SQL SELECT query to execute through Zetaris'),
  }),
  outputSchema: z.object({
    records: z.array(z.record(z.string(), z.unknown())).describe('Rows returned from Zetaris'),
    totalCount: z.number().describe('Total rows count'),
  }),
  execute: async (input) => {
    try {
      const sql = (input as any).sql || (input as any).context?.sql;
      const result = await zetarisClient.runSql(sql, 50);
      return {
        records: result.records || [],
        totalCount: result.totalCount || result.records?.length || 0,
      };
    } catch (err: any) {
      return {
        records: [{ error: err.message || String(err) }],
        totalCount: 0,
      };
    }
  },
});
