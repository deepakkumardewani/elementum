# Elementum — Scientific Accuracy & UX Improvements Spec

**Prepared from:** Dr. Eric Scerri expert review (April 2026)
**Scope:** 8 discrete issues across data integrity, 3D visualization, UI labeling, and feature completeness
**Stack:** Vue 3, TypeScript, TresJS/Three.js, ApexCharts, Pinia, GSAP

---

## Objective

Resolve every scientifically inaccurate, misleading, or incomplete issue identified in the expert review, bringing Elementum to a standard credible for both students and serious chemistry users.

---

## Issues & Acceptance Criteria

### Issue 1 — Fix Negative Van der Waals Radii
**File:** `src/data/elements.json`

**Problem:** Multiple elements store `vanDerWaalsRadius` as negative values (H: −259.14, He: −272.05, F: −363, Ar: −189.34 pm, and others). A radius cannot be negative.

**Acceptance Criteria:**
- All `vanDerWaalsRadius` values in `elements.json` are positive numbers or `null`
- No element has a negative radius of any kind (atomic, covalent, van der Waals)
- Corrected values match IUPAC/literature sources

**Approach:**
- Audit all `vanDerWaalsRadius` fields in `elements.json`
- Remove negative signs; verify corrected values against known literature (H: ~120 pm, He: ~140 pm, F: ~147 pm, Ar: ~188 pm)
- Also audit `atomicRadius` and `covalentRadius` fields for the same class of error

---

### Issue 2 — Dynamic Nucleus in 3D Atom Model
**File:** `src/components/detail/AtomScene.vue`

**Problem:** The nucleus is hardcoded as exactly 4 red spheres (protons) + 4 blue spheres (neutrons) for every element. Gold (79p/118n) and Hydrogen (1p/0n) are rendered identically.

**Acceptance Criteria:**
- Nucleus particle count and visual scale are derived from the element's `atomicNumber` (protons) and mass-derived neutron count (= round(atomicMass) − atomicNumber)
- Visual approach: **scale-and-cluster** — render a dense nucleus ball using a capped particle count (max ~24 visible particles), with red = protons, blue = neutrons, randomly distributed in a small sphere
- For elements where total nucleon count ≤ 24: show exact particles
- For elements where nucleon count > 24: show proportionally sampled particles (maintain p:n ratio), and display exact Z and N as a label near the nucleus
- Nucleus sphere radius scales logarithmically with atomic number (larger Z → larger nucleus ball), providing visual intuition

**Approach:**
- Extract nucleus generation into a `buildNucleus(atomicNumber, atomicMass)` composable/utility
- Replace hardcoded particle array in `AtomScene.vue` with dynamic generation
- Add Z / N text label to the nucleus using a TresJS text mesh or HTML overlay

---

### Issue 3 — Remove 8-Electron Shell Cap in 3D Model
**File:** `src/components/detail/AtomScene.vue`

**Problem:** Line 46 caps electrons shown per shell at 8. Gold's 4th shell (32 electrons) is rendered as only 8. This misrepresents all transition metals, lanthanides, and actinides.

**Acceptance Criteria:**
- All electrons in a shell are rendered, or a maximum of 32 (the true quantum maximum) is shown
- For shells with > 16 electrons, use a denser, multi-ring arrangement (two concentric tori at slightly different radii) to avoid visual overcrowding
- The total electron count displayed must equal the element's atomic number
- Performance: no frame rate degradation for elements up to Z=118

**Approach:**
- Remove or raise the hard cap in `AtomScene.vue`
- For shells with electron count > 16, split electrons across an inner and outer torus at the same shell radius (e.g. 18 → 10 inner + 8 outer)
- Validate all period 4–7 elements visually

---

### Issue 4 — Add "Pauling" Unit Label to Electronegativity in Trend Chart
**File:** `src/utils/trendData.ts`

**Problem:** The `unit` field for electronegativity is an empty string (`unit: ""`), so the TrendChart y-axis and tooltip display no unit. The CompareTable correctly shows "Pauling" — this is an inconsistency.

**Acceptance Criteria:**
- Electronegativity unit reads `"Pauling"` in `trendData.ts`
- TrendChart y-axis label and tooltip both show "Pauling" for electronegativity
- All other units remain unchanged

**Approach:**
- Single-line fix in `trendData.ts`: change `unit: ""` to `unit: "Pauling"` for the electronegativity entry

---

### Issue 5 — Bohr Model Disclaimer on 3D Visualization
**File:** `src/components/detail/AtomModel3D.vue`

**Problem:** The 3D model presents a classical Bohr-style planetary atom with no qualification. Marketed to researchers, this is misleading without context.

**Acceptance Criteria:**
- A small, unobtrusive disclaimer text is visible in or near the 3D model panel
- Text reads (approximately): *"Simplified shell model — actual electron positions are described by quantum probability distributions"*
- Disclaimer does not obstruct the 3D canvas
- Styled consistently with the existing "scientific lab terminal" aesthetic (muted, small text)

**Approach:**
- Add a `<p class="model-disclaimer">` below the TresJS canvas in `AtomModel3D.vue`
- Style using existing `--text-muted` CSS variable, `text-2xs` type scale, and the current panel's padding

---

### Issue 6 — Add Group & Period Labels to Periodic Grid
**File:** `src/components/PeriodicGrid.vue`

**Problem:** The periodic table grid has no visible Group (1–18) column headers or Period (1–7) row labels. Users without prior chemistry knowledge cannot navigate by coordinates.

