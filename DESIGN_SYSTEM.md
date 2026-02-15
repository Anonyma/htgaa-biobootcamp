# Design System & Principles: HTGAA Bio-Bootcamp

## Core Design Principles
1.  **"Show, Don't Just Tell":** Prioritize interactive visualizations over long text blocks.
2.  **Scrollytelling:** Use scroll-triggered animations to explain complex processes step-by-step.
3.  **Gamification:** Integrate progress bars, completion checks, and "unlockable" content to motivate learners.
4.  **Minimalist & Focused:** Use whitespace effectively. Dark mode is standard. Content should be "chunked" into digestible cards or sections.
5.  **Interactive Exploration:** Allow users to "play" with parameters (e.g., in a simulation) to understand concepts.

## Recommended Tech Stack & Libraries
### Frameworks
*   **Frontend:** React (for complex state/interactivity) or Vanilla JS with focused libraries for lighter pages. *Current Stack: Vanilla JS + Tailwind CSS.*

### Visualizations & 3D
*   **Three.js / React Three Fiber:** For immersive 3D molecular structures (DNA, Proteins).
*   **Mol* / 3Dmol.js:** Specialized for rendering PDB (Protein Data Bank) files.
*   **Lottie:** For lightweight, high-quality vector animations (good for "explainer" graphics).

### Charts & Data
*   **Plotly.js:** For scientific plotting and interactive data exploration.
*   **Apache ECharts:** For complex, high-performance charts.
*   **D3.js:** For custom, data-driven diagrams (steep learning curve, use via wrappers like Nivo if possible).

### Diagrams & Timelines
*   **React Flow / xyflow:** For interactive node-based diagrams (pathways, workflows).
*   **React-Chrono:** For beautiful, interactive vertical/horizontal timelines.
*   **Mermaid:** For simple, code-defined diagrams (good for rapid prototyping).

### Biology Specific
*   **SeqViz:** For visualizing DNA/RNA sequences linear/circular.
*   **IGV.js:** For genome browser capabilities.

## Asset Guidelines
*   **Images:** Use high-resolution, scientific but accessible imagery.
*   **Colors:**
    *   **DNA:** Blue (#3b82f6), Green (#10b981), Red (#ef4444), Yellow (#f59e0b).
    *   **Backgrounds:** Clean White/Gray for Light Mode, Deep Slate/Blue for Dark Mode.
*   **Icons:** Lucide Icons (clean, consistent stroke width).

## Content Structure
*   **Hero Section:** High-impact visual + summary.
*   **Module Cards:** interactive entry points.
*   **Deep Dive Sections:** "Scrollytelling" layout with fixed visual on one side and scrolling text explanation on the other.
*   **Simulation/Lab:** Dedicated interactive full-screen or focused modal areas.
*   **Quiz/Review:** Gamified knowledge checks at the end of sections.

## Inspiration & Benchmarks
### Best-in-Class Educational Web Apps
*   **Labster:** The gold standard for virtual lab simulations. *Key Takeaway: Immersive 3D environments and "gamified" mission objectives.*
*   **Learn.Genetics (Utah):** highly rated for accessible, interactive modules. *Key Takeaway: Clean, step-by-step interactive animations for complex concepts like transcription/translation.*
*   **HHMI BioInteractive:** Excellent use of real scientific data in educational interactives. *Key Takeaway: "Click-and-explore" data visualizations.*
*   **PhET Interactive Simulations:** Simple, physics-based simulations. *Key Takeaway: Allow users to "tweak parameters" (e.g., temperature, concentration) and see real-time results.*
*   **Bioman Biology:** Proof that simple, game-like mechanics (arcade style) are highly engaging for review.

### Specialized Tools (Reference Implementation)
*   **Benchling:** The industry standard for DNA editing. *Goal: Mimic their clean, functional plasmid maps and sequence views.*
*   **SnapGene Viewer:** Another benchmark for visualizing DNA features and restriction sites.
*   **CRISPResso2:** Visualizes CRISPR editing outcomes. *Goal: Use similar "alignment" visuals to show how Cas9 cuts targets.*
*   **Mol* (MolStar):** The modern standard for 3D protein/DNA rendering in the browser (used by PDB).
