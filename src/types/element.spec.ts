import { describe, expect, it } from "vitest"
import type { Abundance, Element, HazardLevel, Isotope } from "./element"

describe("DP-0 element type extensions", () => {
  it("Isotope has required structural fields", () => {
    const stable: Isotope = {
      massNumber: 12,
      symbol: "C-12",
      abundance: 98.93,
      halfLife: "stable",
      decayMode: null,
    }
    const unstable: Isotope = {
      massNumber: 14,
      symbol: "C-14",
      abundance: 0,
      halfLife: "5730 y",
      decayMode: "β⁻",
    }
    expect(stable.halfLife).toBe("stable")
    expect(unstable.decayMode).toBe("β⁻")
  })

  it("HazardLevel accepts all union literals", () => {
    const levels: HazardLevel[] = ["safe", "flammable", "toxic", "radioactive", "corrosive"]
    expect(levels).toHaveLength(5)
  })

  it("Abundance maps pipeline-style names via documented fields", () => {
    const a: Abundance = {
      universe: 1,
      sun: null,
      oceans: 2,
      humanBody: 3,
      earthCrust: 4,
      meteorites: null,
    }
    expect(a.universe).toBe(1)
    expect(a.oceans).toBe(2)
    expect(a.humanBody).toBe(3)
    expect(a.earthCrust).toBe(4)
  })

  it("Element accepts optional enriched fields without breaking required shape", () => {
    const minimal: Element = {
      name: "Test",
      symbol: "Ts",
      atomicNumber: 999,
      atomicMass: 1,
      category: "unknown",
      xpos: 1,
      ypos: 1,
      period: 1,
      group: 1,
      block: "s",
      phase: "Unknown",
      electronConfiguration: "1s0",
      electronConfigurationSemantic: "1s0",
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
      isotopes: [
        {
          massNumber: 1,
          symbol: "Ts-1",
          abundance: null,
          halfLife: "stable",
          decayMode: null,
        },
      ],
      etymology: "Test origin",
      industrialUses: ["testing"],
      naturalOccurrence: "lab only",
      hazardLevel: "safe",
      discoveryCountry: null,
      discoveryMethod: null,
      discoveryStory: null,
      storyHeadline: null,
      storyBody: null,
      discovererPortrait: null,
    }
    expect(minimal.isotopes?.[0]?.massNumber).toBe(1)
    expect(minimal.hazardLevel).toBe("safe")
  })
})
