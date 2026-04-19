import type { Element } from "@/types/element"

export type QuizMode = "flashcard" | "multipleChoice" | "challenge"

export interface FlashcardQuestion {
  readonly kind: "flashcard"
  readonly id: string
  readonly element: Element
}

export interface McqQuestion {
  readonly kind: "mcq"
  readonly id: string
  readonly prompt: string
  readonly options: readonly Element[]
  readonly correctIndex: number
  readonly explanation: string
}

export type QuizQuestion = FlashcardQuestion | McqQuestion
