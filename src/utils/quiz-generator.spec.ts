import { describe, expect, it } from "vitest"
import type { Element } from "@/types/element"
import {
  assertMcqHasUniqueOptions,
  createSeededRandom,
  generateFlashcardDeck,
  generateMcqDeck,
  generateQuizDeck,
  generateSingleMcqQuestion,
  pickDistractorElements,
} from "@/utils/quizGenerator"

const H: Element = {
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
  funFacts: [],
  compounds: [],
  summary: "Hydrogen summary.",
}

const HE: Element = {
  ...H,
  name: "Helium",
  symbol: "He",
  atomicNumber: 2,
  atomicMass: 4.0026,
  category: "noble gas",
  xpos: 18,
  ypos: 1,
  period: 1,
  group: 18,
  electronegativity: null,
  meltingPoint: null,
  boilingPoint: 4.22,
}

const LI: Element = {
  ...H,
  name: "Lithium",
  symbol: "Li",
  atomicNumber: 3,
  atomicMass: 6.94,
  category: "alkali metal",
  xpos: 1,
  ypos: 2,
  period: 2,
  group: 1,
  electronegativity: 0.98,
}

const BE: Element = {
  ...H,
  name: "Beryllium",
  symbol: "Be",
  atomicNumber: 4,
  atomicMass: 9.0122,
  category: "alkaline earth metal",
  xpos: 2,
  ypos: 2,
  period: 2,
  group: 2,
  electronegativity: 1.57,
}

const B: Element = {
  ...H,
  name: "Boron",
  symbol: "B",
  atomicNumber: 5,
  atomicMass: 10.81,
  category: "metalloid",
  xpos: 13,
  ypos: 2,
  period: 2,
  group: 13,
  electronegativity: 2.04,
}

const C: Element = {
  ...H,
  name: "Carbon",
  symbol: "C",
  atomicNumber: 6,
  atomicMass: 12.011,
  category: "nonmetal",
  xpos: 14,
  ypos: 2,
  period: 2,
  group: 14,
  electronegativity: 2.55,
}

const N: Element = {
  ...H,
  name: "Nitrogen",
  symbol: "N",
  atomicNumber: 7,
  atomicMass: 14.007,
  category: "nonmetal",
  xpos: 15,
  ypos: 2,
  period: 2,
  group: 15,
  electronegativity: 3.04,
}

const O: Element = {
  ...H,
  name: "Oxygen",
  symbol: "O",
  atomicNumber: 8,
  atomicMass: 15.999,
  category: "nonmetal",
  xpos: 16,
  ypos: 2,
  period: 2,
  group: 16,
  electronegativity: 3.44,
}

const F: Element = {
  ...H,
  name: "Fluorine",
  symbol: "F",
  atomicNumber: 9,
  atomicMass: 18.998,
  category: "halogen",
  xpos: 17,
  ypos: 2,
  period: 2,
  group: 17,
  electronegativity: 3.98,
}

const NE: Element = {
  ...H,
  name: "Neon",
  symbol: "Ne",
  atomicNumber: 10,
  atomicMass: 20.18,
  category: "noble gas",
  xpos: 18,
  ypos: 2,
  period: 2,
  group: 18,
  electronegativity: null,
}

const FIXTURE: Element[] = [H, HE, LI, BE, B, C, N, O, F, NE]

describe("quizGenerator", () => {
  it("createSeededRandom is deterministic for the same seed", () => {
    const a = createSeededRandom(42)
    const b = createSeededRandom(42)
    expect(a.next()).toBeCloseTo(b.next(), 5)
    expect(a.next()).toBeCloseTo(b.next(), 5)
  })

  it("pickDistractorElements excludes the correct element and returns unique picks", () => {
    const rng = createSeededRandom(7)
    const d = pickDistractorElements(F, FIXTURE, 3, rng)
    expect(d).toHaveLength(3)
    expect(d.every((e) => e.atomicNumber !== F.atomicNumber)).toBe(true)
    expect(new Set(d.map((e) => e.atomicNumber)).size).toBe(3)
  })

  it("generateSingleMcqQuestion returns a valid MCQ for period-2 EN extremes", () => {
    const rng = createSeededRandom(99)
    let found = false
    for (let i = 0; i < 80; i++) {
      const q = generateSingleMcqQuestion(FIXTURE, rng)
      if (!q) continue
      expect(q.options).toHaveLength(4)
      expect(assertMcqHasUniqueOptions(q)).toBe(true)
      expect(q.options[q.correctIndex]?.atomicNumber).toBeDefined()
      found = true
      break
    }
    expect(found).toBe(true)
  })

  it("generateMcqDeck yields questions whose correct answer is always in options", () => {
    const rng = createSeededRandom(123)
    const deck = generateMcqDeck(FIXTURE, 12, rng)
    expect(deck.length).toBeGreaterThan(0)
    for (const q of deck) {
      const correct = q.options[q.correctIndex]
      expect(correct).toBeDefined()
      if (!correct) continue
      expect(q.options.map((e) => e.symbol).includes(correct.symbol)).toBe(true)
    }
  })

  it("generateFlashcardDeck respects size and uses shuffled elements", () => {
    const rng = createSeededRandom(3)
    const deck = generateFlashcardDeck(FIXTURE, 4, rng)
    expect(deck).toHaveLength(4)
    expect(deck.every((q) => q.kind === "flashcard")).toBe(true)
    expect(new Set(deck.map((q) => q.element.atomicNumber)).size).toBe(4)
  })

  it("generateQuizDeck returns flashcards or mcqs depending on mode", () => {
    const rng = createSeededRandom(11)
    const flash = generateQuizDeck(FIXTURE, "flashcard", rng, 5)
    expect(flash.every((q) => q.kind === "flashcard")).toBe(true)

    const rng2 = createSeededRandom(11)
    const mcq = generateQuizDeck(FIXTURE, "multipleChoice", rng2, 6)
    expect(mcq.every((q) => q.kind === "mcq")).toBe(true)

    const rng3 = createSeededRandom(11)
    const ch = generateQuizDeck(FIXTURE, "challenge", rng3)
    expect(ch.length).toBeGreaterThan(10)
    expect(ch.every((q) => q.kind === "mcq")).toBe(true)
  })
})
