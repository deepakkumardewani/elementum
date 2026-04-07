import type { ElementCategory } from "@/types/element"

// Maps category names (with spaces, as in the JSON) to CSS variable keys (with hyphens)
const CATEGORY_CSS_KEY: Record<ElementCategory, string> = {
  "alkali metal": "alkali-metal",
  "alkaline earth metal": "alkaline-earth-metal",
  "transition metal": "transition-metal",
  "post-transition metal": "post-transition-metal",
  metalloid: "metalloid",
  nonmetal: "nonmetal",
  halogen: "halogen",
  "noble gas": "noble-gas",
  lanthanide: "lanthanide",
  actinide: "actinide",
  unknown: "unknown",
}

/** Returns the CSS custom-property value for a category's color, e.g. `var(--cat-alkali-metal)` */
export function categoryColor(category: ElementCategory): string {
  return `var(--cat-${CATEGORY_CSS_KEY[category]})`
}

/** Human-readable display label for a category */
export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  "alkali metal": "Alkali Metal",
  "alkaline earth metal": "Alkaline Earth Metal",
  "transition metal": "Transition Metal",
  "post-transition metal": "Post-Transition Metal",
  metalloid: "Metalloid",
  nonmetal: "Nonmetal",
  halogen: "Halogen",
  "noble gas": "Noble Gas",
  lanthanide: "Lanthanide",
  actinide: "Actinide",
  unknown: "Unknown",
}

/** Ordered list of all categories for rendering legend */
export const ALL_CATEGORIES: ElementCategory[] = [
  "alkali metal",
  "alkaline earth metal",
  "transition metal",
  "post-transition metal",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble gas",
  "lanthanide",
  "actinide",
  "unknown",
]
