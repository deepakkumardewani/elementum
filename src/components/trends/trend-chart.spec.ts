import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import { baseElement } from "@/components/tools/test-element-fixture"
import VueApexChartsStub from "@/test-stubs/vue3-apexcharts"
import { TREND_PROPERTY_META } from "@/utils/trendData"
import TrendChart from "./TrendChart.vue"

function getApexProps(wrapper: ReturnType<typeof mount<typeof TrendChart>>) {
  const apex = wrapper.findComponent(VueApexChartsStub)
  expect(apex.exists()).toBe(true)
  return apex
}

type TestingPiniaOptions = NonNullable<Parameters<typeof createTestingPinia>[0]>

function trendTestingPinia(initialState: NonNullable<TestingPiniaOptions["initialState"]>) {
  return createTestingPinia({ createSpy: vi.fn, initialState })
}

describe("TrendChart", () => {
  it("sets chart aria-label from the active trend property", async () => {
    const pinia = trendTestingPinia({
      element: {
        elements: [
          baseElement({
            atomicNumber: 1,
            symbol: "H",
            name: "Hydrogen",
            xpos: 1,
            ypos: 1,
            density: 1.2,
          }),
        ],
      },
      ui: { activeTrendProperty: "density" },
    })

    const wrapper = mount(TrendChart, {
      global: { plugins: [pinia] },
    })
    await flushPromises()

    const root = wrapper.get(".chart-container")
    expect(root.attributes("aria-label")).toBe(`${TREND_PROPERTY_META.density.label} trend chart`)
    expect(root.attributes("role")).toBe("img")
  })

  it("passes bar series and category colors derived from elements", async () => {
    const pinia = trendTestingPinia({
      element: {
        elements: [
          baseElement({
            atomicNumber: 2,
            symbol: "He",
            name: "Helium",
            xpos: 18,
            ypos: 1,
            category: "noble gas",
            boilingPoint: 4.2,
          }),
          baseElement({
            atomicNumber: 1,
            symbol: "H",
            name: "Hydrogen",
            xpos: 1,
            ypos: 1,
            category: "nonmetal",
            boilingPoint: 20.2,
          }),
        ],
      },
      ui: { activeTrendProperty: "boilingPoint" },
    })

    const wrapper = mount(TrendChart, {
      global: { plugins: [pinia] },
    })
    await flushPromises()

    const apex = getApexProps(wrapper)
    const series = apex.props("series") as {
      name: string
      data: { x: string; y: number | null }[]
    }[]
    expect(series[0].name).toBe(TREND_PROPERTY_META.boilingPoint.label)
    expect(series[0].data.map((d) => d.x)).toEqual(["H", "He"])
    const opts = apex.props("options") as {
      colors: string[]
      xaxis: { categories: string[] }
    }
    expect(opts.xaxis.categories).toEqual(["H", "He"])
    expect(opts.colors.length).toBe(2)
  })

  it("uses dark-theme grid and label tokens when isDark is true", async () => {
    const pinia = trendTestingPinia({
      element: {
        elements: [
          baseElement({
            atomicNumber: 1,
            symbol: "H",
            name: "Hydrogen",
            xpos: 1,
            ypos: 1,
            atomicRadius: 50,
          }),
        ],
      },
      ui: { activeTrendProperty: "atomicRadius", isDark: true },
    })

    const wrapper = mount(TrendChart, {
      global: { plugins: [pinia] },
    })
    await flushPromises()

    const opts = getApexProps(wrapper).props("options") as {
      grid: { borderColor: string }
      tooltip: { theme: string }
    }
    expect(opts.grid.borderColor).toBe("#1f2d45")
    expect(opts.tooltip.theme).toBe("dark")
  })

  it("uses light-theme tokens when isDark is false", async () => {
    const pinia = trendTestingPinia({
      element: {
        elements: [
          baseElement({
            atomicNumber: 1,
            symbol: "H",
            name: "Hydrogen",
            xpos: 1,
            ypos: 1,
            atomicRadius: 50,
          }),
        ],
      },
      ui: { activeTrendProperty: "atomicRadius", isDark: false },
    })

    const wrapper = mount(TrendChart, {
      global: { plugins: [pinia] },
    })
    await flushPromises()

    const opts = getApexProps(wrapper).props("options") as {
      grid: { borderColor: string }
      tooltip: { theme: string }
    }
    expect(opts.grid.borderColor).toBe("#d1d9e6")
    expect(opts.tooltip.theme).toBe("light")
  })

  it("formats y-axis labels for integers and decimals", async () => {
    const pinia = trendTestingPinia({
      element: {
        elements: [
          baseElement({
            atomicNumber: 1,
            symbol: "H",
            name: "Hydrogen",
            xpos: 1,
            ypos: 1,
            electronegativity: 2.2,
          }),
        ],
      },
      ui: { activeTrendProperty: "electronegativity" },
    })

    const wrapper = mount(TrendChart, {
      global: { plugins: [pinia] },
    })
    await flushPromises()

    const fmt = (
      getApexProps(wrapper).props("options") as {
        yaxis: {
          labels: { formatter: (v: number | null | undefined) => string }
        }
      }
    ).yaxis.labels.formatter

    expect(fmt(4)).toBe("4")
    expect(fmt(4.5)).toBe("4.50")
    expect(fmt(null)).toBe("—")
    expect(fmt(undefined)).toBe("—")
  })

  it("builds a custom tooltip with escaped names and formatted values", async () => {
    const pinia = trendTestingPinia({
      element: {
        elements: [
          baseElement({
            atomicNumber: 1,
            symbol: "H>",
            name: "Hydrogen<test>",
            xpos: 1,
            ypos: 1,
            meltingPoint: 14.01,
          }),
          baseElement({
            atomicNumber: 2,
            symbol: "He",
            name: "Helium",
            xpos: 18,
            ypos: 1,
            meltingPoint: null,
          }),
        ],
      },
      ui: { activeTrendProperty: "meltingPoint" },
    })

    const wrapper = mount(TrendChart, {
      global: { plugins: [pinia] },
    })
    await flushPromises()

    const custom = (
      getApexProps(wrapper).props("options") as {
        tooltip: { custom: (ctx: { dataPointIndex: number }) => string }
      }
    ).tooltip.custom

    const html0 = custom({ dataPointIndex: 0 })
    expect(html0).toContain("&lt;")
    expect(html0).toContain("&gt;")
    expect(html0).toContain("14.01")
    expect(html0).toContain(TREND_PROPERTY_META.meltingPoint.unit)

    const html1 = custom({ dataPointIndex: 1 })
    expect(html1).toContain("—")

    const htmlMissing = custom({ dataPointIndex: 99 })
    expect(htmlMissing).toContain("—")
  })
})
