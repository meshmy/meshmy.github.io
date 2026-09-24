# meshmy.github.io

The [MeshMY](https://meshmy.github.io) community website, built with [Docusaurus](https://docusaurus.io/).

## Installation

```bash
npm install
```

**Note**: feel free to use the package manager of your choice.

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Environment variables

The build reads these at build time. None are required: without them the site still builds, with the fallback shown.

| Variable | Used for | Without it | Production |
|---|---|---|---|
| `CARTO_API_KEY` | [CARTO basemap](https://carto.com/basemaps) tiles on the homepage network map | Tiles load with an "API key required" watermark | GitHub Actions repository secret `CARTO_API_KEY` |

Map tiles load in the visitor's browser, so `CARTO_API_KEY` is public in the built site. It's kept out of the repo so it can be rotated, and so forks don't use it by accident.

**Locally:** copy `.env.example` to `.env.local` (git-ignored) and fill in the values. `docusaurus.config.js` loads it for `start` and `build`.

**Production:** add each variable as a repository secret (Settings → Secrets and variables → Actions), or with the GitHub CLI:

```bash
gh secret set CARTO_API_KEY --repo meshmy/meshmy.github.io
```

`.github/workflows/deploy.yml` passes it to the build step. Add any new variable in three places: this table, `.env.example`, and the workflow's `env:`.

## Deployment

Pushes to `main` are automatically built and deployed to GitHub Pages via the workflow in `.github/workflows/deploy.yml`.
