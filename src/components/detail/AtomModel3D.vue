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
import { TresCanvas } from "@tresjs/core"
import { OrbitControls } from "@tresjs/cientos"
import type { Element } from "@/types/element"
import AtomScene from "@/components/detail/AtomScene.vue"

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
    <TresCanvas alpha :clear-color="'transparent'" class="atom-canvas">
      <TresPerspectiveCamera :position="CAMERA_POSITION" :look-at="CAMERA_LOOK_AT" :fov="45" />
      <TresAmbientLight :intensity="0.6" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="1.2" :color="'#22d3ee'" />
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
      <AtomScene :shells="shells" :is-interacting="isInteracting" />
    </TresCanvas>
    <p class="atom-hint">Drag to rotate · Scroll to zoom</p>
  </div>
</template>

<style scoped>
.atom-canvas-wrap {
  width: 100%;
  height: 280px;
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

.atom-hint {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  color: var(--text-muted);
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: 0.04em;
  margin: 0;
}
</style>
