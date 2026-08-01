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
"@hands-on/glass": "github:hands-on-leipzig/glass#v1.1.1"
```

### Option C: private npm registry

```bash
npm install @hands-on/glass@1.1.1
```

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
| `styles/index.css` | single import entry |

## App shell (shared sidebar)

```js
import AppShell from '@hands-on/glass/app-shell'
```

```vue
<AppShell :open="sidebarOpen" menu-aria-label="Menü" @toggle="sidebarOpen = !sidebarOpen" @update:open="sidebarOpen = $event">
  <template #brand>
    <RouterLink to="/"><img class="glass-sidebar__brand-logo" :src="logo" alt="App" /></RouterLink>
  </template>
  <template #nav>
    <RouterLink class="glass-sidebar__item" active-class="glass-sidebar__item--active" to="/…">
      <span class="glass-sidebar__item-icon"><i class="bi bi-grid-1x2-fill" /></span>
      <span class="glass-sidebar__item-label">Dashboard</span>
    </RouterLink>
  </template>
  <template #lower>
    <div class="glass-sidebar__footer"><!-- profile / actions --></div>
    <div class="glass-sidebar__partners"><!-- partner logos --></div>
  </template>
  <div class="glass-app__panel">
    <RouterView />
  </div>
</AppShell>
```

Nav item active state uses FLOW-style accent wash + left bar. Brand + icon rows follow JOIN.

## Was noch nicht enthalten ist (spätere Versionen)

- Weitere Vue components (`CustomSelect`, …)
- Globale `.btn` / `.btn-primary` (noch pro App in scoped styles)
- App-spezifische Content-Patterns (z. B. FLOW `glass-card`)
- App-Switcher in der Sidebar

## Release

Semver tags: `v1.0.0`, `v1.0.1`, … — siehe `CHANGELOG.md`.
