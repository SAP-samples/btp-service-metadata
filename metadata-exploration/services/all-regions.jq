#!/usr/bin/env jq

# Descend through each service plan for each entry, and
# then, within those service plans, each data center.
map(.servicePlans[].dataCenters[])

# Multiple services will be available in the same regions,
# so ensure we only count a region once
| unique_by(.region)

# Pull each entry out of the enclosing array ...
| .[]

# ... and form it into a pair of values - the region 
# identifier and its name.
| [.region, .name]

# Use the TSV formatter to output the values with tabs
# separating them (this works best when jq is invoked with
# the --raw-output option).
| @tsv

