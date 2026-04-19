<script setup lang="ts">
import { computed } from "vue"
import { FlaskConical, Flame, Radiation, Shield, Skull } from "lucide-vue-next"
import type { Element, HazardLevel } from "@/types/element"
import { hazardDisplayLabel, hazardExplanation } from "@/utils/hazardPresentation"

const props = defineProps<{
  element: Element
}>()

const hazard = computed(() => props.element.hazardLevel)

function ghsIcon(level: HazardLevel) {
  switch (level) {
    case "safe":
      return Shield
    case "flammable":
      return Flame
    case "toxic":
      return Skull
    case "radioactive":
      return Radiation
    case "corrosive":
      return FlaskConical
  }
}

const badgeClass = (level: HazardLevel): string => {
  switch (level) {
    case "safe":
      return "badge--safe"
    case "flammable":
      return "badge--flammable"
    case "toxic":
      return "badge--toxic"
    case "radioactive":
      return "badge--radioactive"
    case "corrosive":
      return "badge--corrosive"
  }
}
</script>

<template>
  <div class="safety-section">
    <template v-if="hazard">
      <div class="safety-row" :class="badgeClass(hazard)">
        <component :is="ghsIcon(hazard)" class="ghs-icon" :size="22" aria-hidden="true" />
        <div class="safety-copy">
          <span class="badge">{{ hazardDisplayLabel(hazard) }}</span>
          <p class="explain">{{ hazardExplanation(hazard) }}</p>
        </div>
      </div>
    </template>
    <p v-else class="safety-unavailable">
      Hazard data unavailable for this element in our current dataset.
    </p>
  </div>
</template>

<style scoped>
.safety-section {
  padding: 0;
}

.safety-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 2px;
  border: 1px solid var(--bg-border);
}

.safety-row.badge--safe {
  border-color: color-mix(in srgb, #22c55e 35%, var(--bg-border));
  background: color-mix(in srgb, #22c55e 8%, var(--bg-elevated));
}

.safety-row.badge--flammable {
  border-color: color-mix(in srgb, #f59e0b 40%, var(--bg-border));
  background: color-mix(in srgb, #f59e0b 8%, var(--bg-elevated));
}

.safety-row.badge--toxic {
  border-color: color-mix(in srgb, #ef4444 40%, var(--bg-border));
  background: color-mix(in srgb, #ef4444 8%, var(--bg-elevated));
}

.safety-row.badge--radioactive {
  border-color: color-mix(in srgb, #a855f7 45%, var(--bg-border));
  background: color-mix(in srgb, #a855f7 10%, var(--bg-elevated));
}

.safety-row.badge--corrosive {
  border-color: color-mix(in srgb, #f97316 40%, var(--bg-border));
  background: color-mix(in srgb, #f97316 8%, var(--bg-elevated));
}

.ghs-icon {
  flex-shrink: 0;
  margin-top: 0.1rem;
  opacity: 0.9;
}

.safety-row.badge--safe .ghs-icon {
  color: #22c55e;
}

.safety-row.badge--flammable .ghs-icon {
  color: #f59e0b;
}

.safety-row.badge--toxic .ghs-icon {
  color: #ef4444;
}

.safety-row.badge--radioactive .ghs-icon {
  color: #a855f7;
}

.safety-row.badge--corrosive .ghs-icon {
  color: #f97316;
}

.safety-copy {
  min-width: 0;
}

.badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.explain {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.safety-unavailable {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
