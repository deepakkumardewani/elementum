#!/usr/bin/env bun
/**
 * Enriches src/data/elements.json with additional data from Wikidata SPARQL.
 * Run once: bun run scripts/enrich-elements.ts
 *
 * Adds via Wikidata: casNumber, latinName, crystalStructure, thermalConductivity,
 *   mohsHardness, vanDerWaalsRadius, magneticType, colour, abundance
 * Derives locally: electricalType (from category), valenceElectrons (from shells)
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ELEMENTS_PATH = join(import.meta.dir, "../src/data/elements.json");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error — import.meta.dir is Bun-specific
const STATIC_DATA_PATH = join(import.meta.dir, "./static-element-data.json");
const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT =
  "periodic-table-explorer/1.0 (educational enrichment script; bun)";

// ─── SPARQL query ─────────────────────────────────────────────────────────────

const SPARQL = `
SELECT ?atomicNumber
  (SAMPLE(?cas_)                    AS ?cas)
  (SAMPLE(?crystalStructureLabel_)  AS ?crystalStructure)
  (SAMPLE(?thermalConductivity_)    AS ?thermalConductivity)
  (SAMPLE(?mohsHardness_)           AS ?mohsHardness)
  (SAMPLE(?vanDerWaalsRadius_)      AS ?vanDerWaalsRadius)
  (SAMPLE(?magneticOrderingLabel_)  AS ?magneticOrdering)
  (SAMPLE(?colourLabel_)            AS ?colour)
  (SAMPLE(?latinName_)              AS ?latinName)
  (SAMPLE(?discoveryDate_)          AS ?discoveryDate)
  (GROUP_CONCAT(DISTINCT STR(?oxState_); SEPARATOR=",") AS ?oxidationStates)
WHERE {
  ?element wdt:P31 wd:Q11344 .
  ?element wdt:P1086 ?atomicNumber .

  OPTIONAL { ?element wdt:P231 ?cas_ . }

  OPTIONAL {
    ?element wdt:P556 ?cs_ .
    ?cs_ rdfs:label ?crystalStructureLabel_ .
    FILTER(LANG(?crystalStructureLabel_) = "en")
  }

  OPTIONAL { ?element wdt:P2068 ?thermalConductivity_ . }
  OPTIONAL { ?element wdt:P2243 ?mohsHardness_ . }
  OPTIONAL { ?element wdt:P2221 ?vanDerWaalsRadius_ . }

  OPTIONAL {
    ?element wdt:P922 ?mo_ .
    ?mo_ rdfs:label ?magneticOrderingLabel_ .
    FILTER(LANG(?magneticOrderingLabel_) = "en")
  }

  OPTIONAL {
    ?element wdt:P462 ?co_ .
    ?co_ rdfs:label ?colourLabel_ .
    FILTER(LANG(?colourLabel_) = "en")
  }

  OPTIONAL {
    ?element rdfs:label ?latinName_ .
    FILTER(LANG(?latinName_) = "la")
  }

  OPTIONAL { ?element wdt:P575 ?discoveryDate_ . }
  OPTIONAL { ?element wdt:P1121 ?oxState_ . }
}
GROUP BY ?atomicNumber
ORDER BY xsd:integer(?atomicNumber)
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Category =
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
  | "unknown";

const ELECTRICAL_TYPE: Record<Category, string | null> = {
  "alkali metal": "Conductor",
  "alkaline earth metal": "Conductor",
  "transition metal": "Conductor",
  "post-transition metal": "Conductor",
  lanthanide: "Conductor",
  actinide: "Conductor",
  metalloid: "Semiconductor",
  nonmetal: "Insulator",
  halogen: "Insulator",
  "noble gas": "Insulator",
  unknown: null,
};

function deriveElectricalType(category: string): string | null {
  return ELECTRICAL_TYPE[category as Category] ?? null;
}

function deriveValenceElectrons(shells: number[]): number | null {
  return shells.at(-1) ?? null;
}

function parseNum(v: string | undefined): number | null {
  if (!v) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

/** Extract a year (possibly BC/negative) from an ISO date string like "1827-01-01T00:00:00Z" */
function extractYear(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  // Handles negative years (BC): "-5000-01-01T00:00:00Z" → -5000
  const match = dateStr.match(/^(-?\d+)-\d{2}-\d{2}/);
  if (!match) return null;
  return parseInt(match[1]);
}

/** Format Wikidata oxidation state numbers as "+2, +3, -1" etc. */
function formatOxidationStates(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const nums = raw
    .split(",")
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n));
  if (nums.length === 0) return null;
  nums.sort((a, b) => a - b);
  return nums.map((n) => (n > 0 ? `+${n}` : String(n))).join(", ");
}

