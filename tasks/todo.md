# Elementum — Task List

> See `SPEC.md` for scientific accuracy fix specifications (Phase 0).

---

## Phase 0 — Scientific Accuracy & UX Fixes

> Source: Dr. Eric Scerri expert review (April 2026). Ref: `SPEC.md`.
> **Complete Phase 0 before any Phase 1 work.** These are correctness issues, not enhancements.

---

### Group A — Zero-Risk Fixes (1-line / additive only)

- **S-1** — ✅ Fix electronegativity unit in `src/utils/trendData.ts` line 36: change `unit: ""` to `unit: "Pauling"` so the TrendChart y-axis and tooltip correctly display the Pauling scale label
  - **Files:** `src/utils/trendData.ts`
  - **Verify:** Open Trends view → select Electronegativity → confirm y-axis reads "Pauling"
- **S-2** — ✅ Add Bohr model disclaimer to `src/components/detail/AtomModel3D.vue`: add a `<p class="model-disclaimer">` element below the `.atom-hint` paragraph with text "Simplified shell model — actual electron positions are described by quantum probability distributions". Style using `--text-muted`, `0.6rem` font size, centered, no pointer events.
  - **Files:** `src/components/detail/AtomModel3D.vue`
  - **Verify:** Open any element detail → 3D model panel shows disclaimer text below "Drag to rotate · Scroll to zoom"

---

### Group B — Data Fixes

- **S-3** — ✅ Audit and fix all negative `vanDerWaalsRadius` values in `src/data/elements.json`. Known negatives: H (−259.14 → 120), He (−272.05 → 140), F (−363 → 147), Ar (−189.34 → 188). Audit all 118 elements for any remaining negative radii values (`atomicRadius`, `covalentRadius`, `vanDerWaalsRadius`). Set to correct positive pm values or `null` if unknown.
  - **Files:** `src/data/elements.json`
  - **Verify:** Search JSON for `"vanDerWaalsRadius": -` — zero results. Check H, He, F, Ar, Ne in the detail panel show positive values.

---

### Group C — Additive Feature Rows

- **S-4** — Add 4 missing property rows to `src/components/compare/CompareTable.vue`. Append to `ROW_DEFS` after the `"Atomic Radius"` entry:
  1. `{ label: "Van der Waals Radius", unit: "pm", isNumeric: true, getValue: (el) => el.vanDerWaalsRadius }`
  2. `{ label: "Thermal Conductivity", unit: "W/(m·K)", isNumeric: true, getValue: (el) => el.thermalConductivity }`
  3. `{ label: "Mohs Hardness", unit: "Mohs", isNumeric: true, getValue: (el) => el.mohsHardness }`
  4. `{ label: "Crystal Structure", isNumeric: false, getValue: (el) => el.crystalStructure }`
  - **Files:** `src/components/compare/CompareTable.vue`
  - **Verify:** Compare Fe vs Cu → four new rows visible with correct values and "—" for nulls

---

### Group D — New Utility + Refactor

- **S-5** — Create `src/utils/wavelength.ts` with a pure `wavelengthToRgb(wavelength: number): string` function using Bruton's algorithm:
  - Input range: 380–780 nm → returns hex color string (e.g. `"#ff0000"`)
  - Inputs outside 380–780 → return `"transparent"`
  - Apply intensity falloff for 380–420 nm and 700–780 nm (fade edges to dim)
  - Export as named constant: `VISIBLE_MIN = 380`, `VISIBLE_MAX = 780`
  - **Files:** `src/utils/wavelength.ts` (new file)
  - **Verify:** `wavelengthToRgb(656.3)` ≈ `#ff0000`; `wavelengthToRgb(486.1)` ≈ blue-cyan; `wavelengthToRgb(200)` = `"transparent"`
- **S-6** — Refactor `src/components/detail/SpectralLines.vue` to use `wavelengthToRgb` from S-5. Remove `line.color` usage from the `:style` binding; replace with `wavelengthToRgb(line.wavelength)` for both `backgroundColor` and `boxShadow`. Update the prop type: `lines: { wavelength: number; color?: string }[]` (make `color` optional).
  - **Files:** `src/components/detail/SpectralLines.vue`
  - **Depends on:** S-5
  - **Verify:** Open Hydrogen → spectral lines show: 656.3 nm = red, 486.1 nm = cyan-blue, 434 nm = violet, 410.2 nm = deep violet. Open Sodium → D-doublet (589.0, 589.6 nm) shows yellow-orange.

---

### Group E — Layout Addition

