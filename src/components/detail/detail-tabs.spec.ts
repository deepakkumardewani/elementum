import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import DetailTabs from "@/components/detail/DetailTabs.vue"
import type { DetailTabId } from "@/utils/detailTabVisibility"

describe("DetailTabs", () => {
  it("mounts and switches with keyboard without throwing", async () => {
    const w = mount(DetailTabs, {
      props: {
        idPrefix: "test-tabs",
        modelValue: "overview" satisfies DetailTabId,
        tabs: [
          { id: "overview", label: "Overview" },
          { id: "safety", label: "Safety" },
        ],
      },
    })
    const list = w.find('[role="tablist"]')
    expect(list.exists()).toBe(true)
    await list.trigger("keydown", { key: "ArrowRight" })
    expect(w.emitted("update:modelValue")?.[0]).toEqual(["safety"])
  })
})
