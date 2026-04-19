<script setup lang="ts">
import { Layers, Timer, ListChecks } from "lucide-vue-next"
import type { QuizMode } from "@/types/quiz"

const emit = defineEmits<{
  select: [mode: QuizMode]
}>()

const MODES = [
  {
    mode: "flashcard" as const,
    title: "Flashcard",
    description: "See a symbol, flip the card, and mark whether you named the element correctly.",
    icon: Layers,
  },
  {
    mode: "multipleChoice" as const,
    title: "Multiple Choice",
    description: "Answer property and trivia questions with four plausible element choices.",
    icon: ListChecks,
  },
  {
    mode: "challenge" as const,
    title: "Challenge",
    description: "Race the clock — 60 seconds to answer as many questions as you can.",
    icon: Timer,
  },
]
</script>

<template>
  <div class="mode-grid" role="list">
    <button
      v-for="item in MODES"
      :key="item.mode"
      type="button"
      class="mode-card"
      role="listitem"
      @click="emit('select', item.mode)"
    >
      <component :is="item.icon" class="mode-icon" aria-hidden="true" />
      <h2 class="mode-title">{{ item.title }}</h2>
      <p class="mode-desc">{{ item.description }}</p>
    </button>
  </div>
</template>

<style scoped>
.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 960px;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.25rem 1.25rem 1.35rem;
  text-align: left;
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  background: color-mix(in srgb, var(--bg-surface) 92%, transparent);
  color: var(--text-primary);
  cursor: pointer;
  transition:
    border-color 150ms ease,
    background-color 150ms ease,
    transform 150ms ease;
}

.mode-card:hover {
  border-color: var(--accent-cyan);
  background: color-mix(in srgb, var(--accent-cyan) 8%, var(--bg-surface));
  transform: translateY(-1px);
}

.mode-card:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.mode-icon {
  width: 28px;
  height: 28px;
  color: var(--accent-cyan);
  opacity: 0.9;
}

.mode-title {
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}

.mode-desc {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.55;
}
</style>