- **S-7** — Add Group 1–18 column headers and Period 1–7 row labels to `src/components/PeriodicGrid.vue`.
  **Group headers (above main grid):**
  - Add `<div class="grid-group-headers">` immediately before `.main-grid` inside the template
  - Render 18 `<div>` children labeled "1" through "18" using `v-for`
  - Use `display: grid; grid-template-columns: repeat(18, 1fr); gap: 3px` — identical column sizing to `.main-grid`
  - Style: `font-size: 0.5rem`, `color: var(--text-muted)`, `text-align: center`, `opacity: 0.6`
  - Add `role="columnheader"` and `aria-label="Group N"` per cell
  **Period labels (left of main grid rows):**
  - Wrap `.main-grid` and a new `.period-labels` column in a `<div class="main-grid-wrapper">` with `display: flex; gap: 3px`
  - `.period-labels`: `display: grid; grid-template-rows: repeat(7, 1fr); gap: 3px` — 7 rows matching the main grid
  - Each cell labeled "1" through "7", same style as group headers
  - Add `role="rowheader"` and `aria-label="Period N"` per cell
  - **Files:** `src/components/PeriodicGrid.vue`
  - **Verify:** Main table shows "1–18" across the top, "1–7" down the left. Labels are muted and do not interfere with tile layout. F-block rows have NO period labels.

---

### Group F — 3D Model Scientific Fixes (most complex)

- **S-8** — Remove the 8-electron-per-shell cap in `src/components/detail/AtomScene.vue`. In `electronPositions()`, remove the `const cap = Math.min(count, 8)` line and use `count` directly. For shells with `count > 16`, split electrons across two concentric tori at the same shell radius: inner ring (10 electrons at `radius`) and outer ring (remaining electrons at `radius + 0.08`). Cap total rendered electrons per shell at 32 (the true quantum maximum for any shell).
  - **Files:** `src/components/detail/AtomScene.vue`
  - **Verify:** Gold (Z=79) shell 4 shows more than 8 electrons. Hydrogen shell 1 still shows 1. Carbon shells show [2, 4]. No visible frame rate drop.
- **S-9** — Replace the hardcoded `NUCLEUS_PARTICLES` array in `src/components/detail/AtomScene.vue` with a dynamic `buildNucleus(atomicNumber, atomicMass)` function. Approach:
  - Constants: `MAX_NUCLEUS_PARTICLES = 24`
  - Compute `protons = atomicNumber`, `neutrons = Math.round(atomicMass) - atomicNumber`
  - If `protons + neutrons <= MAX_NUCLEUS_PARTICLES`: place exact particles
  - Else: sample proportionally — `showProtons = Math.round((protons / (protons + neutrons)) * MAX_NUCLEUS_PARTICLES)`, `showNeutrons = MAX_NUCLEUS_PARTICLES - showProtons`
  - Distribute particles randomly within a sphere of radius `0.18 * Math.cbrt(atomicNumber / 6)` (nucleus scales with ∛Z for visual intuition)
  - Red (`#ef4444`) = protons, Blue (`#3b82f6`) = neutrons
  - Pass `element.atomicNumber` and `element.atomicMass` as props down from `AtomModel3D.vue` → `AtomScene.vue`
  - Update `AtomScene.vue` props interface: add `atomicNumber: number`, `atomicMass: number`
  - Update `AtomModel3D.vue` template: pass `:atomic-number="element.atomicNumber"` and `:atomic-mass="element.atomicMass"` to `<AtomScene>`
  - **Files:** `src/components/detail/AtomScene.vue`, `src/components/detail/AtomModel3D.vue`
  - **Depends on:** S-8 (same file, complete together)
  - **Verify:** Hydrogen shows 1 red + 0 blue particles (tiny nucleus). Carbon shows ~12 particles. Gold shows 24 particles with ~40% red (protons). Oganesson nucleus visually larger than Carbon's.

---

### ✅ Checkpoint: Phase 0 Complete

- `bun run build` passes with zero TypeScript errors
- Trends view → Electronegativity y-axis reads "Pauling"
- Any element detail → vdW radius is positive (check H, He, F, Ar)
- Compare Fe vs Cu → shows Van der Waals Radius, Thermal Conductivity, Mohs Hardness, Crystal Structure rows
- Hydrogen spectral lines: 656.3 nm = red, 410.2 nm = deep violet (computed, not hardcoded)
- Periodic grid has Group 1–18 headers and Period 1–7 labels
- Gold 3D model shows more than 8 electrons in shell 4
- Hydrogen 3D nucleus ≠ Gold 3D nucleus (visually different size and particle count)
- Bohr model disclaimer visible on 3D panel

---

## Data Pipeline (run before / in parallel with Phase 1)

