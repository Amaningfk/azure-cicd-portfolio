# Azure CI/CD Portfolio

A working, deployable example of a build-and-release setup: a static site, the same infrastructure written twice over in Bicep and Terraform, a container image, Kubernetes manifests, and a pipeline that validates every pull request.

## What is in here

| Path | Purpose |
|---|---|
| .github/workflows/ci.yml | Validation pipeline: HTML, asset references, the Bicep template, the Terraform configuration, every Kubernetes manifest, and a real container build. Runs on pull requests, and on demand. Nothing is deployed. |
| .github/workflows/deploy.yml | Release pipeline: validates again, then uploads site/ to Azure Static Web Apps. Manual trigger, so a deployment happens only when someone asks for one. |
| .github/scripts/check-assets.mjs | Fails the build if the page references a file that is not in the repository. |
| Dockerfile | Container image: unprivileged nginx serving site/ on port 8080, with a healthcheck. |
| docker/default.conf | The nginx server block baked into the image: cache rules and /healthz. |
| docker-compose.yml | Runs the image locally with a read-only filesystem and every capability dropped. |
| infra/main.bicep | Infrastructure as code (Bicep): the static web app, tagged and idempotent. |
| infra/parameters.example.json | Example parameters. Copy to parameters.json and edit. |
| terraform/ | The same infrastructure in Terraform, for teams that standardise on it. |
| k8s/ | Kubernetes manifests for running the container behind an ingress. |
| site/ | The site: one page, no build step, deploys as static files. |
| .htmlvalidate.json | HTML validation rules, committed so the check behaves the same everywhere. |

## How the pipeline works

1. A pull request runs ci.yml. It fails if the HTML is malformed, if the page references a missing file, if the infrastructure template does not compile, if the Terraform is not formatted or does not validate, if a Kubernetes manifest does not match its schema, or if the container image does not build.
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
    terraform validate
    terraform plan -var="app_name=portfolio-site"

## Docker

    docker build -t azure-cicd-portfolio:local .
    docker run --rm -p 8080:8080 azure-cicd-portfolio:local

Or with compose, which applies the hardened runtime flags for you:

    docker compose up --build

The image runs as uid 101 and never as root, listens on 8080, and declares a healthcheck against /healthz, so an orchestrator can tell a live container from a hung one.

## Kubernetes

    kubectl apply -f k8s/

The manifests run the image built by the Dockerfile, and expect a TLS secret named portfolio-tls in the namespace.

## Design notes

- Validation and deployment are separate jobs, so nothing reaches production unvalidated.
- Infrastructure is provided in both Bicep and Terraform, and both are tagged, because cost reporting is the first thing a client asks about after the second invoice.
- The container drops every capability, forbids privilege escalation, and runs with a read-only filesystem, because a static site has no business writing to its own disk.
- No secrets in the repository. Anything sensitive goes in GitHub secrets, Azure Key Vault, or a Kubernetes Secret.

Built and maintained by Festus Kwarteng Amaning, KAF Overhead Door Systems LLC.

Microsoft Certified: Azure Administrator Associate and DevOps Engineer Expert, both current to April 2027.
