import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it } from "vitest"
import { defineComponent, h } from "vue"
import BondTypePredictor from "@/components/tools/BondTypePredictor.vue"
import { baseElement } from "@/components/tools/test-element-fixture"
import { useElementStore } from "@/stores/elementStore"
import type { Element } from "@/types/element"

const enA = baseElement({
  name: "Alpha",
  symbol: "Aa",
  atomicNumber: 201,
  atomicMass: 1,
  category: "nonmetal",
  xpos: 1,
  ypos: 1,
  period: 1,
  group: 1,
  block: "s",
  phase: "Solid",
  electronConfiguration: "1s1",
  electronConfigurationSemantic: "1s1",
  electronShells: [1],
  electronegativity: 2.2,
})

const enB = baseElement({
  name: "Beta",
  symbol: "Bb",
  atomicNumber: 202,
  atomicMass: 1,
  category: "nonmetal",
  xpos: 2,
  ypos: 1,
  period: 1,
  group: 2,
  block: "s",
  phase: "Solid",
  electronConfiguration: "1s2",
  electronConfigurationSemantic: "1s2",
  electronShells: [2],
  electronegativity: 2.2,
})

const hydrogen = baseElement({
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
})

const oxygen = baseElement({
  name: "Oxygen",
  symbol: "O",
  atomicNumber: 8,
  atomicMass: 15.999,
  category: "nonmetal",
  xpos: 16,
  ypos: 2,
  period: 2,
  group: 16,
  block: "p",
  phase: "Gas",
  electronConfiguration: "[He] 2s2 2p4",
  electronConfigurationSemantic: "[He] 2s2 2p4",
  electronShells: [2, 6],
  electronegativity: 3.44,
})

const sodium = baseElement({
  name: "Sodium",
  symbol: "Na",
  atomicNumber: 11,
  atomicMass: 22.99,
  category: "alkali metal",
  xpos: 1,
  ypos: 3,
  period: 3,
  group: 1,
  block: "s",
  electronConfiguration: "[Ne] 3s1",
  electronConfigurationSemantic: "[Ne] 3s1",
  electronShells: [2, 8, 1],
  electronegativity: 0.93,
})

const chlorine = baseElement({
  name: "Chlorine",
  symbol: "Cl",
  atomicNumber: 17,
  atomicMass: 35.45,
  category: "halogen",
  xpos: 17,
  ypos: 3,
  period: 3,
  group: 17,
  block: "p",
  electronConfiguration: "[Ne] 3s2 3p5",
  electronConfigurationSemantic: "[Ne] 3s2 3p5",
  electronShells: [2, 8, 7],
  electronegativity: 3.16,
})

const missingEn = baseElement({
  name: "NoEN",
  symbol: "NeX",
  atomicNumber: 203,
  atomicMass: 1,
  category: "noble gas",
  xpos: 18,
  ypos: 1,
  period: 1,
  group: 18,
  block: "p",
  phase: "Gas",
  electronConfiguration: "1s2",
  electronConfigurationSemantic: "1s2",
  electronShells: [2],
  electronegativity: null,
})

const ToolElementPickerStub = defineComponent({
  name: "ToolElementPicker",
  props: {
    label: { type: String, required: true },
    elements: { type: Array, required: true },
    otherSelected: { type: null, required: false },
    modelValue: { type: null, required: false },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const pickIndex = () => (props.label.includes("First") ? 0 : 1)
    return () =>
      h(
        "button",
        {
          type: "button",
          "data-testid": props.label.includes("First") ? "pick-first-slot" : "pick-second-slot",
          onClick: () =>
            emit("update:modelValue", (props.elements as Element[])[pickIndex()] ?? null),
        },
        "pick",
      )
  },
})

describe("BondTypePredictor", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("shows a hint until two elements are selected", () => {
    const store = useElementStore()
    store.elements = [hydrogen, oxygen]

    const w = mount(BondTypePredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    expect(w.text()).toContain("Select two elements to compare electronegativity.")
  })

  it("shows nonpolar covalent analysis when the EN difference is below 0.4", async () => {
    const store = useElementStore()
    store.elements = [enA, enB]

    const w = mount(BondTypePredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    await w.find("[data-testid='pick-second-slot']").trigger("click")

    expect(w.find(".bond-badge").text()).toContain("Nonpolar covalent")
    expect(w.find(".bond-badge").classes()).toContain("badge--nonpolar")
    expect(w.find(".en-value").text()).toBe("0.00")
    expect(w.find(".scale-marker").attributes("style")).toContain("left: 0%")
  })

  it("shows polar covalent analysis for a mid-range EN difference", async () => {
    const store = useElementStore()
    store.elements = [hydrogen, oxygen]

    const w = mount(BondTypePredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    await w.find("[data-testid='pick-second-slot']").trigger("click")

    expect(w.find(".bond-badge").text()).toContain("Polar covalent")
    expect(w.find(".bond-badge").classes()).toContain("badge--polar")
    expect(w.find(".en-value").text()).toBe("1.24")
    const left = w.find(".scale-marker").attributes("style") ?? ""
    expect(left).toMatch(/left:\s*41/)
  })

  it("shows ionic analysis and positions the scale marker from the EN difference", async () => {
    const store = useElementStore()
    store.elements = [sodium, chlorine]

    const w = mount(BondTypePredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    await w.find("[data-testid='pick-second-slot']").trigger("click")

    expect(w.find(".bond-badge").text()).toContain("Ionic")
    expect(w.find(".bond-badge").classes()).toContain("badge--ionic")
    expect(w.find(".en-value").text()).toBe("2.23")
    expect(w.find(".scale-marker").attributes("style")).toMatch(/left:\s*74\./)
  })

  it("shows a warning when electronegativity is missing", async () => {
    const store = useElementStore()
    store.elements = [missingEn, hydrogen]

    const w = mount(BondTypePredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    await w.find("[data-testid='pick-second-slot']").trigger("click")

    expect(w.find(".bond-warn").text()).toContain("Electronegativity is missing")
    expect(w.find(".result-panel").attributes("data-en-marker-percent")).toBe("0")
  })

  it("clears tool highlight when unmounted", async () => {
    const store = useElementStore()
    store.elements = [hydrogen, oxygen]

    const w = mount(BondTypePredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    expect(store.toolHighlightElements.size).toBeGreaterThan(0)

    w.unmount()
    expect(store.toolHighlightElements.size).toBe(0)
  })
})
