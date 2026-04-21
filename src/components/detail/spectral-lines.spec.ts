import { shallowMount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import SpectralLines from "./SpectralLines.vue"

describe("SpectralLines", () => {
  it("mounts with wavelength-only lines (no stored color)", () => {
    const w = shallowMount(SpectralLines, {
      props: {
        lines: [{ wavelength: 656.3 }, { wavelength: 486.1 }],
      },
    })
    expect(w.find(".spectral-line").exists()).toBe(true)
    expect(w.findAll(".spectral-line")).toHaveLength(2)
  })
})
