<script setup lang="ts">
import { computed } from "vue"
import { ArrowUp, ArrowDown } from "lucide-vue-next"
import { formatProperty, categoryColor, CATEGORY_LABELS } from "@/utils/elementUtils"
import GlowBadge from "@/components/detail/GlowBadge.vue"
import type { Element } from "@/types/element"

const props = defineProps<{ elementA: Element; elementB: Element }>()

type Diff = "higher" | "lower" | "equal" | null

interface RowDef {
  label: string
  unit?: string
  isNumeric: boolean
  getValue: (el: Element) => number | string | null
}

const ROW_DEFS: RowDef[] = [
  { label: "Atomic Mass", unit: "u", isNumeric: true, getValue: (el) => el.atomicMass },
  { label: "Density", unit: "g/cm³", isNumeric: true, getValue: (el) => el.density },
  { label: "Melting Point", unit: "K", isNumeric: true, getValue: (el) => el.meltingPoint },
  { label: "Boiling Point", unit: "K", isNumeric: true, getValue: (el) => el.boilingPoint },
  {
    label: "Electronegativity",
    unit: "Pauling",
    isNumeric: true,
    getValue: (el) => el.electronegativity,
  },
  {
    label: "Ionization Energy",
    unit: "kJ/mol",
    isNumeric: true,
    getValue: (el) => el.ionizationEnergy,
  },
  {
    label: "Electron Affinity",
    unit: "kJ/mol",
    isNumeric: true,
    getValue: (el) => el.electronAffinity,
  },
  { label: "Atomic Radius", unit: "pm", isNumeric: true, getValue: (el) => el.atomicRadius },
  { label: "Period", isNumeric: true, getValue: (el) => el.period },
  { label: "Group", isNumeric: true, getValue: (el) => el.group },
  { label: "Category", isNumeric: false, getValue: (el) => CATEGORY_LABELS[el.category] },
  { label: "Phase", isNumeric: false, getValue: (el) => el.phase },
  { label: "Block", isNumeric: false, getValue: (el) => el.block.toUpperCase() },
  {
    label: "Electron Config",
    isNumeric: false,
    getValue: (el) => el.electronConfiguration,
  },
  { label: "Oxidation States", isNumeric: false, getValue: (el) => el.oxidationStates },
  { label: "Discoverer", isNumeric: false, getValue: (el) => el.discoverer },
  {
    label: "Year Discovered",
    isNumeric: false,
    getValue: (el) => (el.yearDiscovered != null ? String(el.yearDiscovered) : null),
  },
]

interface ComputedRow {
  label: string
  valueA: string
  valueB: string
  unit?: string
  diffA: Diff
  diffB: Diff
}

function computeDiff(rawA: number | string | null, rawB: number | string | null): Diff {
  if (typeof rawA !== "number" || typeof rawB !== "number") return null
  if (rawA > rawB) return "higher"
  if (rawA < rawB) return "lower"
  return "equal"
}

const rows = computed((): ComputedRow[] =>
  ROW_DEFS.map((def) => {
    const rawA = def.getValue(props.elementA)
    const rawB = def.getValue(props.elementB)
    const diffA = def.isNumeric ? computeDiff(rawA, rawB) : null
    const diffB = def.isNumeric ? computeDiff(rawB, rawA) : null
    return {
      label: def.label,
      unit: def.unit,
      valueA: formatProperty(rawA as number | string | null, def.unit ?? "", 4),
      valueB: formatProperty(rawB as number | string | null, def.unit ?? "", 4),
      diffA,
      diffB,
    }
  }),
)
</script>

<template>
  <div class="compare-table-wrap">
    <!-- Element header -->
    <div class="element-headers">
      <div
        class="element-header"
        :style="{ '--el-color': categoryColor(elementA.category) }"
      >
        <span class="el-symbol">{{ elementA.symbol }}</span>
        <div class="el-meta">
          <span class="el-name">{{ elementA.name }}</span>
          <GlowBadge :category="elementA.category" />
        </div>
      </div>
      <div class="header-spacer" aria-hidden="true" />
      <div
        class="element-header"
        :style="{ '--el-color': categoryColor(elementB.category) }"
      >
        <span class="el-symbol">{{ elementB.symbol }}</span>
        <div class="el-meta">
          <span class="el-name">{{ elementB.name }}</span>
          <GlowBadge :category="elementB.category" />
        </div>
      </div>
    </div>

    <!-- Properties table -->
    <table
      class="compare-table"
      aria-label="Element property comparison"
    >
      <thead class="sr-only">
        <tr>
          <th scope="col">{{ elementA.name }}</th>
          <th scope="col">Property</th>
          <th scope="col">{{ elementB.name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.label"
          class="compare-row"
        >
          <!-- Element A value -->
          <td class="value-cell value-cell--a">
            <span class="value-text">{{ row.valueA }}</span>
            <ArrowUp
              v-if="row.diffA === 'higher'"
              :size="11"
              class="diff-icon diff-up"
              aria-label="higher"
            />
            <ArrowDown
              v-if="row.diffA === 'lower'"
              :size="11"
              class="diff-icon diff-down"
              aria-label="lower"
            />
          </td>

          <!-- Property label -->
          <td class="property-label">{{ row.label }}</td>

          <!-- Element B value -->
          <td class="value-cell value-cell--b">
            <ArrowUp
              v-if="row.diffB === 'higher'"
              :size="11"
              class="diff-icon diff-up"
              aria-label="higher"
            />
            <ArrowDown
              v-if="row.diffB === 'lower'"
              :size="11"
              class="diff-icon diff-down"
              aria-label="lower"
            />
            <span class="value-text">{{ row.valueB }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.compare-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--bg-border);
  border-radius: 10px;
  overflow: hidden;
}

/* Element headers row */
.element-headers {
  display: grid;
  grid-template-columns: 1fr 160px 1fr;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--bg-border);
}

.element-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  border-left: 3px solid var(--el-color);
}

.element-header:last-child {
  border-left: none;
  border-right: 3px solid var(--el-color);
  flex-direction: row-reverse;
}

.el-symbol {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--el-color);
  line-height: 1;
}

.el-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.el-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-spacer {
  border-left: 1px solid var(--bg-border);
  border-right: 1px solid var(--bg-border);
}

/* Property table */
.compare-table {
  width: 100%;
  border-collapse: collapse;
}

.compare-row {
  display: grid;
  grid-template-columns: 1fr 160px 1fr;
  border-bottom: 1px solid var(--bg-border);
  transition: background-color 150ms ease;
}

.compare-row:last-child {
  border-bottom: none;
}

.compare-row:nth-child(even) {
  background: color-mix(in srgb, var(--bg-surface) 50%, var(--bg-base));
}

.compare-row:hover {
  background: var(--bg-elevated);
}

.property-label {
  padding: 10px 16px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-align: center;
  border-left: 1px solid var(--bg-border);
  border-right: 1px solid var(--bg-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.value-cell {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.value-cell--a {
  justify-content: flex-end;
}

.value-cell--b {
  justify-content: flex-start;
}

.value-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.diff-icon {
  flex-shrink: 0;
}

.diff-up {
  color: #22c55e;
}

.diff-down {
  color: #ef4444;
}

/* Visually hidden but available to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
