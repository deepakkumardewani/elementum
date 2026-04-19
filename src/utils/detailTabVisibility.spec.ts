import { describe, expect, it } from "vitest"
import type { Element } from "@/types/element"
import {
  hasEtymologyTabContent,
  hasIsotopesTabContent,
  hasRealWorldTabContent,
  hasSafetyTabContent,
  visibleDetailTabIds,
} from "@/utils/detailTabVisibility"

function minimalElement(overrides: Partial<Element>): Element {
  return {
    name: "X",
    symbol: "X",
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

describe("detailTabVisibility", () => {
  it("detects etymology tab from etymology text", () => {
    expect(hasEtymologyTabContent(minimalElement({ etymology: "  Named after X  " }))).toBe(true)
  })

  it("detects etymology tab from discoverer only", () => {
    expect(hasEtymologyTabContent(minimalElement({ discoverer: "H. Smith" }))).toBe(true)
  })

  it("detects etymology tab from year", () => {
    expect(hasEtymologyTabContent(minimalElement({ yearDiscovered: 1772 }))).toBe(true)
  })

  it("hides etymology tab when all fields empty", () => {
    expect(
      hasEtymologyTabContent(
        minimalElement({
          etymology: null,
          discoveryStory: null,
          discoverer: null,
          yearDiscovered: null,
          discoveryCountry: null,
          discoveryMethod: null,
        }),
      ),
    ).toBe(false)
  })

  it("detects real world tab from uses or occurrence", () => {
    expect(hasRealWorldTabContent(minimalElement({ industrialUses: ["a"] }))).toBe(true)
    expect(hasRealWorldTabContent(minimalElement({ naturalOccurrence: " Air " }))).toBe(true)
    expect(
      hasRealWorldTabContent(minimalElement({ industrialUses: [], naturalOccurrence: null })),
    ).toBe(false)
  })

  it("detects isotopes tab only when array present", () => {
    expect(hasIsotopesTabContent(minimalElement({ isotopes: [] }))).toBe(true)
    expect(hasIsotopesTabContent(minimalElement({ isotopes: undefined }))).toBe(false)
  })

  it("safety tab always on", () => {
    expect(hasSafetyTabContent(minimalElement({}))).toBe(true)
  })

  it("visibleDetailTabIds orders tabs", () => {
    const el = minimalElement({
      isotopes: [],
      etymology: "e",
      industrialUses: ["x"],
    })
    expect(visibleDetailTabIds(el)).toEqual([
      "overview",
      "isotopes",
      "etymology",
      "realWorld",
      "safety",
    ])
  })
})
