import { gsap } from "gsap"
import { storeToRefs } from "pinia"
import { watch } from "vue"
import { useElementStore } from "@/stores/elementStore"

/**
 * Drives the GSAP opacity tween on dimmed/highlighted tiles when filters change.
 * Call once inside the component that owns the periodic grid (TableView).
 */
export function useElementFilter() {
  const elementStore = useElementStore()
  const { hasActiveFilter, highlightedElements } = storeToRefs(elementStore)

  // Watch for changes to the highlighted set or active filter state,
  // then batch-tween tile opacities via GSAP for smooth 200ms transition.
  watch(
    [hasActiveFilter, highlightedElements],
    () => {
      const allTiles = document.querySelectorAll<HTMLElement>(".element-tile")

      if (!hasActiveFilter.value) {
        // No active filter — restore all tiles to full opacity
        gsap.to(allTiles, {
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        })
        return
      }

      allTiles.forEach((tile) => {
        const atomicNumber = Number(tile.getAttribute("data-atomic-number"))
        const isHighlighted = highlightedElements.value.has(atomicNumber)

        gsap.to(tile, {
          opacity: isHighlighted ? 1 : 0.15,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        })
      })
    },
    { flush: "post" },
  )
}
