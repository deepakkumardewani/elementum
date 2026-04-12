<script setup lang="ts">
import { computed } from "vue"
import type { Element } from "@/types/element"

const props = defineProps<{ element: Element }>()

// Shell names K–Q for display (max 7 shells)
const SHELL_NAMES = ["K", "L", "M", "N", "O", "P", "Q"] as const

// SVG layout constants
const NUCLEUS_R = 18
const SHELL_SPACING = 28  // px between each orbit ring
const ELECTRON_R = 5

interface ShellData {
  name: string
  radius: number
  electrons: number
  // CSS animation delay per shell (stagger effect)
  delayClass: string
}

const shells = computed((): ShellData[] =>
  props.element.electronShells.slice(0, 7).map((count, i) => ({
    name: SHELL_NAMES[i] ?? `Shell ${i + 1}`,
    radius: NUCLEUS_R + SHELL_SPACING + i * SHELL_SPACING,
    electrons: count,
    delayClass: `shell-delay-${i}`,
  })),
)

// Total SVG size — enough for the outermost shell
const svgSize = computed(() => {
  const outermost = shells.value[shells.value.length - 1]
  if (!outermost) return 80
  return (outermost.radius + ELECTRON_R + 12) * 2
})

// Distribute electrons evenly around a circle, return their (x, y) coords
function electronPositions(
  cx: number,
  cy: number,
  radius: number,
  count: number,
): Array<{ x: number; y: number }> {
  if (count === 0) return []
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2 // start at top
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
}
</script>

<template>
  <div class="electron-section">
    <h3 class="electron-title">Electron Configuration</h3>

    <div class="electron-layout">
      <!-- SVG diagram -->
      <div class="electron-svg-wrap" aria-hidden="true">
        <svg
          :width="svgSize"
          :height="svgSize"
          :viewBox="`0 0 ${svgSize} ${svgSize}`"
          class="electron-svg"
        >
          <!-- Orbit rings -->
          <circle
            v-for="shell in shells"
            :key="`orbit-${shell.name}`"
            :cx="svgSize / 2"
            :cy="svgSize / 2"
            :r="shell.radius"
            class="orbit-ring"
          />

          <!-- Nucleus -->
          <circle
            :cx="svgSize / 2"
            :cy="svgSize / 2"
            :r="NUCLEUS_R"
            class="nucleus"
          />
          <text
            :x="svgSize / 2"
            :y="svgSize / 2 + 1"
            text-anchor="middle"
            dominant-baseline="middle"
            class="nucleus-text"
          >
            {{ element.atomicNumber }}
          </text>

          <!-- Electrons per shell -->
          <template v-for="(shell, si) in shells" :key="`electrons-${shell.name}`">
            <circle
              v-for="(pos, ei) in electronPositions(svgSize / 2, svgSize / 2, shell.radius, shell.electrons)"
              :key="`e-${si}-${ei}`"
              :cx="pos.x"
              :cy="pos.y"
              :r="ELECTRON_R"
              class="electron"
              :class="shell.delayClass"
            />
          </template>
        </svg>
      </div>

      <!-- Shell legend + notation -->
      <div class="electron-info">
        <div class="shell-legend">
          <div
            v-for="shell in shells"
            :key="shell.name"
            class="shell-row"
          >
            <span class="shell-name">{{ shell.name }}</span>
            <span class="shell-count">{{ shell.electrons }}</span>
            <div class="shell-bar-track">
              <div
                class="shell-bar"
                :class="shell.delayClass"
                :style="{ '--fill-pct': `${Math.min(100, (shell.electrons / 32) * 100)}%` }"
              />
            </div>
          </div>
        </div>

        <div class="electron-notation">
          <span class="notation-label">Spectroscopic</span>
          <code class="notation-value">{{ element.electronConfigurationSemantic }}</code>
        </div>
        <div class="electron-notation">
          <span class="notation-label">Full</span>
          <code class="notation-value">{{ element.electronConfiguration }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.electron-title {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.electron-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.electron-svg-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

.electron-svg {
  /* Let SVG fill available width up to its natural size */
  max-width: min(100%, 420px);
  width: 100%;
  height: auto;
}

.orbit-ring {
  fill: none;
  stroke: var(--bg-border);
  stroke-width: 1;
}

.nucleus {
  fill: var(--bg-elevated);
  stroke: var(--accent-cyan);
  stroke-width: 1.5;
}

.nucleus-text {
  font-size: 10px;
  font-weight: 700;
  fill: var(--accent-cyan);
}

/* Electrons animate in with opacity + scale */
.electron {
  fill: var(--accent-cyan);
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: electronFadeIn 0.4s ease forwards;
}

/* Stagger delays for shells */
.shell-delay-0 { animation-delay: 0.1s; }
.shell-delay-1 { animation-delay: 0.25s; }
.shell-delay-2 { animation-delay: 0.4s; }
.shell-delay-3 { animation-delay: 0.55s; }
.shell-delay-4 { animation-delay: 0.7s; }
.shell-delay-5 { animation-delay: 0.85s; }
.shell-delay-6 { animation-delay: 1s; }

@keyframes electronFadeIn {
  from {
    opacity: 0;
    transform: scale(0.2);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ── Shell legend ── */
.electron-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shell-legend {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.shell-row {
  display: grid;
  grid-template-columns: 1.25rem 1.5rem 1fr;
  align-items: center;
  gap: 0.5rem;
}

.shell-name {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.shell-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: right;
}

.shell-bar-track {
  height: 6px;
  background-color: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.shell-bar {
  height: 100%;
  width: 0;
  background-color: var(--accent-cyan);
  border-radius: 3px;
  animation: shellFill 0.5s ease forwards;
}

/* Reuse same delay classes — fill bar in sync with electrons */
.shell-bar.shell-delay-0 { animation-delay: 0.1s; }
.shell-bar.shell-delay-1 { animation-delay: 0.25s; }
.shell-bar.shell-delay-2 { animation-delay: 0.4s; }
.shell-bar.shell-delay-3 { animation-delay: 0.55s; }
.shell-bar.shell-delay-4 { animation-delay: 0.7s; }
.shell-bar.shell-delay-5 { animation-delay: 0.85s; }
.shell-bar.shell-delay-6 { animation-delay: 1s; }

@keyframes shellFill {
  from { width: 0; }
  to { width: var(--fill-pct, 0%); }
}

.electron-notation {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notation-label {
  font-size: 0.6875rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

.notation-value {
  font-family: ui-monospace, "Cascadia Code", monospace;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 4px;
  padding: 0.375rem 0.5rem;
  word-break: break-all;
  line-height: 1.5;
}
</style>
