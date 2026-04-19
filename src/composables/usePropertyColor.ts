import elementsJson from "@/data/elements.json"
import type { Element, ElementCategory, TableColorMode, TrendProperty } from "@/types/element"
import { categoryColor } from "@/utils/elementUtils"

const TREND_PROPERTIES = [
  "atomicRadius",
  "electronegativity",
  "ionizationEnergy",
  "electronAffinity",
  "density",
  "meltingPoint",
  "boilingPoint",
] as const satisfies readonly TrendProperty[]

const NEUTRAL_NULL_HEX = "#475569"

/** Gradient endpoints: deep slate-blue (low) → luminous cyan (high), per design direction */
const GRADIENT_LOW_HEX = "#0f2744"
const GRADIENT_HIGH_HEX = "#22d3ee"

export const TREND_PROPERTY_LABELS: Record<TrendProperty, string> = {
  atomicRadius: "Atomic radius",
  electronegativity: "Electronegativity",
  ionizationEnergy: "Ionization energy",
  electronAffinity: "Electron affinity",
  density: "Density",
  meltingPoint: "Melting point",
  boilingPoint: "Boiling point",
}

export const TABLE_COLOR_MODE_OPTIONS: {
  value: TableColorMode
  label: string
}[] = [
  { value: "category", label: "Category" },
  ...TREND_PROPERTIES.map((p) => ({
    value: p,
    label: TREND_PROPERTY_LABELS[p],
  })),
]

type Range = { min: number; max: number }

function computeRanges(elements: Element[]): Record<TrendProperty, Range> {
  const out = {} as Record<TrendProperty, Range>
  for (const prop of TREND_PROPERTIES) {
    const nums: number[] = []
    for (const el of elements) {
      const v = el[prop]
      if (typeof v === "number" && !Number.isNaN(v)) nums.push(v)
    }
    if (nums.length === 0) {
      out[prop] = { min: 0, max: 1 }
    } else {
      out[prop] = { min: Math.min(...nums), max: Math.max(...nums) }
    }
  }
  return out
}

const RANGES = computeRanges(elementsJson as Element[])

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "")
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0")
  return `#${c(r)}${c(g)}${c(b)}`
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpHex(low: string, high: string, t: number): string {
  const A = hexToRgb(low)
  const B = hexToRgb(high)
  return rgbToHex(lerp(A.r, B.r, t), lerp(A.g, B.g, t), lerp(A.b, B.b, t))
}

/**
 * Maps an element + color mode to a display color.
 * Category mode returns the existing CSS variable token used elsewhere.
 * Trend modes return an interpolated hex for tile backgrounds.
 */
export function getPropertyColor(element: Element, colorMode: TableColorMode): string {
  if (colorMode === "category") {
    return categoryColor(element.category as ElementCategory)
  }

  const raw = element[colorMode]
  if (raw === null || raw === undefined || typeof raw !== "number" || Number.isNaN(raw)) {
    return NEUTRAL_NULL_HEX
  }

  const { min, max } = RANGES[colorMode]
  if (max === min) {
    return lerpHex(GRADIENT_LOW_HEX, GRADIENT_HIGH_HEX, 0.5)
  }

  const t = Math.max(0, Math.min(1, (raw - min) / (max - min)))
  return lerpHex(GRADIENT_LOW_HEX, GRADIENT_HIGH_HEX, t)
}

export function getTrendRange(mode: TrendProperty): Range {
  return RANGES[mode]
}

export function formatTrendLegendValue(mode: TrendProperty, value: number): string {
  switch (mode) {
    case "atomicRadius":
      return `${value} pm`
    case "electronegativity":
      return `${value.toFixed(2)}`
    case "ionizationEnergy":
    case "electronAffinity":
      return `${Math.round(value)} kJ/mol`
    case "density":
      return `${value.toFixed(3)} g/cm³`
    case "meltingPoint":
    case "boilingPoint":
      return `${Math.round(value)} K`
    default:
      return String(value)
  }
}

export function gradientEndpoints(): readonly [string, string] {
  return [GRADIENT_LOW_HEX, GRADIENT_HIGH_HEX] as const
}
