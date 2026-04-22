import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import ElectronConfigVisualizer from "@/components/detail/ElectronConfigVisualizer.vue"
import { baseElement } from "@/components/tools/test-element-fixture"

describe("ElectronConfigVisualizer", () => {
  it("renders shell legend, nucleus atomic number, and orbital badges from semantic config", () => {
    const w = mount(ElectronConfigVisualizer, {
      props: {
        element: baseElement({
          atomicNumber: 26,
          electronShells: [2, 8, 14, 2],
          electronConfiguration: "[Ar] 3d6 4s2",
          electronConfigurationSemantic: "1s2 2s2 2p6",
        }),
      },
    })
    expect(w.text()).toContain("Electron Configuration")
    expect(w.text()).toContain("K")
    expect(w.text()).toContain("L")
    expect(w.text()).toContain("26")
    expect(w.text()).toContain("Sub-shell")
    expect(w.text()).toMatch(/1s/)
    expect(w.text()).toContain("Full notation")
    expect(w.text()).toContain("[Ar] 3d6 4s2")
  })

  it("parses orbital tokens without trailing electron count", () => {
    const w = mount(ElectronConfigVisualizer, {
      props: {
        element: baseElement({
          electronShells: [1],
          electronConfiguration: "1s1",
          electronConfigurationSemantic: "[He]",
        }),
      },
    })
    expect(w.findAll(".orbital-badge").length).toBeGreaterThan(0)
  })

  it("renders a shell with zero electrons without placing electron dots", () => {
    const w = mount(ElectronConfigVisualizer, {
      props: {
        element: baseElement({
          atomicNumber: 1,
          electronShells: [0],
          electronConfiguration: "1s0",
          electronConfigurationSemantic: "1s0",
        }),
      },
    })
    expect(w.text()).toContain("K")
    expect(w.findAll(".electron").length).toBe(0)
  })

  it("falls back gracefully for odd orbital token shapes", () => {
    const w = mount(ElectronConfigVisualizer, {
      props: {
        element: baseElement({
          electronShells: [1],
          electronConfiguration: "1s1",
          electronConfigurationSemantic: "odd-token",
        }),
      },
    })
    expect(w.text()).toContain("odd-token")
  })
})
