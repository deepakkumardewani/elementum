import { createTestingPinia } from "@pinia/testing"
import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defineComponent, nextTick } from "vue"
import { useElementFilter } from "@/composables/useElementFilter"
import { useElementStore } from "@/stores/elementStore"

const { gsapTo } = vi.hoisted(() => ({ gsapTo: vi.fn() }))

vi.mock("gsap", () => ({
  gsap: {
    to: gsapTo,
  },
}))

const Harness = defineComponent({
  setup() {
    useElementFilter()
    return {}
  },
  template: "<div />",
})

describe("useElementFilter", () => {
  let matchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="element-tile" data-atomic-number="1"></div>
      <div class="element-tile" data-atomic-number="2"></div>
    `
    gsapTo.mockClear()
    matchSpy = vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    document.body.innerHTML = ""
    matchSpy.mockRestore()
  })

  it("tweens all tiles to full opacity when no filter is active", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    mount(Harness, { attachTo: document.body, global: { plugins: [pinia] } })

    const store = useElementStore(pinia)
    store.clearToolHighlight()
    store.setSearchQuery("")
    await nextTick()

    expect(gsapTo).toHaveBeenCalled()
    const first = gsapTo.mock.calls[0]
    expect(first?.[1]).toMatchObject({ opacity: 1 })
  })

  it("sets opacity per tile when tool highlight marks a subset", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    mount(Harness, { attachTo: document.body, global: { plugins: [pinia] } })

    const store = useElementStore(pinia)
    store.setToolHighlight([1])
    await nextTick()

    expect(gsapTo.mock.calls.length).toBeGreaterThanOrEqual(2)
    const opacities = gsapTo.mock.calls.map((c) => (c[1] as { opacity: number }).opacity)
    expect(opacities).toContain(1)
    expect(opacities).toContain(0.15)
  })

  it("skips GSAP when reduced motion is preferred", async () => {
    matchSpy.mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    gsapTo.mockClear()
    mount(Harness, { attachTo: document.body, global: { plugins: [pinia] } })

    const store = useElementStore(pinia)
    store.setToolHighlight([1])
    await nextTick()

    expect(gsapTo).not.toHaveBeenCalled()
  })
})
