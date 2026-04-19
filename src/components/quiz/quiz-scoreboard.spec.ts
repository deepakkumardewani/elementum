import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import QuizScoreboard from "@/components/quiz/QuizScoreboard.vue"

describe("QuizScoreboard", () => {
  it("mounts and shows score", () => {
    const wrapper = mount(QuizScoreboard, {
      props: {
        progressLabel: "3 / 10",
        score: 2,
        streak: 1,
        mode: "flashcard",
      },
    })
    expect(wrapper.text()).toContain("Score 2")
    expect(wrapper.text()).toContain("Streak 1")
  })
})
