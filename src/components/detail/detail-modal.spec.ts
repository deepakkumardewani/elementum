import { flushPromises, shallowMount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it, vi } from "vitest"
import DetailModal from "@/components/detail/DetailModal.vue"
import { useElementStore } from "@/stores/elementStore"
import type { Element } from "@/types/element"
import * as bodyScrollLock from "@/utils/bodyScrollLock"

vi.mock("gsap", () => ({
  gsap: {
    killTweensOf: vi.fn(),
    fromTo: vi.fn(),
    to: vi.fn((_targets: unknown, vars: { onComplete?: () => void }) => {
      vars.onComplete?.()
      return {}
    }),
  },
}))

vi.mock("@vueuse/integrations/useFocusTrap", () => ({
  useFocusTrap: () => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
  }),
}))

vi.mock("@/utils/bodyScrollLock", () => ({
  lockBodyScroll: vi.fn(),
  unlockBodyScroll: vi.fn(),
}))

function stubElement(overrides: Partial<Element>): Element {
  return {
    name: "Hydrogen",
    symbol: "H",
    atomicNumber: 1,
    atomicMass: 1.008,
    category: "nonmetal",
    xpos: 1,
    ypos: 1,
    period: 1,
    group: 1,
    block: "s",
    phase: "Gas",
    electronConfiguration: "1s1",
    electronConfigurationSemantic: "1s1",
    electronShells: [1],
    electronegativity: 2.2,
    atomicRadius: 53,
    ionizationEnergy: 1312,
    electronAffinity: 72.769,
    density: 0.08988,
    meltingPoint: 13.99,
    boilingPoint: 20.271,
    oxidationStates: "-1, 0, +1",
    spectralLines: [],
    funFacts: [],
    compounds: [],
    summary: "",
    discoverer: null,
    yearDiscovered: null,
    isotopes: [],
    ...overrides,
  }
}

describe("DetailModal", () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it("shows dialog with selected element when the detail panel is open", async () => {
    const store = useElementStore()
    const h = stubElement({ atomicNumber: 1, name: "Hydrogen" })
    const he = stubElement({
      atomicNumber: 2,
      name: "Helium",
      symbol: "He",
      xpos: 18,
    })
    store.elements = [h, he]
    store.selectedElement = h
    store.detailPanelOpen = true

    const w = shallowMount(DetailModal)
    await flushPromises()
    expect(w.find('[role="dialog"]').exists()).toBe(true)
    expect(store.selectedElement?.name).toBe("Hydrogen")
  })

  it("closes the panel when the close control is activated", async () => {
    const store = useElementStore()
    const h = stubElement({ atomicNumber: 1 })
    store.elements = [h]
    store.selectedElement = h
    store.detailPanelOpen = true

    const w = shallowMount(DetailModal)
    await flushPromises()
    await w.find(".detail-close-btn").trigger("click")
    expect(store.detailPanelOpen).toBe(false)
    expect(store.selectedElement).toBeNull()
  })

  it("navigates to the next element when the next control is clicked", async () => {
    const store = useElementStore()
    const h = stubElement({ atomicNumber: 1 })
    const he = stubElement({
      atomicNumber: 2,
      name: "Helium",
      symbol: "He",
      xpos: 18,
    })
    store.elements = [h, he]
    store.selectedElement = h
    store.detailPanelOpen = true

    const w = shallowMount(DetailModal)
    await flushPromises()
    const buttons = w.findAll(".detail-nav-btn")
    const nextBtn = buttons[buttons.length - 1]
    await nextBtn.trigger("click")
    expect(store.selectedElement?.atomicNumber).toBe(2)
  })

  it("moves selection with arrow keys while open", async () => {
    const store = useElementStore()
    const h = stubElement({ atomicNumber: 1 })
    const he = stubElement({
      atomicNumber: 2,
      name: "Helium",
      symbol: "He",
      xpos: 18,
    })
    store.elements = [h, he]
    store.selectedElement = h
    store.detailPanelOpen = true

    shallowMount(DetailModal)
    await flushPromises()
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }))
    expect(store.selectedElement?.atomicNumber).toBe(2)
  })

  it("closes when the backdrop is clicked", async () => {
    const store = useElementStore()
    const h = stubElement({ atomicNumber: 1 })
    store.elements = [h]
    store.selectedElement = h
    store.detailPanelOpen = true

    const w = shallowMount(DetailModal)
    await flushPromises()
    await w.find(".detail-backdrop").trigger("click")
    expect(store.detailPanelOpen).toBe(false)
  })

  it("closes when Escape is pressed", async () => {
    const store = useElementStore()
    const h = stubElement({ atomicNumber: 1 })
    store.elements = [h]
    store.selectedElement = h
    store.detailPanelOpen = true

    shallowMount(DetailModal)
    await flushPromises()
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    expect(store.detailPanelOpen).toBe(false)
  })

  it("navigates to the previous element from the toolbar control", async () => {
    const store = useElementStore()
    const h = stubElement({ atomicNumber: 1 })
    const he = stubElement({
      atomicNumber: 2,
      name: "Helium",
      symbol: "He",
      xpos: 18,
    })
    store.elements = [h, he]
    store.selectedElement = he
    store.detailPanelOpen = true

    const w = shallowMount(DetailModal)
    await flushPromises()
    const prevBtn = w.findAll(".detail-nav-btn")[0]
    await prevBtn.trigger("click")
    expect(store.selectedElement?.atomicNumber).toBe(1)
  })

  it("unlocks body scroll on unmount while the panel is open", async () => {
    const store = useElementStore()
    const h = stubElement({ atomicNumber: 1 })
    store.elements = [h]
    store.selectedElement = h
    store.detailPanelOpen = true

    const w = shallowMount(DetailModal)
    await flushPromises()
    w.unmount()
    expect(vi.mocked(bodyScrollLock.unlockBodyScroll)).toHaveBeenCalled()
  })
})
