<script setup lang="ts">
import type { QuizMode } from "@/types/quiz"

defineProps<{
  score: number
  maxStreak: number
  mode: QuizMode | null
  bestForMode: number
}>()

const emit = defineEmits<{
  playAgain: []
  changeMode: []
}>()
</script>

<template>
  <section class="results quiz-panel">
    <h2 class="results-title">Round complete</h2>
    <p class="results-line">Score: {{ score }}</p>
    <p class="results-line">Best streak: {{ maxStreak }}</p>
    <p v-if="mode" class="results-line">Best for this mode: {{ bestForMode }}</p>
    <div class="results-actions">
      <button type="button" class="primary-btn" @click="emit('playAgain')">Play again</button>
      <button type="button" class="ghost-btn" @click="emit('changeMode')">Change mode</button>
    </div>
  </section>
</template>

<style scoped>
.results-title {
  margin: 0 0 0.5rem;
  font-size: var(--text-xl);
  color: var(--text-primary);
}

.results-line {
  margin: 0.25rem 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.results-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.primary-btn {
  font-size: var(--text-sm);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid var(--accent-cyan);
  background: color-mix(in srgb, var(--accent-cyan) 16%, var(--bg-surface));
  color: var(--text-primary);
}

.ghost-btn {
  border: 1px solid var(--bg-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  padding: 0.5rem 1rem;
  border-radius: 2px;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    color 150ms ease;
}

.ghost-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}
</style>