- **DP-0** — Extend `src/types/element.ts` with new fields: `Isotope`, `HazardLevel`, `isotopes[]`, `etymology`, `industrialUses`, `naturalOccurrence`, `hazardLevel`, `discoveryCountry`, `discoveryMethod`, `discoveryStory`, `storyHeadline`, `storyBody`, `discovererPortrait` — Impl / Test
- **DP-1** — `scripts/fetchers/wikidata.ts` — SPARQL batch query for discovery + etymology + abundance data → `scripts/output/wikidata.json` — Impl / Test
- **DP-2** — `scripts/fetchers/iaea-isotopes.ts` — fetch all nuclides from IAEA LiveChart, keep top 5 per element → `scripts/output/isotopes.json` — Impl / Test
- **DP-3** — `scripts/fetchers/pubchem.ts` — GHS hazard classification per element → `scripts/output/hazards.json` — Impl / Test
- **DP-4** — `scripts/fetchers/generate-stories.ts` — Claude API story generation (storyHeadline + storyBody) with prompt caching → `scripts/output/stories.json` — Impl / Test
- **DP-5** — `scripts/collect-data.ts` (parallel orchestrator) + `scripts/merge.ts` (merge all outputs into `src/data/elements.json`) — Impl / Test
- **DP-6** — Run full pipeline; validate output; confirm `bun run build` passes — Impl / Test

### ✅ Checkpoint: Data Pipeline

- `bun run scripts/collect-data.ts && bun run scripts/merge.ts` runs without error
- `src/data/elements.json` has enriched fields for majority of elements
- `bun run build` passes with no TS errors

---

## Phase 1 — High Impact (Epics E, B, F)

### Epic E — Property Color Modes on Main Table

- **E-1** — Add `colorMode: TrendProperty | "category"` to `uiStore.ts`; create `src/composables/usePropertyColor.ts` with `getPropertyColor(element, colorMode)` function
- **E-2** — Build `src/components/table/ColorModeSelector.vue` (dropdown) + `src/components/table/ColorLegend.vue` (gradient bar); wire into `TableView.vue`
- **E-3** — Modify `src/components/ElementTile.vue` to apply gradient background when `colorMode !== "category"`; add CSS transition between modes

### ✅ Checkpoint: Epic E

- Color mode selector visible and functional; switching modes recolors all tiles
- Legend shows min/max for active property; hidden in category mode
- No regression in category filter or search highlight behavior

---

### Epic B — Advanced Element Detail (Isotopes, Etymology, Safety)

> **Requires DP-5 for real data**, but B-1 can be built before data is enriched (tabs with null fallbacks).

- **B-1** — Refactor `DetailModal.vue` into tabbed layout using new `DetailTabs.vue`; existing content moves to "Overview" tab; other tabs are empty shells — Impl / Test
- **B-2** — Build `src/components/detail/IsotopeExplorer.vue`; render in "Isotopes" tab — Impl / Test
- **B-3** — Build `src/components/detail/EtymologySection.vue` + `RealWorldSection.vue`; render in respective tabs — Impl / Test
- **B-4** — Build `src/components/detail/SafetySection.vue`; render in "Safety" tab — Impl / Test

### ✅ Checkpoint: Epic B

- Click H, C, F, Ne, Na, U — all 5 tabs render (with data or graceful fallbacks)
- Overview tab looks identical to pre-refactor DetailModal (no regression)

---

### Epic F — Bookmarks & Keyboard Navigation

- **F-1** — Create `src/stores/bookmarkStore.ts` (Pinia, localStorage via `useLocalStorage`); build `src/components/BookmarkButton.vue`; add star button to `ElementTile.vue` (on hover) and `DetailModal.vue` header
- **F-2** — Build `src/components/BookmarksPanel.vue` (slide-in panel with mini element grid); add bookmark icon + count badge to `App.vue` nav
- **F-3** — Create `src/composables/useKeyboardNav.ts`; wire arrow key navigation into `PeriodicGrid.vue`; `Enter` opens detail, `ESC` closes modal

### ✅ Checkpoint: Phase 1 complete

- All builds pass, zero TS errors
- Color mode, tabbed detail modal, bookmarks, and keyboard nav all working
- **Human review before Phase 2**

---

## Phase 2 — Core Feature Additions (Epics A, C, I)

### Epic A — Quiz Mode

- **A-1** — Create `src/utils/quizGenerator.ts` (question + distractor generation) + `src/composables/useQuizLogic.ts` (session state) + `src/stores/quizStore.ts` (score/streak persistence) — Impl / Test
- **A-2** — Build `src/views/QuizView.vue` + `src/components/quiz/QuizModeSelector.vue`; add `/quiz` route to router + nav link — Impl / Test
- **A-3** — Build `src/components/quiz/FlashCard.vue` with GSAP 3D flip animation — Impl / Test
- **A-4** — Build `src/components/quiz/MultipleChoiceCard.vue` + `QuizScoreboard.vue` + `QuizResults.vue` — Impl / Test

### ✅ Checkpoint: Epic A

