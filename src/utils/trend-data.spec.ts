import { describe, expect, it } from "vitest"
import { TREND_PROPERTY_META } from "./trendData"

describe("TREND_PROPERTY_META", () => {
  it("labels electronegativity with the Pauling scale unit", () => {
    expect(TREND_PROPERTY_META.electronegativity.unit).toBe("Pauling")
  })
})
