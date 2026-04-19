/**
 * Parse chemical formula strings into element-symbol → stoichiometric counts.
 * Supports parentheses, nested groups, and implicit 1 where no coefficient is given.
 */

export type ParseSuccess = {
  kind: "ok"
  /** Element symbol → count in the formula unit */
  counts: ReadonlyMap<string, number>
}

export type ParseError = {
  kind: "error"
  message: string
}

export type ParseResult = ParseSuccess | ParseError

export function buildSymbolSet(symbols: readonly string[]): Set<string> {
  return new Set(symbols)
}

function skipSpaces(s: string, i: number): number {
  let j = i
  while (j < s.length && /\s/.test(s.charAt(j))) j += 1
  return j
}

function readNumber(s: string, i: number): { value: number; next: number } {
  const start = i
  let j = i
  while (j < s.length) {
    const c = s.charAt(j)
    if (c < "0" || c > "9") break
    j += 1
  }
  if (j === start) return { value: 1, next: start }
  const value = Number.parseInt(s.slice(start, j), 10)
  if (!Number.isFinite(value) || value <= 0) {
    return { value: 0, next: j }
  }
  return { value, next: j }
}

function readSymbol(
  s: string,
  i: number,
  validSymbols: Set<string>,
): { sym: string; next: number } | null {
  if (i >= s.length) return null
  const c0 = s.charAt(i)
  if (c0 < "A" || c0 > "Z") return null

  if (i + 1 < s.length) {
    const c1 = s.charAt(i + 1)
    if (c1 >= "a" && c1 <= "z") {
      const two = `${c0}${c1}`
      if (validSymbols.has(two)) return { sym: two, next: i + 2 }
    }
  }

  if (validSymbols.has(c0)) return { sym: c0, next: i + 1 }
  return null
}

function mergeInto(target: Map<string, number>, source: Map<string, number>, multiplier: number) {
  for (const [sym, n] of source) {
    target.set(sym, (target.get(sym) ?? 0) + n * multiplier)
  }
}

/**
 * @param input - Raw formula, e.g. `H2O`, `Fe2(SO4)3`
 * @param validSymbols - All valid one- and two-letter element symbols
 */
export function parseChemicalFormula(input: string, validSymbols: Set<string>): ParseResult {
  const s = input.trim()
  if (!s) {
    return { kind: "error", message: "Enter a chemical formula." }
  }

  const stack: Map<string, number>[] = [new Map()]
  let i = 0

  while (i < s.length) {
    i = skipSpaces(s, i)
    if (i >= s.length) break

    const ch = s.charAt(i)
    if (ch === "(") {
      stack.push(new Map())
      i += 1
      continue
    }

    if (ch === ")") {
      if (stack.length <= 1) {
        return {
          kind: "error",
          message: "Unexpected “)” — check parentheses.",
        }
      }
      const inner = stack.pop()
      if (inner === undefined) {
        return {
          kind: "error",
          message: "Unexpected “)” — check parentheses.",
        }
      }
      i = skipSpaces(s, i + 1)
      const num = readNumber(s, i)
      if (num.value === 0) {
        return { kind: "error", message: "Invalid number after “)”." }
      }
      const parent = stack[stack.length - 1]
      if (parent === undefined) {
        return {
          kind: "error",
          message: "Unexpected “)” — check parentheses.",
        }
      }
      mergeInto(parent, inner, num.value)
      i = num.next
      continue
    }

    const sym = readSymbol(s, i, validSymbols)
    if (!sym) {
      return {
        kind: "error",
        message: `Unknown symbol near “${s.slice(i, i + 6)}…”.`,
      }
    }
    i = skipSpaces(s, sym.next)
    const num = readNumber(s, i)
    if (num.value === 0) {
      return { kind: "error", message: `Invalid subscript after ${sym.sym}.` }
    }
    const top = stack[stack.length - 1]
    if (top === undefined) {
      return { kind: "error", message: "Invalid formula structure." }
    }
    top.set(sym.sym, (top.get(sym.sym) ?? 0) + num.value)
    i = num.next
  }

  if (stack.length > 1) {
    return { kind: "error", message: "Unclosed “(” in formula." }
  }

  const counts = stack[0]
  if (counts === undefined) {
    return { kind: "error", message: "Invalid formula structure." }
  }
  if (counts.size === 0) {
    return { kind: "error", message: "No elements found in formula." }
  }

  return { kind: "ok", counts: new Map(counts) }
}

/** Combines parse + mass lookup; returns total g/mol on success. */
export function computeMolarMassGPerMol(
  input: string,
  validSymbols: Set<string>,
  symbolToAtomicMass: ReadonlyMap<string, number>,
): { kind: "ok"; total: number; counts: ReadonlyMap<string, number> } | ParseError {
  const parsed = parseChemicalFormula(input, validSymbols)
  if (parsed.kind === "error") return parsed

  let total = 0
  for (const [sym, n] of parsed.counts) {
    const mass = symbolToAtomicMass.get(sym)
    if (mass === undefined) {
      return { kind: "error", message: `No atomic mass for ${sym}.` }
    }
    total += mass * n
  }
  return { kind: "ok", total, counts: parsed.counts }
}
