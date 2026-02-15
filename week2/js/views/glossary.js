/**
 * HTGAA Week 2 — Glossary View
 * Searchable, alphabetically sorted vocabulary from all topics.
 */

import { store, TOPICS } from '../store.js';

let _glossaryScrollCleanup = null;

function createGlossaryView() {
  let _allTerms = [];
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
      _allTerms = allTerms;

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

            <!-- Flashcard Progress -->
            ${(() => {
              const reviews = store.get('flashcards').reviews || {};
              let mastered = 0, learning = 0, unseen = 0;
              allTerms.forEach((t, i) => {
                const topicVocabIdx = allTerms.filter(at => at.topicId === t.topicId).indexOf(t);
                const cardId = `${t.topicId}-vocab-${topicVocabIdx >= 0 ? topicVocabIdx : i}`;
                const r = reviews[cardId];
                if (!r) unseen++;
                else if (r.interval >= 21) mastered++;
                else learning++;
              });
              if (mastered === 0 && learning === 0) return '';
              const total = allTerms.length;
              return `
              <div class="mt-3 flex items-center gap-3 text-xs">
                <div class="flex-1 h-2 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
                  ${mastered > 0 ? `<div class="bg-green-500" style="width:${(mastered/total)*100}%" title="${mastered} mastered"></div>` : ''}
                  ${learning > 0 ? `<div class="bg-yellow-400" style="width:${(learning/total)*100}%" title="${learning} learning"></div>` : ''}
                </div>
                <span class="text-slate-500 flex-shrink-0">
                  <span class="text-green-600 font-medium">${mastered}</span> mastered ·
                  <span class="text-yellow-600 font-medium">${learning}</span> learning ·
                  <span class="text-slate-400">${unseen}</span> new
                </span>
              </div>`;
            })()}

            <!-- Search -->
            <div class="relative mt-4">
              <i data-lucide="search" class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input id="glossary-search" type="text" placeholder="Search terms..." class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-sm" />
            </div>

            <!-- Letter nav -->
            <div class="flex flex-wrap gap-1 mt-4">
              ${letters.map(l => {
                const reviews = store.get('flashcards').reviews || {};
                const letterTerms = grouped[l];
                let mastered = 0;
                letterTerms.forEach(t => {
                  const topicVocabIdx = allTerms.filter(at => at.topicId === t.topicId).indexOf(t);
                  const cardId = `${t.topicId}-vocab-${topicVocabIdx >= 0 ? topicVocabIdx : 0}`;
                  if (reviews[cardId]?.interval >= 21) mastered++;
                });
                const pct = letterTerms.length > 0 ? Math.round((mastered / letterTerms.length) * 100) : 0;
                const dotColor = pct >= 80 ? 'bg-green-400' : pct >= 40 ? 'bg-yellow-400' : pct > 0 ? 'bg-red-400' : '';
                return `<a href="#letter-${l}" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-800 transition-colors relative" title="${grouped[l].length} terms${pct > 0 ? `, ${pct}% mastered` : ''}">${dotColor ? `<span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${dotColor}"></span>` : ''}${l}<span class="text-[8px] font-normal text-slate-400 leading-none">${grouped[l].length}</span></a>`;
              }).join('')}
            </div>

            <!-- Topic filter + random -->
            <div class="flex flex-wrap gap-2 mt-4 items-center">
              <button class="glossary-filter active text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-medium transition-colors" data-filter="all">All</button>
              ${TOPICS.map(t => {
                const count = allTerms.filter(at => at.topicId === t.id).length;
                return `<button class="glossary-filter text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-${t.color}-50 dark:hover:bg-${t.color}-900/20 text-slate-500 dark:text-slate-400 transition-colors" data-filter="${t.id}">${t.title} <span class="opacity-60">(${count})</span></button>`;
              }).join('')}
              <span class="text-slate-300 dark:text-slate-600">|</span>
              <span class="text-[10px] text-slate-400 uppercase tracking-wider">Sort:</span>
              <button class="glossary-sort text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-medium transition-colors" data-sort="alpha">A-Z</button>
              <button class="glossary-sort text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" data-sort="topic">By Topic</button>
              <button class="glossary-sort text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" data-sort="status">By Status</button>
              <span class="text-slate-300 dark:text-slate-600">|</span>
              <button id="glossary-random" class="text-xs px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="shuffle" class="w-3 h-3"></i> Random
              </button>
              <button id="glossary-quiz-mode" class="text-xs px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="eye-off" class="w-3 h-3"></i> Quiz Mode
              </button>
              <button id="glossary-export-csv" class="text-xs px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="download" class="w-3 h-3"></i> CSV
              </button>
              <button id="glossary-mini-quiz" class="text-xs px-3 py-1.5 rounded-full border border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="brain" class="w-3 h-3"></i> Quiz Me
              </button>
              <button id="glossary-export-anki" class="text-xs px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="layers" class="w-3 h-3"></i> Anki
              </button>
              <button id="glossary-random-term" class="text-xs px-3 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="shuffle" class="w-3 h-3"></i> Random
              </button>
            </div>
          </header>

          <!-- Mini Quiz Area -->
          <div id="glossary-mini-quiz-area" class="mb-6 hidden"></div>

          <!-- Mastery by Topic -->
          ${(() => {
            const reviews = store.get('flashcards').reviews || {};
            const topicStats = TOPICS.map(t => {
              const terms = allTerms.filter(at => at.topicId === t.id);
              let mastered = 0, learning = 0;
              terms.forEach((term, i) => {
                const topicIdx = allTerms.filter(at => at.topicId === t.id).indexOf(term);
                const cardId = t.id + '-vocab-' + (topicIdx >= 0 ? topicIdx : i);
                const r = reviews[cardId];
                if (r?.interval >= 21) mastered++;
                else if (r) learning++;
              });
              return { topic: t, total: terms.length, mastered, learning, newCount: terms.length - mastered - learning };
            }).filter(ts => ts.total > 0);
            if (topicStats.every(ts => ts.mastered === 0 && ts.learning === 0)) return '';
            return `
            <div class="mb-6 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i data-lucide="bar-chart-3" class="w-4 h-4 text-teal-500"></i> Mastery by Topic
              </h3>
              <div class="space-y-2">
                ${topicStats.map(ts => {
                  const pct = Math.round((ts.mastered / ts.total) * 100);
                  return '<div class="flex items-center gap-2"><i data-lucide="' + (ts.topic.icon || 'book') + '" class="w-3.5 h-3.5 text-' + ts.topic.color + '-500 flex-shrink-0"></i><span class="text-xs text-slate-600 dark:text-slate-400 w-20 truncate">' + ts.topic.title.split(' ')[0] + '</span><div class="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex"><div class="bg-green-500 h-full" style="width:' + ((ts.mastered / ts.total) * 100) + '%"></div><div class="bg-yellow-400 h-full" style="width:' + ((ts.learning / ts.total) * 100) + '%"></div></div><span class="text-[10px] font-bold w-8 text-right ' + (pct >= 80 ? 'text-green-600' : pct >= 40 ? 'text-amber-600' : 'text-slate-400') + '">' + pct + '%</span></div>';
                }).join('')}
              </div>
            </div>`;
          })()}

          <!-- Term of the Day -->
          ${(() => {
            if (allTerms.length === 0) return '';
            // Deterministic "random" based on date
            const dayNum = Math.floor(Date.now() / 86400000);
            const idx = dayNum % allTerms.length;
            const t = allTerms[idx];
            return `
            <div class="mb-6 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-800">
              <div class="flex items-center gap-2 mb-2">
                <i data-lucide="sparkle" class="w-4 h-4 text-teal-500"></i>
                <span class="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Term of the Day</span>
              </div>
              <p class="font-bold text-lg text-slate-800 dark:text-slate-200">${t.term}</p>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${t.definition}</p>
              <p class="text-xs text-teal-500 mt-2">From: ${t.topicTitle}</p>
            </div>`;
          })()}

          <!-- Recently Viewed -->
          ${(() => {
            try {
              const recent = JSON.parse(localStorage.getItem('htgaa-glossary-recent') || '[]');
              if (recent.length === 0) return '';
              const recentTerms = recent.map(r => allTerms.find(t => t.term.toLowerCase() === r)).filter(Boolean).slice(0, 5);
              if (recentTerms.length === 0) return '';
              return `
              <div class="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2 mb-2">
                  <i data-lucide="history" class="w-4 h-4 text-slate-400"></i>
                  <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recently Viewed</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  ${recentTerms.map(t => `<a href="#letter-${t.term[0].toUpperCase()}" class="glossary-jump-term text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-teal-400 cursor-pointer transition-colors" data-jump-term="${t.term.toLowerCase()}">${t.term}</a>`).join('')}
                </div>
              </div>`;
            } catch { return ''; }
          })()}

          <div id="glossary-results" class="text-sm text-slate-500 mb-4 hidden"></div>

          <div id="glossary-content">
            ${letters.map(l => `
              <div class="glossary-letter-group mb-6" data-letter="${l}">
                <h2 id="letter-${l}" class="text-lg font-bold text-teal-600 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3 scroll-mt-24">${l}</h2>
                <div class="space-y-3">
                  ${grouped[l].map((t, tIdx) => {
                    // Get flashcard status for this term
                    const reviews = store.get('flashcards').reviews || {};
                    const topicVocabIdx = allTerms.filter(at => at.topicId === t.topicId).indexOf(t);
                    const cardId = `${t.topicId}-vocab-${topicVocabIdx >= 0 ? topicVocabIdx : tIdx}`;
                    const r = reviews[cardId];
                    let fcBadge = '';
                    if (r && r.interval >= 21) {
                      fcBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">Mastered</span>';
                    } else if (r && r.repetitions > 0) {
                      fcBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium">Learning</span>';
                    } else if (r && r.lapses >= 3) {
                      fcBadge = '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">Struggling</span>';
                    }

                    return `
                    <div class="glossary-term p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors" data-topic="${t.topicId}" data-term-text="${t.term.toLowerCase()}">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <span class="font-bold text-slate-800 dark:text-slate-200">${t.term}</span>
                          ${fcBadge ? `<span class="ml-1.5 align-middle">${fcBadge}</span>` : ''}
                          ${r && r.easeFactor ? (() => {
                            const e = r.easeFactor;
                            const diffLabel = e >= 2.5 ? 'Easy' : e >= 2.0 ? 'Med' : 'Hard';
                            const diffColor = e >= 2.5 ? 'green' : e >= 2.0 ? 'slate' : 'red';
                            return `<span class="text-[8px] text-${diffColor}-400 ml-1" title="Ease: ${e.toFixed(2)}">${diffLabel}</span>`;
                          })() : ''}
                          <p class="text-slate-500 dark:text-slate-400 mt-0.5">${t.definition}</p>
                          <div class="glossary-related hidden mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <span class="text-[10px] text-slate-400 uppercase tracking-wider">Related from ${t.topicTitle}:</span>
                            <div class="flex flex-wrap gap-1 mt-1">
                              ${allTerms.filter(at => at.topicId === t.topicId && at.term !== t.term).slice(0, 6).map(rt =>
                                `<span class="text-[10px] px-1.5 py-0.5 rounded bg-${t.topicColor}-50 dark:bg-${t.topicColor}-900/20 text-${t.topicColor}-600 dark:text-${t.topicColor}-400 cursor-pointer glossary-jump-term" data-jump-term="${rt.term.toLowerCase()}">${rt.term}</span>`
                              ).join('')}
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                          ${(() => {
                            const wc = t.definition.split(/\s+/).length;
                            const complexity = wc <= 10 ? 'Brief' : wc <= 25 ? 'Med' : 'Long';
                            const cc = wc <= 10 ? 'blue' : wc <= 25 ? 'slate' : 'amber';
                            return `<span class="text-[8px] px-1 py-0.5 rounded bg-${cc}-50 dark:bg-${cc}-900/20 text-${cc}-400" title="${wc} words">${wc}w · ${complexity}</span>`;
                          })()}
                          <button class="glossary-copy-btn text-[9px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-300 hover:text-teal-500 hover:border-teal-300 transition-colors" data-copy-text="${t.term}: ${t.definition.replace(/"/g, '&quot;')}" title="Copy to clipboard"><i data-lucide="copy" class="w-3 h-3 inline"></i></button>
                          <a data-route="#/topic/${t.topicId}" class="text-xs px-2 py-1 rounded-full bg-${t.topicColor}-100 dark:bg-${t.topicColor}-900/30 text-${t.topicColor}-600 dark:text-${t.topicColor}-400 cursor-pointer hover:underline whitespace-nowrap">${t.topicTitle}</a>
                        </div>
                      </div>
                    </div>`;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div id="glossary-empty" class="hidden text-center py-12 text-slate-400">
            <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
            <p class="text-lg font-medium">No matching terms</p>
            <p class="text-sm">Try a different search term or filter</p>
          </div>

          <!-- Back to top -->
          <button id="glossary-top-btn" class="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition-all hidden items-center justify-center z-30" title="Back to top">
            <i data-lucide="arrow-up" class="w-5 h-5"></i>
          </button>
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

          // Highlight matching text
          const termEl = el.querySelector('.font-bold');
          const defEl = el.querySelector('p');
          if (termEl && termEl.dataset.origTerm === undefined) termEl.dataset.origTerm = termEl.textContent;
          if (defEl && defEl.dataset.origDef === undefined) defEl.dataset.origDef = defEl.textContent;
          if (query && show && termEl && defEl) {
            const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            termEl.innerHTML = termEl.dataset.origTerm.replace(re, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>');
            defEl.innerHTML = defEl.dataset.origDef.replace(re, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>');
          } else if (termEl && defEl) {
            if (termEl.dataset.origTerm) termEl.textContent = termEl.dataset.origTerm;
            if (defEl.dataset.origDef) defEl.textContent = defEl.dataset.origDef;
          }
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

      // Related terms expand/collapse and jump
      container.querySelector('#glossary-content')?.addEventListener('click', (e) => {
        // Jump to related term
        const jumpEl = e.target.closest('.glossary-jump-term');
        if (jumpEl) {
          const target = jumpEl.dataset.jumpTerm;
          const termEl = [...terms].find(t => t.dataset.termText === target);
          if (termEl) {
            termEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            termEl.classList.add('ring-2', 'ring-teal-400', 'ring-offset-2');
            setTimeout(() => termEl.classList.remove('ring-2', 'ring-teal-400', 'ring-offset-2'), 2000);
          }
          return;
        }
        // Toggle related terms on term click (but not on links)
        if (e.target.closest('a[data-route]') || e.target.closest('.glossary-jump-term')) return;
        const term = e.target.closest('.glossary-term');
        if (term) {
          const related = term.querySelector('.glossary-related');
          if (related) related.classList.toggle('hidden');
          // Track recently viewed
          const termText = term.dataset.termText;
          if (termText) {
            try {
              let recent = JSON.parse(localStorage.getItem('htgaa-glossary-recent') || '[]');
              recent = recent.filter(r => r !== termText);
              recent.unshift(termText);
              localStorage.setItem('htgaa-glossary-recent', JSON.stringify(recent.slice(0, 10)));
            } catch {}
          }
        }
      });

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

      // CSV export
      container.querySelector('#glossary-export-csv')?.addEventListener('click', () => {
        let csv = 'Term,Definition,Topic\n';
        _allTerms.forEach(t => {
          const def = t.definition.replace(/"/g, '""');
          csv += `"${t.term}","${def}","${t.topicTitle}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'htgaa-week2-glossary.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      });

      // Anki export (TSV with tags)
      container.querySelector('#glossary-export-anki')?.addEventListener('click', () => {
        let tsv = '';
        _allTerms.forEach(t => {
          const front = t.term.replace(/\t/g, ' ');
          const back = t.definition.replace(/\t/g, ' ').replace(/\n/g, '<br>');
          const tags = 'htgaa::week2::' + t.topicId;
          tsv += front + '\t' + back + '\t' + tags + '\n';
        });
        const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'htgaa-week2-anki.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      });

      // Random term
      container.querySelector('#glossary-random-term')?.addEventListener('click', () => {
        if (_allTerms.length === 0) return;
        const term = _allTerms[Math.floor(Math.random() * _allTerms.length)];
        const cards = container.querySelectorAll('.glossary-term');
        cards.forEach(card => {
          if (card.dataset.termText === term.term.toLowerCase()) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.transition = 'box-shadow 0.3s, transform 0.3s';
            card.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.5)';
            card.style.transform = 'scale(1.02)';
            setTimeout(() => {
              card.style.boxShadow = '';
              card.style.transform = '';
            }, 2000);
          }
        });
      });

      // Mini quiz
      container.querySelector('#glossary-mini-quiz')?.addEventListener('click', () => {
        const area = container.querySelector('#glossary-mini-quiz-area');
        if (!area || _allTerms.length < 4) return;
        area.classList.remove('hidden');
        // Pick a random term and 3 distractors
        const shuffled = [..._allTerms].sort(() => Math.random() - 0.5);
        const correct = shuffled[0];
        const options = [correct, ...shuffled.slice(1, 4)].sort(() => Math.random() - 0.5);
        const correctIdx = options.indexOf(correct);
        area.innerHTML = `
          <div class="bg-pink-50 dark:bg-pink-900/10 rounded-xl border border-pink-200 dark:border-pink-800 p-5">
            <p class="text-sm font-bold mb-3">What does this term mean?</p>
            <p class="text-lg font-bold text-pink-700 dark:text-pink-300 mb-4">${correct.term}</p>
            <div class="space-y-2" id="mini-quiz-options">
              ${options.map((o, i) => `
                <button class="mini-quiz-opt w-full text-left text-sm p-3 rounded-lg border border-pink-200 dark:border-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors" data-idx="${i}" data-correct="${i === correctIdx ? '1' : '0'}">
                  ${o.definition.substring(0, 120)}${o.definition.length > 120 ? '...' : ''}
                </button>
              `).join('')}
            </div>
          </div>`;
        area.querySelectorAll('.mini-quiz-opt').forEach(btn => {
          btn.addEventListener('click', () => {
            area.querySelectorAll('.mini-quiz-opt').forEach(b => {
              b.disabled = true;
              if (b.dataset.correct === '1') b.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
            });
            if (btn.dataset.correct !== '1') btn.classList.add('border-red-500', 'bg-red-50', 'dark:bg-red-900/20');
          });
        });
        if (window.lucide) lucide.createIcons();
      });

      // Copy term buttons
      container.querySelectorAll('.glossary-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const text = btn.dataset.copyText;
          navigator.clipboard.writeText(text).then(() => {
            btn.innerHTML = '<i data-lucide="check" class="w-3 h-3 inline"></i>';
            btn.classList.add('text-teal-500', 'border-teal-300');
            if (window.lucide) lucide.createIcons();
            setTimeout(() => {
              btn.innerHTML = '<i data-lucide="copy" class="w-3 h-3 inline"></i>';
              btn.classList.remove('text-teal-500', 'border-teal-300');
              if (window.lucide) lucide.createIcons();
            }, 1500);
          }).catch(() => {});
        });
      });

      // Back to top button
      const topBtn = container.querySelector('#glossary-top-btn');
      if (topBtn) {
        const scrollHandler = () => {
          if (window.scrollY > 400) {
            topBtn.classList.remove('hidden');
            topBtn.classList.add('flex');
          } else {
            topBtn.classList.add('hidden');
            topBtn.classList.remove('flex');
          }
        };
        if (_glossaryScrollCleanup) _glossaryScrollCleanup();
        window.addEventListener('scroll', scrollHandler);
        topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        _glossaryScrollCleanup = () => window.removeEventListener('scroll', scrollHandler);
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

      // Sort buttons
      const sortBtns = container.querySelectorAll('.glossary-sort');
      const contentEl = container.querySelector('#glossary-content');
      sortBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          sortBtns.forEach(b => {
            b.classList.remove('bg-teal-50', 'dark:bg-teal-900/20', 'text-teal-600', 'dark:text-teal-400', 'font-medium');
            b.classList.add('text-slate-500', 'dark:text-slate-400');
          });
          btn.classList.add('bg-teal-50', 'dark:bg-teal-900/20', 'text-teal-600', 'dark:text-teal-400', 'font-medium');
          btn.classList.remove('text-slate-500', 'dark:text-slate-400');
          const mode = btn.dataset.sort;
          const reviews = store.get('flashcards').reviews || {};
          // Re-sort _allTerms
          let sorted;
          if (mode === 'topic') {
            sorted = [..._allTerms].sort((a, b) => a.topicId.localeCompare(b.topicId) || a.term.localeCompare(b.term));
          } else if (mode === 'status') {
            const getStatus = (t) => {
              const topicTerms = _allTerms.filter(at => at.topicId === t.topicId);
              const idx = topicTerms.indexOf(t);
              const cardId = `${t.topicId}-vocab-${idx >= 0 ? idx : 0}`;
              const r = reviews[cardId];
              if (!r) return 2; // new (show first)
              if (r.interval >= 21) return 3; // mastered (show last)
              return 1; // learning (show second)
            };
            sorted = [..._allTerms].sort((a, b) => getStatus(a) - getStatus(b) || a.term.localeCompare(b.term));
          } else {
            sorted = [..._allTerms].sort((a, b) => a.term.localeCompare(b.term));
          }
          // Re-order DOM elements
          const termEls = [...contentEl.querySelectorAll('.glossary-term')];
          const termMap = {};
          termEls.forEach(el => {
            const key = el.querySelector('.font-bold')?.textContent?.trim() + '|' + el.dataset.topic;
            termMap[key] = el;
          });
          // For alpha/topic/status sort, hide letter groups and show flat list
          if (mode !== 'alpha') {
            letterGroups.forEach(g => g.style.display = 'none');
            // Create/show a flat container
            let flatEl = contentEl.querySelector('#glossary-flat');
            if (!flatEl) {
              flatEl = document.createElement('div');
              flatEl.id = 'glossary-flat';
              flatEl.className = 'space-y-3';
              contentEl.appendChild(flatEl);
            }
            flatEl.innerHTML = '';
            flatEl.style.display = 'block';
            sorted.forEach(t => {
              const key = t.term + '|' + t.topicId;
              const el = termMap[key];
              if (el) flatEl.appendChild(el.cloneNode(true));
            });
            // Re-bind topic filters to cloned elements
            flatEl.querySelectorAll('.glossary-term').forEach(el => {
              el.style.display = (activeFilter === 'all' || el.dataset.topic === activeFilter) ? '' : 'none';
            });
          } else {
            // Restore alphabetical letter groups
            const flatEl = contentEl.querySelector('#glossary-flat');
            if (flatEl) flatEl.style.display = 'none';
            letterGroups.forEach(g => g.style.display = '');
            applyFilters();
          }
        });
      });
    },

    unmount() {
      if (_glossaryScrollCleanup) {
        _glossaryScrollCleanup();
        _glossaryScrollCleanup = null;
      }
    }
  };
}

export { createGlossaryView };
