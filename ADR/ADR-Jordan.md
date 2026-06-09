# ADR — Architecture Decision Record
## Deployment-Dynamos | Frontend Deployment
**Author:** Jordan Foose  
**Date:** 2026-06-02  
**Status:** Accepted

---

## Context

As part of the K5 group assignment, the team needed to deploy a fullstack workout application to Azure in a production-like manner. The application consists of two backend APIs (User-API and workoutapp-API) and a vanilla JS/HTML/CSS frontend. This ADR documents the decisions made for the **frontend deployment**, which was my individual responsibility.

---

## Decision 1: Hosting — Azure Container App over Static Web Apps

### Options considered
- **Azure Static Web Apps** — designed for static sites, free tier, auto CI/CD
- **Azure Blob Storage** static hosting — simple, works on student accounts
- **Azure Container App with nginx** — containerized, consistent with backend approach

### Decision
**Azure Container App with nginx** was chosen.

### Reasoning
Azure Static Web Apps is **completely blocked on school Azure student accounts** regardless of region or method. Azure Blob Storage was suggested as an alternative but would have required a separate deployment approach inconsistent with the rest of the team's architecture. Since the team was already using Container Apps for the backend, using the same service for the frontend ensures a **consistent, reproducible deployment model** across the entire application.

nginx was chosen as the web server because it is **lightweight, battle-tested for serving static files**, and the official Alpine-based image keeps the container size minimal.

### Consequences
- Frontend is served from `https://ca-frontend.kinddesert-2500f86d.germanywestcentral.azurecontainerapps.io`
- Requires a Dockerfile and GitHub Actions workflow
- CORS must be configured in the backend APIs to allow requests from this domain

---

## Decision 2: Region — Germany West Central

### Options considered
- westeurope — blocked by school account policy
- eastus2 — blocked by school account policy
- germanywestcentral — allowed, existing Container App Environment

### Decision
**Germany West Central** was chosen.

### Reasoning
The school Azure student subscription has strict regional restrictions. Previous experience from K5U1 established that `germanywestcentral` is one of the few allowed regions. The existing Container App Environment (`cae-student-env`) already runs in this region, so creating `ca-frontend` here **reuses existing infrastructure** and avoids provisioning a new environment.

---

## Decision 3: CI/CD Pipeline Design

### Decision
A single GitHub Actions workflow (`deploy.yml`) handles build, push, and deploy on every push to `dev` or `main`.

### Pipeline steps
1. **Checkout** — fetch latest code
2. **Login to ACR** — authenticate using `ACR_USERNAME` and `ACR_PASSWORD` stored as GitHub Secrets
3. **Build and push Docker image** — built with `--provenance=false` to avoid unknown/unknown platform manifest entries that Azure Container Apps rejects
4. **Image tagging** — both `latest` and commit SHA tags pushed to ensure traceability
5. **Azure login** — using service principal credentials stored as `AZURE_CREDENTIALS`
6. **Update Container App** — deploy new image revision using Azure CLI

### Quality gates
- Workflow only runs on `dev` and `main` — feature branches do not trigger deployment
- Secrets are never logged — all sensitive values stored in GitHub Secrets, never in code or logs

---

## Decision 4: Security Strategy

### Managed Identity
System-assigned Managed Identity is enabled on `ca-frontend`. The identity was granted the **AcrPull** role scoped to the shared ACR (`dynamos.azurecr.io`) under the team's subscription. This means:
- The Container App can pull images **without storing ACR credentials in the app configuration**
- Access follows the **principle of least privilege** — AcrPull only, no write access

### Key Vault
All production secrets are stored in Azure Key Vault (`kvstudentnyxuvgloult32`). Secrets added include:

| Secret Name | Purpose |
|---|---|
| `Groq--ApiKey` | AI workout generation API key |
| `Jwt--Key` | JWT signing secret for authentication |
| `Jwt--Issuer` | JWT issuer identifier |
| `Jwt--Audience` | JWT audience identifier |
| `ConnectionStrings--WorkoutDb` | Azure SQL connection string for workoutapp-API |
| `ConnectionStrings--DefaultConnection` | Azure SQL connection string for User-API |

The **Key Vault Secrets Officer** role was assigned to the deploying user account to allow secret management via CLI.

### GitHub Secrets
The following secrets are stored at repository level and never appear in code or logs:

| Secret | Purpose |
|---|---|
| `ACR_USERNAME` | ACR admin username |
| `ACR_PASSWORD` | ACR admin password |
| `AZURE_CREDENTIALS` | Service principal JSON for Azure login |
| `AZURE_RESOURCE_GROUP` | Target resource group name |
| `FRONTEND_CONTAINER_APP_NAME` | Name of the frontend Container App |

---

## Decision 5: Frontend Configuration

A `config.js` file was added to the frontend (`scripts/config.js`) containing the production API URLs for both backend services. This ensures **backend URLs are never hardcoded** in individual JS files and can be updated in one place if URLs change.

---

## Decision 6: Frontend API URL Configuration

### Options considered
- **Azure Container App environment variables** — standard approach for server-side apps
- **Static config.js file** — simple JavaScript constant file served as a static asset
- **Hardcoded URLs** — simplest but inflexible and bad practice

### Decision
**Static `config.js` file** was chosen.

### Reasoning
The frontend is vanilla JavaScript running in the browser — it cannot read Azure Container App environment variables since those only exist server-side. A `config.js` file served as a static asset provides a single place to update API URLs without touching individual JS files. This satisfies the assignment requirement of not hardcoding URLs while remaining compatible with a static frontend architecture.

---

## Decision 7: Architectural Constraint — One Container App per Student Account

### Context
Azure student subscriptions enforce a limit of **one Container App Environment per subscription**. This constraint shaped the entire team architecture — each team member could only host one Container App, requiring careful coordination of who hosts which service.

### Decision
Jordan's subscription hosts the **frontend Container App** (`ca-frontend`). Backend APIs are hosted under a teammate's subscription. The shared ACR (`dynamos.azurecr.io`) is accessible to all team members via AcrPull role assignments on Managed Identities.

### Consequence
This is a school environment constraint. In a production scenario all services would ideally run within the same subscription and resource group for easier management and cost tracking.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| ACR credentials exposed | Stored only in GitHub Secrets, never in code |
| Key Vault access misconfigured | RBAC role assignments verified via CLI before deployment |
| Container App region restrictions | Tested multiple regions, documented allowed regions |
| Pipeline deploys broken code | Workflow only triggers on protected branches |
| Secret rotation | Key Vault supports versioned secrets — rotation possible without code changes |

---

## Resources

- **Frontend URL:** `https://ca-frontend.kinddesert-2500f86d.germanywestcentral.azurecontainerapps.io`
- **Container App:** `ca-frontend` in `rg-bicep-student`
- **ACR:** `dynamos.azurecr.io`
- **Key Vault:** `kvstudentnyxuvgloult32`
- **GitHub repo:** `https://github.com/niklaserikssoon/SQ-workoutapp`
