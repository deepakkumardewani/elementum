import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { baseElement } from "@/components/tools/test-element-fixture"
import { useTooltip } from "@/composables/useTooltip"
import { useElementStore } from "@/stores/elementStore"
import { useUiStore } from "@/stores/uiStore"
import ElementTile from "./ElementTile.vue"

const fe = baseElement({})

describe("ElementTile", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
    useTooltip().hideTooltip()
  })

  it("renders data and selects the element on click", () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const elStore = useElementStore()

    const w = mount(ElementTile, {
      props: { element: fe, tileTabindex: -1 },
      global: { plugins: [pinia] },
    })
    const btn = w.get("button.element-tile")
    expect(btn.find(".tile-symbol").text()).toBe("Fe")
    expect(btn.attributes("tabindex")).toBe("-1")

    btn.trigger("click")
    expect(elStore.selectedElement?.atomicNumber).toBe(26)
    expect(w.emitted("click")?.[0]).toEqual([fe])
  })

  it("emits focusTile on focus and shows tooltip after hover delay", async () => {
    vi.useFakeTimers()
    const pinia = createPinia()
    setActivePinia(pinia)

    const w = mount(ElementTile, {
      props: { element: fe },
      global: { plugins: [pinia] },
    })
    const btn = w.get("button")
    await btn.trigger("focus")
    expect(w.emitted("focusTile")?.length).toBe(1)

    await btn.trigger("mouseenter")
    expect(useTooltip().visible.value).toBe(false)
    await vi.advanceTimersByTimeAsync(300)
    expect(useTooltip().visible.value).toBe(true)
    expect(useTooltip().state.value?.element.atomicNumber).toBe(26)

    await btn.trigger("mouseleave")
    expect(useTooltip().visible.value).toBe(false)
  })

  it("cancels a pending tooltip if the pointer leaves before the delay", async () => {
    vi.useFakeTimers()
    const pinia = createPinia()
    setActivePinia(pinia)
    const w = mount(ElementTile, {
      props: { element: fe },
      global: { plugins: [pinia] },
    })
    const btn = w.get("button")
    await btn.trigger("mouseenter")
    await btn.trigger("mouseleave")
    await vi.advanceTimersByTimeAsync(500)
    expect(useTooltip().visible.value).toBe(false)
  })

  it("replaces a pending show when showTooltip is invoked again before the delay", async () => {
    vi.useFakeTimers()
    const pinia = createPinia()
    setActivePinia(pinia)
    const w = mount(ElementTile, {
      props: { element: fe },
      global: { plugins: [pinia] },
    })
    const btn = w.get("button")
    await btn.trigger("mouseenter")
    const other = baseElement({
      atomicNumber: 1,
      name: "Hydrogen",
      symbol: "H",
    })
    useTooltip().showTooltip(other, btn.element.getBoundingClientRect())
    await vi.advanceTimersByTimeAsync(300)
    expect(useTooltip().state.value?.element.atomicNumber).toBe(1)
  })

  it("dims the tile when a category filter excludes it", () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const elStore = useElementStore()
    elStore.elements = [
      fe,
      baseElement({
        atomicNumber: 2,
        name: "Helium",
        symbol: "He",
        category: "noble gas",
      }),
    ]
    elStore.setActiveCategory("noble gas")

    const w = mount(ElementTile, {
      props: { element: fe },
      global: { plugins: [pinia] },
    })
    expect(w.get("button").classes()).toContain("is-dimmed")
  })

  it("uses property coloring when the table is in a trend color mode", () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const ui = useUiStore()
    ui.setColorMode("electronegativity")

    const w = mount(ElementTile, {
      props: { element: fe },
      global: { plugins: [pinia] },
    })
    expect(w.get("button").classes()).toContain("is-trend-mode")
  })
})
