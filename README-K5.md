# 💪 Syntax Squad Workout App — K5 Deployment

A fullstack workout web application built with vanilla JavaScript, HTML, and CSS. Users can explore an exercise bank, generate random workouts, create custom routines, and generate AI-powered workout plans.

---

## 🏗 Architecture Overview

### Components
- **Frontend** — Vanilla JS/HTML/CSS, served via nginx in an Azure Container App
- **workoutapp-API** — ASP.NET Core (.NET 9) REST API handling workouts, exercises, and AI plan generation via Groq
- **User-API** — ASP.NET Core (.NET 9) REST API handling user registration, login, and JWT authentication
- **Azure SQL** — Shared database server hosting both WorkoutDb and UserDb
- **Azure Container Registry (ACR)** — `dynamos.azurecr.io` stores all Docker images
- **Azure Key Vault** — `kvstudentnyxuvgloult32` stores all production secrets

### Communication
Browser → ca-frontend (nginx) → serves static JS/HTML/CSS
Browser → workoutapp-API → Azure SQL (WorkoutDb) + Groq AI API
Browser → User-API → Azure SQL (UserDb)

### Production URLs
- **Frontend:** `https://ca-frontend.kinddesert-2500f86d.germanywestcentral.azurecontainerapps.io`
- **workoutapp-API:** `https://workoutapp-api.wonderfulpebble-02d3e465.italynorth.azurecontainerapps.io`
- **User-API:** `https://user-api.wonderfulpebble-02d3e465.italynorth.azurecontainerapps.io`

---

## 🚀 Running Locally

### Prerequisites
- Node.js (for Live Server)
- VS Code with Live Server extension
- .NET 9 SDK
- SQL Server Express (local database)

### Frontend
1. Clone the repo:
```bash
git clone https://github.com/niklaserikssoon/SQ-workoutapp
cd SQ-workoutapp
```
2. Open `index.html` with Live Server in VS Code
3. The frontend will load at `http://127.0.0.1:5500`

### Backend API URLs (local)
The frontend reads API URLs from `scripts/config.js`. For local development update to:
```javascript
const CONFIG = {
  workoutApiUrl: "http://localhost:7002/",
  userApiUrl: "http://localhost:7001/"
};
```
For production these point to the Azure Container App URLs.

---

## ⚙️ CI/CD Pipeline

### Trigger
The pipeline runs automatically on push to `dev` or `main` branches.

### Steps
1. **Checkout** — fetch latest code
2. **Login to ACR** — authenticate to `dynamos.azurecr.io` using GitHub Secrets
3. **Build Docker image** — multi-stage nginx build (`--provenance=false` to avoid manifest issues with Azure Container Apps)
4. **Push image** — tagged with both `latest` and commit SHA for traceability
5. **Azure login** — using service principal stored in `AZURE_CREDENTIALS` secret
6. **Deploy** — update `ca-frontend` Container App with the new image

### GitHub Secrets Required
| Secret | Purpose |
|--------|---------|
| `ACR_USERNAME` | Container Registry username |
| `ACR_PASSWORD` | Container Registry password |
| `AZURE_CREDENTIALS` | Service principal JSON for Azure login |
| `AZURE_RESOURCE_GROUP` | Target resource group (`rg-bicep-student`) |
| `FRONTEND_CONTAINER_APP_NAME` | Container App name (`ca-frontend`) |

---

## 🔐 Secret Management

### Local Development
API URLs are configured in `scripts/config.js`. No secrets are stored in the frontend — authentication tokens are handled by the backend APIs.

### Production
All secrets are stored in **Azure Key Vault** (`kvstudentnyxuvgloult32`):
- `Groq--ApiKey` — AI workout generation
- `Jwt--Key` — JWT signing secret
- `Jwt--Issuer` — JWT issuer
- `Jwt--Audience` — JWT audience
- `ConnectionStrings--WorkoutDb` — Azure SQL connection string
- `ConnectionStrings--DefaultConnection` — Azure SQL connection string for User-API

Backend Container Apps use **System-assigned Managed Identity** with the **Key Vault Secrets User** RBAC role to read secrets at runtime. No secrets are stored in code, environment variables, or pipeline logs.

---

## 📊 Monitoring & Logging

Application Insights and Log Analytics are configured in `rg-bicep-student`. Logs can be viewed in the Azure Portal under the Container App → Log stream, or queried in Log Analytics.

### Runbook — Debugging a Broken Deploy

**Step 1 — Check the GitHub Actions pipeline**
Go to the repo → Actions tab → find the failed run → expand the failing step to see the error message.

**Step 2 — Check the Container App logs**
```bash
az containerapp logs show \
  --name ca-frontend \
  --resource-group rg-bicep-student \
  --follow
```

**Step 3 — Check the container revision**
In Azure Portal → `ca-frontend` → Revisions → check if the latest revision is active and healthy.

**Step 4 — Roll back to previous revision**
In Azure Portal → `ca-frontend` → Revisions → activate the previous working revision.

**Step 5 — Verify ACR image exists**
```bash
az acr repository show-tags --name dynamos --repository frontend
```
If the image tag is missing the Docker build or push failed — check the pipeline logs.

---

## 🤖 AI Feature

### What it does
Users can generate a personalized workout plan using AI. They input their goal, fitness level, days per week, and optional equipment. The app sends this to the `workoutapp-API` which calls the **Groq API** (using the `meta-llama` model) and returns a structured weekly workout plan.

### How it's called
Browser → POST /api/v1/ai/generate-plan (workoutapp-API) → Groq API → response
The request requires a valid JWT token (user must be logged in).

### Security
The Groq API key is stored in **Azure Key Vault** and never exposed to the frontend or logged in the pipeline. The backend reads it at runtime via Managed Identity.

### Error handling
- `401` — User not logged in
- `503` — AI service timed out
- Other errors — Generic error message shown to user

---

## 🧪 Testing
```bash
npm test
```
Tests cover localStorage CRUD operations, exercise filtering, workout generation, and accessibility (jest-axe).

---

## 🔍 Lighthouse Scores

Tested via Chrome DevTools → Lighthouse.

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Home | 100 | 95 | 96 | 90 |
| Exercise Bank | 100 | 100 | 100 | 100 |