import { createTestingPinia } from "@pinia/testing"
import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defineComponent, nextTick, ref } from "vue"
import {
  elementMatchesAdvancedTokens,
  formatSearchTokenLabel,
  parseAdvancedSearchTokens,
  removeSearchTokenFromQuery,
  useElementSearch,
} from "@/composables/useElementSearch"
import elementsData from "@/data/elements.json"
import { useElementStore } from "@/stores/elementStore"
import type { Element } from "@/types/element"

const elements = elementsData as Element[]

function symbolsMatching(query: string): string[] {
  const { tokens, plainText } = parseAdvancedSearchTokens(query)
  return elements
    .filter((el) => {
      const plainOk =
        plainText === "" ||
        el.name.toLowerCase().includes(plainText) ||
        el.symbol.toLowerCase().includes(plainText) ||
        String(el.atomicNumber).includes(plainText)
      const structOk = tokens.length === 0 || elementMatchesAdvancedTokens(el, tokens)
      return plainOk && structOk
    })
    .map((el) => el.symbol)
    .sort()
}

describe("parseAdvancedSearchTokens", () => {
  it("extracts period, EN comparison, and clears plain text", () => {
    const { tokens, plainText } = parseAdvancedSearchTokens("period:2 EN > 3.0")
    expect(tokens).toHaveLength(2)
    expect(tokens[0].kind).toBe("period")
    expect(tokens[1].kind).toBe("electronegativity")
    expect(plainText).toBe("")
  })

  it("leaves plain text when no tokens match", () => {
    const { tokens, plainText } = parseAdvancedSearchTokens("  carbon  ")
    expect(tokens).toHaveLength(0)
    expect(plainText).toBe("carbon")
  })

  it("strips tokens but keeps plain words", () => {
    const { tokens, plainText } = parseAdvancedSearchTokens("nitrogen period:2")
    expect(tokens.some((t) => t.kind === "period" && t.value === 2)).toBe(true)
    expect(plainText).toBe("nitrogen")
  })

  it("formats chip labels", () => {
    const { tokens } = parseAdvancedSearchTokens("group:18 noble")
    expect(tokens.map(formatSearchTokenLabel)).toEqual(["Group 18", "Noble"])
  })

  it("formats EN and MP token labels", () => {
    const { tokens } = parseAdvancedSearchTokens("EN >= 2.5 mp < 100")
    const labels = tokens.map(formatSearchTokenLabel)
    expect(labels).toContain("EN >= 2.5")
    expect(labels).toContain("MP < 100 K")
  })
})

describe("elementMatchesAdvancedTokens", () => {
  it("rejects group mismatch", () => {
    const el = { ...elements[0], group: 2 }
    expect(elementMatchesAdvancedTokens(el, [{ kind: "group", value: 1, raw: "group:1" }])).toBe(
      false,
    )
  })

  it("rejects electronegativity token when EN is null", () => {
    const el: Element = {
      ...elements[0],
      electronegativity: null,
    }
    expect(
      elementMatchesAdvancedTokens(el, [
        {
          kind: "electronegativity",
          op: ">",
          value: 0,
          raw: "EN > 0",
        },
      ]),
    ).toBe(false)
  })

  it("rejects electronegativity when the comparison does not hold", () => {
    const el: Element = {
      ...elements[0],
      electronegativity: 1,
    }
    expect(
      elementMatchesAdvancedTokens(el, [
        {
          kind: "electronegativity",
          op: ">",
          value: 5,
          raw: "EN > 5",
        },
      ]),
    ).toBe(false)
  })

  it("rejects melting point token when MP is null", () => {
    const el: Element = {
      ...elements[0],
      meltingPoint: null,
    }
    expect(
      elementMatchesAdvancedTokens(el, [
        {
          kind: "meltingPoint",
          op: ">",
          value: 0,
          raw: "mp > 0",
        },
      ]),
    ).toBe(false)
  })

  it("matches metalloid shorthand for metalloid elements", () => {
    const el = elements.find((e) => e.category === "metalloid")
    expect(el).toBeDefined()
    if (!el) return
    expect(
      elementMatchesAdvancedTokens(el, [
        {
          kind: "categoryShorthand",
          shorthand: "metalloid",
          raw: "metalloid",
        },
      ]),
    ).toBe(true)
  })

  it("period:2 EN > 3.0 yields N, O, F", () => {
    expect(symbolsMatching("period:2 EN > 3.0")).toEqual(["F", "N", "O"])
  })

  it("noble matches noble gases in dataset", () => {
    const got = symbolsMatching("noble")
    expect(got).toEqual(["Ar", "He", "Kr", "Ne", "Rn", "Xe"])
  })

  it("mp > 3000 matches refractory metals in dataset", () => {
    expect(symbolsMatching("mp > 3000")).toEqual(["Os", "Re", "Ta", "W"])
  })

  it("metal shorthand excludes nonmetals", () => {
    const got = new Set(symbolsMatching("metal"))
    expect(got.has("Fe")).toBe(true)
    expect(got.has("O")).toBe(false)
  })

  it("halogen matches halogens", () => {
    const got = symbolsMatching("halogen")
    expect(got).toEqual(["Br", "Cl", "F", "I"])
  })

  it("EN < 1 includes low-EN metals", () => {
    const got = symbolsMatching("EN < 1")
    expect(got).toContain("Fr")
    expect(got).toContain("Cs")
    expect(got).not.toContain("F")
  })
})

