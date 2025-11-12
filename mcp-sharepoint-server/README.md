# RMM MCP SharePoint Server

Microsoft Graph API Bridge for SharePoint integration.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

### 3. Mode Développement (Mock Data)

Par défaut, le serveur utilise des données fictives pour le développement.

Éditez `.env` et assurez-vous que :
```env
USE_MOCK_DATA=true
```

Démarrez le serveur :
```bash
npm start
```

### 4. Mode Production (Real Data)

Une fois que vous avez les credentials Azure AD :

1. Éditez `.env` :
```env
AZURE_TENANT_ID=votre-tenant-id
AZURE_CLIENT_ID=votre-client-id
AZURE_CLIENT_SECRET=votre-client-secret
SHAREPOINT_SITE_URL=https://reachbcp1.sharepoint.com/sites/Dynamics365ProjectTeam
USE_MOCK_DATA=false
```

2. Redémarrez le serveur :
```bash
npm start
```

## 📡 Endpoints

- `GET /health` - Health check
- `GET /api/sharepoint/site` - Get site information
- `GET /api/sharepoint/documents` - List documents
- `GET /api/sharepoint/documents/:id` - Get specific document
- `POST /api/sharepoint/upload` - Upload a document
- `POST /api/sharepoint/folders` - Create a folder
- `GET /api/mcp/tools` - List available tools

## 🔑 Obtenir les Credentials Azure AD

Contactez votre administrateur Azure AD et demandez-lui de créer une **App Registration** avec :

**Permissions Microsoft Graph (Application) :**
- `Sites.Read.All`
- `Files.Read.All`
- `Sites.ReadWrite.All` (si upload nécessaire)
- `Files.ReadWrite.All` (si upload nécessaire)

**Informations nécessaires :**
- Application (client) ID
- Directory (tenant) ID
- Client Secret

## 📚 Documentation

Voir [AI_INTEGRATION.md](../AI_INTEGRATION.md) pour la documentation complète.

## 🧪 Test

```bash
# Health check
curl http://localhost:3002/health

# Get site info
curl http://localhost:3002/api/sharepoint/site

# List documents
curl http://localhost:3002/api/sharepoint/documents
```
