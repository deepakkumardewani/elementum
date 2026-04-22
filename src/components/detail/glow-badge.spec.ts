import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import GlowBadge from "@/components/detail/GlowBadge.vue"

describe("GlowBadge", () => {
  it("renders human-readable category label", () => {
    const w = mount(GlowBadge, {
      props: { category: "noble gas" },
    })
    expect(w.text()).toContain("Noble Gas")
    expect(w.find(".glow-badge").exists()).toBe(true)
  })
})
