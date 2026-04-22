import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { useUiStore } from "@/stores/uiStore"
import ThemeToggle from "./ThemeToggle.vue"

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.documentElement.removeAttribute("data-theme")
  })

  it("toggles local theme, aria state, and which icon is shown", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const ui = useUiStore()
    ui.isDark = true

    const w = mount(ThemeToggle, { global: { plugins: [pinia] } })
    const btn = w.get("[data-testid=theme-toggle]")

    expect(btn.attributes("aria-label")).toBe("Switch to light mode")
    expect(w.find("svg path").exists()).toBe(true)

    await btn.trigger("click")
    expect(ui.isDark).toBe(false)
    expect(btn.attributes("aria-label")).toBe("Switch to dark mode")
    expect(btn.attributes("aria-pressed")).toBe("true")
    expect(document.documentElement.getAttribute("data-theme")).toBe("light")

    await btn.trigger("click")
    expect(ui.isDark).toBe(true)
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
  })
})
