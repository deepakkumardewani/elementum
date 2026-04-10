<script setup lang="ts">
import { ref, computed } from "vue"
import { storeToRefs } from "pinia"
import { X } from "lucide-vue-next"
import { useElementStore } from "@/stores/elementStore"
import { categoryColor } from "@/utils/elementUtils"
import GlowBadge from "@/components/detail/GlowBadge.vue"
import MiniPeriodicGrid from "@/components/compare/MiniPeriodicGrid.vue"
import type { Element } from "@/types/element"

const props = defineProps<{ slotIndex: 0 | 1 }>()

const elementStore = useElementStore()
const { elements, compareElements } = storeToRefs(elementStore)
const { setCompareElement } = elementStore

const searchQuery = ref("")

const selected = computed<Element | null>(() => compareElements.value[props.slotIndex])
const otherSelected = computed<Element | null>(
  () => compareElements.value[props.slotIndex === 0 ? 1 : 0],
)

const matchedNumbers = computed<Set<number> | null>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return null
  return new Set(
    elements.value
      .filter(
        (el) =>
          el.name.toLowerCase().includes(q) ||
          el.symbol.toLowerCase().includes(q) ||
          String(el.atomicNumber).includes(q),
      )
      .map((el) => el.atomicNumber),
  )
})

function handleSelect(el: Element) {
  // Clicking the already-selected element toggles it off
  if (selected.value?.atomicNumber === el.atomicNumber) {
    setCompareElement(props.slotIndex, null)
  } else {
    setCompareElement(props.slotIndex, el)
    searchQuery.value = ""
  }
}

function clearSelection() {
  setCompareElement(props.slotIndex, null)
}
</script>

<template>
  <div class="element-selector">
    <p class="selector-label">Element {{ slotIndex + 1 }}</p>

    <!-- Search -->
    <input
      v-model="searchQuery"
      type="search"
      class="search-input"
      :placeholder="selected ? `Search to change…` : `Search by name, symbol, or number…`"
      aria-label="Search elements"
    />

    <!-- Selected element display -->
    <div
      v-if="selected"
      class="selected-display"
      :style="{ '--sel-color': categoryColor(selected.category) }"
    >
      <span class="selected-symbol">{{ selected.symbol }}</span>
      <div class="selected-info">
        <span class="selected-name">{{ selected.name }}</span>
        <GlowBadge :category="selected.category" />
      </div>
      <button
        class="clear-btn"
        :aria-label="`Clear ${selected.name} selection`"
        @click="clearSelection"
      >
        <X :size="14" />
      </button>
    </div>
    <div
      v-else
      class="selected-placeholder"
      aria-label="No element selected"
    >
      Click an element below to select it
    </div>

    <!-- Mini grid picker -->
    <MiniPeriodicGrid
      :elements="elements"
      :selected-number="selected?.atomicNumber ?? null"
      :other-number="otherSelected?.atomicNumber ?? null"
      :dimmed-numbers="matchedNumbers"
      @select="handleSelect"
    />
  </div>
</template>

<style scoped>
.element-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.selector-label {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: var(--text-sm);
  outline: none;
  transition: border-color 150ms ease;
}

.search-input:focus {
  border-color: var(--accent-cyan);
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* Selected display */
.selected-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--sel-color) 8%, var(--bg-elevated));
  border: 1px solid color-mix(in srgb, var(--sel-color) 30%, var(--bg-border));
  border-radius: 8px;
  min-height: 60px;
}

.selected-symbol {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--sel-color);
  line-height: 1;
  min-width: 2.5rem;
  text-align: center;
}

.selected-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.selected-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 150ms ease, border-color 150ms ease;
}

.clear-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.clear-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.selected-placeholder {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-elevated);
  border: 1px dashed var(--bg-border);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: var(--text-sm);
  font-style: italic;
  min-height: 60px;
}
</style>
