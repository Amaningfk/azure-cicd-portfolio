# Azure CI/CD Portfolio

A working, deployable example of a build-and-release setup: a static site, an infrastructure template, and a pipeline that validates every pull request and ships the site on release.

## What is in here

| Path | Purpose |
|---|---|
| .github/workflows/ci.yml | Validation pipeline: checks the HTML, confirms every referenced asset exists, and compiles the infrastructure template. Runs on every pull request, and on demand. Nothing is deployed. |
| .github/workflows/deploy.yml | Release pipeline: validates again, then uploads the site to Azure Static Web Apps. Manual trigger, so a deployment only happens when someone asks for one. |
| .github/scripts/check-assets.mjs | Fails the build if the page references a file that is not in the repository. |
| infra/main.bicep | Infrastructure as code (Bicep): the static web app, tagged and idempotent. |
| infra/parameters.example.json | Example parameters. Copy to parameters.json and edit. |
| terraform/ | The same infrastructure in Terraform, for teams that standardise on it. |
| k8s/ | Kubernetes manifests for running the site behind an ingress. |
| site/ | The site: one page, no build step, deploys as static files. |
| .htmlvalidate.json | HTML validation rules, committed so the check behaves the same everywhere. |

## How the pipeline works

1. A pull request runs ci.yml. It fails if the HTML is malformed, if the page references a missing file, or if the infrastructure template does not compile.
2. deploy.yml is triggered by hand from the Actions tab. It validates the template again, then uploads site/ to Azure Static Web Apps.
3. The deployment token is read from GitHub secrets. No credentials live in the repository.

## Running the infrastructure

Bicep:

    az bicep build --file infra/main.bicep

    az deployment group create \
      --resource-group rg-portfolio \
      --template-file infra/main.bicep \
      --parameters infra/parameters.example.json

Terraform:

    cd terraform
    terraform init
    terraform plan -var="app_name=portfolio-site"
    terraform apply -var="app_name=portfolio-site"

## Kubernetes

    kubectl apply -f k8s/

The manifests assume a container image serving site/ from nginx, and a TLS secret
named portfolio-tls in the namespace.

## Design notes

- Validation and deployment are separate jobs, so nothing reaches production unvalidated.
- Infrastructure is provided in both Bicep and Terraform, and both are tagged, because cost
  reporting is the first thing a client asks about after the second invoice.
- No secrets in the repository. Anything sensitive goes in GitHub secrets, Azure Key Vault,
  or a Kubernetes Secret.

Built and maintained by Festus Kwarteng Amaning, KAF Overhead Door Systems LLC.

Microsoft Certified: Azure Administrator Associate and DevOps Engineer Expert, both current to April 2027.
