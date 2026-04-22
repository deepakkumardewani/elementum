import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it } from "vitest"
import { nextTick } from "vue"
import { createMemoryHistory, createRouter } from "vue-router"
import { useBookmarkStore } from "@/stores/bookmarkStore"
import AppHeader from "./AppHeader.vue"

describe("AppHeader", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  function makeRouter() {
    return createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "home", component: { template: "<div />" } },
        {
          path: "/compare",
          name: "compare",
          component: { template: "<div />" },
        },
        { path: "/trends", name: "trends", component: { template: "<div />" } },
        { path: "/quiz", name: "quiz", component: { template: "<div />" } },
        { path: "/tools", name: "tools", component: { template: "<div />" } },
      ],
    })
  }

  it("includes SearchBar on the home route and omits it elsewhere", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = makeRouter()
    await router.push("/")
    await router.isReady()

    const w = mount(AppHeader, {
      global: {
        plugins: [pinia, router],
        stubs: { BookmarksPanel: true },
      },
    })
    await flushPromises()
    expect(w.find(".search-bar").exists()).toBe(true)

    await router.push("/compare")
    await nextTick()
    expect(w.find(".search-bar").exists()).toBe(false)
    w.unmount()
  })

  it("shows a bookmark count badge, opens the bookmarks control, and reacts to scroll", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const b = useBookmarkStore()
    b.toggleBookmark(1)
    b.toggleBookmark(2)
    const router = makeRouter()
    await router.push("/")
    await router.isReady()

    const w = mount(AppHeader, { global: { plugins: [pinia, router] } })
    await flushPromises()
    expect(w.get(".bookmarks-badge").text()).toBe("2")

    await w.get('button[aria-label="Open bookmarks"]').trigger("click")
    const panel = document.body.querySelector('.bookmarks-panel[role="dialog"]')
    expect(panel).toBeTruthy()
    document.body
      .querySelector(".bookmarks-backdrop")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await nextTick()
    expect(document.querySelector('.bookmarks-panel[role="dialog"]')).toBeNull()

    expect(w.get(".app-header").classes("is-scrolled")).toBe(false)
    Object.defineProperty(window, "scrollY", { configurable: true, value: 10 })
    window.dispatchEvent(new Event("scroll"))
    await nextTick()
    expect(w.get(".app-header").classes("is-scrolled")).toBe(true)

    w.unmount()
  })
})
