# <p align="center">⚛️ Elementum</p>

<p align="center">
  <strong>A production-grade, highly performant scientific data visualization platform.</strong><br />
  Engineered to deliver comprehensive chemical datasets with a responsive UI and high-fidelity rendering.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vitest-293%20tests%20passing-success?style=for-the-badge" alt="Vitest: 293 tests passing" />
  <img src="https://img.shields.io/badge/coverage-%7E94%25%20statements%20%28scoped%29-success?style=for-the-badge" alt="About 94% statement coverage for configured paths" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue%203-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/ApexCharts-008FFB?style=for-the-badge&logoColor=white" alt="ApexCharts" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black" alt="GSAP" />
</p>

---

## 🏗️ Architecture & Overview

**Elementum** represents a strict, architecture-first approach to chemical data visualization. Built to transcend standard periodic tables, this project exhibits production-ready software engineering practices—featuring automated data aggregation pipelines, robust static typing, 3D graphics, and complex state management. It provides scientists, engineers, and students immediate access to exhaustively enriched elemental properties without compromising UI responsiveness or rendering performance.

## 🚀 Core Engineering Features

### 1. Automated Data Aggregation Pipeline
Elementum augments element data through a **build-time enrichment pipeline** (TypeScript scripts, typically run with **Bun**), producing merged JSON consumed by the app.
- Fetchers pull from **PubChem**, **Wikidata**, and **IAEA** LiveChart (see `scripts/fetchers/` and `scripts/collect-data.ts`).
- Automates the resolution, merging, and type-checking of thousands of properties including isotope distributions, historical etymology, and rigorous GHS safety/hazard classifications.

### 2. High-Performance Spatial Search
A sophisticated query engine that updates the periodic grid in real-time.
- Features **syntax-assisted search** and dynamic **filter chips**.
- Capable of deeply nested querying (e.g., matching by phase, discovery year, or elemental family) while utilizing CSS-accelerated dimming to preserve structural grid context without causing costly DOM reflows.

### 3. Hardware-Accelerated Visualizations
Leveraging WebGL and Three.js to provide precise, high-performance structural representations.
- **3D Bohr Atom Models:** Real-time electron shell orbital rendering featuring accurate and dynamically scaling nucleus compositions.
- **Emission Spectral Lines:** Wavelength-to-sRGB mapping via **Bruton’s** spectrum algorithm (see `src/utils/wavelength.ts`), including edge falloff in the near-UV and deep-red ranges.

### 4. Comprehensive Chemistry Tooling Studio
An extensible suite of programmatic chemistry utilities designed to algorithmically process molecular data.
- **Lexical Formula Parser:** Lexically analyzes and statically breaks down complex molecular structures, robustly handling parenthetical nesting and variable stoichiometric multipliers.
- **Molar Mass Calculator:** Computes highly accurate molar masses based on parsed formula distributions.
- **Bond Type & Compound Predictors:** Evaluates Pauling electronegativity differences and empirical matrices to scientifically forecast molecular bonding behaviors.

### 5. Advanced Data Analytics & Comparison
- **Exhaustive Element Profiles:** Tabbed modal interfaces detailing comprehensive subsets of data such as active isotopes, crystalline structures, real-world use cases, and strict safety guidelines.
- **Multi-metric Comparison Engine:** A high-density, matrix-driven dashboard to contrast physical properties like Mohs hardness, thermal conductivity, and van der Waals radii side-by-side.
- **Trend Visualization:** Maps cross-domain property distributions (atomic radius, electronegativity) natively across the periodic layout using interactive heatmaps and precision ApexCharts data plots.

---

## ⚡ Performance First

Elementum is engineered for solid runtime behavior and accessibility rather than superficial polish alone.
- **Core Web Vitals mindset:** Internal targets treat the periodic grid as the main LCP candidate (good LCP is on the order of **seconds**, not milliseconds), keep CLS low, and aim for **snappy filter/search interactions** (INP on the order of **~200ms**). Run `bun run build && bun run preview` and measure with Lighthouse or Chrome DevTools when you need hard numbers.
- **Accessibility:** ARIA roles/labels, keyboard navigation, and semantic HTML are used throughout; contrast and motion preferences are respected (e.g. GSAP paths honor reduced motion).
- **Theming:** CSS custom properties drive light and dark themes with consistent tokens.

---

## 🛠 Tech Stack

- **Application Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **State Management Architecture**: [Pinia](https://pinia.vuejs.org/)
- **Build Toolchain**: [Vite](https://vitejs.dev/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/)
- **Charts & analytics**: [ApexCharts](https://apexcharts.com/) with [vue3-apexcharts](https://github.com/apexcharts/vue3-apexcharts) for trend plots and data visualization
- **Motion**: [GSAP](https://gsap.com/) for timeline-driven UI animation where needed
- **Data & tooling**: Chemical formula parsing with grouping and subscripts (`src/utils/formulaParser.ts`) plus HTTP-based enrichment fetchers in `scripts/`.