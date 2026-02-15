/**
 * HTGAA Week 2 — Mistakes Review View
 * Shows all wrong quiz answers across all topics with explanations
 * and links to review the relevant content.
 */

import { store, TOPICS } from '../store.js';

function createMistakesView() {
  let topicDataCache = {};
  let loaded = false;

  return {
    render() {
      const allWrong = store.getAllWrongAnswers();
      const quizzes = store.get('quizzes') || {};
      const totalAnswered = Object.keys(quizzes).length;
      const totalCorrect = Object.values(quizzes).filter(v => v).length;
      const totalWrong = totalAnswered - totalCorrect;
      const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <i data-lucide="circle-x" class="w-5 h-5 text-rose-600 dark:text-rose-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Mistake Review</h1>
                <p class="text-sm text-slate-500">Learn from your wrong answers to improve retention</p>
              </div>
            </div>
          </header>

          <!-- Stats Banner -->
          <div class="mb-8 p-5 rounded-2xl ${accuracy >= 80 ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40' : accuracy >= 50 ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40' : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40'}">
            <div class="flex items-center gap-6 flex-wrap">
              <div class="text-center">
                <div class="text-3xl font-bold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 50 ? 'text-amber-600' : 'text-red-600'}">${accuracy}%</div>
                <div class="text-xs text-slate-500">Accuracy</div>
              </div>
              <div class="flex gap-6 text-sm">
                <div><span class="font-bold text-green-600">${totalCorrect}</span> <span class="text-slate-500">correct</span></div>
                <div><span class="font-bold text-red-600">${totalWrong}</span> <span class="text-slate-500">wrong</span></div>
                <div><span class="font-bold text-slate-600 dark:text-slate-300">${totalAnswered}</span> <span class="text-slate-500">total</span></div>
              </div>
            </div>
          </div>

          ${totalWrong === 0 ? `
            <div class="text-center py-16">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <i data-lucide="check-circle-2" class="w-8 h-8 text-green-500"></i>
              </div>
              <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                ${totalAnswered === 0 ? 'No quizzes taken yet' : 'Perfect score!'}
              </h3>
              <p class="text-sm text-slate-500 max-w-md mx-auto mb-4">
                ${totalAnswered === 0 ? 'Start reading topics and answer quiz questions to track your understanding.' : 'You haven\'t gotten any answers wrong. Keep up the great work!'}
              </p>
              <a data-route="#/" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                <i data-lucide="book-open" class="w-4 h-4"></i> ${totalAnswered === 0 ? 'Start Learning' : 'Back to Hub'}
              </a>
            </div>
          ` : `
            <!-- Loading state for question details -->
            <div id="mistakes-content">
              <div class="text-center py-8 text-slate-400">
                <i data-lucide="loader-2" class="w-6 h-6 mx-auto mb-2 animate-spin"></i>
                <p class="text-sm">Loading question details...</p>
              </div>
            </div>
          `}
        </div>
      `;
    },

    async mount(container) {
      const allWrong = store.getAllWrongAnswers();
      if (allWrong.length === 0) return;

      // Load topic data to get question details
      const topicIds = [...new Set(allWrong.map(id => id.split('-')[0]))];
      for (const topicId of topicIds) {
        try {
          topicDataCache[topicId] = await store.loadTopicData(topicId);
        } catch {}
      }

      // Build the detailed mistake cards
      const contentEl = container.querySelector('#mistakes-content');
      if (!contentEl) return;

      // Group mistakes by topic
      const byTopic = {};
      allWrong.forEach(qId => {
        const topicId = qId.split('-')[0];
        if (!byTopic[topicId]) byTopic[topicId] = [];
        byTopic[topicId].push(qId);
      });

      let html = '';

      for (const [topicId, questionIds] of Object.entries(byTopic)) {
        const topic = TOPICS.find(t => t.id === topicId);
        if (!topic) continue;
        const data = topicDataCache[topicId];
        const questions = data?.quizQuestions || [];

        html += `
          <div class="mb-8">
            <h2 class="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              <i data-lucide="${topic.icon}" class="w-4 h-4 text-${topic.color}-500"></i>
              ${topic.title}
              <span class="text-xs font-normal">(${questionIds.length} wrong)</span>
            </h2>
            <div class="space-y-3">
        `;

        for (const qId of questionIds) {
          // Parse question index from ID like "sequencing-q-3"
          const parts = qId.split('-');
          const qIdx = parseInt(parts[parts.length - 1]);
          const question = questions[qIdx];

          if (question) {
            const correctAnswer = question.options?.[question.correctIndex] || question.answer || 'N/A';
            const explanation = question.explanation || '';

            html += `
              <div class="p-4 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800/40">
                <div class="flex items-start gap-3">
                  <div class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i data-lucide="x" class="w-3.5 h-3.5 text-red-500"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">${question.question || question.text || 'Question'}</p>
                    <div class="flex items-start gap-2 mb-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40">
                      <i data-lucide="check" class="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5"></i>
                      <div>
                        <span class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">Correct Answer:</span>
                        <p class="text-sm text-green-700 dark:text-green-300">${correctAnswer}</p>
                      </div>
                    </div>
                    ${explanation ? `
                      <div class="text-xs text-slate-500 leading-relaxed">
                        <span class="font-semibold">Why:</span> ${explanation}
                      </div>
                    ` : ''}
                    <a data-route="#/topic/${topicId}" class="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-500 hover:text-blue-600 cursor-pointer">
                      Review in context <i data-lucide="arrow-right" class="w-3 h-3"></i>
                    </a>
                  </div>
                </div>
              </div>
            `;
          } else {
            html += `
              <div class="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="x" class="w-3.5 h-3.5 text-red-500"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-slate-500">Question ${qId}</p>
                  </div>
                  <a data-route="#/topic/${topicId}" class="text-xs text-blue-500 cursor-pointer">Review topic</a>
                </div>
              </div>
            `;
          }
        }

        html += `
            </div>
          </div>
        `;
      }

      // Add retry suggestion
      html += `
        <div class="text-center py-6 border-t border-slate-200 dark:border-slate-700">
          <p class="text-sm text-slate-500 mb-3">Review these concepts, then retake the quizzes to improve your score.</p>
          <div class="flex justify-center gap-3">
            <a data-route="#/exam" class="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 cursor-pointer transition-colors">
              <i data-lucide="trophy" class="w-4 h-4"></i> Practice Exam
            </a>
            <a data-route="#/weak-points" class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer transition-colors">
              <i data-lucide="crosshair" class="w-4 h-4"></i> Weak Points
            </a>
          </div>
        </div>
      `;

      contentEl.innerHTML = html;
      if (window.lucide) lucide.createIcons();
    }
  };
}

export { createMistakesView };
