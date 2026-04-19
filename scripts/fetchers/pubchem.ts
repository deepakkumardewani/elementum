#!/usr/bin/env bun
/**
 * DP-3 — PubChem GHS hazard classification (element as native substance where possible).
 * Run: bun run scripts/fetchers/pubchem.ts
 */

import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { HazardLevel } from "../../src/types/element.ts"
import { ELEMENTS_JSON, ensureDirs, OUTPUT_DIR, USER_AGENT } from "../lib/paths.ts"

interface ElementStub {
  name: string
  symbol: string
  atomicNumber: number
}

function loadElements(): ElementStub[] {
  return JSON.parse(readFileSync(ELEMENTS_JSON, "utf-8")) as ElementStub[]
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function collectHCodes(node: unknown, out: Set<string>): void {
  if (typeof node === "string") {
    const re = /\b(H\d{3}[a-z]?)\b/gi
    for (;;) {
      const m = re.exec(node)
      if (m === null) break
      out.add(m[1]?.toUpperCase() ?? "")
    }
  } else if (Array.isArray(node)) {
    for (const n of node) collectHCodes(n, out)
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) collectHCodes(v, out)
  }
}

function numericFromH(code: string): number | null {
  const m = /^H(\d{3})/i.exec(code)
  if (!m?.[1]) return null
  return Number.parseInt(m[1], 10)
}

function inferDefaultRadioactive(z: number): boolean {
  return z === 43 || z === 61 || z >= 84
}

/** Noble gases: PubChem often tags pressurized gas (H280) under 200-series “flammable” bucket — treat as inert/safe unless toxic/corrosive wins. */
const NOBLE_GAS_Z = new Set([2, 10, 18, 36, 54, 86])

function adjustNobleGas(hazard: HazardLevel, z: number): HazardLevel {
  if (!NOBLE_GAS_Z.has(z)) return hazard
  if (hazard === "flammable") return "safe"
  return hazard
}

function mapGhsToHazard(codes: string[], z: number): HazardLevel {
  if (inferDefaultRadioactive(z)) return "radioactive"

  const nums = codes
    .map((c) => numericFromH(c))
    .filter((n): n is number => n !== null && Number.isFinite(n))

  const has = (pred: (n: number) => boolean) => nums.some(pred)

  // Corrosive / serious damage (precedence within non-radioactive）
  if (has((n) => n === 314 || n === 318 || n === 290)) return "corrosive"

  // Plan mapping buckets
  if (has((n) => n >= 200 && n < 300)) return "flammable"
  if (has((n) => n >= 300 && n < 400)) return "toxic"
  if (has((n) => n >= 400 && n < 500)) return "corrosive"

  // Noble gases / inert — typically no hazardous codes → safe
  return "safe"
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`${res.status} ${url}: ${t.slice(0, 200)}`)
  }
  return res.json()
}

async function resolveCid(elementName: string): Promise<number | null> {
  const q = encodeURIComponent(elementName.toLowerCase())
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${q}/cids/JSON`
  const j = (await fetchJson(url)) as {
    IdentifierList?: { CID?: number[] }
  }
  const cids = j.IdentifierList?.CID
  if (!cids?.length) return null
  return cids[0] as number
}

async function fetchGhsCodes(cid: number): Promise<string[]> {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=GHS%20Classification`
  let j: unknown
  try {
    j = await fetchJson(url)
  } catch {
    const url2 = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Safety%20and%20Hazards`
    try {
      j = await fetchJson(url2)
    } catch {
      return []
    }
  }
  const set = new Set<string>()
  collectHCodes(j, set)
  return Array.from(set)
}

export async function runPubchem(): Promise<void> {
  ensureDirs()
  const els = loadElements()
  const out: Record<
    string,
    { atomicNumber: number; hazardLevel: HazardLevel; ghsCodes: string[] }
  > = {}

  for (const el of els) {
    const z = el.atomicNumber
    const name = el.name
    try {
      const cid = await resolveCid(name)
      await sleep(150)
      const codes = cid !== null ? await fetchGhsCodes(cid) : []
      await sleep(150)
      const hazard = adjustNobleGas(mapGhsToHazard(codes, z), z)
      out[String(z)] = {
        atomicNumber: z,
        hazardLevel: hazard,
        ghsCodes: codes,
      }
      console.log(`#${z} ${el.symbol} → ${hazard} (${codes.length} codes)`)
    } catch (e) {
      console.warn(`#${z} ${el.symbol} PubChem fallback safe —`, (e as Error).message)
      out[String(z)] = {
        atomicNumber: z,
        hazardLevel: inferDefaultRadioactive(z) ? "radioactive" : "safe",
        ghsCodes: [],
      }
    }
  }

  const target = join(OUTPUT_DIR, "hazards.json")
  writeFileSync(target, JSON.stringify(out, null, 2), "utf-8")
  console.log(`✓  Wrote ${target}`)
}

if (import.meta.main) {
  runPubchem().catch((e: Error) => {
    console.error(e)
    process.exit(1)
  })
}
