<script setup lang="ts">
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import { ALL_CATEGORIES, CATEGORY_LABELS, categoryColor } from "@/utils/elementUtils"
import type { ElementBlock, ElementCategory } from "@/types/element"

const elementStore = useElementStore()
const { activeCategory, activePeriod, activeGroup, activeBlock, hasActiveFilter } =
  storeToRefs(elementStore)

const PERIODS = [1, 2, 3, 4, 5, 6, 7] as const
const GROUPS = Array.from({ length: 18 }, (_, i) => i + 1)
const BLOCKS: ElementBlock[] = ["s", "p", "d", "f"]

const hasAnyFilter = computed(() => hasActiveFilter.value)

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
</script>

<template>
  <div class="filter-bar" aria-label="Filter elements">
    <!-- Row 1: Category chips (full width) -->
    <div class="filter-row filter-row--category">
      <span class="filter-label">Category</span>
      <div class="chip-strip">
        <button
          v-for="cat in ALL_CATEGORIES"
          :key="cat"
          class="filter-chip filter-chip--category"
          :class="{ 'is-active': activeCategory === cat }"
          :style="{ '--chip-color': categoryColor(cat) }"
          :aria-pressed="activeCategory === cat"
          :aria-label="`Filter by ${CATEGORY_LABELS[cat]}`"
          @click="toggleCategory(cat)"
        >
          <span class="chip-dot" aria-hidden="true" />
          {{ CATEGORY_LABELS[cat] }}
        </button>
      </div>
      <button
        v-if="hasAnyFilter"
        class="clear-btn"
        aria-label="Clear all filters"
        @click="elementStore.clearAllFilters()"
      >
        Clear all
      </button>
    </div>

    <!-- Row 2: Period, Block, Group -->
    <div class="filter-row filter-row--secondary">
      <!-- Period -->
      <div class="filter-group filter-group--period">
        <span class="filter-label">Period</span>
        <div class="chip-strip chip-strip--fixed">
          <button
            v-for="p in PERIODS"
            :key="p"
            class="filter-chip filter-chip--compact"
            :class="{ 'is-active': activePeriod === p }"
            :aria-pressed="activePeriod === p"
            :aria-label="`Filter by period ${p}`"
            @click="togglePeriod(p)"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <div class="filter-divider" aria-hidden="true" />

      <!-- Block -->
      <div class="filter-group">
        <span class="filter-label">Block</span>
        <div class="chip-strip chip-strip--fixed">
          <button
            v-for="b in BLOCKS"
            :key="b"
            class="filter-chip filter-chip--compact"
            :class="{ 'is-active': activeBlock === b }"
            :aria-pressed="activeBlock === b"
            :aria-label="`Filter by ${b}-block`"
            @click="toggleBlock(b)"
          >
            {{ b }}
          </button>
        </div>
      </div>

      <div class="filter-divider" aria-hidden="true" />

      <!-- Group — scrollable since 18 items -->
      <div class="filter-group filter-group--grow">
        <span class="filter-label">Group</span>
        <div class="chip-strip chip-strip--scroll">
          <button
            v-for="g in GROUPS"
            :key="g"
            class="filter-chip filter-chip--compact"
            :class="{ 'is-active': activeGroup === g }"
            :aria-pressed="activeGroup === g"
            :aria-label="`Filter by group ${g}`"
            @click="toggleGroup(g)"
          >
            {{ g }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Container ─────────────────────────────────────────────────── */
.filter-bar {
  display: flex;
  flex-direction: column;
  /* 4px between rows — tight, intentional; rows are related content */
  gap: 4px;
  padding: 10px 12px;
  background-color: var(--bg-surface);
  border: 1px solid var(--bg-border);
  border-radius: 8px;
}

/* ── Rows ──────────────────────────────────────────────────────── */
.filter-row {
  display: flex;
  align-items: center;
  /* 10px label→chips gap: close enough to show they belong together */
  gap: 10px;
  min-width: 0;
}

/* Secondary row: each group manages its own internal spacing via padding */
.filter-row--secondary {
  gap: 0;
}

/* ── Label ─────────────────────────────────────────────────────── */
.filter-label {
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  /* Fixed width aligns all labels in secondary row; enough for "Period" */
  min-width: 44px;
}

/* ── Groups ────────────────────────────────────────────────────── */
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  /* Generous left-right padding creates clear separation between groups
     without relying solely on the divider line */
  padding: 0 14px;
  min-width: 0;
}

/* Period group is first — no left divider precedes it, so remove left
   padding to align its label flush with the category row's label */
.filter-group--period {
  padding-left: 0;
}

.filter-group--grow {
  flex: 1;
  min-width: 0;
}

/* ── Dividers between filter groups ────────────────────────────── */
.filter-divider {
  width: 1px;
  /* Taller divider spans the full row height rather than floating mid-row */
  height: 24px;
  background-color: var(--bg-border);
  flex-shrink: 0;
}

/* ── Chip strips ───────────────────────────────────────────────── */
.chip-strip {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

/* Fixed (no scroll) — for Period and Block */
.chip-strip--fixed {
  flex-wrap: nowrap;
}

/* Scrollable — for Group (18 items) */
.chip-strip--scroll {
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}

.chip-strip--scroll::-webkit-scrollbar {
  display: none;
}

/* ── Base chip ─────────────────────────────────────────────────── */
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  background-color: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 99px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  transition:
    border-color 150ms ease,
    color 150ms ease,
    background-color 150ms ease;
}

.filter-chip:hover {
  border-color: var(--chip-color, var(--accent-cyan));
  color: var(--text-primary);
}

.filter-chip:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.filter-chip.is-active {
  border-color: var(--chip-color, var(--accent-cyan));
  background-color: color-mix(in srgb, var(--chip-color, var(--accent-cyan)) 15%, var(--bg-surface));
  color: var(--text-primary);
}

/* Compact (square-ish) chips for Period / Group / Block */
.filter-chip--compact {
  padding: 3px 6px;
  min-width: 28px;
  justify-content: center;
  font-size: 0.68rem;
}

/* Category chips keep colored dot */
.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--chip-color, var(--accent-cyan));
  flex-shrink: 0;
}

/* ── Clear all ─────────────────────────────────────────────────── */
.clear-btn {
  margin-left: auto;
  padding: 3px 10px;
  background: none;
  border: 1px solid var(--bg-border);
  border-radius: 99px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  transition:
    border-color 150ms ease,
    color 150ms ease;
}

.clear-btn:hover {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.clear-btn:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}
</style>
