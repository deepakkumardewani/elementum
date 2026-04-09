<script setup lang="ts">
/**
 * Inner scene component rendered inside TresCanvas.
 * useLoop() must be called here (inside the TresCanvas context) not in the parent.
 */
import { ref, onUnmounted } from "vue"
import { useLoop } from "@tresjs/core"
import * as THREE from "three"

interface Shell {
  radius: number
  electrons: number
  speed: number
  tiltX: number
  tiltZ: number
}

const props = defineProps<{
  shells: Shell[]
  /** When true (user is dragging), auto-rotation pauses for a cleaner feel */
  isInteracting?: boolean
}>()

const shellGroupRefs = ref<(THREE.Group | null)[]>([])

function electronPositions(
  radius: number,
  count: number,
): Array<[number, number, number]> {
  const cap = Math.min(count, 8)
  return Array.from({ length: cap }, (_, i) => {
    const angle = (2 * Math.PI * i) / cap
    return [radius * Math.cos(angle), 0, radius * Math.sin(angle)] as [number, number, number]
  })
}

const { onBeforeRender, stop } = useLoop()

onBeforeRender(({ delta }) => {
  // Pause auto-rotation while the user is dragging so the view stays still
  if (props.isInteracting) return
  shellGroupRefs.value.forEach((group, i) => {
    if (!group) return
    const s = props.shells[i]
    if (!s) return
    group.rotation.y += s.speed * delta
  })
})

onUnmounted(() => stop())
</script>

<template>
  <!-- Nucleus -->
  <TresMesh :position="[0, 0, 0]">
    <TresSphereGeometry :args="[0.35, 32, 32]" />
    <TresMeshStandardMaterial
      color="#22d3ee"
      :emissive="'#0891b2'"
      :emissive-intensity="0.6"
      :roughness="0.3"
      :metalness="0.8"
    />
  </TresMesh>

  <!-- Electron shells -->
  <TresGroup
    v-for="(shell, i) in shells"
    :key="`shell-${i}`"
    :ref="(el) => { shellGroupRefs[i] = el as THREE.Group | null }"
    :rotation="[shell.tiltX, 0, shell.tiltZ]"
  >
    <!-- Orbit ring (torus) -->
    <TresMesh>
      <TresTorusGeometry :args="[shell.radius, 0.012, 8, 80]" />
      <TresMeshStandardMaterial color="#22d3ee" :emissive="'#0891b2'" :emissive-intensity="0.3" :opacity="0.25" :transparent="true" />
    </TresMesh>

    <!-- Electrons on this shell -->
    <TresMesh
      v-for="(pos, ei) in electronPositions(shell.radius, shell.electrons)"
      :key="`e-${i}-${ei}`"
      :position="pos"
    >
      <TresSphereGeometry :args="[0.07, 12, 12]" />
      <TresMeshStandardMaterial color="#22d3ee" :emissive="'#22d3ee'" :emissive-intensity="0.8" />
    </TresMesh>
  </TresGroup>
</template>
