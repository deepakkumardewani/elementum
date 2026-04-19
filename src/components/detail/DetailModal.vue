<script setup lang="ts">
import { ref, watch, computed, defineAsyncComponent, onUnmounted, onErrorCaptured, useId } from "vue"
import { storeToRefs } from "pinia"
import { gsap } from "gsap"
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap"
import { useEventListener } from "@vueuse/core"
import { X, ChevronLeft, ChevronRight } from "lucide-vue-next"
import { useElementStore } from "@/stores/elementStore"
import BookmarkButton from "@/components/BookmarkButton.vue"
import ElementHeader from "@/components/detail/ElementHeader.vue"
import ElementPhoto from "@/components/detail/ElementPhoto.vue"
import PropertiesGrid from "@/components/detail/PropertiesGrid.vue"
import ElectronConfigVisualizer from "@/components/detail/ElectronConfigVisualizer.vue"
import SpectralLines from "@/components/detail/SpectralLines.vue"
import ElementFunFacts from "@/components/detail/ElementFunFacts.vue"
import AbundanceSection from "@/components/detail/AbundanceSection.vue"
import DetailTabs from "@/components/detail/DetailTabs.vue"
import IsotopeExplorer from "@/components/detail/IsotopeExplorer.vue"
import EtymologySection from "@/components/detail/EtymologySection.vue"
import RealWorldSection from "@/components/detail/RealWorldSection.vue"
import SafetySection from "@/components/detail/SafetySection.vue"
import { Z } from "@/constants/zIndex"
import type { DetailTabId } from "@/utils/detailTabVisibility"
import { visibleDetailTabIds } from "@/utils/detailTabVisibility"

const AtomModel3D = defineAsyncComponent(
  () => import("@/components/detail/AtomModel3D.vue"),
)

const elementStore = useElementStore()
const { selectedElement, detailPanelOpen, elements } = storeToRefs(elementStore)

const detailTabScope = useId()
const TAB_LABELS: Record<DetailTabId, string> = {
  overview: "Overview",
  isotopes: "Isotopes",
  etymology: "Etymology & History",
  realWorld: "Real World",
  safety: "Safety",
}

const activeDetailTab = ref<DetailTabId>("overview")

const detailTabItems = computed(() => {
  if (!selectedElement.value) return [] as { id: DetailTabId; label: string }[]
  return visibleDetailTabIds(selectedElement.value).map((id) => ({
    id,
    label: TAB_LABELS[id],
  }))
})

watch(
  () => selectedElement.value?.atomicNumber,
  () => {
    activeDetailTab.value = "overview"
  },
)

watch(
  detailTabItems,
  (items) => {
    const ids = items.map((t) => t.id)
    if (!ids.includes(activeDetailTab.value)) {
      activeDetailTab.value = ids[0] ?? "overview"
    }
  },
  { immediate: true },
)

const backdropEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)

const { activate: trapActivate, deactivate: trapDeactivate } = useFocusTrap(panelEl, {
  escapeDeactivates: false,
  clickOutsideDeactivates: false,
  allowOutsideClick: true,
})

let triggerEl: HTMLElement | null = null

function getMotionDuration(normalMs: number): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : normalMs
}

function openPanel() {
  triggerEl = document.activeElement as HTMLElement | null
  gsap.killTweensOf([backdropEl.value!, panelEl.value!])

  const dur = getMotionDuration(0.22)
  gsap.fromTo(backdropEl.value!, { opacity: 0 }, { opacity: 0.6, duration: dur, ease: "power2.out" })
  gsap.fromTo(
    panelEl.value!,
    { opacity: 0, scale: 0.97, y: 8 },
    { opacity: 1, scale: 1, y: 0, duration: dur, ease: "power2.out" }
  )

  requestAnimationFrame(() => {
    trapActivate()
  })
}

function closePanel() {
  trapDeactivate()
  gsap.killTweensOf([backdropEl.value!, panelEl.value!])

  const dur = getMotionDuration(0.18)
  gsap.to(panelEl.value!, { opacity: 0, scale: 0.97, y: 8, duration: dur, ease: "power2.in" })
  gsap.to(backdropEl.value!, {
    opacity: 0,
    duration: dur,
    ease: "power2.in",
    onComplete: () => {
      elementStore.closeDetailPanel()
      triggerEl?.focus()
      triggerEl = null
    },
  })
}

watch(detailPanelOpen, (isOpen) => {
  if (isOpen) openPanel()
})

useEventListener(document, "keydown", (e: KeyboardEvent) => {
  if (!detailPanelOpen.value) return
  if (e.key === "Escape") { e.preventDefault(); closePanel(); return }
  if (e.key === "ArrowRight") { e.preventDefault(); navigateElement(1); return }
  if (e.key === "ArrowLeft") { e.preventDefault(); navigateElement(-1); return }
})

