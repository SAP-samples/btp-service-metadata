# Metadata exploration

This is a set of explorations of the metadata in this repository, provided as examples for you to take and build upon.

## Inventory exploration

There's an [inventory.json](v0/inventory.json) file which contains a summary of all the services, applications and environments. Each entry is represented by an object, each of which look like this:

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


