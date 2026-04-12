<script setup lang="ts">
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import { useUiStore } from "@/stores/uiStore"
import { TREND_PROPERTY_META } from "@/utils/trendData"
import type { Element, TrendProperty } from "@/types/element"

const elementStore = useElementStore()
const uiStore = useUiStore()
const { elements } = storeToRefs(elementStore)
const { activeTrendProperty } = storeToRefs(uiStore)

// ── Main table elements (rows 1-7) vs f-block (rows 9-10) ─────────────────
const mainElements = computed(() => elements.value.filter((el) => el.ypos <= 7))
const fBlockElements = computed(() => elements.value.filter((el) => el.ypos >= 9))

const PLACEHOLDERS = [
  { xpos: 3, ypos: 6, label: "57–71", sublabel: "Lanthanides" },
  { xpos: 3, ypos: 7, label: "89–103", sublabel: "Actinides" },
] as const

// ── Value extraction and range ─────────────────────────────────────────────
function getValue(el: Element, prop: TrendProperty): number | null {
  const v = el[prop]
  return typeof v === "number" ? v : null
}

const range = computed(() => {
  const values = elements.value
    .map((el) => getValue(el, activeTrendProperty.value))
    .filter((v): v is number => v !== null)
  if (!values.length) return { min: 0, max: 1 }
  return { min: Math.min(...values), max: Math.max(...values) }
})

// ── Color interpolation ────────────────────────────────────────────────────
// Blue (low) → Teal (mid) → Amber (high). Readable in dark mode.
function valueToColor(value: number | null): string {
  if (value === null) return "transparent"
  const { min, max } = range.value
  if (max === min) return "hsl(210, 70%, 40%)"
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  // Hue: 215 (blue) → 30 (amber)
  const hue = 215 - t * 185
  // Saturation: 65% → 80%
  const sat = 65 + t * 15
  // Lightness: 38% → 52%
  const lum = 38 + t * 14
  return `hsl(${hue}, ${sat}%, ${lum}%)`
}

function formatValue(value: number | null): string {
  if (value === null) return "—"
  // Show up to 3 significant digits without trailing zeros
  if (Math.abs(value) >= 1000) return value.toFixed(0)
  if (Math.abs(value) >= 100) return value.toFixed(1)
  if (Math.abs(value) >= 10) return value.toFixed(2)
  return value.toFixed(3).replace(/\.?0+$/, "")
}

const meta = computed(() => TREND_PROPERTY_META[activeTrendProperty.value])

// Label on the color scale legend
const minLabel = computed(() => {
  const vs = elements.value
    .map((el) => getValue(el, activeTrendProperty.value))
    .filter((v): v is number => v !== null)
  return vs.length ? formatValue(Math.min(...vs)) : "—"
})

const maxLabel = computed(() => {
  const vs = elements.value
    .map((el) => getValue(el, activeTrendProperty.value))
    .filter((v): v is number => v !== null)
  return vs.length ? formatValue(Math.max(...vs)) : "—"
})

// ── Grid helpers ───────────────────────────────────────────────────────────
function gridStyle(xpos: number, ypos: number) {
  return { gridColumn: xpos, gridRow: ypos }
}

function fBlockStyle(xpos: number, ypos: number) {
  return { gridColumn: xpos, gridRow: ypos - 8 }
}

function cellStyle(el: Element) {
  const v = getValue(el, activeTrendProperty.value)
  const bg = valueToColor(v)
  // Colored cells (v !== null): always use white — HSL range 38–52% lightness
  // is dark enough for white text. Null cells have transparent background
  // which appears white in light mode, so they need a themed text color.
  const textColor = v !== null ? "#ffffff" : "var(--text-muted)"
  return {
    "--cell-bg": bg,
    "--cell-text": textColor,
    "--cell-alpha": v !== null ? "1" : "0.4",
  }
}
</script>

