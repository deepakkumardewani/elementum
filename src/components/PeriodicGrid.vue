<script setup lang="ts">
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import ElementTile from "@/components/ElementTile.vue"

const elementStore = useElementStore()
const { elements } = storeToRefs(elementStore)

// Main-table elements: rows 1–7 only
const mainElements = computed(() => elements.value.filter((el) => el.ypos <= 7))

// F-block rows: lanthanides (ypos=9) and actinides (ypos=10)
const fBlockElements = computed(() => elements.value.filter((el) => el.ypos >= 9))

// Placeholder descriptors for the lanthanide/actinide gap in the main table
const PLACEHOLDERS = [
  { xpos: 3, ypos: 6, label: "57–71", sublabel: "Lanthanides" },
  { xpos: 3, ypos: 7, label: "89–103", sublabel: "Actinides" },
] as const

function gridStyle(xpos: number, ypos: number) {
  return { gridColumn: xpos, gridRow: ypos }
}

// F-block rows are offset: ypos 9→1, 10→2 within their own sub-grid
function fBlockStyle(xpos: number, ypos: number) {
  return { gridColumn: xpos, gridRow: ypos - 8 }
}
</script>

<template>
  <div id="periodic-grid" class="periodic-grid-wrapper" role="region" aria-label="Periodic table of elements">
    <!-- ── Main table (periods 1–7) ──────────────────────────────── -->
    <div class="main-grid" aria-label="Main periodic table">
      <!-- Real element tiles -->
      <ElementTile
        v-for="el in mainElements"
        :key="el.atomicNumber"
        :element="el"
        :style="gridStyle(el.xpos, el.ypos)"
      />

      <!-- Placeholder cells for lanthanide/actinide gap -->
      <div
        v-for="ph in PLACEHOLDERS"
        :key="ph.label"
        class="placeholder-tile"
        :style="gridStyle(ph.xpos, ph.ypos)"
        aria-hidden="true"
      >
        <span class="ph-label">{{ ph.label }}</span>
        <span class="ph-sublabel">{{ ph.sublabel }}</span>
      </div>
    </div>

    <!-- ── Separator ─────────────────────────────────────────────── -->
    <div class="fblock-separator" aria-hidden="true">
      <span class="sep-line" />
      <span class="sep-label">f-block</span>
      <span class="sep-line" />
    </div>

    <!-- ── F-block rows (lanthanides + actinides) ────────────────── -->
    <div class="fblock-grid" aria-label="Lanthanide and actinide elements">
      <ElementTile
        v-for="el in fBlockElements"
        :key="el.atomicNumber"
        :element="el"
        :style="fBlockStyle(el.xpos, el.ypos)"
      />
    </div>
  </div>
</template>

<style scoped>
.periodic-grid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

/* ── Main grid: 18 columns × 7 rows ───────────────────────────── */
.main-grid {
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 3px;
}

/* ── F-block grid: 18 columns × 2 rows, offset to col 3 ────────── */
/* The f-block elements sit at xpos 3–17, so cols 1–2 and 18 are empty */
.fblock-grid {
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 3px;
  /* Indent to align with col 3 of the main grid */
  padding-left: 0;
}

/* ── Separator ─────────────────────────────────────────────────── */
.fblock-separator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 2px;
}

.sep-line {
  flex: 1;
  height: 1px;
  background: var(--bg-border);
}

.sep-label {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  white-space: nowrap;
}

/* ── Placeholder tile ──────────────────────────────────────────── */
.placeholder-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  background-color: color-mix(in srgb, var(--bg-surface) 60%, transparent);
  border: 1px dashed var(--bg-border);
  border-radius: 2px;
  gap: 2px;
}

.ph-label {
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--text-muted);
  line-height: 1;
}

.ph-sublabel {
  font-size: 0.38rem;
  color: var(--text-muted);
  line-height: 1;
  opacity: 0.7;
}
</style>
