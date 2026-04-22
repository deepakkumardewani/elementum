import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import type { Element } from "@/types/element"
import MiniPeriodicGrid from "./MiniPeriodicGrid.vue"

function testElement(overrides: Partial<Element>): Element {
  return {
    name: "Test",
    symbol: "T",
    atomicNumber: 1,
    atomicMass: 1,
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
    electronegativity: 1,
    atomicRadius: 1,
    ionizationEnergy: 1,
    electronAffinity: 1,
    density: 1,
    meltingPoint: 1,
    boilingPoint: 1,
    oxidationStates: null,
    spectralLines: [],
    funFacts: [],
    compounds: [],
    summary: "",
    discoverer: null,
    yearDiscovered: null,
    ...overrides,
  }
}

describe("MiniPeriodicGrid", () => {
  const mainEl = testElement({
    name: "Hydrogen",
    symbol: "H",
    atomicNumber: 1,
    xpos: 1,
    ypos: 1,
  })
  const mainEl2 = testElement({
    name: "Helium",
    symbol: "He",
    atomicNumber: 2,
    category: "noble gas",
    xpos: 18,
    ypos: 1,
  })
  const fBlockEl = testElement({
    name: "Lanthanum",
    symbol: "La",
    atomicNumber: 57,
    category: "lanthanide",
    xpos: 3,
    ypos: 9,
  })

  it("renders main-period tiles, gap placeholders, f-block separator, and f-block tiles", () => {
    const w = mount(MiniPeriodicGrid, {
      props: {
        elements: [mainEl, mainEl2, fBlockEl],
        selectedNumber: null,
        otherNumber: null,
        dimmedNumbers: null,
      },
    })

    expect(w.text()).toContain("57–71")
    expect(w.text()).toContain("89–103")
    expect(w.text()).toContain("f-block")
    expect(w.text()).toContain("H")
    expect(w.text()).toContain("He")
    expect(w.text()).toContain("La")
  })

  it("emits select when a non-other tile is clicked", async () => {
    const w = mount(MiniPeriodicGrid, {
      props: {
        elements: [mainEl, mainEl2],
        selectedNumber: null,
        otherNumber: null,
        dimmedNumbers: null,
      },
    })

    await w
      .findAll("button")
      .find((b) => b.text() === "H")
      ?.trigger("click")
    expect(w.emitted("select")?.[0]).toEqual([mainEl])
  })

  it("does not emit when the tile is the other slot element", async () => {
    const w = mount(MiniPeriodicGrid, {
      props: {
        elements: [mainEl, mainEl2],
        selectedNumber: null,
        otherNumber: 2,
        dimmedNumbers: null,
      },
    })

    const heBtn = w.findAll("button").find((b) => b.text() === "He")
    expect(heBtn?.attributes("disabled")).toBeDefined()
    await heBtn?.trigger("click")
    expect(w.emitted("select")).toBeUndefined()
  })

  it("still does not emit for the other element when the click runs without disabled (handler guard)", async () => {
    const w = mount(MiniPeriodicGrid, {
      props: {
        elements: [mainEl, mainEl2],
        selectedNumber: null,
        otherNumber: 2,
        dimmedNumbers: null,
      },
    })
    const heBtn = w.findAll("button").find((b) => b.text() === "He")
    if (!heBtn) throw new Error("expected He button")
    heBtn.element.removeAttribute("disabled")
    await heBtn.trigger("click")
    expect(w.emitted("select")).toBeUndefined()
  })

  it("marks selected and other tiles with expected classes", () => {
    const w = mount(MiniPeriodicGrid, {
      props: {
        elements: [mainEl, mainEl2],
        selectedNumber: 1,
        otherNumber: 2,
        dimmedNumbers: null,
      },
    })

    const hBtn = w.findAll("button").find((b) => b.text() === "H")
    const heBtn = w.findAll("button").find((b) => b.text() === "He")
    expect(hBtn?.classes()).toContain("is-selected")
    expect(heBtn?.classes()).toContain("is-other")
  })

  it("applies is-dimmed when dimmedNumbers is a set that excludes a tile", () => {
    const w = mount(MiniPeriodicGrid, {
      props: {
        elements: [mainEl, mainEl2],
        selectedNumber: null,
        otherNumber: null,
        dimmedNumbers: new Set([1]),
      },
    })

    const hBtn = w.findAll("button").find((b) => b.text() === "H")
    const heBtn = w.findAll("button").find((b) => b.text() === "He")
    expect(hBtn?.classes().includes("is-dimmed")).toBe(false)
    expect(heBtn?.classes()).toContain("is-dimmed")
  })

  it("exposes group semantics for the picker grid", () => {
    const w = mount(MiniPeriodicGrid, {
      props: {
        elements: [mainEl],
        selectedNumber: null,
        otherNumber: null,
        dimmedNumbers: null,
      },
    })
    const group = w.find('[role="group"]')
    expect(group.attributes("aria-label")).toBe("Element picker grid")
  })

  it("emits select when an f-block tile is clicked", async () => {
    const w = mount(MiniPeriodicGrid, {
      props: {
        elements: [mainEl, fBlockEl],
        selectedNumber: null,
        otherNumber: null,
        dimmedNumbers: null,
      },
    })

    await w
      .findAll("button")
      .find((b) => b.text() === "La")
      ?.trigger("click")
    expect(w.emitted("select")?.[0]).toEqual([fBlockEl])
  })
})
