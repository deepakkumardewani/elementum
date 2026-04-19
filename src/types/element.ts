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

/** Main-table tile coloring: category palette or a numeric trend gradient */
export type TableColorMode = TrendProperty | "category"

export interface ElementImage {
  title: string
  url: string
  attribution: string
}

/**
 * Relative abundance values (often ppm). Field names align with ingestion pipelines:
 * external `universeAbundance` → `universe`; `bodyAbundance` → `humanBody`;
 * `crustAbundance` → `earthCrust`; `seaAbundance` → `oceans`.
 */
export interface Abundance {
  universe: number | null
  sun: number | null
  /** Seawater / hydrosphere — maps from pipeline `seaAbundance` */
  oceans: number | null
  /** Human body — maps from pipeline `bodyAbundance` */
  humanBody: number | null
  /** Earth's crust — maps from pipeline `crustAbundance` */
  earthCrust: number | null
  meteorites: number | null
}

/** GHS-style hazard bucket for UI (maps from PubChem / manual defaults). */
export type HazardLevel = "safe" | "flammable" | "toxic" | "radioactive" | "corrosive"

/** One nuclide row (IAEA / merged data); optional fields stay null when unknown. */
export interface Isotope {
  massNumber: number
  symbol: string
  /** Natural abundance (percent), or null if not meaningful for synthetic/rare */
  abundance: number | null
  /** `"stable"` or a formatted half-life string (e.g. `1.6×10³ y`) */
  halfLife: string
  decayMode: string | null
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
  /** Top natural isotopes (e.g. from IAEA LiveChart merge) */
  isotopes?: Isotope[] | null
  /** Plain-language origin of the element name */
  etymology?: string | null
  industrialUses?: string[] | null
  naturalOccurrence?: string | null
  hazardLevel?: HazardLevel | null
  discoveryCountry?: string | null
  discoveryMethod?: string | null
  /** Longer discovery narrative (Wikidata / editorial) */
  discoveryStory?: string | null
  storyHeadline?: string | null
  storyBody?: string | null
  /** URL to discoverer portrait image when available */
  discovererPortrait?: string | null
}
