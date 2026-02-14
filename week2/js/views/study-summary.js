/**
 * HTGAA Week 2 — Study Summary View
 * Condensed, printable overview of all key takeaways, vocabulary, and facts.
 */

import { store, TOPICS } from '../store.js';

function createStudySummaryView() {
  return {
    async render() {
      // Load all topic data
      const allData = [];
      for (const topic of TOPICS) {
        const data = await store.loadTopicData(topic.id);
        if (data) allData.push({ topic, data });
      }

      return `
        <div class="max-w-4xl mx-auto px-4 py-8 study-summary-page">
          <header class="mb-8 flex items-center justify-between print:mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center print:hidden">
                <i data-lucide="printer" class="w-6 h-6 text-rose-600 dark:text-rose-400"></i>
              </div>
              <div>
                <h1 class="text-3xl font-extrabold print:text-2xl">Study Summary</h1>
                <p class="text-sm text-slate-500">HTGAA Week 2 — All topics at a glance</p>
              </div>
            </div>
            <button onclick="window.print()" class="print:hidden px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-2">
              <i data-lucide="printer" class="w-4 h-4"></i> Print
            </button>
          </header>

          ${allData.map(({ topic, data }) => `
            <section class="mb-8 page-break-inside-avoid">
              <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-${topic.color}-600 dark:text-${topic.color}-400 border-b-2 border-${topic.color}-200 dark:border-${topic.color}-800 pb-2">
                <i data-lucide="${topic.icon}" class="w-5 h-5"></i>
                ${data.title}
              </h2>

              ${data.learningObjectives ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Learning Objectives</h3>
                  <ul class="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
                    ${data.learningObjectives.map(obj => `<li class="list-disc">${obj}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${(data.sections || []).some(s => s.takeaway) ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Key Takeaways</h3>
                  <div class="space-y-2">
                    ${data.sections.filter(s => s.takeaway).map(s => `
                      <div class="text-sm border-l-3 border-${topic.color}-300 dark:border-${topic.color}-700 pl-3 py-1">
                        <span class="font-semibold">${s.title}:</span>
                        <span class="text-slate-600 dark:text-slate-400">${s.takeaway}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${data.keyFacts?.length ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Key Facts</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    ${data.keyFacts.map(f => `
                      <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <span class="font-semibold">${f.label || f.fact || ''}</span>
                        ${f.value ? `<span class="text-${topic.color}-600 dark:text-${topic.color}-400 font-bold ml-1">${f.value}</span>` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${data.vocabulary?.length ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Vocabulary (${data.vocabulary.length} terms)</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    ${data.vocabulary.map(v => `
                      <div class="py-1">
                        <span class="font-bold">${v.term}</span>: <span class="text-slate-500 dark:text-slate-400">${v.definition}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </section>
          `).join('')}

          <footer class="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 print:mt-4">
            HTGAA Spring 2026 — Week 2 Study Summary — Generated ${new Date().toLocaleDateString()}
          </footer>
        </div>
      `;
    },

    mount() {},
    unmount() {}
  };
}

export { createStudySummaryView };
