import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { describe, expect, it } from "vitest"
import { createRouter, createWebHistory } from "vue-router"
import ToolsView from "@/views/ToolsView.vue"

describe("ToolsView", () => {
  it("mounts without error", async () => {
    setActivePinia(createPinia())
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: "/tools", name: "tools", component: ToolsView }],
    })
    await router.push("/tools")
    await router.isReady()

    const w = mount(ToolsView, {
      global: { plugins: [router] },
    })
    await flushPromises()
    expect(w.find("main.tools-view").exists()).toBe(true)
  })
})
