map(.servicePlans[].dataCenters[])
| unique_by(.region)
| .[]
| [.region,.name]
| @tsv

