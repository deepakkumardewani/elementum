import type { Element, ElementCategory, TrendProperty } from "@/types/element"

// ── Category → hex color (mirrors CSS vars in style.css) ──────────────────
// ApexCharts renders outside the Vue DOM context, so CSS variables can't be
// resolved there. We keep these in sync manually with --cat-* in style.css.
export const CATEGORY_HEX: Record<ElementCategory, string> = {
  "alkali metal": "#ef4444",
  "alkaline earth metal": "#f97316",
  "transition metal": "#eab308",
  "post-transition metal": "#84cc16",
  metalloid: "#22c55e",
  nonmetal: "#22d3ee",
  halogen: "#818cf8",
  "noble gas": "#c084fc",
  lanthanide: "#f472b6",
  actinide: "#fb923c",
  unknown: "#64748b",
}

// ── Property metadata ─────────────────────────────────────────────────────
export interface TrendPropertyMeta {
  label: string
  unit: string
  description: string
}

export const TREND_PROPERTY_META: Record<TrendProperty, TrendPropertyMeta> = {
  atomicRadius: {
    label: "Atomic Radius",
    unit: "pm",
    description:
      "Atomic radius generally increases down a group as electron shells are added, and decreases across a period as increasing nuclear charge pulls electrons closer.",
  },
  electronegativity: {
    label: "Electronegativity",
    unit: "Pauling",
    description:
      "Electronegativity (Pauling scale) increases across a period and decreases down a group. Fluorine is the most electronegative element at 3.98.",
  },
  ionizationEnergy: {
    label: "Ionization Energy",
    unit: "kJ/mol",
    description:
      "First ionization energy generally increases across a period and decreases down a group, reflecting how tightly the outermost electron is held.",
  },
  electronAffinity: {
    label: "Electron Affinity",
    unit: "kJ/mol",
    description:
      "Electron affinity measures the energy change when a neutral atom gains an electron. Halogens have the highest electron affinities.",
  },
  density: {
    label: "Density",
    unit: "g/cm³",
    description:
      "Density varies widely across the periodic table. Osmium and iridium are the densest elements at over 22 g/cm³.",
  },
  meltingPoint: {
    label: "Melting Point",
    unit: "K",
    description:
      "Melting point reflects the strength of metallic or covalent bonding. Tungsten has the highest melting point of all elements at 3695 K.",
  },
  boilingPoint: {
    label: "Boiling Point",
    unit: "K",
    description:
      "Boiling point trends correlate with the strength of interatomic forces. Tungsten also holds the record for highest boiling point at 6203 K.",
  },
}

// ── Data point shape ──────────────────────────────────────────────────────
export interface TrendDataPoint {
  symbol: string
  name: string
  atomicNumber: number
  value: number | null
  category: ElementCategory
  color: string
}

/**
 * Returns one data point per element, sorted by atomic number.
 * Null values are preserved — the caller (chart) decides how to render them.
 */
export function getTrendSeries(property: TrendProperty, elements: Element[]): TrendDataPoint[] {
  return [...elements]
    .sort((a, b) => a.atomicNumber - b.atomicNumber)
    .map((el) => ({
      symbol: el.symbol,
      name: el.name,
      atomicNumber: el.atomicNumber,
      value: el[property] as number | null,
      category: el.category,
      color: CATEGORY_HEX[el.category],
    }))
}
