<script setup lang="ts">
import { computed } from "vue"
import { categoryColor } from "@/utils/elementUtils"
import { CATEGORY_LABELS } from "@/utils/elementUtils"
import type { Element } from "@/types/element"

const props = defineProps<{ element: Element }>()

const color = computed(() => categoryColor(props.element.category))

const atomicMassDisplay = computed(() =>
  props.element.atomicMass != null
    ? props.element.atomicMass.toFixed(4)
    : "—",
)
</script>

<template>
  <div
    class="specimen-col"
    :style="{ '--cat-color': color, '--symbol': `'${element.symbol}'` }"
    aria-hidden="true"
  >
    <!-- Vertical atomic number running down the left edge -->
    <span class="atomic-number-vert">{{ element.atomicNumber }}</span>

    <!-- Main identity block -->
    <div class="specimen-body">
      <!-- Symbol — architectural, fills most of the column -->
      <div
        class="specimen-symbol"
        :id="`element-heading-${element.atomicNumber}`"
        aria-label="`${element.name}, symbol ${element.symbol}`"
      >
        {{ element.symbol }}
      </div>

      <div class="specimen-meta">
        <span class="specimen-name">{{ element.name }}</span>
        <span class="specimen-category">{{ CATEGORY_LABELS[element.category] }}</span>
        <span class="specimen-mass">{{ atomicMassDisplay }} u</span>
      </div>
    </div>

    <!-- Block badge at bottom -->
    <div class="specimen-block">
      <span class="block-label">{{ element.block.toUpperCase() }}-block</span>
      <span class="block-phase">{{ element.phase }}</span>
    </div>

    <!-- Category color accent bar at right edge (separator) -->
    <div class="cat-accent" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* ── Specimen column ────────────────────────────────────────────── */
.specimen-col {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: color-mix(in srgb, var(--cat-color) 7%, var(--bg-surface));
  border-left: 3px solid var(--cat-color);
  padding: 1.25rem 1rem 1.25rem 1.25rem;
  min-height: 0;
  overflow: hidden;
  /* A subtle watermark: the symbol ghosted behind everything */
}

/* Ghosted watermark symbol behind content */
.specimen-col::before {
  content: var(--symbol);
  position: absolute;
  bottom: -0.5rem;
  right: -0.75rem;
  font-size: 9rem;
  font-weight: 900;
  color: var(--cat-color);
  opacity: 0.04;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

/* Vertical atomic number — monospace, running down left */
.atomic-number-vert {
  position: absolute;
  top: 1.25rem;
  right: 1rem;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  opacity: 0.6;
  user-select: none;
}

/* Main body: symbol + meta */
.specimen-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  justify-content: center;
}

/* Architectural symbol — the hero */
.specimen-symbol {
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 900;
  line-height: 1;
  color: var(--cat-color);
  letter-spacing: -0.03em;
  /* No glow — the color does enough work */
}

/* Meta: name + category */
.specimen-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.specimen-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.specimen-category {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--cat-color);
  opacity: 0.8;
  line-height: 1.3;
}

.specimen-mass {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

/* Bottom: block + phase */
.specimen-block {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-top: 0.75rem;
  border-top: 1px solid color-mix(in srgb, var(--cat-color) 20%, var(--bg-border));
}

.block-label {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.block-phase {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Right-edge accent: thin line to reinforce the column separator */
.cat-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    color-mix(in srgb, var(--cat-color) 30%, transparent) 30%,
    color-mix(in srgb, var(--cat-color) 30%, transparent) 70%,
    transparent
  );
  pointer-events: none;
}
</style>
