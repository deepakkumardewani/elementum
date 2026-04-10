<script setup lang="ts">
import { onMounted } from "vue"
import { useElementStore } from "@/stores/elementStore"
import SearchBar from "@/components/SearchBar.vue"
import { Z } from "@/constants/zIndex"

const elementStore = useElementStore()

onMounted(() => {
  elementStore.loadElements()
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <a href="#main-content" class="skip-link">Skip to content</a>
      <nav class="nav-links" aria-label="Main navigation">
        <RouterLink to="/">Table</RouterLink>
        <RouterLink to="/compare">Compare</RouterLink>
        <RouterLink to="/trends">Trends</RouterLink>
      </nav>
      <SearchBar />
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
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--bg-border);
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: v-bind("Z.sticky");
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

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: color 150ms ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent-cyan);
}

.nav-links a:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 3px;
  border-radius: 2px;
}
</style>
