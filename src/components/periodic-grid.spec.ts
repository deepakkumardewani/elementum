import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { describe, expect, it } from "vitest"
import { useElementStore } from "@/stores/elementStore"
import PeriodicGrid from "./PeriodicGrid.vue"

describe("PeriodicGrid", () => {
  it("mounts without error and renders group and period labels for the main table", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useElementStore()
    await store.loadElements()
    await flushPromises()

    const wrapper = mount(PeriodicGrid, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.find("#periodic-grid").exists()).toBe(true)
    const headers = wrapper.find(".grid-group-headers")
    expect(headers.exists()).toBe(true)
    expect(headers.findAll('[role="columnheader"]')).toHaveLength(18)
    expect(headers.text()).toMatch(/1/)
    expect(headers.text()).toMatch(/18/)

    const periods = wrapper.find(".period-labels")
    expect(periods.exists()).toBe(true)
    expect(periods.findAll('[role="rowheader"]')).toHaveLength(7)

    // F-block is separate; no duplicate period labels there
    expect(wrapper.findAll(".period-labels")).toHaveLength(1)
  })
})
