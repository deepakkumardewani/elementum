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

interface Section {
  title: string
  rows: PropertyRow[]
}

function row(label: string, value: string, unit?: string): PropertyRow {
  return { label, value, unit }
}

function fmt(v: number | null | undefined, fallback = ""): string {
  return formatProperty(v ?? null, fallback)
}

function kelvinToCelsius(k: number | null | undefined): string {
  if (k == null) return "—"
  return (k - 273.15).toFixed(2)
}

function kelvinToFahrenheit(k: number | null | undefined): string {
  if (k == null) return "—"
  return ((k * 9) / 5 - 459.67).toFixed(2)
}

function tempRow(label: string, k: number | null | undefined): PropertyRow {
  if (k == null) return row(label, "—")
  return row(label, `${fmt(k)} K  /  ${kelvinToCelsius(k)} °C  /  ${kelvinToFahrenheit(k)} °F`)
}

function formatYear(y: number | string | null | undefined): string {
  if (y == null) return "—"
  const n = Number(y)
  if (isNaN(n)) return String(y)
  if (n < 0) return `${Math.abs(n)} BC`
  return String(n)
}

const sections = computed((): Section[] => {
  const el = props.element

  return [
    {
      title: "Overview",
      rows: [
        row("Latin Name", el.latinName ?? "—"),
        row("CAS Number", el.casNumber ?? "—"),
        row("Appearance", el.appearance ?? "—"),
        row("Colour", el.colour ?? "—"),
        row("Year Discovered", formatYear(el.yearDiscovered)),
        row("Discoverer", el.discoverer ?? "—"),
        row("Named By", el.namedBy ?? "—"),
      ],
    },
    {
      title: "Properties",
      rows: [
        row("Atomic Number", String(el.atomicNumber)),
        row("Atomic Mass", fmt(el.atomicMass), "u"),
        row("Density", fmt(el.density), "g/cm³"),
        tempRow("Melting Point", el.meltingPoint),
        tempRow("Boiling Point", el.boilingPoint),
        row("Period", String(el.period)),
        row("Group", el.group != null ? String(el.group) : "—"),
        row("Block", el.block),
        row("Phase", el.phase),
      ],
    },
    {
      title: "Atomic Properties",
      rows: [
        row("Electronegativity", fmt(el.electronegativity), "Pauling"),
        row("Ionization Energy", fmt(el.ionizationEnergy), "kJ/mol"),
        row("Electron Affinity", fmt(el.electronAffinity), "kJ/mol"),
        row("Atomic Radius", fmt(el.atomicRadius), "pm"),
        row("Van der Waals Radius", fmt(el.vanDerWaalsRadius), "pm"),
        row("Valence Electrons", el.valenceElectrons != null ? String(el.valenceElectrons) : "—"),
        row("Oxidation States", el.oxidationStates ?? "—"),
        row("Electron Config", el.electronConfigurationSemantic ?? el.electronConfiguration),
      ],
    },
    {
      title: "Thermodynamic",
      rows: [
        row("Molar Heat", fmt(el.molarHeat ?? null), "J/mol·K"),
        row("Thermal Conductivity", fmt(el.thermalConductivity), "W/(m·K)"),
      ],
    },
    {
      title: "Electromagnetic",
      rows: [
        row("Electrical Type", el.electricalType ?? "—"),
        row("Magnetic Type", el.magneticType ?? "—"),
      ],
    },
    {
      title: "Crystal",
      rows: [
        row("Crystal Structure", el.crystalStructure ?? "—"),
        row("Mohs Hardness", el.mohsHardness != null ? String(el.mohsHardness) : "—"),
      ],
    },
  ].map((s) => ({
    ...s,
    // Drop sections where every value is "—" to keep the panel lean
    rows: s.rows,
  }))
})
</script>

<template>
  <div class="properties-root" aria-label="Element properties">
    <section
      v-for="section in sections"
      :key="section.title"
      class="properties-section"
    >
      <h3 class="section-title">{{ section.title }}</h3>
      <dl class="datasheet">
        <div
          v-for="row in section.rows"
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
  </div>
</template>

<style scoped>
.properties-root {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.datasheet {
  display: flex;
  flex-direction: column;
}

.datasheet-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
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
