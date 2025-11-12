# Dépendances du Frontend

Ce document liste toutes les dépendances du projet frontend et leur utilisation.

## Prérequis

- **Node.js**: v18.0.0 ou supérieur (LTS recommandé)
- **npm**: v9.0.0 ou supérieur

## Dépendances de Production

### Framework Principal
- **next** (^15.0.0): Framework React pour le rendu côté serveur et la génération de sites statiques
- **react** (^18.3.0): Bibliothèque JavaScript pour construire des interfaces utilisateur
- **react-dom** (^18.3.0): Point d'entrée DOM pour React

### Éditeur de Texte Riche (TipTap)
- **@tiptap/react** (^2.10.0): Wrapper React pour TipTap
- **@tiptap/starter-kit** (^2.10.0): Kit de démarrage avec extensions de base
- **@tiptap/extension-underline** (^2.10.0): Extension pour le soulignement
- **@tiptap/extension-text-align** (^2.10.0): Extension pour l'alignement du texte
- **@tiptap/extension-link** (^2.10.0): Extension pour les liens hypertextes
- **@tiptap/extension-image** (^2.10.0): Extension pour les images
- **@tiptap/extension-table** (^2.10.0): Extension pour les tableaux
- **@tiptap/extension-table-row** (^2.10.0): Extension pour les lignes de tableau
- **@tiptap/extension-table-cell** (^2.10.0): Extension pour les cellules de tableau
- **@tiptap/extension-table-header** (^2.10.0): Extension pour les en-têtes de tableau
- **@tiptap/extension-task-list** (^2.10.0): Extension pour les listes de tâches
- **@tiptap/extension-task-item** (^2.10.0): Extension pour les éléments de tâche
- **@tiptap/extension-text-style** (^2.10.0): Extension pour les styles de texte
- **@tiptap/extension-color** (^2.10.0): Extension pour la couleur du texte

### Animations et UI
- **lottie-react** (^2.4.0): Bibliothèque pour les animations Lottie
- **framer-motion** (^11.11.0): Bibliothèque d'animation pour React
- **lucide-react** (^0.460.0): Icônes React
- **@react-three/fiber** (^8.17.0): Renderer React pour Three.js (animations 3D)
- **three** (^0.170.0): Bibliothèque JavaScript 3D

### Utilitaires CSS
- **clsx** (^2.1.0): Utilitaire pour construire des chaînes de classes CSS conditionnelles
- **tailwind-merge** (^2.5.0): Utilitaire pour fusionner les classes Tailwind CSS
- **class-variance-authority** (^0.7.0): Utilitaire pour créer des variantes de composants

### Internationalisation
- **next-intl** (^3.23.0): Bibliothèque d'internationalisation pour Next.js

### HTTP Client
- **axios** (^1.7.0): Client HTTP basé sur les promesses

## Dépendances de Développement

### TypeScript
- **typescript** (^5.6.0): Langage de programmation typé
- **@types/node** (^22.0.0): Définitions de types pour Node.js
- **@types/react** (^18.3.0): Définitions de types pour React
- **@types/react-dom** (^18.3.0): Définitions de types pour React DOM

### Linting et Formatage
- **eslint** (^9.0.0): Outil de linting pour JavaScript/TypeScript
- **eslint-config-next** (^15.0.0): Configuration ESLint pour Next.js
- **@typescript-eslint/eslint-plugin** (^8.0.0): Plugin ESLint pour TypeScript
- **@typescript-eslint/parser** (^8.0.0): Parser ESLint pour TypeScript

### CSS et Styling
- **tailwindcss** (^3.4.0): Framework CSS utilitaire
- **postcss** (^8.4.0): Outil pour transformer CSS avec JavaScript
- **autoprefixer** (^10.4.0): Plugin PostCSS pour ajouter des préfixes CSS

### Commits
- **@commitlint/cli** (^19.0.0): Outil pour valider les messages de commit
- **@commitlint/config-conventional** (^19.0.0): Configuration conventionnelle pour commitlint

## Installation

Pour installer toutes les dépendances, exécutez:

```bash
npm install
```

## Scripts Disponibles

- `npm run dev`: Démarre le serveur de développement
- `npm run build`: Construit l'application pour la production
- `npm start`: Démarre le serveur de production
- `npm run lint`: Exécute le linter
- `npm run type-check`: Vérifie les types TypeScript

## Notes

- Toutes les versions sont spécifiées avec `^` pour permettre les mises à jour mineures et de correctifs
- Les dépendances sont régulièrement mises à jour pour des raisons de sécurité et de performance
- Consultez le fichier `package.json` pour les versions exactes installées
