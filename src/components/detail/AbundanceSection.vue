<script setup lang="ts">
import { computed } from "vue"
import type { Abundance } from "@/types/element"

const props = defineProps<{ abundance?: Abundance | null }>()

const ROWS: { label: string; key: keyof Abundance }[] = [
  { label: "Universe", key: "universe" },
  { label: "Sun", key: "sun" },
  { label: "Earth's Crust", key: "earthCrust" },
  { label: "Oceans", key: "oceans" },
  { label: "Human Body", key: "humanBody" },
  { label: "Meteorites", key: "meteorites" },
]

const showSection = computed(() => {
  const a = props.abundance
  if (!a) return false
  return ROWS.some(({ key }) => a[key] != null)
})

function formatAbundance(v: number | null | undefined): string {
  if (v == null) return "—"
  const pct = v * 100
  if (pct === 0) return "0%"
  if (pct < 0.0001) return pct.toExponential(2) + "%"
  if (pct < 0.01) return pct.toFixed(4) + "%"
  if (pct < 1) return pct.toFixed(3) + "%"
  return pct.toFixed(2) + "%"
}
</script>

<template>
  <section v-if="showSection" class="abundance-section" aria-label="Element abundance">
    <h3 class="section-title">Prevalence</h3>
    <dl class="datasheet">
      <div
        v-for="row in ROWS"
        :key="row.key"
        class="datasheet-row"
      >
        <dt class="row-label">{{ row.label }}</dt>
        <dd class="row-value">
          <span class="value-num">{{ formatAbundance(props.abundance?.[row.key]) }}</span>
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.section-title {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.datasheet {
  display: flex;
  flex-direction: column;
}

.datasheet-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed var(--bg-border);
}

.datasheet-row:last-child {
  border-bottom: none;
}

.row-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 140px;
}

.row-value {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  margin: 0;
}

.value-num {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}
</style>
