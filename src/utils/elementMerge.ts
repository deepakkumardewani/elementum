import type { Abundance, Element, HazardLevel, Isotope } from "../types/element"

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, infer V>
    ? V extends object
      ? DeepPartial<T[K]>
      : T[K]
    : T[K]
}

export interface EnrichmentPatch {
  discoverer?: string | null
  yearDiscovered?: number | string | null
  etymology?: string | null
  discoveryCountry?: string | null
  discoveryMethod?: string | null
  discoveryStory?: string | null
  abundance?: DeepPartial<Abundance> | null
  isotopes?: Isotope[] | null
  hazardLevel?: HazardLevel | null
  storyHeadline?: string | null
  storyBody?: string | null
  industrialUses?: string[] | null
  naturalOccurrence?: string | null
  discovererPortrait?: string | null
}

/** If the patch is null or undefined, keep base. If patch is present, replace only non-null fields over base. */
function pickNonNull<T extends string | number | boolean | object>(
  base: T | null | undefined,
  patch: T | null | undefined,
): T | null | undefined {
  if (patch === undefined) return base
  if (patch === null) return base
  return patch
}

export function mergeAbundance(
  base: Abundance | null | undefined,
  patch: DeepPartial<Abundance> | null | undefined,
): Abundance | null {
  if (!patch) return base ?? null
  const b: Abundance = base ?? {
    universe: null,
    sun: null,
    oceans: null,
    humanBody: null,
    earthCrust: null,
    meteorites: null,
  }
  return {
    universe: pickNonNull(b.universe, patch.universe ?? null) ?? null,
    sun: pickNonNull(b.sun, patch.sun ?? null) ?? null,
    oceans: pickNonNull(b.oceans, patch.oceans ?? null) ?? null,
    humanBody: pickNonNull(b.humanBody, patch.humanBody ?? null) ?? null,
    earthCrust: pickNonNull(b.earthCrust, patch.earthCrust ?? null) ?? null,
    meteorites: pickNonNull(b.meteorites, patch.meteorites ?? null) ?? null,
  }
}

/**
 * Deep-merge enrichment into an element without clobbering existing values with null
 * from the pipeline (null in patch means "no new data").
 */
export function mergeElementEnrichment(base: Element, patch: EnrichmentPatch): Element {
  const out: Element = { ...base }

  const d = pickNonNull(base.discoverer, patch.discoverer ?? null)
  if (d !== undefined) out.discoverer = d as string | null

  const y = pickNonNull(base.yearDiscovered, patch.yearDiscovered ?? null)
  if (y !== undefined) out.yearDiscovered = y as number | string | null

  out.etymology = pickNonNull(base.etymology, patch.etymology ?? null) as string | null | undefined
  out.discoveryCountry = pickNonNull(base.discoveryCountry, patch.discoveryCountry ?? null) as
    | string
    | null
    | undefined
  out.discoveryMethod = pickNonNull(base.discoveryMethod, patch.discoveryMethod ?? null) as
    | string
    | null
    | undefined
  out.discoveryStory = pickNonNull(base.discoveryStory, patch.discoveryStory ?? null) as
    | string
    | null
    | undefined

  out.abundance = mergeAbundance(base.abundance ?? null, patch.abundance ?? null) ?? undefined

  const iso = patch.isotopes
  if (iso !== undefined && iso !== null) {
    out.isotopes = iso
  }

  out.hazardLevel = pickNonNull(base.hazardLevel, patch.hazardLevel ?? null) as
    | HazardLevel
    | null
    | undefined
  out.storyHeadline = pickNonNull(base.storyHeadline, patch.storyHeadline ?? null) as
    | string
    | null
    | undefined
  out.storyBody = pickNonNull(base.storyBody, patch.storyBody ?? null) as string | null | undefined

  const iu = patch.industrialUses
  if (iu !== undefined && iu !== null) {
    out.industrialUses = iu
  }

  out.naturalOccurrence = pickNonNull(base.naturalOccurrence, patch.naturalOccurrence ?? null) as
    | string
    | null
    | undefined

  out.discovererPortrait = pickNonNull(base.discovererPortrait, patch.discovererPortrait ?? null) as
    | string
    | null
    | undefined

  return out
}
