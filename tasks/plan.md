# Implementation Plan: Elementum — Feature Expansion (Epics A–I)

## Overview

All PRD P0 and most P1 features are already shipped. This plan expands the app into a definitive chemistry reference tool across 9 epics: Quiz Mode (A), Enhanced Detail (B), Discovery Timeline (C), Chemistry Tools (D), Property Color Modes (E), Bookmarks & Keyboard Nav (F), Element Stories (G), Nuclear Physics (H), and Advanced Search (I). Work is sequenced by impact-to-effort ratio and data dependencies.

---

## Architecture Decisions

- **Vertical slicing**: Each task delivers one complete working path, not a horizontal layer. A task that adds a tab also wires its data and registers its route.
- **Data pipeline first for B, C, G**: Epics B, C, and G require enriched `elements.json`. Scripts run once; output is committed. UI tasks for these epics are unblocked only after DP tasks complete.
- **Type extensions before data**: `src/types/element.ts` is extended in a single task (DP-0) before any script or UI task touches new fields — prevents cascading TS errors.
- **New Pinia stores, not extending elementStore**: Quiz (quizStore), Bookmarks (bookmarkStore) each get their own store. `uiStore` absorbs `colorMode` since it already owns display state.
- **No new charting libraries for H**: ApexCharts (already installed) handles binding energy curve; d3.js added only for the nuclide chart and decay chain DAG (both need force-layout / custom SVG).
- **localStorage persistence**: Quiz best scores and bookmarks use VueUse `useLocalStorage` — already a dependency, zero new packages.

---

## Dependency Graph

```
src/types/element.ts (DP-0)
        │
        ├── Data pipeline scripts (DP-1 → DP-5)
        │         │
        │         └── elements.json enriched (DP-6)
        │                   │
        │                   ├── Epic B — Detail tabs (B-1 → B-4)
        │                   ├── Epic C — Timeline (C-1 → C-4)
        │                   └── Epic G — Stories (G-1 → G-3)
        │
        ├── Epic E — Color modes (E-1 → E-3)  [no data dependency]
        ├── Epic F — Bookmarks + keyboard nav (F-1 → F-3)  [no data dependency]
        ├── Epic A — Quiz mode (A-1 → A-5)  [no data dependency]
        ├── Epic I — Advanced search (I-1 → I-2)  [no data dependency]
        └── Epic D — Chemistry tools (D-1 → D-4)  [no data dependency]

Epic H — Nuclear (H-1 → H-5)  [separate nuclear data, no dependency on elements.json enrichment]
```

---

## Risks & Mitigations


| Risk                                                   | Impact | Mitigation                                                                           |
| ------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------ |
| Wikidata SPARQL returns sparse etymology/abundance     | Med    | UI renders "Unknown" gracefully; null-safe types from DP-0                           |
| IAEA LiveChart API changes / rate-limits               | Med    | Download full JSON once, commit to `scripts/cache/`; don't re-fetch on every run     |
| Claude API cost for story generation (118 elements)    | Low    | Prompt caching; one batch call with system prompt cached                             |
| d3.js bundle size for Epic H                           | Low    | Lazy import inside NuclearView only; code-split by route                             |
| ElementTile.vue performance with color gradient recalc | Med    | `computed` per tile, not reactive watcher; memoize with element number as key        |
| DetailModal tab refactor breaks existing layout        | Med    | Build tabs as additive wrapper; keep PropertiesGrid/ElectronConfig in "Overview" tab |


---

## Open Questions

- **Epic B data timing**: Should isotope/etymology data be collected before Phase 1 starts, or is Phase 1 (E, F) unblocked enough to ship while scripts run? → Recommendation: start DP scripts in parallel with Phase 1 UI work.
- **Epic H — d3.js**: Add as dependency or use canvas/SVG manually? → Recommend d3.js; nuclide chart is too complex for manual SVG.
- **Epic G stories language/tone**: AI-generated narratives need a tone guide baked into the prompt. Define before running `generate-stories.ts`.

---

## Phase 1 — High Impact, Low/Medium Effort

### Task E-1: Add `colorMode` to uiStore + `usePropertyColor` composable

**Description:** Extend `uiStore.ts` with a `colorMode` state (default: `"category"`). Create `src/composables/usePropertyColor.ts` that maps any numeric element property to a CSS color on a gradient scale using linear interpolation. Exports a single `getPropertyColor(element, colorMode)` function.

**Acceptance criteria:**

- `uiStore.colorMode` is typed as `TrendProperty | "category"` and defaults to `"category"`
- `usePropertyColor.ts` handles null values (returns a neutral fallback color)
- Color range for each property is derived from min/max of `elements.json` at composable init

**Verification:**

- Build passes: `vp check`
- No TS errors on `colorMode` type
- `getPropertyColor` returns consistent hex string for a known element

**Dependencies:** None  
**Files touched:** `src/stores/uiStore.ts`, `src/composables/usePropertyColor.ts`  
**Estimated scope:** S

---

### Task E-2: Build `ColorModeSelector.vue` + `ColorLegend.vue`

