import { describe, expect, it, vi } from "vitest"
import type { Element, TrendProperty } from "@/types/element"

const { mockElements } = vi.hoisted(() => {
  const mockElements: Element[] = [
    {
      name: "Alpha",
      symbol: "A",
      atomicNumber: 1,
      atomicMass: 1,
      category: "alkali metal",
      xpos: 1,
      ypos: 1,
      period: 1,
      group: 1,
      block: "s",
      phase: "Solid",
      electronConfiguration: "",
      electronConfigurationSemantic: "",
      electronShells: [],
      electronegativity: 1,
      atomicRadius: 100,
      ionizationEnergy: 100,
      electronAffinity: null,
      density: 1,
      meltingPoint: 100,
      boilingPoint: 200,
      oxidationStates: "",
      discoverer: null,
      yearDiscovered: 1900,
      spectralLines: [],
      funFacts: [],
      compounds: [],
      summary: "",
    },
    {
      name: "Beta",
      symbol: "B",
      atomicNumber: 2,
      atomicMass: 2,
      category: "noble gas",
      xpos: 18,
      ypos: 1,
      period: 1,
      group: 18,
      block: "p",
      phase: "Gas",
      electronConfiguration: "",
      electronConfigurationSemantic: "",
      electronShells: [],
      electronegativity: 2,
      atomicRadius: 100,
      ionizationEnergy: 200,
      electronAffinity: null,
      density: 2,
      meltingPoint: 50,
      boilingPoint: 100,
      oxidationStates: "",
      discoverer: null,
      yearDiscovered: 1900,
      spectralLines: [],
      funFacts: [],
      compounds: [],
      summary: "",
    },
  ]
  return { mockElements }
})

vi.mock("@/data/elements.json", () => ({
  default: mockElements,
}))

import {
  formatTrendLegendValue,
  getPropertyColor,
  getTrendRange,
  gradientEndpoints,
  TABLE_COLOR_MODE_OPTIONS,
  TREND_PROPERTY_LABELS,
} from "@/composables/usePropertyColor"

describe("usePropertyColor (mocked elements dataset)", () => {
  it("exports labels and table mode options with category first", () => {
    expect(TABLE_COLOR_MODE_OPTIONS[0]?.value).toBe("category")
    expect(Object.keys(TREND_PROPERTY_LABELS).length).toBeGreaterThanOrEqual(7)
  })

  it("getTrendRange returns min/max for a trend property", () => {
    const r = getTrendRange("density")
    expect(r.min).toBe(1)
    expect(r.max).toBe(2)
    const emptyAffinity = getTrendRange("electronAffinity")
    expect(emptyAffinity.min).toBe(0)
    expect(emptyAffinity.max).toBe(1)
  })

  it("getPropertyColor uses category palette in category mode", () => {
    const c = getPropertyColor(mockElements[0], "category")
    expect(c).toContain("--cat-")
  })

  it("getPropertyColor returns neutral when trend value is null", () => {
    const el: Element = { ...mockElements[0], electronegativity: null }
    expect(getPropertyColor(el, "electronegativity")).toBe("#475569")
  })

  it("getPropertyColor interpolates when min < max", () => {
    const hex = getPropertyColor(mockElements[0], "density")
    expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
    expect(hex).not.toBe("#475569")
  })

  it("getPropertyColor uses midpoint gradient when range min equals max", () => {
    const hex = getPropertyColor(mockElements[0], "atomicRadius")
    expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it("gradientEndpoints returns low and high hex strings", () => {
    const [low, high] = gradientEndpoints()
    expect(low).toMatch(/^#[0-9a-f]{6}$/i)
    expect(high).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it("formatTrendLegendValue formats each trend mode", () => {
    expect(formatTrendLegendValue("atomicRadius", 100)).toContain("pm")
    expect(formatTrendLegendValue("electronegativity", 1.234)).toMatch(/1\.23/)
    expect(formatTrendLegendValue("ionizationEnergy", 400)).toContain("kJ/mol")
    expect(formatTrendLegendValue("electronAffinity", 50)).toContain("kJ/mol")
    expect(formatTrendLegendValue("density", 1.2)).toContain("g/cm³")
    expect(formatTrendLegendValue("meltingPoint", 300)).toContain("300")
    expect(formatTrendLegendValue("boilingPoint", 400)).toContain("400")
  })

  it("formatTrendLegendValue default branch stringifies unknown modes", () => {
    const fallback = formatTrendLegendValue("notAMode" as TrendProperty, 99)
    expect(fallback).toBe("99")
  })
})
