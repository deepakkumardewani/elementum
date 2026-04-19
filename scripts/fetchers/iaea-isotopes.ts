#!/usr/bin/env bun
/**
 * DP-2 — IAEA LiveChart: download ground-state nuclides, cache CSV, top 5 isotopes per element.
 * Run: bun run scripts/fetchers/iaea-isotopes.ts
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { Isotope } from "../../src/types/element.ts"
import { CACHE_DIR, ELEMENTS_JSON, ensureDirs, OUTPUT_DIR } from "../lib/paths.ts"

const IAEA_URL = "https://www-nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all"
const CACHE_CSV = join(CACHE_DIR, "iaea-ground-states.csv")

interface ElementStub {
  atomicNumber: number
  symbol: string
}

function loadSymbols(): Map<number, string> {
  const raw = JSON.parse(readFileSync(ELEMENTS_JSON, "utf-8")) as ElementStub[]
  const m = new Map<number, string>()
  for (const e of raw) {
    m.set(e.atomicNumber, e.symbol)
  }
  return m
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ""
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i] as string
    if (c === '"') {
      inQ = !inQ
      continue
    }
    if (c === "," && !inQ) {
      out.push(cur.trim())
      cur = ""
      continue
    }
    cur += c
  }
  out.push(cur.trim())
  return out
}

function headerIndex(headers: string[], name: string): number {
  const n = name.toLowerCase()
  return headers.findIndex((h) => h.toLowerCase() === n)
}

function parseNum(s: string | undefined): number | null {
  if (!s || s === "" || s === " ") return null
  const v = Number.parseFloat(s.replace(/,/g, ""))
  return Number.isFinite(v) ? v : null
}

/** Heuristic: stable nuclide in ground_states export */
function isStableRow(args: {
  halfLifeRaw: string
  halfLifeSec: number | null
  decay1: string
}): boolean {
  const hl = args.halfLifeRaw.toLowerCase()
  if (hl.includes("stable")) return true
  if (args.halfLifeSec !== null && args.halfLifeSec > 1e30) return true
  const d = args.decay1.trim()
  if (!d || d === "-" || d === "") return true
  return false
}

function formatHalfLife(stable: boolean, halfLifeRaw: string, unit: string): string {
  if (stable) return "stable"
  const base = halfLifeRaw.trim()
  const u = unit.trim()
  if (base && u) return `${base} ${u}`.trim()
  if (base) return base
  return "unknown"
}

function normalizeDecay(decay1: string): string | null {
  const d = decay1.trim()
  if (!d || d === "-") return null
  return d
}

async function ensureCacheCsv(): Promise<string> {
  ensureDirs()
  if (existsSync(CACHE_CSV)) {
    console.log(`✓  Using cached ${CACHE_CSV}`)
    return readFileSync(CACHE_CSV, "utf-8")
  }
  console.log("⟳  Downloading IAEA ground_states (large CSV)…")
  const res = await fetch(IAEA_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Elementum/1.0; +https://github.com/) AppleWebKit/537.36",
    },
    signal: AbortSignal.timeout(600_000),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`IAEA ${res.status}: ${t.slice(0, 400)}`)
  }
  const text = await res.text()
  writeFileSync(CACHE_CSV, text, "utf-8")
  console.log(`✓  Wrote cache ${CACHE_CSV}`)
  return text
}

interface RowParsed {
  z: number
  n: number
  a: number
  abundance: number | null
  halfLifeRaw: string
  unitHl: string
  halfLifeSec: number | null
  decay1: string
}

export async function runIaeaIsotopes(): Promise<void> {
  const sym = loadSymbols()
  const csvText = await ensureCacheCsv()
  const lines = csvText.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length < 2) throw new Error("IAEA CSV looks empty")

  const headers = parseCsvLine(lines[0] as string)
  const iz = headerIndex(headers, "z")
  const in_ = headerIndex(headers, "n")
  const ia = headerIndex(headers, "a")
  const iAb = headerIndex(headers, "abundance")
  const iHl = headerIndex(headers, "half_life")
  const iUnitHl = headerIndex(headers, "unit_hl")
  const iHlSec = headerIndex(headers, "half_life_sec")
  const iDec1 = headerIndex(headers, "decay_1")

  if (iz === -1 || in_ === -1) {
    throw new Error(
      `Unexpected IAEA CSV headers (missing z/n). Got: ${headers.slice(0, 20).join(",")}…`,
    )
  }

  const byZ = new Map<number, RowParsed[]>()

  for (let li = 1; li < lines.length; li++) {
    const line = lines[li] as string
    const cols = parseCsvLine(line)
    const z = Math.round(parseNum(cols[iz] as string) ?? NaN)
    const n = Math.round(parseNum(cols[in_] as string) ?? NaN)
    if (!Number.isFinite(z) || !Number.isFinite(n) || z < 1 || z > 118) continue

    const a = ia === -1 ? z + n : Math.round(parseNum(cols[ia] as string) ?? z + n)
    const abundance = iAb === -1 ? null : parseNum(cols[iAb] as string)
    const halfLifeRaw = iHl === -1 ? "" : (cols[iHl] ?? "")
    const unitHl = iUnitHl === -1 ? "" : (cols[iUnitHl] ?? "")
    const halfLifeSec = iHlSec === -1 ? null : parseNum(cols[iHlSec] as string)
    const decay1 = iDec1 === -1 ? "" : (cols[iDec1] ?? "")

    const row: RowParsed = {
      z,
      n,
      a,
      abundance: abundance === null ? null : abundance,
      halfLifeRaw,
      unitHl,
      halfLifeSec,
      decay1,
    }
    const list = byZ.get(z) ?? []
    list.push(row)
    byZ.set(z, list)
  }

  const out: Record<string, { atomicNumber: number; isotopes: Isotope[] }> = {}

  for (let z = 1; z <= 118; z++) {
    const rows = byZ.get(z) ?? []
    const elSym = sym.get(z) ?? "?"

    const decorated = rows.map((r) => {
      const stable = isStableRow({
        halfLifeRaw: r.halfLifeRaw,
        halfLifeSec: r.halfLifeSec,
        decay1: r.decay1,
      })
      const abSort = r.abundance ?? -1
      return {
        r,
        stable,
        abSort,
      }
    })

    decorated.sort((x, y) => {
      if (y.abSort !== x.abSort) return y.abSort - x.abSort
      return y.r.a - x.r.a
    })

    const top = decorated.slice(0, 5)
    const isotopes: Isotope[] = top.map(({ r, stable }) => {
      const massNumber = r.a
      const symbol = `${massNumber}${elSym}`
      const hl = formatHalfLife(stable, r.halfLifeRaw, r.unitHl)
      return {
        massNumber,
        symbol,
        abundance: r.abundance,
        halfLife: hl,
        decayMode: normalizeDecay(r.decay1),
      }
    })

    out[String(z)] = { atomicNumber: z, isotopes }
  }

  ensureDirs()
  const target = join(OUTPUT_DIR, "isotopes.json")
  writeFileSync(target, JSON.stringify(out, null, 2), "utf-8")
  console.log(`✓  Wrote ${target}`)

  const c = out["6"]
  if (c) {
    console.log("Spot-check C isotopes:", c.isotopes.slice(0, 3))
  }
}

if (import.meta.main) {
  runIaeaIsotopes().catch((e: Error) => {
    console.error(e)
    process.exit(1)
  })
}
