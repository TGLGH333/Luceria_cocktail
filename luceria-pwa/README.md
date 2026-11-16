# Luceria PWA

A clickable iPad-sized prototype built from `Figma_design/` and the two handoff documents:

- `..\BACKEND_DEVELOPER_GUIDE.md`
- `..\FRONTEND_DEVELOPER_GUIDE.md`

The app is a Vue 3 + Vite + TypeScript + Pinia prototype. It runs as a normal web app and can be added to the iPad Home Screen from Safari. It is not the production iPad app.

## Run

```bash
cd luceria-pwa
pnpm install
pnpm dev
```

Open `http://127.0.0.1:5173/` for the Welcome screen, or go straight to `http://127.0.0.1:5173/#/tonight`.

If `pnpm` is not on `PATH` in this workspace, run it through the bundled Node runtime:

```powershell
& 'C:\Users\曾翔\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe' `
  'C:\Users\曾翔\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs' dev
```

Build:

```bash
pnpm build
```

`pnpm build` runs `vue-tsc --noEmit`, then Vite, then `scripts/stamp-sw.mjs`, which renders `src/sw-template.js` into `dist/sw.js` with a per-build cache name. `dist/` is the deployable output.

## Run on an iPad with Safari

The Vite server binds to all interfaces, so the iPad only needs to be on the same Wi-Fi network.

1. On Windows, run `ipconfig` and find the WLAN adapter's IPv4 address, for example `10.135.69.171`.
2. Start the static production server on the PC:

```bash
pnpm build
pnpm preview
```

3. On the iPad, open Safari and go to:

```text
http://<WLAN-IP>:4173/#/tonight
```

For the live-dev version, use `pnpm dev` and port `5173` instead. The page is a normal Safari tab, so no certificate is needed.

### Home Screen / offline notes

- A normal Safari tab works over HTTP on the LAN.
- To install it as a standalone Home Screen app with the service worker and offline cache, Safari needs a **secure context (HTTPS)**. On plain `http://<LAN-IP>` Safari can display the page, but the service worker will not register.
- The simplest HTTPS path is the included Netlify setup below (or any static host with HTTPS). After the first online load, open Share -> Add to Home Screen. The manifest, 180/192/512 icons and `apple-mobile-web-app-*` tags are already present.
- The dev server never registers the service worker: registration is production-only in `src/main.ts`.

## Deploy to Netlify

`netlify.toml` is included. Push this folder to a Git repo and create a Netlify site from it, or run:

```bash
pnpm build
npx netlify deploy --dir dist
```

- Build command: `pnpm build` · publish directory: `dist`
- HTTPS is required for iPad Safari “Add to Home Screen”.
- The PWA manifest is `public/manifest.webmanifest`; icons are in `public/icons/`.
- A small service worker caches the shell and static assets after the first online load, so the app can reopen offline. Its source is `src/sw-template.js`; the build stamps a fresh cache name into `dist/sw.js`, so a redeploy replaces a stale shell instead of serving it from cache. It is registered only in a production build.

## Routes

| Route | Screen | Notes |
| --- | --- | --- |
| `/#/` | L02 Welcome | Redirects here; Get started goes to Tonight |
| `/#/tonight` | T01 Tonight | Hero pick, Start mixing, View recipe, also-ready cards |
| `/#/recipes` | R01 Recipes | Search, ready/almost filters, 10 demo recipes |
| `/#/recipe/:slug` | D01/D02 Recipe | Ingredients and Method tabs, servings, units, optional garnish |
| `/#/mix/:slug` | M00–M12 Mixing | Plan → step timer → done / save to journal |
| `/#/bar` | B01/B05 My Bar | 15 ingredients, stock sheet, add ingredients, next buy |
| `/#/list` | S01 Shopping list | Derived from missing ingredients, check/clear, unlock panel |
| `/#/journal` | J01 Journal | Mixes, week stats, mindful-drinking card |
| `/#/settings` | X01/X02/X06/X08 | Theme, contrast, text size, touch targets, units, servings, about |

The 5-tab bar is shared by the main sections. Recipe and mixing screens are immersive and hide it.

## Demo data

Everything is local and in-memory / `localStorage`; there is no backend yet.

- 10 recipes: Negroni, Boulevardier, Old Fashioned, Daiquiri, Black Russian, Whiskey Sour, Margarita, Mojito, Cosmopolitan, Mint Julep.
- 19 ingredients; 15 in the demo bar.
- Initial bar: 15 ingredients, 7 ready cocktails, 2 running low, fresh mint out.
- The Negroni uses the exact 6-step / 30 + 30 + 30 ml spec from the handoff.
- Shopping list is derived from the bar; it is not an editable persisted list yet.

## Demo helpers

- **Reset the demo state.** Open the deployed URL with `?demo=reset` (for example `https://<site>/?demo=reset`) and reload. The bar, its auto-add flags, the journal, settings and any in-progress mixing sessions are deleted from `localStorage` before Pinia boots, so the app comes back with the seeded demo data. A short toast confirms the reset. Standalone mode has no address bar, so use a Safari tab for this; the in-app equivalent is Settings → Reset demo.
- **Offline shell.** The service worker is cache-first, so an installed home-screen app only picks up a redeploy after the worker updates — which happens automatically because every build gets a new cache name. Open the app once online after a deploy, or the next launch while offline will still show the old shell.

## Scope and limitations

This is the P0 demo for the deadline, not the 82-screen product.

- No auth, backend, community, OCR, voice, party mode or 120-recipe catalogue.
- Placeholder SVG glass artwork instead of the licensed Luceria renders.
- Theme follows `dark` by default; Automatic / Light / High contrast are selectable in Settings.
- Accessibility: Dynamic Type up to 200% with reflow, read-aloud + captions, timer chime/haptic/flash, larger targets, reduced motion and high contrast are implemented; VoiceOver/Switch Control still need a manual iPad pass. Details are in `DESIGN_AUDIT.md`.
- A few controls (Saved, My recipes, Scan label, Share, Add item) intentionally show a “coming next” toast.
- Design-data conflicts are recorded in `..\FRONTEND_DEVELOPER_GUIDE.md`; the demo uses 2 min for Negroni (D01/T01) and 10 demo recipes instead of 120.

## Structure

```
src/
  App.vue               1194×834 stage + shared tab bar + theme
  router.ts             hash routes
  types.ts              local demo types
  data/                 ingredients, recipes, navigation
  stores/demo.ts        Pinia demo store (bar, journal, settings, derived selectors)
  components/           DrinkGlass, TabBar
  views/                Welcome, Tonight, Recipes, Recipe, Mix, Bar, List, Journal, Settings
  styles/               tokens.css (dark/light/hc), base.css
  demoReset.ts          ?demo=reset handler, runs before Pinia boots
  sw-template.js        service worker source, stamped into dist/sw.js at build
public/fonts/           local Inter woff2 files
public/manifest.webmanifest
public/icons/           Home Screen icons
scripts/stamp-sw.mjs    renders dist/sw.js with a per-build cache name
netlify.toml            build + SPA redirect
DESIGN_AUDIT.md         gap analysis against Figma_design/DEVELOPER_GUIDE.md
```

## Next steps

1. Deploy to Netlify and test the Home Screen install on the iPad.
2. Wire the “coming next” controls or hide them for the demo.
3. Replace the derived shopping list with a persistent Pinia list and connect it to recipe/bar actions.
4. Use the real Luceria artwork when the asset licence is confirmed.
5. If the deadline allows, add the Learn/Party screens from the guide’s priority list.
