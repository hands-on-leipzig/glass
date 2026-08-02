# Changelog

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
