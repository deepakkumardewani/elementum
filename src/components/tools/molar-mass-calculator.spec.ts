import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import MolarMassCalculator from "@/components/tools/MolarMassCalculator.vue"
import { baseElement } from "@/components/tools/test-element-fixture"
import { useElementStore } from "@/stores/elementStore"
import type { Element } from "@/types/element"
import * as formulaParser from "@/utils/formulaParser"

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

const subset: Element[] = [hydrogen, oxygen]

describe("MolarMassCalculator", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("mounts without error when element data is available", () => {
    const store = useElementStore()
    store.elements = subset

    const w = mount(MolarMassCalculator)
    expect(w.find("section.molar-mass-tool").exists()).toBe(true)
  })

  it("shows a loading message when the element list is empty", () => {
    const store = useElementStore()
    store.elements = []

    const w = mount(MolarMassCalculator)
    expect(w.find('[role="status"]').text()).toContain("Loading element data")
  })

  it("shows the empty-formula prompt when the input is blank", () => {
    const store = useElementStore()
    store.elements = subset

    const w = mount(MolarMassCalculator)
    expect(w.find('[role="status"]').text()).toContain("Enter a formula to see molar mass")
  })

  it("omits breakdown rows when a counted symbol has no element metadata", async () => {
    const store = useElementStore()
    store.elements = subset

    vi.spyOn(formulaParser, "computeMolarMassGPerMol").mockReturnValue({
      kind: "ok",
      total: 99.99,
      counts: new Map([
        ["H", 2],
        ["Ghost", 1],
      ]),
    })

    const w = mount(MolarMassCalculator)
    await w.find("#formula-input").setValue("H2O")

    expect(w.find(".total-value").text()).toContain("99.990")
    const cells = w.findAll(".breakdown-table tbody td.mono")
    expect(cells).toHaveLength(1)
    expect(cells[0].text()).toBe("H")
  })

  it("computes H2O molar mass and a sorted element breakdown", async () => {
    const store = useElementStore()
    store.elements = subset

    const w = mount(MolarMassCalculator)
    const input = w.find("#formula-input")
    await input.setValue("H2O")

    expect(w.find(".total-value").text()).toContain("g/mol")
    expect(w.find(".total-value").text()).toMatch(/18\.0/)

    const cells = w.findAll(".breakdown-table tbody td.mono")
    expect(cells).toHaveLength(2)
    expect(cells[0].text()).toBe("H")
    expect(cells[1].text()).toBe("O")

    expect(w.text()).toContain("Open the main periodic table")
  })

  it("shows a parse error for an invalid symbol", async () => {
    const store = useElementStore()
    store.elements = subset

    const w = mount(MolarMassCalculator)
    await w.find("#formula-input").setValue("Zz")

    const alert = w.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text().length).toBeGreaterThan(0)
    expect(w.find(".breakdown-table").exists()).toBe(false)
  })

  it("highlights formula elements in the store and clears highlight on unmount", async () => {
    const store = useElementStore()
    store.elements = subset

    const w = mount(MolarMassCalculator)
    await w.find("#formula-input").setValue("H2O")

    expect(store.toolHighlightElements.has(1)).toBe(true)
    expect(store.toolHighlightElements.has(8)).toBe(true)

    await w.find("#formula-input").setValue("")
    expect(store.toolHighlightElements.size).toBe(0)

    await w.find("#formula-input").setValue("H2O")
    expect(store.toolHighlightElements.size).toBeGreaterThan(0)

    w.unmount()
    expect(store.toolHighlightElements.size).toBe(0)
  })
})
