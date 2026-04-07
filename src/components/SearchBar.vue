<script setup lang="ts">
import { ref } from "vue"
import { Search, X } from "lucide-vue-next"
import { useElementSearch } from "@/composables/useElementSearch"

const inputRef = ref<HTMLInputElement | null>(null)
const { localQuery, onInput, clearSearch } = useElementSearch(inputRef)
</script>

<template>
  <div class="search-bar" role="search">
    <Search class="search-icon" :size="15" aria-hidden="true" />
    <input
      ref="inputRef"
      class="search-input"
      type="search"
      placeholder="Search elements…"
      autocomplete="off"
      spellcheck="false"
      aria-label="Search elements"
      aria-controls="periodic-grid"
      :value="localQuery"
      @input="onInput"
    />
    <button
      v-if="localQuery"
      class="clear-btn"
      aria-label="Clear search"
      @click="clearSearch"
    >
      <X :size="13" />
    </button>
    <kbd class="slash-hint" aria-hidden="true">/</kbd>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 6px;
  padding: 0 8px;
  width: 220px;
  transition: border-color 150ms ease;
}

.search-bar:focus-within {
  border-color: var(--accent-cyan);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.8125rem;
  padding: 6px 0;
  /* Hide browser's native clear button on type="search" */
  -webkit-appearance: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* Hide native search cancel button in WebKit */
.search-input::-webkit-search-cancel-button {
  display: none;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: 3px;
  flex-shrink: 0;
  transition: color 150ms ease;
}

.clear-btn:hover {
  color: var(--text-primary);
}

.clear-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

/* Hide the "/" hint when input is focused or has content */
.slash-hint {
  font-size: 0.65rem;
  color: var(--text-muted);
  background-color: var(--bg-border);
  border: 1px solid var(--bg-elevated);
  border-radius: 3px;
  padding: 1px 4px;
  line-height: 1.4;
  flex-shrink: 0;
  font-family: inherit;
  pointer-events: none;
  transition: opacity 150ms ease;
}

.search-bar:focus-within .slash-hint {
  opacity: 0;
}
</style>
