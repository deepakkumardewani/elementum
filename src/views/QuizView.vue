<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import { useQuizStore } from "@/stores/quizStore"
import { useQuizLogic } from "@/composables/useQuizLogic"
import type { Element } from "@/types/element"
import type { McqQuestion } from "@/types/quiz"
import QuizModeSelector from "@/components/quiz/QuizModeSelector.vue"
import FlashCard from "@/components/quiz/FlashCard.vue"

const elementStore = useElementStore()
const quizStore = useQuizStore()
const { bestScores } = storeToRefs(quizStore)

const {
  phase,
  mode,
  score,
  streak,
  maxStreak,
  currentQuestion,
  progressLabel,
  startQuiz,
  recordFlashcardAnswer,
  skipFlashcard,
  recordMcqAnswer,
  nextMcqAfterReveal,
  backToMenu,
  playAgain,
} = useQuizLogic()

const mcqPicked = ref<number | null>(null)

watch(currentQuestion, () => {
  mcqPicked.value = null
})

onMounted(() => {
  void elementStore.loadElements()
})

const flashElement = computed((): Element | null =>
  currentQuestion.value?.kind === "flashcard" ? currentQuestion.value.element : null,
)

const mcqQuestion = computed((): McqQuestion | null =>
  currentQuestion.value?.kind === "mcq" ? currentQuestion.value : null,
)

function onMcqPick(idx: number) {
  const q = mcqQuestion.value
  if (!q || mcqPicked.value !== null) return
  mcqPicked.value = idx
  recordMcqAnswer(q, idx)
}

function onMcqNext() {
  nextMcqAfterReveal()
}

const mcqShowNext = computed(
  () =>
    mode.value === "multipleChoice" && mcqPicked.value !== null && mcqQuestion.value !== null,
)
</script>

<template>
  <main class="quiz-view">
    <header class="quiz-header">
      <h1 class="quiz-title">Quiz</h1>
      <p class="quiz-subtitle">
        Train symbols, trends, and quick recall — three ways to practice.
      </p>
    </header>

    <section v-if="phase === 'menu'" class="quiz-panel">
      <QuizModeSelector @select="startQuiz" />
    </section>

    <section v-else-if="phase === 'playing'" class="quiz-panel playing">
      <div class="session-bar">
        <span class="session-meta">{{ progressLabel }}</span>
        <span class="session-score">Score {{ score }}</span>
        <span v-if="mode !== 'challenge'" class="session-streak">Streak {{ streak }}</span>
        <button type="button" class="ghost-btn" @click="backToMenu()">Exit</button>
      </div>

      <FlashCard
        v-if="flashElement"
        :key="flashElement.atomicNumber"
        :element="flashElement"
        @correct="recordFlashcardAnswer(true)"
        @incorrect="recordFlashcardAnswer(false)"
        @skip="skipFlashcard()"
      />

      <div v-else-if="mcqQuestion" class="mcq-stack">
        <p class="mcq-prompt">{{ mcqQuestion.prompt }}</p>
        <div class="mcq-options" role="group" :aria-label="mcqQuestion.prompt">
          <button
            v-for="(opt, idx) in mcqQuestion.options"
            :key="opt.atomicNumber"
            type="button"
            class="mcq-opt"
            :class="{
              'is-picked': mcqPicked === idx,
              'is-correct': mcqPicked !== null && idx === mcqQuestion.correctIndex,
              'is-wrong':
                mcqPicked !== null && idx === mcqPicked && idx !== mcqQuestion.correctIndex,
            }"
            :disabled="mcqPicked !== null && mode === 'challenge'"
            @click="onMcqPick(idx)"
          >
            <span class="mcq-opt-symbol">{{ opt.symbol }}</span>
            <span class="mcq-opt-name">{{ opt.name }}</span>
          </button>
        </div>
        <p v-if="mcqPicked !== null" class="mcq-explain">{{ mcqQuestion.explanation }}</p>
        <button v-if="mcqShowNext" type="button" class="primary-btn" @click="onMcqNext">
          Next
        </button>
      </div>
    </section>

    <section v-else class="quiz-panel results">
      <h2 class="results-title">Round complete</h2>
      <p class="results-line">Score: {{ score }}</p>
      <p class="results-line">Best streak: {{ maxStreak }}</p>
      <p v-if="mode" class="results-line">Best for this mode: {{ bestScores[mode] }}</p>
      <div class="results-actions">
        <button type="button" class="primary-btn" @click="playAgain()">Play again</button>
        <button type="button" class="ghost-btn" @click="backToMenu()">Change mode</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.quiz-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 2.5rem 3rem;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  gap: 1.5rem;
}

.quiz-header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.quiz-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  margin: 0;
}

.quiz-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  max-width: 65ch;
  line-height: 1.6;
  margin: 0;
  border-left: 2px solid var(--bg-border);
  padding-left: 0.75rem;
}

.quiz-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-panel.playing {
  gap: 1.25rem;
}

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

.primary-btn {
  font-size: var(--text-sm);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid transparent;
  background: color-mix(in srgb, var(--accent-cyan) 16%, var(--bg-surface));
  border-color: var(--accent-cyan);
  color: var(--text-primary);
}

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
</style>
