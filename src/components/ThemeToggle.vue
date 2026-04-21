<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useUiStore } from "@/stores/uiStore"

const uiStore = useUiStore()
const { isDark } = storeToRefs(uiStore)
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-pressed="!isDark"
    data-testid="theme-toggle"
    @click="uiStore.toggleTheme()"
  >
    <!-- Sun (light mode icon) -->
    <svg
      v-if="!isDark"
      class="theme-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="2"   x2="12" y2="5"   />
      <line x1="12" y1="19"  x2="12" y2="22"  />
      <line x1="2"  y1="12"  x2="5"  y2="12"  />
      <line x1="19" y1="12"  x2="22" y2="12"  />
      <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"  />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66" />
      <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"  />
    </svg>

    <!-- Moon (dark mode icon) -->
    <svg
      v-else
      class="theme-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>

  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  background: none;
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  cursor: pointer;
  color: var(--text-secondary);
  transition:
    color 150ms ease,
    border-color 150ms ease,
    background-color 150ms ease;
}

.theme-toggle:hover {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  background-color: color-mix(in srgb, var(--accent-cyan) 6%, transparent);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 3px;
  border-radius: 2px;
}

.theme-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.theme-toggle:hover .theme-icon {
  transform: rotate(15deg) scale(1.1);
}
</style>
