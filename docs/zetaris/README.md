# Zetaris Data Import Guide

This project expects production data to be loaded into a Zetaris source named `production_raw` so the application can query it as `PRODUCTION_RAW.<table_name>`.

## production_raw

Use the following flow to import the factory data into Zetaris.

### 1. Create the file source
1. Open the Zetaris UI.
2. Go to the data source or catalog area.
3. Create a new file source.
4. Name the source/database `production_raw`.
5. Save the source.

> If your environment displays the catalog name in uppercase, keep it consistent with the app naming convention: `PRODUCTION_RAW`.

### 2. Upload the files to the NDP file system
1. Open the NDP file system in Zetaris.
2. Go to the `file-store` folder.
3. Upload each JSON file into that folder.
4. Use one file per logical table, for example:
   - `daily_metrics.json`
   - `downtime_event_log.json`
   - `resource_assumptions.json`
5. Confirm that all uploaded files are visible in the `file-store` directory.

### 3. Create a table from each uploaded file
1. From the `production_raw` source, choose the option to create a table.
2. Select the file stored in the NDP file system under `file-store`.
3. Set the table type to `JSON`.
4. Set the source to `NDP FS`.
5. Name the table to match the dataset, for example:
   - `daily_metrics`
   - `downtime_event_log`
   - `resource_assumptions`
6. Save the table definition.

### 4. Validate the data in Zetaris
After the tables are created, test them with a few sample queries:

```sql
SELECT * FROM PRODUCTION_RAW.daily_metrics LIMIT 10;
SELECT * FROM PRODUCTION_RAW.downtime_event_log LIMIT 10;
SELECT * FROM PRODUCTION_RAW.resource_assumptions LIMIT 10;
```

If the tables preview correctly, the project is ready to query the production data through the Zetaris federated catalog.

### 5. Expected table mapping
| Source Name | Table Name | File | Type | Source |
| --- | --- | --- | --- | --- |
| `production_raw` | `daily_metrics` | `daily_metrics.json` | `JSON` | `NDP FS` |
| `production_raw` | `downtime_event_log` | `downtime_event_log.json` | `JSON` | `NDP FS` |
| `production_raw` | `resource_assumptions` | `resource_assumptions.json` | `JSON` | `NDP FS` |

This matches the table names used by the application and the SustainFlow investigation workflow.
