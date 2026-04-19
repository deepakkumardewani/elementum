<script setup lang="ts">
import { computed, ref } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import { useUiStore } from "@/stores/uiStore"
import type { Element } from "@/types/element"
import { categoryColor } from "@/utils/elementUtils"
import { getPropertyColor } from "@/composables/usePropertyColor"
import { useTooltip } from "@/composables/useTooltip"
import { Z } from "@/constants/zIndex"

const props = withDefaults(
  defineProps<{
    element: Element
    /** Roving tabindex for keyboard grid navigation */
    tileTabindex?: number
  }>(),
  {
    tileTabindex: 0,
  },
)

const emit = defineEmits<{
  click: [element: Element]
  /** Roving focus sync when tile receives focus (click or programatic) */
  focusTile: []
}>()

const elementStore = useElementStore()
const uiStore = useUiStore()
const { hasActiveFilter, highlightedElements, selectedElement } = storeToRefs(elementStore)
const { colorMode } = storeToRefs(uiStore)

// Derived highlight/dim state — used in v-memo key to control re-render
const isHighlighted = computed(
  () => !hasActiveFilter.value || highlightedElements.value.has(props.element.atomicNumber),
)
const isDimmed = computed(
  () => hasActiveFilter.value && !highlightedElements.value.has(props.element.atomicNumber),
)
// Active selected state drives the pulse glow animation
const isSelected = computed(
  () => selectedElement.value?.atomicNumber === props.element.atomicNumber,
)

const isCategoryMode = computed(() => colorMode.value === "category")

const accentColor = computed(() =>
  isCategoryMode.value
    ? categoryColor(props.element.category)
    : getPropertyColor(props.element, colorMode.value),
)

const tileBackground = computed(() => {
  if (isCategoryMode.value) return undefined
  const hex = accentColor.value
  return `color-mix(in srgb, ${hex} 38%, var(--bg-surface))`
})

const { showTooltip, hideTooltip } = useTooltip()
const tileEl = ref<HTMLElement | null>(null)

function handleClick() {
  elementStore.selectElement(props.element)
  emit("click", props.element)
}

function onTileFocus() {
  emit("focusTile")
}

function handleMouseenter() {
  if (!tileEl.value) return
  showTooltip(props.element, tileEl.value.getBoundingClientRect())
}

function handleMouseleave() {
  hideTooltip()
}
</script>

<template>
   <button
    ref="tileEl"
    v-memo="[
      element.atomicNumber,
      isHighlighted,
      isDimmed,
      isSelected,
      colorMode,
      isCategoryMode ? element.category : accentColor,
      tileTabindex,
    ]"
    class="element-tile"
    :class="{
      'is-dimmed': isDimmed,
      'is-selected': isSelected,
      'is-trend-mode': !isCategoryMode,
    }"
    :style="{
      '--category-color': accentColor,
      ...(tileBackground ? { backgroundColor: tileBackground } : {}),
    }"
    :data-atomic-number="element.atomicNumber"
    :tabindex="tileTabindex"
    :aria-label="`${element.name}, atomic number ${element.atomicNumber}, ${element.category}`"
    @click="handleClick"
    @focus="onTileFocus"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
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
  box-shadow: 0 0 0 0 transparent;
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
    border-color 150ms ease,
    background-color 280ms ease;
}

.element-tile:hover {
  transform: scale(1.05);
  box-shadow: 0 0 12px 2px var(--category-color);
  border-color: var(--category-color);
  z-index: v-bind("Z.elevated");
  background-color: var(--bg-elevated);
}

/* Keyboard / focus-visible only — mouse clicks do not match :focus-visible, so no stuck ring after modal */
.element-tile:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
  box-shadow:
    0 0 0 2px var(--accent-cyan),
    0 0 14px 2px color-mix(in srgb, var(--accent-cyan) 35%, transparent);
  border-color: var(--accent-cyan);
  z-index: v-bind("Z.elevated");
}

.element-tile.is-dimmed {
  opacity: 0.15;
  pointer-events: none;
}

/* Pulse glow on the currently selected tile — keyframe defined in style.css */
.element-tile.is-selected {
  animation: pulseGlow 2s ease-in-out infinite;
  border-color: var(--category-color);
  z-index: v-bind("Z.elevated");
}

.element-tile.is-trend-mode:hover {
  background-color: color-mix(in srgb, var(--category-color) 48%, var(--bg-surface)) !important;
}

/* ── Inner layout ───────────────────────────────────────────── */

.tile-number {
  grid-column: 1;
  grid-row: 1;
  /* Bumped from 0.5rem — more readable without disturbing the hierarchy */
  font-size: var(--text-tile-number);
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1;
}

.tile-symbol {
  grid-column: 1;
  grid-row: 2;
  font-size: var(--text-tile-symbol);
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
  font-size: var(--text-tile-name);
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
  font-size: var(--text-tile-mass);
  color: var(--text-secondary);
  line-height: 1.2;
  align-self: end;
  white-space: nowrap;
}
</style>
