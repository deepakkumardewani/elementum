# AGENT_INSTRUCTIONS.md — Elementum

---

## Project Context

You are building a dark-themed, sci-fi styled interactive periodic table web application. It is a fully client-side Vue 3 SPA with no backend. Refer to PRD.md, ARCHITECTURE.md, FOLDER_STRUCTURE.md, and TASKS.md before writing any code.

---

## Coding Conventions

### Vue
- Always use `<script setup lang="ts">` — never Options API, never `defineComponent`
- Use `defineProps<{}>()` and `defineEmits<{}>()` with TypeScript generics
- Use `defineModel()` for two-way binding where applicable (Vue 3.4+)
- Keep components under 200 lines — extract sub-components aggressively
- Component filenames: PascalCase (`ElementTile.vue`)
- One component per file

### TypeScript
- Strict mode enabled in tsconfig
- No `any` — use proper types or `unknown`
- All props, emits, store state, and composable return values must be typed
- Import types with `import type { ... }`

### Tailwind
- Use utility classes exclusively — no inline styles except for dynamic CSS custom properties (e.g. `--category-color`)
- Use `@apply` sparingly and only in `base.css` / `animations.css`
- Extend Tailwind config for design tokens — do not hardcode color hex values in templates
- Arbitrary values are allowed for one-off glow effects: `shadow-[0_0_12px_2px_var(--category-color)]`

### Package Manager
- Use **Bun** exclusively — never npm or yarn
- Install packages: `bun add <package>`
- Dev dependencies: `bun add -d <package>`
- Run scripts: `bun run dev`, `bun run build`, `bun run preview`
- Do not commit a `package-lock.json` — Bun uses `bun.lockb`

### Icons
- Use **lucide-vue-next** for all icons
- Import individually — never import the entire library: `import { Search, X, ChevronDown } from 'lucide-vue-next'`
- Use as components directly in templates: `<Search :size="18" />`
- Do not use any other icon library
- Views: PascalCase + `View` suffix (`TableView.vue`)
- Composables: camelCase + `use` prefix (`useElementSearch.ts`)
- Stores: camelCase + `Store` suffix (`elementStore.ts`)
- Types: PascalCase interface names in `types/` folder

---

## Architecture Rules

1. **No backend calls.** All data comes from `/src/data/elements.json`. Never add API calls.
2. **Pinia is the single source of truth.** Components must not maintain their own copies of element data — read from store only.
3. **Lazy-load heavy components.** `AtomModel3D.vue` and `TrendChart.vue` must use `defineAsyncComponent` or dynamic `import()`.
4. **No prop drilling beyond 2 levels.** Use the store or provide/inject for deep data.
5. **Views are thin.** Views compose components — they do not contain business logic. Logic lives in composables or stores.
6. **Do not use `document.querySelector` or direct DOM manipulation** except inside GSAP animation calls or Three.js canvas setup inside `onMounted`.

---

## State Management Rules

- All element data lives in `elementStore`
- UI state (panel open, compare mode, active trend) lives in `uiStore`
- Never duplicate state between stores
- Use `storeToRefs()` when destructuring reactive state from Pinia in components
- Use `shallowRef` for the `elements` array — deep reactivity is not needed
- `highlightedElements` is a `Set<number>` (atomic numbers) — use `computed` to derive `isHighlighted` and `isDimmed` per element

```ts
// Correct pattern in component
const { elements, selectedElement } = storeToRefs(elementStore)
const { selectElement, setFilter } = elementStore
```

---

## Animation Guidelines

Every animation must have a purpose — feedback, orientation, or delight. Animate with intention, never decoration.

### Animation Strategy for This Project

| Layer | What | Where |
|-------|------|--------|
| Hero moment | Staggered tile entrance on page load | PeriodicGrid mount |
| Feedback | Hover glow + scale on ElementTile | CSS transition |
| Transition | Filter highlight/dim tween | GSAP batch |
| Transition | Detail panel open/close | GSAP timeline |
| Delight | Animated electron orbit in AtomModel3D | TresJS render loop |
| Delight | Chart bar animate-in | ApexCharts built-in |
| Feedback | Electron shell fill animation | CSS keyframes |

