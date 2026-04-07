export type ElementCategory =
  | "alkali metal"
  | "alkaline earth metal"
  | "transition metal"
  | "post-transition metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble gas"
  | "lanthanide"
  | "actinide"
  | "unknown"

export type ElementBlock = "s" | "p" | "d" | "f"

export type ElementPhase = "Solid" | "Liquid" | "Gas" | "Unknown"

export type TrendProperty =
  | "atomicRadius"
  | "electronegativity"
  | "ionizationEnergy"
  | "electronAffinity"
  | "density"
  | "meltingPoint"
  | "boilingPoint"

export interface Element {
  name: string
  symbol: string
  atomicNumber: number
  atomicMass: number
  category: ElementCategory
  /** CSS grid column (1–18) */
  xpos: number
  /** CSS grid row (1–10, including lanthanide/actinide rows) */
  ypos: number
  period: number
  group: number | null
  block: ElementBlock
  phase: ElementPhase
  electronConfiguration: string
  electronConfigurationSemantic: string
  electronShells: number[]
  electronegativity: number | null
  atomicRadius: number | null
  ionizationEnergy: number | null
  electronAffinity: number | null
  density: number | null
  meltingPoint: number | null
  boilingPoint: number | null
  oxidationStates: string | null
  discoverer: string | null
  yearDiscovered: number | string | null
  /** Hex color strings for emission spectral lines */
  spectralLines: string[]
  funFacts: string[]
  compounds: string[]
  summary: string
}
