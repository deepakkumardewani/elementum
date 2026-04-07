# ARCHITECTURE.md — Periodic Table Explorer

---

## System Overview

Fully client-side Vue 3 single-page application. No backend, no database, no auth. All element data is bundled as a static JSON file. The app is a pure frontend product — fast, portable, deployable to any static host.

```
Browser
  └── Vue 3 SPA (Vite)
        ├── Static Element Data (JSON)
        ├── State (Pinia)
        ├── Views (Table, Detail, Compare, Trends)
        ├── Animations (GSAP + CSS transitions)
        ├── Charts (ApexCharts / vue3-apexcharts)
        └── 3D Atom (TresJS / Three.js)
```

---

## Technology Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| Vue 3 (Composition API + `<script setup>`) | Core framework |
| Vite | Build tool and dev server |
| Bun | Package manager and runtime (replaces npm) |
| Tailwind CSS v3 | Utility-first styling |
| Pinia | Global state management |
| Vue Router 4 | Client-side routing |
| GSAP | Complex animations, timelines, sci-fi micro-interactions |
| ApexCharts + vue3-apexcharts | Trend visualization charts |
| TresJS | Declarative Three.js for 3D atom model |
| Three.js | Underlying 3D engine (via TresJS) |
| VueUse | Composable utilities (keyboard shortcuts, media queries) |
| lucide-vue-next | Icon library (thin stroke, tree-shakeable) |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| Vercel / Netlify / GitHub Pages | Static hosting |
| Vite build | Outputs static dist/ folder |

### External Services
None. All data is bundled locally.

---

## Frontend Architecture

### Framework
Vue 3 with Composition API using `<script setup>` syntax throughout. No Options API.

### Routing Strategy

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `TableView.vue` | Main periodic table grid |
| `/element/:symbol` | `ElementDetailView.vue` | Full detail page for one element (optional — detail can also be a modal) |
| `/compare` | `CompareView.vue` | Side-by-side element comparison |
| `/trends` | `TrendsView.vue` | Trend visualization charts |

> **Recommendation:** Use a hybrid approach — detail panel is a full-screen modal overlay on `/`, but has a shareable deep-link route at `/element/:symbol`. Compare and Trends are separate routes accessible from top nav.

### State Management (Pinia)

#### `useElementStore`
```
state:
  - elements: Element[]           // all 118 elements loaded from JSON
  - selectedElement: Element | null
  - compareElements: [Element | null, Element | null]
  - activeFilter: FilterState     // { type: 'category' | 'period' | 'group' | 'block', value: string } | null
  - searchQuery: string
  - highlightedElements: Set<number>  // atomic numbers currently highlighted

getters:
  - filteredElements: Element[]   // elements matching current filter/search
  - elementBySymbol(symbol): Element

actions:
  - selectElement(element)
  - clearSelection()
  - setFilter(type, value)
  - clearFilter()
  - setSearchQuery(query)
  - addToCompare(element)
  - clearCompare()
```

#### `useUIStore`
```
state:
  - detailPanelOpen: boolean
  - compareMode: boolean
  - activeTrendProperty: TrendProperty
  - theme: 'dark'   // dark only for v1

actions:
  - openDetailPanel()
  - closeDetailPanel()
  - toggleCompareMode()
  - setTrendProperty(property)
```

### Component Architecture

```
App.vue
├── AppHeader.vue           # Logo, search bar, nav links, compare/trend buttons
├── RouterView
│   ├── TableView.vue       # Main view
│   │   ├── FilterBar.vue   # Category/period/group/block filter chips
│   │   ├── PeriodicGrid.vue
│   │   │   └── ElementTile.vue (×118)  # Individual element cell
│   │   ├── LegendBar.vue   # Color legend for categories
│   │   └── DetailModal.vue # Overlay panel (conditionally rendered)
│   │       ├── ElementHeader.vue
│   │       ├── PropertiesGrid.vue
│   │       ├── ElectronConfigVisualizer.vue
│   │       ├── AtomModel3D.vue
│   │       └── SpectralLines.vue
│   ├── CompareView.vue
│   │   ├── ElementSelector.vue (×2)
│   │   └── CompareTable.vue
│   └── TrendsView.vue
│       ├── TrendPropertySelector.vue
│       └── TrendChart.vue
```

---

## Data Architecture

### Element Data
Stored as `/src/data/elements.json` — a single static JSON array of 118 element objects.

