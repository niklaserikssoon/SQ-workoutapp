# ADR Documentation / System Design
**Author:** Robin Markström
**Date:** 2026-06-10
**Project:** Deployment Dynamos Workout App (K5-Projekt i team)

---

## 1. Context

As part of the K5 group project, the team needed to further develop and deploy a full-stack application to Azure in a production-like approach. The application consists of two backend APIs (User-API and Workoutapp-API) and a vanilla HTML/CSS/JS frontend.

This document describes the design decisions made regarding hosting, CI/CD pipeline, security, Key Vault, monitoring and AI integration.

Production URLs:
- Frontend: https://ca-frontend-prod.wonderfulpebble-02d3e465.italynorth.azurecontainerapps.io/
- Workout API: https://workoutapp-api.wonderfulpebble-02d3e465.italynorth.azurecontainerapps.io
- User API: https://user-api.wonderfulpebble-02d3e465.italynorth.azurecontainerapps.io

---

## 2. Hosting Decisions

### 2.1 Backend - Azure Container Apps

**Decision:** Both APIs are hosted on Azure Container Apps.

**Reasoning:**
- Support of Docker containers directly without having to manage servers or Kubernetes.
- Able to reduce costs by scaling down when app is idle, saving subscription credits.
- Scales automatically based on demand.
- It supports Managed Identity, which makes Key Vault access more secure.

**Alternatives considered:**
- Azure App Service: Less flexiable for containerized workloads.
- More expensive at scale.

---

### 2.2 Frontend - Azure Container Apps (Nginx)

**Decision:** Frontend is deployed as a separate Container App using Nginx to serve the static HTML, CSS and JavaScript files.

**Initial plan:** Azure Static Web Apps was originally considerd to be used due to being made for this type of frontend and it's simple deployment support. This could not be used however because our school’s Azure for Students subscription did not allow the Microsoft.Web resource provider.

**Reasoning:**
- Could be added to the Container Apps Enviroment that was already set up.
- Supports of caching and routing for single page applications.
- This solution also shows that we can package and run the frontend as a container, which matches the containerization part of the assignment.

---

## 2.3 Container Registry - deploymentdnyamosacr (ACR)

**Decision:** Docker images are built in GitHub Actions and then deployed to the Azure Container Registry.

**Reasoning:**
- Keeps Docker images close to the rest of the Azure resources, which makes the deployment flow smoother since Container Apps can pull images directly from ACR.
- Each image is tagged with both 'latest' and the Git commit SHA, which provides full traceability.

---

### 2.4 Database - Azure SQL (deployment-dynamos-sql / WorkoutDb)

**Decision:** Azure SQL Database is used as the database for both APIs together with Entity Framework Core.

**Reasoning:**
- Azure SQL fits the project needs, because the application stores relational data, such as users, workouts and exercises.
- Managed database service, we do not need to handle or maintain the database server ourselves.
- 

---

## 3. CI/CD Pipeline

**Decision:** GitHub Actions with separate workflows per repo

**Reasoning:**
- Native integration with the repositories.
- Secrests are stored as GitHub Actions secrets, no leak of secrets on code or logs.
- Automation reduces the risk of manual errors.

### Pipeline steps

1. Code pushed to GitHub
2. Tests are executed
3. Docker image is built
4. Built Docker image is pushed to Azure Container Registry
5. Azure Container App is updated

---

## 4. Security Strategy

### 4.1 Secret Management - Azure Key Vault (kv-dynamos-workout)

**Decision:** Secrets are stored outside the application

**Reasoning:**
- Sensitive information should never be hardcoded in the source data.
- Nothing sensitive exists in appsettings.json, committed config files, or pipeline logs.

**Authentication:** The application is using JWT tokens for Authentication. Whenever a user is being logged in a token is generated and included in a subsequent API request.
Protected features such as AI-generated workouts plans or being able to add a exercise from the exercise bank to already created workout plan requires a valid token and can therefore only be accessed by authenticated users.


### Security Measures
- HTTPS
- RBAC
- Managed Identity
- GitHub Actions
- Azure Key Vault
- JWT authentication


---

## 5. Monitoring

**Decision:** Azure Application Insights is being used for monitoring.

**Reasoning:**
- Provides visibility into performance, errors, and application usage.

### Data being monitored
- Availability
- Requests
- Response Time
- Exceptions (error handling)

---

## 6. AI Integration

**Decision:** Groq is being used to generate workout plans.

**Reasoning:**
- Groq offers are free tier and simple API solution.
- Based on testing, we concluded the free version of Groq was sufficient for our intended use.

### Groq flow
1. User submits a request in the application
2. Backend recevies and processes the request
3. A request is sent to the Groq API
4. Groq generates a reponse based on the users input 
5. A response is returned to the user and displayed in the interface of the application

### Groq Security
- All communication takes place over HTTPS.
- API key is never exposed to the frontend.
- Groq API key is stored in Azure Key Vault and only backend has access to the Groq API.

# Summary

## Summary

The project was deployed as a full-stack application in Azure with two backend APIs, a frontend, Azure SQL, Azure Container Registry, Key Vault, GitHub Actions and Application Insights.

Azure Container Apps was used for both the APIs and the frontend because it supports Docker containers, automatic scaling and Managed Identity. Since Azure Static Web Apps was not available in the school subscription, the frontend was instead hosted in an Nginx container.

GitHub Actions handles the CI/CD process by running tests, building Docker images, pushing them to ACR and updating the Container Apps. Secrets are stored securely in Azure Key Vault, while JWT authentication protects features that require a logged-in user.

Application Insights is used for monitoring, and Groq is integrated to generate workout plans. Overall, the solution shows containerization, cloud deployment, secure secret handling, monitoring and AI integration.
















