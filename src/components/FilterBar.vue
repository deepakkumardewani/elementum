<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { storeToRefs } from "pinia"
import { gsap } from "gsap"
import { ChevronDown } from "lucide-vue-next"
import { useElementStore } from "@/stores/elementStore"
import { ALL_CATEGORIES, CATEGORY_LABELS, categoryColor } from "@/utils/elementUtils"
import type { ElementBlock, ElementCategory } from "@/types/element"

const elementStore = useElementStore()
const {
  activeCategory,
  activePeriod,
  activeGroup,
  activeBlock,
  hasActiveFilter,
  highlightedElements,
} = storeToRefs(elementStore)

const PERIODS = [1, 2, 3, 4, 5, 6, 7] as const
const GROUPS = Array.from({ length: 18 }, (_, i) => i + 1)
const BLOCKS: ElementBlock[] = ["s", "p", "d", "f"]

// Mini tile metadata: abbreviation (2-letter element-symbol style) + short label
const CATEGORY_TILE: Record<ElementCategory, { abbr: string; short: string }> = {
  "alkali metal":           { abbr: "Ak", short: "Alkali" },
  "alkaline earth metal":   { abbr: "Ae", short: "Alk.E." },
  "transition metal":       { abbr: "Tm", short: "Trans." },
  "post-transition metal":  { abbr: "Pt", short: "Post-T" },
  metalloid:                { abbr: "Me", short: "Metall" },
  nonmetal:                 { abbr: "Nm", short: "Nonmet" },
  halogen:                  { abbr: "Hl", short: "Halogen" },
  "noble gas":              { abbr: "Ng", short: "Noble" },
  lanthanide:               { abbr: "La", short: "Lanthn" },
  actinide:                 { abbr: "Ac", short: "Actind" },
  unknown:                  { abbr: "?",  short: "Unknwn" },
}

const hasAnyFilter = computed(() => hasActiveFilter.value)
const secondaryOpen = ref(false)

function toggleCategory(cat: ElementCategory) {
  elementStore.setActiveCategory(activeCategory.value === cat ? null : cat)
}

function togglePeriod(period: number) {
  elementStore.setActivePeriod(activePeriod.value === period ? null : period)
}

function toggleGroup(group: number) {
  elementStore.setActiveGroup(activeGroup.value === group ? null : group)
}

function toggleBlock(block: ElementBlock) {
  elementStore.setActiveBlock(activeBlock.value === block ? null : block)
}

function toggleSecondary() {
  secondaryOpen.value = !secondaryOpen.value
}

const hasSecondaryFilter = computed(
  () => activePeriod.value !== null || activeGroup.value !== null || activeBlock.value !== null
)

const tilesRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  if (tilesRef.value) {
    const tiles = tilesRef.value.querySelectorAll(".cat-tile")
    gsap.fromTo(
      tiles,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.025, ease: "power2.out" }
    )
  }
})
</script>

<template>
  <div class="filter-bar" aria-label="Filter elements">
    <!-- Category micro-tiles row -->
    <div class="filter-row">
      <span class="filter-label">Category</span>
      <div class="cat-strip" ref="tilesRef" role="group" aria-label="Filter by category">
        <button
          v-for="cat in ALL_CATEGORIES"
          :key="cat"
          class="cat-tile"
          :class="{ 'is-active': activeCategory === cat }"
          :style="{ '--cat-color': categoryColor(cat) }"
          :aria-pressed="activeCategory === cat"
          :aria-label="`Filter by ${CATEGORY_LABELS[cat]}`"
          @click="toggleCategory(cat)"
        >
          <span class="cat-tile-short">{{ CATEGORY_TILE[cat].short }}</span>
          <span class="cat-tile-abbr">{{ CATEGORY_TILE[cat].abbr }}</span>
        </button>
      </div>

      <!-- Secondary toggle + clear -->
      <div class="filter-row-actions">
        <button
          class="secondary-toggle"
          :class="{ 'is-open': secondaryOpen, 'has-active': hasSecondaryFilter }"
          :aria-expanded="secondaryOpen"
          aria-controls="secondary-filters"
          @click="toggleSecondary"
        >
          <span>Period · Block · Group</span>
          <ChevronDown :size="13" class="toggle-icon" />
        </button>
        <button
          v-if="hasAnyFilter"
          class="clear-btn"
          aria-label="Clear all filters"
          @click="elementStore.clearAllFilters()"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Collapsible secondary filters -->
    <Transition name="secondary">
      <div
        v-if="secondaryOpen"
        id="secondary-filters"
        class="filter-row filter-row--secondary"
      >
        <!-- Period -->
        <div class="filter-group">
          <span class="filter-label">Period</span>
          <div class="compact-strip">
            <button
              v-for="p in PERIODS"
              :key="p"
              class="compact-chip"
              :class="{ 'is-active': activePeriod === p }"
              :aria-pressed="activePeriod === p"
              :aria-label="`Period ${p}`"
              @click="togglePeriod(p)"
            >{{ p }}</button>
          </div>
        </div>

        <div class="filter-divider" aria-hidden="true" />

        <!-- Block -->
        <div class="filter-group">
          <span class="filter-label">Block</span>
          <div class="compact-strip">
            <button
              v-for="b in BLOCKS"
              :key="b"
              class="compact-chip"
              :class="{ 'is-active': activeBlock === b }"
              :aria-pressed="activeBlock === b"
              :aria-label="`${b}-block`"
              @click="toggleBlock(b)"
            >{{ b }}</button>
          </div>
        </div>

        <div class="filter-divider" aria-hidden="true" />

        <!-- Group — scrollable -->
        <div class="filter-group filter-group--grow">
          <span class="filter-label">Group</span>
          <div class="compact-strip compact-strip--scroll">
            <button
              v-for="g in GROUPS"
              :key="g"
              class="compact-chip"
              :class="{ 'is-active': activeGroup === g }"
              :aria-pressed="activeGroup === g"
              :aria-label="`Group ${g}`"
              @click="toggleGroup(g)"
            >{{ g }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- No-results feedback -->
    <div
      v-if="hasAnyFilter && highlightedElements.size === 0"
      class="results-feedback"
    >
      <span class="feedback-text">No elements match these filters.</span>
      <button class="feedback-clear" @click="elementStore.clearAllFilters()">
        Clear all
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── Container ──────────────────────────────────────────────────── */
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background-color: var(--bg-surface);
  border: 1px solid var(--bg-border);
  border-radius: 4px;
}

