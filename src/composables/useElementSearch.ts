import { useDebounceFn, useEventListener } from "@vueuse/core";
import type { Ref } from "vue";
import { ref } from "vue";
import { useElementStore } from "@/stores/elementStore";
import type { Element, ElementCategory } from "@/types/element";

// ── Advanced search tokens (Epic I) ─────────────────────────────

export type ComparisonOp = ">" | "<" | ">=" | "<=";

export type ParsedSearchToken =
  | { kind: "period"; value: number; raw: string }
  | { kind: "group"; value: number; raw: string }
  | { kind: "electronegativity"; op: ComparisonOp; value: number; raw: string }
  | { kind: "meltingPoint"; op: ComparisonOp; value: number; raw: string }
  | {
      kind: "categoryShorthand";
      shorthand: "metal" | "noble" | "halogen" | "metalloid";
      raw: string;
    };

const METAL_CATEGORIES: readonly ElementCategory[] = [
  "alkali metal",
  "alkaline earth metal",
  "transition metal",
  "post-transition metal",
  "lanthanide",
  "actinide",
];

interface SegmentMatch {
  start: number;
  end: number;
  raw: string;
  token: ParsedSearchToken;
}

function normalizeComparisonOp(raw: string): ComparisonOp | null {
  if (raw === ">" || raw === "<" || raw === ">=" || raw === "<=") return raw;
  return null;
}

function compareWithOp(op: ComparisonOp, left: number, right: number): boolean {
  switch (op) {
    case ">":
      return left > right;
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
  }
}

function collectPeriodMatches(query: string): SegmentMatch[] {
  const re = /period\s*:\s*(\d+)/gi;
  const out: SegmentMatch[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(query)) !== null) {
    const value = Number.parseInt(m[1], 10);
    if (!Number.isFinite(value) || value < 1 || value > 10) continue;
    out.push({
      start: m.index,
      end: m.index + m[0].length,
      raw: m[0],
      token: { kind: "period", value, raw: m[0] },
    });
  }
  return out;
}

function collectGroupMatches(query: string): SegmentMatch[] {
  const re = /group\s*:\s*(\d+)/gi;
  const out: SegmentMatch[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(query)) !== null) {
    const value = Number.parseInt(m[1], 10);
    if (!Number.isFinite(value) || value < 1 || value > 18) continue;
    out.push({
      start: m.index,
      end: m.index + m[0].length,
      raw: m[0],
      token: { kind: "group", value, raw: m[0] },
    });
  }
  return out;
}

function collectElectronegativityMatches(query: string): SegmentMatch[] {
  const re = /\bEN\s*([<>]=?)\s*(-?[\d.]+(?:e[+-]?\d+)?)/gi;
  const out: SegmentMatch[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(query)) !== null) {
    const op = normalizeComparisonOp(m[1]);
    if (!op) continue;
    const value = Number.parseFloat(m[2]);
    if (!Number.isFinite(value)) continue;
    const raw = m[0];
    out.push({
      start: m.index,
      end: m.index + raw.length,
      raw,
      token: { kind: "electronegativity", op, value, raw },
    });
  }
  return out;
}

function collectMeltingPointMatches(query: string): SegmentMatch[] {
  const re = /\bmp\s*([<>]=?)\s*(-?[\d.]+(?:e[+-]?\d+)?)/gi;
  const out: SegmentMatch[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(query)) !== null) {
    const op = normalizeComparisonOp(m[1]);
    if (!op) continue;
    const value = Number.parseFloat(m[2]);
    if (!Number.isFinite(value)) continue;
    const raw = m[0];
    out.push({
      start: m.index,
      end: m.index + raw.length,
      raw,
      token: { kind: "meltingPoint", op, value, raw },
    });
  }
  return out;
}

function collectCategoryShorthandMatches(query: string): SegmentMatch[] {
  const re = /\b(metal|noble|halogen|metalloid)\b/gi;
  const out: SegmentMatch[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(query)) !== null) {
    const word = m[1].toLowerCase();
    let shorthand: "metal" | "noble" | "halogen" | "metalloid" | null = null;
    if (word === "metal") shorthand = "metal";
    else if (word === "noble") shorthand = "noble";
    else if (word === "halogen") shorthand = "halogen";
    else if (word === "metalloid") shorthand = "metalloid";
    if (!shorthand) continue;
    out.push({
      start: m.index,
      end: m.index + m[0].length,
      raw: m[0],
      token: { kind: "categoryShorthand", shorthand, raw: m[0] },
    });
  }
  return out;
}

