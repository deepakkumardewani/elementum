<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from "vue"
import { storeToRefs } from "pinia"
import { gsap } from "gsap"
import { useElementStore } from "@/stores/elementStore"
import ElementSelector from "@/components/compare/ElementSelector.vue"
import CompareTable from "@/components/compare/CompareTable.vue"

const elementStore = useElementStore()
const { compareElements } = storeToRefs(elementStore)

const rootRef = ref<HTMLElement | null>(null)
const tableRef = ref<HTMLElement | null>(null)

let ctx: gsap.Context | null = null

const bothSelected = computed(
  () => compareElements.value[0] !== null && compareElements.value[1] !== null,
)

const emptyMessage = computed(() => {
  if (compareElements.value[0] || compareElements.value[1]) {
    return "Now select a second element to compare"
  }
  return "Select two elements above to compare their properties"
})

watch(bothSelected, async (val) => {
  if (ctx) {
    ctx.revert()
    ctx = null
  }
  if (!val) return

  await nextTick()
  if (!tableRef.value || !rootRef.value) return

  ctx = gsap.context(() => {
    gsap.fromTo(
      tableRef.value,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    )
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <main ref="rootRef" class="compare-view">
    <!-- Page header -->
    <header class="view-header">
      <h1 class="view-title">Element Comparison</h1>
      <p class="view-subtitle">Select two elements to compare their properties side by side</p>
    </header>

    <!-- Two selectors side by side -->
    <div class="selectors-layout">
      <ElementSelector :slot-index="0" />

      <div class="vs-divider" aria-hidden="true">
        <span class="vs-line" />
        <span class="vs-text">VS</span>
        <span class="vs-line" />
      </div>

      <ElementSelector :slot-index="1" />
    </div>

    <!-- Compare table — revealed when both elements are selected -->
    <div
      v-if="bothSelected"
      ref="tableRef"
      class="compare-table-section"
    >
      <CompareTable
        :element-a="compareElements[0]!"
        :element-b="compareElements[1]!"
      />
    </div>

    <!-- Empty / partial selection state -->
    <div
      v-else
      class="empty-state"
      aria-live="polite"
    >
      <div class="empty-icon" aria-hidden="true">⚗</div>
      <p class="empty-text">{{ emptyMessage }}</p>
    </div>
  </main>
</template>

<style scoped>
.compare-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px 24px 48px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Header */
.view-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.view-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.view-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Selectors layout */
.selectors-layout {
  display: grid;
  grid-template-columns: 1fr 40px 1fr;
  gap: 0;
  align-items: start;
}

/* VS vertical divider */
.vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  height: 100%;
}

.vs-line {
  flex: 1;
  width: 1px;
  background: var(--bg-border);
}

.vs-text {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  padding: 5px 8px;
  background: var(--bg-surface);
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  white-space: nowrap;
}

/* Compare table section */
.compare-table-section {
  width: 100%;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  border: 1px dashed var(--bg-border);
  border-radius: 10px;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.4;
}

.empty-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-style: italic;
}
</style>
