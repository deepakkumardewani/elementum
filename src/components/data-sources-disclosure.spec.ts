import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { nextTick } from "vue"
import DataSourcesDisclosure from "./DataSourcesDisclosure.vue"

describe("DataSourcesDisclosure", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("toggles expansion from the header click and exposes extra copy when expanded", async () => {
    const w = mount(DataSourcesDisclosure)
    const header = w.get(".data-sources__header")
    expect(header.attributes("aria-expanded")).toBe("false")
    expect(w.find("#data-sources").find(".data-sources__expanded").exists()).toBe(false)

    await header.trigger("click")
    expect(header.attributes("aria-expanded")).toBe("true")
    expect(w.find(".data-sources__details").exists()).toBe(true)

    await header.trigger("click")
    expect(header.attributes("aria-expanded")).toBe("false")
  })

  it("toggles on Enter and Space on the header", async () => {
    const w = mount(DataSourcesDisclosure)
    const header = w.get(".data-sources__header")
    await header.trigger("keydown", { key: "Enter" })
    expect(header.attributes("aria-expanded")).toBe("true")
    await header.trigger("keydown", { key: " " })
    expect(header.attributes("aria-expanded")).toBe("false")
  })

  it("does not toggle when a link inside the expanded region is the click target", async () => {
    const w = mount(DataSourcesDisclosure)
    await w.get(".data-sources__header").trigger("click")
    await nextTick()
    const link = w.get('a[href="https://www.wikidata.org/"]')
    const a = link.element
    a.addEventListener("click", (e) => e.preventDefault(), {
      once: true,
      capture: true,
    })
    await link.trigger("click")
    expect(w.get(".data-sources__header").attributes("aria-expanded")).toBe("true")
  })
})
