import { describe, expect, it } from "vitest";
import {
  elementMatchesAdvancedTokens,
  formatSearchTokenLabel,
  parseAdvancedSearchTokens,
  removeSearchTokenFromQuery,
} from "@/composables/useElementSearch";
import elementsData from "@/data/elements.json";
import type { Element } from "@/types/element";

const elements = elementsData as Element[];

function symbolsMatching(query: string): string[] {
  const { tokens, plainText } = parseAdvancedSearchTokens(query);
  return elements
    .filter((el) => {
      const plainOk =
        plainText === "" ||
        el.name.toLowerCase().includes(plainText) ||
        el.symbol.toLowerCase().includes(plainText) ||
        String(el.atomicNumber).includes(plainText);
      const structOk =
        tokens.length === 0 || elementMatchesAdvancedTokens(el, tokens);
      return plainOk && structOk;
    })
    .map((el) => el.symbol)
    .sort();
}

describe("parseAdvancedSearchTokens", () => {
  it("extracts period, EN comparison, and clears plain text", () => {
    const { tokens, plainText } =
      parseAdvancedSearchTokens("period:2 EN > 3.0");
    expect(tokens).toHaveLength(2);
    expect(tokens[0].kind).toBe("period");
    expect(tokens[1].kind).toBe("electronegativity");
    expect(plainText).toBe("");
  });

  it("leaves plain text when no tokens match", () => {
    const { tokens, plainText } = parseAdvancedSearchTokens("  carbon  ");
    expect(tokens).toHaveLength(0);
    expect(plainText).toBe("carbon");
  });

  it("strips tokens but keeps plain words", () => {
    const { tokens, plainText } =
      parseAdvancedSearchTokens("nitrogen period:2");
    expect(tokens.some((t) => t.kind === "period" && t.value === 2)).toBe(true);
    expect(plainText).toBe("nitrogen");
  });

  it("formats chip labels", () => {
    const { tokens } = parseAdvancedSearchTokens("group:18 noble");
    expect(tokens.map(formatSearchTokenLabel)).toEqual(["Group 18", "Noble"]);
  });
});

describe("elementMatchesAdvancedTokens", () => {
  it("period:2 EN > 3.0 yields N, O, F", () => {
    expect(symbolsMatching("period:2 EN > 3.0")).toEqual(["F", "N", "O"]);
  });

  it("noble matches noble gases in dataset", () => {
    const got = symbolsMatching("noble");
    expect(got).toEqual(["Ar", "He", "Kr", "Ne", "Rn", "Xe"]);
  });

  it("mp > 3000 matches refractory metals in dataset", () => {
    expect(symbolsMatching("mp > 3000")).toEqual(["Os", "Re", "Ta", "W"]);
  });

  it("metal shorthand excludes nonmetals", () => {
    const got = new Set(symbolsMatching("metal"));
    expect(got.has("Fe")).toBe(true);
    expect(got.has("O")).toBe(false);
  });

  it("halogen matches halogens", () => {
    const got = symbolsMatching("halogen");
    expect(got).toEqual(["Br", "Cl", "F", "I"]);
  });

  it("EN < 1 includes low-EN metals", () => {
    const got = symbolsMatching("EN < 1");
    expect(got).toContain("Fr");
    expect(got).toContain("Cs");
    expect(got).not.toContain("F");
  });
});

describe("removeSearchTokenFromQuery", () => {
  it("removes first raw token occurrence and trims", () => {
    expect(removeSearchTokenFromQuery("period:2 EN > 3", "period:2")).toBe(
      "EN > 3",
    );
  });
});
