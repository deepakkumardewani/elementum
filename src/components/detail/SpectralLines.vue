<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { gsap } from "gsap"
import { wavelengthToRgb } from "@/utils/wavelength"

const props = defineProps<{ lines: { wavelength: number; color?: string }[] }>()

function spectralLineStyle(line: { wavelength: number }) {
  const color = wavelengthToRgb(line.wavelength)
  return {
    backgroundColor: color,
    boxShadow: `0 0 6px 3px ${color}`,
    left: `${((line.wavelength - 380) / 400) * 100}%`,
  }
}

const barRef = ref<HTMLElement | null>(null)

function animateLines() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  if (!barRef.value) return
  const lineEls = barRef.value.querySelectorAll('.spectral-line')
  if (lineEls.length > 0) {
    gsap.fromTo(
      lineEls,
      { opacity: 0, scaleY: 0 },
      { opacity: 1, scaleY: 1, duration: 0.4, stagger: 0.01, ease: 'power2.out', transformOrigin: "bottom" }
    )
  }
}

onMounted(animateLines)
watch(() => props.lines, animateLines, { deep: true })
</script>

<template>
  <div class="spectral-section" aria-label="Emission spectrum">
    <h3 class="spectral-title">Emission Spectrum</h3>

    <div v-if="lines.length > 0" ref="barRef" class="spectral-bar" role="img" :aria-label="`${lines.length} spectral emission lines`">
      <!-- Dark reference band (background of the spectrum) -->
      <div class="spectral-bg" />

      <!-- Each emission line as a vertical stripe -->
      <!-- Physically accurate positioning: ((line.wavelength - 380) / 400) * 100 -->
      <div
        v-for="(line, i) in lines"
        :key="i"
        class="spectral-line"
        :style="spectralLineStyle(line)"
        :title="`${line.wavelength} nm`"
      />
    </div>

    <p v-else class="spectral-empty">No spectral data available for this element.</p>
  </div>
</template>

<style scoped>
.spectral-title {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.spectral-bar {
  position: relative;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--bg-border);
}

.spectral-bg {
  position: absolute;
  inset: 0;
  background: #000;
}

.spectral-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  /* Glow is applied inline per-line using the actual line color */
  filter: blur(0.5px) brightness(1.3);
}

.spectral-empty {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-style: italic;
}
</style>
