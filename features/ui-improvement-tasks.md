# UI Improvement Tasks — Elementum

> Tasks derived from `/critique`, `/audit`, `/typeset` skill runs + design critique review.
> Ordered by phase: diagnose → quality → enhancement.

---

## Phase 1 — Typeset (Typography Scale Propagation)

Token system already defined in `src/style.css`. These tasks apply the tokens to components.

- [x] **ElementTile** — Replace raw font sizes with `--text-tile-*` tokens (`src/components/ElementTile.vue`)
  - `.tile-number`: `0.55rem` → `var(--text-tile-number)`
  - `.tile-symbol`: inline clamp → `var(--text-tile-symbol)`
  - `.tile-name`: `0.45rem` → `var(--text-tile-name)`
  - `.tile-mass`: `0.43rem` → `var(--text-tile-mass)`

- [x] **FilterBar** — Replace raw font sizes with scale tokens (`src/components/FilterBar.vue`)
  - `.filter-label`: `0.58rem` → `var(--text-2xs)`
  - `.chip`, `.compact-chip`, `.clear-btn`: `0.7rem` / `0.68rem` → `var(--text-xs)`

- [x] **App.vue** — Replace nav link font size with token (`src/App.vue`)
  - `.nav-links a`: `0.875rem` → `var(--text-sm)`

- [x] **DetailModal** — Replace section title font size with token (`src/components/detail/DetailModal.vue`)
  - `.detail-section-title`: `0.6875rem` → `var(--text-xs)`
  - `.detail-nav-label`: `0.75rem` → `var(--text-xs)`

- [x] **PropertiesGrid** — Replace raw sizes with scale tokens (`src/components/detail/PropertiesGrid.vue`)
  - `.properties-title`: `0.6875rem` → `var(--text-xs)`
  - `.property-label`: `0.6875rem` → `var(--text-xs)`
  - `.property-unit`: `0.6875rem` → `var(--text-xs)`
  - `.property-number`: `1rem` → `var(--text-base)`

- [x] **SpectralLines** — Replace raw sizes with scale tokens (`src/components/detail/SpectralLines.vue`)
  - `.spectral-title`: `0.6875rem` → `var(--text-xs)`

- [x] **ElementFunFacts** — Replace raw sizes with scale tokens (`src/components/detail/ElementFunFacts.vue`)
  - `.facts-title`: `0.6875rem` → `var(--text-xs)`
  - `.facts-summary`, `.facts-item`: `0.875rem` → `var(--text-sm)`

- [x] **ElementHeader** — Replace raw sizes with scale tokens (`src/components/detail/ElementHeader.vue`)
  - `.element-header-name`: `1.25rem` → `var(--text-xl)`
  - `.meta-phase`, `.badge-block`: `0.6875rem` → `var(--text-xs)`

- [x] **TrendsView** — Replace raw sizes + apply `--font-mono` token (`src/views/TrendsView.vue`)
  - `.trends-title`: `1.625rem` → `var(--text-2xl)`
  - `.trends-subtitle`: `0.8125rem` → `var(--text-sm)`
  - `.trends-eyebrow`: apply `var(--font-mono)` explicitly (already monospace, make it intentional)

- [x] **CompareView** — Replace raw sizes with scale tokens (`src/views/CompareView.vue`)
  - `.view-title`: `1.5rem` → `var(--text-2xl)`
  - `.view-subtitle`: `0.875rem` → `var(--text-sm)`

- [x] **CompareTable** — Replace raw sizes with scale tokens (`src/components/compare/CompareTable.vue`)
  - `.property-label`: `0.6875rem` → `var(--text-xs)`
  - `.value-text`: `0.9375rem` → `var(--text-base)`

- [x] **ElementSelector** — Replace raw sizes with scale tokens (`src/components/compare/ElementSelector.vue`)
  - `.selector-label`: `0.6875rem` → `var(--text-xs)`
  - `.search-input`, `.selected-placeholder`: `0.8125rem` → `var(--text-sm)`

- [x] **TrendPropertySelector** — Replace raw sizes with scale tokens (`src/components/trends/TrendPropertySelector.vue`)
  - `.selector-pill`: `0.8125rem` → `var(--text-sm)`