<template>
  <div class="heatmap-wrap">
    <!-- Color scale legend -->
    <div class="legend" aria-label="Color scale legend">
      <span class="legend-label legend-label--min">
        {{ minLabel }}<span v-if="meta.unit" class="legend-unit"> {{ meta.unit }}</span>
      </span>
      <div class="legend-bar" aria-hidden="true" />
      <span class="legend-label legend-label--max">
        {{ maxLabel }}<span v-if="meta.unit" class="legend-unit"> {{ meta.unit }}</span>
      </span>
    </div>

    <!-- Main periodic table grid -->
    <div class="main-grid" aria-label="Periodic heatmap — main table">
      <div
        v-for="el in mainElements"
        :key="el.atomicNumber"
        class="heat-cell"
        :style="[gridStyle(el.xpos, el.ypos), cellStyle(el)]"
        :title="`${el.name} (${el.symbol}): ${formatValue(getValue(el, activeTrendProperty))}${meta.unit ? ' ' + meta.unit : ''}`"
        :aria-label="`${el.name}: ${formatValue(getValue(el, activeTrendProperty))}${meta.unit ? ' ' + meta.unit : ''}`"
        role="img"
      >
        <span class="cell-symbol">{{ el.symbol }}</span>
        <span class="cell-value">{{ formatValue(getValue(el, activeTrendProperty)) }}</span>
      </div>

      <!-- Lanthanide/Actinide placeholders -->
      <div
        v-for="ph in PLACEHOLDERS"
        :key="ph.label"
        class="placeholder-cell"
        :style="gridStyle(ph.xpos, ph.ypos)"
        aria-hidden="true"
      >
        <span class="ph-label">{{ ph.label }}</span>
      </div>
    </div>

    <!-- f-block separator -->
    <div class="fblock-sep" aria-hidden="true">
      <span class="sep-line" />
      <span class="sep-label">f-block</span>
      <span class="sep-line" />
    </div>

    <!-- f-block grid -->
    <div class="fblock-grid" aria-label="Lanthanides and actinides">
      <div
        v-for="el in fBlockElements"
        :key="el.atomicNumber"
        class="heat-cell"
        :style="[fBlockStyle(el.xpos, el.ypos), cellStyle(el)]"
        :title="`${el.name} (${el.symbol}): ${formatValue(getValue(el, activeTrendProperty))}${meta.unit ? ' ' + meta.unit : ''}`"
        :aria-label="`${el.name}: ${formatValue(getValue(el, activeTrendProperty))}${meta.unit ? ' ' + meta.unit : ''}`"
        role="img"
      >
        <span class="cell-symbol">{{ el.symbol }}</span>
        <span class="cell-value">{{ formatValue(getValue(el, activeTrendProperty)) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper ───────────────────────────────────────────────────── */
.heatmap-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-x: auto;
}

/* ── Color legend ──────────────────────────────────────────────── */
.legend {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.25rem;
}

.legend-bar {
  flex: 1;
  height: 8px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    hsl(215, 65%, 38%),
    hsl(122, 72%, 44%),
    hsl(30, 80%, 52%)
  );
  max-width: 320px;
}

.legend-label {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.legend-unit {
  opacity: 0.7;
  font-weight: 400;
}

/* ── Shared grid config ────────────────────────────────────────── */
.main-grid,
.fblock-grid {
  display: grid;
  gap: 2px;
}

.main-grid {
  grid-template-columns: repeat(18, minmax(0, 1fr));
  grid-template-rows: repeat(7, auto);
  min-width: 680px;
}

.fblock-grid {
  grid-template-columns: repeat(15, minmax(0, 1fr));
  grid-template-rows: repeat(2, auto);
  /* Indent to align f-block under columns 3–17 */
  margin-left: calc((2 / 18) * 100%);
  min-width: calc(680px * 15 / 18);
}

/* ── Heat cell ─────────────────────────────────────────────────── */
.heat-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  background-color: var(--cell-bg);
  border-radius: 2px;
  cursor: default;
  opacity: var(--cell-alpha);
  transition: background-color 400ms ease, opacity 400ms ease;
  overflow: hidden;
  padding: 2px;
}

.heat-cell:hover {
  filter: brightness(1.2);
  z-index: 1;
  transform: scale(1.08);
  transition: transform 100ms ease, filter 100ms ease, background-color 400ms ease;
}

.cell-symbol {
  font-family: var(--font-mono);
  font-size: clamp(0.45rem, 0.85vw, 0.75rem);
  font-weight: 700;
  color: var(--cell-text, white);
  line-height: 1;
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
}

.cell-value {
  font-family: var(--font-mono);
  font-size: clamp(0.3rem, 0.55vw, 0.5rem);
  color: var(--cell-text, white);
  opacity: 0.8;
  line-height: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
  max-width: 100%;
}

/* ── Placeholder cells (lanthanide/actinide gaps) ──────────────── */
.placeholder-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--bg-border);
  border-radius: 2px;
  opacity: 0.4;
}

.ph-label {
  font-family: var(--font-mono);
  font-size: clamp(0.3rem, 0.5vw, 0.45rem);
  color: var(--text-muted);
  text-align: center;
}

/* ── f-block separator ─────────────────────────────────────────── */
.fblock-sep {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.25rem;
  opacity: 0.4;
}

.sep-line {
  flex: 1;
  height: 1px;
  background: var(--bg-border);
}

.sep-label {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--text-muted);
  white-space: nowrap;
  letter-spacing: 0.08em;
}
</style>
