<script setup lang="ts">
/**
 * Lazy-loaded 3D atom model using TresJS (Three.js declarative wrapper).
 * Scene content lives in AtomScene.vue (a child rendered inside TresCanvas)
 * so that useLoop() has access to the TresJS context.
 */
import { computed } from "vue"
import { TresCanvas } from "@tresjs/core"
import type { Element } from "@/types/element"
import AtomScene from "@/components/detail/AtomScene.vue"

const props = defineProps<{ element: Element }>()

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
  <div class="atom-canvas-wrap" aria-label="3D atom model" role="img">
    <TresCanvas alpha :clear-color="'transparent'" class="atom-canvas">
      <TresPerspectiveCamera :position="[0, 2.5, 6]" :look-at="[0, 0, 0]" :fov="45" />
      <TresAmbientLight :intensity="0.6" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="1.2" :color="'#22d3ee'" />
      <AtomScene :shells="shells" />
    </TresCanvas>
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
}

.atom-canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
