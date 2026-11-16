-- Silver: typed and validated. Invalid rows are dropped and counted in the event log.
CREATE OR REFRESH STREAMING TABLE silver_positions (
  position_id STRING,
  desk STRING,
  instrument_type STRING,
  risk_factor STRING,
  sensitivity_jpy DOUBLE COMMENT 'P&L in JPY for +1 unit of the risk factor (1bp rates/credit, 1% FX/equity)',
  notional_jpy BIGINT,
  counterparty STRING MASK ${mask_fn},
  CONSTRAINT known_desk EXPECT (desk IN ('Rates', 'FX', 'Equity', 'Credit')) ON VIOLATION DROP ROW,
  CONSTRAINT has_sensitivity EXPECT (sensitivity_jpy IS NOT NULL) ON VIOLATION DROP ROW
)
COMMENT 'Validated positions; counterparty is masked for non risk_admins'
AS SELECT position_id, desk, instrument_type, risk_factor,
  CAST(sensitivity_jpy AS DOUBLE) AS sensitivity_jpy,
  CAST(notional_jpy AS BIGINT) AS notional_jpy,
  counterparty
FROM STREAM(bronze_positions);

CREATE OR REFRESH STREAMING TABLE silver_scenarios (
  CONSTRAINT has_shock EXPECT (shock IS NOT NULL) ON VIOLATION DROP ROW
)
COMMENT 'Validated stress scenarios (shock in bp for rates/credit, % for FX/equity)'
AS SELECT scenario_id, scenario_name, risk_factor, CAST(shock AS DOUBLE) AS shock
FROM STREAM(bronze_scenarios);

CREATE OR REFRESH STREAMING TABLE silver_limits (
  CONSTRAINT positive_limit EXPECT (stress_loss_limit_jpy > 0) ON VIOLATION DROP ROW
)
COMMENT 'Stress loss limit per desk in JPY'
AS SELECT desk, CAST(stress_loss_limit_jpy AS BIGINT) AS stress_loss_limit_jpy
FROM STREAM(bronze_limits);
