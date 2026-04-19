<script setup lang="ts">
import { computed } from "vue"
import type { Element } from "@/types/element"

const props = defineProps<{
  element: Element
}>()

const uses = computed(() => props.element.industrialUses?.filter((u) => u.trim()) ?? [])
const occurrence = computed(() => props.element.naturalOccurrence?.trim() ?? "")
const hasContent = computed(() => uses.value.length > 0 || occurrence.value.length > 0)
</script>

<template>
  <div class="real-world-section">
    <section v-if="uses.length" class="rw-block">
      <h4 class="rw-heading">Industrial uses</h4>
      <ul class="chip-list" aria-label="Industrial uses">
        <li v-for="(tag, i) in uses" :key="i" class="chip">{{ tag }}</li>
      </ul>
    </section>

    <section v-if="occurrence" class="rw-block">
      <h4 class="rw-heading">Natural occurrence</h4>
      <p class="rw-prose">{{ occurrence }}</p>
    </section>

    <p v-if="!hasContent" class="rw-fallback">
      No industrial or occurrence notes are available for this element yet.
    </p>
  </div>
</template>

<style scoped>
.real-world-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.rw-heading {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}

.chip-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  margin: 0;
  padding: 0.25rem 0.55rem;
  font-size: var(--text-xs);
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.rw-prose {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.55;
}

.rw-fallback {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