### Timing & Easing — Use These Exactly

```css
/* In base.css — define these as CSS custom properties */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);   /* hover, menu open */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);    /* modal entrance, confident */
```

**Duration by purpose — never deviate without reason:**
- `100–150ms` — instant feedback (button press, tile click acknowledgment)
- `200–300ms` — state changes (hover, filter chip toggle)
- `300–500ms` — layout changes (detail modal, compare panel)
- `500–800ms` — entrance animations (page load stagger)

**Exit animations must be ~75% of enter duration.** A modal that enters in 300ms exits in 220ms.

### GSAP Rules
- Import only what you use: `import { gsap } from 'gsap'`
- Always use `gsap.context()` scoped to the component root — required for cleanup
- Always revert in `onUnmounted` to prevent memory leaks
- Use GSAP timelines for multi-step sequences (modal open = backdrop fade + panel slide)

```ts
// Correct GSAP cleanup pattern
let ctx: gsap.Context
onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.element-tile', {
      opacity: 0, y: 10, stagger: 0.008,
      duration: 0.5, ease: 'power2.out'
    })
  }, rootEl)
})
onUnmounted(() => ctx.revert())
```

### CSS Transitions
- Use CSS transitions (not GSAP) for simple hover states — scale, opacity, box-shadow
- Define transitions on the element itself, not in JS
- Base tile hover: `transition: transform 150ms var(--ease-out-quart), box-shadow 150ms var(--ease-out-quart)`
- Hover scale: `1.05` — never exceed `1.08`

### TresJS (3D Atom)
- Use `useRenderLoop` for the animation loop
- Destroy the renderer in `onUnmounted`
- Keep geometry and material counts minimal — this is decorative, not scientifically accurate

### Reduced Motion — Non-Negotiable
Always respect `prefers-reduced-motion`. Add this to `base.css` and never remove it:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Do Nots
- **Never** use bounce or elastic easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) — feels dated
- **Never** animate layout properties (width, height, top, left) — use `transform` only
- **Never** use durations over 500ms for feedback interactions — feels laggy
- **Never** animate without a clear purpose — no decorative motion
- **Never** block user interaction during animations unless intentional
- **Never** animate everything — animation fatigue makes interfaces feel exhausting

---

## Layout & Spacing Guidelines

Space is a design material — use it with intention. Hierarchy through space alone beats adding color or size contrast.

### Spacing System

Use Tailwind's spacing scale exclusively. No arbitrary spacing values outside the scale except for one-off glow/shadow effects.

| Usage | Tailwind token | Value |
|-------|---------------|-------|
| Between sibling elements in a card | `gap-2` / `gap-3` | 8–12px |
| Between cards/tiles | `gap-4` / `gap-5` | 16–20px |
| Between distinct sections | `gap-12` to `gap-24` | 48–96px |
| Panel internal padding | `p-6` / `p-8` | 24–32px |

- Use `gap` for sibling spacing — never margins between flex/grid children
- Vary spacing intentionally — equal spacing everywhere kills rhythm
- Tight grouping for related elements, generous space between distinct sections

### Visual Hierarchy Rules
- Apply the squint test: blur your vision — can you still identify the primary element, secondary, and groupings? If not, fix spacing before adding color.
- Space alone can establish hierarchy — use size/color contrast only when spacing isn't enough
- The periodic table grid cells must feel tight and dense (data-dense UI) — the detail panel needs generous internal padding (reading UI). These are different density contexts.

### Layout Tool Selection
- **Flexbox** for 1D layouts: nav bar, filter chips, button groups, card internals
- **CSS Grid** for 2D layouts: the periodic table grid itself, the properties grid in detail panel, compare table
- Do not default to Grid when Flexbox with `flex-wrap` is simpler

### Elevation & Depth
Define a semantic z-index scale and never deviate:

