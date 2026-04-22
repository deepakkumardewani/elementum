import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { nextTick } from "vue"
import { baseElement } from "@/components/tools/test-element-fixture"
import { useBookmarkStore } from "@/stores/bookmarkStore"
import { useElementStore } from "@/stores/elementStore"
import BookmarksPanel from "./BookmarksPanel.vue"

describe("BookmarksPanel", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    document.documentElement.style.overflow = ""
    document.body.style.overflow = ""
  })

  it("renders nothing in the body slot when closed", () => {
    setActivePinia(createPinia())
    mount(BookmarksPanel, { props: { open: false } })
    expect(document.querySelector(".bookmarks-panel-root")).toBeNull()
  })

  it("locks and unlocks body scroll as the open prop toggles", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const w = mount(BookmarksPanel, {
      props: { open: false },
      global: { plugins: [pinia] },
      attachTo: document.body,
    })
    w.setProps({ open: true })
    await nextTick()
    expect(document.documentElement.style.overflow).toBe("hidden")
    w.setProps({ open: false })
    await nextTick()
    expect(document.documentElement.style.overflow).toBe("")
    w.unmount()
  })

  it("shows the empty state when open and there are no bookmarks", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useElementStore()
    store.elements = [baseElement({})]

    const w = mount(BookmarksPanel, {
      props: { open: true },
      global: { plugins: [pinia] },
      attachTo: document.body,
    })
    await flushPromises()
    const empty = document.body.querySelector(".bookmarks-empty")
    expect(empty?.textContent).toMatch(/No bookmarks yet/)
    w.setProps({ open: false })
    await nextTick()
    w.unmount()
  })

  it("lists bookmarked elements, opens detail, and closes on Escape and backdrop", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const elementStore = useElementStore()
    const bookmarkStore = useBookmarkStore()
    elementStore.elements = [baseElement({ atomicNumber: 1, name: "Hydrogen", symbol: "H" })]
    bookmarkStore.toggleBookmark(1)

    const w = mount(BookmarksPanel, {
      props: { open: true },
      global: { plugins: [pinia] },
      attachTo: document.body,
    })
    await flushPromises()
    const tile = document.body.querySelector(".bookmark-mini-tile") as HTMLButtonElement | null
    expect(tile).toBeTruthy()
    expect(tile?.querySelector(".mini-sym")?.textContent).toBe("H")
    tile?.click()
    expect(elementStore.selectedElement?.atomicNumber).toBe(1)
    expect(w.emitted()["update:open"]?.[0]).toEqual([false])

    w.setProps({ open: true })
    const backdrop = document.body.querySelector(".bookmarks-backdrop") as HTMLElement
    expect(backdrop).toBeTruthy()
    backdrop?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(w.emitted()["update:open"]?.slice(-1)[0]).toEqual([false])

    w.setProps({ open: true })
    await nextTick()
    const evt = new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    window.dispatchEvent(evt)
    expect(w.emitted()["update:open"]?.slice(-1)[0]).toEqual([false])
    w.unmount()
  })
})
