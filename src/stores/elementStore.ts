import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  elementMatchesAdvancedTokens,
  parseAdvancedSearchTokens,
} from "@/composables/useElementSearch";
import type { Element, ElementBlock, ElementCategory } from "@/types/element";

export const useElementStore = defineStore("element", () => {
  // ── State ──────────────────────────────────────────────────────
  const elements = ref<Element[]>([]);
  const selectedElement = ref<Element | null>(null);
  const detailPanelOpen = ref(false);
  const searchQuery = ref("");
  const highlightedElements = ref<Set<number>>(new Set());
  /** When non-empty, periodic table dims all tiles except these (tools / molar mass). */
  const toolHighlightElements = ref<Set<number>>(new Set());

  const compareElements = ref<[Element | null, Element | null]>([null, null]);

  const activeCategory = ref<ElementCategory | null>(null);
  const activePeriod = ref<number | null>(null);
  const activeGroup = ref<number | null>(null);
  const activeBlock = ref<ElementBlock | null>(null);

  // ── Derived helpers ────────────────────────────────────────────
  const hasActiveFilter = computed(
    () =>
      toolHighlightElements.value.size > 0 ||
      searchQuery.value.trim() !== "" ||
      activeCategory.value !== null ||
      activePeriod.value !== null ||
      activeGroup.value !== null ||
      activeBlock.value !== null,
  );

  const displayHighlightSet = computed(() =>
    toolHighlightElements.value.size > 0
      ? toolHighlightElements.value
      : highlightedElements.value,
  );

  // ── Getters ────────────────────────────────────────────────────
  const filteredElements = computed(() => {
    if (!hasActiveFilter.value) return elements.value;
    return elements.value.filter((el) =>
      highlightedElements.value.has(el.atomicNumber),
    );
  });

  function isHighlighted(atomicNumber: number): boolean {
    if (!hasActiveFilter.value) return true;
    return displayHighlightSet.value.has(atomicNumber);
  }

  function isDimmed(atomicNumber: number): boolean {
    if (!hasActiveFilter.value) return false;
    return !displayHighlightSet.value.has(atomicNumber);
  }

  // ── Internal: recompute highlighted set from all active filters ─
  function recomputeHighlighted() {
    const rawQuery = searchQuery.value.trim();
    const { tokens: searchTokens, plainText } =
      parseAdvancedSearchTokens(rawQuery);

    const matched = elements.value.filter((el) => {
      const matchesPlain =
        plainText === "" ||
        el.name.toLowerCase().includes(plainText) ||
        el.symbol.toLowerCase().includes(plainText) ||
        String(el.atomicNumber).includes(plainText);

      const matchesStructured =
        searchTokens.length === 0 ||
        elementMatchesAdvancedTokens(el, searchTokens);

      const matchesCategory =
        activeCategory.value === null || el.category === activeCategory.value;

      const matchesPeriod =
        activePeriod.value === null || el.period === activePeriod.value;

      const matchesGroup =
        activeGroup.value === null || el.group === activeGroup.value;

      const matchesBlock =
        activeBlock.value === null || el.block === activeBlock.value;

      return (
        matchesPlain &&
        matchesStructured &&
        matchesCategory &&
        matchesPeriod &&
        matchesGroup &&
        matchesBlock
      );
    });

    highlightedElements.value = new Set(matched.map((el) => el.atomicNumber));
  }

  // ── Actions ────────────────────────────────────────────────────
  async function loadElements() {
    const data = await import("@/data/elements.json");
    elements.value = data.default as Element[];
  }

  function selectElement(element: Element) {
    selectedElement.value = element;
    detailPanelOpen.value = true;
  }

  function closeDetailPanel() {
    detailPanelOpen.value = false;
    selectedElement.value = null;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
    recomputeHighlighted();
  }

  function setActiveCategory(cat: ElementCategory | null) {
    activeCategory.value = cat;
    recomputeHighlighted();
  }

  function setActivePeriod(period: number | null) {
    activePeriod.value = period;
    recomputeHighlighted();
  }

  function setActiveGroup(group: number | null) {
    activeGroup.value = group;
    recomputeHighlighted();
  }

  function setActiveBlock(block: ElementBlock | null) {
    activeBlock.value = block;
    recomputeHighlighted();
  }

  function clearAllFilters() {
    searchQuery.value = "";
    activeCategory.value = null;
    activePeriod.value = null;
    activeGroup.value = null;
    activeBlock.value = null;
    highlightedElements.value = new Set();
  }

  function setToolHighlight(atomicNumbers: Iterable<number>) {
    toolHighlightElements.value = new Set(atomicNumbers);
  }

  function clearToolHighlight() {
    toolHighlightElements.value = new Set();
  }

  function setCompareElement(slotIndex: 0 | 1, element: Element | null) {
    const next: [Element | null, Element | null] = [
      compareElements.value[0],
      compareElements.value[1],
    ];
    next[slotIndex] = element;
    compareElements.value = next;
  }

  function clearCompare() {
    compareElements.value = [null, null];
  }

  return {
    // state
    elements,
    selectedElement,
    detailPanelOpen,
    searchQuery,
    highlightedElements,
    toolHighlightElements,
    displayHighlightSet,
    compareElements,
    activeCategory,
    activePeriod,
    activeGroup,
    activeBlock,
    // getters
    filteredElements,
    hasActiveFilter,
    isHighlighted,
    isDimmed,
    // actions
    loadElements,
    selectElement,
    closeDetailPanel,
    setSearchQuery,
    setActiveCategory,
    setActivePeriod,
    setActiveGroup,
    setActiveBlock,
    clearAllFilters,
    setToolHighlight,
    clearToolHighlight,
    setCompareElement,
    clearCompare,
  };
});
