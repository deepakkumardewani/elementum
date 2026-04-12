# PRD.md — Elementum

---

## Product Overview

**Product Name:** Elementum (working title)

**Description:**
A dark, sci-fi themed, browser-native interactive periodic table web application built for students learning chemistry. Goes beyond a static reference table — it is an immersive, data-rich exploration tool with trend visualizations, comparisons, animated atom models, and electron configuration visualizers.

**Target Users:**
- High school and undergraduate chemistry students
- Science enthusiasts seeking a beautiful reference tool

**Problem Statement:**
Existing periodic table tools are either too plain (Wikipedia-style static tables), too cluttered, or too shallow in data. Students need something that is visually engaging enough to hold attention, rich enough to replace a textbook reference, and interactive enough to build intuition about elemental trends and relationships.

**Product Vision:**
The periodic table reimagined as a modern SaaS product — not a digitized textbook. Think chemistry lab dashboard meets sci-fi OS. Every interaction should feel deliberate, fast, and impressive.

---

## Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Engage students visually | Time on site | > 3 minutes avg session |
| Serve as reference tool | Elements explored per session | > 5 elements/session |
| Performance | Lighthouse Performance score | ≥ 90 (production build) |
| Accessibility | Lighthouse Accessibility score | ≥ 90 |
| Feel polished and fast | Core Web Vitals (LCP, CLS, INP) | All green |
| Be educationally complete | Data fields per element | 20+ properties |
| Impress as portfolio piece | Visual quality bar | Matches or exceeds ptable.com |

---

## User Personas

### Persona 1 — High School Student (Aisha, 16)
- Studying for chemistry exams
- Wants to quickly look up element properties
- Attracted to visual, interactive tools over textbooks
- Uses it on a laptop/desktop at home

### Persona 2 — Undergraduate Chemistry Student (Rohan, 20)
- Needs deeper data: electron configurations, oxidation states, trends
- Wants to compare elements when studying periodic trends
- Values speed and accuracy of data

### Persona 3 — Curious Explorer (General public, any age)
- No chemistry background required
- Drawn in by beautiful UI and interesting facts
- Explores elements by curiosity, not by syllabus

---

## Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Periodic Table Grid | Full 118-element table with proper layout including lanthanides/actinides | P0 |
| Element Detail View | Full data panel: all properties, fun facts, uses, history | P0 |
| Category Filter & Highlight | Highlight elements by type (noble gas, metal, etc.), period, group | P0 |
| Search | Search by name, symbol, atomic number, or property | P0 |
| Trend Visualizer | Bar/line charts for atomic radius, electronegativity, ionization energy, etc. | P1 |
| Element Comparison | Side-by-side comparison of any two elements | P1 |
| Electron Configuration Visualizer | Visual shell-filling diagram with Aufbau principle | P1 |
| Animated 3D Atom Model | Three.js animated atom with orbiting electrons | P1 |
| Hover Micro-interactions | Glow, scale, reveal on hover for each element tile | P0 |
| Filter Transition Animations | Smooth fade/highlight when switching filters | P0 |
| Quiz Mode | Flashcard-style element quizzes | P2 |

---

## User Stories

### Story 1 — Element Lookup
As a student,
I want to click on any element and see all its properties in a detail view,
So that I can quickly reference data without switching to another tab.

**Acceptance Criteria:**
- Clicking an element opens a detail panel/modal
- Detail view shows: symbol, name, atomic number, atomic mass, category, electron configuration, melting/boiling point, density, discoverer, year, oxidation states, electronegativity, uses, fun facts, spectral lines color, isotopes
- Detail view is dismissible via ESC or clicking outside
- Transition animation plays on open/close

---

### Story 2 — Category Exploration
As a student learning about element groups,
I want to filter the table by category (e.g. noble gases, transition metals),
So that I can visually understand how elements are grouped.

**Acceptance Criteria:**
- Filter controls visible above or beside the table
- Selecting a category highlights matching elements, dims others
- Transition is animated (not instant)
- Multiple filter types available: category, period, group, block (s/p/d/f)

---

### Story 3 — Search
As a user who knows what they're looking for,
I want to type a name, symbol, or property and immediately find matching elements,
So that I don't have to scan the entire table.

**Acceptance Criteria:**
- Search input always accessible (top bar)
- Results highlight matching elements on the table in real time
- Supports partial matches
- Pressing Enter or clicking a result opens the detail view

---

### Story 4 — Trend Visualization
As a student studying periodic trends,
I want to see a chart of how a property (e.g. electronegativity) changes across the table,
So that I can understand and visualize the trend intuitively.

**Acceptance Criteria:**
- Selectable properties: atomic radius, electronegativity, ionization energy, electron affinity, density, melting point, boiling point
- Chart animates in on load
- Hovering a bar/point highlights the corresponding element on the table
- Chart is readable and labeled clearly

---

### Story 5 — Element Comparison
As a student comparing two elements,
I want to select two elements and see them side by side,
So that I can understand their similarities and differences.

**Acceptance Criteria:**
- User can enter comparison mode and select two elements
- Side-by-side panel shows all key properties with visual diff indicators (higher/lower)
- Comparison view is dismissible

---

### Story 6 — Electron Configuration
As a student learning quantum chemistry,
I want to see a visual electron shell diagram for any element,
So that I can understand how electrons are distributed.

**Acceptance Criteria:**
- Shown inside the element detail view
- Displays shells (K, L, M, N...) with correct electron counts
- Animated fill effect on load
- Shows full spectroscopic notation (e.g. 1s² 2s² 2p⁶...)

---

### Story 7 — 3D Atom Model
As a student wanting a visual representation,
I want to see an animated 3D atom model,
So that I can conceptualize atomic structure.

**Acceptance Criteria:**
- Rendered using Three.js or TresJS
- Nucleus shown with protons/neutrons
- Electron shells orbit with animation
- Number of electrons matches the element
- Performant (no jank on standard laptop)

---

## User Flows

### Flow 1 — Default Load
1. App loads → full periodic table renders with fade-in animation
2. Elements are color-coded by category
3. Search bar and filter controls visible
4. No element selected

### Flow 2 — Element Detail
1. User hovers element → glow effect, brief tooltip (name, number, mass)
2. User clicks → detail panel animates in (split-screen or modal)
3. Detail panel shows all data, electron config visualizer, 3D atom
4. User presses ESC or clicks outside → panel closes with animation

### Flow 3 — Filter/Highlight
1. User clicks a category filter (e.g. "Noble Gases")
2. Matching elements glow/highlight, others dim
3. User can stack filters or clear all
4. Table transitions smoothly between states

### Flow 4 — Trend Chart
1. User opens Trends view (tab or section)
2. Selects a property from dropdown
3. Bar chart animates in showing all elements
4. User hovers a bar → tooltip shows element name + value, element highlights on table

### Flow 5 — Compare
1. User clicks "Compare" mode
2. Clicks two elements on the table
3. Side-by-side comparison panel opens
4. User can swap one element by clicking a different one

---

## Non-Goals

- No user accounts, login, or saved state (v1)
- No backend or server — fully browser-native
- No mobile-first layout (desktop is primary; responsive is nice-to-have, not required)
- No gamification in v1 (quiz mode is P2)
- No real-time data (element data is static/bundled)
- No PWA/offline mode in v1
- No multi-language support
- No accessibility audit target in v1 (basic a11y only)
