# Metadata exploration

This is a set of explorations of the metadata in this repository, provided as examples for you to take and build upon.

If you want to try these explorations out, you'll need [jq](https://stedolan.github.io/jq/), and optionally (for a more interactive environment) [ijq](https://sr.ht/~gpanders/ijq/). If you're running the [BTP Setup Automator](https://github.com/SAP-samples/btp-setup-automator/), you'll be pleased to know that both these tools are in the Docker image too, all ready for you to use. 

> There are some issues running `jq` with glob patterns on Windows shells (PowerShell and CMD) - see the [Wildcards on Windows](https://github.com/stedolan/jq/issues/1644) issue for more information. We recommend you use WSL2 on Windows.

All the metadata files used in these examples are within the [v0/](../v0/) directory in this repository.

In each example there's a convenience script that calls `jq`, pointing to the metadata files, and specifying the appropriate `jq` filter file. All these scripts are in, this `metadata-explorations/` directory, which is where you should be when you try to execute them.

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

Here's a simple `jq` filter to do just that (available, with accompanying comments, in [inventory/entries-by-category.jq](inventory/entries-by-category.jq)):

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

You can run this filter with the convenience script [entries-by-category](./entries-by-category) like this:

```bash
./entries-by-category
```

## Individual service file explorations

Within the [developer/](../v0/developer/) directory there are many JSON files, one for each service, application and environment offering. 

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

While these are individually useful, they are even more useful to explore together. With the `jq` [slurp](https://stedolan.github.io/jq/manual/#Invokingjq) feature, all of the JSON files can be read in together and placed into an enclosing array. Then filters can be applied as appropriate. 


### Applications with a free subscription plan

Entries that we think of as "subscriptions", rather than services, are referred to in the metadata as "applications" (to which one subscribes). To find a list of all applications with a free plan, for example, the following filter can be used:

```jq
map(
  select(
    any(.servicePlans[]; .category == "APPLICATION" and .isFree)
  ).name
)
```

This filter is available, with accompanying comments, in [services/free-subscription-plans.jq](services/free-subscription-plans.jq), and can be executed, using the slurp option, like this:

```bash
jq --from-file services/free-subscription-plans.jq -s ../v0/developer/*.json 
```

The equivalent of the invocation we've just shown, is the execution of the convenience script [free-subscription-plans](./free-subscription-plans):

```bash
./free-subscription-plans
```

Either way, output should be produced looking something like this:

```json
[
  "ai-launchpad",
  "alm-ts",
  "auditlog-viewer",
  "automationpilot",
  "cicd-app",
  "content-agent-ui",
  "integrationsuite",
  "intelligent-situation-automation-app",
  "IRPA",
  "process-automation",
  "sapappstudio",
  "SAPLaunchpad"
]
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

This filter is available, with copious explanatory comments, in [services/by-region.jq](services/by-region.jq). Here's an example invocation using the corresponding convenience script provided:

```bash
./services-by-region
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

First, there's the `jq` filter itself, which is also available as a commented version in [services/in-region.jq](services/in-region.jq):

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

You can invoke the filter on the metadata files with this corresponding convenience script like this (noting that a region must be specified - in this example, the value `eu10` is given):

```bash 
./services-in-region eu10
```

The convenience script for this example, [services-in-region](./services-in-region) has more `jq` options and looks like this:

```bash
#!/usr/bin/env bash

source lib.sh

jq \
  --arg region "${1:?Specify a region e.g. eu10}" \
  --from-file services/in-region.jq \
  --raw-output \
  -s "$METADATADIR"/*.json
```

Notice the use of the variable `$region` which is set via the `--arg` option when `jq` is invoked.

To get a flat, simple list of resource names, the array of results is expanded by the array iterator (`.[]`) in [the filter](services/in-region.jq), and the `--raw-output` option is used when `jq` is invoked, to stop `jq` doing what it does by default, which is to try to produce JSON elements (`"hello world"` is valid JSON, whereas `hello world`, without the enclosing double quotes, is not). 

Example output looks like this (heavily reduced for brevity):

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

### What are all the regions anyway?

In case you're wondering what regions there are in general, this query is one you could run (and then you'd have a list from which to pick, to supply a value for the `services-in-region` example).

The actual `jq` filter itself is quite straightforward:

```jq
map(.servicePlans[].dataCenters[])
| unique_by(.region)
| .[]
| [.region,.name]
| @tsv
```

This descends through the structure pulling out unique data center details, and emitting the region and name identifiers in a tab separated format. Running this on the entire list of metadata files with the convenience script:

```bash
./list-all-regions
```

produces output like this:

```bash
ae1   UAE (Dubai)
ap1   Australia (Sydney)
ap10  Australia (Sydney)
ap11  Singapore
ap12  South Korea (Seoul)
ap20  Australia (Sydney) Azure
ap21  Singapore
br1   Brazil (Sao Paulo)
br10  Brazil (Sao Paulo)
ca1   Canada (Toronto)
ca10  Canada (Montreal)
ch20  cf-ch20
cn1   China (Shanghai)
eu1   Europe (Rot)
eu10  Europe (Frankfurt)
eu11  Europe (Frankfurt) EU Access - AWS
eu2   Europe (Frankfurt)
eu20  Europe (Netherlands)
eu3   Europe (Amsterdam)
eu30  Europe (Frankfurt)
in30  India (Mumbai)
jp1   Japan (Tokyo)
jp10  Japan (Tokyo)
jp20  Japan (Tokyo)
sa1   KSA (Riyadh)
us1   US East (Ashburn)
us10  US East (VA)
us2   US West (Chandler)
us20  US West (WA)
us21  US East (VA)
us3   US East (Sterling)
us30  US Central (IA)
us4   US West (Colorado Springs)
```
