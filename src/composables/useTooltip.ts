import { ref } from "vue"
import type { Element } from "@/types/element"

// Module-level singleton — one tooltip across the entire app.
// ElementTile calls showTooltip/hideTooltip; ElementTooltip reads the state.

export interface TooltipState {
  element: Element
  // Bounding rect of the trigger tile (from getBoundingClientRect)
  rect: DOMRect
}

const visible = ref(false)
const state = ref<TooltipState | null>(null)

let showTimer: ReturnType<typeof setTimeout> | null = null

/** Call on mouseenter with the element and its current bounding rect. */
function showTooltip(element: Element, rect: DOMRect) {
  // Cancel any pending hide
  if (showTimer !== null) {
    clearTimeout(showTimer)
  }

  // 300ms hover delay per spec
  showTimer = setTimeout(() => {
    state.value = { element, rect }
    visible.value = true
    showTimer = null
  }, 300)
}

/** Call on mouseleave to dismiss the tooltip immediately. */
function hideTooltip() {
  if (showTimer !== null) {
    clearTimeout(showTimer)
    showTimer = null
  }
  visible.value = false
  state.value = null
}

export function useTooltip() {
  return { visible, state, showTooltip, hideTooltip }
}
