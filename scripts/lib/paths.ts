import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))

/** Repo root (contains `src/`, `scripts/`). */
export const REPO_ROOT = join(here, "../..")

export const SCRIPTS_DIR = join(REPO_ROOT, "scripts")
export const OUTPUT_DIR = join(SCRIPTS_DIR, "output")
export const CACHE_DIR = join(SCRIPTS_DIR, "cache")
export const ELEMENTS_JSON = join(REPO_ROOT, "src/data/elements.json")

export const USER_AGENT = "elementum/1.0 (periodic-table-explorer data pipeline; bun)"

export function ensureDirs(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  mkdirSync(CACHE_DIR, { recursive: true })
}
