import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import AppFooter from "./AppFooter.vue"

describe("AppFooter", () => {
  it("renders a footer and embeds the data sources disclosure", () => {
    const w = mount(AppFooter)
    expect(w.find("footer.app-footer").exists()).toBe(true)
    expect(w.find("#data-sources").exists()).toBe(true)
  })
})
