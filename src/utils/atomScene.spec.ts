import { describe, expect, it } from "vitest"
import {
  buildNucleus,
  electronPositions,
  MAX_ELECTRONS_PER_SHELL,
  MAX_NUCLEUS_PARTICLES,
} from "@/utils/atomScene"

describe("electronPositions", () => {
  it("returns empty array for zero or negative effective count", () => {
    expect(electronPositions(1, 0)).toEqual([])
    expect(electronPositions(1, -3)).toEqual([])
  })

  it("places all electrons on one ring when count is at most 16", () => {
    const r = 0.6
    const one = electronPositions(r, 1)
    expect(one).toHaveLength(1)
    expect(one[0]).toEqual([r, 0, 0])

    const eight = electronPositions(r, 8)
    expect(eight).toHaveLength(8)
    for (const p of eight) {
      const dist = Math.hypot(p[0], p[2])
      expect(dist).toBeCloseTo(r, 5)
      expect(p[1]).toBe(0)
    }

    const sixteen = electronPositions(r, 16)
    expect(sixteen).toHaveLength(16)
  })

  it("splits into inner (10) and outer rings when count exceeds 16", () => {
    const r = 1
    const pts = electronPositions(r, 17)
    expect(pts).toHaveLength(17)
    const inner = pts.slice(0, 10)
    const outer = pts.slice(10)
    for (const p of inner) {
      expect(Math.hypot(p[0], p[2])).toBeCloseTo(r, 5)
    }
    for (const p of outer) {
      expect(Math.hypot(p[0], p[2])).toBeCloseTo(r + 0.08, 5)
    }
  })

  it("caps at MAX_ELECTRONS_PER_SHELL", () => {
    expect(electronPositions(1, 100)).toHaveLength(MAX_ELECTRONS_PER_SHELL)
  })
})

describe("buildNucleus", () => {
  it("hydrogen: one proton and no neutrons", () => {
    const p = buildNucleus(1, 1.008)
    expect(p).toHaveLength(1)
    expect(p[0].color).toBe("#ef4444")
  })

  it("carbon: shows all protons and neutrons when total is within cap", () => {
    const p = buildNucleus(6, 12.011)
    expect(p).toHaveLength(12)
    const reds = p.filter((x) => x.color === "#ef4444").length
    const blues = p.filter((x) => x.color === "#3b82f6").length
    expect(reds).toBe(6)
    expect(blues).toBe(6)
  })

  it("gold: downsamples to MAX_NUCLEUS_PARTICLES with ~proton fraction", () => {
    const p = buildNucleus(79, 196.9665695)
    expect(p).toHaveLength(MAX_NUCLEUS_PARTICLES)
    const reds = p.filter((x) => x.color === "#ef4444").length
    const blues = p.filter((x) => x.color === "#3b82f6").length
    expect(reds + blues).toBe(MAX_NUCLEUS_PARTICLES)
    expect(reds).toBe(
      Math.round((79 / (79 + Math.round(196.9665695) - 79)) * MAX_NUCLEUS_PARTICLES),
    )
    expect(blues).toBe(MAX_NUCLEUS_PARTICLES - reds)
  })

  it("oganesson nucleus sphere is larger than carbon (same scale factor formula)", () => {
    const c = buildNucleus(6, 12.011)
    const og = buildNucleus(118, 294)
    const maxDist = (parts: typeof c) =>
      Math.max(...parts.map((n) => Math.hypot(n.pos[0], n.pos[1], n.pos[2])))
    expect(maxDist(og)).toBeGreaterThan(maxDist(c))
  })

  it("keeps neutrons non-negative when atomic mass rounds low", () => {
    const p = buildNucleus(26, 26.0)
    expect(p.every((x) => x.color === "#ef4444")).toBe(true)
  })
})