// ─── Wikidata fetch ────────────────────────────────────────────────────────────

interface SparqlBinding {
  [key: string]: { type: string; value: string } | undefined;
}

async function fetchWikidata(): Promise<Map<number, SparqlBinding>> {
  const url = new URL(SPARQL_ENDPOINT);
  url.searchParams.set("query", SPARQL);
  url.searchParams.set("format", "json");

  console.log("⟳  Fetching Wikidata SPARQL (may take ~30s)…");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/sparql-results+json",
    },
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Wikidata SPARQL ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    results: { bindings: SparqlBinding[] };
  };

  const map = new Map<number, SparqlBinding>();
  for (const b of data.results.bindings) {
    const n = parseInt(b.atomicNumber?.value ?? "0");
    if (n >= 1 && n <= 118) map.set(n, b);
  }

  console.log(`✓  Wikidata returned data for ${map.size} elements`);
  return map;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface StaticData {
  crystalStructure: Record<string, string>;
  mohsHardness: Record<string, number>;
}

async function main() {
  const elements = JSON.parse(readFileSync(ELEMENTS_PATH, "utf-8")) as Record<
    string,
    unknown
  >[];
  const staticData = JSON.parse(
    readFileSync(STATIC_DATA_PATH, "utf-8"),
  ) as StaticData;

  const wikidata = await fetchWikidata();

  let wdFields = 0;
  let derivedFields = 0;
  let staticFields = 0;

  for (const el of elements) {
    const n = el.atomicNumber as number;
    const d = wikidata.get(n);

    if (d) {
      // Helper: only set if currently null/undefined and new value is non-null
      const setWd = (key: string, val: unknown) => {
        if (el[key] == null && val != null) {
          el[key] = val;
          wdFields++;
        }
      };

      setWd("casNumber", d.cas?.value ?? null);
      setWd("latinName", d.latinName?.value ?? null);
      setWd("crystalStructure", d.crystalStructure?.value ?? null);
      setWd("thermalConductivity", parseNum(d.thermalConductivity?.value));
      setWd("mohsHardness", parseNum(d.mohsHardness?.value));
      setWd("vanDerWaalsRadius", parseNum(d.vanDerWaalsRadius?.value));
      setWd("magneticType", d.magneticOrdering?.value ?? null);
      setWd("colour", d.colour?.value ?? null);
      setWd("yearDiscovered", extractYear(d.discoveryDate?.value));
      setWd("oxidationStates", formatOxidationStates(d.oxidationStates?.value));
    }

    // Static supplement: crystal structure and Mohs hardness
    const key = String(n);
    if (el.crystalStructure == null && staticData.crystalStructure[key]) {
      el.crystalStructure = staticData.crystalStructure[key];
      staticFields++;
    }
    if (el.mohsHardness == null && staticData.mohsHardness[key] != null) {
      el.mohsHardness = staticData.mohsHardness[key];
      staticFields++;
    }

    // Derived fields — no network needed
    if (el.electricalType == null) {
      const t = deriveElectricalType(el.category as string);
      if (t !== null) {
        el.electricalType = t;
        derivedFields++;
      }
    }
    if (el.valenceElectrons == null) {
      const v = deriveValenceElectrons(el.electronShells as number[]);
      if (v !== null) {
        el.valenceElectrons = v;
        derivedFields++;
      }
    }
  }

  writeFileSync(ELEMENTS_PATH, JSON.stringify(elements, null, 2));

  console.log(
    `\n✅  Done — ${wdFields} Wikidata fields, ${staticFields} static fields, ${derivedFields} derived fields written to elements.json`,
  );

  // Spot-check Iron
  const iron = elements.find(
    (e) => (e as { atomicNumber: number }).atomicNumber === 26,
  ) as Record<string, unknown>;
  console.log("\nIron (Fe, #26) spot-check:");
  console.log("  casNumber        :", iron.casNumber);
  console.log("  latinName        :", iron.latinName);
  console.log("  oxidationStates  :", iron.oxidationStates);
  console.log("  yearDiscovered   :", iron.yearDiscovered);
  console.log("  colour           :", iron.colour);
  console.log("  crystalStructure :", iron.crystalStructure);
  console.log("  thermalConductiv :", iron.thermalConductivity, "W/(m·K)");
  console.log("  mohsHardness     :", iron.mohsHardness);
  console.log("  magneticType     :", iron.magneticType);
  console.log("  electricalType   :", iron.electricalType);
  console.log("  valenceElectrons :", iron.valenceElectrons);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
