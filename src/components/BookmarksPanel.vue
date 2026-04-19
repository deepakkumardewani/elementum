<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useEventListener } from "@vueuse/core";
import { X } from "lucide-vue-next";
import { useElementStore } from "@/stores/elementStore";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { categoryColor } from "@/utils/elementUtils";
import { Z } from "@/constants/zIndex";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const elementStore = useElementStore();
const bookmarkStore = useBookmarkStore();
const { elements } = storeToRefs(elementStore);
const { bookmarkedIds } = storeToRefs(bookmarkStore);

const bookmarkedElements = computed(() => {
  const set = new Set(bookmarkedIds.value);
  return elements.value.filter((el) => set.has(el.atomicNumber));
});

const panelZ = Z.modal + 5;

function close() {
  emit("update:open", false);
}

function openDetail(el: (typeof elements.value)[0]) {
  elementStore.selectElement(el);
  close();
}

watch(
  () => props.open,
  (isOpen) => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isOpen ? "hidden" : "";
  },
);

useEventListener(
  () => (typeof window !== "undefined" ? window : null),
  "keydown",
  (e: KeyboardEvent) => {
    if (!props.open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="bookmarks-panel-root">
      <div class="bookmarks-backdrop" aria-hidden="true" @click="close" />
      <aside
        class="bookmarks-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmarks-panel-title"
      >
        <header class="bookmarks-header">
          <h2 id="bookmarks-panel-title" class="bookmarks-title">Bookmarks</h2>
          <button type="button" class="bookmarks-close" aria-label="Close bookmarks" @click="close">
            <X :size="18" />
          </button>
        </header>

        <div v-if="bookmarkedElements.length === 0" class="bookmarks-empty">
          No bookmarks yet — star elements to save them
        </div>

        <div v-else class="bookmarks-grid" role="list">
          <button
            v-for="el in bookmarkedElements"
            :key="el.atomicNumber"
            type="button"
            class="bookmark-mini-tile"
            :style="{ '--cat': categoryColor(el.category) }"
            role="listitem"
            @click="openDetail(el)"
          >
            <span class="mini-z">{{ el.atomicNumber }}</span>
            <span class="mini-sym">{{ el.symbol }}</span>
            <span class="mini-name">{{ el.name }}</span>
          </button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.bookmarks-panel-root {
  position: fixed;
  inset: 0;
  z-index: v-bind("panelZ");
  pointer-events: none;
}

.bookmarks-backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--bg-base) 70%, transparent);
  pointer-events: auto;
}

.bookmarks-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: min(360px, 100vw);
  height: 100%;
  background: var(--bg-surface);
  border-left: 1px solid var(--bg-border);
  box-shadow: -8px 0 32px color-mix(in srgb, black 28%, transparent);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  animation: slideIn 220ms cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0.85;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.bookmarks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid var(--bg-border);
}

.bookmarks-title {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bookmarks-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    border-color 150ms ease,
    color 150ms ease;
}

.bookmarks-close:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.bookmarks-close:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.bookmarks-empty {
  padding: 2rem 1.25rem;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.5;
  text-align: center;
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  padding: 1rem;
  overflow-y: auto;
}

.bookmark-mini-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-left: 3px solid var(--cat);
  border-radius: 2px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.bookmark-mini-tile:hover {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px color-mix(in srgb, var(--accent-cyan) 18%, transparent);
}

.bookmark-mini-tile:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.mini-z {
  font-size: 0.55rem;
  font-weight: 600;
  color: var(--text-muted);
}

.mini-sym {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.mini-name {
  font-size: 0.65rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
