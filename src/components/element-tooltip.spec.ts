import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { nextTick } from "vue"
import { baseElement } from "@/components/tools/test-element-fixture"
import { useTooltip } from "@/composables/useTooltip"
import ElementTooltip from "./ElementTooltip.vue"

const rect = (overrides: Partial<DOMRect> = {}): DOMRect =>
  ({
    x: 0,
    y: 0,
    top: 10,
    left: 20,
    right: 50,
    bottom: 40,
    width: 30,
    height: 30,
    toJSON: () => ({}),
    ...overrides,
  }) as DOMRect

describe("ElementTooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    useTooltip().hideTooltip()
    vi.useRealTimers()
  })

  it("renders a teleported tooltip when the shared composable is active", async () => {
    mount(ElementTooltip)
    const { showTooltip, visible } = useTooltip()
    const el = baseElement({ phase: "Gas" })
    showTooltip(el, rect())
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()
    expect(visible.value).toBe(true)

    const node = document.body.querySelector(".element-tooltip")
    expect(node).toBeTruthy()
    expect(node?.textContent).toMatch(/Iron/)
    expect(node?.textContent).toMatch(/◌/)
  })

  it("uses a fallback when phase is not in the icon map", async () => {
    mount(ElementTooltip)
    const { showTooltip } = useTooltip()
    const el = { ...baseElement({ phase: "Gas" }) }
    ;(el as { phase: string }).phase = "plasma"
    showTooltip(el as import("@/types/element").Element, rect())
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()
    const node = document.body.querySelector(".element-tooltip")
    expect(node?.textContent).toContain("plasma")
  })
})
