# Elementum — Feature Expansion Task List

> See `tasks/plan.md` for full acceptance criteria, verification steps, and dependency rationale.

---

## Data Pipeline (run before / in parallel with Phase 1)

- [x] **DP-0** — Extend `src/types/element.ts` with new fields: `Isotope`, `HazardLevel`, `isotopes[]`, `etymology`, `industrialUses`, `naturalOccurrence`, `hazardLevel`, `discoveryCountry`, `discoveryMethod`, `discoveryStory`, `storyHeadline`, `storyBody`, `discovererPortrait` — Impl / Test
- **DP-1** — `scripts/fetchers/wikidata.ts` — SPARQL batch query for discovery + etymology + abundance data → `scripts/output/wikidata.json`
- **DP-2** — `scripts/fetchers/iaea-isotopes.ts` — fetch all nuclides from IAEA LiveChart, keep top 5 per element → `scripts/output/isotopes.json`
- **DP-3** — `scripts/fetchers/pubchem.ts` — GHS hazard classification per element → `scripts/output/hazards.json`
- **DP-4** — `scripts/fetchers/generate-stories.ts` — Claude API story generation (storyHeadline + storyBody) with prompt caching → `scripts/output/stories.json`
- **DP-5** — `scripts/collect-data.ts` (parallel orchestrator) + `scripts/merge.ts` (merge all outputs into `src/data/elements.json`)
- **DP-6** — Run full pipeline; validate output; confirm `bun run build` passes

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

- **B-1** — Refactor `DetailModal.vue` into tabbed layout using new `DetailTabs.vue`; existing content moves to "Overview" tab; other tabs are empty shells
- **B-2** — Build `src/components/detail/IsotopeExplorer.vue`; render in "Isotopes" tab
- **B-3** — Build `src/components/detail/EtymologySection.vue` + `RealWorldSection.vue`; render in respective tabs
- **B-4** — Build `src/components/detail/SafetySection.vue`; render in "Safety" tab

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

- [x] **A-1** — Create `src/utils/quizGenerator.ts` (question + distractor generation) + `src/composables/useQuizLogic.ts` (session state) + `src/stores/quizStore.ts` (score/streak persistence) — Impl / Test
- [x] **A-2** — Build `src/views/QuizView.vue` + `src/components/quiz/QuizModeSelector.vue`; add `/quiz` route to router + nav link — Impl / Test
- [x] **A-3** — Build `src/components/quiz/FlashCard.vue` with GSAP 3D flip animation — Impl / Test
- [x] **A-4** — Build `src/components/quiz/MultipleChoiceCard.vue` + `QuizScoreboard.vue` + `QuizResults.vue` — Impl / Test

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

- [x] **I-1** — Extend `src/composables/useElementSearch.ts` to parse structured tokens: `period:N`, `group:N`, `EN > N`, `mp > N`, category shorthands (`metal`, `noble`, `halogen`) — Impl / Test
- [x] **I-2** — Add active filter chips to `src/components/SearchBar.vue`; each chip has × dismiss; add ? syntax help popover — Impl / Test

### ✅ Checkpoint: Phase 2 complete

- `/quiz`, `/timeline` routes accessible from nav
- Advanced search: `period:2 EN > 3.0` returns F, O, N
- `bun run build` passes
- **Human review before Phase 3**

---

## Phase 3 — Deep Features (Epics D, G)

### Epic D — Chemistry Tools

- [x] **D-1** — Create `src/utils/formulaParser.ts` (parse H2O, Fe2(SO4)3, nested parens); build `src/components/tools/MolarMassCalculator.vue` — Impl / Test
- [x] **D-2** — Create `src/utils/bondCalculator.ts` (EN diff → bond type); build `src/components/tools/BondTypePredictor.vue` + `CompoundPredictor.vue` — Impl / Test
- [x] **D-3** — Build `src/views/ToolsView.vue` (3 tabs); add `/tools` route + nav link — Impl / Test

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