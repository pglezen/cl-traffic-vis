# Cloverlaf Volume Counts

This repository holds scripts used to visualize traffic volume through
the Cloverleaf integration broker that facilitates much of PIX.  The
data passes through several stages before visualization.

1. The daily counts for each Cloverleaf node are collected each night
   by a maintenance script just before these counts are reset for the
   next day.  The Cloverleaf command used to fetch these counts is
   `hcimsiutil`.

2. The `hcimsiutil` must be run for each node.  The output is semi-structured
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
   `monthlySummary.py` to aggregate the counts to a montly summary, filter
   nodes that are merely cross Cloverleaf sites, and convert the result to
   a "flat JSON" file.  Here is an example.

   `  python monthlySummary traffic_2019-07.txt`

   A manual change has to be made at this point: `rajis_cdaemon_out_j02` to
   `rajis_jail_out_j02`.  Otherwise the next step thinks the RAJIS node is
   part of a site named `cdaemon`, which is erroneous.

4. A JavaScript program `hier.js` converts the flat-JSON file into a hierarchical
   JSON file based node membership to Cloverleaf sites and processes.  The format
   of the hierarchical JSON file accommodates the `d3.hierarchy` processor.
   
   ` node hier.js traffic_2019-07_flat_in.json > traffic_2019-07_tree_in.json`
   ` node hier.js traffic_2019-07_flat_out.json > traffic_2019-07_tree_out.json`


5. The Electron application reads the hierarchical JSON file and creates the
   treemap.
