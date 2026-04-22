import type { Element } from "@/types/element"

/** Minimal `Element` for component tests (matches `compare-table.spec` pattern). */
export function baseElement(overrides: Partial<Element>): Element {
  return {
    name: "Iron",
    symbol: "Fe",
    atomicNumber: 26,
    atomicMass: 55.845,
    category: "transition metal",
    xpos: 8,
    ypos: 4,
    period: 4,
    group: 8,
    block: "d",
    phase: "Solid",
    electronConfiguration: "[Ar] 3d6 4s2",
    electronConfigurationSemantic: "[Ar] 3d6 4s2",
    electronShells: [2, 8, 14, 2],
    electronegativity: 1.83,
    atomicRadius: 126,
    ionizationEnergy: 762.5,
    electronAffinity: 15.7,
    density: 7.874,
    meltingPoint: 1811,
    boilingPoint: 3134,
    oxidationStates: "0, +2, +3",
    spectralLines: [],
    funFacts: [],
    compounds: [],
    summary: "",
    discoverer: null,
    yearDiscovered: null,
    ...overrides,
  }
}
