import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import { baseElement } from "@/components/tools/test-element-fixture"
import VueApexChartsStub from "@/test-stubs/vue3-apexcharts"
import PeriodicHeatmap from "./PeriodicHeatmap.vue"
import TrendChart from "./TrendChart.vue"

vi.mock("@/utils/trendData", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/utils/trendData")>()
  return {
    ...mod,
    TREND_PROPERTY_META: {
      ...mod.TREND_PROPERTY_META,
      electronAffinity: {
        ...mod.TREND_PROPERTY_META.electronAffinity,
        unit: "",
      },
      meltingPoint: {
        ...mod.TREND_PROPERTY_META.meltingPoint,
        unit: "",
      },
    },
  }
})

describe("trends components when TREND_PROPERTY_META.unit is empty", () => {
  it("heatmap omits legend unit chips and unit suffix in cell titles (main + f-block)", () => {
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
              electronAffinity: 72.8,
            }),
            baseElement({
              atomicNumber: 58,
              symbol: "Ce",
              name: "Cerium",
              xpos: 4,
              ypos: 9,
              category: "lanthanide",
              block: "f",
              electronAffinity: 55,
            }),
          ],
        },
        ui: { activeTrendProperty: "electronAffinity" },
      },
    })

    const wrapper = mount(PeriodicHeatmap, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.find(".legend").findAll(".legend-unit")).toHaveLength(0)

    const mainCell = wrapper.find(".main-grid .heat-cell")
    expect(mainCell.attributes("title")).toBe("Hydrogen (H): 72.80")

    const fCell = wrapper.find(".fblock-grid .heat-cell")
    expect(fCell.attributes("title")).toBe("Cerium (Ce): 55.00")
  })

  it("chart omits y-axis title text and numeric tooltip suffix when unit is empty", async () => {
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
              meltingPoint: 14.01,
            }),
          ],
        },
        ui: { activeTrendProperty: "meltingPoint" },
      },
    })

    const wrapper = mount(TrendChart, {
      global: { plugins: [pinia] },
    })
    await flushPromises()

    const apex = wrapper.findComponent(VueApexChartsStub)
    expect(apex.exists()).toBe(true)

    const opts = apex.props("options") as {
      yaxis: { title: { text: string | undefined } }
      tooltip: { custom: (ctx: { dataPointIndex: number }) => string }
    }

    expect(opts.yaxis.title.text).toBeUndefined()

    const html = opts.tooltip.custom({ dataPointIndex: 0 })
    expect(html).toContain("14.01")
    expect(html).not.toMatch(/\b14\.01\s+K\b/)
  })
})
