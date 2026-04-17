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

export interface ElementImage {
  title: string
  url: string
  attribution: string
}

export interface Abundance {
  universe: number | null
  sun: number | null
  oceans: number | null
  humanBody: number | null
  earthCrust: number | null
  meteorites: number | null
}

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
  /** Wide periodic table column */
  wxpos?: number
  /** Wide periodic table row */
  wypos?: number
  period: number
  group: number | null
  block: ElementBlock
  phase: ElementPhase
  electronConfiguration: string
  electronConfigurationSemantic: string
  electronShells: number[]
  electronegativity: number | null
  atomicRadius: number | null
  /** First ionization energy (kJ/mol); use ionizationEnergies for full list */
  ionizationEnergy: number | null
  /** All ionization energies in order (kJ/mol) */
  ionizationEnergies?: number[]
  electronAffinity: number | null
  density: number | null
  meltingPoint: number | null
  boilingPoint: number | null
  molarHeat?: number | null
  oxidationStates: string | null
  appearance?: string | null
  discoverer: string | null
  namedBy?: string | null
  yearDiscovered: number | string | null
  /** CPK color hex (without #) */
  cpkHex?: string | null
  /** Wikipedia or authoritative source URL */
  source?: string | null
  /** URL to spectral image on Wikipedia */
  spectralImg?: string | null
  /** URL to static Bohr model image — used as WebGL fallback */
  bohrModelImage?: string | null
  /** Actual photograph of the element */
  image?: ElementImage | null
  /** emission spectral lines with wavelength and color */
  spectralLines: { wavelength: number; color: string }[]
  funFacts: string[]
  compounds: string[]
  summary: string
  // Enriched via Wikidata
  latinName?: string | null
  casNumber?: string | null
  valenceElectrons?: number | null
  vanDerWaalsRadius?: number | null
  electricalType?: string | null
  magneticType?: string | null
  crystalStructure?: string | null
  colour?: string | null
  mohsHardness?: number | null
  thermalConductivity?: number | null
  abundance?: Abundance | null
}
