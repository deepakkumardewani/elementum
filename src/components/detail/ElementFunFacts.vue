<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { gsap } from "gsap"
import type { Element } from "@/types/element"

const props = defineProps<{ element: Element }>()

const factsListRef = ref<HTMLElement | null>(null)

function animateFacts() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  if (!factsListRef.value) return
  const items = factsListRef.value.querySelectorAll('.facts-item')
  if (items.length > 0) {
    gsap.fromTo(
      items,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    )
  }
}

onMounted(animateFacts)
watch(() => props.element, animateFacts, { deep: true })
</script>

<template>
  <div class="facts-section">
    <!-- Summary -->
    <div class="facts-card">
      <h3 class="facts-title">About {{ element.name }}</h3>
      <p class="facts-summary">{{ element.summary }}</p>
    </div>

    <!-- Fun Facts -->
    <div v-if="element.funFacts && element.funFacts.length > 0" class="facts-card">
      <h3 class="facts-title">Fun Facts</h3>
      <ul ref="factsListRef" class="facts-list">
        <li
          v-for="(fact, i) in element.funFacts"
          :key="`${element.atomicNumber}-fact-${i}`"
          class="facts-item"
        >
          <span class="facts-bullet" aria-hidden="true">—</span>
          {{ fact }}
        </li>
      </ul>
    </div>
    <div v-else class="facts-card">
      <h3 class="facts-title">Fun Facts</h3>
      <p class="facts-empty">No data available.</p>
    </div>

    <!-- Common Compounds -->
    <div v-if="element.compounds && element.compounds.length > 0" class="facts-card">
      <h3 class="facts-title">Common Compounds</h3>
      <div class="compounds-grid">
        <span
          v-for="(compound, i) in element.compounds"
          :key="`${element.atomicNumber}-compound-${i}`"
          class="compound-chip"
        >
          {{ compound }}
        </span>
      </div>
    </div>
    <div v-else class="facts-card">
      <h3 class="facts-title">Common Compounds</h3>
      <p class="facts-empty">No data available.</p>
    </div>
  </div>
</template>

<style scoped>
.facts-section {
  display: flex;
  flex-direction: column;
  gap: 0;
  /* Space below compound chips so the section doesn’t end flush with the scroller. */
  padding-bottom: 0.75rem;
}

.facts-card {
  border-top: 1px solid var(--bg-border);
  padding: 0.875rem 0 0.875rem;
}

.facts-card:first-child {
  border-top: none;
  padding-top: 0;
}

.facts-title {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.625rem;
}

.facts-summary {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.65;
}

.facts-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.facts-item {
  display: flex;
  gap: 0.5rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.55;
}

.facts-bullet {
  color: var(--accent-cyan);
  flex-shrink: 0;
  margin-top: 0.05em;
}

.facts-empty {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-style: italic;
}

.compounds-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.compound-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  background-color: var(--bg-surface);
  border: 1px solid var(--bg-border);
}
</style>
