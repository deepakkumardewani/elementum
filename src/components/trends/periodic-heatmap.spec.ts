import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { describe, expect, it, vi } from "vitest"
import { baseElement } from "@/components/tools/test-element-fixture"
import { useElementStore } from "@/stores/elementStore"
import { useUiStore } from "@/stores/uiStore"
import { TREND_PROPERTY_META } from "@/utils/trendData"
import PeriodicHeatmap from "./PeriodicHeatmap.vue"

describe("PeriodicHeatmap", () => {
  it("renders lanthanide/actinide placeholders and f-block separator", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.text()).toContain("57–71")
    expect(wrapper.text()).toContain("89–103")
    expect(wrapper.text()).toContain("f-block")
  })

  it("shows legend endpoints with units for the active trend property", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useElementStore()
    const ui = useUiStore()
    ui.setTrendProperty("atomicRadius")
    await store.loadElements()
    await flushPromises()

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    const legend = wrapper.get(".legend")
    expect(legend.attributes("aria-label")).toBe("Color scale legend")
    expect(legend.text()).toContain(TREND_PROPERTY_META.atomicRadius.unit)
    expect(legend.text()).not.toMatch(/^—/)
  })

  it("renders main-grid and f-block cells with symbols for loaded data", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    const mainCells = wrapper.find(".main-grid").findAll(".heat-cell")
    expect(mainCells.length).toBeGreaterThan(80)
    const fCells = wrapper.find(".fblock-grid").findAll(".heat-cell")
    expect(fCells.length).toBeGreaterThan(10)

    const h = mainCells.find((c) => c.find(".cell-symbol").text() === "H")
    expect(h).toBeDefined()
    expect(h?.attributes("role")).toBe("img")
    expect(h?.attributes("aria-label") ?? "").toMatch(/Hydrogen/)
  })

  it("uses em dash legend and transparent styling when no numeric values exist", () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        element: {
          elements: [
            baseElement({
              name: "Hydrogen",
              symbol: "H",
              atomicNumber: 1,
              xpos: 1,
              ypos: 1,
              atomicRadius: null,
              electronegativity: null,
            }),
          ],
        },
        ui: { activeTrendProperty: "atomicRadius" },
      },
    })

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    const legend = wrapper.get(".legend")
    const labels = legend.findAll(".legend-label")
    expect(labels[0].text()).toMatch(/^—/)
    expect(labels[1].text()).toMatch(/^—/)

    const cell = wrapper.find(".heat-cell")
    expect(cell.attributes("style") ?? "").toContain("--cell-bg: transparent")
  })

  it("formats large, medium, and small numeric cell labels", () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        element: {
          elements: [
            baseElement({
              atomicNumber: 1,
              symbol: "A",
              name: "Alpha",
              xpos: 1,
              ypos: 1,
              ionizationEnergy: 1500,
            }),
            baseElement({
              atomicNumber: 2,
              symbol: "B",
              name: "Bravo",
              xpos: 2,
              ypos: 1,
              ionizationEnergy: 150.4,
            }),
            baseElement({
              atomicNumber: 3,
              symbol: "C",
              name: "Charlie",
              xpos: 3,
              ypos: 1,
              ionizationEnergy: 15.25,
            }),
            baseElement({
              atomicNumber: 4,
              symbol: "D",
              name: "Delta",
              xpos: 4,
              ypos: 1,
              ionizationEnergy: 1.234,
            }),
          ],
        },
        ui: { activeTrendProperty: "ionizationEnergy" },
      },
    })

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    const values = wrapper
      .find(".main-grid")
      .findAll(".cell-value")
      .map((c) => c.text())
    expect(values).toContain("1500")
    expect(values).toContain("150.4")
    expect(values).toContain("15.25")
    expect(values).toContain("1.234")
  })

  it("uses a flat color when all values are equal (min equals max)", () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        element: {
          elements: [
            baseElement({
              atomicNumber: 1,
              symbol: "A",
              name: "Alpha",
              xpos: 1,
              ypos: 1,
              density: 5,
            }),
            baseElement({
              atomicNumber: 2,
              symbol: "B",
              name: "Bravo",
              xpos: 2,
              ypos: 1,
              density: 5,
            }),
          ],
        },
        ui: { activeTrendProperty: "density" },
      },
    })

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    const styles = wrapper
      .find(".main-grid")
      .findAll(".heat-cell")
      .map((c) => c.attributes("style") ?? "")
    expect(styles.every((s) => s.includes("hsl(210, 70%, 40%)"))).toBe(true)
  })

  it("places f-block cells on the condensed grid rows", () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        element: {
          elements: [
            baseElement({
              atomicNumber: 100,
              symbol: "Fm",
              name: "Fermium",
              xpos: 5,
              ypos: 10,
              category: "actinide",
              block: "f",
              density: 10,
            }),
          ],
        },
        ui: { activeTrendProperty: "density" },
      },
    })

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    const cell = wrapper.find(".fblock-grid .heat-cell")
    const style = cell.attributes("style") ?? ""
    expect(style).toContain("grid-row: 2")
    expect(style).toContain("grid-column: 5")
  })

  it("uses a default numeric range when there are no elements loaded", () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        element: { elements: [] },
        ui: { activeTrendProperty: "atomicRadius" },
      },
    })

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.find(".main-grid").findAll(".heat-cell")).toHaveLength(0)
    const legend = wrapper.get(".legend")
    expect(legend.text()).toMatch(/—/)
  })

  it("treats a non-numeric property value as missing for the cell color", () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        element: {
          elements: [
            baseElement({
              atomicNumber: 1,
              symbol: "H",
              name: "Hydrogen",
              xpos: 1,
              ypos: 1,
              // @ts-expect-error — exercise getValue() typeof guard with malformed data
              density: "9.99",
            }),
          ],
        },
        ui: { activeTrendProperty: "density" },
      },
    })

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.find(".heat-cell").attributes("style") ?? "").toContain("--cell-bg: transparent")
  })

  it("strips trailing zeros from small magnitudes in formatted values", () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        element: {
          elements: [
            baseElement({
              atomicNumber: 1,
              symbol: "A",
              name: "Alpha",
              xpos: 1,
              ypos: 1,
              electronAffinity: 2.5,
            }),
          ],
        },
        ui: { activeTrendProperty: "electronAffinity" },
      },
    })

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.find(".cell-value").text()).toBe("2.5")
  })
})