**Description:** Dropdown above the periodic table to select a color mode. Gradient legend bar shown at the bottom of the table showing the property's min→max range. Both components read from `uiStore.colorMode`.

**Acceptance criteria:**

- Dropdown lists all 8 modes (category + 7 trend properties)
- Selecting a mode updates `uiStore.colorMode`
- Legend bar shows property name, min value, max value
- Legend is hidden when `colorMode === "category"`

**Verification:**

- Build passes
- Dropdown visually renders above the table in `TableView.vue`
- Legend appears/disappears on mode switch

**Dependencies:** E-1  
**Files touched:** `src/components/table/ColorModeSelector.vue`, `src/components/table/ColorLegend.vue`, `src/views/TableView.vue`  
**Estimated scope:** S

---

### Task E-3: Modify `ElementTile.vue` to support color modes

**Description:** `ElementTile.vue` reads `uiStore.colorMode`; when not `"category"`, calls `getPropertyColor` to get a gradient background instead of the category color. Tile text contrast adjusts automatically.

**Acceptance criteria:**

- Category mode looks identical to current behavior (no regression)
- In any property mode, each tile background reflects the element's relative value on a gradient
- Tiles with null property values render in a neutral grey
- Transition animation plays when switching modes (CSS transition or GSAP)

**Verification:**

- Switch to "electronegativity" — fluorine (highest) and cesium (lowest) are at opposite ends of gradient
- Noble gases with null EN render grey, not broken
- No layout shift on mode switch

**Dependencies:** E-1, E-2  
**Files touched:** `src/components/ElementTile.vue`  
**Estimated scope:** S

---

### ✅ Checkpoint 1 — Epic E complete

- `vp check` passes with zero TS errors
- Color mode selector visible and functional on main table
- Legend renders and hides correctly
- No regression on category filter or search highlight behavior

---

### Task DP-0: Extend `Element` type with all new fields

**Description:** Single source-of-truth type extension before any scripts or UI consume new fields. All new fields are optional and nullable so existing `elements.json` continues to typecheck.

**Acceptance criteria:**

- `Isotope` interface added: `{ massNumber, symbol, abundance, halfLife, decayMode }`
- `HazardLevel` type: `"safe" | "flammable" | "toxic" | "radioactive" | "corrosive"`
- New optional fields on `Element`: `isotopes`, `etymology`, `industrialUses`, `naturalOccurrence`, `hazardLevel`, `discoveryCountry`, `discoveryMethod`, `discoveryStory`, `storyHeadline`, `storyBody`, `discovererPortrait`
- Existing `abundance` field already exists — confirm it covers `bodyAbundance`, `crustAbundance`, `seaAbundance`, `universeAbundance` (map to existing `Abundance` interface fields)

**Verification:**

- `vp check` passes with zero TS errors after extension
- No existing component breaks (all new fields are optional)

**Dependencies:** None  
**Files touched:** `src/types/element.ts`  
**Estimated scope:** XS

---

### Task DP-1: `scripts/fetchers/wikidata.ts` — discovery + etymology + abundance

**Description:** SPARQL batch query to Wikidata fetching: `discoverer`, `discoveryYear`, `discoveryCountry`, `discoveryMethod`, `etymology`, `crustAbundance`, `seaAbundance`, `universeAbundance`, `bodyAbundance` for all 118 elements. Writes `scripts/output/wikidata.json`.

**Acceptance criteria:**

- Single SPARQL query handles all fields via OPTIONAL clauses
- Output file has one record per element keyed by atomic number
- Missing values stored as `null`, not omitted
- Script is runnable: `bun run scripts/fetchers/wikidata.ts`

**Verification:**

- Run script; output file created
- Hydrogen entry has correct `discoveryYear: 1766`, `discoverer: "Henry Cavendish"`
- At least 80 of 118 elements have non-null `discoveryYear`

**Dependencies:** None (external API)  
**Files touched:** `scripts/fetchers/wikidata.ts`  
**Estimated scope:** M

---

### Task DP-2: `scripts/fetchers/iaea-isotopes.ts` — isotope data

**Description:** Fetch all ~3500 nuclides from IAEA LiveChart API (`/relnsd/v1/data?fields=ground_states&nuclides=all`). Parse and keep top 5 most abundant isotopes per element. Writes `scripts/output/isotopes.json`.

**Acceptance criteria:**

- Downloads full nuclide dataset once and caches to `scripts/cache/iaea-ground-states.json`
- Output: 118 element records, each with up to 5 `isotopes[]` entries
- `halfLife: "stable"` for stable isotopes; formatted string (e.g., `"1.6×10³ y"`) for radioactive

**Verification:**

- Run script; output file created
- Carbon has isotopes C-12 (~~98.9%), C-13 (~~1.1%), C-14 (trace, radioactive)
- Technetium has no stable isotopes (all radioactive)

**Dependencies:** None (external API)  
**Files touched:** `scripts/fetchers/iaea-isotopes.ts`  
**Estimated scope:** M

---

### Task DP-3: `scripts/fetchers/pubchem.ts` — GHS hazard classification

