# Luceria PWA · Developer Guide audit

Audit against `Figma_design/DEVELOPER_GUIDE.md` (sections 2.2–2.7), 15 Nov 2026.
Scope: the demo PWA in this folder, not the full 82-screen app.

Status key: **Done** = implemented and visible in the demo; **Partial** = implemented with a stated limit; **Not now** = deliberately out of scope for the 2-day demo.

## 1. Theme and tokens (guide 2.2)

| Requirement | Status | Where / note |
| --- | --- | --- |
| CSS custom properties, no hard-coded colours in views | Done | `src/styles/tokens.css`; views consume `--bg-*`, `--fill-*`, `--text-*`, `--accent`, `--status-*` |
| `[data-theme]` for Dark / Light / High contrast | Done | `App.vue` writes `document.documentElement.dataset.theme`; `Settings → Appearance` switches all three |
| Automatic follows iPad appearance | Done | `prefers-color-scheme` listener; `auto` resolves to dark/light |
| `prefers-contrast: more` respected | Done | `systemContrast` forces `hc` when theme is `auto` |
| Changing a token updates every component | Done | Components reference semantic tokens, not palette values |

Remaining: the app still contains a few one-off rgba values in decorative glows and shadows; they are intentionally not content colours.

## 2. Layout and hit areas (guide 2.3)

| Requirement | Status | Where / note |
| --- | --- | --- |
| 1194 × 834 iPad landscape canvas | Done | `App.vue` `.ipad`; scaled to the available viewport |
| 40 pt side margins, 24 pt status area | Done | Page headers use `padding: 42px 40px 120px`; no fake status bar is drawn |
| TabBar 560 × 68, 28 pt from bottom | Done | `src/components/TabBar.vue`; `bottom: calc(28px + env(safe-area-inset-bottom))`; at 200% the stage reserves 96 px so the page ends exactly at the bar |
| Scrollable content clears the TabBar | Done | 120 px bottom padding on Recipes / Bar / List / Journal / Settings; `[data-text-large] .ipad.has-tabbar` reserves the 68 + 28 px band |
| Touch targets 44 / 52 / 60 / 88 | Done | Global 44 px minimum for button/input/select/textarea; icon-only controls get 44 px width; primary 60, mixing footer 88; Larger touch targets grows every button to 64 |
| Recipe grid 4 × 266, 16 gap | Done | `.grid` is `repeat(4, minmax(0, 1fr))` with 16 px column gap; 266 px at 1194 |
| Split view < 900 pt: 3 columns; 1 column below 680 | Done | `@media` blocks in `RecipesView.vue` and `BarView.vue` |
| Hero copy y = 152, button row y ≈ 482, Also ready y = 546 | Done | `TonightView.vue` hero padding / spacing; measured against T01 |

## 3. Colour, hero and status (guide 2.4)

| Requirement | Status | Where / note |
| --- | --- | --- |
| Hero background from `drink/<id>` to `bg/base` at 60% | Done | `TonightView.vue` computed hue + `linear-gradient(180deg, hue 0%, bg-base 60%)` |
| Glow uses a lighter drink colour, never amber | Done | `--glow` is derived from the recipe `hue`; SVG liquid uses the recipe `liquid` |
| Gradients fade to `bg/clear` | Done | Added `--bg-clear` per theme; hero radial, hero `::after` |
| No glow around empty states, search or timers | Partial | Empty states and search have no glow; the mixing plan art keeps a drink glow (it is a drink, not an empty state) |
| Status = icon + words, never colour alone | Done | `Ready · 2 min`, `Need Fresh mint`, `Low`, `Out`; cards carry an icon |
| Timer: neutral track + accent value only | Done | `.ring-bg` / `.ring-value`; no multi-colour gradient |
| Pause state moves to `text/tertiary` | Done | `.ring-value.paused` uses `--text-tertiary`; the pause button label also changes |

## 4. High contrast (guide 2.5)

