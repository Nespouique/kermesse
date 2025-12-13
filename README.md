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
- **Persistance des données** via un backend léger (Supabase).
- **Thème clair/sombre** pour le confort visuel.
- **Interface responsive** et moderne grâce à Tailwind CSS et Nuxt UI.

## Stack technique

- **[Nuxt 4](https://nuxt.com/)** (Vue 3) — Framework principal pour le frontend.
- **[Tailwind CSS](https://tailwindcss.com/)** — Pour le style utilitaire et la responsivité.
- **[Nuxt UI](https://ui.nuxt.com/)** — Composants UI prêts à l’emploi.
- **[Supabase](https://supabase.com/)** — Backend as a Service pour la persistance des paris.
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

### Configuration Supabase / Vercel

Variables d'environnement à définir (Vercel Project Settings > Environment Variables) :

```
NUXT_PUBLIC_SUPABASE_URL=https://wyxmlrjafkmkvzrtxeiy.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eG1scmphZmtta3Z6cnR4ZWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTI1MzUsImV4cCI6MjA2ODc4ODUzNX0._jXKEJYY5sXF6cElJtz3UKh6tMcrCIRhbiJfLjzTnS0
NUXT_ADMIN_PASSWORD=admin
```

En local, copier `.env.example` en `.env.local` et ajuster si besoin.

### Étapes de déploiement Vercel (résumé)

1. Importer le repo sur Vercel.
2. Renseigner les deux variables d'environnement ci-dessus (Production + Preview + Development si souhaité).
3. Lancer le premier déploiement.
4. Vérifier un pari test (onglet "Faire mon pari" puis onglet "Voir les paris").

### Sécurité / RLS

Les policies actuelles autorisent les inserts anonymes. À restreindre plus tard (ex: via une fonction RPC + captcha) si usage public large.

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
