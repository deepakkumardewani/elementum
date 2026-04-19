<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { useRoute } from "vue-router"
import { Smartphone, Monitor, Bookmark } from "lucide-vue-next"
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
  window.addEventListener("scroll", () => {
    scrolled.value = window.scrollY > 4
  }, { passive: true })
})

// Nav items with element-symbol abbreviations (real element symbols)
// Ta = Tantalum, Cm = Curium, Ts = Tennessine
const NAV_ITEMS = [
  { to: "/", abbr: "Ta", label: "Table" },
  { to: "/compare", abbr: "Cm", label: "Compare" },
  { to: "/trends", abbr: "Ts", label: "Trends" },
  { to: "/quiz", abbr: "Md", label: "Quiz" },
  { to: "/tools", abbr: "W", label: "Tools" },
] as const
</script>

<template>
  <div class="app-shell">
    <header class="app-header" :class="{ 'is-scrolled': scrolled }">
      <a href="#main-content" class="skip-link">Skip to content</a>

      <div class="header-left">
        <!-- Brand: Z styled like element tile -->
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

        <button
          type="button"
          class="bookmarks-nav-btn"
          aria-label="Open bookmarks"
          @click="bookmarksOpen = true"
        >
          <Bookmark :size="17" aria-hidden="true" />
          <span v-if="bookmarkCount > 0" class="bookmarks-badge">{{ bookmarkCount }}</span>
        </button>
      </div>

      <SearchBar v-if="isTablePage" />
      <ThemeToggle />
    </header>
    <main id="main-content">
      <RouterView />
    </main>

    <BookmarksPanel v-model:open="bookmarksOpen" />
    
    <!-- Mobile warning overlay -->
    <div class="mobile-not-supported">
      <div class="mobile-warning-card">
        <div class="warning-icons">
          <Smartphone class="icon-mobile" />
          <div class="connection-line"></div>
          <Monitor class="icon-desktop" />
        </div>
        <h1>Desktop Experience Recommended</h1>
        <p>Elementum's interactive periodic table and 3D visualizations are optimized for larger screens.</p>
        <div class="support-hint">Please open on a desktop or tablet in landscape mode for the best experience.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  border-bottom: 1px solid transparent;
  padding: 0.625rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: v-bind("Z.sticky");
  transition: background-color 200ms ease, border-color 200ms ease;
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
}

/* Brand mark: "Z" styled like an element atomic number */
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

/* Nav links */
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
  transition: color 150ms ease, border-color 150ms ease;
  position: relative;
}

.nav-item:hover {
  color: var(--text-primary);
}

.nav-item.is-active {
  color: var(--text-primary);
  border-bottom-color: var(--accent-cyan);
}

/* Element-symbol style abbreviation */
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
  margin-left: 0.25rem;
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

/* Mobile warning */
.mobile-not-supported {
  position: fixed;
  inset: 0;
  display: none;
  background-color: var(--bg-base);
  z-index: v-bind("Z.toast + 1");
  padding: 2rem;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1023px) {
  .mobile-not-supported {
    display: flex;
  }
}

.mobile-warning-card {
  max-width: 400px;
  text-align: center;
  animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.warning-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  color: var(--accent-cyan);
}

.icon-mobile {
  width: 32px;
  height: 32px;
  opacity: 0.5;
}

.icon-desktop {
  width: 48px;
  height: 48px;
}

.connection-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--accent-cyan), transparent);
  opacity: 0.4;
}

.mobile-warning-card h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.mobile-warning-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.support-hint {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--accent-cyan);
  padding: 0.75rem;
  background: color-mix(in srgb, var(--accent-cyan) 8%, transparent);
  border-radius: 4px;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
