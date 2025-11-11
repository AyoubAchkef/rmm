# 🚀 Guide d'installation et de démarrage rapide

Ce guide vous permettra d'installer et de démarrer le projet RMM en quelques minutes.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js 18+** : [Télécharger](https://nodejs.org/)
- **.NET 8 SDK** : [Télécharger](https://dotnet.microsoft.com/download)
- **Git** : [Télécharger](https://git-scm.com/)

## 🔧 Installation (Première fois)

### Étape 1 : Cloner le repository

```bash
git clone https://github.com/AyoubAchkef/rmm.git
cd rmm
```

### Étape 2 : Installer les dépendances

**Windows :**
```bash
install.bat
```

**Linux/Mac :**
```bash
chmod +x install.sh
./install.sh
```

Cette commande va :
- ✅ Vérifier que Node.js et .NET sont installés
- ✅ Installer les dépendances npm du frontend
- ✅ Restaurer les packages NuGet du backend

⏱️ Durée estimée : 2-3 minutes

## ▶️ Démarrage de l'application

### Démarrage rapide

**Windows :**
```bash
start.bat
```

**Linux/Mac :**
```bash
./start.sh
```

Cette commande va :
- 🚀 Démarrer le backend sur `http://localhost:5154`
- 🚀 Démarrer le frontend sur `http://localhost:3000`

Deux fenêtres de terminal s'ouvriront (une pour le backend, une pour le frontend).

### Accès à l'application

Une fois les serveurs démarrés, ouvrez votre navigateur sur :

**🌐 http://localhost:3000**

> **Note :** Si le port 3000 est déjà utilisé, Next.js utilisera automatiquement le port 3001.

## ⏹️ Arrêt de l'application

**Windows :**
```bash
stop.bat
```

**Linux/Mac :**
```bash
./stop.sh
```

Ou fermez simplement les fenêtres de terminal.

## 🛠️ Démarrage manuel (développement)

Si vous préférez démarrer les serveurs manuellement :

### Backend

```bash
cd backend/src/CRMEPReport.API
dotnet run
```

### Frontend

```bash
cd frontend
npm run dev
```

## 🔍 Vérification de l'installation

Pour vérifier que tout fonctionne :

1. **Backend :** Accédez à `http://localhost:5154/api/health`
   - Vous devriez voir : `{"status":"Healthy"}`

2. **Frontend :** Accédez à `http://localhost:3000`
   - Vous devriez voir la page de login

## ❓ Problèmes courants

### Port déjà utilisé

**Problème :** Le port 3000 ou 5154 est déjà utilisé

**Solution :**
- Frontend : Next.js utilisera automatiquement un autre port (3001, 3002, etc.)
- Backend : Modifiez le port dans `backend/src/CRMEPReport.API/Properties/launchSettings.json`

### Erreur "dotnet command not found"

**Problème :** .NET SDK n'est pas installé ou n'est pas dans le PATH

**Solution :**
1. Installez .NET 8 SDK depuis [dotnet.microsoft.com](https://dotnet.microsoft.com/download)
2. Redémarrez votre terminal

### Erreur "node command not found"

**Problème :** Node.js n'est pas installé ou n'est pas dans le PATH

**Solution :**
1. Installez Node.js depuis [nodejs.org](https://nodejs.org/)
2. Redémarrez votre terminal

### Erreur lors de l'installation npm

**Problème :** Erreur pendant `npm install`

**Solution :**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📝 Configuration

### Variables d'environnement (optionnel)

Créez un fichier `.env.local` dans le dossier `frontend/` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5154
```

### Configuration backend (optionnel)

Modifiez `backend/src/CRMEPReport.API/appsettings.json` si nécessaire.

## 🎯 Prochaines étapes

Une fois l'installation terminée :

1. Accédez à la page de login : `http://localhost:3000/login`
2. Explorez le dashboard
3. Créez votre premier rapport CR MEP
4. Consultez la [documentation principale](README.md) pour plus de détails

## 💡 Conseils

- **Gardez les fenêtres de terminal ouvertes** pendant le développement
- **Consultez les logs** dans les fenêtres de terminal en cas d'erreur
- **Rechargez la page** si vous voyez des erreurs après avoir modifié le code

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Consultez la section [Problèmes courants](#-problèmes-courants)
2. Vérifiez les logs dans les fenêtres de terminal
3. Créez une issue sur GitHub avec les détails de l'erreur

---

✨ Bon développement avec RMM !
