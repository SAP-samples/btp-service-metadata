#!/usr/bin/env jq

# Loop over all the entries
map(
  # Create an object with 2 properties - the service name
  # and the category (which is found in the servicePlans)
  {
    displayName,
    category
  })

# Group the objects by the category to get an array of arrays of objects
| group_by(.category)

# Turn that array of arrays into an object where the properties (keys)
# are the categories, and the values are arrays of the entry names
| map(
  {
    (first.category): map(.displayName)
  }
)
