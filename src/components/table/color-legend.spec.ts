import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it } from "vitest"
import {
  formatTrendLegendValue,
  getTrendRange,
  TREND_PROPERTY_LABELS,
} from "@/composables/usePropertyColor"
import { useUiStore } from "@/stores/uiStore"
import ColorLegend from "./ColorLegend.vue"

describe("ColorLegend", () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it("renders nothing when the table is in category color mode", () => {
    const store = useUiStore()
    store.setColorMode("category")
    const wrapper = mount(ColorLegend, {
      global: { plugins: [pinia] },
    })
    expect(wrapper.find(".color-legend").exists()).toBe(false)
  })

  it("shows a labeled gradient, endpoints, and aria for a trend color mode", async () => {
    const store = useUiStore()
    const mode = "atomicRadius"
    store.setColorMode(mode)
    const wrapper = mount(ColorLegend, {
      global: { plugins: [pinia] },
    })
    await wrapper.vm.$nextTick()

    const root = wrapper.get(".color-legend")
    expect(root.find(".legend-title").text()).toBe(TREND_PROPERTY_LABELS[mode])

    const { min, max } = getTrendRange(mode)
    const minText = formatTrendLegendValue(mode, min)
    const maxText = formatTrendLegendValue(mode, max)
    expect(root.get(".legend-end--min").text()).toBe(minText)
    expect(root.get(".legend-end--max").text()).toBe(maxText)
    expect(root.attributes("role")).toBe("img")
    expect(root.attributes("aria-label")).toBe(
      `${TREND_PROPERTY_LABELS[mode]} scale from ${minText} to ${maxText}`,
    )

    const track = root.get(".legend-track")
    expect(track.attributes("style") ?? "").toMatch(/linear-gradient/)
  })

  it("hides again after switching from a trend back to category", async () => {
    const store = useUiStore()
    store.setColorMode("density")
    const wrapper = mount(ColorLegend, {
      global: { plugins: [pinia] },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find(".color-legend").exists()).toBe(true)

    store.setColorMode("category")
    await wrapper.vm.$nextTick()
    expect(wrapper.find(".color-legend").exists()).toBe(false)
  })
})