```ts
// In types/ or a constants file
export const Z = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modalBackdrop: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
} as const
```

Shadow scale — subtle only, never decorative:
- `shadow-sm` — element tile resting state
- `shadow-md` — element tile hover
- `shadow-lg` — detail panel, dropdowns
- `shadow-xl` — modals

### Layout Do Nots
- **Never** use arbitrary spacing values outside Tailwind's scale
- **Never** make all spacing equal — variety creates rhythm
- **Never** nest cards inside cards — use spacing and dividers for internal hierarchy
- **Never** use arbitrary z-index values (999, 9999) — use the semantic Z scale
- **Never** center everything — the periodic table grid is left-anchored by nature; respect it

---

## Performance Rules (Lighthouse ≥ 90 Target)

**Target scores: Performance ≥ 90, Accessibility ≥ 90.** These are hard requirements, not aspirational. Verify with `bun run build && bun run preview` + Lighthouse CLI before marking any epic complete.

### Rendering Performance
- Use `v-memo="[element.atomicNumber, isHighlighted, isDimmed]"` on `ElementTile` — critical for filter performance with 118 tiles re-evaluating on every store change
- Use `computed` for all derived state (filtered elements, highlighted set) — never recalculate in template expressions
- Use `shallowRef` for the elements array — deep reactivity is not needed and adds overhead
- Use `v-show` (not `v-if`) for the detail modal to preserve GSAP animation state and avoid re-mounting costs
- Avoid `watch` with `deep: true` on the elements array

### Asset Performance
- Lazy-load `AtomModel3D` and `TrendChart` via `defineAsyncComponent` — Three.js and ApexCharts are large; they must not be in the initial bundle
- Elements JSON (~150KB) is imported directly — acceptable; no lazy loading needed
- No external fonts unless self-hosted — use `font-display: swap`
- All icons via `lucide-vue-next` are tree-shaken at build time — import individually, always

### GPU-Accelerated Animations Only
- Animate `transform` and `opacity` exclusively — never animate `width`, `height`, `top`, `left`, `margin`, or any layout property
- Add `will-change: transform` only on elements with known expensive animations (detail panel, element tiles during stagger) — remove after animation completes
- The 3D atom canvas must not cause layout reflow — wrap in a fixed-size container

### Core Web Vitals
- **LCP**: The periodic table grid is the LCP candidate — ensure it renders within the first frame, no lazy loading on the grid itself
- **CLS**: Reserve space for the detail panel before it opens — use `v-show` not `v-if` to avoid layout shift
- **INP**: Filter and search interactions must respond within 200ms — `v-memo` and `computed` are the main levers

---

## Accessibility Rules (Lighthouse ≥ 90 Target)

### Semantic HTML
- Use `<button>` for all clickable ElementTiles — not `<div>` with click handlers
- Use `<nav>` for AppHeader navigation links
- Use `<main>` as the wrapper for the periodic table view
- Use `<dialog>` or `role="dialog"` + `aria-modal="true"` for the detail modal
- Use `<search>` or `role="search"` on the SearchBar wrapper

### ARIA
- Every ElementTile: `aria-label="[Element Name], atomic number [N], [Category]"`
- Detail modal: `aria-labelledby` pointing to the element name heading
- Filter chips: `aria-pressed="true/false"` for toggle state
- Search input: `aria-label="Search elements"` + `aria-controls` pointing to the grid
- Trend chart: `aria-label="[Property] trend chart"` on the chart container
- Loading states: `aria-busy="true"` while async components load

### Focus Management
- Detail modal must trap focus while open (use VueUse `useFocusTrap`)
- On modal close, return focus to the ElementTile that opened it
- All interactive elements must have visible focus rings — use `focus-visible:ring-2 focus-visible:ring-accent-cyan`
- Tab order must follow visual reading order

### Keyboard Navigation
- `Tab` / `Shift+Tab` — navigate interactive elements
- `Enter` / `Space` — activate ElementTile, filter chips, buttons
- `Escape` — close detail modal, clear search
- `/` — focus search input (via VueUse `useEventListener`)
- Arrow keys — navigate between elements when detail panel is open

