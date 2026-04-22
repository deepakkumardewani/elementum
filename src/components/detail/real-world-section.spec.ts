import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import RealWorldSection from "@/components/detail/RealWorldSection.vue"
import { baseElement } from "@/components/tools/test-element-fixture"

describe("RealWorldSection", () => {
  it("shows fallback when there is no industrial or occurrence content", () => {
    const w = mount(RealWorldSection, {
      props: {
        element: baseElement({
          industrialUses: undefined,
          naturalOccurrence: undefined,
        }),
      },
    })
    expect(w.text()).toContain("No industrial or occurrence notes")
  })

  it("lists industrial uses and natural occurrence when present", () => {
    const w = mount(RealWorldSection, {
      props: {
        element: baseElement({
          industrialUses: [" Steel", " Catalysts"],
          naturalOccurrence: " Found in ores.",
        }),
      },
    })
    expect(w.text()).toContain("Industrial uses")
    expect(w.text()).toContain("Steel")
    expect(w.text()).toContain("Natural occurrence")
    expect(w.text()).toContain("Found in ores.")
  })
})