| Requirement | Status | Where / note |
| --- | --- | --- |
| Pure black surfaces | Done | `[data-theme='hc']` sets `--bg-base/elevated/sunken: #000` |
| 1.5 pt white outline on cards, buttons, pills, sheets | Done | `base.css` HC rule for `button`, `.row`, `.panel`, `.sheet`, `.tile`, `.ingredient-card`, `.bar-item`, `.journal-entry`, `.unlock-card`, `.empty` |
| Primary/secondary white, tertiary `#E0E0E0` | Done | HC token block |
| Accent `#FFD60A`, black text on accent | Done | HC block overrides `--accent`, `--accent-ink` |
| Focus ring `#40C8FF`, 3 pt | Done | `:focus-visible` in `base.css`; `--focus-ring` |
| Artwork labelled by role, not decoration | Partial | Drink SVG is `aria-hidden`; wheel garnish is decorative; a dedicated art-label pass is still TODO |

## 5. Interaction and motion (guide 2.6)

| Requirement | Status | Where / note |
| --- | --- | --- |
| Tab switch keeps each tab's scroll position | Done | `KeepAlive` for Tonight / Recipes / Bar / List / Journal / Settings in `App.vue` |
| Open recipe / start mixing pushes in 300 ms | Done | `meta.transition: 'push'` for Recipe/Mix; `.push-*` 300 ms translate + fade; tab routes have no transition |
| Sheet rises in 250 ms | Done | Bar sheets use a 250 ms scrim fade plus a 32 px horizontal rise; List has no sheet |
| Mixing Next 300 ms, no cross-fade of instructions | Done | `main.step` is keyed by `stepIndex`; `step-in` is a 300 ms translate/fade, not a cross-fade |
| Tap anywhere / voice “next” | Partial | `onStepClick()` advances on a tap outside buttons, footers and timers; spoken commands are not implemented |
| Timer end: haptic + chime, then auto-advance after 2 s | Done | `chime()` uses Web Audio + `navigator.vibrate`; `advanceAfterTimer()` waits 2 s |
| Toast for save with Undo, 4 s | Done | Journal save and shopping-list “Clear checked items” both show a 4 s Undo; Undo restores the journal + bar snapshot, or the hidden list rows |
| Leaving mixing asks “Stop mixing?” and keeps progress for 10 min | Done | `close()` confirms; `localStorage` key `luceria.mix.<slug>` with 10-minute check |
| Wake lock while mixing | Done | `requestWakeLock()` / `releaseWakeLock()`; honours `settings.keepAwake` |
| Update bar after mixing | Done | `saveJournal()` lowers each required ingredient one level when `settings.updateBar` is on |

## 6. Accessibility (guide 2.7)

| Requirement | Status | Where / note |
| --- | --- | --- |
| WCAG AA in three themes | Partial | Text/background pairs follow tokens; contrast audit is manual and not complete |
| Dynamic Type to 200% with reflow, no clipping | Done | `--text-scale` multiplies every font-size/line-height; 1.35 / 1.7 / 2 options; `[data-text-large]` reflows Tonight, Recipes, Recipe, Mix, Bar, List, Journal and Settings into scrollable layouts; tab pages reserve the TabBar band |
| VoiceOver order / labels | Partial | Icon-only buttons have `aria-label`; decorative SVG is hidden; full rotor pass not done |
| Larger touch targets 52 → 64 | Done | `[data-large-targets='true']` grows every button to 64 px high (and icon-only controls to 64 px wide), including tabs, checks, close and more |
| Switch Control / full keyboard access | Partial | All controls are buttons; visible focus ring added; a full tab-order pass is TODO |
| Timer chime / haptic / flash | Done | Web Audio chime + `navigator.vibrate`; `.flash` white pulse honours `settings.flash` |
| Read steps aloud / captions | Done | `speakStep()` uses `speechSynthesis`; the spoken text is also rendered as a caption when `settings.captions` is on |
| Reduce motion | Done | `data-reduce-motion` makes animation `none`, transitions 150 ms; `prefers-reduced-motion` also 150 ms |
| One instruction per screen / extra time | Done | `settings.oneInstruction` expands `RecipeStep.parts`; Extra time is a working setting; combined pours in the seeded recipes are split |

