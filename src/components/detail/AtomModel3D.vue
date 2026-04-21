<script setup lang="ts">
/**
 * Lazy-loaded 3D atom model using TresJS (Three.js declarative wrapper).
 * Scene content lives in AtomScene.vue (a child rendered inside TresCanvas)
 * so that useLoop() has access to the TresJS context.
 *
 * OrbitControls (from @tresjs/cientos) enable mouse drag to rotate and
 * scroll to zoom. Pan is disabled to keep the atom centred.
 */
import { computed, ref } from "vue"
import { storeToRefs } from "pinia"
import { TresCanvas } from "@tresjs/core"
import { OrbitControls } from "@tresjs/cientos"
import type { Element } from "@/types/element"
import AtomScene from "@/components/detail/AtomScene.vue"
import { useUiStore } from "@/stores/uiStore"

// Drive clear-color from the store's isDark flag — same source of truth as CSS tokens
const { isDark } = storeToRefs(useUiStore())
const clearColor = computed(() => isDark.value ? "#1a2236" : "#eef1f7")

// Module-level constants so `:position` / `:look-at` bindings always receive
// the SAME reference across re-renders. Without this, every render creates a
// new array literal, TresJS detects a "change" and resets the camera position,
// undoing any orbit the user applied via OrbitControls.
const CAMERA_POSITION: [number, number, number] = [0, 2.5, 6]
const CAMERA_LOOK_AT: [number, number, number] = [0, 0, 0]

const props = defineProps<{ element: Element }>()

// Exposed to AtomScene so auto-rotation pauses while the user drags
const isInteracting = ref(false)

const shells = computed(() =>
  props.element.electronShells.slice(0, 7).map((count, i) => ({
    radius: 0.6 + i * 0.55,
    electrons: count,
    // Each shell rotates at a different speed and axis for visual interest
    speed: 0.4 - i * 0.04,
    tiltX: (i % 3) * (Math.PI / 5),
    tiltZ: (i % 2) * (Math.PI / 7),
  })),
)
</script>

<template>
  <div
    class="atom-canvas-wrap"
    aria-label="Interactive 3D atom model. Drag to rotate, scroll to zoom."
    role="img"
    @wheel.stop.prevent
  >
    <TresCanvas :clear-color="clearColor" class="atom-canvas">
      <TresPerspectiveCamera :position="CAMERA_POSITION" :look-at="CAMERA_LOOK_AT" :fov="45" />
      <TresAmbientLight :intensity="0.8" />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.4" :color="'#ffffff'" />
      <TresPointLight :position="[-4, -4, -4]" :intensity="0.6" :color="'#3b82f6'" />
      <OrbitControls
        enable-damping
        :damping-factor="0.08"
        :min-distance="3"
        :max-distance="12"
        :enable-pan="false"
        :enable-zoom="true"
        @start="isInteracting = true"
        @end="isInteracting = false"
      />
      <AtomScene
        :shells="shells"
        :is-interacting="isInteracting"
        :atomic-number="element.atomicNumber"
        :atomic-mass="element.atomicMass"
      />
    </TresCanvas>
    <div class="atom-canvas-caption">
      <p class="atom-hint">Drag to rotate · Scroll to zoom</p>
      <p class="model-disclaimer">
        Simplified shell model — actual electron positions are described by quantum probability distributions
      </p>
    </div>
  </div>
</template>

<style scoped>
.atom-canvas-wrap {
  width: 100%;
  height: 360px;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  position: relative;
  cursor: grab;
  touch-action: none;
}

.atom-canvas-wrap:active {
  cursor: grabbing;
}

.atom-canvas {
  width: 100% !important;
  height: 100% !important;
}

.atom-canvas-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem 0.65rem;
  pointer-events: none;
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--bg-elevated) 92%, transparent) 0%,
    color-mix(in srgb, var(--bg-elevated) 45%, transparent) 55%,
    transparent 100%
  );
}

.atom-hint {
  margin: 0;
  font-size: 0.625rem;
  color: var(--text-muted);
  white-space: nowrap;
  letter-spacing: 0.04em;
  text-align: center;
}

.model-disclaimer {
  width: 100%;
  max-width: 22rem;
  margin: 0;
  font-size: 0.6rem;
  line-height: 1.35;
  color: var(--text-muted);
  text-align: center;
}
</style>
