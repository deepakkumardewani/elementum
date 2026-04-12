<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { gsap } from "gsap"
import { formatProperty, categoryColor, CATEGORY_LABELS } from "@/utils/elementUtils"
import type { Element } from "@/types/element"

const props = defineProps<{ elementA: Element; elementB: Element }>()

interface RowDef {
  label: string
  unit?: string
  isNumeric: boolean
  getValue: (el: Element) => number | string | null
}

const ROW_DEFS: RowDef[] = [
  { label: "Atomic Mass",       unit: "u",       isNumeric: true,  getValue: (el) => el.atomicMass },
  { label: "Density",           unit: "g/cm³",   isNumeric: true,  getValue: (el) => el.density },
  { label: "Melting Point",     unit: "K",       isNumeric: true,  getValue: (el) => el.meltingPoint },
  { label: "Boiling Point",     unit: "K",       isNumeric: true,  getValue: (el) => el.boilingPoint },
  { label: "Electronegativity", unit: "Pauling", isNumeric: true,  getValue: (el) => el.electronegativity },
  { label: "Ionization Energy", unit: "kJ/mol",  isNumeric: true,  getValue: (el) => el.ionizationEnergy },
  { label: "Electron Affinity", unit: "kJ/mol",  isNumeric: true,  getValue: (el) => el.electronAffinity },
  { label: "Atomic Radius",     unit: "pm",      isNumeric: true,  getValue: (el) => el.atomicRadius },
  { label: "Period",            isNumeric: true,  getValue: (el) => el.period },
  { label: "Group",             isNumeric: true,  getValue: (el) => el.group },
  { label: "Category",          isNumeric: false, getValue: (el) => CATEGORY_LABELS[el.category] },
  { label: "Phase",             isNumeric: false, getValue: (el) => el.phase },
  { label: "Block",             isNumeric: false, getValue: (el) => el.block.toUpperCase() },
  { label: "Electron Config",   isNumeric: false, getValue: (el) => el.electronConfiguration },
  { label: "Oxidation States",  isNumeric: false, getValue: (el) => el.oxidationStates },
  { label: "Discoverer",        isNumeric: false, getValue: (el) => el.discoverer },
  { label: "Year Discovered",   isNumeric: false, getValue: (el) => el.yearDiscovered != null ? String(el.yearDiscovered) : null },
]

interface ComputedRow {
  label: string
  unit?: string
  isNumeric: boolean
  valueA: string
  valueB: string
  rawA: number | null
  rawB: number | null
  // 0–100 percentage of the "dominant" side
  barA: number
  barB: number
}

const colorA = computed(() => categoryColor(props.elementA.category))
const colorB = computed(() => categoryColor(props.elementB.category))

const rows = computed((): ComputedRow[] =>
  ROW_DEFS.map((def) => {
    const rawA = def.getValue(props.elementA)
    const rawB = def.getValue(props.elementB)
    const numA = typeof rawA === "number" ? rawA : null
    const numB = typeof rawB === "number" ? rawB : null

    // Bar widths: proportional to each value within this row
    let barA = 0
    let barB = 0
    if (numA !== null && numB !== null) {
      const bothPos = numA >= 0 && numB >= 0
      if (bothPos) {
        const maxVal = Math.max(numA, numB)
        if (maxVal > 0) {
          barA = (numA / maxVal) * 100
          barB = (numB / maxVal) * 100
        }
      } else {
        // Handle negative values (e.g. electron affinity): use absolute
        const maxAbs = Math.max(Math.abs(numA), Math.abs(numB))
        if (maxAbs > 0) {
          barA = (Math.abs(numA) / maxAbs) * 100
          barB = (Math.abs(numB) / maxAbs) * 100
        }
      }
    } else if (numA !== null && numB === null) {
      barA = 100
    } else if (numB !== null && numA === null) {
      barB = 100
    }

    return {
      label: def.label,
      unit: def.unit,
      isNumeric: def.isNumeric,
      valueA: formatProperty(rawA as number | string | null, def.unit ?? "", 4),
      valueB: formatProperty(rawB as number | string | null, def.unit ?? "", 4),
      rawA: numA,
      rawB: numB,
      barA,
      barB,
    }
  }),
)

const tableRowsRef = ref<HTMLElement | null>(null)

function animateRows() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  if (!tableRowsRef.value) return
  const rowElements = tableRowsRef.value.querySelectorAll(".ratio-row")
  if (rowElements.length > 0) {
    gsap.fromTo(
      rowElements,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.018, ease: "power2.out" },
    )
  }
}

watch([() => props.elementA, () => props.elementB], () => {
  animateRows()
}, { immediate: true })
</script>

