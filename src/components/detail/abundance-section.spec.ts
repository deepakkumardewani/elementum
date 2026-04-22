import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import AbundanceSection from "@/components/detail/AbundanceSection.vue"
import type { Abundance } from "@/types/element"

describe("AbundanceSection", () => {
  it("renders nothing when abundance is missing", () => {
    const w = mount(AbundanceSection, {
      props: { abundance: null },
    })
    expect(w.find("section").exists()).toBe(false)
  })

  it("renders nothing when all abundance fields are null", () => {
    const empty: Abundance = {
      universe: null,
      sun: null,
      oceans: null,
      humanBody: null,
      earthCrust: null,
      meteorites: null,
    }
    const w = mount(AbundanceSection, { props: { abundance: empty } })
    expect(w.find("section").exists()).toBe(false)
  })

  it("formats prevalence rows for fractional abundances", () => {
    const a: Abundance = {
      universe: 0.000001,
      sun: 0,
      oceans: null,
      humanBody: null,
      earthCrust: 0.05,
      meteorites: null,
    }
    const w = mount(AbundanceSection, { props: { abundance: a } })
    expect(w.text()).toContain("Prevalence")
    expect(w.text()).toMatch(/1\.00e-\d+%/)
    expect(w.text()).toContain("0%")
    expect(w.text()).toContain("5.00%")
  })

  it("covers mid-range and sub-percent formatting branches", () => {
    const a: Abundance = {
      universe: null,
      sun: null,
      oceans: 0.00003,
      humanBody: 0.004,
      earthCrust: 0.07,
      meteorites: null,
    }
    const w = mount(AbundanceSection, { props: { abundance: a } })
    expect(w.text()).toContain("0.0030%")
    expect(w.text()).toContain("0.400%")
    expect(w.text()).toContain("7.00%")
  })
})
