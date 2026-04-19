import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import QuizResults from "@/components/quiz/QuizResults.vue"

describe("QuizResults", () => {
  it("mounts with summary copy", () => {
    const wrapper = mount(QuizResults, {
      props: {
        score: 5,
        maxStreak: 3,
        mode: "flashcard",
        bestForMode: 7,
      },
    })
    expect(wrapper.text()).toContain("Round complete")
    expect(wrapper.text()).toContain("Score: 5")
  })
})
