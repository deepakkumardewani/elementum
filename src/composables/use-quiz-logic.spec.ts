import { createTestingPinia } from "@pinia/testing"
import { mount } from "@vue/test-utils"
import { storeToRefs } from "pinia"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defineComponent, nextTick } from "vue"
import { useQuizLogic } from "@/composables/useQuizLogic"
import elementData from "@/data/elements.json"
import { useElementStore } from "@/stores/elementStore"
import { useQuizStore } from "@/stores/quizStore"
import type { Element } from "@/types/element"
import * as quizGenerator from "@/utils/quizGenerator"

const SAMPLE: Element[] = [
  {
    name: "Hydrogen",
    symbol: "H",
    atomicNumber: 1,
    atomicMass: 1.008,
    category: "nonmetal",
    xpos: 1,
    ypos: 1,
    period: 1,
    group: 1,
    block: "s",
    phase: "Gas",
    electronConfiguration: "1s1",
    electronConfigurationSemantic: "1s1",
    electronShells: [1],
    electronegativity: 2.2,
    atomicRadius: 53,
    ionizationEnergy: 1312,
    electronAffinity: 72.769,
    density: 0.08988,
    meltingPoint: 13.99,
    boilingPoint: 20.271,
    oxidationStates: "-1, 0, +1",
    discoverer: "Henry Cavendish",
    yearDiscovered: 1766,
    spectralLines: [],
    funFacts: ["Lightest element"],
    compounds: [],
    summary: "Hydrogen summary.",
  },
  {
    name: "Helium",
    symbol: "He",
    atomicNumber: 2,
    atomicMass: 4.0026,
    category: "noble gas",
    xpos: 18,
    ypos: 1,
    period: 1,
    group: 18,
    block: "s",
    phase: "Gas",
    electronConfiguration: "1s2",
    electronConfigurationSemantic: "1s2",
    electronShells: [2],
    electronegativity: null,
    atomicRadius: 31,
    ionizationEnergy: 2372,
    electronAffinity: null,
    density: 0.1785,
    meltingPoint: null,
    boilingPoint: 4.22,
    oxidationStates: "0",
    discoverer: "Pierre Janssen",
    yearDiscovered: 1868,
    spectralLines: [],
    funFacts: ["First observed in the Sun"],
    compounds: [],
    summary: "Helium summary.",
  },
]

const Harness = defineComponent({
  setup() {
    const quiz = useQuizLogic()
    return { quiz }
  },
  template: "<div />",
})

interface HarnessVm {
  quiz: ReturnType<typeof useQuizLogic>
}

