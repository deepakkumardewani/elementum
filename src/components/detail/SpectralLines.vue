<script setup lang="ts">
defineProps<{ lines: { wavelength: number; color: string }[] }>()
</script>

<template>
  <div class="spectral-section" aria-label="Emission spectrum">
    <h3 class="spectral-title">Emission Spectrum</h3>

    <div v-if="lines.length > 0" class="spectral-bar" role="img" :aria-label="`${lines.length} spectral emission lines`">
      <!-- Dark reference band (background of the spectrum) -->
      <div class="spectral-bg" />

      <!-- Each emission line as a vertical stripe -->
      <!-- Physically accurate positioning: ((line.wavelength - 380) / 400) * 100 -->
      <div
        v-for="(line, i) in lines"
        :key="i"
        class="spectral-line"
        :style="{
          backgroundColor: line.color,
          boxShadow: `0 0 6px 3px ${line.color}`,
          left: `${((line.wavelength - 380) / 400) * 100}%`,
        }"
        :title="`${line.wavelength} nm`"
      />
    </div>

    <p v-else class="spectral-empty">No spectral data available for this element.</p>
  </div>
</template>

<style scoped>
.spectral-title {
  font-size: 0.6875rem;
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
