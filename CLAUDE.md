# MeshMY website

Docusaurus 3 site for the MeshMY Meshtastic community (https://meshmy.github.io). `npm run start` for dev and `npm run build` to check. The build fails on broken links, so run it before finishing any change.

## Design system

Before any UI, styling or copy work, read the MeshMY design system:

- **Locally:** `work-docs/design-system/README.md` (brand book), then `tokens.md` and `components/<Name>/README.md` for whatever you touch.
- **Living version:** https://claude.ai/code/artifact/2d0c64e9-1994-4800-aed8-10ac1f2a96ff. It's newer if the two disagree. Read its `project/README.md` if you can open it.

Rules that apply to every change:

- Colours come only from the CSS custom properties in `src/css/custom.css` (`--ifm-*`, `--brand-*`, `--mm-*`, `--mt-*`). Never hard-code hex values in components. A new token needs a value for both `[data-theme='dark']` and `[data-theme='light']`, with its contrast ratio noted next to it (4.5:1 for text, 3:1 for borders and icons).
- Accent text is always `--brand-highlight-text` (yellow in dark mode, blue in light mode). Never use yellow directly; it fails on white.
- One main call to action per view, in "ink" (`--mm-cta-bg` / `--mm-cta-fg`). Don't use red, or `button--primary` in dark mode, for calls to action.
- Meshtastic green (`--mt-green` fill, `--mt-ink` text, `--mt-border`) is only for buttons that lead into Meshtastic (meshtastic.org config links, app stores). Never use it as text on light backgrounds.
- The Meshtastic logo (`static/img/meshtastic/Mesh_Logo_Black.svg`) is used unaltered, only inside those buttons, and must link to meshtastic.org. Keep the ® on the first "Meshtastic" on a page and the trademark lines in the footer (`docusaurus.config.js`).
- Show status by shape plus a word, never by hue alone: filled = online, half-filled = partly online, red ring = offline, dashed and struck through = decommissioned.
- Use system fonts only (no webfonts). Use borders, not shadows (`--mm-shadow` is only for the map frame and map popups). Check dark and light, at desktop width and at 390px.

## Where things live

- `work-docs/`: internal tracking and knowledge base (design system, issue drafts, screenshots). It ignores itself and is never checked in. Docs that get checked in go only where they're asked for (`docs/`, `README.md`, `CLAUDE.md`).
- `src/data/sites.js`: router sites (MeshMY's and the Penang community's, by `maintainer`), RF links and status helpers, shared by the homepage and Infrastructure. Update status here by hand. `UNKNOWN` ('?') marks details a site's maintainers haven't shared; `approx` marks positions and elevations taken from the node itself.
- `src/data/networkStats.json`: the homepage's "mesh in numbers" counts (Malaysian nodes heard over MQTT, in windows ending on the snapshot date). Aggregates only; never commit a raw node dump (it holds names and positions). Regenerate with `npm run stats`, which runs `scripts/network-stats.mjs` against the signed API at https://api.lucifernet.com/meshtastic/ and needs `MESHAPI_KEY` and `MESHAPI_SECRET` in `.env.local` (`npm run stats -- dump.json` reads a saved node list instead). It also prints a router check: each band's `nodeId` in `sites.js` against when the node was last heard. **Run `npm run stats` before shipping a change**, and update any router status the check flags.
- `src/data/meshtasticConfig.js`: recommended settings, MQTT details, weekly-net messages, and the generated one-tap config URL.
- `src/components/Home/`: NetworkMap (Leaflet, client-only), CopyButton, ConfigQr.
- `src/components/Setup/`: shared "get on the mesh" UI (SettingRow/Settings, MeshtasticLink, ConfigCard with the QR, Choice pill radios), used by the homepage, Join and Weekly Net.
- `src/pages/meshtastic/join.js`: interactive beginner setup. Answers and ticks persist in `localStorage` via `src/components/Join/useStoredState.js`; `Term` is the glossary toggletip. Its words (questions, glossary, pairing tips, troubleshooting) live in `src/data/joinGuide.js`.
- Map tiles are CARTO basemaps and need `CARTO_API_KEY` in the environment at build time (git-ignored `.env.local` locally, a repo secret in `deploy.yml` for production; see README). Without it the map still works, but its tiles carry an "API key required" watermark.
- `src/pages/index.js` + `index.module.css`: homepage.
- `src/pages/meshtastic/weekly-net.js`: the weekly net. Keep the tagline "Jom check in net! Kalau bukan anda, siapa lagi." verbatim. The schedule, tagline and check-in messages live in `weeklyNet` (`meshtasticConfig.js`); `src/components/WeeklyNet/` has the MYT schedule maths and the open/next status pill. Fill in `netChannel` to turn on the one-tap "add channel" link.