/* ── Rows ───────────────────────────────────────────────────────── */
.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.filter-row--secondary {
  gap: 14px;
  padding-top: 4px;
  border-top: 1px solid var(--bg-border);
}

/* ── Label ──────────────────────────────────────────────────────── */
.filter-label {
  font-size: var(--text-2xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 44px;
  font-family: var(--font-mono);
}

/* ── Category micro-tiles strip ─────────────────────────────────── */
.cat-strip {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

/* Mini element tile: left border + symbol + short label */
.cat-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  width: 56px;
  height: 44px;
  padding: 4px 5px 4px 7px;
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-left: 3px solid var(--cat-color);
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.cat-tile:hover {
  background-color: color-mix(in srgb, var(--cat-color) 8%, var(--bg-elevated));
  border-color: color-mix(in srgb, var(--cat-color) 40%, var(--bg-border));
}

.cat-tile.is-active {
  background-color: color-mix(in srgb, var(--cat-color) 12%, var(--bg-surface));
  border-color: color-mix(in srgb, var(--cat-color) 60%, var(--bg-border));
  box-shadow: 0 0 8px 1px color-mix(in srgb, var(--cat-color) 25%, transparent);
}

.cat-tile:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

/* Short label — sits at top like atomic number */
.cat-tile-short {
  font-size: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  max-width: 100%;
}

.cat-tile.is-active .cat-tile-short {
  color: var(--cat-color);
  opacity: 0.8;
}

/* Abbreviation — centered, element-symbol style */
.cat-tile-abbr {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-secondary);
  line-height: 1;
  align-self: center;
  margin-top: auto;
}

.cat-tile.is-active .cat-tile-abbr {
  color: var(--cat-color);
}

/* ── Secondary filters row actions ──────────────────────────────── */
.filter-row-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
}

.secondary-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: none;
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  transition: border-color 150ms ease, color 150ms ease;
}

.secondary-toggle:hover,
.secondary-toggle.is-open,
.secondary-toggle.has-active {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.toggle-icon {
  transition: transform 200ms ease;
}

.secondary-toggle.is-open .toggle-icon {
  transform: rotate(180deg);
}

/* ── Clear button ───────────────────────────────────────────────── */
.clear-btn {
  padding: 3px 8px;
  background: none;
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  transition: border-color 150ms ease, color 150ms ease;
}

.clear-btn:hover {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.clear-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

/* ── Secondary filters (Period / Block / Group) ──────────────────── */
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.filter-group--grow {
  flex: 1;
  min-width: 0;
}

.filter-divider {
  width: 1px;
  height: 20px;
  background-color: var(--bg-border);
  flex-shrink: 0;
}

.compact-strip {
  display: flex;
  gap: 3px;
  flex-wrap: nowrap;
}

.compact-strip--scroll {
  overflow-x: auto;
  scrollbar-width: none;
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
}

.compact-strip--scroll::-webkit-scrollbar {
  display: none;
}

.compact-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 4px;
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 2px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  transition:
    border-color 150ms ease,
    color 150ms ease,
    background-color 150ms ease;
}

.compact-chip:hover {
  border-color: var(--accent-cyan);
  color: var(--text-primary);
}

.compact-chip.is-active {
  border-color: var(--accent-cyan);
  background-color: color-mix(in srgb, var(--accent-cyan) 12%, var(--bg-surface));
  color: var(--accent-cyan);
}

.compact-chip:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

/* ── Transition for secondary panel ─────────────────────────────── */
.secondary-enter-active,
.secondary-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
  overflow: hidden;
}

.secondary-enter-from,
.secondary-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Results feedback ───────────────────────────────────────────── */
.results-feedback {
  padding: 8px 14px;
  border-top: 1px solid var(--bg-border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.feedback-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.feedback-clear {
  background: none;
  border: none;
  padding: 0;
  color: var(--accent-cyan);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 150ms ease;
}

.feedback-clear:hover {
  color: var(--text-primary);
}
</style>
