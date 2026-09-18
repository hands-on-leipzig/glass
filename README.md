# @hands-on/glass

Shared design system for HANDS on TECHNOLOGY Vue apps (Join, FLOW, …).

Includes CSS tokens, liquid-glass surfaces, shared app shell / sidebar, global element defaults, fonts, and light/dark theme helpers.

## Installation

### Option A: local path (sibling checkout)

```bash
npm install ../glass
```

### Option B: Git dependency

```json
"@hands-on/glass": "github:hands-on-leipzig/glass#v1.5.0"
```

### Option C: private npm registry

```bash
npm install @hands-on/glass@1.2.1
```

## Local stories

```bash
npm install
npm run dev
```

Opens [http://localhost:6006](http://localhost:6006). The catalog lists stories; **Buttons** is `/stories/buttons.html` (Heute vs Glass-Standard). Edits in `styles/` show up after reload. The playground is not part of the published package.

## Usage in a Vue + Vite app

### 1. `main.js`

```js
import 'bootstrap-icons/font/bootstrap-icons.css' // optional, wenn Icons genutzt werden
import '@hands-on/glass/styles.css'
import { initTheme } from '@hands-on/glass/theme'
import { createApp } from 'vue'
import App from './App.vue'

initTheme()

createApp(App).mount('#app')
```

### 2. Layout-Klassen

Wrap page content in a liquid-glass scope:

```html
<div class="liquid-surface-scope">
  <section class="liquid-surface liquid-surface--accent">
    <h1>Dashboard</h1>
  </section>
</div>
```

Accent variants: `liquid-surface--accent-blue`, `--accent-amber`, `--accent-teal`.

### 3. Theme umschalten

```js
import { theme, setTheme, toggleTheme } from '@hands-on/glass/theme'

setTheme('dark')
toggleTheme()
// theme ist ein Vue ref: theme.value
```

Storage key: `hands-on-theme` (migriert automatisch von Joins altem `node-theme`).

### 4. Fonts

Vite bundelt Fonts automatisch aus dem CSS (`url('../fonts/...')`).

Falls du Fonts statisch unter `/font/` brauchst (z. B. Canvas/`FontFace` ohne Bundle-URL):

```bash
npx --package=@hands-on/glass copy-fonts
# oder: node node_modules/@hands-on/glass/scripts/copy-fonts.mjs
# oder manuell: cp node_modules/@hands-on/glass/fonts/* public/font/
```

Das Script `scripts/copy-fonts.mjs` kopiert nach `./public/font/` relativ zum App-Root.

## CSS structure

| File | Inhalt |
|------|--------|
| `styles/tokens.css` | Fonts, CSS variables, dark mode |
| `styles/base.css` | body, selects, `.field`, touch targets |
| `styles/globals.css` | links, buttons, media defaults |
| `styles/liquid-surface.css` | `.liquid-surface`, `.liquid-surface-scope`, controls |
| `styles/field.css` | `.glass-input`, `.glass-field`, field stacks/rows |
| `styles/button.css` | `.glass-btn-accent`, `--secondary`, `--text`, `--warn`, `--danger`, `--icon`, `.venues-view-btn` |
| `styles/page-tabs.css` | Level-3 page tabs (`.glass-page-tabs`, legacy `.glass-tabs`) |
| `styles/index.css` | single import entry |

### Buttons

Filled CTAs: Accent (brand orange), Warn (gold), Danger (red) — same size, press-in without scale. Secondary is the default glass button. Text is quiet (no fill). Icon is borderless; `.glass-btn-icon--danger` for trash.

```html
<button type="button" class="glass-btn-accent">
  <i class="bi bi-magic" aria-hidden="true"></i>
  Anmeldung starten
</button>
<button type="button" class="glass-btn-secondary">Abbrechen</button>
<button type="button" class="glass-btn-text"><i class="bi bi-arrow-left" aria-hidden="true"></i> Zurück</button>
<button type="button" class="glass-btn-warn">Trotzdem verlassen</button>
<button type="button" class="glass-btn-danger">Löschen</button>
<button type="button" class="glass-btn-icon" aria-label="Bearbeiten"><i class="bi bi-pencil"></i></button>
<button type="button" class="glass-btn-icon glass-btn-icon--danger" aria-label="Löschen"><i class="bi bi-trash3"></i></button>
```

Toggles (keep using the existing three): `.glass-sidebar-footer__pill`, `.glass-sidebar-footer__pref-btn`, `.venues-view-btn`.

### Form fields

```html
<!-- Comfortable (wizard) -->
<label class="glass-field">
  <span class="glass-field__label">Teamname</span>
  <input class="glass-input glass-input--lg liquid-surface-control liquid-surface-control--accent-blue" />
</label>

<!-- Compact (tables) -->
<div class="glass-field-stack">
  <input class="glass-input glass-input--sm liquid-surface-control" type="date" />
  <div class="glass-field-row">
    <input class="glass-input glass-input--sm liquid-surface-control" type="time" />
    <input class="glass-input glass-input--sm liquid-surface-control" type="time" />
  </div>
</div>
```

```js
import GlassField from '@hands-on/glass/field'
import GlassInput from '@hands-on/glass/input'
```

```vue
<GlassField label="PLZ" :invalid="missing" error="Pflichtfeld">
  <GlassInput v-model="zip" size="lg" accent :invalid="missing" />
</GlassField>
```

## Navigation levels

1. **Primary** – sidebar main entries (`AppShell` / `SidebarNavItem`)
2. **Secondary** – sidebar children / submenus (`SidebarNavItem` `children`)
3. **Tertiary** – in-page section tabs (`PageTabs` / `.glass-page-tabs`)

```js
import PageTabs from '@hands-on/glass/page-tabs'
```

```vue
<PageTabs
  aria-label="Ablauf"
  :tabs="[
    { id: 'general', label: 'Allgemein', icon: 'bi-sliders2-vertical', active: true },
    { id: 'blocks', label: 'Blöcke', icon: 'bi-puzzle' },
  ]"
  @select="onTab"
/>
```

## App shell (shared sidebar)

```js
import AppShell from '@hands-on/glass/app-shell'
import SidebarNavItem from '@hands-on/glass/sidebar-nav-item'
```

```vue
<AppShell :open="sidebarOpen" menu-aria-label="Menü" @toggle="sidebarOpen = !sidebarOpen" @update:open="sidebarOpen = $event">
  <template #brand>
    <RouterLink to="/" class="glass-sidebar__brand">
      <img class="glass-sidebar__brand-logo" :src="logo" alt="App" />
    </RouterLink>
  </template>
  <template #nav>
    <SidebarNavItem
      label="Dashboard"
      icon="bi-grid-1x2-fill"
      :active="…"
      :children="[{ label: 'Teams', icon: 'bi-people', active: false }]"
      @select="…"
      @select-child="…"
    />
  </template>
  <template #lower>
    <SidebarFooter
      :identity-aria-label="'Account'"
      :settings-aria-label="'Settings'"
    >
      <template #identity="{ close }">
        <div class="glass-sidebar-footer__menu-header">
          <span class="glass-sidebar-footer__menu-title">Name</span>
        </div>
        <button type="button" class="glass-sidebar-footer__menu-item glass-sidebar-footer__menu-item--danger" @click="logout(); close()">
          <i class="bi bi-box-arrow-right" />
          <span>Logout</span>
        </button>
      </template>
      <template #settings>
        <!-- theme / admin -->
      </template>
      <template #extra="{ close }">
        <button
          type="button"
          class="glass-sidebar-footer__icon-btn"
          aria-label="Help"
          @click="goHelp(); close()"
        >
          <i class="bi bi-question-circle-fill" aria-hidden="true" />
        </button>
      </template>
      <template #partners>
        <!-- partner logos -->
      </template>
    </SidebarFooter>
  </template>
  <div class="glass-app__panel">
    <div class="glass-app__panel-body">
      <RouterView />
    </div>
  </div>
</AppShell>
```

```js
import SidebarFooter from '@hands-on/glass/sidebar-footer'
```

Footer: round icons (person = identity, gear = settings, optional `#extra` for app actions such as help). Nav active state uses FLOW-style accent wash + left bar.

On ≤768px the shell goes edge-to-edge.

- **Default:** floating hamburger; content clearance via `--glass-mobile-chrome-top`
- **App chrome (JOIN):** provide `#mobile-tabs` (and optionally `#mobile-top` / `#mobile-top-actions`) for a top bar + bottom tab bar; the drawer becomes a bottom sheet. Tab buttons use `.glass-app__mobile-tab`. Clearance uses `--glass-mobile-chrome-top` and `--glass-mobile-chrome-bottom`.

Desktop (≥769px): collapse toggle on the brand row shrinks the sidebar to an icon rail (`--glass-sidebar-width-collapsed`). Prefer `SidebarNavItem` so collapsed icons get hover flyouts and expanded items can host submenus.

## Venues catalog (JOIN / HERO / FLOW)

Map + filtered list of public event locations. The host app must depend on `leaflet` and `vue-i18n` and provide the `venues.*` message keys used by JOIN.

```js
import { VenuesCatalog, PublicEventFrame, publicEventPathFromUrl } from '@hands-on/glass/venues'
```

```vue
<VenuesCatalog
  :venues="venues"
  :selected-venue="selected"
  @select="openPublicPage"
  @close="selected = null"
>
  <template #event-extra="{ venue }">
    <!-- optional row overlay, e.g. volunteer needs -->
  </template>
</VenuesCatalog>
```

On select, push an in-app route and render `PublicEventFrame` in the main panel (keep the host sidebar). Add `.glass-app__panel--embed` on that panel. `PublicEventFrame` appends `embed=1` to the public URL.

Grouping: Datum (default), Ort, or Programm — same accordion list in all three.

Optional `#nav-pinned` sits above `#nav` and does not scroll with the rest of the list (e.g. a back item).

## Documents folder list (FLOW / JOIN / HERO)

Presentational SharePoint folder browser: breadcrumbs, enter a folder, JOIN-style tiles. The host app loads the current folder (FLOW/HERO Graph proxy) or maps a loaded tree onto the current path (JOIN) and opens files.

```js
import {
  DocumentsFolderList,
  DocumentViewerModal,
  DocumentOpeningOverlay,
} from '@hands-on/glass/documents'
```

`VenueEventRow` keeps `#default` / host `#event-extra` outside the row button so chips and links stay clickable.

## Was noch nicht enthalten ist (spätere Versionen)

- `CustomSelect` / weitere komplexe Controls
- Floating-label `.field` pattern (noch in JOIN app-lokal)
- Globale `.btn` / `.btn-primary` (noch pro App in scoped styles)
- App-spezifische Content-Patterns (z. B. FLOW `glass-card`)
- App-Switcher in der Sidebar

## Release

Semver tags: `v1.0.0`, `v1.0.1`, … — siehe `CHANGELOG.md`.
