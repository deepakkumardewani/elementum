<script setup lang="ts">
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useUiStore } from "@/stores/uiStore"
import {
  formatTrendLegendValue,
  getTrendRange,
  gradientEndpoints,
  TREND_PROPERTY_LABELS,
} from "@/composables/usePropertyColor"
import type { TrendProperty } from "@/types/element"

const uiStore = useUiStore()
const { colorMode } = storeToRefs(uiStore)

type TrendLegendView = {
  propertyLabel: string
  minLabel: string
  maxLabel: string
  ariaLabel: string
  trackStyle: { background: string }
}

const trendLegend = computed((): TrendLegendView | null => {
  if (colorMode.value === "category") {
    return null
  }
  const mode = colorMode.value as TrendProperty
  const { min, max } = getTrendRange(mode)
  const minLabel = formatTrendLegendValue(mode, min)
  const maxLabel = formatTrendLegendValue(mode, max)
  const propertyLabel = TREND_PROPERTY_LABELS[mode]
  const [a, b] = gradientEndpoints()
  return {
    propertyLabel,
    minLabel,
    maxLabel,
    ariaLabel: `${propertyLabel} scale from ${minLabel} to ${maxLabel}`,
    trackStyle: { background: `linear-gradient(90deg, ${a}, ${b})` },
  }
})
</script>

<template>
  <div
    v-if="trendLegend"
    class="color-legend"
    role="img"
    :aria-label="trendLegend.ariaLabel"
  >
    <span class="legend-title">{{ trendLegend.propertyLabel }}</span>
    <div class="legend-track-wrap">
      <span class="legend-end legend-end--min">{{ trendLegend.minLabel }}</span>
      <div class="legend-track" :style="trendLegend.trackStyle" />
      <span class="legend-end legend-end--max">{{ trendLegend.maxLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.color-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background-color: var(--bg-surface);
  border: 1px solid var(--bg-border);
  border-radius: 4px;
}

.legend-title {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.legend-track-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.legend-end {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--text-secondary);
  flex-shrink: 0;
  max-width: 28%;
  line-height: 1.2;
}

.legend-end--min {
  text-align: right;
}

.legend-end--max {
  text-align: left;
}

.legend-track {
  flex: 1;
  height: 10px;
  border-radius: 2px;
  border: 1px solid var(--bg-border);
  min-width: 80px;
}
</style>
