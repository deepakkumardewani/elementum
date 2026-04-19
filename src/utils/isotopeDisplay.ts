/** True when the pipeline marks a nuclide as stable (half-life string). */
export function isStableHalfLife(halfLife: string): boolean {
  return halfLife.trim().toLowerCase() === "stable"
}

/** Human-readable decay mode (GHS / nuclear notation). */
export function formatDecayMode(mode: string | null): string {
  if (mode == null || mode.trim() === "") return "—"
  const m = mode.trim()
  if (m === "B-" || m === "B−") return "β⁻"
  if (m === "B+" || m === "B⁺") return "β⁺"
  return m
}

export function formatAbundancePercent(value: number | null): string {
  if (value == null) return "—"
  if (value < 0.01 && value > 0) return "<0.01%"
  return `${value.toFixed(2)}%`
}
