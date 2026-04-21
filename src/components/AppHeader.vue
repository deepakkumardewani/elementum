<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { Bookmark } from "lucide-vue-next"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import { useBookmarkStore } from "@/stores/bookmarkStore"
import SearchBar from "@/components/SearchBar.vue"
import ThemeToggle from "@/components/ThemeToggle.vue"
import BookmarksPanel from "@/components/BookmarksPanel.vue"
import { Z } from "@/constants/zIndex"

const elementStore = useElementStore()
const bookmarkStore = useBookmarkStore()
const { bookmarkCount } = storeToRefs(bookmarkStore)
const route = useRoute()
const scrolled = ref(false)
const bookmarksOpen = ref(false)

const isTablePage = computed(() => route.path === "/")

onMounted(() => {
  elementStore.loadElements()
  window.addEventListener(
    "scroll",
    () => {
      scrolled.value = window.scrollY > 4
    },
    { passive: true },
  )
})

const NAV_ITEMS = [
  { to: "/", abbr: "Ta", label: "Table" },
  { to: "/compare", abbr: "Cm", label: "Compare" },
  { to: "/trends", abbr: "Ts", label: "Trends" },
  { to: "/quiz", abbr: "Md", label: "Quiz" },
  { to: "/tools", abbr: "W", label: "Tools" },
] as const
</script>

<template>
  <header class="app-header" :class="{ 'is-scrolled': scrolled }">
    <a href="#main-content" class="skip-link">Skip to content</a>

    <div class="header-left">
      <RouterLink to="/" class="brand" aria-label="Elementum">
        <span class="brand-logo" aria-hidden="true">El</span>
      </RouterLink>

      <nav class="nav-links" aria-label="Main navigation">
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          exact-active-class="is-active"
        >
          <span class="nav-abbr" aria-hidden="true">{{ item.abbr }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>

    <div class="header-right">
      <SearchBar v-if="isTablePage" class="header-search" />
      <button
        type="button"
        class="bookmarks-nav-btn"
        aria-label="Open bookmarks"
        @click="bookmarksOpen = true"
      >
        <Bookmark :size="17" aria-hidden="true" />
        <span v-if="bookmarkCount > 0" class="bookmarks-badge">{{ bookmarkCount }}</span>
      </button>
      <ThemeToggle />
    </div>

    <BookmarksPanel v-model:open="bookmarksOpen" />
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background-color: transparent;
  border-bottom: 1px solid transparent;
  padding: 0.625rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: v-bind("Z.sticky");
  transition:
    background-color 200ms ease,
    border-color 200ms ease;
}

.app-header.is-scrolled {
  background-color: color-mix(in srgb, var(--bg-base) 90%, transparent);
  border-bottom-color: var(--bg-border);
  backdrop-filter: blur(12px);
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 1.5rem;
  background: var(--accent-cyan);
  color: var(--bg-base);
  padding: 0.5rem 1rem;
  font-size: var(--text-sm);
  font-weight: 600;
  border-radius: 4px;
  z-index: v-bind("Z.toast");
  transition: top 0.2s ease;
  text-decoration: none;
}

.skip-link:focus {
  top: 0.75rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.header-search {
  flex-shrink: 0;
}

.brand {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--bg-border);
  border-left: 3px solid var(--accent-cyan);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-cyan);
  letter-spacing: -0.02em;
  background-color: color-mix(in srgb, var(--accent-cyan) 6%, var(--bg-surface));
  transition: background-color 150ms ease;
}

.brand:hover .brand-logo {
  background-color: color-mix(in srgb, var(--accent-cyan) 12%, var(--bg-surface));
}

.nav-links {
  display: flex;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.375rem 0.625rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition:
    color 150ms ease,
    border-color 150ms ease;
  position: relative;
}

.nav-item:hover {
  color: var(--text-primary);
}

.nav-item.is-active {
  color: var(--text-primary);
  border-bottom-color: var(--accent-cyan);
}

.nav-abbr {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent-cyan);
  opacity: 0.6;
  transition: opacity 150ms ease;
  line-height: 1;
}

.nav-item:hover .nav-abbr,
.nav-item.is-active .nav-abbr {
  opacity: 1;
}

.nav-label {
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
}

.nav-item:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 3px;
  border-radius: 2px;
}

.bookmarks-nav-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    border-color 150ms ease,
    color 150ms ease,
    background-color 150ms ease;
}

.bookmarks-nav-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  background: color-mix(in srgb, var(--accent-cyan) 6%, transparent);
}

.bookmarks-nav-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.bookmarks-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--accent-cyan);
  color: var(--bg-base);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}
</style>
