/**
 * HTGAA Week 2 — Quick Practice
 * Random quiz questions from all topics for rapid study sessions.
 * Lightweight alternative to full exam mode.
 */

import { store, TOPICS } from '../store.js';

function createQuickPracticeView() {
  let allQuestions = [];
  let currentIdx = 0;
  let answered = 0;
  let correct = 0;
  let selectedAnswer = null;
  let showingResult = false;
  let containerEl = null;
  let loaded = false;

  return {
    render() {
      return `
        <div class="max-w-3xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <i data-lucide="zap" class="w-5 h-5 text-orange-600 dark:text-orange-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Quick Practice</h1>
                <p class="text-sm text-slate-500">Random questions from all topics — no pressure</p>
              </div>
            </div>
          </header>

          <div id="practice-content">
            <div class="text-center py-12 text-slate-400">
              <i data-lucide="loader-2" class="w-8 h-8 mx-auto mb-3 animate-spin"></i>
              <p class="text-sm">Loading questions from all topics...</p>
            </div>
          </div>
        </div>
      `;
    },

    async mount(container) {
      containerEl = container;

      // Load all topic data and collect questions
      for (const topic of TOPICS) {
        try {
          const data = await store.loadTopicData(topic.id);
          if (data?.quizQuestions) {
            data.quizQuestions.forEach((q, i) => {
              allQuestions.push({
                ...q,
                topicId: topic.id,
                topicTitle: topic.title,
                topicIcon: topic.icon,
                topicColor: topic.color,
                qId: `${topic.id}-q-${i}`,
                originalIndex: i
              });
            });
          }
        } catch {}
      }

      // Shuffle questions
      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }

      loaded = true;

      if (allQuestions.length === 0) {
        renderEmpty(container);
        return;
      }

      renderQuestion(container);
    }
  };

  function renderEmpty(container) {
    const el = container.querySelector('#practice-content');
    if (!el) return;
    el.innerHTML = `
      <div class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <i data-lucide="help-circle" class="w-8 h-8 text-slate-400"></i>
        </div>
        <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No questions available</h3>
        <p class="text-sm text-slate-500 mb-4">Start reading topics to unlock quiz questions.</p>
        <a data-route="#/" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">
          <i data-lucide="book-open" class="w-4 h-4"></i> Start Learning
        </a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  function renderQuestion(container) {
    const el = container.querySelector('#practice-content');
    if (!el || currentIdx >= allQuestions.length) {
      renderComplete(container);
      return;
    }

    const q = allQuestions[currentIdx];
    selectedAnswer = null;
    showingResult = false;

    el.innerHTML = `
      <!-- Progress bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-slate-500">Question ${answered + 1}</span>
          <div class="flex items-center gap-3 text-xs">
            <span class="text-green-600 font-bold">${correct} correct</span>
            <span class="text-red-600 font-bold">${answered - correct} wrong</span>
          </div>
        </div>
        <div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div class="h-full rounded-full bg-orange-500 transition-all" style="width: ${allQuestions.length > 0 ? (answered / Math.min(allQuestions.length, 20)) * 100 : 0}%"></div>
        </div>
      </div>

      <!-- Topic badge -->
      <div class="flex items-center gap-2 mb-4">
        <div class="w-5 h-5 rounded flex items-center justify-center bg-${q.topicColor}-100 dark:bg-${q.topicColor}-900/40">
          <i data-lucide="${q.topicIcon}" class="w-3 h-3 text-${q.topicColor}-600 dark:text-${q.topicColor}-400"></i>
        </div>
        <span class="text-xs font-medium text-${q.topicColor}-600 dark:text-${q.topicColor}-400">${q.topicTitle}</span>
      </div>

      <!-- Question -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">${q.question || q.text}</h2>
      </div>

      <!-- Options -->
      <div class="space-y-2 mb-6" id="practice-options">
        ${(q.options || []).map((opt, i) => `
          <button class="practice-option w-full text-left px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all cursor-pointer group" data-idx="${i}">
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 group-hover:text-orange-600 transition-colors">
                ${String.fromCharCode(65 + i)}
              </span>
              <span class="text-sm text-slate-700 dark:text-slate-200">${opt}</span>
            </div>
          </button>
        `).join('')}
      </div>

      <!-- Result / Next -->
      <div id="practice-result" class="hidden"></div>

      <!-- Skip button -->
      <div class="flex justify-between items-center">
        <button id="practice-skip" class="text-sm text-slate-400 hover:text-slate-600 transition-colors">
          Skip this question
        </button>
        <span class="text-xs text-slate-400">${allQuestions.length - currentIdx} questions remaining</span>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Wire up option clicks
    el.querySelectorAll('.practice-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (showingResult) return;
        const idx = parseInt(btn.dataset.idx);
        handleAnswer(container, idx);
      });
    });

    // Skip button
    el.querySelector('#practice-skip')?.addEventListener('click', () => {
      if (showingResult) return;
      currentIdx++;
      renderQuestion(container);
    });
  }

  function handleAnswer(container, selectedIdx) {
    const q = allQuestions[currentIdx];
    const isCorrect = selectedIdx === q.correctIndex;
    showingResult = true;
    answered++;
    if (isCorrect) correct++;

    // Record in store
    store.markQuizAnswered(q.qId, isCorrect);

    // Update option styles
    const options = container.querySelectorAll('.practice-option');
    options.forEach((btn, i) => {
      btn.classList.remove('hover:border-orange-400', 'dark:hover:border-orange-500', 'cursor-pointer');
      if (i === q.correctIndex) {
        btn.classList.remove('border-slate-200', 'dark:border-slate-700');
        btn.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/10');
        const circle = btn.querySelector('span');
        if (circle) {
          circle.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-500');
          circle.classList.add('bg-green-500', 'text-white');
        }
      }
      if (i === selectedIdx && !isCorrect) {
        btn.classList.remove('border-slate-200', 'dark:border-slate-700');
        btn.classList.add('border-red-500', 'bg-red-50', 'dark:bg-red-900/10');
        const circle = btn.querySelector('span');
        if (circle) {
          circle.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-500');
          circle.classList.add('bg-red-500', 'text-white');
        }
      }
    });

    // Show result and explanation
    const resultEl = container.querySelector('#practice-result');
    if (resultEl) {
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `
        <div class="p-4 rounded-xl ${isCorrect ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40' : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40'} mb-4">
          <div class="flex items-center gap-2 mb-1">
            <i data-lucide="${isCorrect ? 'check-circle' : 'x-circle'}" class="w-4 h-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}"></i>
            <span class="text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
          </div>
          ${q.explanation ? `<p class="text-xs text-slate-600 dark:text-slate-400 ml-6">${q.explanation}</p>` : ''}
        </div>
        <div class="flex justify-between items-center">
          <a data-route="#/topic/${q.topicId}" class="text-xs text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
            Review in ${q.topicTitle} <i data-lucide="arrow-right" class="w-3 h-3"></i>
          </a>
          <button id="practice-next" class="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">
            Next <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();

      resultEl.querySelector('#practice-next')?.addEventListener('click', () => {
        currentIdx++;
        renderQuestion(container);
      });
    }

    // Hide skip button
    const skipBtn = container.querySelector('#practice-skip');
    if (skipBtn) skipBtn.classList.add('hidden');
  }

  function renderComplete(container) {
    const el = container.querySelector('#practice-content');
    if (!el) return;
    const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const color = pct >= 80 ? 'green' : pct >= 60 ? 'amber' : 'red';

    el.innerHTML = `
      <div class="text-center py-12">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center">
          <span class="text-3xl font-bold text-${color}-600">${pct}%</span>
        </div>
        <h3 class="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Practice Complete!</h3>
        <p class="text-sm text-slate-500 mb-6">${correct} correct out of ${answered} questions</p>

        <div class="flex gap-3 justify-center flex-wrap">
          <button id="practice-restart" class="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i> Practice Again
          </button>
          <a data-route="#/mistakes" class="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer transition-colors flex items-center gap-2">
            <i data-lucide="circle-x" class="w-4 h-4 text-rose-500"></i> Review Mistakes
          </a>
          <a data-route="#/exam" class="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer transition-colors flex items-center gap-2">
            <i data-lucide="trophy" class="w-4 h-4 text-amber-500"></i> Full Exam
          </a>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    el.querySelector('#practice-restart')?.addEventListener('click', () => {
      // Re-shuffle and restart
      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }
      currentIdx = 0;
      answered = 0;
      correct = 0;
      renderQuestion(container);
    });
  }
}

export { createQuickPracticeView };
