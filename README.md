# <p align="center">⚛️ Elementum</p>

<p align="center">
  <strong>A production-grade, highly performant scientific data visualization platform.</strong><br />
  Engineered to deliver comprehensive chemical datasets with zero latency and high-fidelity rendering.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue%203-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Performance-100-success?style=flat-square&logo=lighthouse&logoColor=white" alt="Performance" />
  <img src="https://img.shields.io/badge/Accessibility-100-success?style=flat-square&logo=accessibility&logoColor=white" alt="Accessibility" />
  <img src="https://img.shields.io/badge/Best_Practices-100-success?style=flat-square&logo=lighthouse&logoColor=white" alt="Best Practices" />
  <img src="https://img.shields.io/badge/SEO-100-success?style=flat-square&logo=google-search-console&logoColor=white" alt="SEO" />
</p>

---

## 🏗️ Architecture & Overview

**Elementum** represents a strict, architecture-first approach to chemical data visualization. Built to transcend standard periodic tables, this project exhibits production-ready software engineering practices—featuring automated data aggregation pipelines, robust static typing, hardware-accelerated 3D graphics, and complex state management. It provides scientists, engineers, and students immediate access to exhaustively enriched elemental properties without compromising UI responsiveness or rendering performance.

## 🚀 Core Engineering Features

### 1. Automated Data Aggregation Pipeline
Instead of relying on stagnant static JSON files, Elementum utilizes a robust build-time data enrichment pipeline.
- Custom Node.js scripts aggregate live data from authoritative sources (**PubChem**, **Wikidata**, and **IAEA**).
- Automates the resolution, merging, and type-checking of thousands of properties including isotope distributions, historical etymology, and rigorous GHS safety/hazard classifications.

### 2. High-Performance Spatial Search
A sophisticated query engine that updates the periodic grid in real-time.
- Features **syntax-assisted search** and dynamic **filter chips**.
- Capable of deeply nested querying (e.g., matching by phase, discovery year, or elemental family) while utilizing CSS-accelerated dimming to preserve structural grid context without causing costly DOM reflows.

### 3. Hardware-Accelerated Visualizations
Leveraging WebGL and Three.js to provide precise, high-performance structural representations.
- **3D Bohr Atom Models:** Real-time electron shell orbital rendering featuring accurate and dynamically scaling nucleus compositions.
- **Emission Spectral Lines:** Scientifically accurate spectral rendering, utilizing the Bruton wavelength-to-RGB conversion algorithm with engineered edge falloff calculations for photorealistic lines.

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

Elementum is meticulously engineered for execution speed and rigid accessibility over superficial "vibe coding."
- **Sub-200ms LCP:** Optimized asset delivery and intentional bundle splitting ensure unhindered initial load metrics.
- **Strict Accessibility (WCAG):** Comprehensive ARIA labeling role definitions, full keyboard navigability, and semantic HTML structure enforce mature usability logic.
- **Theme Resilience:** Cohesive, CSS variable-driven token architecture ensures seamless, performant repaints across precision Light-mode and Deep Space Dark-mode transitions.

---

## 🛠 Tech Stack

- **Application Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **State Management Architecture**: [Pinia](https://pinia.vuejs.org/)
- **Build Toolchain**: [Vite](https://vitejs.dev/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/)
- **Data Visualization**: [ApexCharts](https://apexcharts.com/)
- **Data Engineering**: Custom TypeScript abstract syntax trees (AST parsers) and fetch mechanisms.

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Bun](https://bun.sh/) or NPM

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/deepakkumardewani/elementum.git
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the development server:
   ```bash
   bun run dev
   ```

---

## 🌐 Deployment

Elementum is engineered to be production-ready and optimized for [Vercel](https://vercel.com/) edge deployments.
- **Routing**: Client-side logic inherently balanced via `vercel.json` for seamless SPA rendering.
- **SEO Optimization**: Fully bootstrapped with programmatic `sitemap.xml`, deterministic `robots.txt`, and rich OpenGraph metadata for targeted search engine discovery.