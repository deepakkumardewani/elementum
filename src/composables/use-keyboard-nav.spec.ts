import { createTestingPinia } from "@pinia/testing"
import { mount } from "@vue/test-utils"
import { storeToRefs } from "pinia"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defineComponent, nextTick, ref } from "vue"
import { useKeyboardNav } from "@/composables/useKeyboardNav"
import { useElementStore } from "@/stores/elementStore"
import type { Element as ChemicalElement } from "@/types/element"

const H: ChemicalElement = {
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
  discoverer: "Henry Cavendish",
  yearDiscovered: 1766,
  spectralLines: [],
  funFacts: [],
  compounds: [],
  summary: "Hydrogen summary.",
}

const He: ChemicalElement = {
  name: "Helium",
  symbol: "He",
  atomicNumber: 2,
  atomicMass: 4.0026,
  category: "noble gas",
  xpos: 18,
  ypos: 1,
  period: 1,
  group: 18,
  block: "s",
  phase: "Gas",
  electronConfiguration: "1s2",
  electronConfigurationSemantic: "1s2",
  electronShells: [2],
  electronegativity: null,
  atomicRadius: 31,
  ionizationEnergy: 2372,
  electronAffinity: null,
  density: 0.1785,
  meltingPoint: null,
  boilingPoint: 4.22,
  oxidationStates: "0",
  discoverer: "Pierre Janssen",
  yearDiscovered: 1868,
  spectralLines: [],
  funFacts: [],
  compounds: [],
  summary: "Helium summary.",
}

const Li: ChemicalElement = {
  name: "Lithium",
  symbol: "Li",
  atomicNumber: 3,
  atomicMass: 6.94,
  category: "alkali metal",
  xpos: 1,
  ypos: 2,
  period: 2,
  group: 1,
  block: "s",
  phase: "Solid",
  electronConfiguration: "[He] 2s1",
  electronConfigurationSemantic: "[He] 2s1",
  electronShells: [2, 1],
  electronegativity: 0.98,
  atomicRadius: 167,
  ionizationEnergy: 520,
  electronAffinity: 59.63,
  density: 0.534,
  meltingPoint: 453.69,
  boilingPoint: 1615,
  oxidationStates: "+1",
  discoverer: "Johan August Arfwedson",
  yearDiscovered: 1817,
  spectralLines: [],
  funFacts: [],
  compounds: [],
  summary: "Lithium summary.",
}

type KeyboardHarnessVm = {
  focusedAtomicNumber: number
}

const Harness = defineComponent({
  setup() {
    const gridRef = ref<HTMLElement | null>(null)
    const { focusedAtomicNumber } = useKeyboardNav(gridRef)
    return { gridRef, focusedAtomicNumber }
  },
  template: `
    <div ref="gridRef" data-testid="grid">
      <button type="button" class="element-tile" data-atomic-number="1">H</button>
      <button type="button" class="element-tile" data-atomic-number="2">He</button>
      <button type="button" class="element-tile" data-atomic-number="3">Li</button>
    </div>
  `,
})

function tileButton(root: globalThis.Element, atomic: 1 | 2 | 3): HTMLButtonElement {
  const el = root.querySelector(`.element-tile[data-atomic-number="${atomic}"]`)
  expect(el).toBeInstanceOf(HTMLButtonElement)
  return el as HTMLButtonElement
}

