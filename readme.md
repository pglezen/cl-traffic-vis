# Cloverlaf Volume Counts

This repository holds scripts used to visualize traffic volume through
the Cloverleaf integration broker that facilitates much of PIX.  The
data passes through several stages before visualization.

1. The daily counts for each Cloverleaf node are collected each night
   by a maintenance script just before these counts are reset for the
   next day.  The Cloverleaf command used to fetch these counts is
   `hcimsiutil`.

2. The `hcimsiutil` is run for each node.  The output is semi-structured
   text that must be parsed to extract the desired counts.  The maintenance
   script pipes the output through an `awk` script that parses the `hcimsiutil`
   output and emits a single record with a timestamp, node name, and the daily
   count.  This record is appended to a file named
   `/cis/local/log/traffic_YYYY-MM.txt`, where `YYYY` and `MM` are the current
   year and month, respectively.  A new file is started each month.
   Sample content is shown below.

```
2019-07-01 23:37:58 cchrs_misc_dest_out_p02 429
2019-07-01 23:37:58 dash_jail_dest_out_p02 853
2019-07-01 23:37:58 doj_probation_out_p02 742
2019-07-01 23:37:58 linx_jail_dest_out_p02 853
2019-07-01 23:37:58 jaims_probation_out_p03 0
```

3. The traffic file (from Step #2) is processed by a Python/Pandas script
   `monthlySummary.py` to aggregate the counts to a montly summary.
   Here is an example invocation.

   `  python monthlySummary traffic_2019-07.txt`

   This creates a new file named `traffic_2019-07_flat.json`.

4. The Electron application reads the JSON flat file and creates the
   treemap.
