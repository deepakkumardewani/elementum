import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { nextTick } from "vue"
import { useTooltip } from "@/composables/useTooltip"
import type { Element } from "@/types/element"

const minimalElement: Element = {
  name: "Hydrogen",
  symbol: "H",
  atomicNumber: 1,
  atomicMass: 1.008,
  category: "nonmetal",
  xpos: 1,
  ypos: 1,
  period: 1,
  group: 1,
  block: "s",
  phase: "Gas",
  electronConfiguration: "1s1",
  electronConfigurationSemantic: "1s1",
  electronShells: [1],
  electronegativity: 2.2,
  atomicRadius: 53,
  ionizationEnergy: 1312,
  electronAffinity: 72.769,
  density: 0.08988,
  meltingPoint: 13.99,
  boilingPoint: 20.271,
  oxidationStates: "-1, 0, +1",
  discoverer: "Henry Cavendish",
  yearDiscovered: 1766,
  spectralLines: [],
  funFacts: [],
  compounds: [],
  summary: "Hydrogen summary.",
}

describe("useTooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useTooltip().hideTooltip()
  })

  afterEach(() => {
    useTooltip().hideTooltip()
    vi.useRealTimers()
  })

  it("shows tooltip state after hover delay", async () => {
    const { visible, state, showTooltip, hideTooltip } = useTooltip()
    const rect = new DOMRect(0, 0, 10, 10)

    showTooltip(minimalElement, rect)
    expect(visible.value).toBe(false)
    expect(state.value).toBe(null)

    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(visible.value).toBe(true)
    expect(state.value?.element).toEqual(minimalElement)
    expect(state.value?.rect).toEqual(rect)

    hideTooltip()
    expect(visible.value).toBe(false)
    expect(state.value).toBe(null)
  })

  it("cancels pending show when hideTooltip runs before delay elapses", async () => {
    const { visible, state, showTooltip, hideTooltip } = useTooltip()
    const rect = new DOMRect()

    showTooltip(minimalElement, rect)
    await vi.advanceTimersByTimeAsync(100)
    hideTooltip()
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(visible.value).toBe(false)
    expect(state.value).toBe(null)
  })

  it("replacing show clears previous pending timeout", async () => {
    const { visible, showTooltip, hideTooltip } = useTooltip()
    const rect = new DOMRect()

    showTooltip(minimalElement, rect)
    await vi.advanceTimersByTimeAsync(100)
    showTooltip({ ...minimalElement, symbol: "He" }, rect)
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(visible.value).toBe(true)
    hideTooltip()
  })

  it("hideTooltip is idempotent when nothing is scheduled", () => {
    const { hideTooltip, visible } = useTooltip()
    hideTooltip()
    hideTooltip()
    expect(visible.value).toBe(false)
  })
})
