#!/usr/bin/env jq

# Expected arguments: $region (e.g. eu10)

# Look through the array of all entries
map(
  #
  # Filter down to where an entry has any service plan ...
  select(
    any(
      .servicePlans[];

      # ... that has any data center where the region matches
      any(
        .dataCenters[];
        .region | startswith($region)
      )
    )
  )

# And pick out just the name of the entry
.displayName
)

# Ensure uniqueness (and sorted)
| unique

# Output a simple list of entry names
| .[]
