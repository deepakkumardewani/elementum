import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import SafetySection from "@/components/detail/SafetySection.vue"
import type { Element } from "@/types/element"

function stubElement(overrides: Partial<Element>): Element {
  return {
    name: "Test",
    symbol: "T",
    atomicNumber: 1,
    atomicMass: 1,
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
    electronegativity: 1,
    atomicRadius: 1,
    ionizationEnergy: 1,
    electronAffinity: 1,
    density: 1,
    meltingPoint: 1,
    boilingPoint: 1,
    oxidationStates: null,
    discoverer: null,
    yearDiscovered: null,
    spectralLines: [],
    funFacts: [],
    compounds: [],
    summary: "",
    ...overrides,
  }
}

describe("SafetySection", () => {
  it("shows fallback when hazard is missing", () => {
    const w = mount(SafetySection, {
      props: { element: stubElement({ hazardLevel: undefined }) },
    })
    expect(w.text()).toContain("Hazard data unavailable")
  })

  it("shows toxic label for toxic hazard", () => {
    const w = mount(SafetySection, {
      props: { element: stubElement({ hazardLevel: "toxic" }) },
    })
    expect(w.text()).toContain("Toxic")
  })
})