function mergeNonOverlapping(matches: SegmentMatch[]): SegmentMatch[] {
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end - (a.end - a.start);
  });
  const picked: SegmentMatch[] = [];
  let lastEnd = -1;
  for (const seg of sorted) {
    if (seg.start < lastEnd) continue;
    picked.push(seg);
    lastEnd = seg.end;
  }
  picked.sort((a, b) => a.start - b.start);
  return picked;
}

function plainTextAfterRemovingMatches(
  query: string,
  matches: SegmentMatch[],
): string {
  let result = query;
  for (let i = matches.length - 1; i >= 0; i--) {
    const seg = matches[i];
    result = `${result.slice(0, seg.start)} ${result.slice(seg.end)}`;
  }
  return result.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Split query into structured tokens and remaining plain text (for name/symbol/number match). */
export function parseAdvancedSearchTokens(query: string): {
  tokens: ParsedSearchToken[];
  plainText: string;
} {
  const all: SegmentMatch[] = [
    ...collectPeriodMatches(query),
    ...collectGroupMatches(query),
    ...collectElectronegativityMatches(query),
    ...collectMeltingPointMatches(query),
    ...collectCategoryShorthandMatches(query),
  ];
  const merged = mergeNonOverlapping(all);
  const plainText = plainTextAfterRemovingMatches(query, merged);
  const tokens = merged.map((m) => m.token);
  return { tokens, plainText };
}

/** Human-readable chip label for a parsed token. */
export function formatSearchTokenLabel(token: ParsedSearchToken): string {
  switch (token.kind) {
    case "period":
      return `Period ${token.value}`;
    case "group":
      return `Group ${token.value}`;
    case "electronegativity":
      return `EN ${token.op} ${token.value}`;
    case "meltingPoint":
      return `MP ${token.op} ${token.value} K`;
    case "categoryShorthand":
      return token.shorthand.charAt(0).toUpperCase() + token.shorthand.slice(1);
  }
}

/** Remove first occurrence of a token's raw substring; normalizes spaces. */
export function removeSearchTokenFromQuery(
  query: string,
  rawToken: string,
): string {
  const idx = query.indexOf(rawToken);
  if (idx === -1) return query;
  const next = `${query.slice(0, idx)} ${query.slice(idx + rawToken.length)}`;
  return next.replace(/\s+/g, " ").trim();
}

function matchesCategoryShorthand(
  el: Element,
  shorthand: ParsedSearchToken & { kind: "categoryShorthand" },
): boolean {
  switch (shorthand.shorthand) {
    case "metalloid":
      return el.category === "metalloid";
    case "halogen":
      return el.category === "halogen";
    case "noble":
      return el.category === "noble gas";
    case "metal":
      return METAL_CATEGORIES.includes(el.category);
  }
}

/** Whether an element satisfies all structured tokens (AND). */
export function elementMatchesAdvancedTokens(
  el: Element,
  tokens: ParsedSearchToken[],
): boolean {
  for (const t of tokens) {
    switch (t.kind) {
      case "period":
        if (el.period !== t.value) return false;
        break;
      case "group":
        if (el.group !== t.value) return false;
        break;
      case "electronegativity": {
        if (el.electronegativity === null) return false;
        if (!compareWithOp(t.op, el.electronegativity, t.value)) return false;
        break;
      }
      case "meltingPoint": {
        if (el.meltingPoint === null) return false;
        if (!compareWithOp(t.op, el.meltingPoint, t.value)) return false;
        break;
      }
      case "categoryShorthand":
        if (!matchesCategoryShorthand(el, t)) return false;
        break;
    }
  }
  return true;
}

/**
 * Encapsulates search input state, debounced store updates, and the "/" focus shortcut.
 * Pass in the inputRef from the component so the composable can focus it.
 */
export function useElementSearch(inputRef: Ref<HTMLInputElement | null>) {
  const elementStore = useElementStore();

  // Local input value — kept in sync with store on each debounced flush
  const localQuery = ref(elementStore.searchQuery);

  const flushToStore = useDebounceFn((value: string) => {
    elementStore.setSearchQuery(value);
  }, 150);

  function onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    localQuery.value = value;
    flushToStore(value);
  }

  function clearSearch() {
    localQuery.value = "";
    elementStore.setSearchQuery("");
    inputRef.value?.focus();
  }

  /** Remove one structured token by its exact raw substring and update the store immediately. */
  function dismissParsedToken(rawToken: string) {
    const next = removeSearchTokenFromQuery(localQuery.value, rawToken);
    localQuery.value = next;
    elementStore.setSearchQuery(next);
    inputRef.value?.focus();
  }

  // "/" key focuses the search input from anywhere on the page
  useEventListener(document, "keydown", (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    // Don't hijack "/" when user is already typing in an input/textarea
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "/") {
      e.preventDefault();
      inputRef.value?.focus();
    }
  });

  return { localQuery, onInput, clearSearch, dismissParsedToken };
}
