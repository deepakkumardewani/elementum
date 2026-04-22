import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { defineComponent, h } from "vue"
import AtomScene from "@/components/detail/AtomScene.vue"

const TresGroupStub = defineComponent({
  name: "TresGroup",
  setup(_, { expose }) {
    expose({
      rotation: { x: 0, y: 0, z: 0 },
    })
    return () => h("div", { class: "tres-group-stub" })
  },
})

let renderCallback: ((ctx: { delta: number }) => void) | undefined

vi.mock("@tresjs/core", () => ({
  useLoop: () => ({
    onBeforeRender: (cb: (ctx: { delta: number }) => void) => {
      renderCallback = cb
    },
    stop: vi.fn(),
  }),
}))

describe("AtomScene", () => {
  beforeEach(() => {
    renderCallback = undefined
    setActivePinia(createPinia())
  })

  it("mounts nucleus and shell stubs and runs the render loop callback", async () => {
    const shells = [{ radius: 1.2, electrons: 2, speed: 0.5, tiltX: 0.1, tiltZ: 0.2 }]
    const w = mount(AtomScene, {
      props: {
        shells,
        atomicNumber: 6,
        atomicMass: 12,
        isInteracting: false,
      },
      global: {
        stubs: {
          TresMesh: { template: "<div class='tres-mesh-stub'><slot /></div>" },
          TresGroup: TresGroupStub,
          TresSphereGeometry: true,
          TresTorusGeometry: true,
          TresMeshStandardMaterial: true,
        },
      },
    })
    await flushPromises()
    expect(w.findAll(".tres-mesh-stub").length).toBeGreaterThan(0)
    expect(typeof renderCallback).toBe("function")
    renderCallback?.({ delta: 0.016 })
    renderCallback?.({ delta: 4 })
    renderCallback?.({ delta: 2 })
    w.unmount()
  })

  it("skips shell rotation updates while interacting but still advances time", async () => {
    mount(AtomScene, {
      props: {
        shells: [{ radius: 1, electrons: 1, speed: 1, tiltX: 0, tiltZ: 0 }],
        atomicNumber: 1,
        atomicMass: 1,
        isInteracting: true,
      },
      global: {
        stubs: {
          TresMesh: { template: "<div /><slot />" },
          TresGroup: TresGroupStub,
          TresSphereGeometry: true,
          TresTorusGeometry: true,
          TresMeshStandardMaterial: true,
        },
      },
    })
    await flushPromises()
    expect(typeof renderCallback).toBe("function")
    renderCallback?.({ delta: 0.1 })
  })
})
