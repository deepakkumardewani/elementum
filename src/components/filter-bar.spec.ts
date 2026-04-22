import { flushPromises, mount } from "@vue/test-utils"
import { gsap } from "gsap"
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useElementStore } from "@/stores/elementStore"
import FilterBar from "./FilterBar.vue"

describe("FilterBar", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    setActivePinia(createPinia())
  })

  it("loads an interactive filter bar and applies category, secondary, and clear flows", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          media: query,
          matches: !query.includes("prefers-reduced-motion"),
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          onchange: null,
          dispatchEvent: () => false,
        }) as MediaQueryList,
    )

    const w = mount(FilterBar, { global: { plugins: [pinia] } })
    expect(w.get(".filter-bar").attributes("aria-label")).toBe("Filter elements")
    await w.get('[aria-label="Filter by Halogen"]').trigger("click")
    expect(store.activeCategory).toBe("halogen")
    w.get(".clear-btn").trigger("click")
    expect(store.activeCategory).toBeNull()

    await w.get(".secondary-toggle").trigger("click")
    const period1 = w.findAll(".compact-chip").find((b) => b.text() === "1")
    await period1?.trigger("click")
    expect(store.activePeriod).toBe(1)
    await period1?.trigger("click")
    expect(store.activePeriod).toBeNull()
    await period1?.trigger("click")
    expect(store.activePeriod).toBe(1)
    await w.get(".clear-btn").trigger("click")
    // Secondary strip stays open; select p-block
    const blockP = w.findAll(".compact-chip").find((b) => b.attributes("aria-label") === "p-block")
    await blockP?.trigger("click")
    expect(store.activeBlock).toBe("p")
    await blockP?.trigger("click")
    expect(store.activeBlock).toBeNull()
    await blockP?.trigger("click")
    expect(store.activeBlock).toBe("p")
    await w.get('[aria-label="Group 14"]').trigger("click")
    expect(store.activeGroup).toBe(14)
    await w.get('[aria-label="Group 14"]').trigger("click")
    expect(store.activeGroup).toBeNull()
    w.unmount()
  })

  it("shows no-match feedback and clears it from the feedback action", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          media: query,
          matches: !query.includes("prefers-reduced-motion"),
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          onchange: null,
          dispatchEvent: () => false,
        }) as MediaQueryList,
    )

    const w = mount(FilterBar, { global: { plugins: [pinia] } })
    store.setSearchQuery("no-element-matches-this-xyz-123")
    await flushPromises()
    const feedback = w.get(".results-feedback")
    expect(feedback.text()).toMatch(/No elements match/)
    await feedback.get(".feedback-clear").trigger("click")
    expect(store.searchQuery).toBe("")
  })

  it("does not run the category strip intro when reduced motion is preferred", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    await useElementStore().loadElements()
    await flushPromises()
    const fromTo = vi.spyOn(gsap, "fromTo")
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          media: query,
          matches: query.includes("prefers-reduced-motion"),
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          onchange: null,
          dispatchEvent: () => false,
        }) as MediaQueryList,
    )
    mount(FilterBar, { global: { plugins: [pinia] } })
    await flushPromises()
    expect(fromTo).not.toHaveBeenCalled()
    fromTo.mockRestore()
  })
})
