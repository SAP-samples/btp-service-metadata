#!/usr/bin/env jq

.[]
| select((.name | contains("kyma"))).servicePlans
| map({
    offering: .displayName,
    availability: .dataCenters|map(.region)
  })
