# Dépendances du Backend

Ce document liste toutes les dépendances du projet backend et leur utilisation.

## Prérequis

- **.NET SDK**: v8.0 ou supérieur
- **SQL Server**: Pour la base de données (ou SQL Server Express/LocalDB pour le développement)

## Dépendances NuGet

### Framework
- **Microsoft.NET.Sdk.Web**: SDK pour les applications web ASP.NET Core
- **TargetFramework**: net8.0

### Entity Framework Core
- **Microsoft.EntityFrameworkCore.SqlServer** (8.0.11): Provider SQL Server pour Entity Framework Core
- **Microsoft.EntityFrameworkCore.Design** (8.0.11): Outils de conception pour Entity Framework Core (migrations, scaffolding)
- **Microsoft.EntityFrameworkCore.Tools** (8.0.11): Outils en ligne de commande pour Entity Framework Core

### Documentation API
- **Swashbuckle.AspNetCore** (6.4.0): Génération automatique de documentation Swagger/OpenAPI

## Fonctionnalités des Packages

### Entity Framework Core
Entity Framework Core est un ORM (Object-Relational Mapper) moderne pour .NET. Il permet de:
- Mapper des objets C# vers des tables de base de données
- Effectuer des requêtes LINQ sur la base de données
- Gérer les migrations de schéma de base de données
- Suivre les changements d'entités

**Packages inclus:**
- `Microsoft.EntityFrameworkCore.SqlServer`: Permet la connexion et l'interaction avec SQL Server
- `Microsoft.EntityFrameworkCore.Design`: Nécessaire pour les commandes de migration et de scaffolding
- `Microsoft.EntityFrameworkCore.Tools`: Fournit les commandes PowerShell/CLI pour les migrations

### Swagger/OpenAPI
Swashbuckle génère automatiquement une documentation interactive de l'API REST:
- Interface utilisateur Swagger UI pour tester les endpoints
- Spécification OpenAPI (anciennement Swagger) au format JSON/YAML
- Documentation automatique basée sur les attributs et commentaires XML

## Configuration

### Chaîne de Connexion
La chaîne de connexion à la base de données est configurée dans `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CRMEPReportDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### Swagger
Swagger est configuré dans `Program.cs` et accessible à:
- **Développement**: https://localhost:5154/swagger
- **Production**: Désactivé par défaut pour des raisons de sécurité

## Commandes Utiles

### Restauration des Dépendances
```bash
dotnet restore
```

### Compilation
```bash
dotnet build
```

### Exécution
```bash
dotnet run --project src/CRMEPReport.API
```

### Migrations Entity Framework

#### Créer une nouvelle migration
```bash
dotnet ef migrations add NomDeLaMigration --project src/CRMEPReport.API
```

#### Appliquer les migrations
```bash
dotnet ef database update --project src/CRMEPReport.API
```

#### Supprimer la dernière migration
```bash
dotnet ef migrations remove --project src/CRMEPReport.API
```

#### Lister les migrations
```bash
dotnet ef migrations list --project src/CRMEPReport.API
```

## Structure du Projet

```
backend/
├── src/
│   └── CRMEPReport.API/
│       ├── Controllers/        # Contrôleurs API
│       ├── Data/              # Contexte de base de données et entités
│       ├── Migrations/        # Migrations Entity Framework
│       ├── Models/            # Modèles de données (DTOs)
│       ├── Services/          # Logique métier
│       ├── appsettings.json   # Configuration
│       └── Program.cs         # Point d'entrée de l'application
└── CRMEPReport.sln           # Solution Visual Studio
```

## Notes de Sécurité

- Les chaînes de connexion sensibles doivent être stockées dans `appsettings.Development.json` (non versionné)
- Utilisez User Secrets pour le développement local: `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "votre-chaine"`
- En production, utilisez des variables d'environnement ou Azure Key Vault

## Mises à Jour

Pour mettre à jour tous les packages vers les dernières versions compatibles:

```bash
dotnet list package --outdated
dotnet add package NomDuPackage --version X.X.X
```

## Support

- **Entity Framework Core**: https://docs.microsoft.com/ef/core/
- **ASP.NET Core**: https://docs.microsoft.com/aspnet/core/
- **Swagger**: https://swagger.io/docs/
