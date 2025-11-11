# Backend CR MEP Report - .NET 8 API

API RESTful pour la gestion des rapports CR MEP (Compte Rendu Mise En Production).

## 🏗️ Stack Technique

- **.NET 8.0** - Framework
- **ASP.NET Core Web API** - API REST
- **Entity Framework Core 9** - ORM
- **SQL Server 2022** - Base de données
- **Swagger/OpenAPI** - Documentation API
- **Docker** - Conteneurisation

## 📁 Structure du Projet

```
backend/src/CRMEPReport.API/
├── Controllers/          # API Controllers
│   ├── ReportsController.cs    # CRUD rapports
│   └── HealthController.cs     # Health check
├── Data/                # Data Access Layer
│   ├── Entities/        # Entités EF Core
│   │   └── Report.cs
│   ├── AppDbContext.cs  # DbContext
│   └── Migrations/      # Migrations EF Core
├── Models/              # DTOs
│   ├── CreateReportRequest.cs
│   ├── UpdateReportRequest.cs
│   └── ReportResponse.cs
├── Services/            # Business Logic
│   ├── IReportService.cs
│   └── ReportService.cs
├── Program.cs           # Configuration app
├── appsettings.json     # Configuration
└── Dockerfile
```

## 🚀 Démarrage Rapide

### Prérequis

- **.NET 8 SDK** : [Télécharger](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** (local ou Docker)
- **Docker** (optionnel, pour conteneurisation)

### Installation & Lancement Local

1. **Naviguer vers le dossier de l'API**
   ```bash
   cd backend/src/CRMEPReport.API
   ```

2. **Restaurer les dépendances**
   ```bash
   dotnet restore
   ```

3. **Appliquer les migrations** (créer la BDD)
   ```bash
   dotnet ef database update
   ```

4. **Lancer l'API**
   ```bash
   dotnet run
   ```

L'API sera accessible sur :
- **HTTP** : http://localhost:5000
- **HTTPS** : https://localhost:5001
- **Swagger** : http://localhost:5000/swagger

### Lancement avec Docker Compose

Depuis la **racine du projet** :

```bash
docker compose up -d
```

Cela démarre :
- SQL Server (port 1433)
- Backend API (ports 5000, 5001)
- Frontend Next.js (port 3000)

## 📡 Endpoints API

### Health Check
```http
GET /api/health
GET /health
```

### Reports CRUD
```http
GET    /api/reports           # Liste tous les rapports
GET    /api/reports/{id}      # Récupère un rapport par ID
POST   /api/reports           # Crée un nouveau rapport
PUT    /api/reports/{id}      # Met à jour un rapport
DELETE /api/reports/{id}      # Supprime un rapport
```

### Documentation Swagger
```http
GET /swagger
```

## 📦 Modèle de Données

### Report Entity

```csharp
{
  "id": "guid",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "dataJson": "string",         // Données complètes du rapport en JSON
  "package": "string",           // Ex: "12.0.7"
  "sprint": "string",            // Ex: "Sprint 45"
  "deploymentDate": "datetime?",
  "status": "string"             // Ex: "Completed", "In Progress"
}
```

Le champ `dataJson` contient toute la structure du rapport (user stories, tests, défauts, etc.) au format JSON pour une flexibilité maximale.

## 🔧 Configuration

### Connection String (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=CRMEPReportDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True"
  }
}
```

### Variables d'Environnement (Docker)

- `ASPNETCORE_ENVIRONMENT` : Development / Production
- `ConnectionStrings__DefaultConnection` : Connection string SQL Server

## 🗄️ Base de Données

### Créer une nouvelle migration

```bash
dotnet ef migrations add MigrationName
```

### Appliquer les migrations

```bash
dotnet ef database update
```

### Supprimer la dernière migration

```bash
dotnet ef migrations remove
```

## 🧪 Tests

Actuellement, pas de tests configurés. À ajouter plus tard.

## 📝 Points Futurs

- [ ] Authentification JWT
- [ ] Tests unitaires et d'intégration
- [ ] Intégration Azure DevOps API
- [ ] Export PDF des rapports
- [ ] Cache (Redis)
- [ ] Rate limiting
- [ ] Logging avancé (Serilog)
- [ ] Normalisation BDD (tables séparées si nécessaire)

## 🐛 Troubleshooting

### Erreur de connexion SQL Server

Vérifiez que SQL Server est démarré et accessible :
```bash
docker ps  # Vérifier que le conteneur sqlserver est running
```

### Erreur de migration

Supprimez la BDD et recréez-la :
```bash
dotnet ef database drop
dotnet ef database update
```

## 📚 Ressources

- [Documentation .NET](https://docs.microsoft.com/dotnet/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)
- [ASP.NET Core](https://docs.microsoft.com/aspnet/core/)