**Description:** For each element, call PubChem REST API to get GHS hazard codes. Map to `HazardLevel`. Noble gases and benign metals default to `"safe"` when PubChem has no entry. Writes `scripts/output/hazards.json`.

**Acceptance criteria:**

- Uses PubChem compound name lookup endpoint
- GHS H-code ranges mapped: H200s → flammable, H300s → toxic, H400s → corrosive, all radioactive elements → radioactive
- Missing/noble gas entries default to `"safe"`

**Verification:**

- Fluorine → `"toxic"`, Sodium → `"flammable"`, Neon → `"safe"`, Uranium → `"radioactive"`

**Dependencies:** None (external API)  
**Files touched:** `scripts/fetchers/pubchem.ts`  
**Estimated scope:** M

---

### Task DP-4: `scripts/fetchers/generate-stories.ts` — Claude API story generation

**Description:** For each element, construct a structured prompt with its data (discovery, uses, compounds, fun facts) and call Claude API to generate `storyHeadline` (10 words max) and `storyBody` (2–3 sentences). Uses prompt caching on the system prompt to minimize cost. Writes `scripts/output/stories.json`.

**Acceptance criteria:**

- System prompt is cached (set as `cache_control: "ephemeral"` on first message)
- Batch processes all 118 elements; retries on rate-limit with exponential backoff
- Output is valid JSON with `{ atomicNumber, storyHeadline, storyBody }` per element
- Requires `ANTHROPIC_API_KEY` env var; exits with clear error if missing

**Verification:**

- Run with `ANTHROPIC_API_KEY` set; output file created with 118 entries
- Stories are factually grounded (reference real discovery/use)
- No element has empty `storyHeadline`

**Dependencies:** DP-0 (type awareness); external Claude API  
**Files touched:** `scripts/fetchers/generate-stories.ts`  
**Estimated scope:** M

---

### Task DP-5: `scripts/collect-data.ts` + `scripts/merge.ts` — orchestrator and merge

**Description:** `collect-data.ts` runs all 4 fetchers in parallel (Promise.all). `merge.ts` reads all `scripts/output/*.json` files, deep-merges into existing `elements.json`, validates that no existing field is overwritten with null, writes `src/data/elements.json`. Both scripts are runnable via `bun`.

**Acceptance criteria:**

- `bun run scripts/collect-data.ts` runs all fetchers in parallel, reports completion
- `bun run scripts/merge.ts` produces a valid `elements.json` that passes TS typecheck
- Merge is idempotent (running twice produces same output)
- Existing fields (atomicMass, electronConfiguration, etc.) are never clobbered

**Verification:**

- Run full pipeline; `vp check` still passes
- `elements.json` for Hydrogen now contains `isotopes`, `etymology`, `storyHeadline`

**Dependencies:** DP-1, DP-2, DP-3, DP-4  
**Files touched:** `scripts/collect-data.ts`, `scripts/merge.ts`  
**Estimated scope:** M

---

### ✅ Checkpoint 2 — Data pipeline complete

- `bun run scripts/collect-data.ts && bun run scripts/merge.ts` runs without error
- `src/data/elements.json` has enriched fields for majority of elements
- `vp check` passes with no TS errors
- Spot-check 5 elements manually for data correctness

---

### Task B-1: Refactor `DetailModal.vue` into tabbed layout

**Description:** Wrap existing detail content in an "Overview" tab. Add tab navigation bar (Overview, Isotopes, Etymology & History, Real World, Safety) using a `DetailTabs.vue` component. Other tabs render placeholder `<div>` until their content components are built.

**Acceptance criteria:**

- Existing detail content (PropertiesGrid, ElectronConfig, AtomModel, SpectralLines, FunFacts, Photo) moves into "Overview" tab — zero visual regression
- Tab bar is keyboard-accessible (arrow keys switch tabs)
- Active tab has visible focus indicator
- Tabs with no data (null fields) are hidden, not shown empty

**Verification:**

- Click any element → Detail modal opens with tab bar visible
- Click "Overview" — existing layout unchanged
- Other tabs show placeholder or are hidden (no broken layout)

**Dependencies:** DP-0 (type awareness; data can be null for now)  
**Files touched:** `src/components/detail/DetailModal.vue`, `src/components/detail/DetailTabs.vue`  
**Estimated scope:** M

---

### Task B-2: Build `IsotopeExplorer.vue`

**Description:** Table listing top isotopes for the selected element: columns = mass number, symbol, natural abundance (%), half-life, decay mode. Shown in "Isotopes" tab. Handles elements with no stable isotopes gracefully.

**Acceptance criteria:**

- Table renders all isotopes from `element.isotopes[]`
- Stable isotopes show "Stable" in half-life column (green badge)
- Radioactive isotopes show formatted half-life (amber/red badge by decay mode)
- Element with no isotope data shows "No isotope data available" message

**Verification:**

- Carbon: shows C-12 (~~98.9%, Stable), C-13 (~~1.1%, Stable), C-14 (trace, β⁻, ~5730 y)
- Technetium: no stable row, all radioactive entries

**Dependencies:** B-1, DP-5 (enriched data)  
**Files touched:** `src/components/detail/IsotopeExplorer.vue`  
**Estimated scope:** S

