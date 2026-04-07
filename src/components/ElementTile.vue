<script setup lang="ts">
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import type { Element } from "@/types/element"
import { categoryColor } from "@/utils/elementUtils"

const props = defineProps<{ element: Element }>()
const emit = defineEmits<{ click: [element: Element] }>()

const elementStore = useElementStore()
const { hasActiveFilter, highlightedElements } = storeToRefs(elementStore)

// Derived highlight/dim state — used in v-memo key to control re-render
const isHighlighted = computed(
  () => !hasActiveFilter.value || highlightedElements.value.has(props.element.atomicNumber),
)
const isDimmed = computed(
  () => hasActiveFilter.value && !highlightedElements.value.has(props.element.atomicNumber),
)

const color = computed(() => categoryColor(props.element.category))

function handleClick() {
  elementStore.selectElement(props.element)
  emit("click", props.element)
}
</script>

<template>
  <button
    v-memo="[element.atomicNumber, isHighlighted, isDimmed]"
    class="element-tile"
    :class="{ 'is-dimmed': isDimmed }"
    :style="{ '--category-color': color }"
    :data-atomic-number="element.atomicNumber"
    :aria-label="`${element.name}, atomic number ${element.atomicNumber}, ${element.category}`"
    @click="handleClick"
  >
    <span class="tile-number">{{ element.atomicNumber }}</span>
    <span class="tile-symbol">{{ element.symbol }}</span>
    <span class="tile-name">{{ element.name }}</span>
    <span class="tile-mass">{{ element.atomicMass.toFixed(2) }}</span>
  </button>
</template>

<style scoped>
.element-tile {
  position: relative;
  display: grid;
  /* 4 rows: atomic number | symbol | name | mass
     Giving mass its own row prevents it from cramping the name on a shared baseline */
  grid-template-rows: auto 1fr auto auto;
  grid-template-columns: 1fr;
  width: 100%;
  aspect-ratio: 1;
  /* Uniform padding — 4px all sides is the tightest readable padding at tile scale */
  padding: 4px;
  background-color: var(--bg-surface);
  border: 1px solid var(--bg-border);
  /* 3px left accent is bolder and reads as identity, not decoration */
  border-left: 3px solid var(--category-color);
  border-radius: 2px;
  cursor: pointer;
  text-align: left;
  color: var(--text-primary);
  overflow: hidden;
  font-family: inherit;
  /* CSS transitions for hover — not GSAP, per AGENT_INSTRUCTIONS */
  transition:
    transform 150ms cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 150ms cubic-bezier(0.25, 1, 0.5, 1),
    opacity 200ms ease,
    border-color 150ms ease;
}

.element-tile:hover {
  transform: scale(1.05);
  box-shadow: 0 0 12px 2px var(--category-color);
  border-color: var(--category-color);
  z-index: 10;
  background-color: var(--bg-elevated);
}

.element-tile:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
  z-index: 10;
}

.element-tile.is-dimmed {
  opacity: 0.15;
  pointer-events: none;
}

/* ── Inner layout ───────────────────────────────────────────── */

.tile-number {
  grid-column: 1;
  grid-row: 1;
  /* Bumped from 0.5rem — more readable without disturbing the hierarchy */
  font-size: 0.55rem;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1;
}

.tile-symbol {
  grid-column: 1;
  grid-row: 2;
  font-size: clamp(0.75rem, 1.1vw, 1.15rem);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  align-self: center;
  text-align: center;
}

.tile-name {
  grid-column: 1;
  grid-row: 3;
  /* Bumped from 0.4rem — 0.45rem is the minimum for readability */
  font-size: 0.45rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  align-self: end;
}

.tile-mass {
  grid-column: 1;
  grid-row: 4;
  /* Own row: no longer competing with the name for horizontal space */
  font-size: 0.43rem;
  color: var(--text-muted);
  line-height: 1.2;
  align-self: end;
  white-space: nowrap;
}
</style>
