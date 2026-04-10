<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import { useUiStore } from "@/stores/uiStore"
import { getTrendSeries, TREND_PROPERTY_META } from "@/utils/trendData"

// Lazy-load ApexCharts — it's a large library and must not land in the initial bundle.
const VueApexCharts = defineAsyncComponent(() => import("vue3-apexcharts"))

// ApexCharts config values cannot resolve CSS variables — keep these in sync with style.css.
const TOKEN = {
  textSecondary: "#94a3b8",
  bgBorder: "#1f2d45",
} as const

const elementStore = useElementStore()
const uiStore = useUiStore()

const { elements } = storeToRefs(elementStore)
const { activeTrendProperty } = storeToRefs(uiStore)

// ── Derived series data ────────────────────────────────────────────────────
const trendData = computed(() =>
  getTrendSeries(activeTrendProperty.value, elements.value),
)

// ── Chart series ───────────────────────────────────────────────────────────
const series = computed(() => [
  {
    name: TREND_PROPERTY_META[activeTrendProperty.value].label,
    data: trendData.value.map((point) => ({
      x: point.symbol,
      y: point.value,
      // Store metadata in goals/extra — accessed in custom tooltip
      goals: [],
    })),
  },
])

// ── Chart options ──────────────────────────────────────────────────────────
const chartOptions = computed(() => {
  const meta = TREND_PROPERTY_META[activeTrendProperty.value]
  const colors = trendData.value.map((point) => point.color)
  const names = trendData.value.map((point) => point.name)
  const values = trendData.value.map((point) => point.value)

  return {
    chart: {
      type: "bar" as const,
      background: "transparent",
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 600,
        animateGradually: {
          enabled: true,
          delay: 0,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 400,
        },
      },
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
    plotOptions: {
      bar: {
        // distributed: true enables individual bar coloring from the colors array
        distributed: true,
        columnWidth: "80%",
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    colors,
    xaxis: {
      categories: trendData.value.map((p) => p.symbol),
      labels: {
        style: {
          colors: TOKEN.textSecondary,
          fontSize: "9px",
        },
        rotate: -60,
        rotateAlways: true,
        hideOverlappingLabels: false,
        maxHeight: 60,
      },
      axisBorder: {
        color: TOKEN.bgBorder,
      },
      axisTicks: {
        color: TOKEN.bgBorder,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      title: {
        text: meta.unit || undefined,
        style: {
          color: TOKEN.textSecondary,
          fontSize: "12px",
          fontWeight: 400,
        },
      },
      labels: {
        style: {
          colors: TOKEN.textSecondary,
          fontSize: "11px",
        },
        formatter: (val: number) => {
          if (val === null || val === undefined) return "—"
          // Keep numbers readable: round to 2 decimal places max
          return val % 1 === 0 ? String(val) : val.toFixed(2)
        },
      },
    },
    grid: {
      borderColor: TOKEN.bgBorder,
      strokeDashArray: 3,
      xaxis: {
        lines: { show: false },
      },
      yaxis: {
        lines: { show: true },
      },
    },
    tooltip: {
      theme: "dark",
      custom: ({
        dataPointIndex,
      }: {
        seriesIndex: number
        dataPointIndex: number
      }) => {
        const name = names[dataPointIndex] ?? "—"
        const symbol = trendData.value[dataPointIndex]?.symbol ?? "—"
        const raw = values[dataPointIndex]
        const formatted =
          raw === null || raw === undefined
            ? "—"
            : `${raw.toFixed(2)}${meta.unit ? ` ${meta.unit}` : ""}`
        const color = colors[dataPointIndex] ?? TOKEN.textSecondary

        return `
          <div style="
            background: var(--bg-surface);
            border: 1px solid var(--bg-border);
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 13px;
            color: var(--text-primary);
            line-height: 1.6;
          ">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="
                width:10px;height:10px;border-radius:50%;
                background:${color};flex-shrink:0;
              "></span>
              <strong style="font-size:14px">${symbol}</strong>
              <span style="color:var(--text-secondary)">${name}</span>
            </div>
            <div style="color:var(--text-secondary);font-size:11px;">${meta.label}</div>
            <div style="font-size:16px;font-weight:600;color:var(--text-primary);">${formatted}</div>
          </div>
        `
      },
    },
    states: {
      hover: {
        filter: { type: "lighten", value: 0.2 },
      },
    },
  }
})
</script>

<template>
  <div
    class="chart-container"
    :aria-label="`${TREND_PROPERTY_META[activeTrendProperty].label} trend chart`"
    aria-busy="false"
    role="img"
  >
    <Suspense>
      <VueApexCharts
        :key="activeTrendProperty"
        type="bar"
        height="100%"
        width="100%"
        :series="series"
        :options="chartOptions"
      />
      <template #fallback>
        <div class="chart-loading">
          <span aria-busy="true">Loading chart…</span>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 360px;
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 360px;
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
