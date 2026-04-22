import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import { defineComponent, h } from "vue"
import ToolElementPicker from "@/components/tools/ToolElementPicker.vue"
import { baseElement } from "@/components/tools/test-element-fixture"
import type { Element } from "@/types/element"

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
  compounds: ["H₂O (Water)"],
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
  phase: "Gas",
  electronConfiguration: "1s2",
  electronConfigurationSemantic: "1s2",
  electronShells: [2],
  electronegativity: null,
  compounds: [],
})

const testElements: Element[] = [hydrogen, helium]

const MiniPeriodicGridStub = defineComponent({
  name: "MiniPeriodicGrid",
  props: {
    elements: { type: Array, required: true },
    selectedNumber: { type: null, required: false },
    otherNumber: { type: null, required: false },
    dimmedNumbers: { type: null, required: false },
  },
  emits: ["select"],
  setup(props, { emit }) {
    return () =>
      h("div", { class: "stub-grid" }, [
        h(
          "button",
          {
            type: "button",
            "data-testid": "stub-pick-h",
            onClick: () =>
              emit(
                "select",
                (props.elements as Element[]).find((e) => e.symbol === "H") ??
                  (props.elements as Element[])[0],
              ),
          },
          "Pick H",
        ),
      ])
  },
})

describe("ToolElementPicker", () => {
  it("shows the label and placeholder when nothing is selected", () => {
    const w = mount(ToolElementPicker, {
      props: {
        label: "Test element",
        elements: testElements,
        otherSelected: null,
        modelValue: null,
      },
      global: { stubs: { MiniPeriodicGrid: MiniPeriodicGridStub } },
    })

    expect(w.find(".picker-label").text()).toBe("Test element")
    expect(w.text()).toContain("Choose an element in the grid below")
    const input = w.find("input[type='search']")
    expect(input.attributes("placeholder")).toContain("Search by name, symbol, or number")
  })

  it("shows selected symbol, name, category, and search placeholder when an element is chosen", () => {
    const w = mount(ToolElementPicker, {
      props: {
        label: "Picker",
        elements: testElements,
        otherSelected: null,
        modelValue: hydrogen,
      },
      global: { stubs: { MiniPeriodicGrid: MiniPeriodicGridStub } },
    })

    expect(w.find(".selected-symbol").text()).toBe("H")
    expect(w.find(".selected-name").text()).toBe("Hydrogen")
    expect(w.find(".selected-category").text()).toBe("Nonmetal")
    expect(w.find("input[type='search']").attributes("placeholder")).toContain("Search to change")
  })

  it("emits update:modelValue when the grid selects an element", async () => {
    const w = mount(ToolElementPicker, {
      props: {
        label: "Picker",
        elements: testElements,
        otherSelected: null,
        modelValue: null,
      },
      global: { stubs: { MiniPeriodicGrid: MiniPeriodicGridStub } },
    })

    await w.find("[data-testid='stub-pick-h']").trigger("click")
    expect(w.emitted("update:modelValue")?.[0]).toEqual([hydrogen])
  })

  it("clears the search query after selecting a new element", async () => {
    const w = mount(ToolElementPicker, {
      props: {
        label: "Picker",
        elements: testElements,
        otherSelected: null,
        modelValue: null,
      },
      global: { stubs: { MiniPeriodicGrid: MiniPeriodicGridStub } },
    })

    const input = w.find("input[type='search']")
    await input.setValue("hydr")
    expect((input.element as HTMLInputElement).value).toBe("hydr")

    await w.find("[data-testid='stub-pick-h']").trigger("click")
    expect((input.element as HTMLInputElement).value).toBe("")
  })

  it("passes a non-null dimmedNumbers set to the grid when the search matches a subset", async () => {
    const w = mount(ToolElementPicker, {
      props: {
        label: "Picker",
        elements: testElements,
        otherSelected: null,
        modelValue: null,
      },
      global: { stubs: { MiniPeriodicGrid: MiniPeriodicGridStub } },
    })

    await w.find("input[type='search']").setValue("Hydrogen")
    const grid = w.findComponent(MiniPeriodicGridStub)
    const dimmed = grid.props("dimmedNumbers") as Set<number> | null
    expect(dimmed).toBeInstanceOf(Set)
    expect(dimmed?.has(1)).toBe(true)
    expect(dimmed?.has(2)).toBe(false)
  })

  it("emits null when the same element is selected again (toggle off)", async () => {
    const w = mount(ToolElementPicker, {
      props: {
        label: "Picker",
        elements: testElements,
        otherSelected: null,
        modelValue: hydrogen,
      },
      global: { stubs: { MiniPeriodicGrid: MiniPeriodicGridStub } },
    })

    await w.find("[data-testid='stub-pick-h']").trigger("click")
    expect(w.emitted("update:modelValue")?.[0]).toEqual([null])
  })

  it("emits null when the clear button is pressed", async () => {
    const w = mount(ToolElementPicker, {
      props: {
        label: "Picker",
        elements: testElements,
        otherSelected: null,
        modelValue: hydrogen,
      },
      global: { stubs: { MiniPeriodicGrid: MiniPeriodicGridStub } },
    })

    await w.find("button.clear-btn").trigger("click")
    expect(w.emitted("update:modelValue")?.[0]).toEqual([null])
  })
})
