<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Star } from "lucide-vue-next";
import { useBookmarkStore } from "@/stores/bookmarkStore";

const props = defineProps<{
  atomicNumber: number;
  /** Smaller hit target for tiles */
  compact?: boolean;
}>();

const bookmarkStore = useBookmarkStore();

const filled = computed(() => bookmarkStore.isBookmarked(props.atomicNumber));

/** Plays stroke + pop when transitioning to bookmarked (not on initial mount). */
const bookmarkJustAdded = ref(false);
let bookmarkAnimTimer: ReturnType<typeof setTimeout> | undefined;

watch(filled, (isBookmarked, wasBookmarked) => {
  if (isBookmarked && wasBookmarked === false) {
    bookmarkJustAdded.value = true;
    if (bookmarkAnimTimer !== undefined) {
      clearTimeout(bookmarkAnimTimer);
    }
    bookmarkAnimTimer = setTimeout(() => {
      bookmarkJustAdded.value = false;
      bookmarkAnimTimer = undefined;
    }, 720);
  }
});

onBeforeUnmount(() => {
  if (bookmarkAnimTimer !== undefined) {
    clearTimeout(bookmarkAnimTimer);
  }
});

const ariaLabel = computed(() =>
  filled.value ? `Remove ${props.atomicNumber} from bookmarks` : `Bookmark element ${props.atomicNumber}`,
);

function onClick(e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
  bookmarkStore.toggleBookmark(props.atomicNumber);
}
</script>

<template>
  <button
    type="button"
    class="bookmark-btn"
    :class="{ 'is-compact': compact, 'is-filled': filled, 'is-bookmark-anim': bookmarkJustAdded }"
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

/* Stroke “draws” around the star when bookmarking (Lucide star = single path). */
.bookmark-btn.is-bookmark-anim :deep(svg path) {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: bookmark-star-draw 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.bookmark-btn.is-bookmark-anim :deep(svg) {
  transform-origin: center;
  animation: bookmark-star-pop 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
}

@keyframes bookmark-star-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes bookmark-star-pop {
  0% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.14);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bookmark-btn.is-bookmark-anim :deep(svg path) {
    animation: none;
    stroke-dasharray: none;
    stroke-dashoffset: 0;
  }

  .bookmark-btn.is-bookmark-anim :deep(svg) {
    animation: none;
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
