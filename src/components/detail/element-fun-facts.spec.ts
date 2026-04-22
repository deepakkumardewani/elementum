import { flushPromises, mount } from "@vue/test-utils"
import { gsap } from "gsap"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import ElementFunFacts from "@/components/detail/ElementFunFacts.vue"
import { baseElement } from "@/components/tools/test-element-fixture"

vi.mock("gsap", () => ({
  gsap: {
    fromTo: vi.fn(),
  },
}))

describe("ElementFunFacts", () => {
  beforeEach(() => {
    vi.mocked(gsap.fromTo).mockClear()
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders summary, fun facts, and compound chips when data exists", async () => {
    const w = mount(ElementFunFacts, {
      props: {
        element: baseElement({
          name: "Iron",
          summary: "A common metallic element.",
          funFacts: ["Fact one", "Fact two"],
          compounds: ["Fe2O3", "Fe3O4"],
        }),
      },
    })
    await flushPromises()
    expect(w.text()).toContain("About Iron")
    expect(w.text()).toContain("A common metallic element")
    expect(w.text()).toContain("Fun Facts")
    expect(w.text()).toContain("Fact one")
    expect(w.text()).toContain("Common Compounds")
    expect(w.text()).toContain("Fe2O3")
  })

  it("shows empty placeholders when fun facts and compounds are absent", async () => {
    const w = mount(ElementFunFacts, {
      props: {
        element: baseElement({
          funFacts: [],
          compounds: [],
        }),
      },
    })
    await flushPromises()
    const emptyMsgs = w.findAll(".facts-empty")
    expect(emptyMsgs.length).toBe(2)
    expect(emptyMsgs[0].text()).toContain("No data available")
  })

  it("skips GSAP when reduced motion is preferred", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    )
    mount(ElementFunFacts, {
      props: {
        element: baseElement({
          funFacts: ["Animated fact"],
        }),
      },
    })
    await flushPromises()
    expect(vi.mocked(gsap.fromTo)).not.toHaveBeenCalled()
  })

  it("re-animates when the element prop changes", async () => {
    vi.clearAllMocks()
    const w = mount(ElementFunFacts, {
      props: {
        element: baseElement({
          atomicNumber: 1,
          funFacts: ["First"],
        }),
      },
    })
    await flushPromises()
    expect(vi.mocked(gsap.fromTo)).toHaveBeenCalledTimes(1)
    await w.setProps({
      element: baseElement({
        atomicNumber: 2,
        funFacts: ["Second"],
      }),
    })
    await flushPromises()
    expect(vi.mocked(gsap.fromTo)).toHaveBeenCalledTimes(2)
  })
})
