<script setup lang="ts">
import { useId, ref } from "vue"
import { ChevronDown, Info } from "lucide-vue-next"

const expanded = ref(false)
const panelId = useId()

const LEAD_SHORT =
  "Data are assembled from third‑party databases. Values may be incomplete, outdated, or wrong for a given element. This app is for education and exploration — not medical, legal, occupational, or regulatory advice."

const LEAD_REST =
  " Always verify critical facts with primary references and authoritative safety documentation."

function toggleExpand(): void {
  expanded.value = !expanded.value
}

function onHeaderClick(e: MouseEvent): void {
  const t = e.target as HTMLElement | null
  if (t?.closest("a")) return
  toggleExpand()
}
</script>

<template>
  <aside id="data-sources" class="data-sources" aria-label="Data sources and limitations">
    <div
      class="data-sources__header"
      role="button"
      tabindex="0"
      :aria-expanded="expanded"
      :aria-controls="expanded ? panelId : undefined"
      @click="onHeaderClick"
      @keydown.enter.prevent="toggleExpand"
      @keydown.space.prevent="toggleExpand"
    >
      <Info class="data-sources__icon" :size="15" aria-hidden="true" />
      <div class="data-sources__copy">
        <p v-if="!expanded" class="data-sources__lead data-sources__lead--short">
          {{ LEAD_SHORT }}
        </p>
        <div v-else :id="panelId" class="data-sources__expanded">
          <p class="data-sources__lead">
            {{ LEAD_SHORT }}{{ LEAD_REST }}
          </p>

          <details class="data-sources__details" @click.stop>
            <summary class="data-sources__summary">Where this information comes from</summary>
            <ul class="data-sources__list">
              <li>
                <strong>Discovery, dates, countries, “named after” style notes</strong> — taken from
                <a href="https://www.wikidata.org/" target="_blank" rel="noopener noreferrer">Wikidata</a>
                <ul class="data-sources__urls">
                  <li>
                    <a
                      class="data-sources__url"
                      href="https://query.wikidata.org/sparql"
                      target="_blank"
                      rel="noopener noreferrer"
                      >https://query.wikidata.org/sparql</a
                    >
                    — Wikidata Query Service
                  </li>
                </ul>
              </li>
              <li>
                <strong>Isotopes, half‑lives, decay hints</strong> — IAEA LiveChart “ground_states” CSV
                (<a
                  href="https://www-nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  >API guide</a
                >), data ultimately based on ENSDF evaluations.
                <ul class="data-sources__urls">
                  <li>
                    <a
                      class="data-sources__url"
                      href="https://www-nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all"
                      target="_blank"
                      rel="noopener noreferrer"
                      >https://www-nds.iaea.org/relnsd/v1/data?fields=ground_states&amp;nuclides=all</a
                    >
                    — www-nds.iaea.org/relnsd
                  </li>
                </ul>
              </li>
              <li>
                <strong>Broad hazard category badges</strong> — derived from PubChem compound records (GHS‑related
                text in the PUG View JSON), not a full SDS.
                <ul class="data-sources__urls">
                  <li>
                    Name → CID:
                    <code>GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{element}/cids/JSON</code>
                  </li>
                  <li>
                    GHS classification JSON:
                    <a
                      class="data-sources__url"
                      href="https://pubchem.ncbi.nlm.nih.gov/docs/pug-view"
                      target="_blank"
                      rel="noopener noreferrer"
                      >PUG View API</a
                    >
                    — https://pubchem.ncbi.nlm.nih.gov/docs/pug-view
                  </li>
                  <li>
                    Overview:
                    <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer"
                      >https://pubchem.ncbi.nlm.nih.gov/</a
                    >
                    — REST docs:
                    <a href="https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest" target="_blank" rel="noopener noreferrer"
                      >https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest</a
                    >
                  </li>
                </ul>
              </li>
            </ul>
          </details>
        </div>
      </div>
      <ChevronDown
        class="data-sources__chev"
        :size="18"
        :class="{ 'data-sources__chev--open': expanded }"
        aria-hidden="true"
      />
    </div>
  </aside>
</template>

<style scoped>
.data-sources {
  margin-top: 4rem;
  border-top: 1px solid var(--bg-border);
  background: color-mix(in srgb, var(--bg-surface) 96%, var(--bg-base));
  padding: 0.75rem 1.5rem;
  font-size: var(--text-xs);
  line-height: 1.55;
  color: var(--text-secondary);
}

.data-sources__header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  text-align: left;
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
}

.data-sources__header:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 3px;
  border-radius: 2px;
}

.data-sources__copy {
  flex: 1;
  min-width: 0;
}

.data-sources__icon {
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: color-mix(in srgb, var(--accent-cyan) 85%, var(--text-secondary));
}

.data-sources__lead {
  margin: 0;
  max-width: 72rem;
}

.data-sources__lead--short {
  margin: 0;
}

.data-sources__expanded {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-sources__chev {
  flex-shrink: 0;
  margin-top: 0.05rem;
  color: var(--accent-cyan);
  transition: transform 0.2s ease;
}

.data-sources__chev--open {
  transform: rotate(180deg);
}

.data-sources__details {
  margin-top: 0.25rem;
}

.data-sources__summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-primary);
  list-style: none;
}

.data-sources__summary::-webkit-details-marker {
  display: none;
}

.data-sources__summary::before {
  content: "▸ ";
  display: inline-block;
  transition: transform 0.15s ease;
  color: var(--accent-cyan);
}

details[open] > .data-sources__summary::before {
  transform: rotate(90deg);
}

.data-sources__list {
  margin: 0.5rem 0 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.data-sources__list strong {
  font-weight: 600;
  color: var(--text-primary);
}

.data-sources__urls {
  margin: 0.35rem 0 0;
  padding-left: 1rem;
  list-style: disc;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.data-sources code {
  font-family: var(--font-mono);
  font-size: 0.92em;
  word-break: break-word;
  color: color-mix(in srgb, var(--text-primary) 88%, var(--text-secondary));
}

.data-sources__url {
  word-break: break-all;
}

.data-sources a {
  color: var(--accent-cyan);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.data-sources a:hover {
  text-decoration-thickness: 2px;
}

@media (max-width: 1023px) {
  .data-sources {
    display: none;
  }
}
</style>
