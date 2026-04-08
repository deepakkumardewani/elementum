<script setup lang="ts">
import { computed } from "vue"
import { formatProperty } from "@/utils/elementUtils"
import type { Element } from "@/types/element"

const props = defineProps<{ element: Element }>()

interface PropertyCard {
  label: string
  value: string
  unit?: string
}

const cards = computed((): PropertyCard[] => {
  const el = props.element
  return [
    {
      label: "Electronegativity",
      value: formatProperty(el.electronegativity, ""),
      unit: "Pauling",
    },
    {
      label: "Ionization Energy",
      value: formatProperty(el.ionizationEnergy, ""),
      unit: "kJ/mol",
    },
    {
      label: "Electron Affinity",
      value: formatProperty(el.electronAffinity, ""),
      unit: "kJ/mol",
    },
    {
      label: "Atomic Radius",
      value: formatProperty(el.atomicRadius, ""),
      unit: "pm",
    },
    {
      label: "Density",
      value: formatProperty(el.density, ""),
      unit: "g/cm³",
    },
    {
      label: "Melting Point",
      value: formatProperty(el.meltingPoint, ""),
      unit: "K",
    },
    {
      label: "Boiling Point",
      value: formatProperty(el.boilingPoint, ""),
      unit: "K",
    },
    {
      label: "Oxidation States",
      value: el.oxidationStates ?? "—",
    },
    {
      label: "Period / Group",
      value: `${el.period} / ${el.group ?? "—"}`,
    },
    {
      label: "Discoverer",
      value: el.discoverer ?? "—",
    },
    {
      label: "Year Discovered",
      value: el.yearDiscovered != null ? String(el.yearDiscovered) : "—",
    },
    {
      label: "Atomic Mass",
      value: formatProperty(el.atomicMass, ""),
      unit: "u",
    },
  ]
})
</script>

<template>
  <div class="properties-section">
    <h3 class="properties-title">Properties</h3>
    <dl class="properties-grid">
      <div
        v-for="card in cards"
        :key="card.label"
        class="property-card"
      >
        <dt class="property-label">{{ card.label }}</dt>
        <dd class="property-value">
          <span class="property-number">{{ card.value }}</span>
          <span v-if="card.unit && card.value !== '—'" class="property-unit">
            {{ card.unit }}
          </span>
        </dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.properties-title {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
}

@media (max-width: 480px) {
  .properties-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.property-card {
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.property-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1.2;
}

.property-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin: 0;
}

.property-number {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.property-unit {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-weight: 400;
}
</style>
