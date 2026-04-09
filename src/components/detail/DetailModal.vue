<script setup lang="ts">
import { ref, watch, computed, defineAsyncComponent, onUnmounted, onErrorCaptured } from "vue"
import { storeToRefs } from "pinia"
import { gsap } from "gsap"
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap"
import { useEventListener } from "@vueuse/core"
import { X, ChevronLeft, ChevronRight } from "lucide-vue-next"
import { useElementStore } from "@/stores/elementStore"
import ElementHeader from "@/components/detail/ElementHeader.vue"
import ElementPhoto from "@/components/detail/ElementPhoto.vue"
import PropertiesGrid from "@/components/detail/PropertiesGrid.vue"
import ElectronConfigVisualizer from "@/components/detail/ElectronConfigVisualizer.vue"
import SpectralLines from "@/components/detail/SpectralLines.vue"
import ElementFunFacts from "@/components/detail/ElementFunFacts.vue"

const AtomModel3D = defineAsyncComponent(
  () => import("@/components/detail/AtomModel3D.vue"),
)

const elementStore = useElementStore()
const { selectedElement, detailPanelOpen, elements } = storeToRefs(elementStore)

// DOM refs
const backdropEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
// Focus trap — only active when panel is open.
// escapeDeactivates:false lets our own keydown handler manage Escape so the
// panel close animation runs before focus-trap tears down.
// clickOutsideDeactivates:false prevents focus-trap from deactivating on
// backdrop click (we handle that ourselves via @click on the backdrop).
// allowOutsideClick:true is required so focus-trap does NOT call
// stopImmediatePropagation on clicks outside the panel — without it, any
// Teleported child (e.g. ElementPhoto lightbox) cannot receive click events.
const { activate: trapActivate, deactivate: trapDeactivate } = useFocusTrap(panelEl, {
  escapeDeactivates: false,
  clickOutsideDeactivates: false,
  allowOutsideClick: true,
})

// Track the element tile that triggered open so we can return focus on close
let triggerEl: HTMLElement | null = null

function openPanel() {
  triggerEl = document.activeElement as HTMLElement | null

  // Kill any in-progress close tween before starting open
  gsap.killTweensOf([backdropEl.value!, panelEl.value!])

  gsap.fromTo(backdropEl.value!, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
  gsap.fromTo(panelEl.value!, { x: "100%" }, { x: "0%", duration: 0.3, ease: "expo.out" })

  // Wait for paint then trap focus
  requestAnimationFrame(() => {
    trapActivate()
  })
}

function closePanel() {
  trapDeactivate()

  // Kill any in-progress open tween before starting close
  gsap.killTweensOf([backdropEl.value!, panelEl.value!])

  gsap.to(panelEl.value!, { x: "100%", duration: 0.22, ease: "expo.in" })
  gsap.to(backdropEl.value!, {
    opacity: 0,
    duration: 0.22,
    ease: "power2.in",
    onComplete: () => {
      elementStore.closeDetailPanel()
      triggerEl?.focus()
      triggerEl = null
    },
  })
}

watch(detailPanelOpen, (isOpen) => {
  if (isOpen) {
    openPanel()
  }
})

// Keyboard: ESC closes, left/right arrows navigate between elements
useEventListener(document, "keydown", (e: KeyboardEvent) => {
  if (!detailPanelOpen.value) return

  if (e.key === "Escape") {
    e.preventDefault()
    closePanel()
    return
  }

  if (e.key === "ArrowRight") {
    e.preventDefault()
    navigateElement(1)
    return
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault()
    navigateElement(-1)
    return
  }
})

const currentIndex = computed(() => {
  if (!selectedElement.value) return -1
  return elements.value.findIndex(
    (el) => el.atomicNumber === selectedElement.value!.atomicNumber,
  )
})

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < elements.value.length - 1)

function navigateElement(delta: 1 | -1) {
  const idx = currentIndex.value
  if (idx === -1) return
  const next = elements.value[idx + delta]
  if (next) elementStore.selectElement(next)
}

// Error boundary: catch WebGL / TresJS failures and show 2D fallback
const atomModelFailed = ref(false)
onErrorCaptured((err) => {
  if (String(err).toLowerCase().includes("webgl") || String(err).toLowerCase().includes("tres")) {
    atomModelFailed.value = true
    return false // suppress propagation
  }
})

onUnmounted(() => {
  gsap.killTweensOf([backdropEl.value, panelEl.value])
})
</script>

<template>
  <!-- v-show preserves GSAP state and prevents CLS (per performance rules) -->
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

    <!-- Panel -->
    <div ref="panelEl" class="detail-panel">
      <!-- Close button -->
      <div class="detail-panel-toolbar">
        <!-- Element navigator -->
        <div class="detail-nav">
          <button
            class="detail-nav-btn"
            :disabled="!hasPrev"
            aria-label="Previous element"
            @click="navigateElement(-1)"
          >
            <ChevronLeft :size="18" />
          </button>
          <span class="detail-nav-label">
            {{ currentIndex + 1 }} / {{ elements.length }}
          </span>
          <button
            class="detail-nav-btn"
            :disabled="!hasNext"
            aria-label="Next element"
            @click="navigateElement(1)"
          >
            <ChevronRight :size="18" />
          </button>
        </div>

        <button
          class="detail-close-btn"
          aria-label="Close element detail panel"
          @click="closePanel"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Scrollable content -->
      <div v-if="selectedElement" class="detail-content">
        <ElementHeader :element="selectedElement" />

        <div class="detail-sections">
          <ElementPhoto :element="selectedElement" />
          <SpectralLines :lines="selectedElement.spectralLines" />
          <PropertiesGrid :element="selectedElement" />
          <ElectronConfigVisualizer :element="selectedElement" />

          <div class="detail-3d-section">
            <h3 class="detail-section-title">3D Atom Model</h3>
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
                <div class="atom-model-loading" aria-busy="true">
                  Loading 3D model…
                </div>
              </template>
            </Suspense>
          </div>

          <ElementFunFacts :element="selectedElement" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-modal-root {
  position: fixed;
  inset: 0;
  z-index: 30; /* modalBackdrop level — panel inside is z:40 */
  pointer-events: none;
}

.detail-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgb(0 0 0 / 0.75);
  pointer-events: auto;
  opacity: 0; /* GSAP will tween this */
}

.detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(680px, 100vw);
  background-color: var(--bg-surface);
  border-left: 1px solid var(--bg-border);
  display: flex;
  flex-direction: column;
  z-index: 40; /* modal */
  pointer-events: auto;
  box-shadow: -8px 0 40px rgb(0 0 0 / 0.5);
  transform: translateX(100%); /* GSAP initial state */
}

.detail-panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--bg-border);
  flex-shrink: 0;
}

.detail-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-nav-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  min-width: 3.5rem;
  text-align: center;
}

.detail-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--bg-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

.detail-nav-btn:hover:not(:disabled) {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
}

.detail-nav-btn:disabled {
  opacity: 0.3;
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
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--bg-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

.detail-close-btn:hover {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
}

.detail-close-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 0 2rem;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
}

.detail-section-title {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.detail-3d-section {
  /* intentionally no extra wrapper style — title + content only */
}

.atom-model-loading {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.875rem;
  border: 1px solid var(--bg-border);
  border-radius: 8px;
  background-color: var(--bg-elevated);
  overflow: hidden;
}

.atom-model-fallback-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