---

### Task B-3: Build `EtymologySection.vue` + `RealWorldSection.vue`

**Description:** Etymology tab shows element name origin story (`element.etymology`), discoverer mini-card (name, year, country), and discovery method. Real World tab shows industrial uses as tag chips (`element.industrialUses[]`) and natural occurrence text (`element.naturalOccurrence`).

**Acceptance criteria:**

- Etymology section: name origin text, discoverer card with name/year/country
- Discoverer card shows "Ancient / Unknown" for pre-historic elements
- Real World: uses render as chip tags; occurrence text renders as prose
- Null fields show graceful fallbacks (not broken layout)

**Verification:**

- Gold: etymology shows "From Latin 'aurum'", discoverer "Ancient"
- Oxygen: shows Priestley/Scheele discovery, uses include "steelmaking", "medicine"

**Dependencies:** B-1, DP-5  
**Files touched:** `src/components/detail/EtymologySection.vue`, `src/components/detail/RealWorldSection.vue`  
**Estimated scope:** S

---

### Task B-4: Build `SafetySection.vue`

**Description:** Safety tab shows hazard level as a prominent colored badge (safe=green, flammable=amber, toxic=red, radioactive=purple, corrosive=orange) with a one-line explanation of the hazard. GHS symbol icon shown beside badge.

**Acceptance criteria:**

- Badge color maps correctly to each `HazardLevel`
- Each level has a short explanatory sentence (static copy, not AI-generated)
- "Safe / Inert" elements (noble gases) show a reassuring green badge
- No hazard data → "Hazard data unavailable" message

**Verification:**

- Fluorine: red "Toxic" badge
- Neon: green "Safe / Inert" badge
- Sodium: amber "Flammable" badge

**Dependencies:** B-1, DP-5  
**Files touched:** `src/components/detail/SafetySection.vue`  
**Estimated scope:** S

---

### ✅ Checkpoint 3 — Epic B complete

- Open detail modal for H, C, F, Ne, Na, U — verify all 5 tabs render correctly
- No regression in Overview tab (existing content unchanged)
- Null/missing data shows graceful fallbacks, not blank space or JS errors
- `vp check` passes

---

### Task F-1: `bookmarkStore.ts` + `BookmarkButton.vue`

**Description:** New Pinia store `bookmarkStore.ts` with `bookmarkedElements: Set<number>` persisted via `useLocalStorage`. `BookmarkButton.vue` is a star icon component that toggles bookmark state. Appears in `ElementTile.vue` on hover and in `DetailModal.vue` header.

**Acceptance criteria:**

- `toggleBookmark(atomicNumber)` adds/removes from the set
- `isBookmarked(atomicNumber)` returns boolean
- Bookmarks persist across page reload (localStorage key: `"elementum-bookmarks"`)
- BookmarkButton shows filled star when bookmarked, outline star when not
- BookmarkButton is accessible (aria-label changes with state)

**Verification:**

- Star 3 elements; reload page; all 3 remain starred
- Un-star one; reload; only 2 remain

**Dependencies:** None  
**Files touched:** `src/stores/bookmarkStore.ts`, `src/components/BookmarkButton.vue`, `src/components/ElementTile.vue`, `src/components/detail/DetailModal.vue`  
**Estimated scope:** S

---

### Task F-2: `BookmarksPanel.vue` — bookmark collection view

**Description:** Slide-in panel (or modal) accessible from a bookmark icon in the top nav. Shows all bookmarked elements as mini tiles in a grid. Clicking a tile opens the detail modal. Shows count badge on nav icon.

**Acceptance criteria:**

- Panel opens/closes via bookmark icon in nav
- Shows all bookmarked elements as mini tiles (symbol, name, atomic number)
- Empty state: "No bookmarks yet — star elements to save them"
- Count badge on nav icon shows current count (hidden at 0)
- Panel is dismissible via ESC

**Verification:**

- Bookmark 5 elements; open panel; all 5 appear
- Click a tile in the panel; detail modal opens for that element
- Badge updates live when bookmarking/unbookmarking

**Dependencies:** F-1  
**Files touched:** `src/components/BookmarksPanel.vue`, `src/App.vue`  
**Estimated scope:** S

---

### Task F-3: `useKeyboardNav.ts` — arrow key grid navigation

**Description:** Composable that tracks a focused element index on the periodic table grid. Arrow keys move focus to adjacent elements (respecting the grid layout gaps for lanthanides/actinides). `Enter` opens detail modal for focused element. `ESC` closes modal. Activated when focus is inside the grid.

**Acceptance criteria:**

- Arrow keys navigate between adjacent element tiles on the grid
- Focus respects actual grid layout (skips empty cells, wraps within rows)
- `Enter` selects focused element (opens detail)
- `ESC` closes open detail panel
- Focus ring visible on focused tile (not just outline — use the existing glow style)
- Keyboard nav is opt-in (not interfering with search input focus)

**Verification:**

- Tab into grid; use arrow keys; focus moves correctly
- Press Enter on any element; detail modal opens
- Press ESC; modal closes

