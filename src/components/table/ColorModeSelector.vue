<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUiStore } from "@/stores/uiStore";
import { TABLE_COLOR_MODE_OPTIONS } from "@/composables/usePropertyColor";
import type { TableColorMode } from "@/types/element";

const uiStore = useUiStore();
const { colorMode } = storeToRefs(uiStore);

function onChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value as TableColorMode;
  uiStore.setColorMode(v);
}
</script>

<template>
  <div class="color-mode-selector">
    <label class="selector-label" for="table-color-mode">Color by</label>
    <select
      id="table-color-mode"
      class="selector-select"
      :value="colorMode"
      aria-label="Color table tiles by category or property trend"
      @change="onChange"
    >
      <option v-for="opt in TABLE_COLOR_MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.color-mode-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.selector-label {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
  white-space: nowrap;
}

.selector-select {
  min-width: 160px;
  padding: 5px 8px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-primary);
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 150ms ease;
}

.selector-select:hover,
.selector-select:focus-visible {
  border-color: var(--accent-cyan);
  outline: none;
}
</style>
