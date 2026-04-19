<script setup lang="ts">
import { computed, ref } from "vue"
import { X } from "lucide-vue-next"
import MiniPeriodicGrid from "@/components/compare/MiniPeriodicGrid.vue"
import { categoryColor, CATEGORY_LABELS } from "@/utils/elementUtils"
import type { Element } from "@/types/element"

const props = defineProps<{
  label: string
  elements: Element[]
  /** Disable this tile (e.g. other picker's choice) */
  otherSelected: Element | null
  modelValue: Element | null
}>()

const emit = defineEmits<{
  "update:modelValue": [value: Element | null]
}>()

const selected = computed({
  get: () => props.modelValue,
  set: (v: Element | null) => emit("update:modelValue", v),
})

const searchQuery = ref("")

const matchedNumbers = computed<Set<number> | null>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return null
  return new Set(
    props.elements
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
  if (props.modelValue?.atomicNumber === el.atomicNumber) {
    emit("update:modelValue", null)
  } else {
    emit("update:modelValue", el)
    searchQuery.value = ""
  }
}

function clearSelection() {
  emit("update:modelValue", null)
}
</script>

<template>
  <div class="tool-element-picker">
    <p class="picker-label">{{ label }}</p>

    <input
      v-model="searchQuery"
      type="search"
      class="search-input"
      :placeholder="selected ? `Search to change…` : `Search by name, symbol, or number…`"
      :aria-label="`${label} search`"
    />

    <div
      v-if="selected"
      class="selected-display"
      :style="{ '--sel-color': categoryColor(selected.category) }"
    >
      <span class="selected-symbol">{{ selected.symbol }}</span>
      <div class="selected-info">
        <span class="selected-name">{{ selected.name }}</span>
        <span
          class="selected-category"
          :style="{ color: categoryColor(selected.category) }"
        >
          {{ CATEGORY_LABELS[selected.category] }}
        </span>
      </div>
      <button
        type="button"
        class="clear-btn"
        :aria-label="`Clear ${selected.name}`"
        @click="clearSelection"
      >
        <X :size="14" />
      </button>
    </div>
    <div v-else class="selected-placeholder" aria-hidden="true">
      Choose an element in the grid below
    </div>

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
.tool-element-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.picker-label {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  background: transparent;
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  padding: 7px 10px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  outline: none;
  transition:
    border-color 150ms ease,
    background-color 150ms ease;
}

.search-input:focus {
  border-color: var(--accent-cyan);
  background: var(--bg-elevated);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.selected-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--sel-color) 6%, var(--bg-surface));
  border-left: 3px solid var(--sel-color);
  border-top: 1px solid color-mix(in srgb, var(--sel-color) 20%, var(--bg-border));
  border-right: 1px solid color-mix(in srgb, var(--sel-color) 20%, var(--bg-border));
  border-bottom: 1px solid color-mix(in srgb, var(--sel-color) 20%, var(--bg-border));
  border-radius: 2px;
  min-height: 52px;
}

.selected-symbol {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sel-color);
  line-height: 1;
  min-width: 2.25rem;
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
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-category {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    color 150ms ease,
    border-color 150ms ease;
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
  padding: 8px 12px;
  background: transparent;
  border: 1px dashed var(--bg-border);
  border-radius: 2px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  min-height: 48px;
}
</style>
