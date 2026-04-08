<script setup lang="ts">
import type { Element } from "@/types/element"

defineProps<{ element: Element }>()

// Uses `uses` from element data — the ARCHITECTURE field is named `uses` but our
// type schema doesn't include `uses` separately; funFacts and compounds are in type.
// We'll display: summary paragraph + fun facts + compounds.
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
      <ul class="facts-list">
        <li v-for="(fact, i) in element.funFacts" :key="i" class="facts-item">
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
          :key="i"
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
  gap: 1rem;
}

.facts-card {
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 8px;
  padding: 1rem;
}

.facts-title {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.625rem;
}

.facts-summary {
  font-size: 0.875rem;
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
  font-size: 0.875rem;
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