**Dependencies:** None  
**Files touched:** `src/composables/useKeyboardNav.ts`, `src/components/PeriodicGrid.vue`  
**Estimated scope:** M

---

### ✅ Checkpoint 4 — Phase 1 complete (Epics E, B, F)

- All builds pass, zero TS errors
- Color mode works on main table with legend
- Detail modal has 5 tabs with correct data
- Bookmarks persist across reload
- Keyboard navigation works in grid
- Human review before Phase 2

---

## Phase 2 — Core Feature Additions

### Task A-1: `quizGenerator.ts` + `useQuizLogic.ts`

**Description:** `quizGenerator.ts` generates questions: shuffle elements, pick distractors for MCQ (similar category or period), produce flashcard prompts. `useQuizLogic.ts` composable manages quiz session state: current question, score, streak, mode, round completion.

**Acceptance criteria:**

- Generates flashcard questions: "What element has symbol [X]?"
- Generates MCQ questions: "Which element has the highest electronegativity in period 2?" with 4 options
- Challenge mode: 60-second timer, score increments per correct answer
- Distractors are plausible (same category or adjacent period, not random)
- `quizStore.ts` persists `bestScore` to localStorage

**Verification:**

- Generate 10 questions; all have correct answers in the options list
- No duplicate distractors in a single MCQ question

**Dependencies:** None (uses existing elements.json)  
**Files touched:** `src/utils/quizGenerator.ts`, `src/composables/useQuizLogic.ts`, `src/stores/quizStore.ts`  
**Estimated scope:** M

---

### Task A-2: `QuizView.vue` + `QuizModeSelector.vue`

**Description:** `/quiz` route renders `QuizView.vue`. On load, shows `QuizModeSelector.vue` — three mode cards (Flashcard, Multiple Choice, Challenge) with descriptions. Selecting a mode starts the quiz session.

**Acceptance criteria:**

- `/quiz` route added to router
- Nav link added to App.vue navigation
- Mode selector shows 3 cards; each clearly describes the mode
- Clicking a mode transitions to the quiz question view

**Verification:**

- Navigate to `/quiz`; mode selector renders
- Click each mode; quiz starts in correct mode

**Dependencies:** A-1  
**Files touched:** `src/views/QuizView.vue`, `src/components/quiz/QuizModeSelector.vue`, `src/router/index.ts`, `src/App.vue`  
**Estimated scope:** S

---

### Task A-3: `FlashCard.vue` — animated flip card

**Description:** Shows element tile on front (symbol, atomic number, photo if available). User clicks to flip and reveal the element name and category on the back. GSAP 3D flip animation. Correct/incorrect buttons on back.

**Acceptance criteria:**

- Front shows symbol, atomic number, element photo (or colored tile if no photo)
- GSAP rotateY flip animation plays on click (300ms)
- Back shows name, category, one fun fact
- "Correct" / "Incorrect" buttons update score and advance to next card
- "Skip" option advances without scoring

**Verification:**

- Enter flashcard mode; flip card; animation plays smoothly
- Correct/Incorrect updates score display immediately

**Dependencies:** A-1, A-2  
**Files touched:** `src/components/quiz/FlashCard.vue`  
**Estimated scope:** S

---

### Task A-4: `MultipleChoiceCard.vue` + `QuizScoreboard.vue` + `QuizResults.vue`

**Description:** MCQ card shows a property clue and 4 element options as buttons. Selecting an answer highlights correct (green) / incorrect (red) with a brief explanation. `QuizScoreboard.vue` shows live score + streak. `QuizResults.vue` shows end-of-round summary with best score comparison.

**Acceptance criteria:**

- MCQ options highlight immediately on selection (no delay)
- Explanation shown after answer (1 sentence about the correct element)
- "Next" button advances after answering
- Scoreboard visible throughout quiz session
- Results screen shows: score, streak, best score, option to play again or change mode

**Verification:**

- Answer correctly 3 times → streak shows 3
- Complete a round → results screen appears with correct score
- Reload page → best score persists

**Dependencies:** A-1, A-2  
**Files touched:** `src/components/quiz/MultipleChoiceCard.vue`, `src/components/quiz/QuizScoreboard.vue`, `src/components/quiz/QuizResults.vue`  
**Estimated scope:** M

---

### ✅ Checkpoint 5 — Epic A complete

- Complete a round in each of 3 modes
- Score increments correctly; best score persists on reload
- No visual regression on main table or detail modal

---

### Task C-1: `TimelineView.vue` skeleton + `/timeline` route

**Description:** Add `/timeline` route. `TimelineView.vue` sets up a horizontally scrollable container with era background bands. Uses enriched `discoveryYear` from elements.json. Elements without discovery year are grouped in an "Ancient / Unknown" cluster at the far left.

**Acceptance criteria:**

- `/timeline` route added and accessible from nav
- Horizontal scroll works on mouse wheel and trackpad
- Era bands visible: Ancient (pre-1700), Enlightenment (1700–1800), Modern Chemistry (1800–1900), Nuclear Age (1900+)
- Elements load and are positioned by year on the axis

**Verification:**

- Navigate to `/timeline`; horizontal scroll works
- Era bands render with correct labels
- At least 100 element cards visible (all with known dates)

