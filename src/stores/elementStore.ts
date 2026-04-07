import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { Element, ElementBlock, ElementCategory } from "@/types/element"

export const useElementStore = defineStore("element", () => {
  // ── State ──────────────────────────────────────────────────────
  const elements = ref<Element[]>([])
  const selectedElement = ref<Element | null>(null)
  const detailPanelOpen = ref(false)
  const searchQuery = ref("")
  const highlightedElements = ref<Set<number>>(new Set())

  const activeCategory = ref<ElementCategory | null>(null)
  const activePeriod = ref<number | null>(null)
  const activeGroup = ref<number | null>(null)
  const activeBlock = ref<ElementBlock | null>(null)

  // ── Derived helpers ────────────────────────────────────────────
  const hasActiveFilter = computed(
    () =>
      searchQuery.value.trim() !== "" ||
      activeCategory.value !== null ||
      activePeriod.value !== null ||
      activeGroup.value !== null ||
      activeBlock.value !== null,
  )

  // ── Getters ────────────────────────────────────────────────────
  const filteredElements = computed(() => {
    if (!hasActiveFilter.value) return elements.value
    return elements.value.filter((el) => highlightedElements.value.has(el.atomicNumber))
  })

  function isHighlighted(atomicNumber: number): boolean {
    if (!hasActiveFilter.value) return true
    return highlightedElements.value.has(atomicNumber)
  }

  function isDimmed(atomicNumber: number): boolean {
    if (!hasActiveFilter.value) return false
    return !highlightedElements.value.has(atomicNumber)
  }

  // ── Internal: recompute highlighted set from all active filters ─
  function recomputeHighlighted() {
    const query = searchQuery.value.trim().toLowerCase()

    const matched = elements.value.filter((el) => {
      const matchesSearch =
        query === "" ||
        el.name.toLowerCase().includes(query) ||
        el.symbol.toLowerCase().includes(query) ||
        String(el.atomicNumber).includes(query)

      const matchesCategory = activeCategory.value === null || el.category === activeCategory.value

      const matchesPeriod = activePeriod.value === null || el.period === activePeriod.value

      const matchesGroup = activeGroup.value === null || el.group === activeGroup.value

      const matchesBlock = activeBlock.value === null || el.block === activeBlock.value

      return matchesSearch && matchesCategory && matchesPeriod && matchesGroup && matchesBlock
    })

    highlightedElements.value = new Set(matched.map((el) => el.atomicNumber))
  }

  // ── Actions ────────────────────────────────────────────────────
  async function loadElements() {
    const data = await import("@/data/elements.json")
    elements.value = data.default as Element[]
  }

  function selectElement(element: Element) {
    selectedElement.value = element
    detailPanelOpen.value = true
  }

  function closeDetailPanel() {
    detailPanelOpen.value = false
    selectedElement.value = null
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
    recomputeHighlighted()
  }

  function setActiveCategory(cat: ElementCategory | null) {
    activeCategory.value = cat
    recomputeHighlighted()
  }

  function setActivePeriod(period: number | null) {
    activePeriod.value = period
    recomputeHighlighted()
  }

  function setActiveGroup(group: number | null) {
    activeGroup.value = group
    recomputeHighlighted()
  }

  function setActiveBlock(block: ElementBlock | null) {
    activeBlock.value = block
    recomputeHighlighted()
  }

  function clearAllFilters() {
    searchQuery.value = ""
    activeCategory.value = null
    activePeriod.value = null
    activeGroup.value = null
    activeBlock.value = null
    highlightedElements.value = new Set()
  }

  return {
    // state
    elements,
    selectedElement,
    detailPanelOpen,
    searchQuery,
    highlightedElements,
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
  }
})
