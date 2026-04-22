import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it } from "vitest"
import { TABLE_COLOR_MODE_OPTIONS } from "@/composables/usePropertyColor"
import { useUiStore } from "@/stores/uiStore"
import type { TableColorMode } from "@/types/element"
import ColorModeSelector from "./ColorModeSelector.vue"

describe("ColorModeSelector", () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it("renders label wired to the select and accessibility attributes", () => {
    const wrapper = mount(ColorModeSelector, {
      global: { plugins: [pinia] },
    })

    const label = wrapper.get("label[for='table-color-mode']")
    expect(label.classes()).toContain("selector-label")
    expect(label.text()).toContain("Color by")

    const select = wrapper.get("select#table-color-mode")
    expect(select.attributes("aria-label")).toBe("Color table tiles by category or property trend")
  })

  it("lists every table color option with label and value", () => {
    const wrapper = mount(ColorModeSelector, {
      global: { plugins: [pinia] },
    })

    const options = wrapper.findAll("option")
    expect(options).toHaveLength(TABLE_COLOR_MODE_OPTIONS.length)

    for (const [i, expected] of TABLE_COLOR_MODE_OPTIONS.entries()) {
      const option = options[i]
      if (option === undefined) {
        throw new Error(`missing <option> at index ${String(i)}`)
      }
      expect(option.text()).toBe(expected.label)
      expect(option.attributes("value")).toBe(expected.value)
    }
  })

  it("binds the select to uiStore.colorMode and updates the store on change", async () => {
    const store = useUiStore()
    expect(store.colorMode).toBe("category")

    const wrapper = mount(ColorModeSelector, {
      global: { plugins: [pinia] },
    })

    const select = wrapper.get<HTMLSelectElement>("select#table-color-mode")
    expect(select.element.value).toBe("category")

    const next: TableColorMode = "atomicRadius"
    select.element.value = next
    await select.trigger("change")
    await flushPromises()

    expect(store.colorMode).toBe("atomicRadius")
    expect(select.element.value).toBe("atomicRadius")
  })
})
