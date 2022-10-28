# Metadata exploration

This is a set of explorations of the metadata in this repository, provided as examples for you to take and build upon.

If you want to try these explorations out, you'll need [jq](https://stedolan.github.io/jq/), and optionally (for a more interactive environment) [ijq](https://sr.ht/~gpanders/ijq/). If you're running the [BTP Setup Automator](https://github.com/SAP-samples/btp-setup-automator/), you'll be pleased to know that both these tools are in the Docker image too, all ready for you to use. 

> There are some issues running `jq` with glob patterns on Windows shells (PowerShell and CMD) - see the [Wildcards on Windows](https://github.com/stedolan/jq/issues/1644) issue for more information. We recommend you use WSL2 on Windows.

## Inventory exploration

There's an `inventory.json` file which contains a summary of all the services, applications and environments. Each entry is represented by an object, each of which look like this:

```json
{
  "technicalId": "ASE_PROVISIONING",
  "displayName": "SAP ASE service",
  "description": "The SAP ASE service [...] lets you consume SAP ASE databases [...]",
  "fileName": "ASE_PROVISIONING.json",
  "category": "SERVICE"
}
```

### Entries by category

Note the `category` property; we can use this to get a list of entries, grouped by category (i.e. an organized list of all the services, applications and so on). 

Here's a simple `jq` filter to do just that (available, with accompanying comments, in [inventory-bycategory.jq](inventory-bycategory.jq)):

```jq
map(
  {
    displayName,
    category
  })
| group_by(.category)
| map(
  {
    (first.category): map(.displayName)
  }
)
```

This produces output like this:

```json
[
  {
    "APPLICATION": [
      "SAP Backend service",
      "SAP Intelligent Robotic Process Automation",
      "Landscape Portal",
      "...",
      "Workspace Utilization"
    ]
  },
  {
    "ENVIRONMENT": [
      "SAP BTP, Cloud Foundry runtime",
      "SAP BTP, Kyma runtime"
    ]
  },
  {
    "SERVICE": [
      "SAP ASE service",
      "SAP BTP, Java server",
      "SAP Custom Domain service",
      "SAP Master Data service for business partners",
      "SAP BTP, ABAP environment",
      "...",
      "SAP Authorization and Trust Management service"
    ]
  }
]
```

## Individual service file explorations

Within the `developer/` directory there are many JSON files, one for each service, application and environment offering. 

Each file has a similar structure, which looks like this:

```json
{
  "name": "xsuaa",
  "displayName": "SAP Authorization and Trust Management service",
  "description": "The Authorization and Trust Management service lets you manage user authorizations and trust to identity providers. Identity providers are the user base for applications. You can use an identity authentication tenant, an SAP on-premise system, or a custom corporate identity provider. User authorizations are managed using technical roles at the application level, which can be aggregated into business-level groups and role collections for large-scale cloud scenarios.",
  "icon": "https://digitalmarketplace-sapcpprd.s3.eu-central-1.amazonaws.com/qhOUIp9iQuuZD0CGAj8r2DME9MZRx7WhXS7efiK0J4ANcpnn__hC2WCzr63CS093.svg",
  "links": [
    {
      "value": "https://ga.support.sap.com/dtp/viewer/index.html#/tree/2212/actions/28290",
      "classification": "Support",
      "type": "Link",
      "text": "Troubleshooting for the SAP Authorization and Trust Management Service"
    },
    {
      "value": "https://help.sap.com/viewer/product/CP_AUTHORIZ_TRUST_MNG/Cloud/en-US",
      "classification": "Documentation",
      "type": "Link",
      "text": "Help Portal Product Page"
    }
  ],
  "servicePlans": [
    {
      "name": "apiaccess",
      "displayName": "apiaccess",
      "category": "SERVICE",
      "description": "Access plan for authorizations, users, identity providers, and API endpoints",
      "isFree": true,
      "isBeta": false,
      "dataCenters": [
        {
          "region": "ap10",
          "name": "Australia (Sydney)"
        },
        {
          "region": "ap11",
          "name": "Singapore",
        },
        {
          "region": "...",
          "name": "...",
        }
      ]
    },
    {
      "name": "application",
      "displayName": "application",
      "category": "SERVICE",
      "description": "Application plan to be used for business applications",
      "isFree": true,
      "isBeta": false,
      "dataCenters": [
        {
          "region": "...",
          "name": "..."
        },
        {
          "region": "us21",
          "name": "US East (VA)"
        },
        {
          "region": "us30",
          "name": "US Central (IA)"
        }
      ]
    }
  ]
}
```

While these are individually useful, they are even more useful to explore together. With the `jq` "slurp" feature, all of the JSON files can be read in together and placed into an enclosing array. Then filters can be applied as appropriate. 


### Applications with a free subscription plan

Entries that we think of as "subscriptions", rather than services, are referred to in the metadata as "applications" (to which one subscribes). To find a list of all applications with a free plan, for example, the following filter can be used:

```jq
map(
  select(
    any(.servicePlans[]; .category == "APPLICATION" and .isFree)
  ).name
)
```

This filter is available, with accompanying comments, in [freesubscriptionplans.jq](freesubscriptionplans.jq), and can be executed, using the slurp option, like this:

```bash
jq -f freesubscriptionplans.jq -s ../v0/developer/*.json 
```

### List services availability by region

Data gravity is an important concept and sometimes we need to think about where services are in relation to the data we have. With this filter, which also is designed to run over a slurped array of entry JSON files, we can find that out.

```jq
def arrange:
    .value[0].region as $region
    | .key |= $region
    | .value |= (map(.service) | unique)
    ;
    
def main:
    map(
        .displayName as $service 
        | .servicePlans
        | map(.dataCenters[]|("\(.name) (\(.region))"))
        | map({service: $service, region:.})
    )
    | flatten
    | group_by(.region)
    | with_entries(arrange)
    ;

main
```

This filter is available, with copious explanatory comments, in [service-by-region.jq](services-by-region.jq). Here's an example invocation:

```bash
jq -f services-by-region.jq -s ../v0/developer/*.json 
```

The output looks something like this (heavily reduced for brevity):

```json
{
  "Australia (Sydney DR) (ap2)": [
    "SAP ASE service",
    "SAP BTP, Java server",
    "SAP HANA service for SAP BTP"
  ],
  "Australia (Sydney) (ap1)": [
    "SAP ASE service",
    "SAP BTP, Java server",
    "SAP HANA service for SAP BTP"
  ],
  "Australia (Sydney) (ap10)": [
    "API Management, API Business Hub Enterprise",
    "API Management, API Portal",
    "API Management, API portal",
    "API Management, developer portal",
    "Application Autoscaler",
    "Audit Log Service API",
    "Business Entity Recognition",
    "..."
  ],
  "...": [
    "..."
  ],
  "US West (Chandler) (us2)": [
    "SAP ASE service",
    "SAP BTP, Java server",
    "SAP HANA service for SAP BTP"
  ],
  "US West (Colorado Springs) (us4)": [
    "SAP ASE service",
    "SAP BTP, Java server",
    "SAP HANA service for SAP BTP"
  ],
  "US West (WA) (us20)": [
    "SAP BTP, Cloud Foundry runtime",
    "SAP BTP, Kyma runtime",
    "SAP BTP, serverless runtime",
    "SAP Business Application Studio",
    "SAP Business Rules Management",
    "SAP Cloud Identity Services",
    "SAP Cloud Management service for SAP BTP",
    "SAP Cloud Portal service",
    "SAP Cloud Transport Management",
    "SAP Connectivity service",
    "SAP Content Agent service",
    "SAP Continuous Integration and Delivery",
    "SAP Credential Store",
    "SAP Custom Domain service",
    "SAP Data Intelligence Cloud",
    "SAP Data Privacy Integration",
    "SAP Data Retention Manager",
    "SAP Destination service",
    "..."
  ]
}
```

### Services available in a given region

Here's an example of getting a simple list of services, applications and environments that are available in a given region, which can be specified as an argument (e.g. `eu10`).

First, there's the `jq` filter itself, which is also available as a commented version in [services-in-region.jq](services-in-region.jq):

```jq
map(
  select(
    any(
      .servicePlans[];
      any(
        .dataCenters[];
        .region | startswith($region)
      )
    )
  )
.displayName
)
| unique
| .[]
```

Notice the use of the variable `$region` which is set via the `--arg` option when `jq` is invoked; here's an example (which is also available in [services-in-region](services-in-region) Bash script:

```bash
#!/usr/bin/env bash

declare METADATADIR="../v0/developer"

jq \
  --arg region "${1:?Specify a region e.g. eu10}" \
  --from-file services-in-region.jq \
  --raw-output \
  --slurp \
  $METADATADIR/*.json
```

To get a flat, simple list of resource names, the array of results is expanded by the array iterator (`.[]`) in the `jq` filter, and the `--raw-output` option is used when `jq` is invoked, to stop `jq` doing what it does by default, which is to try to produce JSON elements (`"hello world"` is valid JSON, whereas `hello world`, without the enclosing double quotes, is not). 

This filter and script, when invoked like this:

```bash
./services-in-region eu10
```

results in output like this (heavily reduced for brevity):

```text
ABAP Solution
API Management, API Business Hub Enterprise
API Management, API Portal
API Management, API portal
API Management, developer portal
Application Autoscaler
Audit Log Service API
Blockchain Application Enablement
Business Entity Recognition
Cloud Integration Automation
Connectivity (for scale-out build-out)
Data Attribute Recommendation
Data Quality Services UI
Date and Time
Document Classification
Document Information Extraction
...
```