---

## Phase 2 — Polish (Correctness & Accessibility Fixes)

### P0 — Blocking

- [ ] **CompareTable broken table semantics** — `display: grid` on `<tr>` breaks screen readers (`src/components/compare/CompareTable.vue:246`)
  - Replace table element with `<div role="table">` grid layout, or restructure to avoid grid on `<tr>`

### P1 — Major (WCAG violations)

- [ ] **FilterBar — Add zero-results empty state** (`src/components/FilterBar.vue` + `src/stores/elementStore.ts`)
  - When `highlightedElements.size === 0` and a filter is active, show inline message: "No elements match these filters." with a "Clear all" link
  - Currently shows 118 dimmed tiles with no feedback — users think the filter is broken

- [ ] **App.vue — Add skip-to-content link** (WCAG 2.4.1) (`src/App.vue`)
  - Add `<a href="#main-content" class="skip-link">Skip to content</a>` as first child of `<header>`
  - Add `id="main-content"` to `<RouterView />` wrapper

- [ ] **DetailModal — Fix empty aria-labelledby** (WCAG 1.3.1) (`src/components/detail/DetailModal.vue`)
  - Guard: only render `aria-labelledby` attribute when `selectedElement` is truthy (currently renders empty string)

- [ ] **CompareTable diff indicators — Wrap in `<span role="img">`** (WCAG 1.4.1) (`src/components/compare/CompareTable.vue`)
  - Diff up/down arrows rely on color only (`#22c55e` / `#ef4444`)
  - SVG `aria-label` on non-focusable elements is not reliably announced — wrap each icon in `<span role="img" aria-label="higher than [element B]">` / `<span role="img" aria-label="lower">`

- [ ] **CompareTable — Replace hardcoded diff colors with CSS vars** (`src/components/compare/CompareTable.vue`)
  - `#22c55e` → `var(--cat-nonmetal)` (or a new `--color-positive`/`--color-negative` token)
  - `#ef4444` → `var(--cat-alkali-metal)`

- [ ] **TableView — Add mobile scroll hint** (WCAG 1.4.10 Reflow) (`src/views/TableView.vue`)
  - `min-width: 820px` on `.table-view-inner` forces horizontal scroll on all phones/tablets in portrait with no affordance
  - Add right-edge `mask-image` fade on `.table-view` + ensure the scroll container has `role="region"` and `aria-label="Periodic table, scrollable"`

- [ ] **ElementFunFacts — Fix index-based keys** (`src/components/detail/ElementFunFacts.vue`)
  - Replace `key="i"` with a stable key (e.g., `key="fact"` or `key="${i}-${fact.slice(0,20)}"`)

### P2 — Minor

- [ ] **CompareView — Replace passive empty state** (`src/views/CompareView.vue`)
  - Current: ⚗ emoji (2rem, opacity 0.4) + italic text "Select two elements above to compare"
  - Replace emoji with a directional SVG icon pointing upward toward the element selectors
  - Add a short instructional hint that draws the eye to the mini periodic grids

- [ ] **FilterBar group chips — Add scroll fade affordance** (`src/components/FilterBar.vue`)
  - Add a CSS `mask-image` right-edge fade to hint that the strip is horizontally scrollable

- [ ] **ElementPhoto shimmer — Respect prefers-reduced-motion** (`src/components/detail/ElementPhoto.vue`)
  - Wrap shimmer `@keyframes` in `@media (prefers-reduced-motion: no-preference)`
  - The global rule in `style.css` leaves one flash; scoped `animation: none` eliminates it entirely

- [ ] **SpectralLines — Respect prefers-reduced-motion** (`src/components/detail/SpectralLines.vue`)
  - Any entrance/shimmer animation on spectral line bars needs `@media (prefers-reduced-motion: no-preference)` guard in scoped styles

### P3 — Polish

- [ ] **Use z-index constants from `zIndex.ts`** — file exists but is never imported (`src/utils/zIndex.ts`)
  - Import and apply in `App.vue` (z:20), `DetailModal.vue` (z:30/40), `ElementTooltip.vue`, `ElementPhoto.vue` lightbox
  - Removes 5+ hardcoded z-index values scattered across components

