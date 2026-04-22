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
import { lockBodyScroll, unlockBodyScroll } from "@/utils/bodyScrollLock"

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

watch(
  detailPanelOpen,
  (isOpen) => {
    if (isOpen) {
      lockBodyScroll()
      openPanel()
    } else {
      unlockBodyScroll()
    }
  },
)

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
  if (detailPanelOpen.value) {
    unlockBodyScroll()
  }
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
      @wheel.stop.prevent
    />

    <!-- Centered dossier panel -->
    <div ref="panelEl" class="detail-panel">
      <div v-if="selectedElement" class="dossier-layout">

        <!-- LEFT: Specimen identity column (non-scrollable; stop wheel from reaching the page). -->
        <div class="specimen-column" @wheel.stop.prevent>
          <ElementHeader :element="selectedElement" />
        </div>

        <!-- RIGHT: Data column -->
        <div class="data-col">
          <!-- Toolbar: nav + close -->
          <div class="detail-toolbar" @wheel.stop.prevent>
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
            <div class="detail-tabs-wrap" @wheel.stop.prevent>
              <DetailTabs
                :id-prefix="detailTabScope"
                :tabs="detailTabItems"
                v-model="activeDetailTab"
              />
            </div>
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
  /* Prevent scroll chaining to the page when the overlay is the target. */
  overscroll-behavior: none;
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
  /* Allow shrinking in flex layout; % width respects narrow viewports. */
  min-width: 0;
  width: min(920px, 100%);
  /* dvh: stable height when the browser UI resizes; fixed cap so tab switches don't resize the shell. */
  height: min(88dvh, 760px);
  max-height: min(88dvh, 760px);
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

/* First grid area: identity column; wrapper is the grid child for wheel handling. */
.specimen-column {
  min-width: 0;
  min-height: 0;
}

.detail-tabs-wrap {
  flex-shrink: 0;
}

/* ── Two-column dossier layout ────────────────────────────────── */
.dossier-layout {
  display: grid;
  /* minmax(0, 1fr) lets the data column shrink below min-content (fixes narrow-width grid blowout). */
  grid-template-columns: 180px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

/* ── Right data column ─────────────────────────────────────────── */
.data-col {
  display: flex;
  flex-direction: column;
  /* Critical on narrow viewports: default min-width:auto blocks shrink and breaks the scroll height chain. */
  min-width: 0;
  min-height: 0;
  /* Contain the column so the inner scroll area gets a real max height (flex min-size:auto otherwise grows with content). */
  overflow: hidden;
  border-left: 1px solid var(--bg-border);
}

/* ── Toolbar ───────────────────────────────────────────────────── */
.detail-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 0;
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
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.detail-tab-panels {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  /* Extra room at end of scroll so the last block (e.g. Common Compounds) is not flush against the modal edge. */
  padding-bottom: max(3.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem));
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
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
  min-width: 0;
  padding: 1.25rem 1.5rem max(2.5rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem));
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
    height: min(92dvh, 100dvh);
    max-height: min(92dvh, 100dvh);
    border-radius: 4px 4px 0 0;
  }

  .dossier-layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .data-col {
    min-height: 0;
    border-left: none;
    border-top: 1px solid var(--bg-border);
  }
}
</style>