**Dependencies:** DP-5 (enriched elements.json)  
**Files touched:** `src/views/TimelineView.vue`, `src/router/index.ts`, `src/App.vue`, `src/components/timeline/TimelineEraLabel.vue`  
**Estimated scope:** M

---

### Task C-2: `TimelineAxis.vue` + `TimelineElementCard.vue` + `useTimelineFilter.ts`

**Description:** Axis shows year markers (tick marks every 50 years from 3000 BCE to 2020). Each element card on the timeline shows: symbol, name, year, discoverer. Clicking a card opens the detail modal. `useTimelineFilter.ts` handles filtering by era, country, discovery method.

**Acceptance criteria:**

- Year axis is readable and labeled (not overlapping)
- Element card shows symbol, name, year, discoverer
- Clicking a card opens existing `DetailModal` for that element
- `useTimelineFilter.ts` exposes `filterByEra`, `filterByCountry`, `filterByMethod`

**Verification:**

- Click Oxygen card → detail modal opens for Oxygen
- Filter by "Enlightenment" era → only 1700–1800 elements remain

**Dependencies:** C-1  
**Files touched:** `src/components/timeline/TimelineAxis.vue`, `src/components/timeline/TimelineElementCard.vue`, `src/composables/useTimelineFilter.ts`  
**Estimated scope:** M

---

### Task C-3: `TimelineFilters.vue` — filter controls

**Description:** Compact filter bar for the timeline: era dropdown, country multi-select (top 10 discovery countries), discovery method dropdown. Active filters shown as dismissible chips.

**Acceptance criteria:**

- Era filter: Ancient, Enlightenment, Modern Chemistry, Nuclear Age
- Country filter: top 10 countries from data (+ "All")
- Method filter: electrolysis, nuclear bombardment, ancient, spectroscopy, etc.
- Active filters shown as chips; clicking X removes that filter
- "Clear all" button resets all filters

**Verification:**

- Select "France" in country filter → only French discoveries shown
- Clear all → all elements return to timeline

**Dependencies:** C-2  
**Files touched:** `src/components/timeline/TimelineFilters.vue`  
**Estimated scope:** S

---

### Task I-1: Property range query parsing in `useElementSearch.ts`

**Description:** Extend the existing `useElementSearch.ts` composable to parse structured query tokens: `period:2`, `EN > 3.0`, `metal`, `mp > 3000`. Tokens are parsed with regex; results are ANDed with any plain text search.

**Acceptance criteria:**

- `period:N` filters to period N elements
- `group:N` filters to group N elements
- `EN > N` / `EN < N` filters by electronegativity
- `mp > N` / `mp < N` filters by melting point (Kelvin)
- Category shorthand: `metal`, `noble`, `halogen`, `metalloid`
- Plain text search still works alongside tokens
- Invalid tokens are silently ignored (no crash)

**Verification:**

- Type `period:2 EN > 3.0` → returns F, O, N
- Type `noble` → returns all noble gases
- Type `mp > 3000` → returns W, Re, Os, Ta, Mo (highest melting points)

**Dependencies:** None  
**Files touched:** `src/composables/useElementSearch.ts`  
**Estimated scope:** S

---

### Task I-2: Active filter chips in `SearchBar.vue`

**Description:** When structured query tokens are active, show them as dismissible chips below the search input. Clicking a chip removes that token from the query. "Help" popover shows supported query syntax.

**Acceptance criteria:**

- Each parsed token shown as a chip with label and × button
- Clicking × removes token from query string
- Help icon (?) opens a small popover listing supported syntax
- Chips don't appear for plain-text queries

**Verification:**

- Type `period:2 EN > 3.0`; two chips appear
- Click × on one chip; that token removed; results update
- Click ?; popover shows syntax reference

**Dependencies:** I-1  
**Files touched:** `src/components/SearchBar.vue`  
**Estimated scope:** S

---

### ✅ Checkpoint 6 — Phase 2 complete (Epics A, C, I)

- `/quiz`, `/timeline` routes accessible from nav
- Quiz: all 3 modes work, scores persist
- Timeline: scrollable, filterable, clicking cards opens detail modal
- Advanced search: `period:2 EN > 3.0` returns correct elements
- `vp check` passes, zero TS errors
- Human review before Phase 3

---

## Phase 3 — Deep Features

### Task D-1: `formulaParser.ts` + `MolarMassCalculator.vue`

**Description:** `formulaParser.ts` parses chemical formula strings (e.g., `H2O`, `C6H12O6`, `Fe2(SO4)3`) into element+count pairs. `MolarMassCalculator.vue` shows the breakdown table and total molar mass. Highlights each element on the periodic table via `elementStore`.

**Acceptance criteria:**

- Parser handles: simple (H2O), grouped (Fe2(SO4)3), nested parens, single atoms (Na)
- Result table: element symbol, name, count, atomic mass, contribution (g/mol)
- Total shown prominently with units (g/mol)
- Invalid formula shows clear error message
- Each element in formula is highlighted on the periodic table

**Verification:**

