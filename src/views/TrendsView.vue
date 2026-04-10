<script setup lang="ts">
import { defineAsyncComponent } from "vue"
import { storeToRefs } from "pinia"
import { useUiStore } from "@/stores/uiStore"
import { TREND_PROPERTY_META } from "@/utils/trendData"
import TrendPropertySelector from "@/components/trends/TrendPropertySelector.vue"

// Lazy-load TrendChart — ApexCharts is large and must not land in the initial bundle.
const TrendChart = defineAsyncComponent(
  () => import("@/components/trends/TrendChart.vue"),
)

const uiStore = useUiStore()
const { activeTrendProperty } = storeToRefs(uiStore)
</script>

<template>
  <main class="trends-view">
    <!-- Page header -->
    <header class="trends-header">
      <span class="trends-eyebrow">// TREND ANALYSIS</span>
      <h1 class="trends-title">Periodic Trends</h1>
      <p class="trends-subtitle">
        Explore how element properties vary across all 118 elements.
      </p>
    </header>

    <!-- Property selector -->
    <TrendPropertySelector />

    <!-- Property description -->
    <p class="property-description">
      {{ TREND_PROPERTY_META[activeTrendProperty].description }}
    </p>

    <!-- Chart panel -->
    <section class="chart-panel">
      <!-- Data terminal header bar -->
      <div class="chart-panel-header">
        <span class="chart-panel-label">
          {{ TREND_PROPERTY_META[activeTrendProperty].label }}
        </span>
        <span
          v-if="TREND_PROPERTY_META[activeTrendProperty].unit"
          class="chart-panel-unit"
        >
          {{ TREND_PROPERTY_META[activeTrendProperty].unit }}
        </span>
      </div>

      <!-- Chart body -->
      <div class="chart-body">
        <Suspense>
          <TrendChart />
          <template #fallback>
            <div class="chart-fallback" aria-busy="true">
              Loading chart data…
            </div>
          </template>
        </Suspense>
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
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;

  /* Intentional rhythm — not uniform gap everywhere */
  gap: 0;
}

/* ── Header ─────────────────────────────────────────────────── */
.trends-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 2rem;
}

.trends-eyebrow {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--accent-cyan);
  text-transform: uppercase;
  font-family: ui-monospace, "Cascadia Code", monospace;
  opacity: 0.8;
}

.trends-title {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.trends-subtitle {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

/* ── Selector — tight below header ──────────────────────────── */
/* TrendPropertySelector sits here with its own internal spacing */

/* ── Description — close below selector ─────────────────────── */
.property-description {
  margin-top: 0.625rem;
  margin-bottom: 1.75rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.65;
  max-width: 76ch;
  border-left: 2px solid var(--accent-cyan);
  padding-left: 0.875rem;
  opacity: 0.85;
}

/* ── Chart panel ─────────────────────────────────────────────── */
.chart-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface);
  border: 1px solid var(--bg-border);
  border-radius: 0.5rem;
  overflow: hidden;
  /* Minimum height prevents layout collapse before chart loads */
  min-height: 420px;
}

/* Terminal-style data header */
.chart-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.25rem;
  border-bottom: 1px solid var(--bg-border);
  background-color: color-mix(in srgb, var(--bg-elevated) 60%, transparent);
}

.chart-panel-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--accent-cyan);
  text-transform: uppercase;
  font-family: ui-monospace, "Cascadia Code", monospace;
}

.chart-panel-unit {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-family: ui-monospace, "Cascadia Code", monospace;
  letter-spacing: 0.05em;
}

/* Chart content area */
.chart-body {
  flex: 1;
  padding: 1rem 0.5rem 0.5rem;
  display: flex;
  flex-direction: column;
}

.chart-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text-muted);
  font-size: 0.8125rem;
}
</style>
