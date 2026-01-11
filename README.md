# Kermesse du Bébé

**Kermesse du Bébé** est une application web familiale inspirée des kermesses bretonnes, où chacun peut parier sur la date, le poids, le sexe et (optionnellement) le prénom de la naissance de notre futur enfant. L’objectif est de rassembler la famille autour d’un jeu convivial, accessible en ligne, et de suivre les paris de chacun jusqu’au grand jour !

## Fonctionnalités principales

- **Compte à rebours** affichant le temps restant avant la date théorique de naissance (22 janvier 2026).
- **Gros bouton “Prendre un ticket”** pour participer.
- **Modal de saisie** du pari avec :
  - Date prévue (sélecteur de date)
  - Poids estimé
  - Sexe (radio ou select)
  - Prénom (optionnel)
  - Sélecteur d’avatar (liste d’images SVG)
- **Tableau récapitulatif** des paris de tous les participants, affiché sous le bouton.
- **Lignes barrées** automatiquement pour les paris dont la date est dépassée.
- **Persistance des données** via PostgreSQL.
- **Thème clair/sombre** pour le confort visuel.
- **Interface responsive** et moderne grâce à Tailwind CSS et Nuxt UI.
- **Calcul automatique des scores** et classement des vainqueurs — voir [Algorithme de calcul des scores](Algorithme.md).

## Stack technique

- **[Nuxt 4](https://nuxt.com/)** (Vue 3) — Framework principal pour le frontend.
- **[Tailwind CSS](https://tailwindcss.com/)** — Pour le style utilitaire et la responsivité.
- **[Nuxt UI](https://ui.nuxt.com/)** — Composants UI prêts à l’emploi.
- **PostgreSQL** — Base de données relationnelle pour la persistance des paris.
- **[VueUse](https://vueuse.org/)** — Utilitaires Vue 3 (gestion des breakpoints, color mode, etc).
- **[Lucide Icons](https://lucide.dev/icons/)** — Icônes SVG modernes.
- **ESLint** — Linting et qualité du code.
- **TypeScript** — Typage statique.

## Installation & développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Déploiement

Voir la documentation Nuxt pour le déploiement :  
https://nuxt.com/docs/getting-started/deployment

### Configuration Docker / Vercel

Variables d'environnement à définir :

```
DATABASE_URL=postgres://kermesse:password@localhost:5432/kermesse
NUXT_ADMIN_PASSWORD=admin
```
En local, copier `.env.example` en `.env.local` et ajuster si besoin.

### Déploiement avec Docker

1. Configurer les variables d'environnement dans `.env`
2. Lancer `docker compose up -d`
3. L'application est accessible sur http://localhost:3000

---

**Projet open source** — Repo

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
