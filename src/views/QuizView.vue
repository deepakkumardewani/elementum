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
import QuizScoreboard from "@/components/quiz/QuizScoreboard.vue"
import MultipleChoiceCard from "@/components/quiz/MultipleChoiceCard.vue"
import QuizResults from "@/components/quiz/QuizResults.vue"

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

const resultsBest = computed(() => (mode.value ? bestScores.value[mode.value] : 0))
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

    <section v-else-if="phase === 'playing' && mode" class="quiz-panel playing">
      <QuizScoreboard
        :progress-label="progressLabel"
        :score="score"
        :streak="streak"
        :mode="mode"
        @exit="backToMenu"
      />

      <FlashCard
        v-if="flashElement"
        :key="flashElement.atomicNumber"
        :element="flashElement"
        @correct="recordFlashcardAnswer(true)"
        @incorrect="recordFlashcardAnswer(false)"
        @skip="skipFlashcard()"
      />

      <MultipleChoiceCard
        v-else-if="mcqQuestion"
        :question="mcqQuestion"
        :picked-index="mcqPicked"
        :mode="mode"
        @pick="onMcqPick"
        @next="nextMcqAfterReveal"
      />
    </section>

    <QuizResults
      v-else
      :score="score"
      :max-streak="maxStreak"
      :mode="mode"
      :best-for-mode="resultsBest"
      @play-again="playAgain"
      @change-mode="backToMenu"
    />
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
</style>
