/**
 * Pauling electronegativity difference → bond type (qualitative textbook thresholds).
 */

export type BondKind = "nonpolar-covalent" | "polar-covalent" | "ionic"

export interface BondAnalysis {
  /** Absolute EN difference */
  difference: number
  kind: BondKind
  label: string
  explanation: string
}

const NONPOLAR_LT = 0.4
const IONIC_GT = 1.7

export function analyzeBond(
  enA: number | null,
  enB: number | null,
): { ok: true; analysis: BondAnalysis } | { ok: false; reason: string } {
  if (enA === null || enB === null) {
    return {
      ok: false,
      reason:
        "Electronegativity is missing for one or both elements — bond type can’t be estimated.",
    }
  }

  const difference = Math.abs(enA - enB)

  let kind: BondKind
  let label: string
  let explanation: string

  if (difference < NONPOLAR_LT) {
    kind = "nonpolar-covalent"
    label = "Nonpolar covalent"
    explanation = "Electronegativity difference is very small; electrons are shared almost evenly."
  } else if (difference <= IONIC_GT) {
    kind = "polar-covalent"
    label = "Polar covalent"
    explanation =
      "Shared electrons are pulled toward the more electronegative atom, creating a dipole."
  } else {
    kind = "ionic"
    label = "Ionic"
    explanation = "Large EN difference — electron transfer dominates, typical of a salt-like bond."
  }

  return {
    ok: true,
    analysis: {
      difference,
      kind,
      label,
      explanation,
    },
  }
}

/** Prefer exact string matches in both lists, then a compound line mentioning both symbols. */
export function findLikelySharedCompound(
  elA: { symbol: string; compounds: string[] },
  elB: { symbol: string; compounds: string[] },
): string | null {
  const setA = new Set(elA.compounds)
  for (const c of elB.compounds) {
    if (setA.has(c)) {
      return c
    }
  }

  const symA = elA.symbol
  const symB = elB.symbol
  const all = [...new Set([...elA.compounds, ...elB.compounds])]

  for (const line of all) {
    if (lineIncludesBothSymbols(line, symA, symB)) {
      return line
    }
  }

  return null
}

function lineIncludesBothSymbols(line: string, symA: string, symB: string): boolean {
  const a = symbolRegex(symA)
  const b = symbolRegex(symB)
  return a.test(line) && b.test(line)
}

/** Match element symbol as a whole token (not a prefix of another symbol in text). */
function symbolRegex(sym: string): RegExp {
  if (sym.length === 1) {
    return new RegExp(`(?:^|[^A-Za-z])${sym}(?![a-z])`, "")
  }
  return new RegExp(sym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "")
}
