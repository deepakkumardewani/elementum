<script setup lang="ts">
/**
 * Inner scene component rendered inside TresCanvas.
 * useLoop() must be called here (inside the TresCanvas context) not in the parent.
 *
 * Animation phases:
 *   0 → FLAT_DURATION   : all shells spin flat (rings visible as ellipses/circles)
 *   FLAT_DURATION → +TILT_DURATION : shells smoothly tilt to their orbital angles
 *   after that          : normal tilted orbital rotation
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
  isInteracting?: boolean
}>()

// Seconds to stay flat before tilting
const FLAT_DURATION = 3
// Seconds the tilt-in transition takes
const TILT_DURATION = 1.8

const shellGroupRefs = ref<(THREE.Group | null)[]>([])
const elapsedTime = ref(0)

// Deterministic nucleus cluster: alternating red (proton) / blue (neutron) spheres
const NUCLEUS_PARTICLES: Array<{ pos: [number, number, number]; color: string }> = [
  { pos: [-0.09, 0.09,  0.05], color: "#ef4444" },
  { pos: [ 0.11,-0.04,  0.07], color: "#3b82f6" },
  { pos: [-0.07,-0.11, -0.05], color: "#ef4444" },
  { pos: [ 0.04, 0.11, -0.09], color: "#3b82f6" },
  { pos: [ 0.13, 0.05, -0.04], color: "#ef4444" },
  { pos: [-0.11, 0.01,  0.11], color: "#3b82f6" },
  { pos: [ 0.01,-0.13,  0.09], color: "#ef4444" },
  { pos: [-0.05, 0.07, -0.13], color: "#3b82f6" },
]

// Place electrons evenly around the ring in the XZ plane (matching torus orientation)
function electronPositions(radius: number, count: number): Array<[number, number, number]> {
  const cap = Math.min(count, 8)
  return Array.from({ length: cap }, (_, i) => {
    const angle = (2 * Math.PI * i) / cap
    return [radius * Math.cos(angle), 0, radius * Math.sin(angle)] as [number, number, number]
  })
}

// Smoothstep easing for the tilt transition
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

const { onBeforeRender, stop } = useLoop()

onBeforeRender(({ delta }) => {
  // Always advance time so transitions aren't paused mid-flight when user drags
  elapsedTime.value += delta

  if (props.isInteracting) return

  shellGroupRefs.value.forEach((group, i) => {
    if (!group) return
    const s = props.shells[i]
    if (!s) return

    // Continuous Y-axis spin
    group.rotation.y += s.speed * delta

    // Tilt phase
    if (elapsedTime.value < FLAT_DURATION) {
      group.rotation.x = 0
      group.rotation.z = 0
    } else if (elapsedTime.value < FLAT_DURATION + TILT_DURATION) {
      const t = smoothstep((elapsedTime.value - FLAT_DURATION) / TILT_DURATION)
      group.rotation.x = s.tiltX * t
      group.rotation.z = s.tiltZ * t
    } else {
      group.rotation.x = s.tiltX
      group.rotation.z = s.tiltZ
    }
  })
})

onUnmounted(() => stop())
</script>

<template>
  <!-- Nucleus: cluster of red (proton) and blue (neutron) spheres -->
  <TresMesh
    v-for="(n, i) in NUCLEUS_PARTICLES"
    :key="`nucleus-${i}`"
    :position="n.pos"
  >
    <TresSphereGeometry :args="[0.13, 20, 20]" />
    <TresMeshStandardMaterial
      :color="n.color"
      :emissive="n.color"
      :emissive-intensity="0.35"
      :roughness="0.45"
      :metalness="0.15"
    />
  </TresMesh>

  <!-- Electron shells -->
  <TresGroup
    v-for="(shell, i) in shells"
    :key="`shell-${i}`"
    :ref="(el) => { shellGroupRefs[i] = el as THREE.Group | null }"
  >
    <!--
      Orbit ring: torus default orientation is XY plane.
      Rotate 90° around X so it lies in the XZ plane — matching electronPositions().
    -->
    <TresMesh :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[shell.radius, 0.012, 8, 100]" />
      <TresMeshStandardMaterial
        color="#ffffff"
        :emissive="'#ffffff'"
        :emissive-intensity="0.1"
        :opacity="0.55"
        :transparent="true"
      />
    </TresMesh>

    <!-- Electrons -->
    <TresMesh
      v-for="(pos, ei) in electronPositions(shell.radius, shell.electrons)"
      :key="`e-${i}-${ei}`"
      :position="pos"
    >
      <TresSphereGeometry :args="[0.072, 14, 14]" />
      <TresMeshStandardMaterial
        color="#4ade80"
        :emissive="'#4ade80'"
        :emissive-intensity="1.2"
        :roughness="0.1"
        :metalness="0"
      />
    </TresMesh>
  </TresGroup>
</template>
