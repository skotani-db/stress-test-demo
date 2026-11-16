-- Gold: stressed P&L = sensitivity x shock, kept at scenario x desk x risk factor.
CREATE OR REFRESH MATERIALIZED VIEW gold_stress_pnl
COMMENT 'Stressed P&L in JPY by scenario, desk and risk factor (sensitivity-based approximation)'
AS SELECT
  s.scenario_id, s.scenario_name, p.desk, p.risk_factor,
  count(*) AS positions,
  round(sum(p.sensitivity_jpy * s.shock)) AS pnl_jpy
FROM silver_positions p
JOIN silver_scenarios s USING (risk_factor)
GROUP BY ALL;

-- Gold: what the risk committee signs off on, per scenario and desk, against the desk limit.
CREATE OR REFRESH MATERIALIZED VIEW gold_desk_stress
COMMENT 'Stressed P&L per scenario and desk vs the desk stress loss limit (JPY)'
AS SELECT
  g.scenario_id, g.scenario_name, g.desk,
  sum(g.pnl_jpy) AS pnl_jpy,
  any_value(l.stress_loss_limit_jpy) AS limit_jpy,
  round(-sum(g.pnl_jpy) / any_value(l.stress_loss_limit_jpy), 3) AS limit_utilization,
  -sum(g.pnl_jpy) > any_value(l.stress_loss_limit_jpy) AS limit_breach
FROM gold_stress_pnl g
JOIN silver_limits l USING (desk)
GROUP BY g.scenario_id, g.scenario_name, g.desk;

-- Gold (GenAI): three-sentence committee commentary per scenario, grounded only in the facts column.
CREATE OR REFRESH MATERIALIZED VIEW gold_commentary
COMMENT 'AI-generated risk committee commentary per scenario (ai_query), with the facts it was given'
AS WITH desks AS (
  SELECT scenario_id, scenario_name, sum(pnl_jpy) AS total_pnl_jpy, max(limit_breach) AS any_breach,
    array_join(array_sort(collect_list(format_string('%s: P&L JPY %.1fbn, limit JPY %.1fbn, %s',
      desk, pnl_jpy / 1e9, limit_jpy / 1e9, IF(limit_breach, 'BREACH', 'within limit')))), '; ') AS desk_facts
  FROM gold_desk_stress GROUP BY scenario_id, scenario_name
), drivers AS (
  SELECT scenario_id,
    array_join(transform(slice(array_sort(collect_list(named_struct('pnl', pnl_jpy, 'rf', risk_factor, 'desk', desk))), 1, 2),
      x -> format_string('%s (%s desk) JPY %.1fbn', x.rf, x.desk, x.pnl / 1e9)), '; ') AS top_drivers
  FROM gold_stress_pnl GROUP BY scenario_id
), facts AS (
  SELECT d.scenario_id, d.scenario_name, d.total_pnl_jpy, d.any_breach,
    format_string('Scenario: %s. Total stressed P&L: JPY %.1fbn. Desks: %s. Top loss drivers: %s.',
      d.scenario_name, d.total_pnl_jpy / 1e9, d.desk_facts, r.top_drivers) AS facts
  FROM desks d JOIN drivers r USING (scenario_id)
)
SELECT scenario_id, scenario_name, total_pnl_jpy, any_breach, facts,
  ai_query('${llm_endpoint}', concat(
    'You are the head of market risk at a bank, writing for the risk committee. ',
    'Write exactly three sentences: (1) the desk and the two risk factors that drive the stressed loss, ',
    '(2) why, in plain market terms, (3) what the committee should check or decide, naming any limit breach. ',
    'Use JPY bn. Use only the numbers in the facts. Facts: ', facts)) AS commentary
FROM facts;
