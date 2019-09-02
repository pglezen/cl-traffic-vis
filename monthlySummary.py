# coding: utf-8
import numpy as np
import pandas as pd
pd.options.display.max_rows
pd.options.display.width
pd.options.display.width=135
pd.options.display.min_rows=30
j1 = pd.read_table('traffic_2019-07.txt', header=None, parse_dates=[[0,1]], names=['date', 'time', 'node', 'count'], sep=" ")
j1.head()
j2 = j1.set_index('date_time')
j2.head()
j3 = j2.pivot(columns='node', values='count')
j3.iloc[:8, :4]
totals = j3.sum().astype(int)
totals.head(10)
totals.size
totals.shape
extotals = totals.drop(totals.filter(like='_dest_').index)
extotals.size
extotals.drop(['jhis_jail_in_j04', 'jhis_jail_out_j01', 'tccoal_court_in_c08', 'rajis_db_out_j02'], inplace=True)
extotals.size
inbound = extotals.filter(like='_in_').sort_values(ascending=False)
outbound = extotals.filter(like='_out_').sort_values(ascending=False)
inbound.head(30).apply(lambda x: "{:,}".format(x))
inbound.head(20)
outbound.to_csv('j1_out.csv', header=False)
inbound.to_csv('j1_in.csv', header=False)
inbound.to_json('j1_in.json')
outbound.to_json('j1_out.json')
