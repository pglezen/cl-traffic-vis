import sys
import re
import numpy as np
import pandas as pd

if len(sys.argv) > 1:
  infile = sys.argv[1]
else:
  print('Usage: python', sys.argv[0], '<input file>')
  sys.exit(1)

dateMatch = re.search(r'traffic_(\d\d\d\d-\d\d)\.txt', infile)
if len(dateMatch.groups()):
  datePart = dateMatch.group(1);
  inFlatJsonFile  = 'traffic_{}_flat_in.json'.format(datePart)
  outFlatJsonFile = 'traffic_{}_flat_out.json'.format(datePart)
  print('   Input text file: {}'.format(infile))
  print(' Inbound flat file: {}'.format(inFlatJsonFile))
  print('Outbound flat file: {}'.format(outFlatJsonFile))
else:
  print('filename {} must be in the format traffic_YYYY-MM.txt'.format(infile))
  sys.exit(2)

m1 = pd.read_table(infile,
                   header=None,
                   parse_dates=[[0,1]],
                   names=['date', 'time', 'node', 'count'],
                   sep=" ")
m2 = m1.set_index('date_time')
m3 = m2.pivot(columns='node', values='count')
totals = m3.sum().astype(int)
extotals = totals.drop(totals.filter(like='_dest_').index)
extotals.drop(['jhis_jail_in_j04',
               'jhis_jail_out_j01',
               'tccoal_court_in_c08'], inplace=True)
inbound  = extotals.filter(like='_in_' ).sort_values(ascending=False)
outbound = extotals.filter(like='_out_').sort_values(ascending=False)
inbound.to_json(inFlatJsonFile)
outbound.to_json(outFlatJsonFile)
