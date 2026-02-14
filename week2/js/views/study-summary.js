/**
 * HTGAA Week 2 — Study Summary View
 * Condensed, printable overview of all key takeaways, vocabulary, and facts.
 */

import { store, TOPICS } from '../store.js';

function createStudySummaryView() {
  let allData = [];
  return {
    async render() {
      // Load all topic data
      allData = [];
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
            <div class="flex items-center gap-2 print:hidden">
              <button id="summary-download-md" class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                <i data-lucide="download" class="w-4 h-4"></i> Markdown
              </button>
              <button onclick="window.print()" class="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-2">
                <i data-lucide="printer" class="w-4 h-4"></i> Print
              </button>
            </div>
          </header>

          <!-- Summary stats -->
          <div class="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div class="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 print:bg-blue-50">
              <div class="text-2xl font-bold text-blue-600">${allData.length}</div>
              <div class="text-xs text-slate-500">Topics</div>
            </div>
            <div class="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 print:bg-green-50">
              <div class="text-2xl font-bold text-green-600">${allData.reduce((s, d) => s + (d.data.sections?.length || 0), 0)}</div>
              <div class="text-xs text-slate-500">Sections</div>
            </div>
            <div class="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 print:bg-purple-50">
              <div class="text-2xl font-bold text-purple-600">${allData.reduce((s, d) => s + (d.data.vocabulary?.length || 0), 0)}</div>
              <div class="text-xs text-slate-500">Vocab Terms</div>
            </div>
            <div class="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 print:bg-amber-50">
              <div class="text-2xl font-bold text-amber-600">${allData.reduce((s, d) => s + (d.data.keyFacts?.length || 0), 0)}</div>
              <div class="text-xs text-slate-500">Key Facts</div>
            </div>
          </div>

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

              ${data.quickReference?.length ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Quick Reference</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    ${data.quickReference.map(qr => `
                      <div class="p-2 rounded-lg bg-${topic.color}-50 dark:bg-${topic.color}-900/10 border border-${topic.color}-200 dark:border-${topic.color}-800">
                        <span class="font-bold text-xs">${qr.title}</span>
                        <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">${qr.content?.substring(0, 200) || ''}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${data.conceptConnections?.length ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Connections to Other Topics</h3>
                  <div class="text-xs space-y-1">
                    ${data.conceptConnections.map(c => `
                      <div class="flex items-center gap-2">
                        <span class="text-slate-400">&rarr;</span>
                        <span><strong>${TOPICS.find(t => t.id === c.toTopic)?.title || c.toTopic}</strong>: ${c.relationship}</span>
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

          <!-- Cross-Topic Connection Map -->
          ${(() => {
            const allConnections = [];
            allData.forEach(({ topic, data }) => {
              (data.conceptConnections || []).forEach(c => {
                const target = TOPICS.find(t => t.id === c.toTopic);
                if (target) allConnections.push({ from: topic.title, to: target.title, relationship: c.relationship, concept: c.concept || '' });
              });
            });
            if (allConnections.length === 0) return '';
            return `
            <section class="mb-8 page-break-inside-avoid">
              <h2 class="text-xl font-bold mb-3 flex items-center gap-2 border-b-2 border-slate-300 dark:border-slate-600 pb-2">
                <i data-lucide="network" class="w-5 h-5 text-cyan-500"></i>
                Cross-Topic Connections (${allConnections.length})
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                ${allConnections.map(c => `
                  <div class="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800">
                    <div class="font-bold">${c.from} &rarr; ${c.to}</div>
                    <div class="text-slate-600 dark:text-slate-400 mt-0.5">${c.concept ? `<strong>${c.concept}:</strong> ` : ''}${c.relationship}</div>
                  </div>
                `).join('')}
              </div>
            </section>`;
          })()}

          <footer class="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 print:mt-4">
            HTGAA Spring 2026 — Week 2 Study Summary — Generated ${new Date().toLocaleDateString()}
          </footer>
        </div>
      `;
    },

    mount(container) {
      // Markdown download
      container.querySelector('#summary-download-md')?.addEventListener('click', () => {
        let md = `# HTGAA Week 2 — Study Summary\n\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
        allData.forEach(({ topic, data }) => {
          md += `## ${data.title}\n\n`;
          if (data.learningObjectives) {
            md += `### Learning Objectives\n`;
            data.learningObjectives.forEach(obj => { md += `- ${obj}\n`; });
            md += '\n';
          }
          if (data.sections?.some(s => s.takeaway)) {
            md += `### Key Takeaways\n`;
            data.sections.filter(s => s.takeaway).forEach(s => {
              md += `- **${s.title}**: ${s.takeaway}\n`;
            });
            md += '\n';
          }
          if (data.keyFacts?.length) {
            md += `### Key Facts\n`;
            data.keyFacts.forEach(f => {
              md += `- ${f.label || f.fact || ''} ${f.value || ''}\n`;
            });
            md += '\n';
          }
          if (data.vocabulary?.length) {
            md += `### Vocabulary (${data.vocabulary.length} terms)\n`;
            data.vocabulary.forEach(v => {
              md += `- **${v.term}**: ${v.definition}\n`;
            });
            md += '\n';
          }
          md += '---\n\n';
        });
        const blob = new Blob([md], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'htgaa-week2-study-summary.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      });
    },
    unmount() {}
  };
}

export { createStudySummaryView };
