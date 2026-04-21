import { createTestingPinia } from "@pinia/testing"
import { shallowMount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import type { Element } from "@/types/element"

vi.mock("@tresjs/cientos", () => ({
  OrbitControls: { name: "OrbitControls", template: "<span />" },
}))

import AtomModel3D from "@/components/detail/AtomModel3D.vue"

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
  spectralLines: [],
  funFacts: [],
  compounds: [],
  summary: "",
  discoverer: null,
  yearDiscovered: null,
}

describe("AtomModel3D", () => {
  it("mounts and shows the quantum shell model disclaimer", () => {
    const w = shallowMount(AtomModel3D, {
      props: { element: minimalElement },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
        stubs: {
          TresCanvas: { template: "<div><slot /></div>" },
          TresPerspectiveCamera: true,
          TresAmbientLight: true,
          TresDirectionalLight: true,
          TresPointLight: true,
          AtomScene: true,
        },
      },
    })
    const disclaimer = w.find(".model-disclaimer")
    expect(disclaimer.exists()).toBe(true)
    expect(disclaimer.text()).toContain("quantum probability distributions")
  })
})
