<script setup lang="ts">
import { computed } from "vue";
import { Star } from "lucide-vue-next";
import { useBookmarkStore } from "@/stores/bookmarkStore";

const props = defineProps<{
  atomicNumber: number;
  /** Smaller hit target for tiles */
  compact?: boolean;
}>();

const bookmarkStore = useBookmarkStore();

const filled = computed(() => bookmarkStore.isBookmarked(props.atomicNumber));

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
    :class="{ 'is-compact': compact, 'is-filled': filled }"
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
  background: color-mix(in srgb, var(--bg-base) 55%, transparent);
  color: var(--text-muted);
  cursor: pointer;
  transition:
    color 150ms ease,
    background-color 150ms ease,
    box-shadow 150ms ease;
}

.bookmark-btn:hover {
  color: var(--accent-cyan);
  background: color-mix(in srgb, var(--accent-cyan) 12%, var(--bg-base));
}

.bookmark-btn.is-filled {
  color: var(--accent-cyan);
}

.bookmark-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.bookmark-btn.is-compact {
  padding: 1px;
}
</style>
