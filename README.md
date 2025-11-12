# RMM - Report Management Module

Application fullstack moderne pour la gestion des rapports de Compte Rendu de Mise En Production (CR MEP).

---

## 📋 Table des Matières

- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Démarrage](#-démarrage)
- [Utilisation](#-utilisation)
- [Architecture](#-architecture)
- [Intégration IA](#-intégration-ia)
- [Dépendances](#-dépendances)
- [Problèmes Courants](#-problèmes-courants)
- [Configuration](#-configuration)

---

## 🚀 Technologies

### Frontend
- **React 19.0.0** - Dernière version stable
- **Next.js 15.5.6** - Framework React avec SSR
- **TypeScript 5.6** - Typage statique
- **Tailwind CSS 3.4** - Framework CSS utilitaire
- **@react-three/fiber 9.4.0** - Animations 3D (composant Silk)
- **TipTap 2.10.0** - Éditeur de texte riche
- **Framer Motion** - Animations fluides
- **Lottie React** - Animations Lottie
- Support multilingue (FR/EN)
- Thème sombre/clair

### Backend
- **.NET 8.0** - Framework backend
- **C#** - Langage de programmation
- **Entity Framework Core 8.0.11** - ORM
- **SQL Server** - Base de données
- **Swashbuckle** - Documentation Swagger/OpenAPI
- Architecture RESTful
- Versioning automatique des rapports

---

## 📋 Prérequis

Avant de commencer, installez ces logiciels :

### 1. Node.js (LTS)
- **Version requise :** v18.0.0 ou supérieur (v20.x recommandé)
- **Téléchargement :** https://nodejs.org/
- **Vérification :** Ouvrez un terminal et tapez :
  ```bash
  node --version
  npm --version
  ```

### 2. .NET SDK
- **Version requise :** 8.0 ou supérieur
- **Téléchargement :** https://dotnet.microsoft.com/download
- **Vérification :**
  ```bash
  dotnet --version
  ```

### 3. Git (optionnel)
- **Téléchargement :** https://git-scm.com/
- **Vérification :**
  ```bash
  git --version
  ```

### 4. SQL Server (optionnel pour développement)
- **SQL Server Express** ou **LocalDB** suffit
- Inclus avec Visual Studio ou téléchargeable séparément

---

## 🔧 Installation

### Étape 1 : Obtenir le Projet

Si vous avez Git :
```bash
git clone <url-du-repo>
cd rmm
```

Sinon, décompressez l'archive du projet et ouvrez un terminal dans le dossier.

### Étape 2 : Installer les Dépendances

**Exécutez simplement :**
```bash
install.bat
```

Ce script va :
- ✅ Vérifier que Node.js et .NET sont installés
- ✅ Nettoyer les anciennes installations
- ✅ Installer **635 packages npm** pour le frontend (2-5 minutes)
- ✅ Restaurer et compiler le backend .NET

**Durée totale :** 2-5 minutes selon votre connexion internet

---

## ▶️ Démarrage

### Démarrer l'Application

**Exécutez simplement :**
```bash
start.bat
```

Ce script va :
- 🚀 Démarrer le backend sur **http://localhost:5154**
- 🚀 Démarrer le frontend sur **http://localhost:3000**

Deux fenêtres de terminal s'ouvriront (Backend et Frontend).

### Accéder à l'Application

Ouvrez votre navigateur sur :
- **Application :** http://localhost:3000
- **API Swagger :** http://localhost:5154/swagger

### Arrêter l'Application

**Option 1 :** Fermez les deux fenêtres de terminal (Backend et Frontend)

**Option 2 :** Exécutez :
```bash
stop.bat
```

---

## 🎯 Utilisation

### Créer un Nouveau Rapport

1. Cliquez sur **"Générer un document"** dans le dashboard
2. Sélectionnez **"CR Mise en Production"**
3. Remplissez les champs du template
4. Cliquez sur **"Enregistrer"**

### Modifier un Rapport

1. Accédez à **Documents**
2. Double-cliquez sur un rapport ou utilisez le bouton **"Modifier"**
3. Modifiez les champs nécessaires
4. Sauvegardez vos modifications

### Prévisualiser un Rapport

- Depuis Documents : cliquez sur le bouton **"Voir"**
- Depuis Create/Edit : cliquez sur le bouton **"Aperçu"**

### Exporter un Rapport

1. Ouvrez un rapport en mode édition
2. Cliquez sur **"Exporter"**
3. Choisissez le format (PDF ou HTML)

---

## 📁 Architecture

### Structure du Projet

```
rmm/
├── frontend/                    # Application Next.js (React 19)
│   ├── src/
│   │   ├── app/                # Pages Next.js (App Router)
│   │   ├── components/         # Composants React
│   │   ├── services/           # Services API
│   │   ├── contexts/           # Contextes React
│   │   └── i18n/               # Internationalisation
│   ├── public/                 # Fichiers statiques
│   ├── package.json            # Dépendances (635 packages)
│   └── node_modules/           # Créé après install
│
├── backend/                     # API .NET 8
│   ├── src/
│   │   └── CRMEPReport.API/
│   │       ├── Controllers/    # Contrôleurs API
│   │       ├── Services/       # Logique métier
│   │       ├── Models/         # Modèles de données
│   │       ├── Data/           # Contexte EF Core
│   │       └── Migrations/     # Migrations DB
│   └── CRMEPReport.sln         # Solution Visual Studio
│
├── Rapports/                    # Rapports générés (créé auto)
├── install.bat                  # Script d'installation
├── start.bat                    # Script de démarrage
├── stop.bat                     # Script d'arrêt
└── README.md                    # Ce fichier
```

### Stockage des Rapports

Les rapports sont stockés dans une structure de dossiers :

```
Rapports/
└── {année}/
    └── Sprint_{sprint}/
        └── Rapport_MEP_{package}/
            ├── metadata.json
            ├── data.json
            ├── rapport_mep_{package}.html
            ├── changelog.jsonl
            └── versions/
                └── data_v{version}_{timestamp}.json
```

---

## 🤖 Intégration IA

### Vue d'Ensemble

Le projet intègre **Azure OpenAI (GPT-4)** et **Azure DevOps** via **MCP (Model Context Protocol)** pour :

- ✅ **Générer automatiquement des rapports CR MEP** à partir de données Azure DevOps
- ✅ **Compléter des sections spécifiques** d'un rapport en cours
- ✅ **Dialoguer avec un assistant IA** pour obtenir de l'aide
- ✅ **Récupérer automatiquement les données** d'Azure DevOps (work items, tests, déploiements)

### Exemples d'Utilisation

**Génération complète :**
```
Utilisateur : "La MEP de la 12.0.8 est terminée, génère moi le CR MEP stp"
→ L'IA génère un rapport complet avec toutes les sections remplies
```

**Complétion de section :**
```
Utilisateur : "Remplie moi la conclusion du rapport"
→ L'IA complète la section conclusion avec le contexte du rapport
```

**Chat contextuel :**
```
Utilisateur : "Quels bugs ont été corrigés dans cette version ?"
→ L'IA répond avec les informations d'Azure DevOps
```

### Configuration Requise

Pour activer l'intégration IA, vous devez configurer :

1. **Azure OpenAI** - Créer une ressource et déployer GPT-4
2. **Azure DevOps PAT** - Créer un Personal Access Token
3. **MCP Server** - Installer et démarrer le serveur Node.js

### Documentation Complète

📖 **Consultez [AI_INTEGRATION.md](AI_INTEGRATION.md) pour :**
- Architecture détaillée
- Configuration pas à pas
- API Endpoints
- Exemples d'utilisation
- Dépannage

### Démarrage Rapide IA

```bash
# 1. Configurer Azure OpenAI dans appsettings.json
# 2. Configurer Azure DevOps dans mcp-server/.env
# 3. Installer le MCP Server
cd mcp-server
npm install

# 4. Démarrer le MCP Server
npm start

# 5. Démarrer l'application normalement
cd ..
start.bat
```

---

## 📦 Dépendances

### Frontend (635 packages)

**Principales dépendances :**

| Package | Version | Description |
|---------|---------|-------------|
| React | 19.0.0 | Bibliothèque UI |
| Next.js | 15.5.6 | Framework React |
| @react-three/fiber | 9.4.0 | Animations 3D |
| Three.js | 0.171.0 | Bibliothèque 3D |
| TipTap | 2.10.0 | Éditeur riche |
| Tailwind CSS | 3.4.0 | Framework CSS |
| Framer Motion | 11.11.0 | Animations |
| react-hot-toast | 2.4.1 | Notifications |
| html2pdf.js | 0.12.1 | Export PDF |
| axios | 1.7.0 | Client HTTP |

**Extensions TipTap :**
- underline, text-align, link, image
- table, table-row, table-cell, table-header
- task-list, task-item
- text-style, color
- placeholder, code-block-lowlight

### Backend (4 packages)

| Package | Version | Description |
|---------|---------|-------------|
| Entity Framework Core | 8.0.11 | ORM |
| SQL Server Provider | 8.0.11 | Base de données |
| EF Core Tools | 8.0.11 | Outils CLI |
| Swashbuckle | 6.4.0 | Swagger/OpenAPI |

---

## ❓ Problèmes Courants

### ❌ Erreur : "Node.js n'est pas installé"

**Solution :**
1. Installez Node.js depuis https://nodejs.org/
2. Redémarrez votre terminal
3. Vérifiez : `node --version`

### ❌ Erreur : ".NET SDK n'est pas installé"

**Solution :**
1. Installez .NET 8 SDK depuis https://dotnet.microsoft.com/download
2. Redémarrez votre terminal
3. Vérifiez : `dotnet --version`

### ❌ Erreur pendant npm install

**Solution :**
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
```

### ❌ Port 3000 ou 5154 déjà utilisé

**Solution pour le port 3000 :**
Next.js utilisera automatiquement le port 3001 ou 3002.

**Solution pour le port 5154 :**
```bash
# Trouver le processus
netstat -ano | findstr :5154

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

### ❌ Erreur Backend "Accès refusé" (Win32Exception)

**Problème :** L'antivirus bloque l'exécution du fichier `.exe` du backend

**Solution :** Le script `start.bat` utilise automatiquement `dotnet` sur la DLL au lieu de l'exe, ce qui contourne le problème.

**Si le problème persiste :**
Ajoutez une exception dans votre antivirus pour le dossier `C:\Dev\rmm\backend\`

### ⚠️ Avertissement SSL (Google Fonts)

**Message :**
```
Failed to download Source Sans 3 from Google Fonts
```

**C'est normal !** Sur le réseau d'entreprise, le certificat SSL bloque Google Fonts. L'application utilisera une police de secours. Cela n'affecte pas le fonctionnement.

### ⚠️ Avertissement NODE_TLS_REJECT_UNAUTHORIZED

**Message :**
```
Warning: Setting NODE_TLS_REJECT_UNAUTHORIZED to '0' makes TLS connections insecure
```

**C'est normal en développement !** Nécessaire pour contourner le certificat SSL d'entreprise.

---

## 🔧 Configuration

### Variables d'Environnement (Frontend)

Le fichier `.env.local` est créé automatiquement dans `frontend/` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5154
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Configuration Backend

Modifiez `backend/src/CRMEPReport.API/appsettings.json` si nécessaire :

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CRMEPReportDb;Trusted_Connection=true"
  },
  "ReportsPath": "../../../Rapports"
}
```

### Ports

- **Frontend :** 3000 (ou 3001 si occupé)
- **Backend :** 5154

Pour changer le port backend, modifiez :
`backend/src/CRMEPReport.API/Properties/launchSettings.json`

---

## 📝 API Endpoints

### Reports

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/filereports` | Liste tous les rapports |
| GET | `/api/filereports/{id}` | Récupère un rapport |
| POST | `/api/filereports` | Crée un rapport |
| PUT | `/api/filereports/{id}` | Met à jour un rapport |
| DELETE | `/api/filereports/{id}` | Supprime un rapport |

### Health Check

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Vérifier l'état du backend |

**Documentation complète :** http://localhost:5154/swagger

---

## 🎨 Design

L'application utilise un design moderne avec :

- **Glassmorphism** pour les surfaces
- **Animations fluides** avec Framer Motion
- **Silk background** animé (Three.js)
- **Palette de couleurs Rothschild & Co**
  - Primaire : `#1C355E` (Bleu)
  - Accent : `#CC9F53` (Or)
  - Neutre : `#D6D1CA` (Beige)

---

## 👨‍💻 Développement

### Scripts Frontend

```bash
cd frontend
npm run dev          # Serveur de développement
npm run build        # Build production
npm start            # Serveur production
npm run lint         # Linter
npm run type-check   # Vérifier types TypeScript
```

### Scripts Backend

```bash
cd backend/src/CRMEPReport.API
dotnet run           # Démarrer
dotnet build         # Compiler
dotnet watch run     # Avec rechargement auto
```

### Migrations Entity Framework

```bash
cd backend/src/CRMEPReport.API

# Créer une migration
dotnet ef migrations add NomMigration

# Appliquer les migrations
dotnet ef database update

# Supprimer la dernière migration
dotnet ef migrations remove
```

---

## 📊 Fonctionnalités

- ✅ **CRUD complet** pour les rapports CR MEP
- ✅ **Dashboard** avec métriques et actions rapides
- ✅ **Gestion de documents** avec filtres et recherche
- ✅ **Éditeur de templates** avec prévisualisation en temps réel
- ✅ **Export** HTML et PDF
- ✅ **Prévisualisation** des rapports
- ✅ **Suppression** avec confirmation
- ✅ **Versioning** automatique
- ✅ **Changelog** détaillé
- ✅ **Support multilingue** (FR/EN)
- ✅ **Thème sombre/clair**

---

## 🔒 Sécurité

### Développement

- Les variables d'environnement sensibles sont dans `.env.local` (non versionné)
- Le certificat SSL est désactivé en développement (réseau d'entreprise)

### Production

- Utilisez des variables d'environnement pour les secrets
- Activez HTTPS
- Configurez CORS correctement
- Utilisez Azure Key Vault ou équivalent pour les secrets

---

## 📄 License

Ce projet est sous licence privée.

---

## ✨ Support

### Checklist d'Installation

- [ ] Node.js v18+ installé
- [ ] npm v9+ installé
- [ ] .NET 8 SDK installé
- [ ] `install.bat` exécuté avec succès
- [ ] 635 packages frontend installés
- [ ] Backend compilé
- [ ] `start.bat` exécuté
- [ ] Application accessible sur http://localhost:3000

### Besoin d'Aide ?

1. **Vérifiez les prérequis** : Node.js, .NET
2. **Consultez la section** [Problèmes Courants](#-problèmes-courants)
3. **Vérifiez les logs** dans les fenêtres de terminal
4. **Réinstallez** si nécessaire :
   ```bash
   cd frontend
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   ```

---

## 🎉 Démarrage Rapide

**En résumé, pour démarrer le projet :**

```bash
# 1. Installation (une seule fois)
install.bat

# 2. Démarrage
start.bat

# 3. Ouvrir dans le navigateur
# http://localhost:3000
```

**C'est tout ! L'application est prête à l'emploi.** 🚀

---

**Développé avec ❤️ pour la gestion des rapports CR MEP**
