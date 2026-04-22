import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import ElementHeader from "@/components/detail/ElementHeader.vue"
import { baseElement } from "@/components/tools/test-element-fixture"

describe("ElementHeader", () => {
  it("renders symbol, name, category label, formatted mass, block, and phase", () => {
    const w = mount(ElementHeader, {
      props: {
        element: baseElement({
          symbol: "Fe",
          name: "Iron",
          atomicNumber: 26,
          atomicMass: 55.845,
          category: "transition metal",
          block: "d",
          phase: "Solid",
        }),
      },
    })
    expect(w.text()).toContain("Fe")
    expect(w.text()).toContain("Iron")
    expect(w.text()).toContain("Transition Metal")
    expect(w.text()).toContain("55.8450 u")
    expect(w.text()).toContain("D-block")
    expect(w.text()).toContain("Solid")
    expect(w.find(".atomic-number-vert").text()).toBe("26")
  })

  it("shows an em dash for atomic mass when the value is nullish", () => {
    const w = mount(ElementHeader, {
      props: {
        element: baseElement({
          atomicMass: null as unknown as number,
        }),
      },
    })
    expect(w.text()).toContain("—")
    expect(w.text()).toContain("u")
  })
})
