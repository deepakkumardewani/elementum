import type { Element } from "@/types/element"

export type DetailTabId = "overview" | "isotopes" | "etymology" | "realWorld" | "safety"

function nonEmpty(s: string | null | undefined): boolean {
  return Boolean(s?.trim())
}

/** Etymology tab is shown when any narrative or discovery field can be populated. */
export function hasEtymologyTabContent(element: Element): boolean {
  return (
    nonEmpty(element.etymology) ||
    nonEmpty(element.discoveryStory) ||
    nonEmpty(element.discoverer) ||
    (element.yearDiscovered !== null &&
      element.yearDiscovered !== undefined &&
      element.yearDiscovered !== "") ||
    nonEmpty(element.discoveryCountry) ||
    nonEmpty(element.discoveryMethod)
  )
}

/** Real World tab when industrial uses or natural occurrence text exists. */
export function hasRealWorldTabContent(element: Element): boolean {
  const uses = element.industrialUses
  return (uses != null && uses.length > 0) || nonEmpty(element.naturalOccurrence)
}

/** Isotopes tab when the merged record includes an isotope list (may be empty). */
export function hasIsotopesTabContent(element: Element): boolean {
  return Array.isArray(element.isotopes)
}

/** Safety tab: always available (unknown hazard shows a fallback message). */
export function hasSafetyTabContent(_element: Element): boolean {
  return true
}

export function visibleDetailTabIds(element: Element): DetailTabId[] {
  const ids: DetailTabId[] = ["overview"]
  if (hasIsotopesTabContent(element)) ids.push("isotopes")
  if (hasEtymologyTabContent(element)) ids.push("etymology")
  if (hasRealWorldTabContent(element)) ids.push("realWorld")
  if (hasSafetyTabContent(element)) ids.push("safety")
  return ids
}
