<script setup lang="ts">
import { onMounted } from "vue"
import { useElementStore } from "@/stores/elementStore"
import SearchBar from "@/components/SearchBar.vue"

const elementStore = useElementStore()

onMounted(() => {
  elementStore.loadElements()
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <nav class="nav-links">
        <RouterLink to="/">Table</RouterLink>
        <RouterLink to="/compare">Compare</RouterLink>
        <RouterLink to="/trends">Trends</RouterLink>
      </nav>
      <SearchBar />
    </header>
    <RouterView />
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
  z-index: 20;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 150ms ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent-cyan);
}
</style>