## 7. Fixed in this pass

1. `Settings` toggles are now real controls: Increase contrast, Reduce motion, Larger touch targets, Extra time on timers, Keep screen awake, Start timers automatically, Update my bar after mixing.
2. `auto` theme now respects `prefers-contrast: more`; the app listens for both media-query changes.
3. `--bg-clear` added to all three token sets and used by the Tonight hero; no grey fallback edge in Light.
4. HC outlines and a 3 px focus ring were added globally.
5. Mixing now requests a wake lock, chimes and vibrates at timer end, auto-advances after 2 s (unless Extra time is on), confirms “Stop mixing?”, keeps progress for 10 minutes, and can lower bar stock on save.
6. Recipe and Bar grids reflow to 3 columns under 900 pt and 1/2 columns under 680 pt.
7. Tab pages are kept alive so scroll positions survive tab switches; Recipe/Mix use a 300 ms push transition while tabs switch instantly.
8. Dynamic Type is real: every font-size and line-height is multiplied by `--text-scale`; 200% reflows Tonight, Mix and Settings into scrollable layouts.
9. Mixing now speaks steps, shows captions, flashes the screen at timer end, recolours the paused ring, and animates each step in over 300 ms.
10. Saving a journal entry shows a 4-second Undo toast; Undo restores the journal and the bar snapshot. `settings.oneInstruction` splits combined pours into separate steps.
11. **200% pass:** tab pages reserve the TabBar band (`page bottom = tabbar top`, measured overlap 0), Bar drops to 3 columns with static names, Recipe tiles use a 16:7 art crop, Recipe details become one scrollable column, Journal entries and Shopping-list rows wrap instead of clipping.
12. **Hit areas:** every button/input has a 44 px minimum; icon-only controls have 44 px width; Larger touch targets grows every button to 64.
13. **iPad:** a coarse pointer removes the preview frame (`.stage` padding 0, square `.ipad`) and the canvas scales to the full viewport.
14. **Motion/undo:** Bar sheets use a 250 ms rise; tapping the mixing step advances; Shopping-list “Clear checked items” has a 4 s Undo.
15. **High contrast:** outlines extended to ingredient tiles, journal entries, stat cards, search and the TabBar.

## 8. Known limits and next steps

- **VoiceOver and Switch Control** need a manual pass on a real iPad; headless Chromium can verify labels, focus order and the 200% reflow, not the actual rotor.
- **WCAG AA** is token-driven and spot-checked; a full contrast audit of every state is still a manual QA item.
- **Real-device PWA** behavior (Add to Home Screen, standalone status bar, wake lock in iOS Safari) must be checked on the iPad; the desktop build cannot prove it.
- **Toast Undo** covers journal save and list clear; Share / Add item / Save recipe are still demo toasts.
- **Voice commands** are not implemented; steps can be advanced by tapping, but “next / back / repeat / pause” speech recognition is not wired.
- **Type is scaled with `px * --text-scale`**, not the guide's `rem + clamp()`; the visual 200% result is verified but the CSS technique differs.
- **Sheets are side panels**, not bottom sheets; the 250 ms rise is horizontal.
- **Placeholder art** uses the shared `DrinkGlass` SVG; per-recipe artwork remains the design handoff's `ASSET TODO` list.

## 9. Verification commands

```powershell
# build (from luceria-pwa)
& 'C:\Users\曾翔\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe' `
  'C:\Users\曾翔\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs' build
```

Dev: `http://127.0.0.1:5173/#/tonight` · Settings deep links: `#/settings?tab=accessibility`, `#/settings?tab=mixing`.
