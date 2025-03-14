# btp-service-metadata

[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/btp-service-metadata)](https://api.reuse.software/info/github.com/SAP-samples/btp-service-metadata)

## Description

> [!IMPORTANT]
> 08.01.2025: We updated the metadata to **v1**. The `v0` directory will no longer be updated. The schema of the data changed e.g., you can now also find the commercial model per service plan is part of the data.

You are working with SAP BTP and looking for the metadata of the services in a *machine-readable* format? Then you are at the right place: this repository contains the **metadata of the SAP BTP services**.

As different personas need different metadata when exploring the service metadata we decided to curate it for you. As criterion we use a *persona*-based approach as we are convinced that this will give the optimal support for the task at hand.

We start with the persona *"developer"*. Based on the requirements of this persona we collected the metadata per service in the folder `v1/developer` as JSON files. In addition, we provide an [`inventory list`](v1/inventory.json) as an overview of all available services to enable to have a quick overview what is available and what is not.

Based on [your feedback](https://github.com/SAP-samples/btp-service-metadata/issues/new/choose) we will add additional personas and additional curated metadata.

## Feedback

You may ask: what is your intention? The answer is that we would love to hear your feedback on:

- the data itself (is there something missing etc.).
- the ways how you would like to see the data provisioned for you. We are aware that plain JSON can only be a first step.

You do not know where to start? Need some inspiration? Then this [section](./metadata-exploration/README.md) could be of interest to you.

## Are you using the metadata?

Of course we leverage the information ourselves in the [btp-setup-automator](https://github.com/SAP-samples/btp-setup-automator/) to generate the JSON schemas for the input files used in this open-source tool. Take a look at the repository to get some inspiration on how to leverage the data for your scenarios.

## Update cycle

The data is fetched regularly to be up-to-date. If you experience that something is not up-to-date, please let us know via an [issue](https://github.com/SAP-samples/btp-service-metadata/issues/new?assignees=&labels=bug&template=bug-report.yml&title=%5BBUG%5D+%3Ctitle%3E)

## How to get support

[Create an issue](https://github.com/SAP-samples/btp-service-metadata/issues/new?assignees=&labels=bug&template=bug-report.yml&title=%5BBUG%5D+%3Ctitle%3E) in this repository if you find a bug 🐞.

In case you would like to see an additional feature 🚀, feel free to [open a feature request](https://github.com/SAP-samples/btp-service-metadata/issues/new?assignees=&labels=enhancement&template=feature-request.yml&title=%5BFEATURE+REQUEST%5D+%3Ctitle%3E)

In case of questions, we also have [GitHub discussions](https://github.com/SAP-samples/btp-service-metadata/discussions) activated 😎. This is the place to:

- Ask questions you’re wondering about
- Share ideas
- Engage with other community members

## Contributing

If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License

Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
