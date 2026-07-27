# PocketForge

Mobile-first Pokémon team builder for **Pokémon Champions Regulation M-B** and Showdown formats. Build teams, validate legality, run analysis, import/export Showdown sets, and use damage/speed tools — all in the browser as an installable PWA.

**Live app:** [https://whitedevil-93.github.io/pocketforge/](https://whitedevil-93.github.io/pocketforge/)

## Quickstart

### Prerequisites

- Node.js 22+
- npm 10+

### Run locally

```bash
git clone https://github.com/WhiteDevil-93/pocketforge.git
cd pocketforge
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Vite serves the app at the site root in dev; production builds use the `/pocketforge/` base path for GitHub Pages.

### Build for production

```bash
npm run build
npm run preview
```

Preview serves the built `dist/` folder locally.

### Install as an app (PWA)

After loading the deployed site (or a production preview), use your browser’s **Install** / **Add to Home Screen** option. PocketForge caches the app shell and works offline after the first visit. Teams are stored in your browser’s localStorage.

Installed copies check for updates when opened, when returning to the foreground, and periodically while online. A new service worker reloads the app once after taking control. You can also use **Settings → Check for App Update**; it preserves teams and does not require uninstalling the PWA or clearing Chrome data.

### Refresh Pokémon / Champions data

Pull the latest Showdown dex and Champions regulation whitelists:

```bash
npm run update-data
```

Refresh the current Champions Doubles rankings and detailed usage for the top 50 Pokémon:

```bash
npm run update-usage
```

Both commands generate TypeScript snapshots under `src/data/`. The deployed app reads those bundled files and never needs a server or a live API request, so it remains compatible with GitHub Pages and continues to work offline. The daily GitHub Action refreshes both sources and keeps the last-known-good competitive snapshot if its upstream API is temporarily unavailable.

### Verify Showdown integration

```bash
npm run verify
```

Runs import/export, movepool, speed, and damage calc smoke tests.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run typecheck` | Run TypeScript checks without producing a bundle |
| `npm run check` | Run lint, integration verification, and production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run update-data` | Fetch Showdown + Champions mod data |
| `npm run update-usage` | Refresh static Champions Doubles usage data |
| `npm run verify` | Integration smoke tests |

## Features

- **Champions M-B** — default format with regulation-aware roster, item, and move legality
- **Team Builder** — EVs/IVs, mega toggle, format-scoped species/item/move pickers
- **Validation** — species clause, item clause, mega-once, level 50, Champions whitelists
- **Import / Export** — Showdown paste format and packed team URLs (`?team=…`)
- **Analysis** — type coverage, speed tiers, Champions eligibility card
- **Calculator** — `@smogon/calc` damage rolls
- **Offline PWA** — service worker via `vite-plugin-pwa`

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.
The workflow derives the Vite base path from the repository name, so asset and PWA URLs remain valid on project Pages.

Ensure **Settings → Pages → Build and deployment → Source** is set to **GitHub Actions**.

## Tech stack

- React 19 + TypeScript + Vite 7
- `@pkmn/dex`, `@pkmn/data`, `@pkmn/sets`, `@smogon/calc`
- Zustand + localStorage persistence
- Tailwind CSS + Framer Motion

## Data sources

- [Pokémon Showdown](https://github.com/smogon/pokemon-showdown) — species, moves, items, type chart
- Showdown **champions mod** — Regulation roster, banned items/moves, learnsets
- [Pokémon Champions Battle Data](https://championsbattledata.com/api_guide) — community-extracted ranked Doubles rankings, moves, items, abilities, natures, and teammates
- Sprites from [play.pokemonshowdown.com](https://play.pokemonshowdown.com)

Pokémon and related trademarks belong to Nintendo / Creatures Inc. / GAME FREAK. PocketForge is an unofficial fan project.

## WSL note

If `npm run build` fails with a Rollup platform error, `node_modules` was likely installed on Windows. From WSL:

```bash
rm -rf node_modules package-lock.json
npm install
```
