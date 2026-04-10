<script setup lang="ts">
import { computed } from "vue"
import { Thermometer, Wind, Droplets, HelpCircle } from "lucide-vue-next"
import { categoryColor } from "@/utils/elementUtils"
import GlowBadge from "@/components/detail/GlowBadge.vue"
import type { Element, ElementPhase } from "@/types/element"

const props = defineProps<{ element: Element }>()

const color = computed(() => categoryColor(props.element.category))

const phaseIcon = computed(() => {
  const map: Record<ElementPhase, typeof Thermometer> = {
    Solid: Thermometer,
    Liquid: Droplets,
    Gas: Wind,
    Unknown: HelpCircle,
  }
  return map[props.element.phase] ?? HelpCircle
})

const phaseLabel = computed(() => props.element.phase)

const atomicMassDisplay = computed(() =>
  props.element.atomicMass != null
    ? props.element.atomicMass.toFixed(4)
    : "—",
)
</script>

<template>
  <div
    class="element-header"
    :style="{ '--cat-color': color }"
  >
    <!-- Left accent stripe -->
    <div class="element-header-stripe" aria-hidden="true" />

    <div class="element-header-body">
      <!-- Top row: atomic number + phase -->
      <div class="element-header-meta">
        <span class="meta-atomic-number">
          {{ element.atomicNumber }}
        </span>
        <span class="meta-phase">
          <component :is="phaseIcon" :size="13" aria-hidden="true" />
          {{ phaseLabel }}
        </span>
      </div>

      <!-- Symbol (hero) -->
      <div class="element-header-symbol" :id="`element-heading-${element.atomicNumber}`">
        {{ element.symbol }}
      </div>

      <!-- Name -->
      <div class="element-header-name">{{ element.name }}</div>

      <!-- Badges row -->
      <div class="element-header-badges">
        <GlowBadge :category="element.category" />
        <span class="badge-block">Block {{ element.block.toUpperCase() }}</span>
      </div>

      <!-- Atomic mass -->
      <div class="element-header-mass">
        Atomic mass: <strong>{{ atomicMassDisplay }} u</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.element-header {
  position: relative;
  display: flex;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--cat-color) 8%, var(--bg-surface)) 0%,
    var(--bg-surface) 60%
  );
  padding: 2rem 1.5rem 1.5rem 2rem;
  border-bottom: 1px solid var(--bg-border);
  overflow: hidden;
}

.element-header-stripe {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--cat-color);
  box-shadow: 0 0 16px 2px color-mix(in srgb, var(--cat-color) 50%, transparent);
}

.element-header-body {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding-left: 0.5rem;
}

.element-header-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.meta-atomic-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.meta-phase {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.element-header-symbol {
  font-size: clamp(3.5rem, 8vw, 5.5rem);
  font-weight: 700;
  line-height: 1;
  color: var(--cat-color);
  letter-spacing: -0.02em;
  /* Subtle glow on the symbol */
  text-shadow: 0 0 24px color-mix(in srgb, var(--cat-color) 40%, transparent);
}

.element-header-name {
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 0.01em;
}

.element-header-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.badge-block {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
}

.element-header-mass {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.element-header-mass strong {
  color: var(--text-secondary);
  font-weight: 600;
}
</style>
