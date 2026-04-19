<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useUiStore } from "@/stores/uiStore";
import {
  formatTrendLegendValue,
  getTrendRange,
  gradientEndpoints,
  TREND_PROPERTY_LABELS,
} from "@/composables/usePropertyColor";
import type { TrendProperty } from "@/types/element";

const uiStore = useUiStore();
const { colorMode } = storeToRefs(uiStore);

const trendMode = computed(() => (colorMode.value === "category" ? null : (colorMode.value as TrendProperty)));

const label = computed(() => (trendMode.value ? TREND_PROPERTY_LABELS[trendMode.value] : ""));

const minMax = computed(() => {
  if (!trendMode.value) return null;
  return getTrendRange(trendMode.value);
});

const minLabel = computed(() =>
  minMax.value ? formatTrendLegendValue(trendMode.value as TrendProperty, minMax.value.min) : "",
);

const maxLabel = computed(() =>
  minMax.value ? formatTrendLegendValue(trendMode.value as TrendProperty, minMax.value.max) : "",
);

const gradientStyle = computed(() => {
  const [a, b] = gradientEndpoints();
  return { background: `linear-gradient(90deg, ${a}, ${b})` };
});
</script>

<template>
  <div v-if="trendMode" class="color-legend" role="img" :aria-label="`${label} scale from ${minLabel} to ${maxLabel}`">
    <span class="legend-title">{{ label }}</span>
    <div class="legend-track-wrap">
      <span class="legend-end legend-end--min">{{ minLabel }}</span>
      <div class="legend-track" :style="gradientStyle" />
      <span class="legend-end legend-end--max">{{ maxLabel }}</span>
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
