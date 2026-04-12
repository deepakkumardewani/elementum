# <p align="center">⚛️ Elementum</p>

<p align="center">
  <strong>A premium, high-performance interactive periodic table explorer.</strong><br />
  Explore the building blocks of the universe with precision data and immersive visualizations.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue%203-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Performance-100-success?style=flat-square&logo=lighthouse&logoColor=white" alt="Performance" />
  <img src="https://img.shields.io/badge/Accessibility-96-success?style=flat-square&logo=accessibility&logoColor=white" alt="Accessibility" />
  <img src="https://img.shields.io/badge/Best_Practices-96-success?style=flat-square&logo=lighthouse&logoColor=white" alt="Best Practices" />
  <img src="https://img.shields.io/badge/SEO-96-success?style=flat-square&logo=google-search-console&logoColor=white" alt="SEO" />
  <img src="https://img.shields.io/badge/Load_Time-%3C_1s-success?style=flat-square&logo=speedtest&logoColor=white" alt="Load Time" />
</p>

---

## ⚡ Performance First

Elementum is engineered for speed. With an **LCP of <200ms** and a **100/100 Performance Score**, the application provides a near-instantaneous experience, ensuring that complex chemical data is accessible the moment you need it.


## ✨ Overview

**Elementum** is a modern scientific application designed for researchers, students, and enthusiasts. Unlike traditional periodic tables, Elementum treats chemical data as a dynamic experience, offering advanced visualization tools and comparative analytics in a stunning "scientific lab terminal" aesthetic.

## 🚀 Key Features

### 🔍 Interactive Grid Search
Traditional search results can be disjointed. Elementum's search engine **updates the periodic grid in real-time**, dimming unrelated elements while highlighting matches. This allows you to maintain the spatial context of every element even while filtering by name, symbol, or atomic number.

### 📊 Trend Visualizer
Analyze periodicity like never before.
- **Dynamic Heatmaps**: Instantly visualize properties across the entire table via high-contrast color gradients.
- **Analytical Charts**: Powered by ApexCharts, view property distributions (atomic radius, electronegativity, etc.) with precise interactive data points.

### ⚖️ Side-by-Side Comparison
The dedicated **Compare View** allows you to select any two elements and view their physical, chemical, and atomic properties in a high-density comparison matrix. It includes a mini-periodic grid for lightning-fast element switching.

### ⚛️ Immersive Details
Each element is a world of its own:
- **3D Atom Models**: Real-time 3D orbit visualizations powered by Three.js.
- **Spectral Lines**: High-fidelity visualization of elemental emission spectra.
- **Electron Configurations**: Visualized shell mappings.

### 🌓 Premium Dual Themes
Whether you prefer the "Deep Space" laboratory aesthetic of **Dark Mode** or the "Medical Lab" precision of **Light Mode**, Elementum provides a cohesive, high-contrast experience with smooth theme-aware transitions.

---

## 🛠 Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **3D Rendering**: [Three.js](https://threejs.org/)
- **Data Visualization**: [ApexCharts](https://apexcharts.com/)
- **Icons**: [Lucide Vue](https://lucide.dev/)
- **Styling**: Vanilla CSS with custom design tokens

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

Elementum is optimized for [Vercel](https://vercel.com/).
- **Routing**: Configured via `vercel.json` for seamless SPA navigation.
- **SEO**: Fully optimized with `sitemap.xml`, `robots.txt`, and rich metadata for search discovery.

---