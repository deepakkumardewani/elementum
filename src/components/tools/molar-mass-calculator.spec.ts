import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it } from "vitest"
import MolarMassCalculator from "@/components/tools/MolarMassCalculator.vue"
import elements from "@/data/elements.json"
import { useElementStore } from "@/stores/elementStore"
import type { Element } from "@/types/element"

describe("MolarMassCalculator", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useElementStore()
    store.elements = elements as Element[]
  })

  it("mounts without error", () => {
    const w = mount(MolarMassCalculator)
    expect(w.find("section.molar-mass-tool").exists()).toBe(true)
  })
})