describe("removeSearchTokenFromQuery", () => {
  it("removes first raw token occurrence and trims", () => {
    expect(removeSearchTokenFromQuery("period:2 EN > 3", "period:2")).toBe("EN > 3")
  })
})

const SearchHarness = defineComponent({
  setup() {
    const inputRef = ref<HTMLInputElement | null>(null)
    const search = useElementSearch(inputRef)
    return { inputRef, ...search }
  },
  template:
    '<input id="q" ref="inputRef" type="search" @input="onInput" data-testid="search-input" />',
})

type SearchHarnessVm = {
  clearSearch: () => void
  dismissParsedToken: (raw: string) => void
}

describe("useElementSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("debounces search query into the store", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const store = useElementStore(pinia)
    const wrapper = mount(SearchHarness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    const input = wrapper.get("input").element as HTMLInputElement
    input.value = "carbon"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    expect(store.searchQuery).toBe("")
    await vi.advanceTimersByTimeAsync(150)
    expect(store.searchQuery).toBe("carbon")
    wrapper.unmount()
  })

  it("clearSearch resets local and store state and focuses the input", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const store = useElementStore(pinia)
    const wrapper = mount(SearchHarness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    const input = wrapper.get("input").element as HTMLInputElement
    const focus = vi.spyOn(input, "focus")
    const vm = wrapper.vm as SearchHarnessVm

    vm.clearSearch()
    await nextTick()

    expect(input.value).toBe("")
    expect(store.searchQuery).toBe("")
    expect(focus).toHaveBeenCalled()
    wrapper.unmount()
  })

  it("dismissParsedToken removes a token and syncs the store", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const store = useElementStore(pinia)
    const wrapper = mount(SearchHarness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    const input = wrapper.get("input").element as HTMLInputElement
    const focus = vi.spyOn(input, "focus")
    const vm = wrapper.vm as SearchHarnessVm

    const raw = "period:2"
    input.value = `nitrogen ${raw}`
    input.dispatchEvent(new Event("input", { bubbles: true }))
    await vi.advanceTimersByTimeAsync(150)
    vm.dismissParsedToken(raw)
    await nextTick()

    expect(store.searchQuery).toBe("nitrogen")
    expect(focus).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('focuses the search input when "/" is pressed outside fields', async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const wrapper = mount(SearchHarness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    const input = wrapper.get("input").element as HTMLInputElement
    const focus = vi.spyOn(input, "focus")

    const ev = new KeyboardEvent("keydown", {
      key: "/",
      bubbles: true,
      cancelable: true,
    })
    document.body.dispatchEvent(ev)
    await nextTick()

    expect(ev.defaultPrevented).toBe(true)
    expect(focus).toHaveBeenCalled()
    wrapper.unmount()
  })

  it("does not steal / while typing in another input", async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const wrapper = mount(SearchHarness, {
      attachTo: document.body,
      global: { plugins: [pinia] },
    })
    const searchInput = wrapper.get("input").element as HTMLInputElement
    const focus = vi.spyOn(searchInput, "focus")

    const other = document.createElement("input")
    document.body.appendChild(other)
    other.focus()

    other.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "/",
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()

    expect(focus).not.toHaveBeenCalled()
    other.remove()
    wrapper.unmount()
  })
})
