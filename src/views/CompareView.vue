<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from "vue"
import { storeToRefs } from "pinia"
import { gsap } from "gsap"
import { ChevronsUp } from "lucide-vue-next"
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
      <div class="empty-icon-wrap">
        <ChevronsUp :size="32" class="empty-icon" />
      </div>
      <p class="empty-text">{{ emptyMessage }}</p>
      <p class="empty-hint">Use the selectors above to search elements or use the mini-grids</p>
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
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.view-subtitle {
  font-size: var(--text-sm);
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
  gap: 16px;
  padding: 64px 24px;
  border: 1px dashed var(--bg-border);
  border-radius: 12px;
  text-align: center;
  background: color-mix(in srgb, var(--bg-surface) 30%, transparent);
}

.empty-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  color: var(--accent-cyan);
  margin-bottom: 8px;
}

.empty-icon {
  opacity: 0.8;
}

.empty-text {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
}

.empty-hint {
  font-size: var(--text-sm);
  color: var(--text-muted);
  max-width: 320px;
}
</style>
