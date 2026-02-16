/**
 * Quiz Builder View
 * Create custom quizzes from selected topics and difficulty levels.
 */

import { store, TOPICS } from '../store.js';

export function createQuizBuilderView() {
  let selectedTopics = TOPICS.map(t => t.id);
  let difficulty = 'all'; // all, easy, medium, hard
  let questionCount = 10;
  let quizStarted = false;
  let questions = [];
  let currentQ = 0;
  let answers = {};
  let showResults = false;

  async function loadQuestions() {
    const allQuestions = [];
    for (const topicId of selectedTopics) {
      const data = await store.loadTopicData(topicId);
      if (data && data.quizQuestions) {
        data.quizQuestions.forEach((q, i) => {
          allQuestions.push({
            ...q,
            topicId,
            topicTitle: TOPICS.find(t => t.id === topicId)?.title || topicId,
            id: `${topicId}-${i}`,
            difficulty: q.difficulty || (i < data.quizQuestions.length * 0.33 ? 'easy' : i < data.quizQuestions.length * 0.66 ? 'medium' : 'hard')
          });
        });
      }
    }

    let filtered = allQuestions;
    if (difficulty !== 'all') {
      filtered = allQuestions.filter(q => q.difficulty === difficulty);
    }

    // Shuffle and take requested count
    filtered.sort(() => Math.random() - 0.5);
    return filtered.slice(0, questionCount);
  }

  function renderQuestion(container) {
    const area = container.querySelector('#quiz-area');
    if (!area) return;

    if (showResults) {
      renderResults(container);
      return;
    }

    if (currentQ >= questions.length) {
      showResults = true;
      renderResults(container);
      return;
    }

    const q = questions[currentQ];
    const topic = TOPICS.find(t => t.id === q.topicId);
    const color = topic?.color || 'blue';
    const answered = answers[currentQ] !== undefined;

    area.innerHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <!-- Progress -->
        <div class="px-4 pt-4 flex items-center justify-between">
          <span class="text-xs text-slate-400">Question ${currentQ + 1} of ${questions.length}</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300">${q.topicTitle}</span>
        </div>
        <div class="px-4 pt-2">
          <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div class="bg-blue-500 h-1.5 rounded-full transition-all" style="width:${((currentQ + 1) / questions.length) * 100}%"></div>
          </div>
        </div>

        <!-- Question -->
        <div class="p-6">
          <p class="text-lg font-medium text-slate-800 dark:text-white leading-relaxed mb-6">${q.question}</p>

          <!-- Options -->
          <div class="space-y-3">
            ${q.options.map((opt, i) => {
              let cls = 'bg-white dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-blue-400 cursor-pointer';
              if (answered) {
                if (i === q.correctIndex) cls = 'bg-green-50 dark:bg-green-900/20 border-green-500 border-2';
                else if (i === answers[currentQ] && i !== q.correctIndex) cls = 'bg-red-50 dark:bg-red-900/20 border-red-500 border-2';
                else cls = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50';
              }
              return `<button class="quiz-option w-full text-left p-4 rounded-xl border transition-all ${cls} ${answered ? 'pointer-events-none' : ''}" data-idx="${i}">
                <div class="flex items-start gap-3">
                  <span class="w-7 h-7 rounded-full border-2 ${answered && i === q.correctIndex ? 'border-green-500 bg-green-100 dark:bg-green-900/30' : answered && i === answers[currentQ] ? 'border-red-500 bg-red-100 dark:bg-red-900/30' : 'border-slate-300'} flex items-center justify-center text-xs font-bold flex-shrink-0">
                    ${String.fromCharCode(65 + i)}
                  </span>
                  <span class="text-sm text-slate-700 dark:text-slate-200">${opt}</span>
                </div>
              </button>`;
            }).join('')}
          </div>

          ${answered && q.explanation ? `
            <div class="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
              <p class="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                <strong>Explanation:</strong> ${q.explanation}
              </p>
            </div>
          ` : ''}

          <!-- Navigation -->
          <div class="mt-6 flex items-center justify-between">
            <button id="prev-q" class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors ${currentQ === 0 ? 'invisible' : ''}">
              &larr; Previous
            </button>
            ${answered ? `
              <button id="next-q" class="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors">
                ${currentQ < questions.length - 1 ? 'Next &rarr;' : 'See Results'}
              </button>
            ` : `
              <button id="skip-q" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
                Skip &rarr;
              </button>
            `}
          </div>
        </div>
      </div>`;

    // Bind options
    area.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        answers[currentQ] = parseInt(btn.dataset.idx);
        renderQuestion(container);
      });
    });

    area.querySelector('#next-q')?.addEventListener('click', () => {
      currentQ++;
      renderQuestion(container);
    });
    area.querySelector('#prev-q')?.addEventListener('click', () => {
      currentQ--;
      renderQuestion(container);
    });
    area.querySelector('#skip-q')?.addEventListener('click', () => {
      currentQ++;
      renderQuestion(container);
    });
  }

  function renderResults(container) {
    const area = container.querySelector('#quiz-area');
    if (!area) return;

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    const gradeColor = pct >= 80 ? 'green' : pct >= 60 ? 'amber' : 'red';

    area.innerHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div class="w-24 h-24 mx-auto rounded-full bg-${gradeColor}-100 dark:bg-${gradeColor}-900/30 flex items-center justify-center mb-4">
          <span class="text-4xl font-bold text-${gradeColor}-600">${grade}</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">${pct}%</h2>
        <p class="text-slate-500 mb-6">${correct} of ${questions.length} correct</p>

        <!-- Per-topic breakdown -->
        <div class="text-left max-w-md mx-auto mb-6">
          ${[...new Set(questions.map(q => q.topicId))].map(topicId => {
            const topicQs = questions.filter(q => q.topicId === topicId);
            const topicCorrect = topicQs.filter((q, i) => {
              const qIdx = questions.indexOf(q);
              return answers[qIdx] === q.correctIndex;
            }).length;
            const topicPct = Math.round((topicCorrect / topicQs.length) * 100);
            const topic = TOPICS.find(t => t.id === topicId);
            return `<div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
              <span class="text-sm flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-${topic?.color || 'slate'}-500"></span>
                ${topic?.title || topicId}
              </span>
              <span class="text-sm font-bold ${topicPct >= 70 ? 'text-green-600' : 'text-amber-600'}">${topicCorrect}/${topicQs.length}</span>
            </div>`;
          }).join('')}
        </div>

        <div class="flex justify-center gap-3">
          <button id="review-quiz" class="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl font-medium text-sm transition-colors text-slate-700 dark:text-slate-200">
            Review Answers
          </button>
          <button id="new-quiz" class="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors">
            New Quiz
          </button>
        </div>
      </div>`;

    area.querySelector('#review-quiz')?.addEventListener('click', () => {
      showResults = false;
      currentQ = 0;
      renderQuestion(container);
    });
    area.querySelector('#new-quiz')?.addEventListener('click', () => {
      quizStarted = false;
      showResults = false;
      currentQ = 0;
      answers = {};
      questions = [];
      // Re-render the whole view
      const view = createQuizBuilderView();
      container.innerHTML = view.render();
      view.mount(container);
    });
  }

  return {
    render() {
      return `
        <div class="max-w-3xl mx-auto px-4 py-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Custom Quiz Builder</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Build a personalized quiz from your chosen topics</p>
            </div>
            <a data-route="#/" class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Home
            </a>
          </div>

          <div id="quiz-setup" class="${quizStarted ? 'hidden' : ''}">
            <!-- Topic selection -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white mb-3">Select Topics</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                ${TOPICS.map(t => `
                  <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                    <input type="checkbox" class="topic-check rounded border-slate-300" data-topic="${t.id}" checked />
                    <span class="w-2 h-2 rounded-full bg-${t.color}-500"></span>
                    <span class="text-sm text-slate-700 dark:text-slate-300">${t.title}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Settings -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 class="font-bold text-sm text-slate-800 dark:text-white mb-2">Questions</h3>
                <select id="q-count" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="5">5 questions</option>
                  <option value="10" selected>10 questions</option>
                  <option value="15">15 questions</option>
                  <option value="20">20 questions</option>
                  <option value="30">30 questions (marathon)</option>
                </select>
              </div>
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 class="font-bold text-sm text-slate-800 dark:text-white mb-2">Difficulty</h3>
                <select id="q-difficulty" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <button id="start-quiz" class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors text-lg">
              Start Quiz
            </button>
          </div>

          <div id="quiz-area"></div>
        </div>`;
    },

    mount(container) {
      // Topic checkboxes
      container.querySelectorAll('.topic-check').forEach(cb => {
        cb.addEventListener('change', () => {
          selectedTopics = [...container.querySelectorAll('.topic-check:checked')].map(c => c.dataset.topic);
        });
      });

      container.querySelector('#q-count')?.addEventListener('change', (e) => {
        questionCount = parseInt(e.target.value);
      });
      container.querySelector('#q-difficulty')?.addEventListener('change', (e) => {
        difficulty = e.target.value;
      });

      container.querySelector('#start-quiz')?.addEventListener('click', async () => {
        if (selectedTopics.length === 0) return;
        questions = await loadQuestions();
        if (questions.length === 0) return;
        quizStarted = true;
        container.querySelector('#quiz-setup')?.classList.add('hidden');
        renderQuestion(container);
      });

      if (window.lucide) lucide.createIcons();
    }
  };
}
