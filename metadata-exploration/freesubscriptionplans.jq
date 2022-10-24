#!/usr/bin/env jq

# This assumes all the entry JSON files have been slurped in
# and are in an outer array
map(
  select(

    # Use 'any' to return a subset of service plans where the 
    # stated criteria is met (note: the isFree property is boolean)
    any(.servicePlans[]; .category == "APPLICATION" and .isFree)

  # From the subset, just pull out the value of the name property
  ).name
)
