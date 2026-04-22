import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import PropertiesGrid from "@/components/detail/PropertiesGrid.vue"
import { baseElement } from "@/components/tools/test-element-fixture"

describe("PropertiesGrid", () => {
  it("renders key property sections and uses em dash for missing optional fields", () => {
    const w = mount(PropertiesGrid, {
      props: {
        element: baseElement({
          latinName: null,
          group: null,
          meltingPoint: null,
        }),
      },
    })
    expect(w.attributes("aria-label")).toBe("Element properties")
    expect(w.text()).toContain("Overview")
    expect(w.text()).toContain("Latin Name")
    expect(w.text()).toContain("Properties")
    expect(w.text()).toContain("Group")
    expect(w.text()).toMatch(/—/)
    expect(w.text()).toContain("Melting Point")
  })

  it("formats BC year and Kelvin temperatures with conversions", () => {
    const w = mount(PropertiesGrid, {
      props: {
        element: baseElement({
          yearDiscovered: -400,
          meltingPoint: 273.15,
        }),
      },
    })
    expect(w.text()).toContain("400 BC")
    expect(w.text()).toContain("K")
    expect(w.text()).toContain("°C")
    expect(w.text()).toContain("°F")
  })

  it("uses semantic electron configuration when present", () => {
    const w = mount(PropertiesGrid, {
      props: {
        element: baseElement({
          electronConfiguration: "[Ar] 3d6 4s2",
          electronConfigurationSemantic: "1s2 2s2 custom",
        }),
      },
    })
    expect(w.text()).toContain("Electron Config")
    expect(w.text()).toContain("1s2 2s2 custom")
  })

  it("passes through non-numeric year strings", () => {
    const w = mount(PropertiesGrid, {
      props: {
        element: baseElement({
          yearDiscovered: "prehistoric" as unknown as number,
        }),
      },
    })
    expect(w.text()).toContain("prehistoric")
  })

  it("formats ordinary numeric discovery years", () => {
    const w = mount(PropertiesGrid, {
      props: {
        element: baseElement({
          yearDiscovered: 1774,
        }),
      },
    })
    expect(w.text()).toContain("1774")
  })
})
