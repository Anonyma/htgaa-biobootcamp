/**
 * HTGAA Week 2 — Glossary View
 * Searchable, alphabetically sorted vocabulary from all topics.
 */

import { store, TOPICS } from '../store.js';

function createGlossaryView() {
  return {
    async render() {
      // Load all topic data
      const allTerms = [];
      for (const topic of TOPICS) {
        const data = await store.loadTopicData(topic.id);
        if (data?.vocabulary) {
          data.vocabulary.forEach(v => {
            allTerms.push({
              term: v.term,
              definition: v.definition,
              topicId: topic.id,
              topicTitle: topic.title,
              topicColor: topic.color,
            });
          });
        }
      }

      // Sort alphabetically
      allTerms.sort((a, b) => a.term.localeCompare(b.term));

      // Group by first letter
      const grouped = {};
      allTerms.forEach(t => {
        const letter = t.term[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(t);
      });

      const letters = Object.keys(grouped).sort();

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                <i data-lucide="book-a" class="w-6 h-6 text-teal-600 dark:text-teal-400"></i>
              </div>
              <div>
                <h1 class="text-3xl font-extrabold">Glossary</h1>
                <p class="text-sm text-slate-500">${allTerms.length} terms across ${TOPICS.length} topics</p>
              </div>
            </div>

            <!-- Search -->
            <div class="relative mt-4">
              <i data-lucide="search" class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input id="glossary-search" type="text" placeholder="Search terms..." class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-sm" />
            </div>

            <!-- Letter nav -->
            <div class="flex flex-wrap gap-1 mt-4">
              ${letters.map(l => `<a href="#letter-${l}" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-800 transition-colors">${l}</a>`).join('')}
            </div>

            <!-- Topic filter + random -->
            <div class="flex flex-wrap gap-2 mt-4 items-center">
              <button class="glossary-filter active text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-medium transition-colors" data-filter="all">All</button>
              ${TOPICS.map(t => `<button class="glossary-filter text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-${t.color}-50 dark:hover:bg-${t.color}-900/20 text-slate-500 dark:text-slate-400 transition-colors" data-filter="${t.id}">${t.title}</button>`).join('')}
              <span class="text-slate-300 dark:text-slate-600">|</span>
              <button id="glossary-random" class="text-xs px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="shuffle" class="w-3 h-3"></i> Random
              </button>
              <button id="glossary-quiz-mode" class="text-xs px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="eye-off" class="w-3 h-3"></i> Quiz Mode
              </button>
            </div>
          </header>

          <div id="glossary-results" class="text-sm text-slate-500 mb-4 hidden"></div>

          <div id="glossary-content">
            ${letters.map(l => `
              <div class="glossary-letter-group mb-6" data-letter="${l}">
                <h2 id="letter-${l}" class="text-lg font-bold text-teal-600 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3 scroll-mt-24">${l}</h2>
                <div class="space-y-3">
                  ${grouped[l].map(t => `
                    <div class="glossary-term p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors" data-topic="${t.topicId}" data-term-text="${t.term.toLowerCase()}">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <span class="font-bold text-slate-800 dark:text-slate-200">${t.term}</span>
                          <p class="text-slate-500 dark:text-slate-400 mt-0.5">${t.definition}</p>
                        </div>
                        <a data-route="#/topic/${t.topicId}" class="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-${t.topicColor}-100 dark:bg-${t.topicColor}-900/30 text-${t.topicColor}-600 dark:text-${t.topicColor}-400 cursor-pointer hover:underline whitespace-nowrap">${t.topicTitle}</a>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div id="glossary-empty" class="hidden text-center py-12 text-slate-400">
            <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
            <p class="text-lg font-medium">No matching terms</p>
            <p class="text-sm">Try a different search term or filter</p>
          </div>
        </div>
      `;
    },

    mount(container) {
      const searchInput = container.querySelector('#glossary-search');
      const content = container.querySelector('#glossary-content');
      const empty = container.querySelector('#glossary-empty');
      const results = container.querySelector('#glossary-results');
      const terms = container.querySelectorAll('.glossary-term');
      const letterGroups = container.querySelectorAll('.glossary-letter-group');
      const filters = container.querySelectorAll('.glossary-filter');
      let activeFilter = 'all';

      function applyFilters() {
        const query = (searchInput?.value || '').toLowerCase().trim();
        let visible = 0;

        terms.forEach(el => {
          const matchesTopic = activeFilter === 'all' || el.dataset.topic === activeFilter;
          const matchesSearch = !query || el.dataset.termText.includes(query) || el.textContent.toLowerCase().includes(query);
          const show = matchesTopic && matchesSearch;
          el.style.display = show ? '' : 'none';
          if (show) visible++;
        });

        // Hide letter groups that have no visible terms
        letterGroups.forEach(g => {
          const hasVisible = g.querySelectorAll('.glossary-term[style=""], .glossary-term:not([style])').length > 0;
          // Simpler: check if any child term is not display:none
          let anyVisible = false;
          g.querySelectorAll('.glossary-term').forEach(t => {
            if (t.style.display !== 'none') anyVisible = true;
          });
          g.style.display = anyVisible ? '' : 'none';
        });

        if (content) content.style.display = visible > 0 ? '' : 'none';
        if (empty) empty.style.display = visible === 0 ? '' : 'none';
        if (results) {
          if (query || activeFilter !== 'all') {
            results.classList.remove('hidden');
            results.textContent = `Showing ${visible} term${visible !== 1 ? 's' : ''}`;
          } else {
            results.classList.add('hidden');
          }
        }
      }

      searchInput?.addEventListener('input', applyFilters);

      // Quiz mode — hide definitions, click to reveal
      const quizBtn = container.querySelector('#glossary-quiz-mode');
      let quizMode = false;
      if (quizBtn) {
        quizBtn.addEventListener('click', () => {
          quizMode = !quizMode;
          quizBtn.innerHTML = quizMode
            ? '<i data-lucide="eye" class="w-3 h-3"></i> Normal Mode'
            : '<i data-lucide="eye-off" class="w-3 h-3"></i> Quiz Mode';
          if (window.lucide) lucide.createIcons();
          terms.forEach(el => {
            const defEl = el.querySelector('p');
            if (defEl) {
              if (quizMode) {
                defEl.dataset.origText = defEl.textContent;
                defEl.textContent = 'Click to reveal definition...';
                defEl.classList.add('italic', 'cursor-pointer', 'text-amber-500', 'dark:text-amber-400');
                defEl.classList.remove('text-slate-500', 'dark:text-slate-400');
              } else {
                if (defEl.dataset.origText) defEl.textContent = defEl.dataset.origText;
                defEl.classList.remove('italic', 'cursor-pointer', 'text-amber-500', 'dark:text-amber-400');
                defEl.classList.add('text-slate-500', 'dark:text-slate-400');
              }
            }
          });
        });
        // Click to reveal in quiz mode
        container.querySelector('#glossary-content')?.addEventListener('click', (e) => {
          if (!quizMode) return;
          const term = e.target.closest('.glossary-term');
          if (!term) return;
          const defEl = term.querySelector('p');
          if (defEl && defEl.dataset.origText && defEl.textContent.includes('Click to reveal')) {
            defEl.textContent = defEl.dataset.origText;
            defEl.classList.remove('italic', 'text-amber-500', 'dark:text-amber-400');
            defEl.classList.add('text-green-600', 'dark:text-green-400');
          }
        });
      }

      // Random term button
      const randomBtn = container.querySelector('#glossary-random');
      if (randomBtn) {
        randomBtn.addEventListener('click', () => {
          // Get all visible terms
          const visibleTerms = [...terms].filter(t => t.style.display !== 'none');
          if (visibleTerms.length === 0) return;
          const randomTerm = visibleTerms[Math.floor(Math.random() * visibleTerms.length)];
          // Scroll to it and highlight
          randomTerm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          randomTerm.classList.add('ring-2', 'ring-violet-400', 'ring-offset-2');
          setTimeout(() => randomTerm.classList.remove('ring-2', 'ring-violet-400', 'ring-offset-2'), 2000);
        });
      }

      filters.forEach(btn => {
        btn.addEventListener('click', () => {
          filters.forEach(f => {
            f.classList.remove('active');
            f.classList.remove('bg-teal-50', 'dark:bg-teal-900/20', 'text-teal-600', 'dark:text-teal-400', 'font-medium');
            f.classList.add('text-slate-500', 'dark:text-slate-400');
          });
          btn.classList.add('active', 'bg-teal-50', 'dark:bg-teal-900/20', 'text-teal-600', 'dark:text-teal-400', 'font-medium');
          btn.classList.remove('text-slate-500', 'dark:text-slate-400');
          activeFilter = btn.dataset.filter;
          applyFilters();
        });
      });
    },

    unmount() {}
  };
}

export { createGlossaryView };