- Complete a round in all 3 modes (Flashcard, MCQ, Challenge)
- Score increments correctly; best score persists on reload

---

### Epic C — Discovery Timeline

> **Requires DP-5** for `discoveryYear`, `discoverer`, `discoveryCountry` data.

- **C-1** — Build `src/views/TimelineView.vue` (horizontal scroll, era bands) + `src/components/timeline/TimelineEraLabel.vue`; add `/timeline` route + nav link
- **C-2** — Build `src/components/timeline/TimelineAxis.vue` + `TimelineElementCard.vue`; create `src/composables/useTimelineFilter.ts`; wire click → `DetailModal`
- **C-3** — Build `src/components/timeline/TimelineFilters.vue` (era, country, method filters with chip dismissal)

### ✅ Checkpoint: Epic C

- Timeline scrollable, era bands visible, element cards clickable (open detail modal)
- Filters reduce visible elements correctly

---

### Epic I — Advanced Search

- **I-1** — Extend `src/composables/useElementSearch.ts` to parse structured tokens: `period:N`, `group:N`, `EN > N`, `mp > N`, category shorthands (`metal`, `noble`, `halogen`) — Impl / Test
- **I-2** — Add active filter chips to `src/components/SearchBar.vue`; each chip has × dismiss; add ? syntax help popover — Impl / Test

### ✅ Checkpoint: Phase 2 complete

- `/quiz`, `/timeline` routes accessible from nav
- Advanced search: `period:2 EN > 3.0` returns F, O, N
- `bun run build` passes
- **Human review before Phase 3**

---

## Phase 3 — Deep Features (Epics D, G)

### Epic D — Chemistry Tools

- **D-1** — Create `src/utils/formulaParser.ts` (parse H2O, Fe2(SO4)3, nested parens); build `src/components/tools/MolarMassCalculator.vue` — Impl / Test
- **D-2** — Create `src/utils/bondCalculator.ts` (EN diff → bond type); build `src/components/tools/BondTypePredictor.vue` + `CompoundPredictor.vue` — Impl / Test
- **D-3** — Build `src/views/ToolsView.vue` (3 tabs); add `/tools` route + nav link — Impl / Test

### ✅ Checkpoint: Epic D

- `H2O` → 18.015 g/mol; `Na + Cl` → ionic bond; `/tools` route works

---

### Epic G — Element Stories & Real World Context

> **Requires DP-5** for `storyHeadline`, `storyBody`, abundance data.

- **G-1** — Build `src/views/StoriesView.vue` (card grid) + `src/components/stories/ElementStoryCard.vue`; add `/stories` route + nav link
- **G-2** — Build `src/components/detail/AbundanceInContext.vue` (ApexCharts bar chart); integrate into `RealWorldSection.vue` in detail modal

### ✅ Checkpoint: Phase 3 complete

- `/tools` all 3 calculators functional
- `/stories` cards visible for elements with story data
- Abundance chart renders in Real World tab
- **Human review before Phase 4**

---

## Phase 4 — Prestige Features (Epic H)

### Epic H — Nuclear & Physics Reference

- **H-1** — Add d3.js dependency (lazy import only); extend `src/types/element.ts` with nuclear types (`NuclideEntry`, `DecayChainNode`); extend IAEA script for decay chains → `scripts/output/nuclear.json`
- **H-2** — Build `src/components/nuclear/BindingEnergyCurve.vue` (ApexCharts; hover → tooltip + element highlight; click → detail modal)
- **H-3** — Build `src/components/nuclear/NuclideChart.vue` (d3.js Z vs N grid, ~3500 nuclides, zoom/pan, color by stability)
- **H-4** — Build `src/components/nuclear/DecayChainViz.vue` (d3.js DAG for U-238, Th-232, U-235, Np-237; click node → detail modal)
- **H-5** — Build `src/views/NuclearView.vue` (3 tabs: Binding Energy, Nuclide Chart, Decay Chains); add `/nuclear` route + nav link; ensure d3 is lazy-loaded (separate chunk)

### ✅ Checkpoint: Phase 4 complete

- Binding energy curve: Fe-56 peak at ~8.8 MeV
- Nuclide chart: valley of stability visible; zoom/pan works
- Decay chain: U-238 ends at Pb-206; clickable nodes
- d3 NOT in main bundle (verify chunk output)
- **Final human review**

---

## Final Verification

- All 8 routes accessible from nav: `/`, `/compare`, `/trends`, `/quiz`, `/timeline`, `/tools`, `/stories`, `/nuclear`
- `bun run build` passes with zero TS errors and zero warnings
- No regression in: category filter, search, compare view, trends view, detail modal Overview tab
- Bookmarks persist across page reload
- Quiz best score persists across page reload
- Color mode gradient correct for all 7 properties