- `H2O` → 18.015 g/mol
- `C6H12O6` → 180.16 g/mol
- `Fe2(SO4)3` → 399.88 g/mol
- `XYZ` → error message, no crash

**Dependencies:** None  
**Files touched:** `src/utils/formulaParser.ts`, `src/components/tools/MolarMassCalculator.vue`  
**Estimated scope:** M

---

### Task D-2: `bondCalculator.ts` + `BondTypePredictor.vue` + `CompoundPredictor.vue`

**Description:** Bond predictor: user picks 2 elements; EN difference classifies bond type (nonpolar covalent <0.4, polar covalent 0.4–1.7, ionic >1.7). Shows visual EN scale. Compound predictor shows likely compounds for the pair from `element.compounds` data.

**Acceptance criteria:**

- Two element pickers (search by name/symbol)
- EN difference calculated and displayed
- Bond type shown with color-coded badge and explanation
- Visual scale shows where the EN difference falls
- Likely compound shown if found in compounds data; "No common compound found" if not

**Verification:**

- Na + Cl → EN diff 2.1 → "Ionic bond" → NaCl shown
- H + O → EN diff 1.4 → "Polar covalent" → H₂O shown
- H + H → EN diff 0 → "Nonpolar covalent"

**Dependencies:** None  
**Files touched:** `src/utils/bondCalculator.ts`, `src/components/tools/BondTypePredictor.vue`, `src/components/tools/CompoundPredictor.vue`  
**Estimated scope:** M

---

### Task D-3: `ToolsView.vue` + `/tools` route

**Description:** Tabbed tools page at `/tools` with 3 tabs: Molar Mass Calculator, Bond Type Predictor, Compound Predictor. Clean layout matching app design system.

**Acceptance criteria:**

- `/tools` route accessible from nav
- Three tool tabs render their respective components
- Active tool tab persisted in URL hash (`/tools#molar-mass`, etc.)
- Back navigation from tools doesn't break periodic table state

**Verification:**

- Navigate to `/tools`; all 3 tabs accessible
- Use molar mass calc; navigate away; navigate back → tool state reset (acceptable)

**Dependencies:** D-1, D-2  
**Files touched:** `src/views/ToolsView.vue`, `src/router/index.ts`, `src/App.vue`  
**Estimated scope:** S

---

### Task G-1: `StoriesView.vue` + `ElementStoryCard.vue`

**Description:** `/stories` route shows all element stories as a masonry-style card grid. Each card shows: element symbol, name, `storyHeadline`, `storyBody`, discoverer portrait (if available). Clicking a card opens the detail modal.

**Acceptance criteria:**

- `/stories` route accessible from nav
- Card grid shows all elements with stories (storyHeadline non-null)
- Cards without portrait show a styled placeholder
- Clicking a card opens detail modal for that element
- Search input filters stories by element name or headline

**Verification:**

- Navigate to `/stories`; cards appear for elements with story data
- Click Gold card → detail modal opens for Au
- Search "oxygen" → only oxygen story visible

**Dependencies:** DP-5 (story data in elements.json)  
**Files touched:** `src/views/StoriesView.vue`, `src/components/stories/ElementStoryCard.vue`, `src/router/index.ts`, `src/App.vue`  
**Estimated scope:** M

---

### Task G-2: `AbundanceInContext.vue` — abundance visualization in detail modal

**Description:** Add an abundance visualization to the detail modal "Real World" tab showing the element's abundance in: universe, Earth's crust, seawater, human body, meteorites. Rendered as a horizontal bar chart using existing ApexCharts.

**Acceptance criteria:**

- Bar chart shows up to 6 abundance values (skip null entries)
- Values labeled in ppm with scientific notation for small numbers
- "Human Body" bar highlighted differently for biological elements
- Graceful: if all abundance values are null, section is hidden

**Verification:**

- Oxygen: large crust and body abundance bars
- Gold: very small universe abundance, near-zero body abundance
- Oganesson: all null → section hidden

**Dependencies:** B-3 (Real World tab exists), DP-5  
**Files touched:** `src/components/detail/RealWorldSection.vue` (extended), `src/components/detail/AbundanceInContext.vue`  
**Estimated scope:** S

---

### ✅ Checkpoint 7 — Phase 3 complete (Epics D, G)

- `/tools` route: all 3 calculators work; H2O = 18.015 g/mol; Na+Cl = ionic
- `/stories` route: cards visible for elements with story data
- Abundance chart in Real World tab renders correctly
- `vp check` passes, zero TS errors
- Human review before Phase 4

---

## Phase 4 — Prestige Features

### Task H-1: Install d3.js + nuclear data types + extended IAEA script

**Description:** Add d3.js as a dependency (lazy-imported in NuclearView only). Extend `src/types/element.ts` with nuclear types: `NuclideEntry`, `DecayChain`, `BindingEnergyPoint`. Extend `scripts/fetchers/iaea-isotopes.ts` to also fetch decay radiation data for the 4 major decay chains (U-238, Th-232, U-235, Np-237).

**Acceptance criteria:**

