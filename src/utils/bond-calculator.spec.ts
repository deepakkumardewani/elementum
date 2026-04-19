import { describe, expect, it } from "vitest"
import { analyzeBond, findLikelySharedCompound } from "@/utils/bondCalculator"

describe("analyzeBond", () => {
  it("classifies H–H as nonpolar covalent", () => {
    const r = analyzeBond(2.2, 2.2)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.analysis.kind).toBe("nonpolar-covalent")
    expect(r.analysis.difference).toBe(0)
  })

  it("classifies Na–Cl as ionic", () => {
    const r = analyzeBond(0.93, 3.16)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.analysis.kind).toBe("ionic")
    expect(r.analysis.difference).toBeCloseTo(2.23, 2)
  })

  it("classifies H–O as polar covalent", () => {
    const r = analyzeBond(2.2, 3.44)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.analysis.kind).toBe("polar-covalent")
    expect(r.analysis.difference).toBeCloseTo(1.24, 2)
  })

  it("fails when an electronegativity is null", () => {
    const r = analyzeBond(null, 3.0)
    expect(r.ok).toBe(false)
  })
})

describe("findLikelySharedCompound", () => {
  it("returns exact shared entry for Na and Cl", () => {
    const na = {
      symbol: "Na",
      compounds: ["NaCl (Table Salt)", "NaOH (Sodium Hydroxide / Lye)"],
    }
    const cl = {
      symbol: "Cl",
      compounds: ["NaCl (Table Salt)", "HCl (Hydrochloric Acid)"],
    }
    expect(findLikelySharedCompound(na, cl)).toBe("NaCl (Table Salt)")
  })

  it("returns H₂O line for H and O", () => {
    const h = {
      symbol: "H",
      compounds: ["H₂O (Water)", "NH₃ (Ammonia)"],
    }
    const o = {
      symbol: "O",
      compounds: ["H₂O (Water)", "CO₂ (Carbon Dioxide)"],
    }
    expect(findLikelySharedCompound(h, o)).toBe("H₂O (Water)")
  })

  it("returns null when nothing matches", () => {
    const a = { symbol: "He", compounds: ["none"] }
    const b = { symbol: "Ne", compounds: ["also none"] }
    expect(findLikelySharedCompound(a, b)).toBe(null)
  })
})
