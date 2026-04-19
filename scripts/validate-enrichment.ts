#!/usr/bin/env bun
/**
 * DP-6 — quick sanity counts on src/data/elements.json after merge.
 * Run: bun run scripts/validate-enrichment.ts
 */

import { readFileSync } from "node:fs"
import type { Element } from "../src/types/element.ts"
import { ELEMENTS_JSON } from "./lib/paths.ts"

function main(): void {
  const els = JSON.parse(readFileSync(ELEMENTS_JSON, "utf-8")) as Element[]
  let etymology = 0
  let isotopes = 0
  let hazard = 0
  let stories = 0

  for (const e of els) {
    if (e.etymology) etymology++
    if (e.isotopes && e.isotopes.length > 0) isotopes++
    if (e.hazardLevel) hazard++
    if (e.storyHeadline) stories++
  }

  console.log("Enrichment coverage (non-null)", {
    total: els.length,
    etymology,
    isotopes,
    hazardLevel: hazard,
    storyHeadline: stories,
  })
}

main()
