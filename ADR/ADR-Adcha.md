# ADR / System Design - Workout App Deployment
**Author:** Adchariya Changtam<br>
**Date:** June 2026<br>
**Project:** Deployment Dynamos Workout App (K5-Projekt i team)

---

## 1. Overview

This document explains the architectural decisions made when deploying the Workout App to Azure. The system consists of a vanilla JavaScript SPA frontend (SQ-workoutapp) and two ASP.NET Core 9 Web API backends (workoutapp-API and User-API), backed by an Azure SQL database and an AI-powered workout plan feature using the Groq API.

Production URLs:
- Frontend: https://ca-frontend-prod.wonderfulpebble-02d3e465.italynorth.azurecontainerapps.io
- Workout API: https://workoutapp-api.wonderfulpebble-02d3e465.italynorth.azurecontainerapps.io
- User API: https://user-api.wonderfulpebble-02d3e465.italynorth.azurecontainerapps.io

---

## 2. Architecture Summary

All three services run as separate Container Apps inside one Container Apps Environment (deployment-dynamos-env) in resource group "deployment-dynamos-rg".

```
Browser
  └── ca-frontend-prod (Nginx, port 80)
        ├── workoutapp-api (ASP.NET Core 9, port 8080)
        │     ├── Azure SQL Database (WorkoutDb)
        │     └── Groq API (llama-3.3-70b-versatile)
        └── user-api (ASP.NET Core 9, port 8080)
              └── Azure SQL Database (WorkoutDb)
```

>_The frontend and backend are maintained in two separate GitHub repositories (SQ-workoutapp and workoutapp), each with their own CI/CD pipeline._

>_All secrets are stored in Azure Key Vault (kv-dynamos-workout) and retrieved at runtime via Managed Identity. Deployment is automated via GitHub Actions in two separate repositories._

---

## 3. Hosting Decisions

### 3.1 Backend - Azure Container Apps

**Decision:** Both APIs are hosted on Azure Container Apps.

**Reasons:**
- Supports Docker containers natively without managing VMs or Kubernetes clusters.
- Scales to zero when idle (minReplicas: 0), saving subscription credits.
- System-assigned Managed Identity is supported out of the box, required for Key Vault access.
- Integrates directly with Azure Container Registry via Managed Identity, no stored credentials are needed for image pulls.

**Alternatives considered:**
- Azure App Service: simpler but less flexible for containerized workloads and more expensive at scale.

---

### 3.2 Frontend - Azure Container Apps (Nginx)

**Decision:** The frontend is hosted as a third Container App running Nginx, serving static HTML/CSS/JS files.

**Original plan:** Azure Static Web Apps was the first choice; purpose-built for SPAs, free tier, built-in CI/CD. However, the school's Azure for Students subscription blocked the Microsoft.Web resource provider, making Static Web Apps unavailable, leading to Nginx as an alternative solution.

**Why Nginx works with Container Apps:**
- Works within the existing Container Apps Environment already provisioned.
- Nginx is a production-grade static file server with proper caching headers and SPA routing support (try_files).
- Keeps all three components consistent: same infrastructure, same deployment pattern.
- Demonstrates containerization skills required in assignment (Epic 2).

---

### 3.3 Container Registry - deploymentdnyamosacr (ACR)

**Decision:** Docker images are built in GitHub Actions and pushed to Azure Container Registry.

**Reasons:**
- Keeps images within the Azure ecosystem, simplifying authentication via Managed Identity (AcrPull role).
- Images are tagged with both latest and the Git commit SHA, providing full traceability between a running container and the exact source code commit.

---

### 3.4 Database - Azure SQL (deployment-dynamos-sql / WorkoutDb)

**Decision:** Azure SQL Database is used as the relational store for both APIs via Entity Framework Core.

**Reasons:**
- Managed service, no database server to maintain.
- Connection string stored securely in Key Vault, never in code.

---

## 4. CI/CD Pipeline Design

**Decision:** GitHub Actions with separate workflows per repo, split into a test job and a deploy job with quality gates.

### Backend workflow (.github/workflows/static.yml)