### Color & Contrast
- All text on dark backgrounds must meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- Category colors are used for borders/glows only — never as the sole means of conveying information (always pair with text label)
- Never rely on color alone to indicate state (highlighted/dimmed must also differ in opacity)

### Reduced Motion
```css
/* base.css — mandatory, never remove */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Error Handling Patterns

- Element properties may be `null` — always handle null display gracefully: show `"—"` for missing numeric values
- Wrap `AtomModel3D` in an error boundary (`onErrorCaptured`) in case WebGL is unavailable — fall back to a 2D SVG atom diagram
- Wrap `TrendChart` in a try/catch during data transformation — show "Data unavailable" state if ApexCharts fails to render

```ts
// Null-safe property display utility
export function formatProperty(value: number | null, unit: string): string {
  if (value === null || value === undefined) return '—'
  return `${value} ${unit}`
}
```

---

## Component Checklist

Before marking any component as complete, verify every item:

**TypeScript & Code Quality**
- [ ] All props, emits, and composable return values are typed — no `any`
- [ ] Null-safe rendering for all element properties (show `"—"` for nulls)
- [ ] Component is under 200 lines — extract if not
- [ ] No hardcoded color hex values — use Tailwind tokens or CSS variables

**Animation**
- [ ] GSAP context created and reverted in `onUnmounted`
- [ ] Only `transform` and `opacity` are animated — no layout properties
- [ ] Timing follows the spec: feedback ≤ 150ms, state changes ≤ 300ms, entrances ≤ 800ms
- [ ] No bounce or elastic easing used
- [ ] `prefers-reduced-motion` respected via `base.css` global rule

**Layout & Spacing**
- [ ] Spacing uses Tailwind scale only — no arbitrary values outside the design token set
- [ ] Squint test passes — hierarchy is clear without reading any text
- [ ] `gap` used for sibling spacing, not margins

**Performance**
- [ ] `v-memo` applied on ElementTile
- [ ] Heavy async components use `defineAsyncComponent`
- [ ] No layout-thrashing animations (no width/height/top/left tweens)

**Accessibility**
- [ ] Interactive elements use semantic HTML (`<button>`, not `<div>`)
- [ ] Correct `aria-label`, `aria-pressed`, or `aria-labelledby` applied
- [ ] Visible focus ring on all interactive elements (`focus-visible:ring-2`)
- [ ] Tested with keyboard-only navigation (Tab, Enter, Escape, arrows)
- [ ] Color is not the sole means of conveying state

**Testing**
- [ ] Tested in Chrome and Firefox
- [ ] Lighthouse Performance ≥ 90 (run on production build, not dev server)
- [ ] Lighthouse Accessibility ≥ 90

---

## Data Source

Use the **Bowserinator/Periodic-Table-JSON** dataset from GitHub as the base:
`https://github.com/Bowserinator/Periodic-Table-JSON`

After downloading, extend each element object with:
- `xpos`: column in periodic table grid (1–18)
- `ypos`: row in periodic table grid (1–9)
- `spectralLines`: array of hex color strings (research per element or use a curated subset)
- `funFacts`: array of 2–3 strings (can be generated with AI or researched)
- `compounds`: array of common compound names

The extended JSON lives at `/src/data/elements.json` and is never fetched — it is imported directly.

```ts
// Correct import
import elements from '@/data/elements.json'
```

---

## Do Not

- Do not add a backend or any server-side code
- Do not use Options API
- Do not use npm or yarn — Bun only
- Do not use `localStorage` or `sessionStorage` (no persistence needed in v1)
- Do not add a UI component library like shadcn/Vuetify/PrimeVue — all UI is custom with Tailwind
- Do not use any icon library other than lucide-vue-next
- Do not add authentication
- Do not build for mobile-first — desktop is the primary target
- Do not over-engineer quiz/gamification features — that is P2 and out of scope for v1
