import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { nextTick } from "vue"
import { baseElement } from "@/components/tools/test-element-fixture"
import { useTooltip } from "@/composables/useTooltip"
import ElementHoverCard from "./ElementHoverCard.vue"

function mockRect(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    x: 0,
    y: 0,
    top: 100,
    left: 100,
    right: 120,
    bottom: 120,
    width: 20,
    height: 20,
    toJSON: () => ({}),
    ...overrides,
  } as DOMRect
}

async function advanceTooltipOpen() {
  await vi.advanceTimersByTimeAsync(300)
  await nextTick()
}

describe("ElementHoverCard", () => {
  let wrapper: ReturnType<typeof mount> | undefined

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal("innerWidth", 2000)
    vi.stubGlobal("innerHeight", 1000)
  })

  afterEach(() => {
    wrapper?.unmount()
    useTooltip().hideTooltip()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it("renders a rich hover card when the tooltip state is set", async () => {
    wrapper = mount(ElementHoverCard)
    const { showTooltip } = useTooltip()
    const el = baseElement({ electronShells: [] })
    showTooltip(el, mockRect({ right: 100, top: 50, left: 80, width: 20, height: 20 }))
    await advanceTooltipOpen()

    const node = document.body.querySelector(".hover-card[role=tooltip]") as HTMLElement
    expect(node).toBeTruthy()
    expect(node.textContent).toMatch(/Fe/)
    expect(node.querySelector(".hc-config")?.textContent).toMatch(/3d6/)
  })

  it("position prefers the right, then the left, then above when space is tight", async () => {
    wrapper = mount(ElementHoverCard)
    const { showTooltip, hideTooltip } = useTooltip()
    const el = baseElement({})

    showTooltip(el, mockRect({ right: 100, top: 200, left: 80, width: 20, height: 20 }))
    await advanceTooltipOpen()
    let card = document.body.querySelector(".hover-card") as HTMLElement
    expect(card.style.left).toBe("110px")

    hideTooltip()
    await nextTick()
    vi.stubGlobal("innerWidth", 400)
    showTooltip(el, mockRect({ right: 380, top: 200, left: 360, width: 20, height: 20 }))
    await advanceTooltipOpen()
    card = document.body.querySelector(".hover-card") as HTMLElement
    expect(card.style.left).toBe("50px")

    hideTooltip()
    await nextTick()
    vi.unstubAllGlobals()
    vi.stubGlobal("innerWidth", 500)
    vi.stubGlobal("innerHeight", 1000)
    showTooltip(
      el,
      mockRect({
        left: 280,
        right: 300,
        top: 200,
        width: 20,
        height: 20,
        bottom: 220,
      }),
    )
    await advanceTooltipOpen()
    card = document.body.querySelector(".hover-card") as HTMLElement
    expect(card.style.transform).toContain("translate(-50%")
  })

  it("formats null numeric stats and unknown phase labels", async () => {
    wrapper = mount(ElementHoverCard)
    const { showTooltip } = useTooltip()
    const el = baseElement({
      meltingPoint: null,
      boilingPoint: null,
      phase: "Unknown",
    })
    showTooltip(el, mockRect())
    await advanceTooltipOpen()
    const text = document.body.querySelector(".hover-card")?.textContent ?? ""
    expect(text).toMatch(/—/)
  })

  it("clamps vertical position when the card would overflow the top or bottom of the viewport", async () => {
    wrapper = mount(ElementHoverCard)
    const { showTooltip, hideTooltip } = useTooltip()
    const el = baseElement({})
    vi.unstubAllGlobals()
    vi.stubGlobal("innerWidth", 2000)
    vi.stubGlobal("innerHeight", 200)
    showTooltip(
      el,
      mockRect({
        right: 2000,
        left: 1980,
        top: 20,
        width: 20,
        height: 20,
        bottom: 40,
      }),
    )
    await advanceTooltipOpen()
    const card = document.body.querySelector(".hover-card") as HTMLElement
    const top = Number.parseFloat(card.style.top)
    expect(top).toBeGreaterThan(0)
    hideTooltip()
  })
})
