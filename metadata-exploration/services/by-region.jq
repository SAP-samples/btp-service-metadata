#!/usr/bin/env jq

# Expects one or more service JSON files, slurped in to an array.
# Each service JSON file has a service display name, and one or more service
# plans that are available in one or more data centers:
#
# [
#   {
#     ...
#     "displayName": "service display name",
#     "servicePlans: [
#       { 
#         "dataCenters": [
#         ...
#           {
#             "region": "region code",
#             "name": "region name"
#           },
#           ...
#         ]
#       },
#       {
#         ...
#       }
#     ]
#   }
# ]
#   
# This filter turns that data into a list of services by region:
#
# {
#   "Australia (Sydney DR) (ap2)": [
#     "SAP ASE service",
#     "SAP BTP, Java server",
#     "SAP HANA service for SAP BTP"
#   ],
#   "Australia (Sydney) (ap1)": [
#     "SAP ASE service",
#     "SAP BTP, Java server",
#     "SAP HANA service for SAP BTP"
#   ],
#   "Australia (Sydney) (ap10)": [
#     "API Management, API Business Hub Enterprise",
#     ...
#   ],
#   ...
# }
#


# This function takes an object of key and value pairs that look like this 
# (created by to_entries):
# 
# [
#   {
#     "key": 1,
#     "value": [
#       {
#         "service": "service display name",
#         "region": "region identifier"
#       },
#       ...
#     ]
#   },
#   ...
# ]
#
# and changes the keys and values so that they look like this:
#
# [
#   {
#     "key": "region identifier",
#     "value": [
#       "service displayname",
#       "another service displayname",
#       ...
#     ]
#   },
#   ...
# ]
#
# It's designed to be used in a with_entries invocation:
# to_entries|map(arrange)|from_entries i.e. with_entries(arrange)
#
def arrange:
    # Get the region identifier from the region property of the first object
    # in the value property
    .value[0].region as $region

    # Update the key to be that region identifier
    | .key |= $region

    # Update the value to be an array of unique service display names
    | .value |= (map(.service) | unique)
    ;
    

def main:

    # Go through each of the services
    map(
        # Save the service display name for later
        .displayName as $service 

        # Go through each of the plans for the service
        | .servicePlans

        # Build an array of regions for that service with the name and code 
        # as region identifier
        | map(.dataCenters[]|("\(.name) (\(.region))"))

        # Turn that into an array of pairs of service display name and region
        | map({service: $service, region:.})
    )

    # Flatten all the arrays of pairs into a single array of pairs
    | flatten

    # Group the pair data by the region property
    | group_by(.region)

    # Finally, turn the pairs grouped by region into a single object, where
    # the properties are the region identifiers and the values are arrays of 
    # the display names for services available in that region
    | with_entries(arrange)
    ;

main

