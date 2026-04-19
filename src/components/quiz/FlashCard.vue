<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue"
import { gsap } from "gsap"
import type { Element } from "@/types/element"
import { categoryColor, CATEGORY_LABELS } from "@/utils/elementUtils"

const props = defineProps<{
  element: Element
}>()

const emit = defineEmits<{
  correct: []
  incorrect: []
  skip: []
}>()

const innerRef = ref<HTMLElement | null>(null)
const flipped = ref(false)

function getMotionDuration(normalMs: number): number {
  if (typeof window === "undefined") return normalMs
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : normalMs
}

function setRotationY(deg: number) {
  const el = innerRef.value
  if (!el) return
  gsap.set(el, { rotationY: deg })
}

function toggleFlip() {
  const el = innerRef.value
  if (!el) return
  flipped.value = !flipped.value
  const dur = getMotionDuration(0.3)
  gsap.to(el, {
    rotationY: flipped.value ? 180 : 0,
    duration: dur,
    ease: "power2.out",
  })
}

watch(
  () => props.element.atomicNumber,
  () => {
    flipped.value = false
    setRotationY(0)
  },
)

onUnmounted(() => {
  const el = innerRef.value
  if (el) gsap.killTweensOf(el)
})

function funFactLine(el: Element): string {
  const fact = el.funFacts[0]
  if (fact) return fact
  if (el.summary.length <= 140) return el.summary
  return `${el.summary.slice(0, 137)}…`
}
</script>

<template>
  <div class="flash-stack">
    <div
      class="flash-scene"
      role="button"
      tabindex="0"
      :aria-label="flipped ? 'Show symbol side' : 'Show answer side'"
      @click="toggleFlip"
      @keydown.enter.prevent="toggleFlip"
      @keydown.space.prevent="toggleFlip"
    >
      <div ref="innerRef" class="flash-inner">
        <div
          class="flash-face flash-front"
          :style="{ '--category-color': categoryColor(element.category) }"
        >
          <span class="flash-z">{{ element.atomicNumber }}</span>
          <span class="flash-sym">{{ element.symbol }}</span>
          <img
            v-if="element.image?.url"
            class="flash-photo"
            :src="element.image.url"
            :alt="element.image.title || `${element.name} sample`"
          />
          <span class="flash-hint">Click to flip</span>
        </div>
        <div class="flash-face flash-back">
          <span class="flash-name">{{ element.name }}</span>
          <span class="flash-cat">{{ CATEGORY_LABELS[element.category] }}</span>
          <p class="flash-fact">{{ funFactLine(element) }}</p>
        </div>
      </div>
    </div>
    <div v-if="flipped" class="flash-actions">
      <button type="button" class="good-btn" @click.stop="emit('correct')">Correct</button>
      <button type="button" class="bad-btn" @click.stop="emit('incorrect')">Incorrect</button>
      <button type="button" class="ghost-btn" @click.stop="emit('skip')">Skip</button>
    </div>
  </div>
</template>

<style scoped>
.flash-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.flash-scene {
  position: relative;
  width: min(100%, 320px);
  aspect-ratio: 1;
  perspective: 900px;
  cursor: pointer;
  border: none;
  padding: 0;
  background: transparent;
}

.flash-scene:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 4px;
  border-radius: 4px;
}

.flash-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.flash-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1.25rem;
  border-radius: 4px;
  border: 1px solid var(--bg-border);
  backface-visibility: hidden;
}

.flash-front {
  background: color-mix(in srgb, var(--category-color) 18%, var(--bg-surface));
  transform: rotateY(0deg);
}

.flash-back {
  background: var(--bg-elevated);
  transform: rotateY(180deg);
}

.flash-photo {
  width: 100%;
  max-height: 120px;
  object-fit: contain;
  border-radius: 2px;
  margin-top: 0.25rem;
}

.flash-z {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.flash-sym {
  font-family: var(--font-mono);
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.flash-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.flash-name {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.flash-cat {
  font-size: var(--text-xs);
  color: var(--accent-cyan);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.flash-fact {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
  margin: 0.5rem 0 0;
}

.flash-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.good-btn,
.bad-btn {
  font-size: var(--text-sm);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid transparent;
}

.good-btn {
  background: color-mix(in srgb, var(--color-positive) 22%, var(--bg-surface));
  border-color: var(--color-positive);
  color: var(--text-primary);
}

.bad-btn {
  background: color-mix(in srgb, var(--color-negative) 18%, var(--bg-surface));
  border-color: var(--color-negative);
  color: var(--text-primary);
}

.ghost-btn {
  border: 1px solid var(--bg-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  padding: 0.5rem 1rem;
  border-radius: 2px;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    color 150ms ease;
}

.ghost-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}
</style>
