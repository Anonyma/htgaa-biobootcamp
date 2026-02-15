/**
 * HTGAA Week 2 — Topic Comparison View
 * Side-by-side comparison of two topics showing key facts, vocabulary, and connections.
 */

import { store, TOPICS } from '../store.js';

function createCompareView(topicA, topicB) {
  return {
    async render() {
      // If no topics selected yet, show picker
      if (!topicA || !topicB) {
        return renderPicker(topicA, topicB);
      }

      const dataA = await store.loadTopicData(topicA);
      const dataB = await store.loadTopicData(topicB);
      if (!dataA || !dataB) return renderError();

      return renderComparison(dataA, dataB, topicA, topicB);
    },

    mount(container) {
      // Topic picker dropdowns
      const selA = container.querySelector('#compare-topic-a');
      const selB = container.querySelector('#compare-topic-b');
      const goBtn = container.querySelector('#compare-go-btn');

      if (selA && selB && goBtn) {
        goBtn.addEventListener('click', () => {
          const a = selA.value;
          const b = selB.value;
          if (a && b && a !== b) {
            window.location.hash = `#/compare/${a}/${b}`;
          }
        });
      }

      // Swap button
      const swapBtn = container.querySelector('#compare-swap-btn');
      if (swapBtn && topicA && topicB) {
        swapBtn.addEventListener('click', () => {
          window.location.hash = `#/compare/${topicB}/${topicA}`;
        });
      }

      // Export comparison as markdown
      const exportBtn = container.querySelector('#compare-export-btn');
      if (exportBtn && topicA && topicB) {
        exportBtn.addEventListener('click', async () => {
          const dA = await store.loadTopicData(topicA);
          const dB = await store.loadTopicData(topicB);
          if (!dA || !dB) return;
          const mA = TOPICS.find(t => t.id === topicA);
          const mB = TOPICS.find(t => t.id === topicB);
          let md = `# Topic Comparison: ${mA?.title} vs ${mB?.title}\n\n`;
          md += `## ${mA?.title}\n- Reading time: ${dA.readingTime || '?'} min\n- Sections: ${(dA.sections || []).length}\n- Vocab terms: ${(dA.vocabulary || []).length}\n\n`;
          md += `## ${mB?.title}\n- Reading time: ${dB.readingTime || '?'} min\n- Sections: ${(dB.sections || []).length}\n- Vocab terms: ${(dB.vocabulary || []).length}\n\n`;
          const vA = new Set((dA.vocabulary || []).map(v => v.term.toLowerCase()));
          const vB = new Set((dB.vocabulary || []).map(v => v.term.toLowerCase()));
          const shared = [...vA].filter(t => vB.has(t));
          if (shared.length > 0) {
            md += `## Shared Vocabulary (${shared.length})\n`;
            shared.forEach(t => { md += `- ${t}\n`; });
            md += '\n';
          }
          const conn = [...(dA.conceptConnections || []).filter(c => c.toTopic === topicB), ...(dB.conceptConnections || []).filter(c => c.toTopic === topicA)];
          if (conn.length > 0) {
            md += `## Connections\n`;
            conn.forEach(c => { md += `- ${c.concept || ''}: ${c.relationship}\n`; });
            md += '\n';
          }
          const blob = new Blob([md], { type: 'text/markdown' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `compare-${topicA}-vs-${topicB}.md`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
        });
      }

      if (window.lucide) lucide.createIcons();
    },

    unmount() {}
  };
}

function renderPicker(preA, preB) {
  const topicOptions = TOPICS.map(t =>
    `<option value="${t.id}">${t.title}</option>`
  ).join('');

  return `
    <div class="max-w-2xl mx-auto px-4 py-12">
      <div class="text-center mb-8">
        <i data-lucide="columns" class="w-12 h-12 mx-auto mb-3 text-blue-500"></i>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">Compare Topics</h1>
        <p class="text-slate-500 dark:text-slate-400">Select two topics to compare their key concepts, vocabulary, and connections side by side.</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Topic A</label>
            <select id="compare-topic-a" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white">
              <option value="">Choose...</option>
              ${topicOptions}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Topic B</label>
            <select id="compare-topic-b" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white">
              <option value="">Choose...</option>
              ${topicOptions}
            </select>
          </div>
        </div>
        <button id="compare-go-btn" class="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Compare Topics
        </button>
      </div>

      <!-- Suggested comparisons -->
      <div class="mt-6">
        <h3 class="text-sm font-semibold text-slate-500 mb-3 text-center">Suggested Comparisons</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          ${(() => {
            const suggestions = [
              { a: 'sequencing', b: 'synthesis', label: 'Reading vs Writing DNA' },
              { a: 'central-dogma', b: 'genetic-codes', label: 'Expression & Codes' },
              { a: 'editing', b: 'synthesis', label: 'Editing vs Building' },
            ];
            return suggestions.map(s => {
              const tA = TOPICS.find(t => t.id === s.a);
              const tB = TOPICS.find(t => t.id === s.b);
              return `
                <a data-route="#/compare/${s.a}/${s.b}" class="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer text-sm group">
                  <div class="flex items-center gap-1 flex-1">
                    <i data-lucide="${tA?.icon || 'book'}" class="w-3.5 h-3.5 text-${tA?.color || 'slate'}-500"></i>
                    <span class="font-medium">${tA?.title || s.a}</span>
                    <span class="text-slate-400 mx-1">vs</span>
                    <i data-lucide="${tB?.icon || 'book'}" class="w-3.5 h-3.5 text-${tB?.color || 'slate'}-500"></i>
                    <span class="font-medium">${tB?.title || s.b}</span>
                  </div>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 flex-shrink-0 transition-colors"></i>
                </a>
              `;
            }).join('');
          })()}
        </div>
      </div>

      <div class="mt-4 text-center">
        <a data-route="#/" class="text-blue-500 hover:underline cursor-pointer text-sm">Back to Dashboard</a>
      </div>
    </div>
  `;
}

function renderComparison(dataA, dataB, idA, idB) {
  const metaA = TOPICS.find(t => t.id === idA);
  const metaB = TOPICS.find(t => t.id === idB);

  const vocabA = (dataA.vocabulary || []);
  const vocabB = (dataB.vocabulary || []);
  const vocabTermsA = new Set(vocabA.map(v => v.term.toLowerCase()));
  const vocabTermsB = new Set(vocabB.map(v => v.term.toLowerCase()));
  const sharedTerms = [...vocabTermsA].filter(t => vocabTermsB.has(t));

  const keyFactsA = dataA.keyFacts || [];
  const keyFactsB = dataB.keyFacts || [];

  const connectionsA = (dataA.conceptConnections || []);
  const connectionsB = (dataB.conceptConnections || []);

  // Find mutual connections (A references B or B references A)
  const mutualConnections = [
    ...connectionsA.filter(c => c.toTopic === idB),
    ...connectionsB.filter(c => c.toTopic === idA)
  ];

  const quizScoreA = store.getQuizScore(idA);
  const quizScoreB = store.getQuizScore(idB);

  return `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <a data-route="#/" class="text-sm text-blue-500 hover:underline cursor-pointer mb-1 inline-block">&larr; Dashboard</a>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Topic Comparison</h1>
        </div>
        <div class="flex gap-2">
          <button id="compare-swap-btn" class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Swap topics">
            <i data-lucide="arrow-left-right" class="w-4 h-4 inline"></i> Swap
          </button>
          <button id="compare-export-btn" class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Export comparison">
            <i data-lucide="download" class="w-4 h-4 inline"></i> Export
          </button>
          <a data-route="#/compare" class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
            Change Topics
          </a>
        </div>
      </div>

      <!-- Topic Headers -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-xl border-2 border-${metaA?.color || 'blue'}-200 dark:border-${metaA?.color || 'blue'}-800 p-4">
          <div class="flex items-center gap-3">
            <i data-lucide="${metaA?.icon || 'book'}" class="w-6 h-6 text-${metaA?.color || 'blue'}-500"></i>
            <div>
              <h2 class="font-bold text-lg text-slate-800 dark:text-white">${dataA.title || metaA?.title}</h2>
              <p class="text-xs text-slate-500">${dataA.readingTime || '?'} min read &bull; ${(dataA.sections || []).length} sections</p>
            </div>
          </div>
          ${quizScoreA ? `<p class="text-xs mt-2 text-slate-500">Quiz: ${quizScoreA.correct}/${quizScoreA.total} (${Math.round(quizScoreA.correct/quizScoreA.total*100)}%)</p>` : ''}
          ${(() => {
            const m = store.getTopicMastery(idA, dataA);
            if (!m || m.mastery === 0) return '';
            const c = m.mastery >= 80 ? 'green' : m.mastery >= 50 ? 'amber' : 'red';
            return `<div class="flex items-center gap-2 mt-2"><div class="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div class="h-full rounded-full bg-${c}-500" style="width:${m.mastery}%"></div></div><span class="text-xs font-bold text-${c}-600 dark:text-${c}-400">${m.mastery}%</span></div>`;
          })()}
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border-2 border-${metaB?.color || 'blue'}-200 dark:border-${metaB?.color || 'blue'}-800 p-4">
          <div class="flex items-center gap-3">
            <i data-lucide="${metaB?.icon || 'book'}" class="w-6 h-6 text-${metaB?.color || 'blue'}-500"></i>
            <div>
              <h2 class="font-bold text-lg text-slate-800 dark:text-white">${dataB.title || metaB?.title}</h2>
              <p class="text-xs text-slate-500">${dataB.readingTime || '?'} min read &bull; ${(dataB.sections || []).length} sections</p>
            </div>
          </div>
          ${quizScoreB ? `<p class="text-xs mt-2 text-slate-500">Quiz: ${quizScoreB.correct}/${quizScoreB.total} (${Math.round(quizScoreB.correct/quizScoreB.total*100)}%)</p>` : ''}
          ${(() => {
            const m = store.getTopicMastery(idB, dataB);
            if (!m || m.mastery === 0) return '';
            const c = m.mastery >= 80 ? 'green' : m.mastery >= 50 ? 'amber' : 'red';
            return `<div class="flex items-center gap-2 mt-2"><div class="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div class="h-full rounded-full bg-${c}-500" style="width:${m.mastery}%"></div></div><span class="text-xs font-bold text-${c}-600 dark:text-${c}-400">${m.mastery}%</span></div>`;
          })()}
        </div>
      </div>

      <!-- Similarity Score -->
      <div class="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Similarity Analysis</h3>
        <div class="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
          ${(() => {
            const vocabOverlap = vocabTermsA.size > 0 && vocabTermsB.size > 0 ? Math.round((sharedTerms.length / Math.min(vocabTermsA.size, vocabTermsB.size)) * 100) : 0;
            const objA = (dataA.learningObjectives || []);
            const objB = (dataB.learningObjectives || []);
            const avgSections = Math.round(((dataA.sections || []).length + (dataB.sections || []).length) / 2);
            return `
              <div>
                <div class="text-2xl font-bold ${vocabOverlap > 30 ? 'text-green-600' : vocabOverlap > 10 ? 'text-yellow-600' : 'text-slate-500'}">${vocabOverlap}%</div>
                <div class="text-xs text-slate-500">Vocab Overlap</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-blue-600">${mutualConnections.length}</div>
                <div class="text-xs text-slate-500">Direct Links</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-purple-600">${sharedTerms.length}</div>
                <div class="text-xs text-slate-500">Shared Terms</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-teal-600">${(dataA.vocabulary || []).length + (dataB.vocabulary || []).length}</div>
                <div class="text-xs text-slate-500">Combined Vocab</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-slate-600">${(dataA.readingTime || 0) + (dataB.readingTime || 0)}m</div>
                <div class="text-xs text-slate-500">Total Reading</div>
              </div>
            `;
          })()}
        </div>
        ${(() => {
          const scoreA = quizScoreA ? Math.round(quizScoreA.correct / quizScoreA.total * 100) : null;
          const scoreB = quizScoreB ? Math.round(quizScoreB.correct / quizScoreB.total * 100) : null;
          if (scoreA !== null && scoreB !== null && Math.abs(scoreA - scoreB) > 15) {
            const weaker = scoreA < scoreB ? metaA?.title : metaB?.title;
            const stronger = scoreA >= scoreB ? metaA?.title : metaB?.title;
            return `<p class="text-xs text-amber-600 dark:text-amber-400 mt-3 text-center">You're scoring lower on <strong>${weaker}</strong> — consider reviewing its vocabulary using shared concepts from <strong>${stronger}</strong>.</p>`;
          }
          return '';
        })()}
      </div>

      ${mutualConnections.length > 0 ? `
      <!-- Mutual Connections -->
      <div class="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <i data-lucide="link" class="w-4 h-4 text-blue-500"></i> How These Topics Connect
        </h3>
        <div class="space-y-2">
          ${mutualConnections.map(c => `
            <div class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span class="text-blue-500 mt-0.5">&#x2022;</span>
              <span><strong>${c.concept || ''}</strong>${c.concept ? ': ' : ''}${c.relationship}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Learning Objectives -->
      ${(dataA.learningObjectives?.length || dataB.learningObjectives?.length) ? `
      <div class="mb-8">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i data-lucide="target" class="w-5 h-5 text-indigo-500"></i> Learning Objectives
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <ul class="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
            ${(dataA.learningObjectives || []).map(obj => `<li class="flex items-start gap-2"><span class="text-${metaA?.color || 'blue'}-400 mt-1 flex-shrink-0">&#x2022;</span> ${obj}</li>`).join('')}
          </ul>
          <ul class="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
            ${(dataB.learningObjectives || []).map(obj => `<li class="flex items-start gap-2"><span class="text-${metaB?.color || 'blue'}-400 mt-1 flex-shrink-0">&#x2022;</span> ${obj}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      <!-- Key Facts Side by Side -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i data-lucide="zap" class="w-5 h-5 text-amber-500"></i> Key Facts
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            ${keyFactsA.map(f => `
              <div class="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-sm">
                ${typeof f === 'string' ? f : (f.fact || f.text || JSON.stringify(f))}
              </div>
            `).join('')}
          </div>
          <div class="space-y-2">
            ${keyFactsB.map(f => `
              <div class="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-sm">
                ${typeof f === 'string' ? f : (f.fact || f.text || JSON.stringify(f))}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Vocabulary Comparison -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i data-lucide="book-open" class="w-5 h-5 text-green-500"></i> Vocabulary
          ${sharedTerms.length > 0 ? `<span class="text-xs font-normal bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">${sharedTerms.length} shared terms</span>` : ''}
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            ${vocabA.map(v => {
              const isShared = vocabTermsB.has(v.term.toLowerCase());
              return `
                <div class="text-sm px-3 py-1.5 rounded-lg ${isShared ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}">
                  <strong>${v.term}</strong>${isShared ? ' <span class="text-green-600 dark:text-green-400 text-xs">shared</span>' : ''}
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${v.definition}</p>
                </div>
              `;
            }).join('')}
          </div>
          <div class="space-y-1.5">
            ${vocabB.map(v => {
              const isShared = vocabTermsA.has(v.term.toLowerCase());
              return `
                <div class="text-sm px-3 py-1.5 rounded-lg ${isShared ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}">
                  <strong>${v.term}</strong>${isShared ? ' <span class="text-green-600 dark:text-green-400 text-xs">shared</span>' : ''}
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${v.definition}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Learning Objectives -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i data-lucide="target" class="w-5 h-5 text-red-500"></i> Learning Objectives
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <ul class="space-y-1.5">
            ${(dataA.learningObjectives || []).map(o => `
              <li class="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <span class="text-blue-500 mt-0.5">&#x2713;</span> ${o}
              </li>
            `).join('')}
          </ul>
          <ul class="space-y-1.5">
            ${(dataB.learningObjectives || []).map(o => `
              <li class="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <span class="text-blue-500 mt-0.5">&#x2713;</span> ${o}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <!-- Section Outlines -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i data-lucide="list" class="w-5 h-5 text-indigo-500"></i> Chapter Outline
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            ${(dataA.sections || []).map((s, i) => `
              <a data-route="#/topic/${idA}" class="flex items-center gap-2 text-sm px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-600 dark:text-slate-400">
                <span class="text-xs text-slate-400 w-5">${i + 1}.</span> ${s.title}
              </a>
            `).join('')}
          </div>
          <div class="space-y-1">
            ${(dataB.sections || []).map((s, i) => `
              <a data-route="#/topic/${idB}" class="flex items-center gap-2 text-sm px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-600 dark:text-slate-400">
                <span class="text-xs text-slate-400 w-5">${i + 1}.</span> ${s.title}
              </a>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Mastery Comparison -->
      ${(() => {
        const mA = store.getTopicMastery(idA, dataA);
        const mB = store.getTopicMastery(idB, dataB);
        if ((!mA || mA.mastery === 0) && (!mB || mB.mastery === 0)) return '';
        const dims = ['sectionPct', 'quizPct', 'fcPct', 'timePct'];
        const labels = { sectionPct: 'Reading', quizPct: 'Quiz', fcPct: 'Flashcards', timePct: 'Time' };
        return `
        <div class="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <i data-lucide="bar-chart-3" class="w-5 h-5 text-emerald-500"></i> Mastery Comparison
          </h3>
          <div class="grid grid-cols-2 gap-4 mb-4 text-center">
            <div class="text-3xl font-bold text-${metaA?.color || 'blue'}-600">${mA?.mastery || 0}%</div>
            <div class="text-3xl font-bold text-${metaB?.color || 'blue'}-600">${mB?.mastery || 0}%</div>
          </div>
          <div class="space-y-3">
            ${dims.map(d => `
              <div>
                <div class="flex justify-between text-xs text-slate-500 mb-1">
                  <span>${mA?.[d] || 0}%</span>
                  <span class="font-medium text-slate-700 dark:text-slate-300">${labels[d]}</span>
                  <span>${mB?.[d] || 0}%</span>
                </div>
                <div class="flex gap-1 h-2">
                  <div class="flex-1 bg-slate-200 dark:bg-slate-700 rounded-l-full overflow-hidden flex justify-end">
                    <div class="h-full bg-${metaA?.color || 'blue'}-500 rounded-l-full" style="width:${mA?.[d] || 0}%"></div>
                  </div>
                  <div class="flex-1 bg-slate-200 dark:bg-slate-700 rounded-r-full overflow-hidden">
                    <div class="h-full bg-${metaB?.color || 'blue'}-500 rounded-r-full" style="width:${mB?.[d] || 0}%"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
      })()}

      <!-- Time Invested -->
      ${(() => {
        try {
          const times = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
          const tA = times[idA] || 0;
          const tB = times[idB] || 0;
          if (tA === 0 && tB === 0) return '';
          const fmtTime = (s) => { const m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`; };
          const maxT = Math.max(tA, tB, 1);
          return `
          <div class="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <i data-lucide="clock" class="w-4 h-4 text-cyan-500"></i> Time Invested
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="font-medium text-${metaA?.color || 'blue'}-600">${metaA?.title}</span>
                  <span class="text-slate-500">${fmtTime(tA)}</span>
                </div>
                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-${metaA?.color || 'blue'}-500 rounded-full" style="width:${(tA/maxT)*100}%"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="font-medium text-${metaB?.color || 'blue'}-600">${metaB?.title}</span>
                  <span class="text-slate-500">${fmtTime(tB)}</span>
                </div>
                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-${metaB?.color || 'blue'}-500 rounded-full" style="width:${(tB/maxT)*100}%"></div>
                </div>
              </div>
            </div>
          </div>`;
        } catch { return ''; }
      })()}

      <!-- Quick links -->
      <div class="flex justify-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <a data-route="#/topic/${idA}" class="text-sm text-blue-500 hover:underline cursor-pointer">Read ${metaA?.title}</a>
        <span class="text-slate-300">|</span>
        <a data-route="#/topic/${idB}" class="text-sm text-blue-500 hover:underline cursor-pointer">Read ${metaB?.title}</a>
        <span class="text-slate-300">|</span>
        <a data-route="#/concept-map" class="text-sm text-blue-500 hover:underline cursor-pointer">Concept Map</a>
      </div>
    </div>
  `;
}

function renderError() {
  return `
    <div class="max-w-2xl mx-auto px-4 py-16 text-center">
      <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-4 text-red-400"></i>
      <h2 class="text-xl font-bold mb-2">Could not load topics</h2>
      <a data-route="#/compare" class="text-blue-500 hover:underline cursor-pointer">Try again</a>
    </div>
  `;
}

export { createCompareView };
