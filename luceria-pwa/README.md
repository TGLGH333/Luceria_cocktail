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

Open `http://127.0.0.1:5173/` for the splash screen; it moves to Welcome after 2.8 s. You can also go straight to `http://127.0.0.1:5173/#/tonight`.

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
| `/#/` | L01 Splash | Ink illustration, auto-advances to Welcome after 2.8 s; tap to skip |
| `/#/welcome` | L02 Welcome | Three drink illustrations, Get started, sign-in entry |
| `/#/signin` | L08 Sign in | Apple/Google demo toast, email code flow, guest mode |
| `/#/signin/email` | L09 Email | Email entry, validation, six-digit code |
| `/#/signin/code` | L10 Verify | Six digits, paste/backspace support, resend timer |
| `/#/party` | P02 Party | Dice and wheel game cards, full-screen without TabBar |
| `/#/party/dice` | P03 Dice | 2/3/5 dice, animated roll, total and history |
| `/#/party/wheel` | P04/P04b Wheel | Eight editable forfeits, animated spin, result and history |
| `/#/tonight` | T01 Tonight | Hero pick, Start mixing, View recipe, also-ready cards |
| `/#/recipes` | R01 Recipes | Search, ready/almost filters, 13 demo recipes |
| `/#/recipe/:slug` | D01/D02 Recipe | Ingredients and Method tabs, servings, units, optional garnish |
| `/#/mix/:slug` | M00–M12 Mixing | Plan → step timer → done / save to journal |
| `/#/bar` | B01/B05 My Bar | 21 ingredients, stock sheet, add ingredients, next buy |
| `/#/list` | S01 Shopping list | Derived from missing ingredients, check/clear, unlock panel |
| `/#/journal` | J01 Journal | Mixes, week stats, mindful-drinking card, Host a party |
| `/#/settings` | X01/X02/X06/X08 | Theme, contrast, text size, touch targets, units, servings, about |

The 5-tab bar is shared by the main sections. Splash, onboarding, sign-in, party, game, recipe and mixing screens hide it.

## Demo data

Everything is local and in-memory / `localStorage`; there is no backend yet.

- 13 recipes: Negroni, Boulevardier, Old Fashioned, Daiquiri, Black Russian, Whiskey Sour, Margarita, Mojito, Cosmopolitan, Mint Julep, Espresso Martini, Aperol Spritz, Paloma.
- 25 ingredients; 21 in the demo bar.
- Initial bar: 21 ingredients, 10 ready cocktails, 2 running low, fresh mint out.
- The Negroni uses the exact 6-step / 30 + 30 + 30 ml spec from the handoff.
- Shopping list is derived from the bar; it is not an editable persisted list yet.

### Recipe and artwork sources

The three added cocktails follow classic bar proportions; measurements were checked against Difford's Guide:

- [Espresso Martini](https://www.diffordsguide.com/cocktails/recipe/725/espresso-martini) — 45 ml vodka, 30 ml espresso, 20 ml coffee liqueur.
- [Aperol Spritz](https://www.diffordsguide.com/cocktails/recipe/2908/aperol-spritz-aperitivo-spritz) — 3:2:1 prosecco, Aperol and soda.
- [Paloma](https://www.diffordsguide.com/cocktails/recipe/1456/paloma) — 50 ml tequila, 25 ml pink grapefruit juice, 12.5 ml lime, 7.5 ml agave, 50 ml grapefruit soda.

Difford's Guide blocks automated page and image downloads (HTTP 405 / human verification), and its photography is copyrighted. The three new sample images in `public/art/` are original SVG illustrations drawn for this demo in the app's dark/amber drink style; they are not copied from the site.

## Demo helpers

- **Reset the demo state.** Open the deployed URL with `?demo=reset` (for example `https://<site>/?demo=reset`) and reload. The bar, its auto-add flags, the journal, settings and any in-progress mixing sessions are deleted from `localStorage` before Pinia boots, so the app comes back with the seeded demo data. A short toast confirms the reset. Standalone mode has no address bar, so use a Safari tab for this; the in-app equivalent is Settings → Reset demo.
- **Offline shell.** The service worker is cache-first, so an installed home-screen app only picks up a redeploy after the worker updates — which happens automatically because every build gets a new cache name. Open the app once online after a deploy, or the next launch while offline will still show the old shell.

## Scope and limitations

This is the P0 demo for the deadline, not the 82-screen product.

- No backend, community, OCR, real Apple/Google auth or 120-recipe catalogue. The sign-in code is a local demo that accepts any six digits. The party planner is also a demo placeholder; Dice and Spin the wheel are playable.
- Artwork is a mix of the supplied Figma drink renders and original SVG illustrations; the Figma layers marked `ASSET TODO` are still temporary.
- Theme follows `dark` by default; Automatic / Light / High contrast are selectable in Settings.
- Accessibility: Dynamic Type up to 200% with reflow, read-aloud + captions, timer chime/haptic/flash, larger targets, reduced motion and high contrast are implemented; VoiceOver/Switch Control still need a manual iPad pass. Details are in `DESIGN_AUDIT.md`.
- A few controls (Saved, My recipes, Scan label, Share, Add item, Planner) intentionally show a “coming next” toast.
- Design-data conflicts are recorded in `..\FRONTEND_DEVELOPER_GUIDE.md`; the demo uses 2 min for Negroni and 13 demo recipes instead of 120.

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
