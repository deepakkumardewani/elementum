import { useLocalStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import type { QuizMode } from "@/types/quiz"

const STORAGE_KEY = "elementum-quiz-best"

export interface QuizBestScores {
  flashcard: number
  multipleChoice: number
  challenge: number
}

const DEFAULT_SCORES: QuizBestScores = {
  flashcard: 0,
  multipleChoice: 0,
  challenge: 0,
}

export const useQuizStore = defineStore("quiz", () => {
  const bestScores = useLocalStorage<QuizBestScores>(STORAGE_KEY, {
    ...DEFAULT_SCORES,
  })

  function bestForMode(quizMode: QuizMode): number {
    return bestScores.value[quizMode]
  }

  function updateBestScore(quizMode: QuizMode, score: number) {
    if (score <= bestScores.value[quizMode]) return
    bestScores.value = { ...bestScores.value, [quizMode]: score }
  }

  return {
    bestScores,
    bestForMode,
    updateBestScore,
  }
})
