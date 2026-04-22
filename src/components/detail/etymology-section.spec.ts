import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import EtymologySection from "@/components/detail/EtymologySection.vue"
import { baseElement } from "@/components/tools/test-element-fixture"

describe("EtymologySection", () => {
  it("shows fallback when no etymology or discovery content exists", () => {
    const w = mount(EtymologySection, {
      props: {
        element: baseElement({
          etymology: null,
          discoveryStory: null,
          discoverer: null,
          yearDiscovered: null,
          discoveryCountry: null,
          discoveryMethod: null,
        }),
      },
    })
    expect(w.text()).toContain("No etymology or discovery notes")
  })

  it("renders name origin, discovery story, and discoverer card fields", () => {
    const w = mount(EtymologySection, {
      props: {
        element: baseElement({
          etymology: " From Latin ferrum.",
          discoveryStory: " Known since antiquity.",
          discoverer: " Ancient civilizations",
          yearDiscovered: 100,
          discoveryCountry: " Various",
          discoveryMethod: " Archaeological",
          discovererPortrait: "https://example.com/portrait.png",
        }),
      },
    })
    expect(w.text()).toContain("Name origin")
    expect(w.text()).toContain("From Latin ferrum")
    expect(w.text()).toContain("Discovery")
    expect(w.text()).toContain("Known since antiquity")
    expect(w.text()).toContain("Discoverer & context")
    expect(w.text()).toContain("Ancient civilizations")
    expect(w.text()).toContain("Year")
    expect(w.text()).toContain("Ancient / Unknown")
    expect(w.text()).toContain("Country / region")
    expect(w.text()).toContain("Various")
    expect(w.text()).toContain("Method")
    expect(w.text()).toContain("Archaeological")
    const img = w.find(".discoverer-portrait")
    expect(img.exists()).toBe(true)
    expect(img.attributes("src")).toBe("https://example.com/portrait.png")
  })

  it("handles string discovery years in the discoverer card", () => {
    const w = mount(EtymologySection, {
      props: {
        element: baseElement({
          discoverer: "Mendeleev",
          yearDiscovered: "1869" as unknown as number,
        }),
      },
    })
    expect(w.text()).toContain("1869")
    expect(w.text()).toContain("Mendeleev")
  })

  it("uses ancient discoverer fallback when credit is missing but the year is early", () => {
    const w = mount(EtymologySection, {
      props: {
        element: baseElement({
          discoverer: null,
          yearDiscovered: 200,
        }),
      },
    })
    expect(w.text()).toContain("Ancient / Unknown")
  })
})
