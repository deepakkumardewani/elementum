import { describe, expect, it } from "vitest"
import type { Element } from "../types/element"
import { mergeAbundance, mergeElementEnrichment } from "./elementMerge"

function minimalElement(overrides: Partial<Element> = {}): Element {
  return {
    name: "X",
    symbol: "X",
    atomicNumber: 1,
    atomicMass: 1,
    category: "unknown",
    xpos: 1,
    ypos: 1,
    period: 1,
    group: 1,
    block: "s",
    phase: "Unknown",
    electronConfiguration: "1s1",
    electronConfigurationSemantic: "1s1",
    electronShells: [1],
    electronegativity: null,
    atomicRadius: null,
    ionizationEnergy: null,
    electronAffinity: null,
    density: null,
    meltingPoint: null,
    boilingPoint: null,
    oxidationStates: null,
    spectralLines: [],
    funFacts: [],
    compounds: [],
    summary: "",
    discoverer: null,
    yearDiscovered: null,
    ...overrides,
  }
}

describe("mergeAbundance", () => {
  it("does not clobber existing values with null patches", () => {
    const base = {
      universe: 1,
      sun: null,
      oceans: null,
      humanBody: 2,
      earthCrust: 3,
      meteorites: null,
    }
    const patch = {
      universe: null as number | null,
      earthCrust: 5 as number | null,
    }
    const m = mergeAbundance(base, patch)
    expect(m?.universe).toBe(1)
    expect(m?.earthCrust).toBe(5)
    expect(m?.humanBody).toBe(2)
  })
})

describe("mergeElementEnrichment", () => {
  it("keeps base discoverer when patch discoverer is null", () => {
    const base = minimalElement({ discoverer: "Alice" })
    const out = mergeElementEnrichment(base, { discoverer: null })
    expect(out.discoverer).toBe("Alice")
  })

  it("applies non-null hazard and isotope patches", () => {
    const base = minimalElement({ atomicNumber: 6 })
    const out = mergeElementEnrichment(base, {
      hazardLevel: "toxic",
      isotopes: [
        {
          massNumber: 12,
          symbol: "C-12",
          abundance: 98.9,
          halfLife: "stable",
          decayMode: null,
        },
      ],
    })
    expect(out.hazardLevel).toBe("toxic")
    expect(out.isotopes?.[0]?.symbol).toBe("C-12")
  })
})