const currentIndex = computed(() => {
  if (!selectedElement.value) return -1
  return elements.value.findIndex((el) => el.atomicNumber === selectedElement.value!.atomicNumber)
})

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < elements.value.length - 1)

const prevElement = computed(() => hasPrev.value ? elements.value[currentIndex.value - 1] : null)
const nextElement = computed(() => hasNext.value ? elements.value[currentIndex.value + 1] : null)

function navigateElement(delta: 1 | -1) {
  const idx = currentIndex.value
  if (idx === -1) return
  const next = elements.value[idx + delta]
  if (next) elementStore.selectElement(next)
}

const atomModelFailed = ref(false)
onErrorCaptured((err) => {
  if (String(err).toLowerCase().includes("webgl") || String(err).toLowerCase().includes("tres")) {
    atomModelFailed.value = true
    return false
  }
})

onUnmounted(() => {
  gsap.killTweensOf([backdropEl.value, panelEl.value])
})
</script>

<template>
  <div
    v-show="detailPanelOpen"
    class="detail-modal-root"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="selectedElement ? `element-heading-${selectedElement.atomicNumber}` : undefined"
  >
    <!-- Backdrop -->
    <div
      ref="backdropEl"
      class="detail-backdrop"
      aria-hidden="true"
      @click="closePanel"
    />

    <!-- Centered dossier panel -->
    <div ref="panelEl" class="detail-panel">
      <div v-if="selectedElement" class="dossier-layout">

        <!-- LEFT: Specimen identity column -->
        <ElementHeader :element="selectedElement" />

        <!-- RIGHT: Data column -->
        <div class="data-col">
          <!-- Toolbar: nav + close -->
          <div class="detail-toolbar">
            <div class="detail-nav">
              <button
                class="detail-nav-btn"
                :disabled="!hasPrev"
                :aria-label="prevElement ? `Previous: ${prevElement.name}` : 'Previous element'"
                @click="navigateElement(-1)"
              >
                <ChevronLeft :size="15" />
              </button>
              <span v-if="prevElement" class="detail-nav-name prev-name">{{ prevElement.name }}</span>
              <span class="detail-nav-label">
                {{ currentIndex + 1 }}<span class="nav-sep">/</span>{{ elements.length }}
              </span>
              <span v-if="nextElement" class="detail-nav-name next-name">{{ nextElement.name }}</span>
              <button
                class="detail-nav-btn"
                :disabled="!hasNext"
                :aria-label="nextElement ? `Next: ${nextElement.name}` : 'Next element'"
                @click="navigateElement(1)"
              >
                <ChevronRight :size="15" />
              </button>
            </div>
            <div class="detail-toolbar-actions">
              <BookmarkButton
                v-if="selectedElement"
                class="detail-bookmark"
                :atomic-number="selectedElement.atomicNumber"
              />
              <button
                class="detail-close-btn"
                aria-label="Close element detail"
                @click="closePanel"
              >
                <X :size="15" />
              </button>
            </div>
          </div>

          <!-- Scrollable sections & tab panels -->
          <div class="detail-content">
            <DetailTabs
              :id-prefix="detailTabScope"
              :tabs="detailTabItems"
              v-model="activeDetailTab"
            />
            <div class="detail-tab-panels">
              <div
                v-show="activeDetailTab === 'overview'"
                :id="`${detailTabScope}-panel-overview`"
                class="detail-tab-panel"
                role="tabpanel"
                aria-label="Overview"
                :aria-labelledby="`${detailTabScope}-tab-overview`"
                tabindex="0"
              >
                <div class="detail-sections">
                  <PropertiesGrid :element="selectedElement" />
                  <ElectronConfigVisualizer :element="selectedElement" />
                  <ElementPhoto :element="selectedElement" />
                  <SpectralLines :lines="selectedElement.spectralLines" />

                  <div class="detail-section">
                    <h3 class="section-title">3D Atom Model</h3>
                    <div v-if="atomModelFailed" class="atom-model-loading">
                      <img
                        v-if="selectedElement.bohrModelImage"
                        :src="selectedElement.bohrModelImage"
                        :alt="`Bohr model of ${selectedElement.name}`"
                        class="atom-model-fallback-img"
                      />
                      <span v-else>3D model unavailable (WebGL not supported).</span>
                    </div>
                    <Suspense v-else>
                      <AtomModel3D :element="selectedElement" />
                      <template #fallback>
                        <div class="atom-model-loading" aria-busy="true">Loading 3D model…</div>
                      </template>
                    </Suspense>
                  </div>

                  <AbundanceSection :abundance="selectedElement.abundance" />
                  <ElementFunFacts :element="selectedElement" />
                </div>
              </div>

              <div
                v-show="activeDetailTab === 'isotopes'"
                :id="`${detailTabScope}-panel-isotopes`"
                class="detail-tab-panel"
                role="tabpanel"
                aria-label="Isotopes"
                :aria-labelledby="`${detailTabScope}-tab-isotopes`"
                tabindex="0"
              >
                <div class="detail-sections detail-sections--compact">
                  <IsotopeExplorer :element="selectedElement" />
                </div>
              </div>

              <div
                v-show="activeDetailTab === 'etymology'"
                :id="`${detailTabScope}-panel-etymology`"
                class="detail-tab-panel"
                role="tabpanel"
                aria-label="Etymology and history"
                :aria-labelledby="`${detailTabScope}-tab-etymology`"
                tabindex="0"
              >
                <div class="detail-sections detail-sections--compact">
                  <EtymologySection :element="selectedElement" />
                </div>
              </div>

              <div
                v-show="activeDetailTab === 'realWorld'"
                :id="`${detailTabScope}-panel-realWorld`"
                class="detail-tab-panel"
                role="tabpanel"
                aria-label="Real world"
                :aria-labelledby="`${detailTabScope}-tab-realWorld`"
                tabindex="0"
              >
                <div class="detail-sections detail-sections--compact">
                  <RealWorldSection :element="selectedElement" />
                </div>
              </div>

              <div
                v-show="activeDetailTab === 'safety'"
                :id="`${detailTabScope}-panel-safety`"
                class="detail-tab-panel"
                role="tabpanel"
                aria-label="Safety"
                :aria-labelledby="`${detailTabScope}-tab-safety`"
                tabindex="0"
              >
                <div class="detail-sections detail-sections--compact">
                  <SafetySection :element="selectedElement" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Root: center the panel ────────────────────────────────────── */
