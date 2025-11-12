# 🤖 Intégration IA - Azure OpenAI + MCP + Azure DevOps

Ce document explique l'intégration complète de l'IA dans le projet RMM pour la génération automatique de rapports CR MEP.

---

## 📋 Table des Matières

- [Vue d'Ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [API Endpoints](#-api-endpoints)
- [MCP Server](#-mcp-server)
- [Frontend Integration](#-frontend-integration)
- [Exemples](#-exemples)
- [Dépannage](#-dépannage)

---

## 🎯 Vue d'Ensemble

L'intégration IA permet de :

1. **Générer automatiquement des rapports CR MEP** à partir de données Azure DevOps
2. **Compléter des sections spécifiques** d'un rapport en cours de rédaction
3. **Dialoguer avec un assistant IA** pour obtenir de l'aide sur les rapports
4. **Récupérer automatiquement les données** d'Azure DevOps via MCP

### Technologies Utilisées

- **Azure OpenAI** (GPT-4) - Génération de contenu
- **MCP (Model Context Protocol)** - Récupération de données Azure DevOps
- **Azure DevOps REST API** - Source de données
- **Node.js** - Serveur MCP
- **.NET 8** - Backend API
- **React 19** - Frontend

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Create Page │  │   Edit Page  │      │
│  │     Chat     │  │     Chat     │  │     Chat     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────┼──────────────────────────────────┐
│                    Backend (.NET 8)                          │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐     │
│  │            AIController                             │     │
│  │  /api/ai/generate-report                           │     │
│  │  /api/ai/complete-section                          │     │
│  │  /api/ai/chat                                       │     │
│  └────────────┬──────────────────────┬─────────────────┘     │
│               │                      │                       │
│  ┌────────────▼──────────┐  ┌───────▼──────────┐           │
│  │   OpenAIService       │  │   MCPService     │           │
│  │  (Azure OpenAI)       │  │  (MCP Client)    │           │
│  └────────────┬──────────┘  └───────┬──────────┘           │
│               │                      │                       │
└───────────────┼──────────────────────┼───────────────────────┘
                │                      │ HTTP
                │ Azure OpenAI API     │
                │                      │
┌───────────────▼──────────┐  ┌───────▼──────────────────────┐
│   Azure OpenAI           │  │   MCP Server (Node.js)       │
│   (GPT-4)                │  │                              │
│                          │  │  ┌────────────────────────┐  │
│                          │  │  │  Azure DevOps Service  │  │
│                          │  │  └──────────┬─────────────┘  ���
└──────────────────────────┘  └─────────────┼────────────────┘
                                            │
                              ┌─────────────▼────────────────┐
                              │   Azure DevOps REST API      │
                              │  (Work Items, Builds, Tests) │
                              └──────────────────────────────┘
```

---

## ⚙️ Configuration

### 1. Azure OpenAI

#### Créer une ressource Azure OpenAI

1. Allez sur le [portail Azure](https://portal.azure.com)
2. Créez une ressource **Azure OpenAI**
3. Déployez un modèle **GPT-4** ou **GPT-4 Turbo**
4. Notez :
   - **Endpoint** : `https://YOUR-RESOURCE-NAME.openai.azure.com/`
   - **API Key** : Trouvée dans "Keys and Endpoint"
   - **Deployment Name** : Nom que vous avez donné au déploiement

#### Configurer dans le Backend

Éditez `backend/src/CRMEPReport.API/appsettings.json` :

```json
{
  "OpenAI": {
    "Endpoint": "https://YOUR-RESOURCE-NAME.openai.azure.com/",
    "ApiKey": "YOUR-AZURE-OPENAI-API-KEY",
    "DeploymentName": "gpt-4",
    "MaxTokens": 4000,
    "Temperature": 0.7
  }
}
```

**⚠️ IMPORTANT : Ne committez JAMAIS l'API Key !**

Pour la production, utilisez **Azure Key Vault** ou **User Secrets** :

```bash
cd backend/src/CRMEPReport.API
dotnet user-secrets set "OpenAI:ApiKey" "YOUR-API-KEY"
```

### 2. Azure DevOps

#### Créer un Personal Access Token (PAT)

1. Allez sur Azure DevOps : `https://dev.azure.com/YOUR-ORG`
2. Cliquez sur votre profil → **Personal Access Tokens**
3. Créez un nouveau token avec les permissions :
   - **Work Items** : Read
   - **Build** : Read
   - **Test Management** : Read
4. Copiez le token (vous ne pourrez plus le voir après)

#### Configurer le MCP Server

1. Allez dans le dossier `mcp-server`
2. Copiez `.env.example` vers `.env` :

```bash
cd mcp-server
copy .env.example .env
```

3. Éditez `.env` :

```env
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/YOUR-ORGANIZATION
AZURE_DEVOPS_PAT=YOUR-PERSONAL-ACCESS-TOKEN
AZURE_DEVOPS_PROJECT=YOUR-PROJECT-NAME
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

#### Configurer dans le Backend

Éditez `backend/src/CRMEPReport.API/appsettings.json` :

```json
{
  "MCP": {
    "ServerUrl": "http://localhost:3001",
    "Enabled": true,
    "TimeoutSeconds": 30,
    "Organization": "YOUR-AZURE-DEVOPS-ORG",
    "Project": "YOUR-AZURE-DEVOPS-PROJECT"
  }
}
```

### 3. Installation des Dépendances

#### Backend

```bash
cd backend
dotnet restore
dotnet build
```

Les packages suivants seront installés :
- `Azure.AI.OpenAI` (2.1.0)
- `Microsoft.Extensions.Http` (8.0.1)
- `System.Text.Json` (8.0.5)

#### MCP Server

```bash
cd mcp-server
npm install
```

Les packages suivants seront installés :
- `@modelcontextprotocol/sdk` (^1.0.4)
- `azure-devops-node-api` (^14.1.0)
- `express` (^4.21.2)
- `cors` (^2.8.5)
- `dotenv` (^16.4.7)

---

## 🚀 Utilisation

### Démarrage

#### 1. Démarrer le MCP Server

```bash
cd mcp-server
npm start
```

Vous devriez voir :
```
╔═══════════════════════════════════════════════════════════╗
║           RMM MCP Server - Azure DevOps Bridge           ║
╠═══════════════════════════════════════════════════════════╣
║  Status: Running                                          ║
║  Port: 3001                                               ║
╚══════��════════════════════════════════════════════════════╝
```

#### 2. Démarrer le Backend

```bash
cd backend/src/CRMEPReport.API
dotnet run
```

Ou utilisez le script global :
```bash
start.bat
```

#### 3. Démarrer le Frontend

```bash
cd frontend
npm run dev
```

### Vérification

Testez que tout fonctionne :

1. **MCP Server** : http://localhost:3001/health
2. **Backend API** : http://localhost:5154/swagger
3. **Frontend** : http://localhost:3000

---

## 📡 API Endpoints

### Génération de Rapport

**POST** `/api/ai/generate-report`

Génère un rapport complet à partir d'un prompt en langage naturel.

**Request :**
```json
{
  "prompt": "La MEP de la 12.0.8 est terminée, génère moi le CR MEP stp",
  "version": "12.0.8",
  "includeAzureDevOpsData": true
}
```

**Response :**
```json
{
  "reportDataJson": "{\"titre\":\"...\",\"version\":\"12.0.8\",...}",
  "suggestedPackage": "Package_12.0.8",
  "suggestedSprint": "Sprint 45",
  "suggestedDeploymentDate": "2024-01-15T10:00:00Z",
  "azureDevOpsContext": { ... },
  "model": "gpt-4",
  "tokensUsed": 1250
}
```

### Complétion de Section

**POST** `/api/ai/complete-section`

Complète ou améliore une section spécifique d'un rapport.

**Request :**
```json
{
  "reportId": "2024_Sprint_45_Package_12.0.8",
  "sectionName": "conclusion",
  "currentContent": "La mise en production s'est bien déroulée...",
  "instruction": "Remplie moi la conclusion du rapport",
  "includeAzureDevOpsContext": true
}
```

**Response :**
```json
{
  "content": "La mise en production de la version 12.0.8 s'est déroulée avec succès...",
  "model": "gpt-4",
  "tokensUsed": 450
}
```

### Chat

**POST** `/api/ai/chat`

Dialogue conversationnel avec l'assistant IA.

**Request :**
```json
{
  "message": "Quels sont les bugs corrigés dans la version 12.0.8 ?",
  "history": [
    {
      "role": "user",
      "content": "Bonjour",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Bonjour ! Comment puis-je vous aider ?",
      "timestamp": "2024-01-15T10:00:01Z"
    }
  ],
  "reportId": "2024_Sprint_45_Package_12.0.8"
}
```

**Response :**
```json
{
  "message": "Dans la version 12.0.8, 3 bugs ont été corrigés : ...",
  "suggestedActions": [
    {
      "type": "generate_report",
      "label": "Générer le rapport",
      "parameters": {}
    }
  ],
  "model": "gpt-4",
  "tokensUsed": 320
}
```

### Chat Streaming

**POST** `/api/ai/chat/stream`

Streaming de la réponse du chat en temps réel (Server-Sent Events).

**Request :** Identique à `/api/ai/chat`

**Response :** Stream SSE
```
data: La
data:  version
data:  12.0.8
data:  contient
...
```

### Azure DevOps Context

**GET** `/api/ai/devops/release/{version}`

Récupère le contexte Azure DevOps pour une version.

**Response :**
```json
{
  "release": {
    "version": "12.0.8",
    "sprint": "Sprint 45",
    "releaseDate": "2024-01-15T10:00:00Z",
    "status": "Completed",
    "packages": ["Package_12.0.8"]
  },
  "workItems": [
    {
      "id": 12345,
      "title": "Implement feature X",
      "type": "Feature",
      "state": "Done",
      "assignedTo": "John Doe",
      "description": "...",
      "completedDate": "2024-01-14T15:00:00Z",
      "tags": ["feature", "high-priority"]
    }
  ],
  "tests": {
    "totalTests": 150,
    "passedTests": 148,
    "failedTests": 2,
    "skippedTests": 0,
    "passRate": 98.67
  },
  "deployment": {
    "environment": "Production",
    "deploymentDate": "2024-01-15T10:00:00Z",
    "status": "Success",
    "deployedBy": "DevOps Pipeline",
    "environments": ["DEV", "QA", "UAT", "PROD"]
  }
}
```

**GET** `/api/ai/devops/sprint/{sprint}`

Récupère le contexte pour un sprint.

**GET** `/api/ai/mcp/health`

Vérifie la santé du serveur MCP.

**GET** `/api/ai/mcp/tools`

Liste les outils MCP disponibles.

---

## 🔧 MCP Server

### Architecture

Le serveur MCP est un serveur Node.js qui fait le pont entre le backend .NET et Azure DevOps.

### Endpoints MCP

#### Health Check

**GET** `/health`

```json
{
  "status": "healthy",
  "service": "RMM MCP Server",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### Execute Tool

**POST** `/api/mcp/execute`

```json
{
  "tool": "get_release_context",
  "parameters": {
    "version": "12.0.8"
  }
}
```

#### Custom Query

**POST** `/api/mcp/query`

```json
{
  "query": "Get all work items for release 12.0.8"
}
```

#### Available Tools

**GET** `/api/mcp/tools`

```json
[
  "get_release_context",
  "get_sprint_context",
  "get_work_items"
]
```

### Outils MCP Disponibles

#### 1. get_release_context

Récupère le contexte complet d'une release.

**Paramètres :**
- `version` (string, required) : Version de la release

**Retourne :**
- Release info
- Work items
- Test results
- Deployment info

#### 2. get_sprint_context

Récupère le contexte d'un sprint.

**Paramètres :**
- `sprint` (string, required) : Nom du sprint

**Retourne :**
- Sprint info
- Work items du sprint

#### 3. get_work_items

Récupère des work items spécifiques.

**Paramètres :**
- `ids` (array, required) : IDs des work items

**Retourne :**
- Liste des work items

### Logs

Le serveur MCP log toutes les opérations :

```
[MCP] Executing tool: get_release_context { version: '12.0.8' }
[Azure DevOps] Fetching release context for version: 12.0.8
[Azure DevOps] Successfully fetched context for version: 12.0.8
[Azure DevOps] Found 15 work items
```

---

## 💻 Frontend Integration

### Services

Le frontend utilise un service AI pour communiquer avec le backend :

```typescript
// src/services/ai/ai.service.ts
class AIService {
  async generateReport(request: GenerateReportRequest): Promise<GenerateReportResponse>
  async completeSection(request: CompleteSectionRequest): Promise<CompleteSectionResponse>
  async chat(request: ChatRequest): Promise<ChatResponse>
  streamChat(request: ChatRequest): AsyncGenerator<string>
}
```

### Hooks

Des hooks React personnalisés facilitent l'utilisation :

```typescript
// src/hooks/useAI.ts
const { generateReport, isGenerating } = useAIGeneration();
const { completeSection, isCompleting } = useAICompletion();
const { sendMessage, messages, isTyping } = useAIChat();
```

### Composants

#### Chat Dashboard

Le chat du dashboard est déjà implémenté dans :
`src/components/dashboard/chat/chat-ai.tsx`

Il suffit de remplacer la fonction `handleSubmit` pour appeler le vrai service AI.

#### Chat Create/Edit

À ajouter dans les pages `cr-mep/create` et `cr-mep/edit` :

```typescript
<AIAssistant
  reportId={reportId}
  currentData={reportData}
  onSectionComplete={(section, content) => {
    // Mettre à jour la section
  }}
  onReportGenerate={(reportData) => {
    // Remplir le formulaire
  }}
/>
```

---

## 📝 Exemples

### Exemple 1 : Génération Complète

**Utilisateur :** "La MEP de la 12.0.8 est terminée, génère moi le CR MEP stp"

**Système :**
1. Appelle `/api/ai/generate-report`
2. Le backend appelle le MCP Server pour récupérer les données Azure DevOps
3. Le backend envoie tout à Azure OpenAI
4. Azure OpenAI génère le rapport complet
5. Le rapport est retourné au frontend
6. Le frontend affiche le rapport ou redirige vers la page de création pré-remplie

### Exemple 2 : Complétion de Section

**Utilisateur :** "Remplie moi la conclusion du rapport"

**Système :**
1. Appelle `/api/ai/complete-section` avec `sectionName: "conclusion"`
2. Le backend récupère le contexte Azure DevOps
3. Azure OpenAI génère la conclusion
4. La conclusion est insérée dans le champ correspondant

### Exemple 3 : Chat Contextuel

**Utilisateur :** "Quels bugs ont été corrigés ?"

**Système :**
1. Appelle `/api/ai/chat`
2. Le backend analyse le contexte (rapport en cours, historique)
3. Azure OpenAI répond avec les informations des work items
4. La réponse est affichée dans le chat

---

## 🔍 Dépannage

### MCP Server ne démarre pas

**Problème :** `Error: Cannot find module 'azure-devops-node-api'`

**Solution :**
```bash
cd mcp-server
npm install
```

### Backend ne peut pas se connecter au MCP Server

**Problème :** `Failed to connect to MCP server`

**Solution :**
1. Vérifiez que le MCP Server est démarré : http://localhost:3001/health
2. Vérifiez la configuration dans `appsettings.json` :
   ```json
   "MCP": {
     "ServerUrl": "http://localhost:3001",
     "Enabled": true
   }
   ```

### Azure OpenAI retourne une erreur 401

**Problème :** `Unauthorized`

**Solution :**
1. Vérifiez que l'API Key est correcte dans `appsettings.json`
2. Vérifiez que l'Endpoint est correct
3. Vérifiez que le déploiement existe dans Azure

### Azure DevOps retourne une erreur 401

**Problème :** `Unauthorized`

**Solution :**
1. Vérifiez que le PAT est valide et non expiré
2. Vérifiez que le PAT a les bonnes permissions (Work Items: Read, Build: Read, Test: Read)
3. Vérifiez l'URL de l'organisation dans `.env`

### Pas de données Azure DevOps

**Problème :** Le MCP Server retourne des données vides

**Solution :**
1. Vérifiez que le projet existe dans Azure DevOps
2. Vérifiez que des work items existent avec les tags/versions recherchés
3. Consultez les logs du MCP Server pour voir les requêtes

### Timeout lors de la génération

**Problème :** `Request timeout`

**Solution :**
1. Augmentez le timeout dans `appsettings.json` :
   ```json
   "MCP": {
     "TimeoutSeconds": 60
   }
   ```
2. Réduisez `MaxTokens` dans la configuration OpenAI
3. Vérifiez votre quota Azure OpenAI

---

## 🎯 Prochaines Étapes

### Phase 1 : Intégration Frontend (À faire)

1. Créer le service AI frontend (`src/services/ai/ai.service.ts`)
2. Créer les hooks (`src/hooks/useAI.ts`)
3. Intégrer dans le chat dashboard
4. Créer le composant AIAssistant pour create/edit

### Phase 2 : Améliorations

1. Ajouter le cache des données Azure DevOps
2. Implémenter le retry automatique
3. Ajouter des métriques et monitoring
4. Améliorer les prompts avec des exemples

### Phase 3 : Fonctionnalités Avancées

1. Génération de graphiques et métriques
2. Suggestions d'améliorations automatiques
3. Détection d'anomalies dans les rapports
4. Export PDF avec mise en forme IA

---

## 📚 Ressources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Azure DevOps REST API](https://learn.microsoft.com/en-us/rest/api/azure/devops/)
- [GPT-4 Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)

---

**✨ L'intégration IA est maintenant prête à être utilisée !**

Pour toute question ou problème, consultez les logs ou créez une issue sur le repository.
