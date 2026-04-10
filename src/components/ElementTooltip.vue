<script setup lang="ts">
import { computed } from "vue";
import { useTooltip } from "@/composables/useTooltip";
import { Z } from "@/constants/zIndex";

const { visible, state } = useTooltip();

// Position the tooltip centered above the tile.
// Uses fixed coordinates from the tile's bounding rect.
const tooltipStyle = computed(() => {
  if (!state.value) return {};
  const { rect } = state.value;
  // Center horizontally over tile, place 8px above it
  return {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top - 8}px`,
    transform: "translate(-50%, -100%)",
  };
});

const phaseIcon: Record<string, string> = {
  solid: "◼",
  liquid: "◉",
  gas: "◌",
  unknown: "?",
};
</script>

<template>
  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="visible && state"
        class="element-tooltip"
        :style="tooltipStyle"
        role="tooltip"
        aria-live="polite"
      >
        <div class="tooltip-name">{{ state.element.name }}</div>
        <div class="tooltip-row">
          <span class="tooltip-label">No.</span>
          <span class="tooltip-value">{{ state.element.atomicNumber }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Mass</span>
          <span class="tooltip-value">{{
            state.element.atomicMass.toFixed(3)
          }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Phase</span>
          <span class="tooltip-value">
            {{ phaseIcon[state.element.phase.toLowerCase()] ?? "?" }}
            {{ state.element.phase }}
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.element-tooltip {
  position: fixed;
  z-index: v-bind("Z.tooltip");
  pointer-events: none;
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 6px;
  padding: 8px 10px;
  min-width: 130px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.4);
}

.tooltip-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.6875rem;
  line-height: 1.6;
}

.tooltip-label {
  color: var(--text-muted);
}

.tooltip-value {
  color: var(--text-secondary);
  text-transform: capitalize;
}

/* Fade + slight upward slide */
.tooltip-enter-active {
  transition:
    opacity 150ms ease,
    transform 150ms cubic-bezier(0.25, 1, 0.5, 1);
}

.tooltip-leave-active {
  transition: opacity 100ms ease;
}

.tooltip-enter-from {
  opacity: 0;
  transform: translate(-50%, calc(-100% + 4px));
}

.tooltip-leave-to {
  opacity: 0;
}
</style>
