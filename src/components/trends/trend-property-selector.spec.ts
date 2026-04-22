import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it } from "vitest"
import { useUiStore } from "@/stores/uiStore"
import { TREND_PROPERTY_META } from "@/utils/trendData"
import TrendPropertySelector from "./TrendPropertySelector.vue"

describe("TrendPropertySelector", () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it("renders one pill per trend property with meta labels", () => {
    const wrapper = mount(TrendPropertySelector, {
      global: { plugins: [pinia] },
    })
    const buttons = wrapper.findAll("button.selector-pill")
    expect(buttons).toHaveLength(7)
    expect(buttons[0].text()).toBe(TREND_PROPERTY_META.atomicRadius.label)
    expect(buttons[buttons.length - 1]?.text()).toBe(TREND_PROPERTY_META.boilingPoint.label)
  })

  it("marks the active property from ui store and sets aria-pressed", async () => {
    const ui = useUiStore()
    ui.setTrendProperty("density")
    const wrapper = mount(TrendPropertySelector, {
      global: { plugins: [pinia] },
    })
    const densityBtn = wrapper
      .findAll("button.selector-pill")
      .find((b) => b.text() === TREND_PROPERTY_META.density.label)
    expect(densityBtn?.classes()).toContain("active")
    expect(densityBtn?.attributes("aria-pressed")).toBe("true")

    const other = wrapper
      .findAll("button.selector-pill")
      .find((b) => b.text() === TREND_PROPERTY_META.atomicRadius.label)
    expect(other?.classes()).not.toContain("active")
    expect(other?.attributes("aria-pressed")).toBe("false")
  })

  it("updates the store when a pill is clicked", async () => {
    const ui = useUiStore()
    ui.setTrendProperty("atomicRadius")
    const wrapper = mount(TrendPropertySelector, {
      global: { plugins: [pinia] },
    })
    const btn = wrapper
      .findAll("button.selector-pill")
      .find((b) => b.text() === TREND_PROPERTY_META.electronegativity.label)
    expect(btn).toBeDefined()
    await btn?.trigger("click")
    expect(ui.activeTrendProperty).toBe("electronegativity")
  })

  it("exposes the selector as an aria-labeled group", () => {
    const wrapper = mount(TrendPropertySelector, {
      global: { plugins: [pinia] },
    })
    const root = wrapper.get(".selector-wrapper")
    expect(root.attributes("role")).toBe("group")
    expect(root.attributes("aria-label")).toBe("Select trend property")
  })
})
