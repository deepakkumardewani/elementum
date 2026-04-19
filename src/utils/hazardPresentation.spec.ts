import { describe, expect, it } from "vitest"
import { hazardDisplayLabel, hazardExplanation } from "@/utils/hazardPresentation"

describe("hazardPresentation", () => {
  it("maps every hazard level to a label", () => {
    expect(hazardDisplayLabel("safe")).toBe("Safe / Inert")
    expect(hazardDisplayLabel("flammable")).toBe("Flammable")
    expect(hazardDisplayLabel("toxic")).toBe("Toxic")
    expect(hazardDisplayLabel("radioactive")).toBe("Radioactive")
    expect(hazardDisplayLabel("corrosive")).toBe("Corrosive")
  })

  it("provides static explanations", () => {
    expect(hazardExplanation("toxic").length).toBeGreaterThan(10)
    expect(hazardExplanation("safe")).toContain("GHS")
  })
})
