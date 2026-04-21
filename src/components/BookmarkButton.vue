<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { Star } from "lucide-vue-next"
import { useBookmarkStore } from "@/stores/bookmarkStore"

const props = defineProps<{
  atomicNumber: number
  /** Smaller hit target for tiles */
  compact?: boolean
}>()

const bookmarkStore = useBookmarkStore()

const filled = computed(() => bookmarkStore.isBookmarked(props.atomicNumber))

/** Lucide `star` path length ≈ 92 in viewBox units — matches stroke-dash draw. */
const STAR_PATH_LEN = 92

const STROKE_MS = 550
const FILL_MS = 320

/** Phase 1: stroke draws with fill forced off. */
const bookmarkDrawPhase = ref(false)
/** Phase 2: fill fades in after stroke completes. */
const bookmarkFillReveal = ref(false)

let drawTimer: ReturnType<typeof setTimeout> | undefined
let fillTimer: ReturnType<typeof setTimeout> | undefined

function clearAnimTimers() {
  if (drawTimer !== undefined) {
    clearTimeout(drawTimer)
    drawTimer = undefined
  }
  if (fillTimer !== undefined) {
    clearTimeout(fillTimer)
    fillTimer = undefined
  }
}

watch(filled, (isBookmarked, wasBookmarked) => {
  if (isBookmarked && wasBookmarked === false) {
    clearAnimTimers()
    bookmarkDrawPhase.value = true
    bookmarkFillReveal.value = false
    drawTimer = setTimeout(() => {
      bookmarkDrawPhase.value = false
      bookmarkFillReveal.value = true
      drawTimer = undefined
      fillTimer = setTimeout(() => {
        bookmarkFillReveal.value = false
        fillTimer = undefined
      }, FILL_MS)
    }, STROKE_MS)
  } else if (!isBookmarked) {
    clearAnimTimers()
    bookmarkDrawPhase.value = false
    bookmarkFillReveal.value = false
  }
})

onBeforeUnmount(() => {
  clearAnimTimers()
})

const ariaLabel = computed(() =>
  filled.value ? `Remove ${props.atomicNumber} from bookmarks` : `Bookmark element ${props.atomicNumber}`,
)

function onClick(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
  bookmarkStore.toggleBookmark(props.atomicNumber)
}
</script>

<template>
  <button
    type="button"
    class="bookmark-btn"
    :class="{
      'is-compact': compact,
      'is-filled': filled,
      'is-bookmark-draw': bookmarkDrawPhase,
      'is-bookmark-fill-reveal': bookmarkFillReveal,
    }"
    :aria-label="ariaLabel"
    :aria-pressed="filled"
    @mousedown.stop
    @click.stop="onClick"
  >
    <Star :size="compact ? 12 : 15" :fill="filled ? 'currentColor' : 'none'" aria-hidden="true" />
  </button>
</template>

<style scoped>
.bookmark-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 150ms ease;
}

.bookmark-btn:hover {
  color: var(--accent-cyan);
}

.bookmark-btn.is-filled {
  color: var(--accent-cyan);
}

/* Phase 1: stroke draws — fill must stay off so the outline is visible. */
.bookmark-btn.is-bookmark-draw :deep(svg path) {
  fill: none !important;
  paint-order: stroke fill;
  stroke-dasharray: v-bind(STAR_PATH_LEN);
  stroke-dashoffset: v-bind(STAR_PATH_LEN);
  animation: bookmark-star-draw 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.bookmark-btn.is-bookmark-draw :deep(svg) {
  transform-origin: center;
}

/* Phase 2: fill fades in; pop runs on the svg so scale is correct. */
.bookmark-btn.is-bookmark-fill-reveal :deep(svg path) {
  fill: currentColor !important;
  fill-opacity: 0;
  stroke-dashoffset: 0;
  stroke-dasharray: none;
  animation: bookmark-star-fill-fade 0.32s ease forwards;
}

.bookmark-btn.is-bookmark-fill-reveal :deep(svg) {
  transform-origin: center;
  animation: bookmark-star-pop 0.36s cubic-bezier(0.34, 1.35, 0.64, 1) forwards;
}

@keyframes bookmark-star-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes bookmark-star-fill-fade {
  to {
    fill-opacity: 1;
  }
}

@keyframes bookmark-star-pop {
  0% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bookmark-btn.is-bookmark-draw :deep(svg path) {
    animation: none;
    stroke-dasharray: none;
    stroke-dashoffset: 0;
  }

  .bookmark-btn.is-bookmark-fill-reveal :deep(svg path) {
    animation: none;
    fill-opacity: 1;
  }

  .bookmark-btn.is-bookmark-fill-reveal :deep(svg) {
    animation: none;
    transform: none;
  }
}

.bookmark-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.bookmark-btn.is-compact {
  padding: 1px;
}
</style>
