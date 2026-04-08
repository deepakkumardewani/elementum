<script setup lang="ts">
import { computed } from "vue"
import { categoryColor, CATEGORY_LABELS } from "@/utils/elementUtils"
import type { ElementCategory } from "@/types/element"

const props = defineProps<{ category: ElementCategory }>()

const color = computed(() => categoryColor(props.category))
const label = computed(() => CATEGORY_LABELS[props.category])
</script>

<template>
  <span
    class="glow-badge"
    :style="{ '--badge-color': color }"
  >
    {{ label }}
  </span>
</template>

<style scoped>
.glow-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--badge-color);
  background-color: color-mix(in srgb, var(--badge-color) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--badge-color) 35%, transparent);
  white-space: nowrap;
}
</style>
