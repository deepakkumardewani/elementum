<script setup lang="ts">
import { computed, onUnmounted, ref, watch, watchEffect } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import { analyzeBond } from "@/utils/bondCalculator"
import ToolElementPicker from "@/components/tools/ToolElementPicker.vue"
import type { Element } from "@/types/element"

const elementStore = useElementStore()
const { elements } = storeToRefs(elementStore)
const { setToolHighlight, clearToolHighlight } = elementStore

const a = ref<Element | null>(null)
const b = ref<Element | null>(null)

const bond = computed(() =>
  analyzeBond(
    a.value?.electronegativity ?? null,
    b.value?.electronegativity ?? null,
  ),
)

/** Position 0–100% on the 0–3 EN-diff scale for the marker */
const markerPercent = computed(() => {
  if (bond.value.ok !== true) return 0
  const d = bond.value.analysis.difference
  const clamped = Math.min(3, Math.max(0, d))
  return (clamped / 3) * 100
})

const badgeClass = computed(() => {
  if (bond.value.ok !== true) return ""
  const k = bond.value.analysis.kind
  if (k === "nonpolar-covalent") return "badge--nonpolar"
  if (k === "polar-covalent") return "badge--polar"
  return "badge--ionic"
})

watchEffect(() => {
  void markerPercent.value
  void badgeClass.value
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
  <section class="bond-tool" aria-labelledby="bond-heading">
    <h2 id="bond-heading" class="sr-only">Bond type from electronegativity</h2>

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

    <div
      v-if="a && b"
      class="result-panel"
      :data-en-marker-percent="markerPercent"
    >
      <template v-if="bond.ok">
        <div class="en-line">
          <span class="en-label">|ΔEN|</span>
          <span class="en-value">{{ bond.analysis.difference.toFixed(2) }}</span>
        </div>

        <span class="bond-badge" :class="badgeClass">{{
          bond.analysis.label
        }}</span>

        <p class="bond-expl">{{ bond.analysis.explanation }}</p>

        <div class="scale" aria-hidden="true">
          <div class="scale-zones">
            <span class="zone zone--np" />
            <span class="zone zone--p" />
            <span class="zone zone--i" />
          </div>
          <div class="scale-ticks">
            <span>0</span>
            <span>0.4</span>
            <span>1.7</span>
            <span>3+</span>
          </div>
          <div class="scale-marker" :style="{ left: `${markerPercent}%` }" />
        </div>
        <p class="scale-legend">
          Scale: nonpolar &lt;0.4 · polar 0.4–1.7 · ionic &gt;1.7 (Pauling).
        </p>
      </template>
      <p v-else class="bond-warn" role="alert">{{ bond.reason }}</p>
    </div>

    <p v-else class="hint">Select two elements to compare electronegativity.</p>
  </section>
</template>

<style scoped>
.bond-tool {
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 1rem 1.1rem;
  border-radius: 8px;
  border: 1px solid var(--bg-border);
  background: color-mix(in srgb, var(--bg-surface) 94%, var(--bg-base));
}

.en-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: var(--font-mono);
}

.en-label {
  font-size: var(--text-2xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.en-value {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.bond-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.badge--nonpolar {
  background: color-mix(in srgb, #22c55e 22%, var(--bg-surface));
  color: #15803d;
  border: 1px solid color-mix(in srgb, #22c55e 45%, transparent);
}

.badge--polar {
  background: color-mix(in srgb, #38bdf8 22%, var(--bg-surface));
  color: #0369a1;
  border: 1px solid color-mix(in srgb, #38bdf8 45%, transparent);
}

.badge--ionic {
  background: color-mix(in srgb, #a855f7 22%, var(--bg-surface));
  color: #6b21a8;
  border: 1px solid color-mix(in srgb, #a855f7 45%, transparent);
}

.bond-expl {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.55;
  max-width: 62ch;
}

.bond-warn {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-danger, #e11d48);
}

.hint {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.scale {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin-top: 4px;
}

.scale-zones {
  display: grid;
  grid-template-columns: 1fr 3.25fr 1.75fr;
  height: 10px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--bg-border);
}

.zone--np {
  background: color-mix(in srgb, #22c55e 35%, var(--bg-base));
}

.zone--p {
  background: color-mix(in srgb, #38bdf8 35%, var(--bg-base));
}

.zone--i {
  background: color-mix(in srgb, #a855f7 35%, var(--bg-base));
}

.scale-ticks {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.scale-marker {
  position: absolute;
  top: -2px;
  width: 3px;
  height: 14px;
  margin-left: -1.5px;
  background: var(--text-primary);
  border-radius: 1px;
  transform: translateX(-50%);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--bg-base) 70%, transparent);
}

.scale-legend {
  margin: 0;
  font-size: var(--text-2xs);
  color: var(--text-muted);
}
</style>
