#!/usr/bin/env bun
/**
 * DP-5 — Orchestrator: run Wikidata, IAEA isotopes, PubChem, and (optionally) Claude stories in parallel.
 * Use `--skip-stories` to emit a stub `stories.json` without ANTHROPIC_API_KEY.
 *
 * Run: bun run scripts/collect-data.ts
 *      bun run scripts/collect-data.ts --skip-stories
 */

import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { runGenerateStories } from "./fetchers/generate-stories.ts"
import { runIaeaIsotopes } from "./fetchers/iaea-isotopes.ts"
import { runPubchem } from "./fetchers/pubchem.ts"
import { runWikidata } from "./fetchers/wikidata.ts"
import { ensureDirs, OUTPUT_DIR } from "./lib/paths.ts"

function writeStubStories(): void {
  const out: Record<string, { atomicNumber: number; storyHeadline: null; storyBody: null }> = {}
  for (let z = 1; z <= 118; z++) {
    out[String(z)] = { atomicNumber: z, storyHeadline: null, storyBody: null }
  }
  writeFileSync(join(OUTPUT_DIR, "stories.json"), JSON.stringify(out, null, 2), "utf-8")
  console.log("✓  Wrote stub scripts/output/stories.json (--skip-stories)")
}

async function main(): Promise<void> {
  const skipStories = process.argv.includes("--skip-stories")
  ensureDirs()

  if (skipStories) {
    writeStubStories()
  }

  const tasks: Promise<unknown>[] = [runWikidata(), runIaeaIsotopes(), runPubchem()]
  if (!skipStories) {
    tasks.push(runGenerateStories())
  }

  await Promise.all(tasks)
  console.log("✓  collect-data: all fetchers finished")
}

main().catch((e: Error) => {
  console.error(e)
  process.exit(1)
})
