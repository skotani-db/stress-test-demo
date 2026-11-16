-- Bronze: raw CSV files from the UC Volume, ingested incrementally with Auto Loader.
CREATE OR REFRESH STREAMING TABLE bronze_positions
COMMENT 'Raw trading-book positions as landed in the Volume'
AS SELECT *, _metadata.file_path AS source_file
FROM STREAM read_files('${raw_path}/positions/', format => 'csv', header => true);

CREATE OR REFRESH STREAMING TABLE bronze_scenarios
COMMENT 'Raw stress scenarios as landed in the Volume'
AS SELECT *, _metadata.file_path AS source_file
FROM STREAM read_files('${raw_path}/scenarios/', format => 'csv', header => true);

CREATE OR REFRESH STREAMING TABLE bronze_limits
COMMENT 'Raw stress loss limits per desk as landed in the Volume'
AS SELECT *, _metadata.file_path AS source_file
FROM STREAM read_files('${raw_path}/limits/', format => 'csv', header => true);
