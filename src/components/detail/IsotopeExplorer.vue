<script setup lang="ts">
import { computed } from "vue"
import type { Element } from "@/types/element"
import { formatAbundancePercent, formatDecayMode, isStableHalfLife } from "@/utils/isotopeDisplay"

const props = defineProps<{
  element: Element
}>()

const rows = computed(() => {
  const list = props.element.isotopes
  if (!Array.isArray(list)) return []
  return [...list].sort((a, b) => a.massNumber - b.massNumber)
})

const halfLifeVariant = (halfLife: string): "stable" | "warn" | "hot" => {
  if (isStableHalfLife(halfLife)) return "stable"
  const h = halfLife.toLowerCase()
  if (h.includes("ms") || h.includes("ns") || h.includes("μs")) return "hot"
  return "warn"
}
</script>

<template>
  <div class="isotope-explorer">
    <p v-if="rows.length === 0" class="isotope-empty">
      No isotope data available for this element yet.
    </p>
    <div v-else class="isotope-table-wrap">
      <table class="isotope-table" aria-label="Isotopes for this element">
        <thead>
          <tr>
            <th scope="col">Mass #</th>
            <th scope="col">Symbol</th>
            <th scope="col">Natural abundance</th>
            <th scope="col">Half-life</th>
            <th scope="col">Decay</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="`${row.symbol}-${row.massNumber}`">
            <td>{{ row.massNumber }}</td>
            <td class="mono">{{ row.symbol }}</td>
            <td>{{ formatAbundancePercent(row.abundance) }}</td>
            <td>
              <span
                class="half-life-pill"
                :class="`half-life-pill--${halfLifeVariant(row.halfLife)}`"
              >
                {{ isStableHalfLife(row.halfLife) ? "Stable" : row.halfLife }}
              </span>
            </td>
            <td class="mono decay-cell">{{ formatDecayMode(row.decayMode) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.isotope-explorer {
  padding: 0;
}

.isotope-empty {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
}

.isotope-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--bg-border);
  border-radius: 2px;
}

.isotope-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-xs);
}

.isotope-table th,
.isotope-table td {
  padding: 0.5rem 0.65rem;
  text-align: left;
  border-bottom: 1px solid var(--bg-border);
}

.isotope-table th {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: var(--bg-elevated);
}

.isotope-table tbody tr:last-child td {
  border-bottom: none;
}

.mono {
  font-family: var(--font-mono);
}

.half-life-pill {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  border: 1px solid transparent;
}

.half-life-pill--stable {
  color: color-mix(in srgb, #22c55e 90%, var(--text-primary));
  border-color: color-mix(in srgb, #22c55e 40%, var(--bg-border));
  background: color-mix(in srgb, #22c55e 12%, transparent);
}

.half-life-pill--warn {
  color: color-mix(in srgb, #f59e0b 95%, var(--text-primary));
  border-color: color-mix(in srgb, #f59e0b 45%, var(--bg-border));
  background: color-mix(in srgb, #f59e0b 10%, transparent);
}

.half-life-pill--hot {
  color: color-mix(in srgb, #ef4444 95%, var(--text-primary));
  border-color: color-mix(in srgb, #ef4444 45%, var(--bg-border));
  background: color-mix(in srgb, #ef4444 10%, transparent);
}

.decay-cell {
  white-space: nowrap;
}
</style>
