<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useElementStore } from "@/stores/elementStore"
import MolarMassCalculator from "@/components/tools/MolarMassCalculator.vue"
import BondTypePredictor from "@/components/tools/BondTypePredictor.vue"
import CompoundPredictor from "@/components/tools/CompoundPredictor.vue"

type TabId = "molar-mass" | "bond-type" | "compound"

const TABS: { id: TabId; label: string; description: string }[] = [
  {
    id: "molar-mass",
    label: "Molar mass",
    description: "Parse a formula and sum atomic masses",
  },
  {
    id: "bond-type",
    label: "Bond type",
    description: "Electronegativity difference → bond character",
  },
  {
    id: "compound",
    label: "Compound",
    description: "Shared compounds from element data",
  },
]

const route = useRoute()
const router = useRouter()
const elementStore = useElementStore()

const activeTab = ref<TabId>("molar-mass")

function parseHash(hash: string): TabId | null {
  const id = hash.startsWith("#") ? hash.slice(1) : hash
  if (id === "molar-mass" || id === "bond-type" || id === "compound") {
    return id
  }
  return null
}

onMounted(() => {
  void elementStore.loadElements()
  const p = parseHash(route.hash)
  if (p) {
    activeTab.value = p
  } else if (!route.hash) {
    router.replace({ path: "/tools", hash: "#molar-mass" })
  }
})

watch(
  () => route.hash,
  (h) => {
    const p = parseHash(h ?? "")
    if (p) {
      activeTab.value = p
    }
  },
)

watch(activeTab, (t) => {
  const current = parseHash(route.hash ?? "")
  if (current !== t) {
    void router.replace({ path: "/tools", hash: `#${t}` })
  }
})

function selectTab(id: TabId) {
  activeTab.value = id
}
</script>

<template>
  <main class="tools-view">
    <header class="view-header">
      <h1 class="view-title">Chemistry tools</h1>
      <p class="view-subtitle">
        Quick calculators and predictors using the dataset behind the periodic table.
      </p>
    </header>

    <div class="tabs" role="tablist" aria-label="Tool selection">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        type="button"
        role="tab"
        class="tab"
        :class="{ 'is-active': activeTab === tab.id }"
        :aria-selected="activeTab === tab.id"
        @click="selectTab(tab.id)"
      >
        <span class="tab-label">{{ tab.label }}</span>
        <span class="tab-desc">{{ tab.description }}</span>
      </button>
    </div>

    <section
      v-if="activeTab === 'molar-mass'"
      role="tabpanel"
      aria-label="Molar mass calculator"
      class="panel"
    >
      <MolarMassCalculator />
    </section>

    <section
      v-else-if="activeTab === 'bond-type'"
      role="tabpanel"
      aria-label="Bond type predictor"
      class="panel"
    >
      <BondTypePredictor />
    </section>

    <section
      v-else-if="activeTab === 'compound'"
      role="tabpanel"
      aria-label="Compound predictor"
      class="panel"
    >
      <CompoundPredictor />
    </section>
  </main>
</template>

<style scoped>
.tools-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 2.5rem 3rem;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.view-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.view-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.view-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  border-left: 2px solid var(--bg-border);
  padding-left: 0.75rem;
  max-width: 62ch;
  line-height: 1.6;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

@media (max-width: 820px) {
  .tabs {
    grid-template-columns: 1fr;
  }
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--bg-border);
  background: color-mix(in srgb, var(--bg-surface) 88%, var(--bg-base));
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;
}

.tab:hover {
  border-color: color-mix(in srgb, var(--accent-cyan) 35%, var(--bg-border));
}

.tab.is-active {
  border-color: color-mix(in srgb, var(--accent-cyan) 55%, var(--bg-border));
  background: color-mix(in srgb, var(--accent-cyan) 8%, var(--bg-surface));
  color: var(--text-primary);
}

.tab-label {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.tab-desc {
  font-size: var(--text-2xs);
  opacity: 0.85;
  line-height: 1.35;
}

.panel {
  min-height: 200px;
}
</style>
