<script setup lang="ts">
import { computed } from "vue"
import { categoryColor } from "@/utils/elementUtils"
import type { Element } from "@/types/element"

const props = defineProps<{
  elements: Element[]
  selectedNumber: number | null
  otherNumber: number | null
  dimmedNumbers: Set<number> | null
}>()

const emit = defineEmits<{ select: [element: Element] }>()

const mainElements = computed(() => props.elements.filter((el) => el.ypos <= 7))
const fBlockElements = computed(() => props.elements.filter((el) => el.ypos >= 9))

const PLACEHOLDERS = [
  { xpos: 3, ypos: 6, label: "57–71" },
  { xpos: 3, ypos: 7, label: "89–103" },
] as const

function isSelected(el: Element): boolean {
  return props.selectedNumber === el.atomicNumber
}

function isOther(el: Element): boolean {
  return props.otherNumber === el.atomicNumber
}

function isDimmed(el: Element): boolean {
  return props.dimmedNumbers !== null && !props.dimmedNumbers.has(el.atomicNumber)
}

function handleClick(el: Element) {
  if (!isOther(el)) emit("select", el)
}
</script>

<template>
  <div class="mini-grid-wrapper" role="group" aria-label="Element picker grid">
    <!-- Main table: periods 1–7 -->
    <div class="mini-grid main-grid">
      <button
        v-for="el in mainElements"
        :key="el.atomicNumber"
        class="mini-tile"
        :class="{
          'is-selected': isSelected(el),
          'is-other': isOther(el),
          'is-dimmed': isDimmed(el),
        }"
        :style="{ '--cat-color': categoryColor(el.category), gridColumn: el.xpos, gridRow: el.ypos }"
        :aria-label="`${el.name}, atomic number ${el.atomicNumber}`"
        :aria-pressed="isSelected(el)"
        :disabled="isOther(el)"
        @click="handleClick(el)"
      >
        {{ el.symbol }}
      </button>

      <!-- Lanthanide/actinide gap placeholders -->
      <div
        v-for="ph in PLACEHOLDERS"
        :key="ph.label"
        class="mini-placeholder"
        :style="{ gridColumn: ph.xpos, gridRow: ph.ypos }"
        aria-hidden="true"
      >
        {{ ph.label }}
      </div>
    </div>

    <!-- f-block separator -->
    <div class="fblock-sep" aria-hidden="true">
      <span class="sep-line" /><span class="sep-label">f-block</span><span class="sep-line" />
    </div>

    <!-- F-block rows: lanthanides + actinides -->
    <div class="mini-grid fblock-grid">
      <button
        v-for="el in fBlockElements"
        :key="el.atomicNumber"
        class="mini-tile"
        :class="{
          'is-selected': isSelected(el),
          'is-other': isOther(el),
          'is-dimmed': isDimmed(el),
        }"
        :style="{
          '--cat-color': categoryColor(el.category),
          gridColumn: el.xpos,
          gridRow: el.ypos - 8,
        }"
        :aria-label="`${el.name}, atomic number ${el.atomicNumber}`"
        :aria-pressed="isSelected(el)"
        :disabled="isOther(el)"
        @click="handleClick(el)"
      >
        {{ el.symbol }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.mini-grid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-grid {
  display: grid;
  gap: 2px;
}

.main-grid {
  grid-template-columns: repeat(18, 1fr);
  grid-template-rows: repeat(7, 1fr);
}

.fblock-grid {
  grid-template-columns: repeat(18, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.mini-tile {
  aspect-ratio: 1;
  background: var(--bg-surface);
  border: 1px solid var(--bg-border);
  border-left: 2px solid var(--cat-color);
  border-radius: 1px;
  font-size: clamp(0.28rem, 0.52vw, 0.52rem);
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  transition:
    transform 150ms cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 150ms cubic-bezier(0.25, 1, 0.5, 1),
    opacity 200ms ease,
    background-color 150ms ease;
  line-height: 1;
}

.mini-tile:hover:not(:disabled) {
  transform: scale(1.2);
  box-shadow: 0 0 6px 1px var(--cat-color);
  background: var(--bg-elevated);
  color: var(--text-primary);
  position: relative;
  z-index: 10;
}

.mini-tile:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 1px;
  position: relative;
  z-index: 10;
}

.mini-tile.is-selected {
  background: color-mix(in srgb, var(--cat-color) 22%, var(--bg-elevated));
  border-color: var(--cat-color);
  color: var(--cat-color);
  box-shadow: 0 0 6px 1px var(--cat-color);
}

.mini-tile.is-other {
  opacity: 0.25;
  cursor: not-allowed;
}

.mini-tile.is-dimmed {
  opacity: 0.1;
}

.mini-placeholder {
  aspect-ratio: 1;
  background: color-mix(in srgb, var(--bg-surface) 50%, transparent);
  border: 1px dashed var(--bg-border);
  border-radius: 1px;
  font-size: clamp(0.22rem, 0.4vw, 0.4rem);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.fblock-sep {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sep-line {
  flex: 1;
  height: 1px;
  background: var(--bg-border);
}

.sep-label {
  font-size: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
