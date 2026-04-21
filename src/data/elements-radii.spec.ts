import { describe, expect, it } from "vitest"
import elements from "@/data/elements.json"
import type { Element } from "@/types/element"

describe("elements.json radii", () => {
  const list = elements as Element[]

  it("has no negative vanDerWaalsRadius values", () => {
    for (const el of list) {
      if (typeof el.vanDerWaalsRadius === "number") {
        expect(el.vanDerWaalsRadius, el.symbol).toBeGreaterThan(0)
      }
    }
  })

  it("has no negative atomicRadius values", () => {
    for (const el of list) {
      if (typeof el.atomicRadius === "number") {
        expect(el.atomicRadius, el.symbol).toBeGreaterThan(0)
      }
    }
  })
})
