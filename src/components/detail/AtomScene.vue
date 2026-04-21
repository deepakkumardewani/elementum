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
import { ref, computed, onUnmounted } from "vue"
import { useLoop } from "@tresjs/core"
import { storeToRefs } from "pinia"
import { useUiStore } from "@/stores/uiStore"
import { buildNucleus, electronPositions } from "@/utils/atomScene"
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
  atomicNumber: number
  atomicMass: number
}>()

const uiStore = useUiStore()
const { isDark } = storeToRefs(uiStore)

const ringsColor = computed(() => (isDark.value ? "#ffffff" : "#0891b2"))

const nucleusParticles = computed(() => buildNucleus(props.atomicNumber, props.atomicMass))

// Seconds to stay flat before tilting
const FLAT_DURATION = 3
// Seconds the tilt-in transition takes
const TILT_DURATION = 1.8

const shellGroupRefs = ref<(THREE.Group | null)[]>([])
const elapsedTime = ref(0)

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
    v-for="(n, i) in nucleusParticles"
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
        :color="ringsColor"
        :emissive="ringsColor"
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
