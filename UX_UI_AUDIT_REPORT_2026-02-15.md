# HTGAA BioBootcamp UX/UI Audit
Date: February 15, 2026  
Scope: Homepage + two modules (`DNA Sequencing`, `Gel Electrophoresis & Restriction Enzymes`)  
Live app: https://htgaa-biobootcamp.netlify.app/

## Executive Assessment
Current feedback is accurate: the app is feature-rich but cognitively overloaded. It feels like "everything at once," with weak prioritization and too many parallel UI patterns. The result is hard-to-scan, hard-to-navigate, and visually "AI-generated" (high volume of generic cards/icons/gradients without a strong visual thesis).

## Key Findings (Evidence-Based)
1. Homepage is overloaded and lacks a clear primary path.
2. Topic pages are content dumps with too many simultaneous interaction layers.
3. Wayfinding is noisy and partially redundant.
4. Visual language is generic and fragmented.

## Implementation Evidence (Code + UI)
### Homepage overload
- `week2/js/views/home.js:54` renders a long always-expanded sequence of dashboard blocks.
- `week2/js/views/home.js:26` includes "200+ features built with AI-assisted development," which reinforces "AI slop" perception.
- Measured density (desktop home route):
  - ~69 controls total, ~52 visible
  - 40 headings
  - 16 sections
  - ~5,527px page height

### Topic-page overload
- `week2/js/topic-page.js:664` renders all topic sections in one pass.
- Additional blocks then append after sections:
  - videos (`week2/js/topic-page.js:667`)
  - key facts (`week2/js/topic-page.js:670`)
  - further reading (`week2/js/topic-page.js:673`)
  - quiz (`week2/js/topic-page.js:677`)
  - design challenges (`week2/js/topic-page.js:679`)
  - quick review (`week2/js/topic-page.js:683`)
  - vocab quiz (`week2/js/topic-page.js:689`)
  - related topics (`week2/js/topic-page.js:692`)
  - bottom vocab/references strip (`week2/js/topic-page.js:695`)

### Redundant wayfinding
- Duplicate `id="floating-toc"` appears twice:
  - `week2/js/topic-page.js:543`
  - `week2/js/topic-page.js:634`

### Micro-action clutter per section
- Each section header includes TTS, notes, bookmark, share controls:
  - `week2/js/topic-page.js:834`
  - `week2/js/topic-page.js:837`
  - `week2/js/topic-page.js:840`
  - `week2/js/topic-page.js:843`

### Top-nav utility overload
- Multiple persistent utility controls compete with learning tasks:
  - `week2/js/app.js:82` through `week2/js/app.js:94`

## Measured Content Density (Audit Snapshots)
### Sequencing module
- 6 sections
- ~6,883 section words
- 25 topic quiz questions
- 15 vocabulary terms
- 10 key facts
- 2 design challenges

### Gel module
- 7 sections
- ~6,552 section words
- 25 topic quiz questions
- 14 vocabulary terms
- 10 key facts
- 2 design challenges

## Research Synthesis (Applied)
- Progressive disclosure reduces complexity and improves task completion.
- Recognition over recall improves usability and lowers friction.
- Strong hierarchy/scannability is critical (F-pattern behavior).
- Visual polish helps but does not fix structural usability issues.
- Simpler interfaces reduce cognitive load, especially for learning contexts.
- Segmented multimedia content improves comprehension vs. long undifferentiated content blocks.
- Retrieval practice and spaced repetition strongly improve long-term learning outcomes.

## Specific Change Requests
1. Re-architect homepage into 3 layers.
2. Set hard above-the-fold budget.
3. Convert modules into segmented study flows.
4. Trim payload shown per session.
5. Reduce section-header control clutter.
6. Define a distinctive bio visual direction.
7. Strengthen findability with filters and clear next-step CTAs.
8. Keep learning efficacy mechanics (feedback, spaced review, retrieval-first).

## Priority Plan
### P0 (Immediate)
1. Remove AI-feature messaging from hero and replace with learner outcome statement.
2. Keep only essential homepage blocks visible by default:
   - Continue
   - Today plan
   - Topics
   - One CTA for next action
3. Fix duplicate TOC IDs and consolidate to one navigation pattern.
4. Move section utility controls into one overflow action menu.

### P1 (Core redesign)
1. Introduce module stepper flow:
   - Learn
   - Try
   - Apply
   - Review
2. Collapse deep reading by default ("Read full explanation").
3. Move secondary quizzes/challenges into dedicated "Practice Mode."
4. Add module finder filters:
   - time
   - difficulty
   - format (read/sim/quiz/lab)

### P2 (Visual system upgrade)
1. Establish design tokens for type/color/spacing/motion.
2. Replace generic card soup with a more intentional composition and rhythm.
3. Add subtle bio-themed motifs:
   - gel-lane separators
   - plasmid ring accents
   - codon color chips
   - faint lab-grid textures

## Design Direction Recommendation
Goal: modern, sleek, digestible, alive, bio-themed.

Recommended visual style:
1. Cleaner hierarchy with stronger whitespace and fewer simultaneous cards.
2. Distinctive typography pairing (not default-only system stack).
3. Reduced accent palette per screen (avoid rainbow overload).
4. Motion used for orientation and reveal, not decoration.
5. "Scientific but human" tone: precise UI + warm color moments.

## Success Criteria
1. New users can identify what to do next within 5 seconds on homepage.
2. Above-the-fold controls reduced by at least 40%.
3. Module completion path requires fewer decisions per section.
4. Scroll depth and abandonment decrease; quiz completion rate increases.
5. Subjective feedback no longer reports "overwhelming" or "AI slop" as dominant impressions.

## Sources
- NN/g Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- NN/g Icon Usability: https://www.nngroup.com/articles/icon-usability/
- NN/g F-Pattern: https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- NN/g Recognition vs Recall: https://www.nngroup.com/articles/recognition-and-recall/
- NN/g Aesthetic-Usability Effect: https://www.nngroup.com/articles/aesthetic-usability-effect/
- W3C cognitive accessibility simplification guidance: https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p03-support-simplification/
- WCAG contrast minimum: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- Cognitive theory of multimedia learning review: https://pmc.ncbi.nlm.nih.gov/articles/PMC11820458/
- Dashboard overload study in education: https://doi.org/10.1007/s10639-023-12298-4
- Interactive simulations meta-analysis: https://doi.org/10.1111/jcal.12640
- Game-based learning meta-analysis: https://doi.org/10.1007/s10639-021-10748-1
- Gamification feedback effect meta-analysis: https://doi.org/10.1007/s10639-023-12365-w
- Retrieval practice (Science): https://www.science.org/doi/10.1126/science.1199327
- Spacing effects meta-analysis: https://pubmed.ncbi.nlm.nih.gov/19076480/
- ICAP framework: https://doi.org/10.1177/1529100614521818
