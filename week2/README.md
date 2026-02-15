# HTGAA Week 2: DNA Read, Write, & Edit — Interactive Study Guide

## Status: Deployed, needs browser testing & bug fixes

## Live URL
https://htgaa-biobootcamp.netlify.app/week2/index.html

## Local Development
```bash
cd /Users/z/Desktop/PersonalProjects/ClaudeProjects/htgaa-biobootcamp
python3 -m http.server 8878
# Open http://localhost:8878/week2/index.html
```

## Architecture
- **No build step** — vanilla JS, all dependencies via CDN
- **Tailwind CSS** via CDN (with `dark` class on `<html>` for dark mode)
- **D3.js v7** via CDN (used by 4 of 5 simulations)
- **Lucide Icons** via CDN
- **localStorage** for progress tracking, quiz state, theme, lab checkboxes

## File Structure
```
week2/
├── index.html              # Landing page — 6 topic cards, progress ring
├── dna-rwe.html            # Main content — fetches data/content.json, renders 6 sections
│                            #   with embedded simulations, vocab, quizzes
├── gel-art-lab.html        # Lab protocol — inline content, step-by-step with checkboxes
├── css/
│   └── week2.css           # All shared styles (callouts, sims, quiz, animations)
├── js/
│   ├── shared.js           # Progress tracking, theme, quiz engine, scroll spy, collapsibles
│   ├── restriction-sim.js  # Restriction enzyme cutting simulator (D3.js SVG)
│   ├── gel-sim.js          # Gel electrophoresis simulator (D3.js SVG)
│   ├── codon-wheel.js      # Interactive codon/amino acid wheel (D3.js SVG)
│   ├── cassette-builder.js # Drag-and-drop expression cassette builder (HTML5 DnD)
│   └── central-dogma.js    # DNA→RNA→Protein step animation (D3.js SVG)
└── data/
    ├── content.json         # Structured lecture content (6 sections, ~66KB)
    └── enzymes.json         # 12 restriction enzymes with cut sites
```

## How the pages work

### index.html
Static landing page. Reads `htgaa-week2-progress` from localStorage to show completion state on topic cards and progress ring.

### dna-rwe.html
Fetches `data/content.json` via `fetch()` and dynamically builds the DOM:
- Left sidebar TOC with IntersectionObserver scroll spy
- Each section renders: key concepts (collapsible), details HTML, simulation container, vocabulary grid, quiz questions
- Simulation containers are inserted by section ID:
  - `genetic-codes` → codon-wheel
  - `gel-electrophoresis` → restriction-sim, gel-sim
  - `central-dogma` → central-dogma, cassette-builder
- Simulation JS files auto-initialize when they find their container div

### gel-art-lab.html
All content is inline HTML (no JSON fetch). Protocol steps have checkboxes persisted to localStorage key `htgaa-gel-lab-checks`. Loads restriction-sim.js and gel-sim.js for embedded simulators at the bottom.

## Simulations

| Simulation | File | Container ID | Dependencies |
|-----------|------|-------------|--------------|
| Restriction Enzyme Sim | restriction-sim.js | `#restriction-sim` | D3.js, fetches data/enzymes.json |
| Gel Electrophoresis Sim | gel-sim.js | `#gel-sim` | D3.js, reads `window.lastFragments` from restriction sim |
| Codon Wheel | codon-wheel.js | `#codon-wheel` | D3.js |
| Cassette Builder | cassette-builder.js | `#cassette-builder` | None (HTML5 DnD) |
| Central Dogma | central-dogma.js | `#central-dogma` | D3.js |

Each JS file checks for its container div and only initializes if found. They're safe to load on any page.

## Known Issues / TODO
- **Not browser-tested yet** — simulations were built by separate AI agents and may have visual/integration bugs
- **restriction-sim.js** uses custom CSS classes (`rs-controls`, `rs-btn`, `rs-row`, etc.) that are defined inline in the JS, not in week2.css — may need styling fixes
- **gel-sim.js** band appearance may need tuning (glow filter, color, sizing)
- **CSS class conflicts** possible between simulation JS modules (each was built independently)
- Check that all 5 simulations render and are interactive on dna-rwe.html
- Verify mobile responsiveness of simulations
- Test quiz answer persistence across page reloads

## Deployment
```bash
# Deploy to Netlify
npx netlify-cli deploy --dir=. --prod --site 3adf6a81-c12b-47b8-ab96-6d1d4d444af4

# Copy to CandyPop
scp -r week2/* CandyPop:~/Projects/htgaa-biobootcamp/week2/
```

## Content Sources (in /Users/z/Desktop/PersonalProjects/ClaudeProjects/FilesForAgents/htgaa/week2/)
- `slides-lecture-2-church.pdf` — George Church: Reading & Writing Life
- `slides-lecture-2-jacobson.pdf` — Joe Jacobson: Gene Synthesis
- `slides-lecture-2-leproust.pdf` — Emily Leproust: DNA Synthesis (Twist)
- `HTGAA 2026 DNA Gel Art Lab.pdf` — Lab protocol
- `Week 2 — DNA Read, Write, & Edit __ HTGAA Spring 2026.html` — Course page + homework

## localStorage Keys
| Key | Used By | Purpose |
|-----|---------|---------|
| `htgaa-week2-progress` | shared.js, index.html | Section completion states |
| `htgaa-theme` | all pages | 'dark' or 'light' |
| `htgaa-week2-homework` | dna-rwe.html | Homework checkbox states |
| `htgaa-gel-lab-checks` | gel-art-lab.html | Protocol step checkbox states |
| `htgaa-week2-quizzes` | shared.js | Quiz answer history |
| `htgaa-week2-collapsibles` | shared.js | Open/closed state of collapsible sections |
