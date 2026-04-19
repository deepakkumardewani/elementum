<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"
import { storeToRefs } from "pinia"
import { useElementStore } from "@/stores/elementStore"
import {
  buildSymbolSet,
  computeMolarMassGPerMol,
} from "@/utils/formulaParser"
import type { Element } from "@/types/element"

const elementStore = useElementStore()
const { elements } = storeToRefs(elementStore)
const { setToolHighlight, clearToolHighlight } = elementStore

const formula = ref("")

const validSymbols = computed(() =>
  buildSymbolSet(elements.value.map((e) => e.symbol)),
)

const symbolToElement = computed(() => {
  const m = new Map<string, Element>()
  for (const el of elements.value) {
    m.set(el.symbol, el)
  }
  return m
})

const symbolToAtomicMass = computed(() => {
  const m = new Map<string, number>()
  for (const el of elements.value) {
    m.set(el.symbol, el.atomicMass)
  }
  return m
})

const result = computed(() => {
  if (elements.value.length === 0) {
    return { kind: "idle" as const }
  }
  if (!formula.value.trim()) {
    return { kind: "empty" as const }
  }
  return computeMolarMassGPerMol(
    formula.value,
    validSymbols.value,
    symbolToAtomicMass.value,
  )
})

const rows = computed(() => {
  if (result.value.kind !== "ok") {
    return []
  }
  const out: {
    symbol: string
    name: string
    count: number
    atomicMass: number
    contribution: number
  }[] = []
  for (const [symbol, count] of result.value.counts) {
    const el = symbolToElement.value.get(symbol)
    if (!el) continue
    const contribution = el.atomicMass * count
    out.push({
      symbol,
      name: el.name,
      count,
      atomicMass: el.atomicMass,
      contribution,
    })
  }
  out.sort((a, b) => a.symbol.localeCompare(b.symbol))
  return out
})

watch(
  [result, symbolToElement],
  () => {
    if (result.value.kind !== "ok") {
      clearToolHighlight()
      return
    }
    const nums: number[] = []
    for (const [sym] of result.value.counts) {
      const el = symbolToElement.value.get(sym)
      if (el) nums.push(el.atomicNumber)
    }
    setToolHighlight(nums)
  },
  { immediate: true },
)

onUnmounted(() => {
  clearToolHighlight()
})
</script>

<template>
  <section class="molar-mass-tool" aria-labelledby="molar-mass-heading">
    <div class="tool-field">
      <label id="molar-mass-heading" class="tool-label" for="formula-input">
        Chemical formula
      </label>
      <input
        id="formula-input"
        v-model="formula"
        type="text"
        class="formula-input"
        placeholder="e.g. H2O, C6H12O6, Fe2(SO4)3"
        autocomplete="off"
        spellcheck="false"
        aria-describedby="molar-mass-hint"
      />
      <p id="molar-mass-hint" class="field-hint">
        Use element symbols and subscripts. Parentheses group repeats, e.g.
        <kbd>Fe2(SO4)3</kbd>.
      </p>
    </div>

    <p v-if="elements.length === 0" class="status-muted" role="status">
      Loading element data…
    </p>

    <template v-else-if="result.kind === 'empty'">
      <p class="status-muted" role="status">
        Enter a formula to see molar mass and a breakdown by element.
      </p>
    </template>

    <p
      v-else-if="result.kind === 'error'"
      class="status-error"
      role="alert"
    >
      {{ result.message }}
    </p>

    <template v-else-if="result.kind === 'ok'">
      <div class="total-row" role="status">
        <span class="total-label">Molar mass</span>
        <span class="total-value">{{ result.total.toFixed(3) }} g/mol</span>
      </div>

      <div class="table-wrap">
        <table class="breakdown-table">
          <thead>
            <tr>
              <th scope="col">Element</th>
              <th scope="col">Name</th>
              <th scope="col" class="num">Count</th>
              <th scope="col" class="num">Atomic mass (u)</th>
              <th scope="col" class="num">Contribution (g/mol)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.symbol">
              <td class="mono">{{ row.symbol }}</td>
              <td>{{ row.name }}</td>
              <td class="num">{{ row.count }}</td>
              <td class="num">{{ row.atomicMass.toFixed(4) }}</td>
              <td class="num">{{ row.contribution.toFixed(4) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="table-footnote">
        Open the main periodic table to see these elements highlighted.
      </p>
    </template>
  </section>
</template>

<style scoped>
.molar-mass-tool {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 720px;
}

.tool-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tool-label {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.formula-input {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--bg-border);
  background: var(--bg-surface);
  color: var(--text-primary);
}

.formula-input:focus {
  outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
  outline-offset: 1px;
}

.field-hint {
  font-size: var(--text-2xs);
  color: var(--text-muted);
  line-height: 1.45;
}

.field-hint kbd {
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid var(--bg-border);
  background: color-mix(in srgb, var(--bg-surface) 88%, var(--bg-base));
}

.status-muted,
.status-error {
  font-size: var(--text-sm);
  margin: 0;
}

.status-error {
  color: var(--text-danger, #e11d48);
}

.total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--bg-border);
  background: color-mix(in srgb, var(--bg-surface) 92%, var(--bg-base));
}

.total-label {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.total-value {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--bg-border);
}

.breakdown-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-xs);
}

.breakdown-table th,
.breakdown-table td {
  padding: 0.5rem 0.65rem;
  text-align: left;
  border-bottom: 1px solid var(--bg-border);
}

.breakdown-table thead th {
  font-weight: 600;
  color: var(--text-muted);
  background: color-mix(in srgb, var(--bg-surface) 94%, var(--bg-base));
}

.breakdown-table tbody tr:last-child td {
  border-bottom: none;
}

.mono {
  font-family: var(--font-mono);
  font-weight: 700;
}

.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.table-footnote {
  font-size: var(--text-2xs);
  color: var(--text-muted);
  margin: 0;
}
</style>
