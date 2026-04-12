# TASKS.md — Elementum

---

## Overview

Organized as Epics → Tasks → Subtasks. Each task is self-contained and can be handed to an engineer or AI coding agent independently.

---

## Epic 1 — Project Setup & Foundation

**Task 1.1 — Scaffold Vue 3 + Vite project**

- Init project: `bun create vite@latest elementum -- --template vue-ts` - this is already done by me
- Install dependencies: `bun add tailwindcss pinia vue-router gsap @tresjs/core @tresjs/cientos vue3-apexcharts apexcharts vueuse lucide-vue-next`
- Configure Tailwind with custom design tokens (bg, accent, category colors)
- Set up global CSS: base reset, root variables, animation keyframes
- Configure path aliases in vite.config.ts (`@/` → `src/`)
- Also, install and configure biome for linting and formatting.

**Task 1.2 — Set up routing**

- Install and configure Vue Router 4
- Define routes: `/`, `/compare`, `/trends`
- Add `RouterView` in App.vue
- Lazy-load CompareView and TrendsView

**Task 1.3 — Set up Pinia stores**

- Create `elementStore.ts` with full state/getters/actions spec
- Create `uiStore.ts` with panel/mode state
- Wire stores to App.vue on init

**Task 1.4 — Load and type element data**

- Source elements.json from Bowserinator/Periodic-Table-JSON
- Extend each element with `xpos`, `ypos`, `spectralLines`, `funFacts`, `compounds` fields
- Define `Element` TypeScript interface in `types/element.ts`
- Define `ElementCategory` union type
- Load JSON in `elementStore` on app mount

---

## Epic 2 — Periodic Table Grid

**Task 2.1 — Build PeriodicGrid layout**

- Implement 18-column CSS grid container
- Map all 118 elements to correct grid positions using `xpos`/`ypos`
- Place empty gap cells for correct table shape
- Place lanthanide/actinide rows below main table with separator label

**Task 2.2 — Build ElementTile component**

- Render: symbol (large), atomic number (top-left), name (bottom), atomic mass (bottom-right)
- Apply category color as border-left or background tint
- Implement hover: scale(1.08) + category glow box-shadow (CSS transition 150ms)
- Emit `click` → triggers `selectElement` in store
- Use `v-memo="[element.atomicNumber, isHighlighted, isDimmed]"` for performance
- Apply dim opacity (0.15) when filter is active and element doesn't match

**Task 2.3 — Page load stagger animation**

- Use GSAP `stagger` to animate all tiles in on first load
- Stagger: 0.008s per tile, fade in + translateY(10px → 0)
- Trigger once on TableView mount

**Task 2.4 — Build LegendBar**

- Render color swatches for all 11 element categories
- Clicking a category swatch sets category filter in store
- Active category is visually indicated

---

## Epic 3 — Search & Filter

**Task 3.1 — Build SearchBar**

- Text input in AppHeader
- On input: call `setSearchQuery` in elementStore
- Debounce: 150ms
- Clear button (×) to reset query
- Keyboard shortcut: `/` to focus search (via VueUse)

**Task 3.2 — Implement search logic**

- In `useElementSearch.ts`: filter elements where name, symbol, or atomicNumber matches query (case-insensitive)
- Update `highlightedElements` set in store
- Non-matching elements get dim class

**Task 3.3 — Build FilterBar**

- Filter chip groups: Category, Period (1–7), Group (1–18), Block (s/p/d/f)
- Active chip is highlighted
- Clicking active chip clears filter
- Chips scroll horizontally on overflow

**Task 3.4 — Implement filter logic**

- In `useElementFilter.ts`: compute which elements match the active filter
- Apply highlight/dim states via store
- Animate transition: GSAP opacity tween on dimmed elements (200ms)
- "Clear all" button resets filter and search

---

## Epic 4 — Element Detail Panel

**Task 4.1 — Build DetailModal container**

- Full-screen overlay with dark backdrop
- Slides in from right (GSAP, 300ms) on `detailPanelOpen` = true
- Close on: ESC key, backdrop click, close button
- Scrollable content area
- Trap focus while open

**Task 4.2 — Build ElementHeader**

- Large symbol display with category color accent
- Full name, atomic number, atomic mass
- Category badge (GlowBadge component)
- Phase indicator (solid/liquid/gas) with icon

**Task 4.3 — Build PropertiesGrid**

- Card grid layout (2–3 columns)
- Cards for: electronegativity, ionization energy, electron affinity, atomic radius, density, melting point, boiling point, oxidation states, discoverer, year discovered
- Each card: label + value + unit
- Null values shown as "—"

**Task 4.4 — Build ElectronConfigVisualizer**

- SVG-based concentric circles for shells K through Q
- Electron count per shell from `electronShells` array
- Animate electrons filling in shell by shell on mount (CSS animation with delay)
- Spectroscopic notation string displayed below diagram
- Color electrons with accent cyan

**Task 4.5 — Build AtomModel3D**

- Lazy load component (dynamic import)
- TresJS canvas with dark background
- Nucleus: sphere with proton (red) + neutron (gray) representation (simplified for visual)
- Electron shells: torus rings at correct radii
- Electrons: small spheres orbiting on each shell
- Animation: continuous rotation using TresJS `useRenderLoop`
- Correct electron count per shell

**Task 4.6 — Build SpectralLines**

- Horizontal bar showing emission spectral lines as colored vertical stripes
- Colors sourced from `spectralLines` hex array on element
- Label: "Emission Spectrum"
- Graceful fallback if no data

**Task 4.7 — Build ElementFunFacts**

- Sections: "Common Uses", "Key Compounds", "Fun Facts"
- List rendering with subtle bullet styling
- Show "No data available" gracefully for unknown elements

