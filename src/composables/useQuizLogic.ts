import { storeToRefs } from "pinia"
import { computed, onUnmounted, ref } from "vue"
import { useElementStore } from "@/stores/elementStore"
import { useQuizStore } from "@/stores/quizStore"
import type { McqQuestion, QuizMode, QuizQuestion } from "@/types/quiz"
import { createSeededRandom, generateQuizDeck } from "@/utils/quizGenerator"

const CHALLENGE_SECONDS = 60

export type QuizPhase = "menu" | "playing" | "results"

function mixSeed(a: number, b: number): number {
  return (a ^ (b * 2654435761)) >>> 0
}

export function useQuizLogic() {
  const elementStore = useElementStore()
  const quizStore = useQuizStore()
  const { elements } = storeToRefs(elementStore)

  const phase = ref<QuizPhase>("menu")
  const mode = ref<QuizMode | null>(null)
  const questions = ref<QuizQuestion[]>([])
  const index = ref(0)
  const score = ref(0)
  const streak = ref(0)
  const maxStreak = ref(0)
  const challengeSecondsLeft = ref(CHALLENGE_SECONDS)
  let challengeTimer: ReturnType<typeof setInterval> | null = null

  const currentQuestion = computed(() => questions.value[index.value] ?? null)
  const progressLabel = computed(() => {
    if (!questions.value.length) return ""
    if (mode.value === "challenge") return `Time ${challengeSecondsLeft.value}s`
    return `${Math.min(index.value + 1, questions.value.length)} / ${questions.value.length}`
  })

  function clearChallengeTimer() {
    if (challengeTimer) {
      clearInterval(challengeTimer)
      challengeTimer = null
    }
  }

  onUnmounted(() => {
    clearChallengeTimer()
  })

  function bumpStreak(correct: boolean) {
    if (correct) {
      streak.value += 1
      if (streak.value > maxStreak.value) maxStreak.value = streak.value
    } else {
      streak.value = 0
    }
  }

  function appendChallengeQuestions() {
    const seed = mixSeed(Date.now(), index.value)
    const rng = createSeededRandom(seed || 1)
    const more = generateQuizDeck(elements.value, "challenge", rng)
    questions.value = [...questions.value, ...more]
  }

  function advanceOrFinish() {
    const m = mode.value
    if (!m) return

    if (m === "challenge") {
      index.value += 1
      if (index.value >= questions.value.length) appendChallengeQuestions()
      return
    }

    if (index.value >= questions.value.length - 1) {
      endRound()
      return
    }
    index.value += 1
  }

  function startQuiz(nextMode: QuizMode) {
    clearChallengeTimer()
    const rng = createSeededRandom(mixSeed(Date.now(), nextMode.length))
    const deck = generateQuizDeck(elements.value, nextMode, rng)
    if (!deck.length) return

    mode.value = nextMode
    questions.value = deck
    index.value = 0
    score.value = 0
    streak.value = 0
    maxStreak.value = 0
    phase.value = "playing"

    if (nextMode === "challenge") {
      challengeSecondsLeft.value = CHALLENGE_SECONDS
      challengeTimer = setInterval(() => {
        challengeSecondsLeft.value -= 1
        if (challengeSecondsLeft.value <= 0) {
          clearChallengeTimer()
          endRound()
        }
      }, 1000)
    }
  }

  function recordFlashcardAnswer(wasCorrect: boolean) {
    if (wasCorrect) score.value += 1
    bumpStreak(wasCorrect)
    advanceOrFinish()
  }

  function skipFlashcard() {
    advanceOrFinish()
  }

  function recordMcqAnswer(question: McqQuestion, selectedIndex: number) {
    const ok = selectedIndex === question.correctIndex
    if (ok) score.value += 1
    bumpStreak(ok)
    if (mode.value === "challenge") advanceOrFinish()
  }

  function nextMcqAfterReveal() {
    advanceOrFinish()
  }

  function endRound() {
    clearChallengeTimer()
    if (mode.value !== null) quizStore.updateBestScore(mode.value, score.value)
    phase.value = "results"
  }

  function backToMenu() {
    clearChallengeTimer()
    phase.value = "menu"
    mode.value = null
    questions.value = []
    index.value = 0
  }

  function playAgain() {
    const m = mode.value
    if (!m) return
    startQuiz(m)
  }

  return {
    phase,
    mode,
    questions,
    index,
    score,
    streak,
    maxStreak,
    challengeSecondsLeft,
    currentQuestion,
    progressLabel,
    startQuiz,
    recordFlashcardAnswer,
    skipFlashcard,
    recordMcqAnswer,
    nextMcqAfterReveal,
    endRound,
    backToMenu,
    playAgain,
  }
}