```
On push to main or dev, on PR to main or dev:
  test job:
    - dotnet restore
    - dotnet build
    - dotnet test

  deploy job (main only, needs: test):
    - docker build workoutapp-API → push to ACR (:latest + :sha)
    - docker build User-API → push to ACR (:latest + :sha)
    - az containerapp update workoutapp-api
    - az containerapp update user-api
```

### Frontend workflow (.github/workflows/deploy.yml)

```
On push to main or dev:
  build-and-test job:
    - npm ci
    - npm test --watchAll=false (67 Jest tests)

  build-and-deploy job (main only, needs: build-and-test):
    - Generate config.js with prod API URLs from GitHub variables
    - docker build frontend → push to ACR (:latest + :sha)
    - az containerapp update ca-frontend-prod
```

**Quality gates:**
- needs: test __(Deploy job is blocked if any test fails.)__
- if: github.ref == refs/heads/main __(Deploy only triggers on main, never on dev or feature branches.)__
- Tests run on every push and every PR.
- Every deployed image is tagged with the commit SHA __(Any running container can be traced back to the exact commit.)__

**Why GitHub Actions:**
- Native integration with the repositories.
- Secrets stored as GitHub Actions secrets and never in code or logs.
- Supports environment-specific variables for non sensitive config like API URLs.

---

## 5. Security Strategy

### 5.1 Secret Management — Azure Key Vault (kv-dynamos-workout)

**Decision:** All secrets are stored in Azure Key Vault. Nothing sensitive exists in appsettings.json, committed config files, or pipeline logs.

Secrets stored:

| Secret name | What it is |
|---|---|
| kv-db-conn | Azure SQL connection string |
| kv-jwt-key | JWT signing key |
| Groq--ApiKey | Groq API key for AI workout generation |

In the backend, Key Vault is integrated via Azure.Extensions.AspNetCore.Configuration.Secrets and DefaultAzureCredential in Program.cs. Application code reads secrets through IConfiguration — no Key Vault SDK calls appear in business logic.

**Risk if not done:** Secrets committed to the repository are permanently exposed in git history. Pipeline logs can also inadvertently print secrets if echo or debug logging is enabled.

>_Secret rotation is handled manually as of now. If a secret needs to be rotated, the new value is updated directly in Key Vault and the Container App picks it up on next restart without any code change or redeployment._

---

### 5.2 Managed Identity and RBAC (Least Privilege)

**Decision:** Each Container App uses a system-assigned Managed Identity with only the minimum required roles.

| Identity | Role | Scope | Reason |
|---|---|---|---|
| ca-frontend-prod | AcrPull | deploymentdnyamosacr | Pull frontend image from ACR |
| workoutapp-api | AcrPull | deploymentdnyamosacr | Pull API image from ACR |
| workoutapp-api | Key Vault Secrets User | kv-dynamos-workout | Read secrets at runtime |
| user-api | AcrPull | deploymentdnyamosacr | Pull API image from ACR |
| user-api | Key Vault Secrets User | kv-dynamos-workout | Read secrets at runtime |
| GitHub Actions SP | Contributor (scoped) | deployment-dynamos-rg | Deploy new revisions |

**Matters because:** If any Container App is compromised, the attacker's blast radius is limited to what that specific identity can access. No identity has Owner or broad Contributor rights on the subscription.

---

### 5.3 CORS

**Decision:** CORS is configured via IConfiguration using double underscore environment variable notation, locked to the specific frontend URL.

```csharp
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
              .WithHeaders("Authorization", "Content-Type")
              .AllowCredentials());
});
```

Production value set as Container App environment variable:
```
Cors__AllowedOrigins__0=https://ca-frontend-prod.wonderfulpebble-02d3e465.italynorth.azurecontainerapps.io
```

**Why not AllowAnyOrigin:** Any website could then make credentialed requests to the API on behalf of a logged-in user, enabling cross-site request forgery attacks.

---

### 5.4 Threat Model

| Attack surface | Threat | Mitigation |
|---|---|---|
| Git repository | Secrets committed in code | Key Vault, .gitignore, no appsettings with real values |
| Pipeline logs | Secrets printed via echo or debug | GitHub Actions masked secrets |
| API endpoints | Unauthenticated access | JWT authentication on all protected endpoints |
| API | Cross-origin requests from malicious sites | CORS locked to specific frontend domain |
| AI endpoint | Prompt injection via user input | Server-side prompt construction, input validation |
| AI endpoint | Groq API key leak | Key stored in Key Vault, never returned to frontend or logged |
| Azure resources | Over-privileged identity | Least privilege RBAC — AcrPull and Key Vault Secrets User only |
| Container Apps | Credential-based ACR access | Managed Identity used for image pulls — no stored credentials |

