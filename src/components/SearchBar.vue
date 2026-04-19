<script setup lang="ts">
import { onClickOutside } from "@vueuse/core"
import { CircleHelp, Search, X } from "lucide-vue-next"
import { computed, ref, useId } from "vue"
import {
  formatSearchTokenLabel,
  parseAdvancedSearchTokens,
  useElementSearch,
} from "@/composables/useElementSearch"

const inputRef = ref<HTMLInputElement | null>(null)
const { localQuery, onInput, clearSearch, dismissParsedToken } = useElementSearch(inputRef)

const parsedTokens = computed(() => parseAdvancedSearchTokens(localQuery.value).tokens)

const helpOpen = ref(false)
const helpRegionRef = ref<HTMLElement | null>(null)
const helpId = useId()

onClickOutside(helpRegionRef, () => {
  helpOpen.value = false
})

function toggleHelp() {
  helpOpen.value = !helpOpen.value
}
</script>

<template>
  <div class="search-stack">
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
      <div ref="helpRegionRef" class="help-wrap">
        <button
          type="button"
          class="help-btn"
          :aria-expanded="helpOpen"
          :aria-controls="helpId"
          aria-label="Search syntax help"
          @click="toggleHelp"
        >
          <CircleHelp :size="15" aria-hidden="true" />
        </button>
        <div
          v-if="helpOpen"
          :id="helpId"
          class="help-popover"
          role="region"
          aria-label="Supported search syntax"
        >
          <p class="help-title">Structured filters</p>
          <ul class="help-list">
            <li><code>period:N</code> — period number</li>
            <li><code>group:N</code> — group (1–18)</li>
            <li><code>EN &gt; N</code>, <code>EN &lt; N</code> — electronegativity</li>
            <li><code>mp &gt; N</code>, <code>mp &lt; N</code> — melting point (K)</li>
            <li><code>metal</code>, <code>noble</code>, <code>halogen</code>, <code>metalloid</code></li>
          </ul>
          <p class="help-hint">Combine with spaces (AND). Plain text still matches name, symbol, or number.</p>
        </div>
      </div>
      <button
        v-if="localQuery"
        class="clear-btn"
        type="button"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <X :size="13" />
      </button>
      <kbd class="slash-hint" aria-hidden="true">/</kbd>
    </div>

    <div v-if="parsedTokens.length > 0" class="search-chips" role="list" aria-label="Active search filters">
      <div
        v-for="(token, i) in parsedTokens"
        :key="`${i}-${token.raw}`"
        class="chip"
        role="listitem"
      >
        <span class="chip-label">{{ formatSearchTokenLabel(token) }}</span>
        <button
          type="button"
          class="chip-dismiss"
          :aria-label="`Remove filter ${formatSearchTokenLabel(token)}`"
          @click="dismissParsedToken(token.raw)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-stack {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  position: relative;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  padding: 0 8px;
  width: 200px;
  transition:
    border-color 150ms ease,
    width 250ms ease,
    background-color 150ms ease;
}

.search-bar:focus-within {
  width: 260px;
  background-color: var(--bg-elevated);
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
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 6px 0;
  -webkit-appearance: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input::-webkit-search-cancel-button {
  display: none;
}

.help-wrap {
  position: relative;
  flex-shrink: 0;
}

.help-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: 3px;
  transition: color 150ms ease;
}

.help-btn:hover {
  color: var(--accent-cyan);
}

.help-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.help-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: min(280px, 85vw);
  padding: 10px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
  z-index: 50;
  font-size: 0.7rem;
  line-height: 1.45;
  color: var(--text-secondary);
}

.help-title {
  margin: 0 0 6px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.72rem;
}

.help-list {
  margin: 0;
  padding-left: 1rem;
}

.help-list li {
  margin-bottom: 4px;
}

.help-list code {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--accent-cyan);
}

.help-hint {
  margin: 8px 0 0;
  font-size: 0.65rem;
  color: var(--text-muted);
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

.search-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  width: 260px;
  max-width: 100%;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px 2px 8px;
  border-radius: 3px;
  background: var(--bg-border);
  border: 1px solid var(--bg-elevated);
  font-size: 0.65rem;
  font-family: var(--font-mono);
  color: var(--text-primary);
}

.chip-label {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0 4px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1;
  border-radius: 2px;
}

.chip-dismiss:hover {
  color: var(--text-primary);
}

.chip-dismiss:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 1px;
}
</style>
