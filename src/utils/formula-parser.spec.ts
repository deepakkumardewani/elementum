import { describe, expect, it } from "vitest";
import elements from "@/data/elements.json";
import type { Element } from "@/types/element";
import {
  buildSymbolSet,
  computeMolarMassGPerMol,
  parseChemicalFormula,
} from "@/utils/formulaParser";

const els = elements as Element[];
const SYMBOLS = buildSymbolSet(els.map((e) => e.symbol));
const MASS = new Map(els.map((e) => [e.symbol, e.atomicMass] as const));

describe("parseChemicalFormula", () => {
  it("parses H2O", () => {
    const r = parseChemicalFormula("H2O", SYMBOLS);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.counts.get("H")).toBe(2);
    expect(r.counts.get("O")).toBe(1);
  });

  it("parses C6H12O6", () => {
    const r = parseChemicalFormula("C6H12O6", SYMBOLS);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.counts.get("C")).toBe(6);
    expect(r.counts.get("H")).toBe(12);
    expect(r.counts.get("O")).toBe(6);
  });

  it("parses Fe2(SO4)3", () => {
    const r = parseChemicalFormula("Fe2(SO4)3", SYMBOLS);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.counts.get("Fe")).toBe(2);
    expect(r.counts.get("S")).toBe(3);
    expect(r.counts.get("O")).toBe(12);
  });

  it("parses nested parentheses Mg(OH)2", () => {
    const r = parseChemicalFormula("Mg(OH)2", SYMBOLS);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.counts.get("Mg")).toBe(1);
    expect(r.counts.get("O")).toBe(2);
    expect(r.counts.get("H")).toBe(2);
  });

  it("parses single atom Na", () => {
    const r = parseChemicalFormula("Na", SYMBOLS);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.counts.get("Na")).toBe(1);
  });

  it("prefers two-letter symbols (He not H+e)", () => {
    const r = parseChemicalFormula("He", SYMBOLS);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.counts.get("He")).toBe(1);
    expect(r.counts.get("H")).toBeUndefined();
  });

  it("allows spaces between tokens", () => {
    const r = parseChemicalFormula("H 2 O", SYMBOLS);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.counts.get("H")).toBe(2);
    expect(r.counts.get("O")).toBe(1);
  });

  it("rejects unknown symbols", () => {
    const r = parseChemicalFormula("XYZ", SYMBOLS);
    expect(r.kind).toBe("error");
  });

  it("rejects empty input", () => {
    const r = parseChemicalFormula("   ", SYMBOLS);
    expect(r.kind).toBe("error");
  });

  it("rejects unclosed parenthesis", () => {
    const r = parseChemicalFormula("Fe(SO4", SYMBOLS);
    expect(r.kind).toBe("error");
  });

  it("rejects unexpected closing paren", () => {
    const r = parseChemicalFormula(")", SYMBOLS);
    expect(r.kind).toBe("error");
  });
});

describe("computeMolarMassGPerMol", () => {
  it("matches literature values for H2O, glucose, and iron sulfate", () => {
    const h2o = computeMolarMassGPerMol("H2O", SYMBOLS, MASS);
    expect(h2o.kind).toBe("ok");
    if (h2o.kind !== "ok") return;
    expect(h2o.total).toBeCloseTo(18.015, 2);

    const glu = computeMolarMassGPerMol("C6H12O6", SYMBOLS, MASS);
    expect(glu.kind).toBe("ok");
    if (glu.kind !== "ok") return;
    expect(glu.total).toBeCloseTo(180.16, 1);

    const fes = computeMolarMassGPerMol("Fe2(SO4)3", SYMBOLS, MASS);
    expect(fes.kind).toBe("ok");
    if (fes.kind !== "ok") return;
    expect(fes.total).toBeCloseTo(399.88, 1);
  });
});
