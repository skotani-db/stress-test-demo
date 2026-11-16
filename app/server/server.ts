import { createApp, genie, lakebase, server } from '@databricks/appkit';
import { z } from 'zod';

// Read: Lakebase synced copies of the gold tables (risk schema, owned by the sync pipeline).
const DESKS_SQL = `
  SELECT scenario_id, scenario_name, desk, pnl_jpy::float8, limit_jpy::float8,
         limit_utilization::float8, limit_breach
  FROM risk.gold_desk_stress ORDER BY scenario_id, desk`;

const SCENARIOS_SQL = `
  SELECT c.scenario_id, c.scenario_name, c.commentary, a.decision, a.note, a.decided_by, a.decided_at
  FROM risk.gold_commentary c
  LEFT JOIN LATERAL (
    SELECT decision, note, decided_by, decided_at FROM committee.approvals
    WHERE scenario_id = c.scenario_id ORDER BY decided_at DESC LIMIT 1
  ) a ON true
  ORDER BY c.scenario_id`;

// Write: committee decisions, in a schema the app's service principal creates and owns.
const SETUP_SQL = [
  'CREATE SCHEMA IF NOT EXISTS committee',
  `CREATE TABLE IF NOT EXISTS committee.approvals (
     id SERIAL PRIMARY KEY,
     scenario_id TEXT NOT NULL,
     decision TEXT NOT NULL CHECK (decision IN ('SIGNED_OFF', 'ACTION_REQUESTED')),
     note TEXT,
     decided_by TEXT NOT NULL,
     decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
];

const Decision = z.object({
  scenario_id: z.string().min(1),
  decision: z.enum(['SIGNED_OFF', 'ACTION_REQUESTED']),
  note: z.string().max(1000).optional(),
});

createApp({
  plugins: [lakebase(), genie(), server()],
  async onPluginsReady(appkit) {
    for (const sql of SETUP_SQL) await appkit.lakebase.query(sql);

    appkit.server.extend((app) => {
      // Signed-in user, from the headers the Databricks Apps proxy injects.
      app.get('/api/whoami', (req, res) => {
        res.json({ email: req.header('x-forwarded-email') ?? null });
      });

      app.get('/api/stress', async (_req, res) => {
        try {
          const [desks, scenarios] = await Promise.all([
            appkit.lakebase.query(DESKS_SQL),
            appkit.lakebase.query(SCENARIOS_SQL),
          ]);
          res.json({ desks: desks.rows, scenarios: scenarios.rows });
        } catch (err) {
          console.error('Failed to load stress results:', err);
          res.status(500).json({ error: 'Failed to load stress results' });
        }
      });

      app.post('/api/approvals', async (req, res) => {
        const parsed = Decision.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: 'Invalid decision' });
          return;
        }
        const { scenario_id, decision, note } = parsed.data;
        const user = req.header('x-forwarded-email') ?? 'local-dev';
        try {
          const { rows } = await appkit.lakebase.query(
            'INSERT INTO committee.approvals (scenario_id, decision, note, decided_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [scenario_id, decision, note ?? null, user],
          );
          res.status(201).json(rows[0]);
        } catch (err) {
          console.error('Failed to save decision:', err);
          res.status(500).json({ error: 'Failed to save decision' });
        }
      });
    });
  },
}).catch(console.error);
