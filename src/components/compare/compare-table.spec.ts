import { shallowMount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import type { Element } from "@/types/element"
import CompareTable from "./CompareTable.vue"

function baseElement(overrides: Partial<Element>): Element {
  return {
    name: "Iron",
    symbol: "Fe",
    atomicNumber: 26,
    atomicMass: 55.845,
    category: "transition metal",
    xpos: 8,
    ypos: 4,
    period: 4,
    group: 8,
    block: "d",
    phase: "Solid",
    electronConfiguration: "[Ar] 3d6 4s2",
    electronConfigurationSemantic: "[Ar] 3d6 4s2",
    electronShells: [2, 8, 14, 2],
    electronegativity: 1.83,
    atomicRadius: 126,
    ionizationEnergy: 762.5,
    electronAffinity: 15.7,
    density: 7.874,
    meltingPoint: 1811,
    boilingPoint: 3134,
    oxidationStates: "0, +2, +3",
    spectralLines: [],
    funFacts: [],
    compounds: [],
    summary: "",
    discoverer: null,
    yearDiscovered: null,
    ...overrides,
  }
}

describe("CompareTable", () => {
  it("mounts and shows Group C property rows for Fe vs Cu", () => {
    const elementA = baseElement({
      name: "Iron",
      symbol: "Fe",
      vanDerWaalsRadius: 194,
      thermalConductivity: 80.2,
      mohsHardness: 4,
      crystalStructure: "body-centered cubic",
    })
    const elementB = baseElement({
      name: "Copper",
      symbol: "Cu",
      atomicNumber: 29,
      atomicMass: 63.546,
      vanDerWaalsRadius: 196,
      thermalConductivity: 401,
      mohsHardness: 3,
      crystalStructure: "face-centered cubic",
    })

    const w = shallowMount(CompareTable, {
      props: { elementA, elementB },
    })

    const text = w.text()
    expect(text).toContain("Van der Waals Radius")
    expect(text).toContain("Thermal Conductivity")
    expect(text).toContain("Mohs Hardness")
    expect(text).toContain("Crystal Structure")
  })
})
