<script setup lang="ts">
/**
 * Rich hover card shown when the user dwells on an element tile.
 * Layout:
 *   Header  — identity (left) + small rotating SVG atom (right)
 *   Stats   — 3-col grid below
 *   Config  — electron notation at the bottom
 *
 * The atom uses an SVG where each shell <g> rotates independently via CSS,
 * showing all electrons at their correct positions.
 *
 * Positioning: right → left → above (clamped to viewport).
 */
import { computed } from "vue"
import { useTooltip } from "@/composables/useTooltip"
import { categoryColor } from "@/utils/elementUtils"
import { Z } from "@/constants/zIndex"

const CARD_W = 300
const CARD_H = 260
const GAP = 10

const SVG_NUCLEUS_R = 11
const SVG_SHELL_GAP = 14   // radial gap between shells
const SVG_ELECTRON_R = 3.5

const { visible, state } = useTooltip()

const catColor = computed(() =>
  state.value ? categoryColor(state.value.element.category) : "transparent",
)

interface ShellData {
  radius: number
  electrons: number
  /** Inner shells spin faster */
  duration: number
}

const bohrShells = computed((): ShellData[] => {
  if (!state.value) return []
  return state.value.element.electronShells.slice(0, 7).map((count, i) => ({
    radius: SVG_NUCLEUS_R + SVG_SHELL_GAP + i * SVG_SHELL_GAP,
    electrons: count,
    duration: 4 + i * 1.2,
  }))
})

// Dynamic viewBox sized to fit the outermost shell + electron radius + padding
const svgSize = computed(() => {
  const last = bohrShells.value[bohrShells.value.length - 1]
  if (!last) return 60
  return Math.ceil((last.radius + SVG_ELECTRON_R + 8) * 2)
})

const svgCenter = computed(() => svgSize.value / 2)

// Electrons placed around the orbit ring, centered on svgCenter
function electronPositions(radius: number, count: number): Array<{ x: number; y: number }> {
  if (count === 0) return []
  const cx = svgCenter.value
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cx + radius * Math.sin(angle),
    }
  })
}

const phaseIcon: Record<string, string> = {
  solid: "◼",
  liquid: "◉",
  gas: "◌",
  unknown: "?",
}

function fmt(val: number | null | undefined, decimals = 0): string {
  if (val == null) return "—"
  return decimals > 0 ? val.toFixed(decimals) : String(Math.round(val))
}