.detail-modal-root {
  position: fixed;
  inset: 0;
  z-index: v-bind("Z.modalBackdrop");
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  pointer-events: none;
}

.detail-backdrop {
  position: fixed;
  inset: 0;
  background-color: color-mix(in srgb, var(--bg-base) 85%, transparent);
  pointer-events: auto;
  opacity: 0;
}

/* ── Panel: centered dossier card ─────────────────────────────── */
.detail-panel {
  position: relative;
  width: min(920px, 100%);
  max-height: min(88vh, 760px);
  background-color: var(--bg-surface);
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  z-index: v-bind("Z.modal");
  pointer-events: auto;
  box-shadow: 0 24px 64px color-mix(in srgb, black 35%, transparent), 0 4px 16px color-mix(in srgb, black 18%, transparent);
  opacity: 0; /* GSAP initial state */
  overflow: hidden;
}

/* ── Two-column dossier layout ────────────────────────────────── */
.dossier-layout {
  display: grid;
  grid-template-columns: 180px 1fr;
  height: 100%;
  min-height: 0;
}

/* ── Right data column ─────────────────────────────────────────── */
.data-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: 1px solid var(--bg-border);
}

/* ── Toolbar ───────────────────────────────────────────────────── */
.detail-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--bg-border);
  flex-shrink: 0;
}

.detail-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.detail-bookmark {
  flex-shrink: 0;
}

.detail-nav {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.detail-nav-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
  min-width: 3rem;
  text-align: center;
}

.nav-sep {
  margin: 0 2px;
  opacity: 0.4;
}

.detail-nav-name {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--text-muted);
  max-width: 5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 150ms ease;
}

.prev-name { text-align: right; }
.next-name { text-align: left; }

.detail-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 2px;
  background: transparent;
  border: 1px solid var(--bg-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}

.detail-nav-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.detail-nav-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.detail-nav-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.detail-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 2px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease;
}

.detail-close-btn:hover {
  border-color: var(--bg-border);
  color: var(--text-primary);
}

.detail-close-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

/* ── Scrollable content ────────────────────────────────────────── */
.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.detail-tab-panels {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  min-height: 0;
}

.detail-tab-panel {
  outline: none;
}

.detail-tab-panel:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: -2px;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.25rem 1.5rem 2rem;
}

.detail-sections--compact {
  padding-top: 1rem;
}

.section-title {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.atom-model-loading {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: var(--text-sm);
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  background-color: var(--bg-elevated);
  overflow: hidden;
}

.atom-model-fallback-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* ── Responsive: stack on narrow screens ────────────────────────── */
@media (max-width: 600px) {
  .detail-modal-root {
    padding: 0;
    align-items: flex-end;
  }

  .detail-panel {
    width: 100%;
    max-height: 92vh;
    border-radius: 4px 4px 0 0;
  }

  .dossier-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .data-col {
    border-left: none;
    border-top: 1px solid var(--bg-border);
  }
}
</style>
