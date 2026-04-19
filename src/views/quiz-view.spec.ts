import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { describe, expect, it } from "vitest"
import QuizView from "@/views/QuizView.vue"

describe("QuizView", () => {
  it("mounts without errors", () => {
    setActivePinia(createPinia())
    const wrapper = mount(QuizView)
    expect(wrapper.find(".quiz-title").text()).toContain("Quiz")
  })
})
