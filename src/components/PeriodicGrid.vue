<script setup lang="ts">
import { computed, ref } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import ElementTile from "@/components/ElementTile.vue"
import BookmarkButton from "@/components/BookmarkButton.vue"
import { useKeyboardNav } from "@/composables/useKeyboardNav"
import { Z } from "@/constants/zIndex"

/** Above `.element-tile` hover/selected z-index (`Z.elevated`) so the star stays clickable */
const bookmarkOverlayZ = Z.elevated + 1

const elementStore = useElementStore()
const { elements } = storeToRefs(elementStore)

const gridRoot = ref<HTMLElement | null>(null)
const { focusedAtomicNumber } = useKeyboardNav(gridRoot)

function syncFocus(atomicNumber: number) {
  focusedAtomicNumber.value = atomicNumber
}

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
  <div
    id="periodic-grid"
    ref="gridRoot"
    class="periodic-grid-wrapper"
    role="region"
    aria-label="Periodic table of elements"
  >
    <!-- ── Main table (periods 1–7) ──────────────────────────────── -->
    <div class="main-grid" aria-label="Main periodic table">
      <div
        v-for="el in mainElements"
        :key="el.atomicNumber"
        class="element-slot"
        :style="gridStyle(el.xpos, el.ypos)"
      >
        <ElementTile
          :element="el"
          :tile-tabindex="focusedAtomicNumber === el.atomicNumber ? 0 : -1"
          @focus-tile="syncFocus(el.atomicNumber)"
        />
        <BookmarkButton class="slot-bookmark" compact :atomic-number="el.atomicNumber" />
      </div>

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
      <div
        v-for="el in fBlockElements"
        :key="el.atomicNumber"
        class="element-slot"
        :style="fBlockStyle(el.xpos, el.ypos)"
      >
        <ElementTile
          :element="el"
          :tile-tabindex="focusedAtomicNumber === el.atomicNumber ? 0 : -1"
          @focus-tile="syncFocus(el.atomicNumber)"
        />
        <BookmarkButton class="slot-bookmark" compact :atomic-number="el.atomicNumber" />
      </div>
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

.element-slot {
  position: relative;
  min-width: 0;
}

.slot-bookmark {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: v-bind("bookmarkOverlayZ");
  opacity: 0;
  /* Invisible control must not steal clicks from the tile */
  pointer-events: none;
  transition: opacity 150ms ease;
}

.element-slot:hover .slot-bookmark,
.element-slot:focus-within .slot-bookmark,
.element-slot:has(.bookmark-btn.is-filled) .slot-bookmark {
  opacity: 1;
  pointer-events: auto;
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
