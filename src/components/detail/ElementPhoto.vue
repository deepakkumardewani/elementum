<script setup lang="ts">
import { ref } from "vue"
import { useEventListener } from "@vueuse/core"
import type { Element } from "@/types/element"
import { Z } from "@/constants/zIndex"

const props = defineProps<{ element: Element }>()

const loaded = ref(false)
const lightboxOpen = ref(false)

function onLoad() {
  loaded.value = true
}

function openLightbox() {
  if (!loaded.value) return
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

// Close lightbox on Escape — capture phase so we fire before DetailModal's bubble-phase listener,
// then stopImmediatePropagation prevents the panel from also closing.
useEventListener(document, "keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape" && lightboxOpen.value) {
    e.stopImmediatePropagation()
    closeLightbox()
  }
}, { capture: true })
</script>

<template>
  <div v-if="element.image" class="element-photo">

    <!-- Specimen frame -->
    <button
      class="photo-frame"
      :class="{ loaded }"
      :aria-label="`View full image: ${element.image.title}`"
      :disabled="!loaded"
      @click="openLightbox"
    >
      <!-- Skeleton pulse shown while image loads -->
      <div v-show="!loaded" class="photo-skeleton" aria-hidden="true" />

      <img
        :src="element.image.url"
        :alt="element.image.title"
        loading="lazy"
        class="photo-img"
        :class="{ visible: loaded }"
        @load="onLoad"
      />

      <!-- Zoom hint — appears on hover after load -->
      <div v-if="loaded" class="photo-zoom-hint" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        Click to expand
      </div>
    </button>

    <!-- Caption + attribution row -->
    <div class="photo-meta">
      <p class="photo-caption">{{ element.image.title }}</p>
      <p class="photo-attribution">
        <svg class="attr-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        {{ element.image.attribution }}
      </p>
    </div>
  </div>

  <!-- Lightbox portal -->
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="lightboxOpen"
        class="lightbox-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="`Full image: ${element.image?.title}`"
        @click="closeLightbox"
      >
        <div class="lightbox-content" @click.stop>
          <button class="lightbox-close" aria-label="Close image" @click="closeLightbox">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            :src="element.image?.url"
            :alt="element.image?.title"
            class="lightbox-img"
          />
          <p class="lightbox-caption">{{ element.image?.title }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Specimen frame ─────────────────────────────── */
.element-photo {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.photo-frame {
  /* Button reset */
  all: unset;
  display: block;
  width: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bg-border);
  background-color: var(--bg-elevated);
  /* Fixed aspect ratio so layout never shifts */
  aspect-ratio: 16 / 9;
  cursor: default;
  transition: border-color 200ms ease;
}

.photo-frame.loaded {
  cursor: zoom-in;
}

.photo-frame.loaded:hover {
  border-color: var(--accent-cyan);
}

.photo-frame.loaded:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

/* ── Skeleton ───────────────────────────────────── */
.photo-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 25%,
    color-mix(in srgb, var(--bg-elevated) 60%, var(--bg-border) 40%) 50%,
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .photo-skeleton {
    animation: none;
  }
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* ── Image ──────────────────────────────────────── */
.photo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 300ms ease;
}

.photo-img.visible {
  opacity: 1;
}

/* ── Zoom hint overlay ──────────────────────────── */
.photo-zoom-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
  opacity: 0;
  transition: opacity 180ms ease;
  pointer-events: none;
}

.photo-frame.loaded:hover .photo-zoom-hint {
  opacity: 1;
}

/* ── Caption + attribution ──────────────────────── */
.photo-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.photo-caption {
  font-size: 0.75rem;
  font-style: italic;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.photo-attribution {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  font-size: 0.6875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.attr-icon {
  flex-shrink: 0;
  margin-top: 0.15em;
  color: var(--text-muted);
}

/* ── Lightbox ───────────────────────────────────── */
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: v-bind("Z.lightbox");
  background: rgb(0 0 0 / 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lightbox-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: min(900px, 100%);
  max-height: 90vh;
}

.lightbox-close {
  position: absolute;
  top: -2.5rem;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.1);
  border: 1px solid rgb(255 255 255 / 0.2);
  color: #fff;
  cursor: pointer;
  transition: background 150ms ease;
}

.lightbox-close:hover {
  background: rgb(255 255 255 / 0.2);
}

.lightbox-close:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.lightbox-img {
  max-width: 100%;
  max-height: calc(90vh - 4rem);
  object-fit: contain;
  border-radius: 8px;
  display: block;
}

.lightbox-caption {
  font-size: 0.75rem;
  font-style: italic;
  color: rgb(255 255 255 / 0.6);
  text-align: center;
  margin: 0;
}

/* ── Lightbox transition ────────────────────────── */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 200ms ease;
}

.lightbox-enter-active .lightbox-content,
.lightbox-leave-active .lightbox-content {
  transition: transform 200ms ease, opacity 200ms ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-from .lightbox-content {
  transform: scale(0.94);
  opacity: 0;
}

.lightbox-leave-to .lightbox-content {
  transform: scale(0.94);
  opacity: 0;
}
</style>
