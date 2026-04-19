import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it } from "vitest"
import { useQuizStore } from "@/stores/quizStore"

describe("quizStore", () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it("updateBestScore only increases stored best per mode", () => {
    const store = useQuizStore()
    expect(store.bestForMode("flashcard")).toBe(0)
    store.updateBestScore("flashcard", 5)
    expect(store.bestForMode("flashcard")).toBe(5)
    store.updateBestScore("flashcard", 3)
    expect(store.bestForMode("flashcard")).toBe(5)
    store.updateBestScore("flashcard", 7)
    expect(store.bestForMode("flashcard")).toBe(7)
  })

  it("tracks independent bests per mode", () => {
    const store = useQuizStore()
    store.updateBestScore("multipleChoice", 4)
    store.updateBestScore("challenge", 9)
    expect(store.bestForMode("multipleChoice")).toBe(4)
    expect(store.bestForMode("challenge")).toBe(9)
    expect(store.bestForMode("flashcard")).toBe(0)
  })
})
