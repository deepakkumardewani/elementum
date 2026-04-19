import { useEventListener } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { type Ref, ref, watch } from "vue"
import { useElementStore } from "@/stores/elementStore"
import type { Element } from "@/types/element"

function pickClosestByColumn(candidates: Element[], column: number): Element {
  return candidates.reduce((best, el) => {
    const db = Math.abs(best.xpos - column)
    const de = Math.abs(el.xpos - column)
    if (de < db) return el
    if (de === db && el.xpos < best.xpos) return el
    return best
  })
}

function sameRowRight(elements: Element[], current: Element): Element {
  const row = current.ypos
  const sameRow = elements.filter((e) => e.ypos === row).sort((a, b) => a.xpos - b.xpos)
  const idx = sameRow.findIndex((e) => e.atomicNumber === current.atomicNumber)
  if (idx === -1) return current
  return sameRow[(idx + 1) % sameRow.length]
}

function sameRowLeft(elements: Element[], current: Element): Element {
  const row = current.ypos
  const sameRow = elements.filter((e) => e.ypos === row).sort((a, b) => a.xpos - b.xpos)
  const idx = sameRow.findIndex((e) => e.atomicNumber === current.atomicNumber)
  if (idx === -1) return current
  return sameRow[(idx - 1 + sameRow.length) % sameRow.length]
}

function rowAbove(elements: Element[], current: Element): Element | null {
  const y = current.ypos
  let targetY: number | null = null
  if (y === 10) targetY = 9
  else if (y === 9) targetY = 7
  else if (y <= 7 && y > 1) targetY = y - 1
  else return null

  const candidates = elements.filter((e) => e.ypos === targetY)
  if (candidates.length === 0) return null
  return pickClosestByColumn(candidates, current.xpos)
}

function rowBelow(elements: Element[], current: Element): Element | null {
  const y = current.ypos
  let targetY: number | null = null
  if (y === 9) targetY = 10
  else if (y === 7) targetY = 9
  else if (y < 7) targetY = y + 1
  else return null

  const candidates = elements.filter((e) => e.ypos === targetY)
  if (candidates.length === 0) return null
  return pickClosestByColumn(candidates, current.xpos)
}

function findElement(elements: Element[], atomicNumber: number): Element | undefined {
  return elements.find((e) => e.atomicNumber === atomicNumber)
}

/**
 * Arrow-key roving focus for the periodic table grid. Active when focus is inside `gridRef`.
 * Enter activates the focused tile (native button). Escape closes the detail panel.
 */
export function useKeyboardNav(gridRef: Ref<HTMLElement | null>) {
  const elementStore = useElementStore()
  const { elements, detailPanelOpen } = storeToRefs(elementStore)

  const focusedAtomicNumber = ref(1)

  function focusTileButton(z: number) {
    const root = gridRef.value
    if (!root) return
    const btn = root.querySelector<HTMLButtonElement>(`.element-tile[data-atomic-number="${z}"]`)
    btn?.focus()
  }

  function moveFocus(next: Element) {
    focusedAtomicNumber.value = next.atomicNumber
    requestAnimationFrame(() => focusTileButton(next.atomicNumber))
  }

  useEventListener(
    () => (typeof document !== "undefined" ? document : null),
    "keydown",
    (e: KeyboardEvent) => {
      const root = gridRef.value
      if (!root) return

      const active = document.activeElement
      if (!active || !root.contains(active)) return

      if (e.key === "Escape" && detailPanelOpen.value) {
        e.preventDefault()
        elementStore.closeDetailPanel()
        requestAnimationFrame(() => focusTileButton(focusedAtomicNumber.value))
        return
      }

      if (!(active instanceof HTMLElement) || !active.classList.contains("element-tile")) {
        return
      }

      const current = findElement(elements.value, focusedAtomicNumber.value)
      if (!current) return

      if (e.key === "ArrowRight") {
        e.preventDefault()
        moveFocus(sameRowRight(elements.value, current))
        return
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        moveFocus(sameRowLeft(elements.value, current))
        return
      }
      if (e.key === "ArrowDown") {
        const next = rowBelow(elements.value, current)
        if (next) {
          e.preventDefault()
          moveFocus(next)
        }
        return
      }
      if (e.key === "ArrowUp") {
        const next = rowAbove(elements.value, current)
        if (next) {
          e.preventDefault()
          moveFocus(next)
        }
      }
    },
  )

  watch(detailPanelOpen, (open, wasOpen) => {
    if (wasOpen && !open) {
      requestAnimationFrame(() => focusTileButton(focusedAtomicNumber.value))
    }
  })

  return {
    focusedAtomicNumber,
  }
}