// Smart positioning: right → left → above
const cardStyle = computed(() => {
  if (!state.value) return {}
  const { rect } = state.value
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left: number
  let top: number
  let transform: string

  if (rect.right + GAP + CARD_W <= vw) {
    left = rect.right + GAP
    top = rect.top + rect.height / 2
    transform = "translateY(-50%)"
  } else if (rect.left - GAP - CARD_W >= 0) {
    left = rect.left - GAP - CARD_W
    top = rect.top + rect.height / 2
    transform = "translateY(-50%)"
  } else {
    left = rect.left + rect.width / 2
    top = rect.top - GAP
    transform = "translate(-50%, -100%)"
  }

  if (transform.includes("translateY")) {
    const halfH = CARD_H / 2
    if (top - halfH < 8) top = 8 + halfH
    if (top + halfH > vh - 8) top = vh - 8 - halfH
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform,
    "--cat": catColor.value,
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="hovercard">
      <div
        v-if="visible && state"
        class="hover-card"
        :style="cardStyle"
        role="tooltip"
        aria-live="polite"
      >
        <!-- ① Header: identity + rotating atom -->
        <div class="hc-header">
          <div class="hc-identity">
            <span class="hc-number">#{{ state.element.atomicNumber }}</span>
            <span class="hc-symbol">{{ state.element.symbol }}</span>
            <span class="hc-name">{{ state.element.name }}</span>
            <span class="hc-category">{{ state.element.category }}</span>
          </div>

          <!-- Rotating SVG Bohr atom — viewBox scales to content -->
          <svg
            class="hc-atom"
            :viewBox="`0 0 ${svgSize} ${svgSize}`"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <!-- Orbit rings (static) -->
            <circle
              v-for="(shell, i) in bohrShells"
              :key="`ring-${i}`"
              :cx="svgCenter"
              :cy="svgCenter"
              :r="shell.radius"
              class="orbit-ring"
            />

            <!-- Nucleus -->
            <circle :cx="svgCenter" :cy="svgCenter" :r="SVG_NUCLEUS_R" class="nucleus" />
            <text
              :x="svgCenter"
              :y="svgCenter + 1"
              text-anchor="middle"
              dominant-baseline="middle"
              class="nucleus-label"
            >{{ state.element.atomicNumber }}</text>

            <!-- Each shell group rotates around the dynamic center -->
            <g
              v-for="(shell, si) in bohrShells"
              :key="`shell-${si}`"
              class="shell-group"
              :style="{
                transformOrigin: `${svgCenter}px ${svgCenter}px`,
                animationDuration: `${shell.duration}s`,
              }"
            >
              <circle
                v-for="(pos, ei) in electronPositions(shell.radius, shell.electrons)"
                :key="`e-${si}-${ei}`"
                :cx="pos.x"
                :cy="pos.y"
                :r="SVG_ELECTRON_R"
                class="electron"
              />
            </g>
          </svg>
        </div>

        <div class="hc-divider" />

        <!-- ② Stats grid -->
        <div class="hc-stats">
          <div class="hc-stat">
            <span class="hc-stat-label">Mass</span>
            <span class="hc-stat-value">{{ state.element.atomicMass.toFixed(3) }}</span>
          </div>
          <div class="hc-stat">
            <span class="hc-stat-label">Phase</span>
            <span class="hc-stat-value">
              {{ phaseIcon[state.element.phase.toLowerCase()] ?? "?" }}
              {{ state.element.phase }}
            </span>
          </div>
          <div class="hc-stat">
            <span class="hc-stat-label">Electronegativity</span>
            <span class="hc-stat-value">{{ fmt(state.element.electronegativity, 2) }}</span>
          </div>
          <div class="hc-stat">
            <span class="hc-stat-label">Melting pt.</span>
            <span class="hc-stat-value">{{ fmt(state.element.meltingPoint) }} K</span>
          </div>
          <div class="hc-stat">
            <span class="hc-stat-label">Boiling pt.</span>
            <span class="hc-stat-value">{{ fmt(state.element.boilingPoint) }} K</span>
          </div>
          <div class="hc-stat">
            <span class="hc-stat-label">Shells</span>
            <span class="hc-stat-value">{{ state.element.electronShells.join(", ") }}</span>
          </div>
        </div>

        <!-- ③ Electron config -->
        <div class="hc-config">{{ state.element.electronConfigurationSemantic }}</div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ─── Card ───────────────────────────────────────────────── */
.hover-card {
  position: fixed;
  z-index: v-bind("Z.tooltip");
  pointer-events: none;
  width: 300px;
  background: color-mix(in srgb, var(--bg-elevated) 97%, transparent);
  border: 1px solid color-mix(in srgb, var(--cat) 40%, var(--bg-border));
  border-radius: 10px;
  padding: 12px 14px 10px;
  box-shadow:
    0 8px 32px color-mix(in srgb, var(--bg-base) 60%, transparent),
    0 0 0 1px color-mix(in srgb, var(--cat) 12%, transparent) inset;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ─── ① Header ──────────────────────────────────────────── */
.hc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 96px;
}

.hc-identity {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.hc-number {
  font-size: 0.5625rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
}

.hc-symbol {
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1;
  color: var(--cat);
  letter-spacing: -0.02em;
}

.hc-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 2px;
}

.hc-category {
  display: inline-block;
  margin-top: 5px;
  font-size: 0.5625rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--cat);
  background: color-mix(in srgb, var(--cat) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--cat) 28%, transparent);
  border-radius: 4px;
  padding: 1px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

/* ─── Rotating SVG atom ──────────────────────────────────── */
.hc-atom {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
}

.orbit-ring {
  fill: none;
  stroke: var(--bg-border);
  stroke-width: 0.8;
  stroke-dasharray: 3 3;
}

.nucleus {
  fill: var(--bg-elevated);
  stroke: var(--cat);
  stroke-width: 1.5;
}

.nucleus-label {
  font-size: 8px;
  font-weight: 700;
  fill: var(--cat);
}

/* Each shell <g> rotates around the SVG center (100, 100) */
.shell-group {
  transform-origin: 100px 100px;
  animation: shellSpin linear infinite;
}

.electron {
  fill: #4ade80;
  filter: drop-shadow(0 0 2px #4ade80);
}

@keyframes shellSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ─── Divider ────────────────────────────────────────────── */
.hc-divider {
  height: 1px;
  background: var(--bg-border);
  margin: 10px 0 8px;
}

/* ─── ② Stats ────────────────────────────────────────────── */
.hc-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px 4px;
}

.hc-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.hc-stat-label {
  font-size: 0.5625rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hc-stat-value {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── ③ Config ───────────────────────────────────────────── */
.hc-config {
  margin-top: 8px;
  font-size: 0.625rem;
  color: var(--text-muted);
  font-family: monospace;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Transition ─────────────────────────────────────────── */
.hovercard-enter-active {
  transition:
    opacity 140ms ease,
    transform 140ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hovercard-leave-active {
  transition: opacity 90ms ease;
}

.hovercard-enter-from {
  opacity: 0;
  transform: v-bind("cardStyle.transform + ' scale(0.96)'");
}

.hovercard-leave-to {
  opacity: 0;
}
</style>