- `bun add d3` (or equivalent); d3 imported only inside NuclearView and its children
- `NuclideEntry` type: `{ Z, N, symbol, halfLife, decayMode, bindingEnergyPerNucleon, abundance }`
- `DecayChainNode` type: `{ nuclide: string, halfLife: string, decayMode: string, children: DecayChainNode[] }`
- Extended IAEA script fetches `decay_rads` field for major chains
- Output: `scripts/output/nuclear.json`

**Verification:**

- `vp check` passes; d3 not in main bundle (only lazy-loaded chunk)
- `nuclear.json` contains U-238 decay chain nodes

**Dependencies:** None  
**Files touched:** `src/types/element.ts`, `scripts/fetchers/iaea-isotopes.ts`, `package.json`  
**Estimated scope:** M

---

### Task H-2: Binding Energy Curve — ApexCharts line chart

**Description:** Classic B/A vs. A (mass number) chart using ApexCharts. Shows binding energy per nucleon for the most stable isotope of each element. Hover a point → element name tooltip; click → opens detail modal for that element.

**Acceptance criteria:**

- X-axis: mass number (A) from 1 to ~300
- Y-axis: binding energy per nucleon (MeV)
- Iron-56 peak clearly visible (~8.8 MeV)
- Hover shows element name, symbol, A, B/A value
- Clicking a point opens detail modal for that element

**Verification:**

- Fe-56 point is at ~8.8 MeV on Y-axis
- He-4 point shows the notable spike (~7.07 MeV)
- Click Fe point → Iron detail modal opens

**Dependencies:** H-1  
**Files touched:** `src/components/nuclear/BindingEnergyCurve.vue`  
**Estimated scope:** M

---

### Task H-3: Nuclear Stability Map (Z vs N nuclide chart)

**Description:** 2D grid (Z on Y-axis, N on X-axis) showing all ~3500 nuclides color-coded by stability: stable (black), β⁻ (blue), β⁺ (red), α (yellow), fission (purple), synthetic (grey). Rendered using d3.js SVG. Zoom and pan enabled.

**Acceptance criteria:**

- All ~3500 nuclides plotted as colored squares
- "Valley of stability" (black squares) clearly visible as a diagonal band
- Zoom: scroll wheel zooms in/out; drag to pan
- Hover a nuclide square → tooltip: symbol, Z, N, halfLife, decayMode
- Legend for color coding

**Verification:**

- Fe-56 appears as black (stable) at Z=26, N=30
- U-238 appears as α-decay (yellow) at Z=92, N=146
- Zoom and pan work without lag on laptop

**Dependencies:** H-1  
**Files touched:** `src/components/nuclear/NuclideChart.vue`  
**Estimated scope:** L

---

### Task H-4: Decay Chain Visualizer — d3.js DAG

**Description:** Interactive flowchart for U-238, Th-232, U-235, Np-237 decay series. Nodes show nuclide symbol, halfLife. Edges show decay mode (α or β⁻). d3.js tree layout. Clicking a node opens the element's detail modal.

**Acceptance criteria:**

- Dropdown to select which decay chain (4 options)
- Nodes arranged top-to-bottom (parent → daughter)
- Each node shows nuclide symbol, half-life
- Each edge labeled with decay mode (α or β⁻)
- Clicking a node opens detail modal if it's a named element
- Animated: nodes fade in sequentially on chain select

**Verification:**

- U-238 chain ends at Pb-206 (stable)
- U-235 chain ends at Pb-207 (stable)
- Click Radium node → Ra detail modal opens

**Dependencies:** H-1  
**Files touched:** `src/components/nuclear/DecayChainViz.vue`  
**Estimated scope:** L

---

### Task H-5: `NuclearView.vue` + `/nuclear` route

**Description:** Tabbed nuclear physics reference page at `/nuclear`. Tabs: Binding Energy Curve, Nuclide Chart, Decay Chains. Includes a brief educational intro paragraph for each tab. Nav link added.

**Acceptance criteria:**

- `/nuclear` route accessible from nav
- Three tabs render correct components
- Each tab has a 2-sentence educational intro
- Lazy-loaded (d3 not in main bundle)

**Verification:**

- Navigate to `/nuclear`; all 3 tabs work
- Main bundle size not significantly increased (d3 in separate chunk)

**Dependencies:** H-2, H-3, H-4  
**Files touched:** `src/views/NuclearView.vue`, `src/router/index.ts`, `src/App.vue`  
**Estimated scope:** S

---

### ✅ Checkpoint 8 — Phase 4 complete (Epic H)

- `/nuclear` route accessible
- Binding energy curve: Fe-56 peak visible; click opens detail modal
- Nuclide chart: stable valley visible; zoom/pan works
- Decay chain: U-238 chain renders, ends at Pb-206
- `vp check` passes; d3 not in main bundle
- Final human review

---

## Final Verification

- All routes accessible from navigation (`/`, `/compare`, `/trends`, `/quiz`, `/timeline`, `/tools`, `/stories`, `/nuclear`)
- `vp check` passes with zero TS errors and zero warnings
- No existing feature regressed (category filter, search, compare, trends, detail modal overview tab)
- Bookmarks persist across reload
- Quiz best score persists across reload
- Color mode gradient works for all 7 properties