**Acceptance Criteria:**
- Group numbers 1–18 appear as column headers above the main 18-column grid
- Period numbers 1–7 appear as row labels on the left side of the grid
- Labels are visually subordinate to the element tiles (muted color, smaller font)
- The f-block (lanthanide/actinide rows) does NOT show period labels (they are displayed separately below the main grid)
- Labels do not break the existing responsive layout or GSAP entrance animation

**Approach:**
- In `PeriodicGrid.vue`, add a header row of 18 `<div>` cells containing "1" through "18" before the element tile rows
- Add period number cells in column 0 of each of the 7 main rows
- Style with `--text-muted` color, `text-xs` size, centered alignment
- Use `aria-label` attributes for accessibility: `<div role="columnheader" aria-label="Group 1">`

---

### Issue 7 — Compute Spectral Line Colors from Wavelength
**Files:**
- New: `src/utils/wavelength.ts`
- Modified: `src/components/detail/SpectralLines.vue`

**Problem:** Spectral line colors are hardcoded hex values in `elements.json`. Some values deviate ~3% from accurate wavelength-to-RGB conversion. Maintaining 80+ elements' worth of hardcoded colors is also fragile.

**Acceptance Criteria:**
- A `wavelengthToRgb(wavelength: number): string` utility is created that converts a wavelength in nm (380–780) to an accurate hex color
- `SpectralLines.vue` uses this utility to compute line colors at render time; the `color` field from JSON is ignored or removed
- Hydrogen Balmer lines are visually indistinguishable from their known colors (656.3 nm = red, 486.1 nm = cyan-blue, 434 nm = violet, 410.2 nm = deep violet)
- Wavelengths outside 380–780 nm render as transparent/invisible (UV/IR not visible)

**Approach:**
- Implement Bruton's wavelength-to-RGB algorithm in `src/utils/wavelength.ts`:
  - Map wavelength ranges to approximate RGB components
  - Apply intensity falloff at spectrum edges (380–420 nm and 700–780 nm fade to dim)
  - Return hex string
- In `SpectralLines.vue`, replace `line.color` with `wavelengthToRgb(line.wavelength)`
- The `color` field in `elements.json` can remain (non-breaking) but is no longer consumed

---

### Issue 8 — Add Missing Properties to Comparison Matrix
**File:** `src/components/compare/CompareTable.vue`

**Problem:** Four properties present in the `Element` type and populated in `elements.json` are absent from the comparison matrix: `mohsHardness`, `vanDerWaalsRadius`, `crystalStructure`, `thermalConductivity`.

**Acceptance Criteria:**
- All four properties are added as rows in the comparison table
- Numeric properties (`mohsHardness`, `vanDerWaalsRadius`, `thermalConductivity`) use the existing bar-chart row style with correct units:
  - Mohs Hardness: unitless (Mohs scale, 0–10)
  - Van der Waals Radius: pm
  - Thermal Conductivity: W/(m·K)
- Categorical property (`crystalStructure`) uses the existing badge/text row style
- Null values display as "—" consistent with existing behavior
- Row ordering: insert after "Atomic Radius" for vdW radius; append hardness, thermal conductivity, and crystal structure after the existing numeric block

**Approach:**
- Add 4 new entries to the `ROW_DEFS` array in `CompareTable.vue`
- Follow the existing row definition schema (key, label, unit, type)
- No changes to the Element type or data model required

---

## File Change Summary

| File | Change Type | Issue |
|------|-------------|-------|
| `src/data/elements.json` | Data fix | #1 (vdW radii) |
| `src/components/detail/AtomScene.vue` | Feature + bugfix | #2 (nucleus), #3 (shell cap) |
| `src/utils/trendData.ts` | Data fix | #4 (electronegativity unit) |
| `src/components/detail/AtomModel3D.vue` | UI addition | #5 (disclaimer) |
| `src/components/PeriodicGrid.vue` | UI addition | #6 (grid headers) |
| `src/utils/wavelength.ts` | New file | #7 (spectral colors) |
| `src/components/detail/SpectralLines.vue` | Refactor | #7 (spectral colors) |
| `src/components/compare/CompareTable.vue` | Feature addition | #8 (comparison rows) |

---

## Code Style & Constraints

- **No new dependencies** — all changes use existing stack (Vue 3, TypeScript, Three.js/TresJS)
- **Never commit** unless explicitly instructed
- **Never write test cases** unless explicitly instructed
- **Never run the server** — it is always running
- Use `bun` for any package operations
- Follow existing naming conventions and CSS variable system (`--text-muted`, `--bg-surface`, etc.)
- All new TypeScript must be strictly typed — no `any`
- Constants (max particle count, wavelength bounds) must be named constants, not magic numbers
- Functions must be pure where possible; side effects isolated

---

## Boundaries

| Category | Rule |
|----------|------|
| **Always do** | Fix data to match IUPAC/literature values |
| **Always do** | Preserve existing animations, theming, and accessibility |
| **Ask first** | Any change that alters the Element data schema or Pinia store shape |
| **Ask first** | Any visual design change beyond what is specified above |
| **Never do** | Add new npm dependencies |
| **Never do** | Modify the quiz, tools, or bookmarks features |
| **Never do** | Change routing or Pinia store architecture |

---

## Implementation Order (Suggested)

1. Issue 4 — Electronegativity unit (1 line, zero risk)
2. Issue 1 — Fix vdW radii in JSON (data audit, no logic)
3. Issue 5 — Bohr model disclaimer (additive, no logic)
4. Issue 8 — Comparison matrix rows (additive, no logic)
5. Issue 7 — Wavelength utility + SpectralLines refactor
6. Issue 6 — Grid headers (layout addition)
7. Issue 3 — Shell cap removal in 3D model
8. Issue 2 — Dynamic nucleus (most complex, depends on shell cap work)
