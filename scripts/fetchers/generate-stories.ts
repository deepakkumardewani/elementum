#!/usr/bin/env bun
/**
 * DP-4 — Claude API: storyHeadline + storyBody per element (prompt cache on system prompt).
 * Requires ANTHROPIC_API_KEY. Run: bun run scripts/fetchers/generate-stories.ts
 */

import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { ELEMENTS_JSON, ensureDirs, OUTPUT_DIR } from "../lib/paths.ts"

interface ElementStub {
  name: string
  symbol: string
  atomicNumber: number
  summary: string
  discoverer: string | null
  yearDiscovered: number | string | null
}

interface StoryRecord {
  atomicNumber: number
  storyHeadline: string | null
  storyBody: string | null
}

const SYSTEM = `You are a careful chemistry writer for Elementum, an educational periodic table app.
Return ONLY valid JSON with keys storyHeadline and storyBody.
storyHeadline: at most 10 words. storyBody: 2–3 factual sentences grounded in the facts provided.
No markdown, no extra keys, no preface.`

function extractJsonObject(text: string): string {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object in model response")
  }
  return text.slice(start, end + 1)
}

async function callClaude(
  apiKey: string,
  userPayload: string,
): Promise<Omit<StoryRecord, "atomicNumber">> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 400,
      system: [
        {
          type: "text" as const,
          text: SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPayload,
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Anthropic ${res.status}: ${t.slice(0, 400)}`)
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[]
  }
  const textBlock = data.content?.find((c) => c.type === "text")
  const raw = textBlock?.text ?? ""
  const jsonStr = extractJsonObject(raw)
  const parsed = JSON.parse(jsonStr) as {
    storyHeadline?: string
    storyBody?: string
  }

  return {
    storyHeadline: parsed.storyHeadline ?? null,
    storyBody: parsed.storyBody ?? null,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function runGenerateStories(): Promise<void> {
  const apiKey = Bun.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in the environment and retry.")
    process.exit(1)
  }

  ensureDirs()
  const els = JSON.parse(readFileSync(ELEMENTS_JSON, "utf-8")) as ElementStub[]
  const out: Record<string, StoryRecord> = {}

  for (const el of els) {
    const userPayload = JSON.stringify(
      {
        atomicNumber: el.atomicNumber,
        name: el.name,
        symbol: el.symbol,
        summary: el.summary,
        discoverer: el.discoverer,
        yearDiscovered: el.yearDiscovered,
        task: 'Reply with JSON: {"storyHeadline":"...","storyBody":"..."}',
      },
      null,
      2,
    )

    let saved: StoryRecord | null = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const part = await callClaude(apiKey, userPayload)
        saved = { atomicNumber: el.atomicNumber, ...part }
        console.log(`✓ #${el.atomicNumber} ${el.symbol}`)
        break
      } catch (e) {
        const msg = (e as Error).message
        console.warn(`Retry ${attempt}/3 #${el.atomicNumber}: ${msg}`)
        if (attempt < 3) await sleep(800 * attempt)
      }
    }

    if (!saved) {
      saved = {
        atomicNumber: el.atomicNumber,
        storyHeadline: null,
        storyBody: null,
      }
      console.warn(`✗ gave up on #${el.atomicNumber}`)
    }

    out[String(el.atomicNumber)] = saved
    await sleep(250)
  }

  const target = join(OUTPUT_DIR, "stories.json")
  writeFileSync(target, JSON.stringify(out, null, 2), "utf-8")
  console.log(`✓  Wrote ${target}`)
}

if (import.meta.main) {
  runGenerateStories().catch((e: Error) => {
    console.error(e)
    process.exit(1)
  })
}