---

## Epic 5 — Element Comparison

**Task 5.1 — Build CompareView layout**

- Two-column layout with ElementSelector on each side
- Shared CompareTable in center/below
- "Clear" button per side

**Task 5.2 — Build ElementSelector**

- Search input + filtered element list dropdown
- Or: mini periodic grid picker (preferred — more visual)
- Selected element shows name, symbol, category badge

**Task 5.3 — Build CompareTable**

- Rows for each comparable property
- Two value columns
- Diff indicator: up/down arrow + color (green if higher, red if lower) for numeric properties
- Properties to compare: all numeric properties + configuration + category

---

## Epic 6 — Trend Visualizer

**Task 6.1 — Build TrendsView layout**

- TrendPropertySelector dropdown at top
- TrendChart fills remaining space
- Brief description of the selected trend below selector

**Task 6.2 — Build TrendPropertySelector**

- Dropdown or segmented control
- Properties: Atomic Radius, Electronegativity, Ionization Energy, Electron Affinity, Density, Melting Point, Boiling Point
- Selection updates `activeTrendProperty` in uiStore

**Task 6.3 — Build TrendChart**

- ApexCharts bar chart
- X axis: element symbols (all 118, or filtered by period)
- Y axis: property value with unit
- Color bars by element category
- Chart animates in on mount and on property change (animateGradually)
- Bar hover: tooltip showing element name + value; highlights element on table (if table is visible)
- Handle null values gracefully (skip or show as 0 with indicator)

**Task 6.4 — Implement trendData utility**

- `getTrendSeries(property, elements)` → returns `{ name, value, category }[]` sorted by atomic number
- Handle unit formatting per property

## **Task 6.5 - detailed verification list**

## Epic 7 — Polish & Animations

**Task 7.1 — Global glow system**

- Define CSS custom property `--category-color` on each ElementTile
- Glow uses this variable: `box-shadow: 0 0 12px 2px var(--category-color)`
- Pulse keyframe animation for "active/selected" state

**Task 7.2 — Filter transition animation**

- GSAP batch tween: on filter change, tween opacity of dimmed elements to 0.15
- On filter clear, tween all back to 1.0
- Duration: 200ms, ease: power2.out

**Task 7.3 — Detail modal animation**

- GSAP timeline: backdrop fade in (opacity 0→0.8) + panel slide in (x: 100%→0)
- On close: reverse timeline
- Duration: 300ms

**Task 7.4 — Keyboard navigation**

- ESC → close detail panel
- `/` → focus search
- Left/right arrows → navigate between elements when detail panel is open

**Task 7.5 — Tooltip on hover**

- Small tooltip above element on hover (not click)
- Shows: full name, atomic number, atomic mass, phase
- Appears after 300ms hover delay
- Positioned with VueUse `useElementBounding`

**Task 7.6 — Data completeness audit**

- Verify all 118 elements have required fields populated
- Spot-check spectral lines, fun facts, compounds for well-known elements (H, C, O, Fe, Au, U)
- Null values for unknown elements are acceptable — verify they render as `"—"` not crashing

## **Task 7.7 - detailed verification list**

## Epic 8 — Performance & Accessibility Audit (Lighthouse ≥ 90)

**Task 8.1 — Reduced motion baseline**

- Add `prefers-reduced-motion` block to `base.css` — disables all transitions/animations for affected users
- Verify the app is fully usable with all animations disabled (no functionality depends on animation completing)

**Task 8.2 — Accessibility audit**

- Run Lighthouse Accessibility on production build — target ≥ 90
- Fix all critical issues first: missing aria labels, non-semantic interactive elements, missing focus rings
- Verify keyboard-only navigation: Tab through entire app, trigger detail modal, close with Escape, use search with `/`
- Verify focus trap in detail modal (VueUse `useFocusTrap`)
- Verify focus returns to triggering ElementTile on modal close
- Test color contrast — all text must meet WCAG AA (4.5:1 normal, 3:1 large text)
- Verify category colors are never the sole indicator of state — opacity is always paired

**Task 8.3 — Performance audit**

- Run Lighthouse Performance on production build (`bun run build && bun run preview`) — target ≥ 90
- Verify `AtomModel3D` and `TrendChart` are NOT in the initial bundle (check Vite bundle analyzer)
- Verify `v-memo` is working — profile filter interaction, ensure < 200ms INP
- Verify no layout-thrashing animations — use Chrome DevTools Performance tab, check for purple "Layout" bars
- Check LCP: periodic table grid should be fully rendered within first paint
- Check CLS: no layout shifts when detail modal opens (`v-show` confirmed, not `v-if`)

**Task 8.4 — Core Web Vitals**

- LCP ≤ 2.5s — periodic table grid is the LCP element
- CLS ≤ 0.1 — no layout shifts; detail panel uses `v-show`
- INP ≤ 200ms — filter/search interactions respond immediately

**Task 8.5 — Cross-browser testing**

- Test in Chrome, Firefox, Safari
- Verify GSAP animations play correctly in all three
- Verify TresJS/Three.js WebGL renders in all three
- Verify CSS custom properties (`--ease-out-quart`, `--category-color`) resolve correctly

**Task 8.6 — Animation quality review**

- Squint test on all animated transitions — motion feels natural, not mechanical
- Verify no bounce or elastic easing anywhere
- Verify all exit animations are ~75% duration of their enter counterparts
- Verify 3D atom model holds 60fps — profile with Chrome DevTools

**Task 8.7 — Layout & spacing review**

- Squint test on all views — hierarchy readable without reading text
- Verify spacing uses Tailwind scale only — grep for arbitrary margin/padding values
- Verify semantic z-index scale is used — grep for hardcoded z-index numbers
