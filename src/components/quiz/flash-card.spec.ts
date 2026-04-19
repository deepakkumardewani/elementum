import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FlashCard from "@/components/quiz/FlashCard.vue"
import type { Element } from "@/types/element"

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
  funFacts: ["Lightest element"],
  compounds: [],
  summary: "Hydrogen summary.",
}

describe("FlashCard", () => {
  it("mounts and shows symbol on front", () => {
    const wrapper = mount(FlashCard, { props: { element: H } })
    expect(wrapper.text()).toContain("H")
    expect(wrapper.text()).toContain("Hydrogen")
  })
})
