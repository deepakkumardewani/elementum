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
})
