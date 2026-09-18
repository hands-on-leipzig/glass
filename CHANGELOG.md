# Changelog

## 1.10.0 — 2026-09-17

Shared button styles.

- Local stories playground: `npm run dev` → [http://localhost:6006](http://localhost:6006), Buttons at `/stories/buttons.html`

- `.glass-btn-accent` — orange CTA, flat fill, press-in (no scale / no orange glow)
- `.glass-btn-secondary` — default glass button
- `.glass-btn-text` — quiet, no fill
- `.glass-btn-warn` / `.glass-btn-danger` — same CTA geometry as accent (gold / red)
- `.glass-btn--sm` / `.glass-btn--block` modifiers
- `.glass-btn-icon` / `.glass-btn-icon--danger` — borderless icon with press-in
- `.venues-view-btn` moved into shared CSS (hover + press-in; active hover keeps `--color-on-accent`)
- Tokens `--color-warn` / `--color-danger` (+ hover / on)
- Sidebar submenu items (`.glass-sidebar__subitem`) press in like the parent nav keys

## 1.9.1 — 2026-09-16

Main panel corners match the sidebar.

- `.glass-app__panel` uses `overflow: hidden` so `backdrop-filter` follows `border-radius` (scroll on `.glass-app__panel-body`)
- `.glass-app__main` uses the same radius so it does not clip the panel shadow into a square

## 1.9.0 — 2026-09-16

SharePoint folder listing for FLOW / JOIN / HERO (`@hands-on/glass/documents`).

- `DocumentsFolderList`: FLOW-style folder browsing, JOIN file/folder tiles
- `DocumentViewerModal` / `DocumentOpeningOverlay` for in-app PDF and image
- `sharePointHost` helpers (PDF/image/.url detection, file-type icons)
- `VenueEventRow`: extra slot sits outside the row button so chips can be clicked

## 1.8.0 — 2026-09-16

Shared venues catalog (`@hands-on/glass/venues`).

- `VenuesCatalog`: map, country/offer filters, date / place / program views, detail modal
- `PublicEventFrame` + `publicEventPathFromUrl` / `publicEventEmbedSrc` for in-shell public event pages
- Host panel class `.glass-app__panel--embed` (no padding, iframe fills the main column)
- Slots `#event-extra`, `#detail-extra`, `#detail-links` for host apps (JOIN schedule, HERO needs)
- Host apps that import the catalog need `leaflet` and `vue-i18n`

## 1.7.4 — 2026-09-07

Optional extra icon in the sidebar footer bar.

- `SidebarFooter` slot `#extra` sits after identity and settings (same round icon-btn row)
- Slot receives `{ close }` so a click can dismiss open popovers; use `.glass-sidebar-footer__icon-btn` for the control

## 1.7.3 — 2026-08-23

Pinned sidebar nav.

- `AppShell` slot `#nav-pinned` sits above the scrolling `#nav` list so a back item stays visible
- Disabled `.glass-sidebar__item` is visibly muted; `SidebarNavItem` accepts optional `title`

## 1.7.2 — 2026-08-20

Sidebar child icons can be images.

- `SidebarNavItem` children accept `iconSrc` (program logos) in addition to Bootstrap `icon`

## 1.7.1 — 2026-08-13

Mobile bottom sheet polish.

- Swipe down (handle or pull from top of sheet) dismisses the `#mobile-tabs` drawer
- Real sheet handle replaces the CSS `::before` grabber

## 1.7.0 — 2026-08-13

Mobile app chrome (optional).

- `AppShell` slots `#mobile-top`, `#mobile-top-actions`, `#mobile-tabs`
- When `#mobile-tabs` is provided: top bar + bottom tab bar on ≤768px; drawer becomes a bottom sheet
- Without `#mobile-tabs`: legacy floating hamburger (FLOW unchanged)
- Tab button helper class `.glass-app__mobile-tab` (+ `--active` / `--more`)

## 1.6.1 — 2026-08-07

Sidebar submenu accordion.

- Only one expanded-sidebar submenu stays open at a time (`AppShell` provide/inject)
- Opening another parent closes the previous; chevron still toggles the active one

## 1.6.0 — 2026-08-04

Tertiary in-page tabs (nav level 3).

- New `PageTabs` (`@hands-on/glass/page-tabs`) + `styles/page-tabs.css`
- Document-style folder tabs (rounded top, baseline, active tab joins content)
- Legacy `.glass-tabs` / `.glass-tab` restyled to match for FLOW compatibility

## 1.5.0 — 2026-08-04

Collapsible desktop sidebar (icon rail) + submenu support.

- `AppShell`: `collapsed` / `update:collapsed`, desktop collapse toggle, optional `localStorage` persistence
- Collapsed rail: icons only, compact brand + partner logos; footer menus open to the right
- New `SidebarNavItem` (`@hands-on/glass/sidebar-nav-item`): accordion submenus when expanded, hover/focus flyouts when collapsed
- Provide/inject `glassSidebarCollapsed` for consumers

## 1.4.2 — 2026-08-03

Tighter phone content gutters.

- Further reduce `.glass-app__panel` horizontal padding on ≤768 / ≤420
- Native date/time fields keep `min-width: 0` so half-width grids don’t clip values

## 1.4.1 — 2026-08-03

Fix toggle switches squashed into circles on touch devices.

- Coarse-pointer `min-height: var(--touch)` no longer applies to `button[role=switch]` / `role=slider`
- Compact controls can still opt out via `.no-touch-min`

## 1.4.0 — 2026-08-03

Denser mobile app shell for JOIN and FLOW.

- Phone layout goes edge-to-edge (no floating outer frame around the main panel)
- Menu toggle clearance uses safe-area + `--glass-mobile-chrome-top` (fixes notch overlap)
- Tighter panel / sidebar / nav spacing on ≤768px; flatter panel (no side borders/radius/shadow)
- Landscape short viewports reclaim extra vertical chrome
- Form field gaps / horizontal padding tighten on narrow screens

## 1.3.0 — 2026-08-02

Shared form field / input basis for JOIN and FLOW.

- Add `styles/field.css`: `.glass-input` sizes (`sm` / default / `lg`), `.glass-field`, stacks/rows
- Geometry aligned with JOIN wizard inputs (`lg`: ~3rem height, comfortable padding)
- Compact `sm` size for dense tables; moderate corner radius (8–12px), not pills
- Stronger padding inside fields (incl. native date/time)
- `.liquid-surface-control` no longer forces `radius-lg` (was capsule on short fields)
- Add Vue `GlassField` + `GlassInput` wrappers
- Exports: `./field`, `./input`, `./styles/field.css`

## 1.2.1 — 2026-08-01

Fix SidebarFooter popover layout.

- Anchor menus to the full footer bar (not the tiny icon buttons)
- Opaque panel background so sidebar content no longer shows through
- Only the nav scrolls; footer chrome stays overflow-visible for popovers

## 1.2.0 — 2026-08-01

Shared sidebar footer chrome for JOIN and FLOW.

- Add `SidebarFooter` with round identity (person) + settings (gear) icon buttons
- Popover menus with shared item / pref / pill styles
- Slots: `prepend`, `guest`, `identity`, `settings`, `partners`
- Export `./sidebar-footer` and `./styles/sidebar-footer.css`

## 1.1.1 — 2026-08-01

Fix AppShell package exports for Vite consumers.

- Export `./app-shell`, `./components/AppShell`, and `./components/*`
- Keep `./components/AppShell.vue` for compatibility

## 1.1.0 — 2026-08-01

Shared app shell / sidebar chrome for JOIN and FLOW.

- Add `styles/app-shell.css` (layout, sidebar, nav items, partners, mobile drawer)
- Add Vue `components/AppShell.vue` with brand / nav / lower / main slots
- Hybrid look: JOIN logo placement + icon rows, FLOW active accent bar
- Export `./components/AppShell.vue` and `./styles/app-shell.css`

## 1.0.2 — 2026-08-01

Canonical package naming and consumer docs.

- Document package as `@hands-on/glass` everywhere (removed leftover `@hands-on/design`)
- Align `package.json` version with release tags
- Clarify GitHub install (`hands-on-leipzig/glass`) and font copy script paths

## 1.0.1 — 2026-05-28

Package rename.

- Published as `@hands-on/glass` (repo/package formerly referred to as design)

## 1.0.0 — 2026-05-28

Initial release extracted from Join (`node`).

- CSS tokens (`--color-*`, `--orbit-*`, `--liquid-*`)
- Light/dark theme via `html[data-theme]`
- Liquid glass surfaces (`.liquid-surface`, `.liquid-surface-scope`)
- Form select styling (`.select-fancy`, `.form select`, …)
- Theme module with `initTheme`, `setTheme`, `toggleTheme`
- Fonts: Uniform, Poppins
- Legacy migration from Join `node-theme` → `hands-on-theme`
