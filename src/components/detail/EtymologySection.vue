<script setup lang="ts">
import { computed } from "vue"
import type { Element } from "@/types/element"

const props = defineProps<{
  element: Element
}>()

const yearLine = computed(() => {
  const y = props.element.yearDiscovered
  if (y === null || y === undefined || y === "") return null
  if (typeof y === "number" && y < 500) return "Ancient / Unknown"
  return String(y)
})

const discovererLine = computed(() => {
  const d = props.element.discoverer?.trim()
  if (d) return d
  const y = props.element.yearDiscovered
  if (typeof y === "number" && y < 500) return "Ancient / Unknown"
  return null
})

const showCard = computed(
  () =>
    discovererLine.value != null ||
    yearLine.value != null ||
    props.element.discoveryCountry?.trim() ||
    props.element.discoveryMethod?.trim(),
)
</script>

<template>
  <div class="etymology-section">
    <section v-if="element.etymology?.trim()" class="ety-block">
      <h4 class="ety-heading">Name origin</h4>
      <p class="ety-prose">{{ element.etymology.trim() }}</p>
    </section>

    <section v-if="element.discoveryStory?.trim()" class="ety-block">
      <h4 class="ety-heading">Discovery</h4>
      <p class="ety-prose">{{ element.discoveryStory.trim() }}</p>
    </section>

    <section v-if="showCard" class="discoverer-card" aria-label="Discovery facts">
      <h4 class="ety-heading">Discoverer &amp; context</h4>
      <dl class="discoverer-dl">
        <template v-if="discovererLine">
          <dt>Credit</dt>
          <dd>{{ discovererLine }}</dd>
        </template>
        <template v-if="yearLine">
          <dt>Year</dt>
          <dd>{{ yearLine }}</dd>
        </template>
        <template v-if="element.discoveryCountry?.trim()">
          <dt>Country / region</dt>
          <dd>{{ element.discoveryCountry.trim() }}</dd>
        </template>
        <template v-if="element.discoveryMethod?.trim()">
          <dt>Method</dt>
          <dd>{{ element.discoveryMethod.trim() }}</dd>
        </template>
      </dl>
      <img
        v-if="element.discovererPortrait?.trim()"
        :src="element.discovererPortrait"
        alt=""
        class="discoverer-portrait"
        loading="lazy"
      />
    </section>

    <p
      v-if="
        !element.etymology?.trim() &&
          !element.discoveryStory?.trim() &&
          !showCard
      "
      class="ety-fallback"
    >
      No etymology or discovery notes are available for this element yet.
    </p>
  </div>
</template>

<style scoped>
.etymology-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ety-heading {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}

.ety-prose {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.55;
}

.ety-block {
  margin: 0;
}

.discoverer-card {
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  padding: 1rem;
  background: var(--bg-elevated);
}

.discoverer-dl {
  margin: 0;
  display: grid;
  grid-template-columns: minmax(6rem, auto) 1fr;
  gap: 0.35rem 1rem;
  font-size: var(--text-sm);
}

.discoverer-dl dt {
  margin: 0;
  color: var(--text-muted);
  font-weight: 600;
}

.discoverer-dl dd {
  margin: 0;
  color: var(--text-primary);
}

.discoverer-portrait {
  margin-top: 0.75rem;
  max-width: 120px;
  max-height: 140px;
  border-radius: 2px;
  border: 1px solid var(--bg-border);
  object-fit: cover;
}

.ety-fallback {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
