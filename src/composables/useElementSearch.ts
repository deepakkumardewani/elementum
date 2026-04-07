import { useDebounceFn, useEventListener } from "@vueuse/core"
import type { Ref } from "vue"
import { ref } from "vue"
import { useElementStore } from "@/stores/elementStore"

/**
 * Encapsulates search input state, debounced store updates, and the "/" focus shortcut.
 * Pass in the inputRef from the component so the composable can focus it.
 */
export function useElementSearch(inputRef: Ref<HTMLInputElement | null>) {
  const elementStore = useElementStore()

  // Local input value — kept in sync with store on each debounced flush
  const localQuery = ref(elementStore.searchQuery)

  const flushToStore = useDebounceFn((value: string) => {
    elementStore.setSearchQuery(value)
  }, 150)

  function onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    localQuery.value = value
    flushToStore(value)
  }

  function clearSearch() {
    localQuery.value = ""
    elementStore.setSearchQuery("")
    inputRef.value?.focus()
  }

  // "/" key focuses the search input from anywhere on the page
  useEventListener(document, "keydown", (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    // Don't hijack "/" when user is already typing in an input/textarea
    if (tag === "INPUT" || tag === "TEXTAREA") return
    if (e.key === "/") {
      e.preventDefault()
      inputRef.value?.focus()
    }
  })

  return { localQuery, onInput, clearSearch }
}
