import { shallowMount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { nextTick } from "vue"
import type { Element } from "@/types/element"
import CompareTable from "./CompareTable.vue"

const { fromTo } = vi.hoisted(() => {
  const fn = vi.fn()
  return { fromTo: fn }
})

vi.mock("gsap", () => ({
  gsap: { fromTo },
}))

function baseElement(overrides: Partial<Element>): Element {
  return {
    name: "Iron",
    symbol: "Fe",
    atomicNumber: 26,
    atomicMass: 55.845,
    category: "transition metal",
    xpos: 8,
    ypos: 4,
    period: 4,
    group: 8,
    block: "d",
    phase: "Solid",
    electronConfiguration: "[Ar] 3d6 4s2",
    electronConfigurationSemantic: "[Ar] 3d6 4s2",
    electronShells: [2, 8, 14, 2],
    electronegativity: 1.83,
    atomicRadius: 126,
    ionizationEnergy: 762.5,
    electronAffinity: 15.7,
    density: 7.874,
    meltingPoint: 1811,
    boilingPoint: 3134,
    oxidationStates: "0, +2, +3",
    spectralLines: [],
    funFacts: [],
    compounds: [],
    summary: "",
    discoverer: null,
    yearDiscovered: null,
    ...overrides,
  }
}

describe("CompareTable", () => {
  beforeEach(() => {
    fromTo.mockClear()
    vi.stubGlobal("matchMedia", (query: string) => ({
      media: query,
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("mounts and shows Group C property rows for Fe vs Cu", () => {
    const elementA = baseElement({
      name: "Iron",
      symbol: "Fe",
      vanDerWaalsRadius: 194,
      thermalConductivity: 80.2,
      mohsHardness: 4,
      crystalStructure: "body-centered cubic",
    })
    const elementB = baseElement({
      name: "Copper",
      symbol: "Cu",
      atomicNumber: 29,
      atomicMass: 63.546,
      vanDerWaalsRadius: 196,
      thermalConductivity: 401,
      mohsHardness: 3,
      crystalStructure: "face-centered cubic",
    })

    const w = shallowMount(CompareTable, {
      props: { elementA, elementB },
    })

    const text = w.text()
    expect(text).toContain("Van der Waals Radius")
    expect(text).toContain("Thermal Conductivity")
    expect(text).toContain("Mohs Hardness")
    expect(text).toContain("Crystal Structure")
  })

  it("renders column headers, category labels, and the comparison table landmark", () => {
    const elementA = baseElement({ symbol: "Fe", name: "Iron" })
    const elementB = baseElement({
      symbol: "Cu",
      name: "Copper",
      atomicNumber: 29,
    })
    const w = shallowMount(CompareTable, {
      props: { elementA, elementB },
    })
    const symbols = w.findAll(".col-symbol")
    expect(symbols[0].text()).toMatch(/Fe/)
    expect(symbols[1].text()).toMatch(/Cu/)
    expect(w.find('[role="table"]').attributes("aria-label")).toBe("Element property comparison")
  })

  it("animates rows via gsap when motion is allowed and elements update", async () => {
    const a = baseElement({ name: "A" })
    const b = baseElement({ name: "B", atomicNumber: 30 })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    await nextTick()
    fromTo.mockClear()

    const a2 = { ...a, name: "A2" }
    await w.setProps({ elementA: a2 })
    await nextTick()
    expect(fromTo).toHaveBeenCalled()
  })

  it("skips gsap when prefers-reduced-motion is set", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      media: query,
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const a = baseElement({})
    const b = baseElement({ atomicNumber: 30 })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    await nextTick()
    fromTo.mockClear()
    const a2 = { ...a, name: "X" }
    await w.setProps({ elementA: a2 })
    await nextTick()
    expect(fromTo).not.toHaveBeenCalled()
  })

  it("uses absolute scaling for bar widths when a numeric value is negative", async () => {
    const a = baseElement({ electronAffinity: -50 })
    const b = baseElement({ atomicNumber: 30, electronAffinity: 100 })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    await nextTick()
    const fills = w.findAll(".bar-fill")
    expect(fills.length).toBeGreaterThan(0)
  })

  it("shows text badges for numeric rows when both values are null", () => {
    const a = baseElement({
      vanDerWaalsRadius: null,
      thermalConductivity: null,
    })
    const b = baseElement({
      atomicNumber: 30,
      vanDerWaalsRadius: null,
      thermalConductivity: null,
    })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    const muted = w.findAll(".cat-badge--muted")
    expect(muted.length).toBeGreaterThan(0)
  })

  it("gives 100% bar to the side that has a numeric value when the other is null", () => {
    const a = baseElement({ density: 3.5, atomicNumber: 26 })
    const b = baseElement({ atomicNumber: 30, density: null })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    const densityRow = w.findAll(".ratio-row").find((r) => r.text().includes("Density"))
    expect(densityRow?.find(".bar-fill--a").attributes("style")).toContain("width: 100%")
    expect(densityRow?.find(".bar-fill--b").attributes("style")).toContain("width: 0%")
  })

  it("gives 100% bar to B when A is null and B has a numeric value", () => {
    const a = baseElement({ density: null })
    const b = baseElement({ atomicNumber: 30, density: 8.2 })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    const densityRow = w.findAll(".ratio-row").find((r) => r.text().includes("Density"))
    expect(densityRow?.find(".bar-fill--a").attributes("style")).toContain("width: 0%")
    expect(densityRow?.find(".bar-fill--b").attributes("style")).toContain("width: 100%")
  })

  it("renders a year discovered string when the field is set", () => {
    const a = baseElement({ yearDiscovered: 1898 })
    const b = baseElement({ atomicNumber: 30, yearDiscovered: "Ancient" })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    expect(w.text()).toContain("1898")
    expect(w.text()).toContain("Ancient")
  })

  it("leaves both bars at 0% for a non-negative row when both values are zero", () => {
    const a = baseElement({ meltingPoint: 0, boilingPoint: 1 })
    const b = baseElement({
      atomicNumber: 30,
      meltingPoint: 0,
      boilingPoint: 1,
    })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    const row = w.findAll(".ratio-row").find((r) => r.text().includes("Melting Point"))
    expect(row?.find(".bar-fill--a").attributes("style")).toContain("width: 0%")
    expect(row?.find(".bar-fill--b").attributes("style")).toContain("width: 0%")
  })

  it("does not apply bar fill in the sign-mixed branch when max(|a|,|b|) is not positive", () => {
    const a = baseElement({ electronAffinity: Number.NaN })
    const b = baseElement({ atomicNumber: 30, electronAffinity: 1 })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    const row = w.findAll(".ratio-row").find((r) => r.text().includes("Electron Affinity"))
    expect(row?.find(".bar-fill--a").attributes("style")).toContain("width: 0%")
  })

  it("skips gsap when the table body reports no .ratio-row nodes", async () => {
    const a = baseElement({})
    const b = baseElement({ atomicNumber: 30 })
    const w = shallowMount(CompareTable, {
      props: { elementA: a, elementB: b },
    })
    await nextTick()
    const el = w.find(".ratio-rows").element
    const spy = vi.spyOn(el, "querySelectorAll")
    spy.mockReturnValue({ length: 0 } as NodeListOf<HTMLElement>)
    fromTo.mockClear()
    await w.setProps({ elementA: { ...a, name: "NoRowNodes" } })
    await nextTick()
    expect(fromTo).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
