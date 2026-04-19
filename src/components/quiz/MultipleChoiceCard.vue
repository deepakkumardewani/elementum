<script setup lang="ts">
import { computed } from "vue"
import type { McqQuestion, QuizMode } from "@/types/quiz"

const props = defineProps<{
  question: McqQuestion
  pickedIndex: number | null
  mode: QuizMode
}>()

const emit = defineEmits<{
  pick: [idx: number]
  next: []
}>()

const showNext = computed(
  () => props.mode === "multipleChoice" && props.pickedIndex !== null,
)

function onPick(idx: number) {
  if (props.pickedIndex !== null) return
  emit("pick", idx)
}
</script>

<template>
  <div class="mcq-stack">
    <p class="mcq-prompt">{{ question.prompt }}</p>
    <div class="mcq-options" role="group" :aria-label="question.prompt">
      <button
        v-for="(opt, idx) in question.options"
        :key="opt.atomicNumber"
        type="button"
        class="mcq-opt"
        :class="{
          'is-picked': pickedIndex === idx,
          'is-correct': pickedIndex !== null && idx === question.correctIndex,
          'is-wrong':
            pickedIndex !== null && idx === pickedIndex && idx !== question.correctIndex,
        }"
        :disabled="pickedIndex !== null && mode === 'challenge'"
        @click="onPick(idx)"
      >
        <span class="mcq-opt-symbol">{{ opt.symbol }}</span>
        <span class="mcq-opt-name">{{ opt.name }}</span>
      </button>
    </div>
    <p v-if="pickedIndex !== null" class="mcq-explain">{{ question.explanation }}</p>
    <button v-if="showNext" type="button" class="primary-btn" @click="emit('next')">
      Next
    </button>
  </div>
</template>

<style scoped>
.mcq-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
}

.mcq-prompt {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.mcq-options {
  display: grid;
  gap: 0.5rem;
}

.mcq-opt {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 120ms ease,
    background-color 120ms ease;
}

.mcq-opt:hover:not(:disabled) {
  border-color: var(--accent-cyan);
}

.mcq-opt:disabled {
  cursor: default;
  opacity: 0.85;
}

.mcq-opt.is-correct {
  border-color: var(--color-positive);
  background: color-mix(in srgb, var(--color-positive) 12%, var(--bg-surface));
}

.mcq-opt.is-wrong {
  border-color: var(--color-negative);
  background: color-mix(in srgb, var(--color-negative) 10%, var(--bg-surface));
}

.mcq-opt-symbol {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--accent-cyan);
  min-width: 2.5rem;
}

.mcq-opt-name {
  font-size: var(--text-sm);
}

.mcq-explain {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
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
</style>
