<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useUiStore } from "@/stores/uiStore"
import { TREND_PROPERTY_META } from "@/utils/trendData"
import type { TrendProperty } from "@/types/element"

const PROPERTIES: TrendProperty[] = [
  "atomicRadius",
  "electronegativity",
  "ionizationEnergy",
  "electronAffinity",
  "density",
  "meltingPoint",
  "boilingPoint",
]

const uiStore = useUiStore()
const { activeTrendProperty } = storeToRefs(uiStore)

function select(prop: TrendProperty) {
  uiStore.setTrendProperty(prop)
}
</script>

<template>
  <div class="selector-wrapper" role="group" aria-label="Select trend property">
    <div class="selector-track">
      <button
        v-for="prop in PROPERTIES"
        :key="prop"
        type="button"
        class="selector-pill"
        :class="{ active: activeTrendProperty === prop }"
        :aria-pressed="activeTrendProperty === prop"
        @click="select(prop)"
      >
        {{ TREND_PROPERTY_META[prop].label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.selector-wrapper {
  width: 100%;
  overflow-x: auto;
  /* hide scrollbar but remain scrollable */
  scrollbar-width: none;
}
.selector-wrapper::-webkit-scrollbar {
  display: none;
}

.selector-track {
  display: flex;
  gap: 0.5rem;
  padding-bottom: 0.25rem;
  /* prevent wrapping — allow horizontal scroll on overflow */
  flex-wrap: nowrap;
  min-width: max-content;
}

.selector-pill {
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  border: 1px solid var(--bg-border);
  background-color: var(--bg-surface);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 150ms ease,
    border-color 150ms ease,
    background-color 150ms ease;
}

.selector-pill:hover {
  color: var(--text-primary);
  border-color: var(--accent-cyan);
}

.selector-pill:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.selector-pill.active {
  background-color: color-mix(in srgb, var(--accent-cyan) 15%, transparent);
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}
</style>
