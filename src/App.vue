<script setup lang="ts">
import { Smartphone, Monitor } from "lucide-vue-next"
import AppHeader from "@/components/AppHeader.vue"
import AppFooter from "@/components/AppFooter.vue"
import { Z } from "@/constants/zIndex"
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main id="main-content">
      <RouterView />
    </main>

    <AppFooter />

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
