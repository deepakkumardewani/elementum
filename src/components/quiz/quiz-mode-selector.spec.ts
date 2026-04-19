import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import QuizModeSelector from "@/components/quiz/QuizModeSelector.vue"

describe("QuizModeSelector", () => {
  it("mounts and lists three modes", () => {
    const wrapper = mount(QuizModeSelector)
    expect(wrapper.findAll(".mode-card")).toHaveLength(3)
  })

  it("emits select with mode when a card is clicked", async () => {
    const wrapper = mount(QuizModeSelector)
    await wrapper.findAll(".mode-card")[0]?.trigger("click")
    expect(wrapper.emitted("select")?.[0]).toEqual(["flashcard"])
  })
})