---

## Phase 3 — Optimize (Performance)

- [x] **TrendChart — Split `chartOptions` computed into static + dynamic** (`src/components/trends/TrendChart.vue`)
  - Static options (colors, grid, toolbar config) computed once
  - Dynamic options (series, labels) update-only on property change
  - Prevents 140+ line object rebuild on every reactive update

- [x] **TrendChart — Sanitize tooltip HTML to fix XSS** (`src/components/trends/TrendChart.vue:154-174`)
  - Template literal `${name}`, `${symbol}` are unsanitized
  - Escape with `.replace(/</g, '&lt;').replace(/>/g, '&gt;')` before inserting into HTML string

- [x] **TrendChart — Note on hardcoded TOKEN colors** (`src/components/trends/TrendChart.vue:12-15`)
  - `TOKEN` object (`textSecondary: "#94a3b8"`, `bgBorder: "#1f2d45"`) bypasses CSS vars — this is an ApexCharts limitation (it cannot read CSS custom properties)
  - Add a comment documenting this constraint so future devs don't try to "fix" it; if the palette changes, TOKEN values must be updated manually

---

## Phase 4 — Arrange (Layout & Spacing)

- [x] **DetailModal — Reorder sections for above-the-fold priority** (`src/components/detail/DetailModal.vue`)
  - Current order: Photo → Spectral Lines → Properties → Electron Config → 3D Model → Fun Facts
  - Revised order: Properties (most useful) → Electron Config → Photo → Spectral Lines → 3D Model → Fun Facts
  - "Above the fold" should show the element header + key properties, not the image

- [x] **TrendsView — Replace `gap: 0` + manual margins with consistent gap** (`src/views/TrendsView.vue`)
  - Remove individual `margin-bottom` from every child
  - Apply single `gap` value on the flex/grid container

- [x] **DetailModal — Cap responsive panel width on narrow screens** (`src/components/detail/DetailModal.vue`)
  - Current: `width: min(680px, 100vw)` — no padding on mobile
  - Change to `width: min(680px, 100vw)` with `padding-inline` or inner safe-area inset

- [x] **FilterBar row spacing** — Standardize gap between category row and period/block/group row (`src/components/FilterBar.vue`)
  - Replace mixed margin/padding with a single flex `gap`

---

## Phase 5 — Animate (Motion Polish)

- [x] **Centralize GSAP timing tokens** — Add CSS custom properties for animation durations (`src/style.css`)
  - `--duration-fast: 150ms`, `--duration-normal: 300ms`, `--duration-slow: 500ms`

- [x] **DetailModal — Fix asymmetric open/close timing** (`src/components/detail/DetailModal.vue`)
  - Open: `0.3s`, Close: `0.22s` — intentional but undocumented
  - Either document with a comment or normalize to `0.25s` both ways

- [x] **FilterBar chip entrance — Add staggered GSAP entrance** (`src/components/FilterBar.vue`)
  - On mount, stagger category chips in with `opacity: 0 → 1`, `y: 4 → 0`
  - Respect `prefers-reduced-motion` (skip stagger, show immediately)

---

## Phase 6 — Delight (Micro-interactions)

- [x] **ElementTile — Enhance hover with subtle border glow pulse** (`src/components/ElementTile.vue`)
  - On hover, animate `box-shadow` from 0 → `0 0 12px 2px var(--category-color)` with short ease

- [x] **CompareTable — Animate row reveal on element selection** (`src/components/compare/CompareTable.vue`)
  - When a second element is chosen, stagger rows in with `opacity: 0 → 1` + `y: 6 → 0`

- [x] **SpectralLines — Animate lines on mount/element change** (`src/components/detail/SpectralLines.vue`)
  - Stagger each spectral line's `opacity` and `scaleY` in when the element changes

- [x] **ElementFunFacts — Stagger facts entrance** (`src/components/detail/ElementFunFacts.vue`)
  - When facts load, stagger list items in with `opacity` + `x` offset

- [x] **TrendChart — Smooth bar transition on property switch** (`src/components/trends/TrendChart.vue`)
  - Use ApexCharts `updateOptions` with `animate: true` instead of full re-render on property change
