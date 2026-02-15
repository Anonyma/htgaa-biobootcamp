# Status Report: HTGAA Bio-Bootcamp Week 2 Redesign

## Project Overview
The goal is to transform the static, text-heavy Week 2 study guide into an interactive, visually rich React application.

**Original Folder:** `week2/` (Keep this as reference content).
**New React Folder:** `week2-react/` (Built with Vite + Tailwind + React + Three.js).

## Current Progress (Done)
1.  **Environment Setup:** Scaffolded Vite + TS app, integrated Tailwind v3.4, Framer Motion, and Three.js.
2.  **Infrastructure:** Created `Layout.tsx` (sticky nav, dark mode) and `SplitScreen.tsx` (scrollytelling engine).
3.  **Data Porting:** Ported the core JSON data into `src/data/content.ts`.
4.  **Proof of Concept:**
    *   `SequencingPage.tsx`: Implemented scrollytelling layout.
    *   `DNAHelix.tsx`: A real 3D rotating DNA model.
    *   `HistoryTimeline.tsx`: Interactive horizontal timeline of sequencing milestones.
5.  **Environment Fixes:** Added `dev-server.js` wrapper and `.nvmrc` to fix Node 22/Vite crypto compatibility issues.

## Remaining Work (The Plan)
1.  **Port Missing Logic:** The original `week2/js/` contains complex simulations:
    *   `gel-sim.js`: Port to React as a `<GelSimulator />` component.
    *   `restriction-sim.js`: Port to React.
    *   `codon-wheel.js`: Rebuild as an interactive SVG/Canvas component.
2.  **Content Expansion:**
    *   Synthesis, Editing, and Genetic Codes modules need their own detailed pages (similar to `SequencingPage.tsx`).
    *   Port the full "Homework" section into a dedicated page with interactive design tools.
3.  **Visual Enhancements:**
    *   Replace placeholders in `SequencingPage` with real animations (Illumina Flow Cell, Nanopore signal).
    *   Add 3D models for CRISPR-Cas9 mechanism.
4.  **Routing:** Install `react-router-dom` to manage navigation between pages properly.

## Instructions for Future Agents
- **Tech Stack:** Use React + TypeScript. Do NOT revert to Vanilla JS.
- **Styling:** Use Tailwind CSS. Follow the color palette in `DESIGN_SYSTEM.md`.
- **Interactivity:** Prioritize `framer-motion` for UI animations and `react-three-fiber` for 3D.
- **Reporting:** ALWAYS run `report-status --name htgaa-agent blocked "..."` if waiting for user input.
- **Testing:** Always run `npm run build` before claiming a task is done to ensure TS compliance.
