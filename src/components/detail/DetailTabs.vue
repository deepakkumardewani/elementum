<script setup lang="ts">
import { computed, nextTick } from "vue"
import type { DetailTabId } from "@/utils/detailTabVisibility"

const props = defineProps<{
  idPrefix: string
  tabs: { id: DetailTabId; label: string }[]
  modelValue: DetailTabId
}>()

const emit = defineEmits<{
  "update:modelValue": [value: DetailTabId]
}>()

const selectedIndex = computed(() => props.tabs.findIndex((t) => t.id === props.modelValue))

function selectTab(id: DetailTabId, el?: HTMLElement) {
  emit("update:modelValue", id)
  if (el) {
    nextTick(() => el.focus())
  }
}

function focusTabAt(index: number) {
  const tab = props.tabs[index]
  if (!tab) return
  emit("update:modelValue", tab.id)
  nextTick(() => {
    const node = document.getElementById(`${props.idPrefix}-tab-${tab.id}`)
    node?.focus()
  })
}

function onTablistKeydown(e: KeyboardEvent) {
  const len = props.tabs.length
  if (len === 0) return
  let idx = selectedIndex.value
  if (idx < 0) idx = 0

  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault()
    e.stopPropagation()
    const next = (idx + 1) % len
    focusTabAt(next)
    return
  }
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault()
    e.stopPropagation()
    const prev = (idx - 1 + len) % len
    focusTabAt(prev)
    return
  }
  if (e.key === "Home") {
    e.preventDefault()
    e.stopPropagation()
    focusTabAt(0)
    return
  }
  if (e.key === "End") {
    e.preventDefault()
    e.stopPropagation()
    focusTabAt(len - 1)
  }
}
</script>

<template>
  <div
    class="detail-tabs"
    role="tablist"
    aria-label="Element detail sections"
    @keydown="onTablistKeydown"
  >
    <button
      v-for="(tab, i) in tabs"
      :id="`${idPrefix}-tab-${tab.id}`"
      :key="tab.id"
      type="button"
      class="detail-tab"
      role="tab"
      :tabindex="i === selectedIndex ? 0 : -1"
      :aria-selected="modelValue === tab.id"
      :aria-controls="`${idPrefix}-panel-${tab.id}`"
      @click="selectTab(tab.id, $event.currentTarget as HTMLElement)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.detail-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.5rem 1rem 0;
  border-bottom: 1px solid var(--bg-border);
  flex-shrink: 0;
}

.detail-tab {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.45rem 0.65rem;
  border-radius: 2px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    color 120ms ease,
    border-color 120ms ease,
    background-color 120ms ease;
}

.detail-tab:hover {
  color: var(--text-secondary);
  border-color: var(--bg-border);
}

.detail-tab[aria-selected="true"] {
  color: var(--accent-cyan);
  border-color: color-mix(in srgb, var(--accent-cyan) 45%, var(--bg-border));
  background-color: color-mix(in srgb, var(--accent-cyan) 8%, transparent);
}

.detail-tab:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}
</style>
