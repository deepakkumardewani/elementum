<script setup lang="ts">
import type { QuizMode } from "@/types/quiz"

defineProps<{
  progressLabel: string
  score: number
  streak: number
  mode: QuizMode
}>()

const emit = defineEmits<{
  exit: []
}>()
</script>

<template>
  <div class="session-bar">
    <span class="session-meta">{{ progressLabel }}</span>
    <span class="session-score">Score {{ score }}</span>
    <span v-if="mode !== 'challenge'" class="session-streak">Streak {{ streak }}</span>
    <button type="button" class="ghost-btn" @click="emit('exit')">Exit</button>
  </div>
</template>

<style scoped>
.session-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  background: var(--bg-surface);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.session-score,
.session-streak {
  color: var(--accent-cyan);
}

.ghost-btn {
  margin-left: auto;
  border: 1px solid var(--bg-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  padding: 0.35rem 0.65rem;
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
