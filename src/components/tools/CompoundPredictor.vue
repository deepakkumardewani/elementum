<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import { findLikelySharedCompound } from "@/utils/bondCalculator"
import ToolElementPicker from "@/components/tools/ToolElementPicker.vue"
import type { Element } from "@/types/element"

const elementStore = useElementStore()
const { elements } = storeToRefs(elementStore)
const { setToolHighlight, clearToolHighlight } = elementStore

const a = ref<Element | null>(null)
const b = ref<Element | null>(null)

const compoundLine = computed(() => {
  if (!a.value || !b.value) return null
  return findLikelySharedCompound(a.value, b.value)
})

watch(
  [a, b],
  () => {
    const nums: number[] = []
    if (a.value) nums.push(a.value.atomicNumber)
    if (b.value) nums.push(b.value.atomicNumber)
    if (nums.length > 0) {
      setToolHighlight(nums)
    } else {
      clearToolHighlight()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  clearToolHighlight()
})
</script>

<template>
  <section class="compound-tool" aria-labelledby="compound-heading">
    <h2 id="compound-heading" class="sr-only">Likely shared compound</h2>

    <div class="pickers">
      <ToolElementPicker
        v-model="a"
        label="First element"
        :elements="elements"
        :other-selected="b"
      />
      <ToolElementPicker
        v-model="b"
        label="Second element"
        :elements="elements"
        :other-selected="a"
      />
    </div>

    <div v-if="a && b" class="result-panel">
      <p v-if="compoundLine" class="compound-line">
        <span class="compound-label">Likely compound</span>
        <span class="compound-value">{{ compoundLine }}</span>
      </p>
      <p v-else class="compound-none" role="status">
        No common compound found in the dataset for this pair.
      </p>
    </div>

    <p v-else class="hint">Select two elements to look for a shared compound.</p>
  </section>
</template>

<style scoped>
.compound-tool {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 960px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.pickers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 720px) {
  .pickers {
    grid-template-columns: 1fr;
  }
}

.result-panel {
  padding: 1rem 1.1rem;
  border-radius: 8px;
  border: 1px solid var(--bg-border);
  background: color-mix(in srgb, var(--bg-surface) 94%, var(--bg-base));
}

.compound-line {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compound-label {
  font-size: var(--text-2xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.compound-value {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.45;
}

.compound-none {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.hint {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
}
</style>