<template>
  <div class="compare-table-wrap">
    <!-- Column headers -->
    <div class="col-headers">
      <div class="col-header col-header--a" :style="{ '--el-color': colorA }">
        <span class="col-symbol">{{ elementA.symbol }}</span>
        <div class="col-meta">
          <span class="col-name">{{ elementA.name }}</span>
          <span class="col-category" :style="{ color: colorA }">
            {{ CATEGORY_LABELS[elementA.category] }}
          </span>
        </div>
      </div>

      <!-- Center axis header -->
      <div class="col-axis-header" aria-hidden="true" />

      <div class="col-header col-header--b" :style="{ '--el-color': colorB }">
        <div class="col-meta col-meta--b">
          <span class="col-name">{{ elementB.name }}</span>
          <span class="col-category" :style="{ color: colorB }">
            {{ CATEGORY_LABELS[elementB.category] }}
          </span>
        </div>
        <span class="col-symbol" :style="{ color: colorB }">{{ elementB.symbol }}</span>
      </div>
    </div>

    <!-- Ratio rows -->
    <div
      class="ratio-rows"
      role="table"
      aria-label="Element property comparison"
      ref="tableRowsRef"
    >
      <div
        v-for="row in rows"
        :key="row.label"
        class="ratio-row"
        role="row"
      >
        <!-- Numeric row: bar visualization -->
        <template v-if="row.isNumeric && (row.rawA !== null || row.rawB !== null)">
          <!-- Left side: element A bar -->
          <div class="ratio-side ratio-side--a" role="cell">
            <span class="ratio-value">{{ row.valueA }}</span>
            <div class="bar-track bar-track--a">
              <div
                class="bar-fill bar-fill--a"
                :style="{ width: `${row.barA}%`, background: colorA }"
              />
            </div>
          </div>

          <!-- Center: property label + axis -->
          <div class="ratio-center" role="cell">
            <span class="ratio-label">{{ row.label }}</span>
            <span v-if="row.unit" class="ratio-unit">{{ row.unit }}</span>
          </div>

          <!-- Right side: element B bar -->
          <div class="ratio-side ratio-side--b" role="cell">
            <div class="bar-track bar-track--b">
              <div
                class="bar-fill bar-fill--b"
                :style="{ width: `${row.barB}%`, background: colorB }"
              />
            </div>
            <span class="ratio-value">{{ row.valueB }}</span>
          </div>
        </template>

        <!-- Categorical / null numeric row: text badges -->
        <template v-else>
          <div class="ratio-side ratio-side--a ratio-side--text" role="cell">
            <span class="cat-badge" :class="{ 'cat-badge--muted': row.valueA === '—' }">
              {{ row.valueA }}
            </span>
          </div>
          <div class="ratio-center" role="cell">
            <span class="ratio-label">{{ row.label }}</span>
          </div>
          <div class="ratio-side ratio-side--b ratio-side--text" role="cell">
            <span class="cat-badge" :class="{ 'cat-badge--muted': row.valueB === '—' }">
              {{ row.valueB }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compare-table-wrap {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  overflow: hidden;
}

/* ── Column headers ────────────────────────────────────────────── */
.col-headers {
  display: grid;
  grid-template-columns: 1fr 120px 1fr;
  border-bottom: 1px solid var(--bg-border);
}

.col-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 1.25rem;
  background: color-mix(in srgb, var(--el-color) 6%, var(--bg-surface));
}

.col-header--a {
  border-left: 3px solid var(--el-color);
}

.col-header--b {
  border-right: 3px solid var(--el-color);
  flex-direction: row-reverse;
}

.col-symbol {
  font-size: 2rem;
  font-weight: 900;
  color: var(--el-color);
  line-height: 1;
  font-family: var(--font-mono);
}

.col-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.col-meta--b {
  text-align: right;
}

.col-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.col-category {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.col-axis-header {
  border-left: 1px solid var(--bg-border);
  border-right: 1px solid var(--bg-border);
  background: var(--bg-surface);
}

/* ── Ratio rows ────────────────────────────────────────────────── */
.ratio-rows {
  display: flex;
  flex-direction: column;
}

.ratio-row {
  display: grid;
  grid-template-columns: 1fr 120px 1fr;
  border-bottom: 1px solid var(--bg-border);
  min-height: 36px;
}

.ratio-row:last-child {
  border-bottom: none;
}

/* ── Sides ─────────────────────────────────────────────────────── */
.ratio-side {
  display: flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  gap: 0.5rem;
}

.ratio-side--a {
  flex-direction: row-reverse; /* value on right, bar grows leftward from center */
  border-left: none;
}

.ratio-side--b {
  flex-direction: row; /* bar grows rightward from center */
}

.ratio-side--text {
  align-items: center;
}

.ratio-side--text.ratio-side--a {
  justify-content: flex-end;
}

.ratio-side--text.ratio-side--b {
  justify-content: flex-start;
}

/* ── Values ────────────────────────────────────────────────────── */
.ratio-value {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 3.5rem;
}

.ratio-side--a .ratio-value {
  text-align: right;
}

.ratio-side--b .ratio-value {
  text-align: left;
}

/* ── Bar tracks ────────────────────────────────────────────────── */
.bar-track {
  flex: 1;
  height: 6px;
  border-radius: 1px;
  background: color-mix(in srgb, var(--bg-border) 60%, transparent);
  overflow: hidden;
  display: flex;
}

/* Bar A fills from right edge (value-to-center direction) */
.bar-track--a {
  justify-content: flex-end;
}

.bar-track--b {
  justify-content: flex-start;
}

.bar-fill {
  height: 100%;
  border-radius: 1px;
  opacity: 0.8;
  transition: width 400ms ease;
}

/* ── Center label column ───────────────────────────────────────── */
.ratio-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.5rem;
  border-left: 1px solid var(--bg-border);
  border-right: 1px solid var(--bg-border);
  text-align: center;
  gap: 1px;
}

.ratio-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.ratio-unit {
  font-family: var(--font-mono);
  font-size: 0.5rem;
  color: var(--text-muted);
  opacity: 0.6;
  white-space: nowrap;
}

/* ── Categorical badges ────────────────────────────────────────── */
.cat-badge {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.cat-badge--muted {
  color: var(--text-muted);
  opacity: 0.5;
}
</style>
