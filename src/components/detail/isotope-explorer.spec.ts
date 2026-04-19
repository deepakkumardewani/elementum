import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import IsotopeExplorer from "@/components/detail/IsotopeExplorer.vue"
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

describe("IsotopeExplorer", () => {
  it("shows empty message when isotope list is empty", () => {
    const w = mount(IsotopeExplorer, {
      props: { element: stubElement({ isotopes: [] }) },
    })
    expect(w.text()).toContain("No isotope data available")
  })

  it("renders table rows for isotopes", () => {
    const w = mount(IsotopeExplorer, {
      props: {
        element: stubElement({
          isotopes: [
            {
              massNumber: 12,
              symbol: "12C",
              abundance: 99,
              halfLife: "stable",
              decayMode: null,
            },
            {
              massNumber: 14,
              symbol: "14C",
              abundance: null,
              halfLife: "5730 y",
              decayMode: "B-",
            },
          ],
        }),
      },
    })
    expect(w.findAll("tbody tr").length).toBe(2)
    expect(w.text()).toContain("Stable")
    expect(w.text()).toContain("β⁻")
  })
})
