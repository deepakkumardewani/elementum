import { describe, expect, it } from "vitest"
import { formatAbundancePercent, formatDecayMode, isStableHalfLife } from "@/utils/isotopeDisplay"

describe("isotopeDisplay", () => {
  it("detects stable half-life strings", () => {
    expect(isStableHalfLife("stable")).toBe(true)
    expect(isStableHalfLife(" Stable ")).toBe(true)
    expect(isStableHalfLife("5.3 ms")).toBe(false)
  })

  it("formats decay modes", () => {
    expect(formatDecayMode("B-")).toBe("β⁻")
    expect(formatDecayMode(null)).toBe("—")
    expect(formatDecayMode("EC")).toBe("EC")
  })

  it("formats abundance", () => {
    expect(formatAbundancePercent(98.94)).toBe("98.94%")
    expect(formatAbundancePercent(null)).toBe("—")
    expect(formatAbundancePercent(0.001)).toBe("<0.01%")
  })
})