#### Element Schema
```typescript
interface Element {
  // Identity
  atomicNumber: number          // 1–118
  symbol: string                // "H", "He", ...
  name: string                  // "Hydrogen"
  category: ElementCategory     // see enum below
  block: 's' | 'p' | 'd' | 'f'
  period: number                // 1–7
  group: number | null          // 1–18, null for lanthanides/actinides

  // Physical properties
  atomicMass: number            // in u
  density: number | null        // g/cm³
  meltingPoint: number | null   // Kelvin
  boilingPoint: number | null   // Kelvin
  phase: 'solid' | 'liquid' | 'gas' | 'unknown'

  // Chemical properties
  electronegativity: number | null   // Pauling scale
  electronAffinity: number | null    // kJ/mol
  ionizationEnergy: number | null    // kJ/mol (first)
  oxidationStates: number[]
  atomicRadius: number | null        // pm

  // Electronic structure
  electronConfiguration: string      // "1s² 2s² 2p⁶ ..."
  electronShells: number[]           // [2, 8, 18, ...] per shell

  // Discovery
  discoveredBy: string | null
  namedBy: string | null
  yearDiscovered: number | null

  // Enrichment
  summary: string              // 2–3 sentence description
  funFacts: string[]           // 2–3 interesting facts
  uses: string[]               // real-world uses
  compounds: string[]          // common compounds
  spectralLines: string[]      // hex color codes of emission lines

  // Table layout
  xpos: number                 // column position in grid (1–18)
  ypos: number                 // row position in grid (1–9)
}

type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide'
  | 'unknown'
```

> **Data source recommendation:** Use the open-source Bowserinator/Periodic-Table-JSON dataset on GitHub as the base. It covers most fields above and is MIT licensed.

---

## Animation Architecture

### Tools
- **CSS transitions** — hover states, opacity fades, simple transforms on element tiles
- **GSAP** — complex sequences: modal open/close, filter transitions, staggered tile reveals on load
- **TresJS animation loop** — 3D atom orbital animation
- **ApexCharts built-in** — chart bar animations

### Easing Tokens (define in `base.css`)

```css
:root {
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);   /* hover, dropdowns */
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);   /* modal entrance, confident */
}
```

**Never use** bounce `cubic-bezier(0.34, 1.56, 0.64, 1)` or elastic easing — they feel dated.

### Duration Reference

| Duration | Use case |
|----------|----------|
| 100–150ms | Instant feedback — button press, tile click |
| 200–300ms | State changes — hover, filter chip, menu open |
| 300–500ms | Layout changes — detail modal, compare panel |
| 500–800ms | Entrance animations — page load stagger |

Exit animations must be ~75% of enter duration.

### Key Animation Specs

| Interaction | Tool | Spec |
|-------------|------|------|
| Page load — tiles stagger in | GSAP `stagger` | 0.008s per tile, fade + translateY(10→0), 500ms total |
| Element tile hover | CSS | scale(1.05), box-shadow glow, 150ms `--ease-out-quart` |
| Filter apply | GSAP | Non-matching tiles opacity → 0.15, 200ms `power2.out` |
| Detail modal open | GSAP timeline | Backdrop fade 0→0.8 + panel slide x:100%→0, 300ms `--ease-out-expo` |
| Detail modal close | GSAP timeline | Reverse, 220ms (~75% of open) |
| Electron config fill | CSS keyframes | Shell circles fill left-to-right with staggered delay |
| 3D atom orbit | TresJS loop | Continuous rotation, speed varies by shell radius |
| Chart bars | ApexCharts | `animateGradually`, 800ms |
| Compare panel | CSS transition | Slide up from bottom, 350ms |

### GPU Performance Rule
Animate **only** `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` — these trigger layout and destroy performance.

---

## Styling Architecture

### Design Tokens (Tailwind config extension)

```js
// tailwind.config.js
colors: {
  bg: {
    primary: '#0a0e1a',     // main dark background
    secondary: '#0f1528',   // card/panel background
    elevated: '#1a2035',    // hover states, borders
  },
  accent: {
    cyan: '#00d4ff',        // primary accent, glows
    purple: '#7b4fff',      // secondary accent
    green: '#00ff9d',       // positive indicators
  },
  category: {
    'alkali-metal': '#ff6b6b',
    'alkaline-earth-metal': '#ffa94d',
    'transition-metal': '#74c0fc',
    'post-transition-metal': '#63e6be',
    'metalloid': '#a9e34b',
    'nonmetal': '#f8f9fa',
    'halogen': '#da77f2',
    'noble-gas': '#4dabf7',
    'lanthanide': '#ff8787',
    'actinide': '#ffd43b',
    'unknown': '#868e96',
  }
}
```

### Glow Effects
Implemented via Tailwind arbitrary values and CSS custom properties:
```css
.element-glow {
  box-shadow: 0 0 12px 2px var(--category-color);
}
```

---

## Performance Considerations

- All 118 element tiles render on mount — use `v-memo` to prevent unnecessary re-renders on filter changes
- 3D atom model is lazy-loaded only when detail panel opens
- Charts are lazy-loaded only when Trends view is active
- Element JSON is ~150KB — acceptable as static asset, no lazy loading needed
- Use `shallowRef` for element array in Pinia to avoid deep reactivity overhead
