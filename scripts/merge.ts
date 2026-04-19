#!/usr/bin/env bun
/**
 * DP-5 — Deep-merge scripts/output/*.json into src/data/elements.json without clobbering with nulls.
 * Run: bun run scripts/merge.ts
 */

import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { Element } from "../src/types/element.ts"
import { type EnrichmentPatch, mergeElementEnrichment } from "../src/utils/elementMerge.ts"
import type { WikidataElementRecord } from "./fetchers/wikidata.ts"
import { ELEMENTS_JSON, ensureDirs, OUTPUT_DIR } from "./lib/paths.ts"

interface IsotopesFile {
  [k: string]: { atomicNumber: number; isotopes: EnrichmentPatch["isotopes"] }
}

interface HazardsFile {
  [k: string]: {
    atomicNumber: number
    hazardLevel: NonNullable<EnrichmentPatch["hazardLevel"]>
  }
}

interface StoriesFile {
  [k: string]: {
    atomicNumber: number
    storyHeadline: string | null
    storyBody: string | null
  }
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T
  } catch {
    return null
  }
}

function wikidataToPatch(rec: WikidataElementRecord): EnrichmentPatch {
  return {
    discoverer: rec.discoverer,
    yearDiscovered: rec.discoveryYear,
    etymology: rec.etymology,
    discoveryCountry: rec.discoveryCountry,
    discoveryMethod: rec.discoveryMethod,
    discoveryStory: rec.discoveryStory,
    abundance: rec.abundance,
  }
}

function mergeMain(): void {
  ensureDirs()

  const elements = JSON.parse(readFileSync(ELEMENTS_JSON, "utf-8")) as Element[]

  const wd = readJson<Record<string, WikidataElementRecord>>(join(OUTPUT_DIR, "wikidata.json"))
  const iso = readJson<IsotopesFile>(join(OUTPUT_DIR, "isotopes.json"))
  const haz = readJson<HazardsFile>(join(OUTPUT_DIR, "hazards.json"))
  const stories = readJson<StoriesFile>(join(OUTPUT_DIR, "stories.json"))

  const merged = elements.map((el) => {
    let m = el
    const k = String(el.atomicNumber)

    const wRec = wd?.[k]
    if (wRec) {
      m = mergeElementEnrichment(m, wikidataToPatch(wRec))
    }

    const iRec = iso?.[k]
    if (iRec?.isotopes) {
      m = mergeElementEnrichment(m, { isotopes: iRec.isotopes })
    }

    const hRec = haz?.[k]
    if (hRec) {
      m = mergeElementEnrichment(m, { hazardLevel: hRec.hazardLevel })
    }

    const sRec = stories?.[k]
    if (sRec) {
      m = mergeElementEnrichment(m, {
        storyHeadline: sRec.storyHeadline,
        storyBody: sRec.storyBody,
      })
    }

    return m
  })

  writeFileSync(ELEMENTS_JSON, JSON.stringify(merged, null, 2), "utf-8")
  console.log(`✓  Merged enrichment → ${ELEMENTS_JSON}`)
}

if (import.meta.main) {
  mergeMain()
}