---

## 6. AI Integration — AiPlanService

### 6.1 Feature Description

The AI feature generates a personalized weekly workout plan based on user-provided parameters:

- Input: Goal (e.g. build muscle), fitness level (beginner/intermediate/advanced), days per week, available equipment
- Output: A structured weekly workout schedule in Swedish with exercises, sets, and reps per day
- Endpoint: POST /api/v1/ai/generate-plan

### 6.2 Technical Decisions

**Provider:** Groq (https://api.groq.com/openai/v1) via the OpenAI-compatible .NET SDK.

**Reasons for choosing Groq over Azure OpenAI:**
- Significantly lower latency due to hardware-optimized LPU inference.
- Free tier available — no shared Azure OpenAI credit concerns.
- OpenAI SDK compatible — switching providers requires only changing the endpoint URL and model name.

**Model:** llama-3.3-70b-versatile

**Reasons:**
- Strong instruction-following for structured output (weekly schedules with sets/reps).
- Reliable Swedish-language generation.
- Available on Groq's free tier with generous rate limits.

**Architecture - Server-Side Only:**
The Groq API key is never sent to the frontend. All AI calls go through AiPlanService on the backend. The frontend receives only the generated plan text.

**DI Registration:** AiPlanService is registered as a singleton to avoid rebuilding the ChatClient on every request.

### 6.3 Error Handling

| Failure | Detection | HTTP response |
|---|---|---|
| Groq timeout (>10s) | CancellationTokenSource | 504 Gateway Timeout |
| Groq rate limit (429) | ClientResultException | 503 Service Unavailable |
| Groq outage (5xx) | ClientResultException | 503 Service Unavailable |
| Missing API key | Startup validation | App fails to start |
| Empty goal/fitness level | Controller validation | 400 Bad Request |

No internal error details or API keys are returned to the client.

### 6.4 Limitations

- Output quality depends on Groq availability, no static fallback plan is currently implemented.
- The 10-second timeout may be too aggressive under high Groq load.
- The model occasionally generates generic plans if input is vague.
- No output validation, the model's response is returned as is without checking structure.

>_Overall the integration works well for the intended use case: Generating structured workout plans with consistent formatting. The main risk is availability dependency on a third-party service with no fallback, which should be one of the first things to address before any production launch beyond the scope of this assignment._

---

## 7. Monitoring and Observability

**Decision:** Container Apps built in logging via the existing Log Analytics workspace (workspace-deploymentdynamosrgGZEw) is used as the primary observability tool.

**Note:** Application Insights (microsoft.insights provider) could not be registered on subscription due to policy restrictions on the Azure for Students subscription. Log Analytics provides equivalent log data and is already wired to the Container Apps Environment.

**What is logged automatically:**
- All HTTP requests (method, path, status code, duration)
- Application stdout/stderr including EF Core query logs
- Container startup and crash events

**How to query logs in the portal:**

Go to workspace-deploymentdynamosrgGZEw -> Logs -> in KQL mode (or equivalent) -> Run command:

```kusto
ContainerAppConsoleLogs_CL
| where ContainerAppName_s in ("workoutapp-api", "user-api")
| order by TimeGenerated desc
| take 50
```

**How to check logs via CLI:**

```bash
az containerapp logs show --name workoutapp-api \
  --resource-group deployment-dynamos-rg \
  --tail 50
```

>_Due to the microsoft.insights provider being blocked on the subscription, full distributed tracing across the request chain is not available. However, individual hops can be correlated manually: the frontend URL and timestamp of a request can be matched against the backend log entry using the time window, and the EF Core SQL log entries immediately following confirm the database dependency call. Groq API calls are visible in the backend stdout logs when the AI endpoint is invoked._

### 7.1 Runbook - How to Debug a Broken Deployment

1. **Check the GitHub Actions pipeline.**<br>
  _Did the test or build job fail? Check the failing step output._

2. **Check Container App logs.**<br>
  _Run the CLI command above or go to Portal -> Container App -> Log stream._

3. **Check Key Vault access.**<br>
  _If the app fails to start with a configuration error, the Managed Identity may have lost its Key Vault Secrets User role. Verify in Portal -> Key Vault -> Access control (IAM)._

4. **Check the image.**<br>
  _Confirm the correct SHA image was pushed to ACR: Portal -> deploymentdnyamosacr -> Repositories._

5. **Rollback.**<br>
  _Redeploy the previous image:_

    ```bash
    az containerapp update --name workoutapp-api \
      --resource-group deployment-dynamos-rg \
      --image deploymentdnyamosacr.azurecr.io/workoutapp-api:<previous-sha>
    ```

---

## 8. Environment Configuration

| Setting | Local | Production |
|---|---|---|
| Database | LocalDB or Docker SQL | Azure SQL - connection string from Key Vault (kv-db-conn) |
| JWT secret | appsettings.Development.json _(Git-ignored)_ | Key Vault (kv-jwt-key) |
| Groq API key | dotnet user-secrets | Key Vault (Groq--ApiKey) |
| CORS origin | http://localhost:3000 | Container App env var (Cors__AllowedOrigins__0) |
| Frontend API URL | config.js with localhost URLs | Generated in CI pipeline from GitHub Actions variables |
| Logging | Console | Log Analytics via Container Apps Environment |

---

## 9. Individual Reflection

### 9.1 What I personally worked on
My primary contributions were in the infrastructure and configuration layer. I worked alongside the team on the frontend containerization (Dockerfile and nginx.conf), troubleshooting and adjusting the GitHub Actions pipeline, and configuring CORS in both backend APIs. Much of my work involved diagnosing and resolving Azure subscription restrictions that blocked our deployment, iterating through CLI and portal approaches to get the Container Apps environment provisioned correctly. Rather than building features from scratch, I focused on making the existing components deployable and ensuring the pieces connected correctly in production.

### 9.2 Obstacles
The biggest obstacles came from the Azure for Students subscription restrictions. I had one subscription that worked well for previous individual assignments, while the second subscription used for the group project had several policy restrictions, which made it difficult to get all resources connected correctly in the same Azure environment.

One example was the Microsoft.App resource provider being listed as available in every region, but a policy silently blocking all Container Apps deployments regardless of region. The CLI returned empty lists when querying existing environments, but still reported the regional limit was exceeded during creation attempt, making it appear like a phantom environment existed. This took significant time to diagnose because the error messages pointed to region restrictions rather than policy blocks. This was solved eventually by trial and error by trying different regions by different group members.

A secondary challenge was accidental double resource groups early on, which led to the container registry being in one resource group while the Container Apps ended up in another. This was resolved by recreating some resources in the correct resource group once we identified why they could not be found in the Azure environment.

### 9.3 What I would do differently in the future
- **Application Insights from the start**<br>
Discovering late that microsoft.insights was blocked on our subscription meant we fell back to Log Analytics, which lacks request correlation and dependency tracking.

- **Fallback in AiPlanService**<br>
Instead of returning a bare 503 when Groq is unavailable, a cached example plan would give users something useful during outages.

- **Higher token limit**<br>
MaxOutputTokenCount is currently 600, which caused some plans to be truncated mid-sentence. Raising it to 1000 would noticeably improve output quality.

- **Integration tests**<br>
The CORS misconfiguration we hit in production would likely have been caught earlier with end-to-end tests running against a real HTTP server, rather than relying solely on unit tests.

### 9.4 How I verified my work end-to-end in production
Tested two complete user flows manually in the deployed application:

- **Flow 1 - Register and login**<br>
  Opened the frontend URL in the browser, registered a new account, logged in with those credentials, and confirmed a JWT was returned and the user was authenticated. Verified the request appeared in the Container Apps log stream for user-api.

- **Flow 2 - AI workout generation**<br>
 While logged in, navigated to the AI workout section, filled in goal, fitness level, days per week and equipment, submitted the form, and confirmed a structured Swedish-language weekly plan was returned from Groq. Verified the dependency call to api.groq.com appeared in the workoutapp-api logs.