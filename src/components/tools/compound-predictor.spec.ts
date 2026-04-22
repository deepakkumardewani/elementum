import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it } from "vitest"
import { defineComponent, h } from "vue"
import CompoundPredictor from "@/components/tools/CompoundPredictor.vue"
import { baseElement } from "@/components/tools/test-element-fixture"
import { useElementStore } from "@/stores/elementStore"
import type { Element } from "@/types/element"

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
  compounds: ["NaCl (Table Salt)", "NaOH (Sodium Hydroxide / Lye)"],
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
  compounds: ["NaCl (Table Salt)", "HCl (Hydrochloric Acid)"],
})

const helium = baseElement({
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
  electronConfiguration: "1s2",
  electronConfigurationSemantic: "1s2",
  electronShells: [2],
  electronegativity: null,
  compounds: ["He-only line"],
})

const neon = baseElement({
  name: "Neon",
  symbol: "Ne",
  atomicNumber: 10,
  atomicMass: 20.18,
  category: "noble gas",
  xpos: 18,
  ypos: 2,
  period: 2,
  group: 18,
  block: "p",
  electronConfiguration: "[He] 2s2 2p6",
  electronConfigurationSemantic: "[He] 2s2 2p6",
  electronShells: [2, 8],
  electronegativity: null,
  compounds: ["Ne-only line"],
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

describe("CompoundPredictor", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("shows a hint until two elements are selected", () => {
    const store = useElementStore()
    store.elements = [sodium, chlorine]

    const w = mount(CompoundPredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    expect(w.text()).toContain("Select two elements to look for a shared compound.")
  })

  it("keeps the hint when only the first slot is filled", async () => {
    const store = useElementStore()
    store.elements = [sodium, chlorine]

    const w = mount(CompoundPredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    expect(w.text()).toContain("Select two elements to look for a shared compound.")
  })

  it("keeps the hint when only the second slot is filled first, then shows a result", async () => {
    const store = useElementStore()
    store.elements = [sodium, chlorine]

    const w = mount(CompoundPredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-second-slot']").trigger("click")
    expect(w.text()).toContain("Select two elements to look for a shared compound.")

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    expect(w.find(".compound-value").text()).toBe("NaCl (Table Salt)")
  })

  it("shows the likely compound line when both elements share an entry", async () => {
    const store = useElementStore()
    store.elements = [sodium, chlorine]

    const w = mount(CompoundPredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    await w.find("[data-testid='pick-second-slot']").trigger("click")

    expect(w.find(".compound-value").text()).toBe("NaCl (Table Salt)")
    expect(w.text()).toContain("Likely compound")
  })

  it("shows the no-match status when the dataset has no shared compound", async () => {
    const store = useElementStore()
    store.elements = [helium, neon]

    const w = mount(CompoundPredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    await w.find("[data-testid='pick-second-slot']").trigger("click")

    expect(w.find(".compound-none").text()).toContain("No common compound found")
  })

  it("updates tool highlight in the store for the selected atomic numbers", async () => {
    const store = useElementStore()
    store.elements = [sodium, chlorine]

    const w = mount(CompoundPredictor, {
      global: { stubs: { ToolElementPicker: ToolElementPickerStub } },
    })

    await w.find("[data-testid='pick-first-slot']").trigger("click")
    expect(store.toolHighlightElements.has(11)).toBe(true)
    expect(store.toolHighlightElements.has(17)).toBe(false)

    await w.find("[data-testid='pick-second-slot']").trigger("click")
    expect(store.toolHighlightElements.has(11)).toBe(true)
    expect(store.toolHighlightElements.has(17)).toBe(true)

    w.unmount()
    expect(store.toolHighlightElements.size).toBe(0)
  })
})
