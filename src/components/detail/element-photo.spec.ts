import { flushPromises, mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import ElementPhoto from "@/components/detail/ElementPhoto.vue"
import { baseElement } from "@/components/tools/test-element-fixture"

describe("ElementPhoto", () => {
  it("renders nothing when element has no image", () => {
    const w = mount(ElementPhoto, {
      props: { element: baseElement({ image: null }) },
    })
    expect(w.find(".element-photo").exists()).toBe(false)
  })

  it("enables zoom after load and opens lightbox on click", async () => {
    const w = mount(ElementPhoto, {
      props: {
        element: baseElement({
          image: {
            title: "Iron sample",
            url: "https://example.com/fe.jpg",
            attribution: "Wiki",
          },
        }),
      },
      attachTo: document.body,
    })
    const frame = w.find(".photo-frame")
    expect(frame.attributes("disabled")).toBeDefined()
    await frame.trigger("click")
    await flushPromises()
    expect(document.querySelector(".lightbox-backdrop")).toBeNull()
    await w.find(".photo-img").trigger("load")
    expect(frame.attributes("disabled")).toBeUndefined()
    await frame.trigger("click")
    await flushPromises()
    const backdrop = document.querySelector(".lightbox-backdrop")
    expect(backdrop).toBeTruthy()
    expect(backdrop?.textContent).toContain("Iron sample")
    const closeBtn = document.querySelector(".lightbox-close")
    expect(closeBtn).toBeTruthy()
    ;(closeBtn as HTMLButtonElement).click()
    await flushPromises()
    expect(document.querySelector(".lightbox-backdrop")).toBeNull()
    w.unmount()
  })

  it("closes the lightbox on Escape before other listeners run", async () => {
    const w = mount(ElementPhoto, {
      props: {
        element: baseElement({
          image: {
            title: "Sample",
            url: "https://example.com/x.png",
            attribution: "CC",
          },
        }),
      },
      attachTo: document.body,
    })
    await w.find(".photo-img").trigger("load")
    await w.find(".photo-frame").trigger("click")
    await flushPromises()
    expect(document.querySelector(".lightbox-backdrop")).toBeTruthy()
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    await flushPromises()
    expect(document.querySelector(".lightbox-backdrop")).toBeNull()
    w.unmount()
  })
})
