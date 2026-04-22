import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it } from "vitest"
import ElementSelector from "@/components/compare/ElementSelector.vue"
import { useElementStore } from "@/stores/elementStore"

describe("ElementSelector", () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it("labels slot 1 vs slot 2 from slotIndex", () => {
    const a = mount(ElementSelector, {
      props: { slotIndex: 0 },
      global: { plugins: [pinia] },
    })
    const b = mount(ElementSelector, {
      props: { slotIndex: 1 },
      global: { plugins: [pinia] },
    })

    expect(a.text()).toContain("Element 1")
    expect(b.text()).toContain("Element 2")
  })

  it("shows placeholder and default search hint when nothing is selected", async () => {
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    const w = mount(ElementSelector, {
      props: { slotIndex: 0 },
      global: { plugins: [pinia] },
    })

    expect(w.find(".selected-placeholder").exists()).toBe(true)
    expect(w.find(".selected-placeholder").attributes("aria-label")).toBe("No element selected")
    const input = w.find('input[type="search"]')
    expect(input.attributes("placeholder")).toContain("Search by name")
  })

  it("selects an element from the mini grid and shows the selected panel", async () => {
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    const w = mount(ElementSelector, {
      props: { slotIndex: 0 },
      global: { plugins: [pinia] },
    })

    const hBtn = w.findAll("button").find((b) => b.text() === "H")
    expect(hBtn).toBeDefined()
    await hBtn?.trigger("click")
    await flushPromises()

    expect(store.compareElements[0]?.symbol).toBe("H")
    expect(w.find(".selected-display").exists()).toBe(true)
    expect(w.find(".selected-symbol").text()).toBe("H")
    const input = w.find('input[type="search"]')
    expect(input.attributes("placeholder")).toContain("Search to change")
  })

  it("clears selection from the clear button", async () => {
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    const w = mount(ElementSelector, {
      props: { slotIndex: 0 },
      global: { plugins: [pinia] },
    })

    await w
      .findAll("button")
      .find((b) => b.text() === "H")
      ?.trigger("click")
    await flushPromises()
    expect(store.compareElements[0]).not.toBeNull()

    await w.find(".clear-btn").trigger("click")
    await flushPromises()
    expect(store.compareElements[0]).toBeNull()
  })

  it("toggles off when clicking the already-selected element in the grid", async () => {
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    const w = mount(ElementSelector, {
      props: { slotIndex: 0 },
      global: { plugins: [pinia] },
    })

    const hBtn = w.findAll("button").find((b) => b.text() === "H")
    await hBtn?.trigger("click")
    await flushPromises()
    expect(store.compareElements[0]?.symbol).toBe("H")

    await hBtn?.trigger("click")
    await flushPromises()
    expect(store.compareElements[0]).toBeNull()
  })

  it("disables the other slot element in the grid and passes it as otherNumber", async () => {
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    const helium = store.elements.find((e) => e.symbol === "He")
    if (!helium) throw new Error("expected He in fixture")
    store.setCompareElement(1, helium)

    const w = mount(ElementSelector, {
      props: { slotIndex: 0 },
      global: { plugins: [pinia] },
    })
    await flushPromises()

    const heInGrid = w.findAll("button").find((b) => b.text() === "He")
    expect(heInGrid?.attributes("disabled")).toBeDefined()
  })

  it("narrows the grid with search so non-matches are dimmed", async () => {
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    const w = mount(ElementSelector, {
      props: { slotIndex: 0 },
      global: { plugins: [pinia] },
    })

    const input = w.find('input[type="search"]')
    await input.setValue("Zirconium")
    await input.trigger("input")
    await flushPromises()

    const zrBtn = w.findAll("button").find((b) => b.text() === "Zr")
    const hBtn = w.findAll("button").find((b) => b.text() === "H")
    expect(zrBtn?.classes().includes("is-dimmed")).toBe(false)
    expect(hBtn?.classes()).toContain("is-dimmed")
  })
})