describe("useKeyboardNav", () => {
  let rafSpy: ReturnType<typeof vi.fn>
  let activeElementSpy: ReturnType<typeof vi.spyOn> | undefined

  beforeEach(() => {
    rafSpy = vi.fn((cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
    vi.stubGlobal("requestAnimationFrame", rafSpy)
  })

  afterEach(() => {
    activeElementSpy?.mockRestore()
    activeElementSpy = undefined
    vi.unstubAllGlobals()
  })

  function stubActiveElement(el: globalThis.Element | null) {
    activeElementSpy?.mockRestore()
    activeElementSpy = vi
      .spyOn(document, "activeElement", "get")
      .mockReturnValue(el as HTMLElement | null)
  }

  it("moves focus to the next tile in the same row on ArrowRight", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    const hBtn = tileButton(wrapper.element, 1)
    stubActiveElement(hBtn)
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()

    const vm = wrapper.vm as KeyboardHarnessVm
    expect(vm.focusedAtomicNumber).toBe(2)
  })

  it("moves focus left along the same row on ArrowLeft", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    const hBtn = tileButton(wrapper.element, 1)
    const heBtn = tileButton(wrapper.element, 2)
    stubActiveElement(hBtn)
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()
    stubActiveElement(heBtn)
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowLeft",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()

    const vm = wrapper.vm as KeyboardHarnessVm
    expect(vm.focusedAtomicNumber).toBe(1)
  })

  it("moves focus down to the closest column on ArrowDown", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    const hBtn = tileButton(wrapper.element, 1)
    stubActiveElement(hBtn)
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()

    const vm = wrapper.vm as KeyboardHarnessVm
    expect(vm.focusedAtomicNumber).toBe(3)
  })

  it("moves focus up one row on ArrowUp when a row exists above", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    const hBtn = tileButton(wrapper.element, 1)
    const liBtn = tileButton(wrapper.element, 3)
    stubActiveElement(hBtn)
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()
    stubActiveElement(liBtn)
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()

    const vm = wrapper.vm as KeyboardHarnessVm
    expect(vm.focusedAtomicNumber).toBe(1)
  })

  it("does not move on ArrowUp when already on the top row", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    const hBtn = tileButton(wrapper.element, 1)
    stubActiveElement(hBtn)
    const ev = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      bubbles: true,
      cancelable: true,
    })
    const prevent = vi.spyOn(ev, "preventDefault")
    document.dispatchEvent(ev)
    await nextTick()

    const vm = wrapper.vm as KeyboardHarnessVm
    expect(vm.focusedAtomicNumber).toBe(1)
    expect(prevent).not.toHaveBeenCalled()
  })

  it("ignores keys when the active node is not an HTMLElement (e.g. SVG)", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "1")
    wrapper.find("[data-testid=grid]").element.appendChild(svg)
    stubActiveElement(svg)

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()

    const vm = wrapper.vm as KeyboardHarnessVm
    expect(vm.focusedAtomicNumber).toBe(1)
  })

  it("closes the detail panel on Escape and refocuses the tile", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    elementStore.selectElement(H)
    await nextTick()
    const hBtn = tileButton(wrapper.element, 1)
    stubActiveElement(hBtn)

    const ev = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    })
    const prevent = vi.spyOn(ev, "preventDefault")
    document.dispatchEvent(ev)
    await nextTick()

    expect(elementStore.detailPanelOpen).toBe(false)
    expect(prevent).toHaveBeenCalled()
    expect(rafSpy).toHaveBeenCalled()
  })

  it("ignores arrow keys when focus is outside the grid", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    const outside = document.createElement("button")
    outside.textContent = "outside"
    document.body.appendChild(outside)
    stubActiveElement(outside)

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()

    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it("ignores navigation when the active element is not an element tile", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    const inner = document.createElement("button")
    inner.type = "button"
    inner.textContent = "tool"
    wrapper.find("[data-testid=grid]").element.appendChild(inner)
    stubActiveElement(inner)

    inner.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()

    const vm = wrapper.vm as KeyboardHarnessVm
    expect(vm.focusedAtomicNumber).toBe(1)
  })

  it("refocuses the tile when the detail panel closes from the store", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const elementStore = useElementStore(pinia)
    const { elements } = storeToRefs(elementStore)
    elements.value = [H, He, Li]

    mount(Harness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    await nextTick()

    elementStore.selectElement(H)
    await nextTick()
    elementStore.closeDetailPanel()
    await nextTick()

    expect(rafSpy).toHaveBeenCalled()
  })
})
