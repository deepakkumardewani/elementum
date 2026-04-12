<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { useRoute } from "vue-router"
import { useElementStore } from "@/stores/elementStore"
import SearchBar from "@/components/SearchBar.vue"
import ThemeToggle from "@/components/ThemeToggle.vue"
import { Z } from "@/constants/zIndex"

const elementStore = useElementStore()
const route = useRoute()
const scrolled = ref(false)

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
      </div>

      <SearchBar v-if="isTablePage" />
      <ThemeToggle />
    </header>
    <main id="main-content">
      <RouterView />
    </main>
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
</style>
