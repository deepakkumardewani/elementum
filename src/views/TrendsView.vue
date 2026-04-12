<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useUiStore } from "@/stores/uiStore"
import { TREND_PROPERTY_META } from "@/utils/trendData"
import TrendPropertySelector from "@/components/trends/TrendPropertySelector.vue"
import PeriodicHeatmap from "@/components/trends/PeriodicHeatmap.vue"

const uiStore = useUiStore()
const { activeTrendProperty } = storeToRefs(uiStore)
</script>

<template>
  <main class="trends-view">
    <!-- Page header -->
    <header class="trends-header">
      <h1 class="trends-title">Periodic Trends</h1>
      <p class="trends-subtitle">
        {{ TREND_PROPERTY_META[activeTrendProperty].description }}
      </p>
    </header>

    <!-- Property selector + active property label -->
    <div class="selector-row">
      <TrendPropertySelector />
    </div>

    <!-- Heatmap panel -->
    <section class="heatmap-panel">
      <div class="panel-header">
        <span class="panel-label">{{ TREND_PROPERTY_META[activeTrendProperty].label }}</span>
        <span v-if="TREND_PROPERTY_META[activeTrendProperty].unit" class="panel-unit">
          {{ TREND_PROPERTY_META[activeTrendProperty].unit }}
        </span>
        <span class="panel-hint">hover for values</span>
      </div>
      <div class="panel-body">
        <PeriodicHeatmap />
      </div>
    </section>
  </main>
</template>

<style scoped>
.trends-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 2.5rem 3rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  gap: 1.5rem;
}

/* ── Header ──────────────────────────────────────────────────────── */
.trends-header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.trends-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.trends-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  max-width: 72ch;
  line-height: 1.6;
  border-left: 2px solid var(--bg-border);
  padding-left: 0.75rem;
}

/* ── Selector row ────────────────────────────────────────────────── */
.selector-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* ── Heatmap panel ───────────────────────────────────────────────── */
.heatmap-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface);
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  border-bottom: 1px solid var(--bg-border);
  flex-shrink: 0;
}

.panel-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent-cyan);
  text-transform: uppercase;
}

.panel-unit {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.panel-hint {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--text-muted);
  margin-left: auto;
  opacity: 0.6;
}

.panel-body {
  flex: 1;
  padding: 1.25rem;
  overflow: auto;
}
</style>
