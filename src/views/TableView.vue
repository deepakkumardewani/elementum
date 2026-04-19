<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from "vue";
import { gsap } from "gsap";
import { storeToRefs } from "pinia";
import { useElementStore } from "@/stores/elementStore";
import PeriodicGrid from "@/components/PeriodicGrid.vue";
import FilterBar from "@/components/FilterBar.vue";
import ColorModeSelector from "@/components/table/ColorModeSelector.vue";
import ColorLegend from "@/components/table/ColorLegend.vue";
import DetailModal from "@/components/detail/DetailModal.vue";
import { useElementFilter } from "@/composables/useElementFilter"
import ElementHoverCard from "@/components/ElementHoverCard.vue";

const rootEl = ref<HTMLElement | null>(null);
let ctx: gsap.Context;
let entranceRan = false;

const elementStore = useElementStore();
const { elements } = storeToRefs(elementStore);

// Wire the GSAP dim/highlight tween for filter interactions
useElementFilter();

// Run entrance animation once, after elements are loaded into the DOM.
// onMounted fires before the async loadElements() resolves, so tiles don't
// exist yet — watching the elements array and waiting for the next tick is
// the reliable trigger point.
const stopWatch = watch(
  elements,
  async (els) => {
    if (entranceRan || els.length === 0) return;
    entranceRan = true;
    stopWatch();
    // Extra nextTick after flush:"post" ensures child component renders
    // (PeriodicGrid's computed tiles) are fully committed before GSAP queries.
    // clearProps:"opacity,y" lets CSS classes (.is-dimmed) take back control
    // after the animation — without it, inline opacity:1 blocks filter dimming.
    await nextTick();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
    // Sort by visual top→bottom, left→right so the stagger follows the eye's
    // natural reading path instead of DOM/atomic-number order. Without this,
    // f-block tiles (appended last in the DOM) don't animate until after ALL
    // main-table tiles finish, producing a visible lag before the bottom rows appear.
    const tiles = Array.from(
      rootEl.value!.querySelectorAll<HTMLElement>(".element-tile")
    ).sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return ra.top !== rb.top ? ra.top - rb.top : ra.left - rb.left;
    });
    // gsap.set runs synchronously here — we're still in the microtask queue
    // after nextTick, so the browser hasn't painted yet. This hides all tiles
    // before the first paint, preventing the flash of visible content that
    // gsap.from() causes (it sets initial props one rAF too late).
    gsap.set(tiles, { opacity: 0, y: 10 });
    ctx = gsap.context(() => {
      gsap.to(tiles, {
        opacity: 1,
        y: 0,
        stagger: 0.006,
        duration: 0.45,
        ease: "power2.out",
        clearProps: "opacity,y",
      });
    }, rootEl.value!);
  },
  { flush: "post" },
);

onUnmounted(() => {
  stopWatch();
  ctx?.revert();
});
</script>

<template>
  <main
    ref="rootEl"
    class="table-view"
    role="region"
    aria-label="Periodic table, scrollable"
  >
    <div class="table-view-inner">
      <div class="table-controls">
        <ColorModeSelector />
      </div>
      <FilterBar />
      <PeriodicGrid />
      <ColorLegend />
    </div>
    <!-- v-show preserves GSAP state; placed at view root to avoid CLS -->
    <DetailModal />
    <!-- Rich hover card — Teleports to body, shown on tile hover -->
    <ElementHoverCard />
  </main>
</template>

<style scoped>
.table-view {
  flex: 1;
  overflow-x: auto;
  padding: 16px 20px 32px;
  mask-image: linear-gradient(to right, black 96%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 96%, transparent 100%);
}

.table-view-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 820px;
}

.table-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
