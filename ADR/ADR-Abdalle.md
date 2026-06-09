# 🚀 ADR — Deployment and Security Strategy

## 🏋️ WorkoutApp K5 Project

---

## 🎯 Context

The goal of the K5 project was to deploy a fullstack workout application to Azure in a production-like environment. The solution consists of a frontend application, User API, Workout API, Azure SQL Database, Groq AI integration, CI/CD pipelines, Azure Key Vault, and monitoring services.

---

# ☁️ Decision 1: Hosting Platform

## ✅ Decision

Azure Container Apps was chosen as the hosting platform for the backend services.

## 💡 Reasoning

Container Apps provides a scalable and managed environment for running Docker containers while integrating well with Azure services.

## 📈 Consequences

- Consistent deployment environment
- Easy container management
- Integration with Azure services

---

# 🔄 Decision 2: CI/CD Pipeline

## ✅ Decision

GitHub Actions was selected for Continuous Integration and Continuous Deployment.

## ⚙️ Pipeline Steps

1. Checkout repository
2. Build application
3. Run automated tests
4. Build Docker images
5. Push images to Azure Container Registry
6. Deploy to Azure Container Apps

## 📈 Consequences

- Automated deployments
- Faster release process
- Reduced manual errors

---

# 🔐 Decision 3: Secret Management

## ✅ Decision

Azure Key Vault was chosen to store production secrets.

## 💡 Reasoning

Sensitive information such as JWT keys, database connection strings, and AI API keys should not be stored in source code or repositories.

## 📈 Consequences

- Improved security
- Centralized secret management
- Easier credential rotation

---

# 🛡️ Decision 4: Managed Identity and RBAC

## ✅ Decision

Managed Identity and Role-Based Access Control (RBAC) were implemented.

## 💡 Reasoning

The application can securely access Azure resources without storing credentials in configuration files.

## 📈 Consequences

- No hardcoded credentials
- Principle of least privilege
- Better security posture

---

# 📊 Decision 5: Monitoring and Logging

## ✅ Decision

Azure Monitor and Application Insights were enabled.

## 💡 Reasoning

Production systems require visibility into application health, requests, and errors.

## 📈 Consequences

- Easier troubleshooting
- Centralized logging
- Performance monitoring

---

# 🔗 Decision 6: Frontend and Backend Integration

## ✅ Decision

The frontend communicates with User API and Workout API through configured endpoints.

## 💡 Reasoning

Separating frontend and backend allows independent deployment and maintenance.

## 📈 Consequences

- Better maintainability
- Easier deployments
- Clear separation of responsibilities

---

# 🤖 Decision 7: AI Integration

## ✅ Decision

Groq AI was integrated into the Workout API to generate personalized workout plans.

## 💡 Reasoning

The AI feature provides dynamic workout recommendations based on user input.

## 📈 Consequences

- Enhanced user experience
- Personalized workout generation
- Secure API access through Key Vault

---

# 📚 Resources

- Azure Container Apps
- Azure Container Registry (ACR)
- Azure Key Vault
- Managed Identity
- GitHub Actions
- Azure SQL Database
- Azure Monitor
- Application Insights
- Groq AI

---

## 📄 Document Information

**👤 Author**  
Abdalle Abdulkadir

**📅 Date**  
2026-06-09

**📌 Status**  
Accepted
