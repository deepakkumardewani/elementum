/** Pure helpers for the Bohr-style 3D atom scene (TresJS). */

export const MAX_NUCLEUS_PARTICLES = 24

export const MAX_ELECTRONS_PER_SHELL = 32

const PROTON_COLOR = "#ef4444"
const NEUTRON_COLOR = "#3b82f6"

/** Deterministic PRNG for stable nucleus layout across re-renders (seed from Z). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Uniform random point inside a sphere of given radius (deterministic rng). */
function randomPointInSphere(radius: number, rng: () => number): [number, number, number] {
  const u = rng()
  const v = rng()
  const w = rng()
  const theta = 2 * Math.PI * u
  const phi = Math.acos(2 * v - 1)
  const rad = radius * Math.cbrt(w)
  const sinPhi = Math.sin(phi)
  return [rad * sinPhi * Math.cos(theta), rad * Math.cos(phi), rad * sinPhi * Math.sin(theta)]
}

export interface NucleusParticle {
  pos: [number, number, number]
  color: string
}

/**
 * Build proton (red) and neutron (blue) spheres for the nucleus visualization.
 * Heavy nuclei are downsampled to MAX_NUCLEUS_PARTICLES with proportional mix.
 */
export function buildNucleus(atomicNumber: number, atomicMass: number): NucleusParticle[] {
  const protons = atomicNumber
  const neutrons = Math.max(0, Math.round(atomicMass) - atomicNumber)
  const total = protons + neutrons

  let showProtons: number
  let showNeutrons: number

  if (total <= MAX_NUCLEUS_PARTICLES) {
    showProtons = protons
    showNeutrons = neutrons
  } else {
    showProtons = Math.round((protons / total) * MAX_NUCLEUS_PARTICLES)
    showNeutrons = MAX_NUCLEUS_PARTICLES - showProtons
  }

  const nucleusRadius = 0.18 * Math.cbrt(atomicNumber / 6)
  const rng = mulberry32(atomicNumber * 1_000_003 + 97_331)

  const out: NucleusParticle[] = []
  for (let i = 0; i < showProtons; i++) {
    out.push({
      pos: randomPointInSphere(nucleusRadius, rng),
      color: PROTON_COLOR,
    })
  }
  for (let i = 0; i < showNeutrons; i++) {
    out.push({
      pos: randomPointInSphere(nucleusRadius, rng),
      color: NEUTRON_COLOR,
    })
  }
  return out
}

/**
 * Electron positions in the shell group's local XZ plane (Y up).
 * Shells with more than 16 e⁻ use two rings; at most MAX_ELECTRONS_PER_SHELL rendered.
 */
export function electronPositions(radius: number, count: number): Array<[number, number, number]> {
  const n = Math.min(count, MAX_ELECTRONS_PER_SHELL)
  if (n <= 0) return []

  if (n <= 16) {
    return Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n
      return [radius * Math.cos(angle), 0, radius * Math.sin(angle)] as [number, number, number]
    })
  }

  const innerCount = 10
  const outerCount = n - innerCount
  const outerRadius = radius + 0.08

  const inner: Array<[number, number, number]> = Array.from({ length: innerCount }, (_, i) => {
    const angle = (2 * Math.PI * i) / innerCount
    return [radius * Math.cos(angle), 0, radius * Math.sin(angle)] as [number, number, number]
  })

  const phase = Math.PI / Math.max(outerCount, 1)
  const outer: Array<[number, number, number]> = Array.from({ length: outerCount }, (_, i) => {
    const angle = (2 * Math.PI * i) / outerCount + phase
    return [outerRadius * Math.cos(angle), 0, outerRadius * Math.sin(angle)] as [
      number,
      number,
      number,
    ]
  })

  return [...inner, ...outer]
}
