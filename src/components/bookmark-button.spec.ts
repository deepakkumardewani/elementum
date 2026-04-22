import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useBookmarkStore } from "@/stores/bookmarkStore"
import BookmarkButton from "./BookmarkButton.vue"

describe("BookmarkButton", () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("toggles pressed state, aria-label, and compact class", async () => {
    setActivePinia(createPinia())
    const w = mount(BookmarkButton, {
      props: { atomicNumber: 1, compact: true },
    })
    const btn = w.get("button")
    expect(btn.attributes("aria-pressed")).toBe("false")
    expect(btn.classes()).toContain("is-compact")
    expect(btn.attributes("aria-label")).toBe("Bookmark element 1")

    await btn.trigger("click")
    expect(useBookmarkStore().isBookmarked(1)).toBe(true)
    expect(btn.attributes("aria-pressed")).toBe("true")
    expect(btn.attributes("aria-label")).toBe("Remove 1 from bookmarks")
  })

  it("runs fill animation phase timers when becoming bookmarked", async () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const w = mount(BookmarkButton, { props: { atomicNumber: 2 } })
    const btn = w.get("button")

    await btn.trigger("click")
    expect(btn.classes()).toContain("is-bookmark-draw")
    await vi.advanceTimersByTimeAsync(550)
    await flushPromises()
    expect(btn.classes()).toContain("is-bookmark-fill-reveal")
    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()
  })

  it("clears animation timers on unmount", async () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const w = mount(BookmarkButton, { props: { atomicNumber: 3 } })
    await w.get("button").trigger("click")
    w.unmount()
    await vi.runAllTimersAsync()
  })

  it("cancels the fill phase timer when unbookmarking mid-animation", async () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const w = mount(BookmarkButton, { props: { atomicNumber: 4 } })
    const btn = w.get("button")
    await btn.trigger("click")
    await vi.advanceTimersByTimeAsync(600)
    await btn.trigger("click")
    await vi.runAllTimersAsync()
  })
})
