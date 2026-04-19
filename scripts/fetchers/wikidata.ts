#!/usr/bin/env bun
/**
 * DP-1 — Wikidata batch fetch for discovery + etymology hooks + abundance placeholders.
 * Writes scripts/output/wikidata.json keyed by atomic number (string keys).
 *
 * Run: bun run scripts/fetchers/wikidata.ts
 */

import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { ensureDirs, OUTPUT_DIR, USER_AGENT } from "../lib/paths.ts"

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"

const SPARQL = `
SELECT ?atomicNumber
  (SAMPLE(?discLabel) AS ?discoverer)
  (SAMPLE(?time) AS ?discoveryTime)
  (SAMPLE(?placeCountry) AS ?placeCountry)
  (SAMPLE(?personCountry) AS ?personCountry)
  (SAMPLE(?namedAfterLabel) AS ?namedAfterLabel)
WHERE {
  ?element wdt:P31 wd:Q11344 .
  ?element wdt:P1086 ?atomicNumber .

  OPTIONAL {
    ?element wdt:P61 ?disc .
    ?disc rdfs:label ?discLabel .
    FILTER(LANG(?discLabel) = "en")
  }

  OPTIONAL { ?element wdt:P575 ?time . }

  OPTIONAL {
    ?element wdt:P189 ?loc .
    ?loc wdt:P17 ?ctryPlace .
    ?ctryPlace rdfs:label ?placeCountry .
    FILTER(LANG(?placeCountry) = "en")
  }

  OPTIONAL {
    ?element wdt:P61 ?disc2 .
    ?disc2 wdt:P27 ?ctryPerson .
    ?ctryPerson rdfs:label ?personCountry .
    FILTER(LANG(?personCountry) = "en")
  }

  OPTIONAL {
    ?element wdt:P138 ?na .
    ?na rdfs:label ?namedAfterLabel .
    FILTER(LANG(?namedAfterLabel) = "en")
  }
}
GROUP BY ?atomicNumber
ORDER BY xsd:integer(?atomicNumber)
`

interface Binding {
  type: string
  value: string
}

interface SparqlRow {
  atomicNumber: Binding
  discoverer?: Binding
  discoveryTime?: Binding
  placeCountry?: Binding
  personCountry?: Binding
  namedAfterLabel?: Binding
}

export interface WikidataElementRecord {
  atomicNumber: number
  discoverer: string | null
  discoveryYear: number | null
  discoveryCountry: string | null
  discoveryMethod: string | null
  etymology: string | null
  discoveryStory: string | null
  abundance: {
    universe: number | null
    sun: number | null
    oceans: number | null
    humanBody: number | null
    earthCrust: number | null
    meteorites: number | null
  }
}

function extractYear(iso?: string): number | null {
  if (!iso) return null
  const m = iso.match(/^(-?\d+)-\d{2}-\d{2}/)
  if (!m) return null
  return Number.parseInt(m[1] as string, 10)
}

function buildEtymology(namedAfter?: string): string | null {
  if (!namedAfter?.trim()) return null
  return `Named after ${namedAfter.trim()}`
}

export async function runWikidata(): Promise<void> {
  ensureDirs()
  const url = new URL(SPARQL_ENDPOINT)
  url.searchParams.set("query", SPARQL)
  url.searchParams.set("format", "json")

  console.log("⟳  Wikidata SPARQL (DP-1)…")
  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/sparql-results+json",
    },
    signal: AbortSignal.timeout(120_000),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Wikidata ${res.status}: ${body.slice(0, 400)}`)
  }

  const data = (await res.json()) as {
    results: { bindings: Record<string, Binding>[] }
  }

  const out: Record<string, WikidataElementRecord> = {}

  for (const raw of data.results.bindings) {
    const row = raw as unknown as SparqlRow
    const n = Number.parseInt(row.atomicNumber?.value ?? "0", 10)
    if (Number.isNaN(n) || n < 1 || n > 118) continue

    const place = row.placeCountry?.value ?? null
    const person = row.personCountry?.value ?? null
    const country = place ?? person

    const rec: WikidataElementRecord = {
      atomicNumber: n,
      discoverer: row.discoverer?.value ?? null,
      discoveryYear: extractYear(row.discoveryTime?.value),
      discoveryCountry: country,
      discoveryMethod: null,
      etymology: buildEtymology(row.namedAfterLabel?.value),
      discoveryStory: null,
      abundance: {
        universe: null,
        sun: null,
        oceans: null,
        humanBody: null,
        earthCrust: null,
        meteorites: null,
      },
    }

    out[String(n)] = rec
  }

  // Ensure all 118 keys exist with explicit nulls
  for (let z = 1; z <= 118; z++) {
    const k = String(z)
    if (!out[k]) {
      out[k] = {
        atomicNumber: z,
        discoverer: null,
        discoveryYear: null,
        discoveryCountry: null,
        discoveryMethod: null,
        etymology: null,
        discoveryStory: null,
        abundance: {
          universe: null,
          sun: null,
          oceans: null,
          humanBody: null,
          earthCrust: null,
          meteorites: null,
        },
      }
    }
  }

  const target = join(OUTPUT_DIR, "wikidata.json")
  writeFileSync(target, JSON.stringify(out, null, 2), "utf-8")
  console.log(`✓  Wrote ${target} (${Object.keys(out).length} records)`)

  const h = out["1"]
  if (h) {
    console.log("Spot-check H (1):", {
      discoverer: h.discoverer,
      discoveryYear: h.discoveryYear,
      discoveryCountry: h.discoveryCountry,
      etymology: h.etymology,
    })
  }
}

if (import.meta.main) {
  runWikidata().catch((e: Error) => {
    console.error(e)
    process.exit(1)
  })
}
