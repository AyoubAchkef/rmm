# RMM - Report Management Module

Application fullstack moderne pour la gestion des rapports de Compte Rendu de Mise En Production (CR MEP).

## 🚀 Technologies

### Frontend
- **Next.js 16** avec Turbopack
- **React 19** 
- **TypeScript**
- **Tailwind CSS**
- Interface moderne avec effet glassmorphism
- Support multilingue (FR/EN)
- Thème sombre/clair

### Backend
- **.NET 8** API
- **C#**
- Système de stockage basé sur fichiers
- Architecture RESTful
- Versioning automatique des rapports

## 📋 Fonctionnalités

- ✅ **CRUD complet** pour les rapports CR MEP
- ✅ **Dashboard** avec métriques et actions rapides
- ✅ **Gestion de documents** avec filtres et recherche
- ✅ **Éditeur de templates** avec prévisualisation en temps réel
- ✅ **Export** HTML et PDF
- ✅ **Prévisualisation** des rapports
- ✅ **Suppression** avec confirmation
- ✅ **Versioning** automatique
- ✅ **Changelog** détaillé

## 🛠️ Installation rapide

### 🚀 Démarrage en 2 commandes

**Étape 1 - Installation :**

```bash
# Windows
install.bat

# Linux/Mac
./install.sh
```

**Étape 2 - Démarrage :**

```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

Ouvrez votre navigateur sur **http://localhost:3000**

📖 Pour plus de détails, consultez le [Guide d'installation complet](INSTALLATION.md).

---

## 📦 Installation manuelle

### Prérequis
- Node.js 18+
- .NET 8 SDK
- npm ou yarn

### Backend

```bash
cd backend/src/CRMEPReport.API
dotnet restore
dotnet run
```

Le backend sera disponible sur `http://localhost:5154`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur `http://localhost:3000` (ou 3001 si 3000 est occupé)

## 📁 Structure du projet

```
rmm/
├── backend/
│   ├── src/
│   │   └── CRMEPReport.API/
│   │       ├── Controllers/
│   │       ├── Services/
│   │       ├── Models/
│   │       └── Data/
│   └── CRMEPReport.sln
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── contexts/
│   │   └── i18n/
│   └── public/
├── install.bat / install.sh
├── start.bat / start.sh
├── stop.bat / stop.sh
└── Rapports/ (généré automatiquement)
```

## 🎯 Utilisation

### Créer un nouveau rapport
1. Cliquez sur **"Générer un document"** dans le dashboard
2. Sélectionnez **"CR Mise en Production"**
3. Remplissez les champs du template
4. Cliquez sur **"Enregistrer"**

### Modifier un rapport
1. Accédez à **Documents**
2. Double-cliquez sur un rapport ou utilisez le bouton **"Modifier"**
3. Modifiez les champs nécessaires
4. Sauvegardez vos modifications

### Prévisualiser un rapport
- Depuis Documents : cliquez sur le bouton **"Voir"**
- Depuis Create/Edit : cliquez sur le bouton **"Aperçu"**

### Exporter un rapport
1. Ouvrez un rapport en mode édition
2. Cliquez sur **"Exporter"**
3. Choisissez le format (PDF ou HTML)

## 🔧 Configuration

### Variables d'environnement (Frontend)

Créez un fichier `.env.local` dans le dossier `frontend/` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5154
```

### Configuration (Backend)

Modifiez `appsettings.json` si nécessaire :

```json
{
  "ReportsPath": "../../../Rapports"
}
```

## 📝 API Endpoints

### Reports
- `GET /api/filereports` - Liste tous les rapports
- `GET /api/filereports/{id}` - Récupère un rapport
- `POST /api/filereports` - Crée un rapport
- `PUT /api/filereports/{id}` - Met à jour un rapport
- `DELETE /api/filereports/{id}` - Supprime un rapport

## 🎨 Design

L'application utilise un design moderne avec :
- **Glassmorphism** pour les surfaces
- **Animations fluides** avec Framer Motion
- **Silk background** animé
- **Palette de couleurs** cohérente
  - Primaire : `#1C355E` (Bleu)
  - Accent : `#CC9F53` (Or)
  - Neutre : `#D6D1CA` (Beige)

## 👨‍💻 Développement

### Scripts disponibles (Frontend)

```bash
npm run dev      # Démarre le serveur de développement
npm run build    # Compile pour la production
npm run start    # Démarre le serveur de production
npm run lint     # Analyse le code
```

### Scripts disponibles (Backend)

```bash
dotnet run              # Démarre l'application
dotnet build            # Compile le projet
dotnet test             # Lance les tests
dotnet ef migrations    # Gère les migrations
```

## 📦 Architecture

### Stockage des rapports

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

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 License

Ce projet est sous licence privée.

## ✨ Crédits

🤖 Développé avec l'aide de [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
