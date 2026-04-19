import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import MultipleChoiceCard from "@/components/quiz/MultipleChoiceCard.vue"
import type { Element } from "@/types/element"
import type { McqQuestion } from "@/types/quiz"

const E1: Element = {
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
  summary: "Hydrogen.",
}

const E2: Element = {
  ...E1,
  name: "Helium",
  symbol: "He",
  atomicNumber: 2,
  atomicMass: 4,
}

const Q: McqQuestion = {
  kind: "mcq",
  id: "test-q",
  prompt: "Which is H?",
  options: [E1, E2],
  correctIndex: 0,
  explanation: "Hydrogen is H.",
}

describe("MultipleChoiceCard", () => {
  it("mounts and lists options", () => {
    const wrapper = mount(MultipleChoiceCard, {
      props: {
        question: Q,
        pickedIndex: null,
        mode: "multipleChoice",
      },
    })
    expect(wrapper.findAll(".mcq-opt")).toHaveLength(2)
  })
})
