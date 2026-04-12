<script setup lang="ts">
import { computed } from "vue"
import { formatProperty } from "@/utils/elementUtils"
import type { Element } from "@/types/element"

const props = defineProps<{ element: Element }>()

interface PropertyRow {
  label: string
  value: string
  unit?: string
}

const rows = computed((): PropertyRow[] => {
  const el = props.element
  return [
    { label: "Atomic Mass",       value: formatProperty(el.atomicMass, ""),       unit: "u" },
    { label: "Density",           value: formatProperty(el.density, ""),           unit: "g/cm³" },
    { label: "Melting Point",     value: formatProperty(el.meltingPoint, ""),     unit: "K" },
    { label: "Boiling Point",     value: formatProperty(el.boilingPoint, ""),     unit: "K" },
    { label: "Electronegativity", value: formatProperty(el.electronegativity, ""), unit: "Pauling" },
    { label: "Ionization Energy", value: formatProperty(el.ionizationEnergy, ""), unit: "kJ/mol" },
    { label: "Electron Affinity", value: formatProperty(el.electronAffinity, ""), unit: "kJ/mol" },
    { label: "Atomic Radius",     value: formatProperty(el.atomicRadius, ""),     unit: "pm" },
    { label: "Molar Heat",        value: formatProperty(el.molarHeat ?? null, ""), unit: "J/mol·K" },
    { label: "Period / Group",    value: `${el.period} / ${el.group ?? "—"}` },
    { label: "Oxidation States",  value: el.oxidationStates ?? "—" },
    { label: "Appearance",        value: el.appearance ?? "—" },
    { label: "Discoverer",        value: el.discoverer ?? "—" },
    { label: "Named By",          value: el.namedBy ?? "—" },
    { label: "Year Discovered",   value: el.yearDiscovered != null ? String(el.yearDiscovered) : "—" },
  ]
})
</script>

<template>
  <section class="properties-section" aria-label="Element properties">
    <h3 class="section-title">Properties</h3>
    <dl class="datasheet">
      <div
        v-for="row in rows"
        :key="row.label"
        class="datasheet-row"
      >
        <dt class="row-label">{{ row.label }}</dt>
        <dd class="row-value">
          <span class="value-num">{{ row.value }}</span>
          <span v-if="row.unit && row.value !== '—'" class="value-unit">{{ row.unit }}</span>
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.section-title {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.625rem;
}

/* Lab datasheet: ruled rows, no card borders */
.datasheet {
  display: flex;
  flex-direction: column;
  /* No gap — border-bottom on rows creates the rhythm */
}

.datasheet-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 0;
  border-bottom: 1px dashed var(--bg-border);
}

.datasheet-row:last-child {
  border-bottom: none;
}

.row-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  /* Fixed width keeps values aligned */
  min-width: 140px;
}

.row-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  justify-content: flex-end;
  margin: 0;
  text-align: right;
}

.value-num {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.value-unit {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: 400;
}
</style>
