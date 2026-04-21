import { describe, expect, it } from "vitest"
import { VISIBLE_MAX, VISIBLE_MIN, wavelengthToRgb } from "./wavelength"

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  if (hex === "transparent") return null
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return null
  return {
    r: Number.parseInt(m[1], 16),
    g: Number.parseInt(m[2], 16),
    b: Number.parseInt(m[3], 16),
  }
}

function requireHex(hex: string): { r: number; g: number; b: number } {
  const result = parseHex(hex)
  if (!result) throw new Error(`Expected valid hex, got ${hex}`)
  return result
}

describe("wavelengthToRgb", () => {
  it("returns transparent outside the visible band", () => {
    expect(wavelengthToRgb(200)).toBe("transparent")
    expect(wavelengthToRgb(VISIBLE_MIN - 1)).toBe("transparent")
    expect(wavelengthToRgb(VISIBLE_MAX + 1)).toBe("transparent")
  })

  it("returns hex for band edges (inclusive)", () => {
    expect(wavelengthToRgb(VISIBLE_MIN)).toMatch(/^#[0-9a-f]{6}$/i)
    expect(wavelengthToRgb(VISIBLE_MAX)).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it("maps hydrogen Balmer alpha (~656.3 nm) to saturated red", () => {
    const hex = wavelengthToRgb(656.3)
    const { r, g, b } = requireHex(hex)
    expect(r).toBeGreaterThan(240)
    expect(g).toBeLessThan(30)
    expect(b).toBeLessThan(30)
  })

  it("maps ~486.1 nm to cyan-blue (blue strongest)", () => {
    const hex = wavelengthToRgb(486.1)
    const { r, g, b } = requireHex(hex)
    expect(b).toBeGreaterThan(g)
    expect(g).toBeGreaterThan(r)
  })

  it("applies intensity falloff in the near-UV edge (380 vs 420)", () => {
    const dim = requireHex(wavelengthToRgb(380))
    const full = requireHex(wavelengthToRgb(420))
    const dimMag = dim.r + dim.g + dim.b
    const fullMag = full.r + full.g + full.b
    expect(dimMag).toBeLessThan(fullMag)
  })

  it("applies intensity falloff in the deep-red edge (700 vs 780)", () => {
    const full = requireHex(wavelengthToRgb(700))
    const dim = requireHex(wavelengthToRgb(780))
    const fullMag = full.r + full.g + full.b
    const dimMag = dim.r + dim.g + dim.b
    expect(dimMag).toBeLessThan(fullMag)
  })

  it("steps through Bruton piecewise segments without throwing", () => {
    const checkpoints = [380, 439.9, 440, 489.9, 490, 509.9, 510, 579.9, 580, 644.9, 645, 780]
    for (const wl of checkpoints) {
      expect(wavelengthToRgb(wl)).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
