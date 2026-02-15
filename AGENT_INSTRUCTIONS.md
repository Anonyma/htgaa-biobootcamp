# HTGAA & Bio Bootcamp Study Guide Agent Instructions

**Objective:**
Create a comprehensive, visually rich study guide (likely a static web app or polished Markdown/HTML suite) covering:
1.  **Bio Bootcamp Content:** Using the provided files in the `content/` directory (slides, handouts, transcripts).
2.  **HTGAA Day #2 Content:** Focus on "DNA Read, Write, & Edit" and the "DNA Gel Art" lab. Reference: https://2026a.htgaa.org/2026a/course-pages/

**Requirements:**
- **Thoroughness:** The guide must be textbook-quality but digestible.
- **Media:** Include diagrams, images, and visualizations (use placeholders if generation isn't possible, or search for public domain assets/links).
- **External Links:** deeply research and link to:
    - Interactive tools (simulations, calculators).
    - Deep-dive articles/papers.
    - Relevant YouTube videos or lectures.
- **Structure:**
    - clear sections for each Day/Topic.
    - "Deep Dive" boxes for complex concepts.
    - "Quick Summary" for review.
- **Deployment:** The final result should be easy to view. (e.g., a single HTML file or a folder ready for Netlify/GitHub Pages).

**Workflow:**
1.  **Analyze:** Read all files in `content/`. Extract key concepts, vocabulary, and protocols.
2.  **Research:** Use `web_search` and `web_fetch` to find the HTGAA Day 2 specifics and supplementary visual resources.
3.  **Draft:** Build the content. Use `codebase_investigator` or other sub-agents if the scope becomes large or if you need specialized parsing.
4.  **Refine:** Add quizzes, "Definition" tooltips, or interactive elements if possible (JS).
5.  **Report:**
    - Use `report-status --name htgaa-agent --status working "message"` frequently.
    - When done, use `report-status --name htgaa-agent --status completed "Ready at [path]"`
    - Send a final notification.
    - **CRITICAL:** If you need user approval/confirmation for ANY action, IMMEDIATELY run `report-status --name htgaa-agent blocked "Need approval for X"` BEFORE waiting. Do not silently wait.

**Tools:**
- You have full access to CLI tools.
- You can spawn sub-agents if you need parallel processing (though typically you can do this yourself).

**Context Files:**
- Located in: `~/htgaa_study_project/content/`
