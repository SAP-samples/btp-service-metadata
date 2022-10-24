# Metadata exploration

This is a set of explorations of the metadata in this repository, provided as examples for you to take and build upon.

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

This filter is available, with accompanying comments, in [freesubscriptionplans.jq](freesubscriptionplans.jq).
