<script setup lang="ts">
import { computed } from "vue"
import type { Element } from "@/types/element"

const props = defineProps<{ element: Element }>()

const SHELL_NAMES = ["K", "L", "M", "N", "O", "P", "Q"] as const
// Max electrons per shell by quantum mechanics
const SHELL_MAX = [2, 8, 18, 32, 32, 18, 8] as const

const NUCLEUS_R = 16
const SHELL_SPACING = 26
const ELECTRON_R = 4.5

interface ShellData {
  name: string
  radius: number
  electrons: number
  max: number
  delayClass: string
}

const shells = computed((): ShellData[] =>
  props.element.electronShells.slice(0, 7).map((count, i) => ({
    name: SHELL_NAMES[i] ?? `Shell ${i + 1}`,
    radius: NUCLEUS_R + SHELL_SPACING + i * SHELL_SPACING,
    electrons: count,
    max: SHELL_MAX[i] ?? 32,
    delayClass: `shell-delay-${i}`,
  })),
)

const svgSize = computed(() => {
  const outermost = shells.value[shells.value.length - 1]
  if (!outermost) return 80
  return (outermost.radius + ELECTRON_R + 12) * 2
})

function electronPositions(
  cx: number,
  cy: number,
  radius: number,
  count: number,
): Array<{ x: number; y: number }> {
  if (count === 0) return []
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
}

// Parse e.g. "1s2 2s2 2p6" into badge tokens with superscripts
interface OrbitalToken {
  base: string   // "1s"
  sup: string    // "2"
}

const orbitalTokens = computed((): OrbitalToken[] => {
  const raw = props.element.electronConfigurationSemantic ?? ""
  return raw.split(/\s+/).filter(Boolean).map((part) => {
    const match = part.match(/^(\[?\w+\]?)(.*)$/)
    if (!match) return { base: part, sup: "" }
    // Split at last digit group for superscript
    const inner = match[1] + match[2]
    const m2 = inner.match(/^(.+?)(\d+)$/)
    if (!m2) return { base: inner, sup: "" }
    return { base: m2[1], sup: m2[2] }
  })
})
</script>

<template>
  <div class="electron-section">
    <h3 class="section-title">Electron Configuration</h3>

    <div class="electron-layout">
      <!-- Left: SVG Bohr diagram -->
      <div class="electron-svg-wrap" aria-hidden="true">
        <svg
          :width="svgSize"
          :height="svgSize"
          :viewBox="`0 0 ${svgSize} ${svgSize}`"
          class="electron-svg"
        >
          <circle
            v-for="shell in shells"
            :key="`orbit-${shell.name}`"
            :cx="svgSize / 2"
            :cy="svgSize / 2"
            :r="shell.radius"
            class="orbit-ring"
          />

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

      <!-- Right: shell legend + notations -->
      <div class="electron-info">
        <!-- Shell rows -->
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
                :style="{ '--fill-pct': `${Math.min(100, (shell.electrons / shell.max) * 100)}%` }"
              />
            </div>
            <span class="shell-max">/ {{ shell.max }}</span>
          </div>
        </div>

        <!-- Orbital badges -->
        <div class="orbital-badges-wrap">
          <span class="notation-label">Sub-shell</span>
          <div class="orbital-badges">
            <span
              v-for="(tok, i) in orbitalTokens"
              :key="i"
              class="orbital-badge"
            >
              {{ tok.base }}<sup v-if="tok.sup">{{ tok.sup }}</sup>
            </span>
          </div>
        </div>

        <!-- Full configuration -->
        <div class="electron-notation">
          <span class="notation-label">Full notation</span>
          <code class="notation-value">{{ element.electronConfiguration }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

/* ── Main layout: diagram left, info right ── */
.electron-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.5rem;
  align-items: start;
}

.electron-svg-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.electron-svg {
  max-width: 220px;
  width: 100%;
  height: auto;
}

/* ── SVG elements ── */
.orbit-ring {
  fill: none;
  stroke: var(--bg-border);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.nucleus {
  fill: var(--bg-elevated);
  stroke: var(--accent-cyan);
  stroke-width: 1.5;
}

.nucleus-text {
  font-size: 9px;
  font-weight: 700;
  fill: var(--accent-cyan);
}

.electron {
  fill: var(--accent-cyan);
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: electronFadeIn 0.4s ease forwards;
}

.shell-delay-0 { animation-delay: 0.1s; }
.shell-delay-1 { animation-delay: 0.25s; }
.shell-delay-2 { animation-delay: 0.4s; }
.shell-delay-3 { animation-delay: 0.55s; }
.shell-delay-4 { animation-delay: 0.7s; }
.shell-delay-5 { animation-delay: 0.85s; }
.shell-delay-6 { animation-delay: 1s; }

@keyframes electronFadeIn {
  from { opacity: 0; transform: scale(0.2); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Right panel ── */
.electron-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

/* ── Shell legend ── */
.shell-legend {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.shell-row {
  display: grid;
  grid-template-columns: 1.25rem 1.75rem 1fr 2.25rem;
  align-items: center;
  gap: 0.4rem;
}

.shell-name {
  font-size: var(--text-2xs);
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-family: var(--font-mono);
}

.shell-count {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text-primary);
  text-align: right;
  font-family: var(--font-mono);
}

.shell-bar-track {
  height: 5px;
  background-color: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.shell-bar {
  height: 100%;
  width: 0;
  background: linear-gradient(to right, var(--accent-cyan), color-mix(in srgb, var(--accent-cyan) 60%, transparent));
  border-radius: 3px;
  animation: shellFill 0.5s ease forwards;
}

.shell-bar.shell-delay-0 { animation-delay: 0.1s; }
.shell-bar.shell-delay-1 { animation-delay: 0.25s; }
.shell-bar.shell-delay-2 { animation-delay: 0.4s; }
.shell-bar.shell-delay-3 { animation-delay: 0.55s; }
.shell-bar.shell-delay-4 { animation-delay: 0.7s; }
.shell-bar.shell-delay-5 { animation-delay: 0.85s; }
.shell-bar.shell-delay-6 { animation-delay: 1s; }

@keyframes shellFill {
  from { width: 0; }
  to   { width: var(--fill-pct, 0%); }
}

.shell-max {
  font-size: 0.6rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  white-space: nowrap;
}

/* ── Orbital badges ── */
.orbital-badges-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.orbital-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.orbital-badge {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-primary);
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 3px;
  padding: 0.15rem 0.35rem;
  line-height: 1.4;
}

.orbital-badge sup {
  font-size: 0.55rem;
  color: var(--accent-cyan);
  vertical-align: super;
}

/* ── Notation block ── */
.notation-label {
  font-size: var(--text-2xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  font-family: var(--font-mono);
}

.electron-notation {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notation-value {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 3px;
  padding: 0.3rem 0.5rem;
  word-break: break-all;
  line-height: 1.6;
}

/* ── Responsive ── */
@media (max-width: 500px) {
  .electron-layout {
    grid-template-columns: 1fr;
  }

  .electron-svg {
    max-width: 180px;
  }
}
</style>