describe("useQuizLogic", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows question progress for non-challenge modes", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = SAMPLE

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("flashcard")
    await nextTick()
    expect(vm.quiz.progressLabel.value).toMatch(/\d+\s*\/\s*\d+/)
  })

  it("clears the challenge interval on unmount", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = elementData as Element[]

    const clearSpy = vi.spyOn(globalThis, "clearInterval")
    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("challenge")
    await nextTick()
    wrapper.unmount()
    await nextTick()

    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })

  it("starts a flashcard session and advances score on correct answer", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = SAMPLE

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("flashcard")
    await nextTick()
    expect(vm.quiz.phase.value).toBe("playing")
    expect(vm.quiz.currentQuestion.value?.kind).toBe("flashcard")

    vm.quiz.recordFlashcardAnswer(true)
    await nextTick()
    expect(vm.quiz.score.value).toBe(1)
    expect(vm.quiz.streak.value).toBe(1)
  })

  it("ends challenge mode when the timer reaches zero", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = elementData as Element[]
    const quizStore = useQuizStore(pinia)

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("challenge")
    await nextTick()
    expect(vm.quiz.phase.value).toBe("playing")

    vi.advanceTimersByTime(60_000)
    await nextTick()

    expect(vm.quiz.phase.value).toBe("results")
    quizStore.updateBestScore("challenge", vm.quiz.score.value)
    expect(quizStore.bestForMode("challenge")).toBeGreaterThanOrEqual(0)
  })

  it("recordMcqAnswer advances during challenge mode", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = elementData as Element[]

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("challenge")
    await nextTick()
    const q = vm.quiz.currentQuestion.value
    expect(q?.kind).toBe("mcq")
    if (q?.kind !== "mcq") throw new Error("expected mcq")

    vm.quiz.recordMcqAnswer(q, q.correctIndex)
    await nextTick()
    expect(vm.quiz.index.value).toBe(1)
  })

  it("appendChallengeQuestions extends the deck when challenge questions run out", async () => {
    const mcq = (idx: string) =>
      ({
        kind: "mcq" as const,
        id: `id-${idx}`,
        prompt: "p",
        options: [SAMPLE[0], SAMPLE[1], elementData[2] as Element, elementData[3] as Element],
        correctIndex: 0,
        explanation: "e",
      }) as const

    const spy = vi
      .spyOn(quizGenerator, "generateQuizDeck")
      .mockReturnValueOnce([mcq("a")])
      .mockReturnValueOnce([mcq("b")])

    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = elementData as Element[]

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("challenge")
    await nextTick()
    expect(vm.quiz.questions.value).toHaveLength(1)

    const q = vm.quiz.currentQuestion.value
    expect(q?.kind).toBe("mcq")
    if (q?.kind !== "mcq") throw new Error("expected mcq")
    vm.quiz.recordMcqAnswer(q, q.correctIndex)
    await nextTick()

    expect(vm.quiz.questions.value.length).toBeGreaterThan(1)
    spy.mockRestore()
  })

  it("does not start a quiz when the deck is empty", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = []

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("flashcard")
    await nextTick()
    expect(vm.quiz.phase.value).toBe("menu")
  })

  it("skips a flashcard without changing the score", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = SAMPLE

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("flashcard")
    await nextTick()
    vm.quiz.skipFlashcard()
    await nextTick()
    expect(vm.quiz.score.value).toBe(0)
    expect(vm.quiz.index.value).toBe(1)
  })

  it("resets streak on an incorrect flashcard answer", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = SAMPLE

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("flashcard")
    await nextTick()
    vm.quiz.recordFlashcardAnswer(true)
    await nextTick()
    expect(vm.quiz.streak.value).toBe(1)
    vm.quiz.recordFlashcardAnswer(false)
    await nextTick()
    expect(vm.quiz.streak.value).toBe(0)
  })

  it("advances through MCQ via recordMcqAnswer and nextMcqAfterReveal", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = elementData as Element[]

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("multipleChoice")
    await nextTick()
    const q = vm.quiz.currentQuestion.value
    expect(q?.kind).toBe("mcq")

    if (q?.kind === "mcq") {
      vm.quiz.recordMcqAnswer(q, q.correctIndex)
      await nextTick()
      expect(vm.quiz.score.value).toBe(1)
      vm.quiz.nextMcqAfterReveal()
      await nextTick()
      expect(vm.quiz.index.value).toBe(1)
    }
  })

  it("restarts the same mode from results via playAgain", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = SAMPLE

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("flashcard")
    await nextTick()
    vm.quiz.endRound()
    await nextTick()
    expect(vm.quiz.phase.value).toBe("results")

    vm.quiz.playAgain()
    await nextTick()
    expect(vm.quiz.phase.value).toBe("playing")
    expect(vm.quiz.mode.value).toBe("flashcard")
  })

  it("returns to the menu via backToMenu", async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = SAMPLE

    const wrapper = mount(Harness, { global: { plugins: [pinia] } })
    const vm = wrapper.vm as HarnessVm

    vm.quiz.startQuiz("flashcard")
    await nextTick()
    vm.quiz.endRound()
    await nextTick()
    vm.quiz.backToMenu()
    await nextTick()
    expect(vm.quiz.phase.value).toBe("menu")
    expect(vm.quiz.mode.value).toBe(null)
  })
})
