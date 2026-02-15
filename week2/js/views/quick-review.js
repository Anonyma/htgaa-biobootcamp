/**
 * HTGAA Week 2 — Quick Review Mode
 * Focused study session: Takeaways → Flashcards → Check Questions
 * No article text — just the essentials for rapid review.
 */

import { store, TOPICS } from '../store.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createQuickReviewView(topicId) {
  let data = null;
  let phase = 'takeaways'; // takeaways | flashcards | questions | done
  let fcIndex = 0;
  let fcFlipped = false;
  let fcCards = [];
  let qIndex = 0;
  let qCorrect = 0;
  let qAnswered = 0;
  let checkQuestions = [];
  let containerEl = null;

  function getTopic() {
    return TOPICS.find(t => t.id === topicId);
  }

  function renderPhaseNav() {
    const phases = [
      { id: 'takeaways', label: 'Takeaways', icon: 'lightbulb' },
      { id: 'flashcards', label: 'Flashcards', icon: 'layers' },
      { id: 'questions', label: 'Questions', icon: 'help-circle' },
    ];
    return `
      <div class="flex items-center justify-center gap-1 mb-8">
        ${phases.map((p, i) => {
          const isActive = p.id === phase;
          const isDone = phases.indexOf(phases.find(x => x.id === phase)) > i;
          return `
            <button class="review-phase-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700' :
              isDone ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' :
              'text-slate-400 border border-slate-200 dark:border-slate-700'
            }" data-phase="${p.id}">
              ${isDone ? '<i data-lucide="check" class="w-3 h-3"></i>' : `<i data-lucide="${p.icon}" class="w-3 h-3"></i>`}
              ${p.label}
            </button>
            ${i < phases.length - 1 ? '<div class="w-6 h-px bg-slate-200 dark:bg-slate-700"></div>' : ''}
          `;
        }).join('')}
      </div>
    `;
  }

  function renderTakeaways() {
    const takeaways = (data.sections || [])
      .filter(s => s.takeaway)
      .map(s => ({ title: s.title, takeaway: s.takeaway }));

    const keyFacts = data.keyFacts || [];

    return `
      ${renderPhaseNav()}
      <div class="space-y-4 mb-8">
        <h2 class="text-lg font-bold flex items-center gap-2">
          <i data-lucide="lightbulb" class="w-5 h-5 text-amber-500"></i>
          Key Takeaways
        </h2>
        ${takeaways.length > 0 ? `
          <div class="space-y-3">
            ${takeaways.map((t, i) => `
              <div class="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                <p class="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">${t.title}</p>
                <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${t.takeaway}</p>
              </div>
            `).join('')}
          </div>
        ` : '<p class="text-sm text-slate-500">No takeaways available for this topic.</p>'}

        ${keyFacts.length > 0 ? `
          <h3 class="text-base font-bold flex items-center gap-2 mt-6">
            <i data-lucide="zap" class="w-4 h-4 text-blue-500"></i>
            Key Facts
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${keyFacts.slice(0, 8).map(f => `
              <div class="p-3 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10 text-sm text-slate-700 dark:text-slate-300">
                ${typeof f === 'string' ? f : f.fact || f.text || JSON.stringify(f)}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="flex justify-end">
        <button class="review-next-btn px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
          Next: Flashcards <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  }

  function renderFlashcards() {
    if (fcCards.length === 0) {
      return `
        ${renderPhaseNav()}
        <div class="text-center py-12">
          <p class="text-slate-500">No vocabulary cards for this topic.</p>
          <button class="review-next-btn mt-4 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-sm transition-colors">
            Skip to Questions
          </button>
        </div>
      `;
    }

    const card = fcCards[fcIndex];
    const progress = `${fcIndex + 1} / ${fcCards.length}`;

    return `
      ${renderPhaseNav()}
      <div class="text-center mb-4">
        <span class="text-xs text-slate-400 font-medium">${progress}</span>
        <div class="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-2">
          <div class="h-full bg-indigo-500 rounded-full transition-all" style="width:${((fcIndex + 1) / fcCards.length) * 100}%"></div>
        </div>
      </div>
      <div class="review-flashcard cursor-pointer select-none mx-auto max-w-lg" style="perspective:1000px">
        <div class="relative w-full min-h-[200px] p-8 rounded-2xl border-2 ${fcFlipped ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10' : 'border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800'} shadow-sm flex items-center justify-center text-center transition-colors">
          ${fcFlipped ? `
            <div>
              <p class="text-xs text-green-500 font-medium uppercase tracking-wider mb-2">Definition</p>
              <p class="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">${card.definition}</p>
            </div>
          ` : `
            <div>
              <p class="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-2">Term</p>
              <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">${card.term}</p>
              <p class="text-xs text-slate-400 mt-4">Tap to reveal</p>
            </div>
          `}
        </div>
      </div>
      <div class="flex justify-center gap-3 mt-6">
        ${fcFlipped ? `
          <button class="fc-action-btn px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-action="again">
            <i data-lucide="x" class="w-4 h-4 inline mr-1"></i> Again
          </button>
          <button class="fc-action-btn px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" data-action="hard">
            <i data-lucide="minus" class="w-4 h-4 inline mr-1"></i> Hard
          </button>
          <button class="fc-action-btn px-4 py-2 rounded-xl border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" data-action="good">
            <i data-lucide="check" class="w-4 h-4 inline mr-1"></i> Good
          </button>
          <button class="fc-action-btn px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-action="easy">
            <i data-lucide="zap" class="w-4 h-4 inline mr-1"></i> Easy
          </button>
        ` : `
          <button class="review-flip-btn px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-sm transition-colors">
            Reveal Answer
          </button>
        `}
      </div>
      ${fcIndex === fcCards.length - 1 && fcFlipped ? `
        <div class="flex justify-center mt-6">
          <button class="review-next-btn px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
            Next: Questions <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      ` : ''}
    `;
  }

  function renderQuestions() {
    if (checkQuestions.length === 0) {
      return `
        ${renderPhaseNav()}
        <div class="text-center py-12">
          <p class="text-slate-500">No check questions for this topic.</p>
          <button class="review-finish-btn mt-4 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-colors">
            Finish Review
          </button>
        </div>
      `;
    }

    const q = checkQuestions[qIndex];
    const progress = `${qIndex + 1} / ${checkQuestions.length}`;

    return `
      ${renderPhaseNav()}
      <div class="text-center mb-4">
        <span class="text-xs text-slate-400 font-medium">${progress}</span>
        <div class="flex items-center gap-2 justify-center mt-1">
          <span class="text-xs text-green-500 font-medium">${qCorrect} correct</span>
          <span class="text-xs text-slate-300">|</span>
          <span class="text-xs text-red-400 font-medium">${qAnswered - qCorrect} wrong</span>
        </div>
        <div class="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-2">
          <div class="h-full bg-indigo-500 rounded-full transition-all" style="width:${((qIndex + 1) / checkQuestions.length) * 100}%"></div>
        </div>
      </div>
      <div class="mx-auto max-w-lg">
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-4">
          <p class="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">${q.question}</p>
          <div class="space-y-2" id="review-q-options">
            ${q.options.map((opt, i) => `
              <button class="review-q-opt w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors" data-idx="${i}">
                <span class="font-medium text-slate-400 mr-2">${String.fromCharCode(65 + i)}.</span>
                ${opt}
              </button>
            `).join('')}
          </div>
          <div id="review-q-feedback" class="hidden mt-4 p-3 rounded-lg text-sm"></div>
        </div>
      </div>
    `;
  }

  function renderDone() {
    const topic = getTopic();
    const totalQ = checkQuestions.length;
    const pct = totalQ > 0 ? Math.round((qCorrect / totalQ) * 100) : 0;

    return `
      <div class="text-center py-12 max-w-md mx-auto">
        <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="check-circle-2" class="w-8 h-8 text-green-500"></i>
        </div>
        <h2 class="text-2xl font-bold mb-2">Review Complete!</h2>
        <p class="text-slate-500 mb-6">${topic.title}</p>

        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div class="text-2xl font-bold text-amber-600">${(data.sections || []).filter(s => s.takeaway).length}</div>
            <div class="text-xs text-amber-500">Takeaways</div>
          </div>
          <div class="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
            <div class="text-2xl font-bold text-indigo-600">${fcCards.length}</div>
            <div class="text-xs text-indigo-500">Cards</div>
          </div>
          <div class="p-4 rounded-xl ${pct >= 70 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border">
            <div class="text-2xl font-bold ${pct >= 70 ? 'text-green-600' : 'text-red-500'}">${pct}%</div>
            <div class="text-xs ${pct >= 70 ? 'text-green-500' : 'text-red-400'}">Quiz</div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <a data-route="#/topic/${topicId}" class="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2">
            <i data-lucide="book-open" class="w-4 h-4"></i> Read Full Chapter
          </a>
          <a data-route="#/" class="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-sm transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center justify-center gap-2">
            <i data-lucide="home" class="w-4 h-4"></i> Back to Home
          </a>
        </div>
      </div>
    `;
  }

  function render() {
    if (!data || !containerEl) return;
    const topic = getTopic();

    let content = '';
    switch (phase) {
      case 'takeaways': content = renderTakeaways(); break;
      case 'flashcards': content = renderFlashcards(); break;
      case 'questions': content = renderQuestions(); break;
      case 'done': content = renderDone(); break;
    }

    containerEl.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 py-8">
        <header class="mb-6 flex items-center gap-3">
          <a data-route="#/" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
            <i data-lucide="arrow-left" class="w-5 h-5 text-slate-400"></i>
          </a>
          <div>
            <p class="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Quick Review</p>
            <h1 class="text-xl font-bold">${topic.title}</h1>
          </div>
        </header>
        ${content}
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
    bindEvents();
  }

  function bindEvents() {
    if (!containerEl) return;

    // Phase nav buttons
    containerEl.querySelectorAll('.review-phase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        phase = btn.dataset.phase;
        render();
      });
    });

    // Next buttons
    containerEl.querySelectorAll('.review-next-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (phase === 'takeaways') { phase = 'flashcards'; fcIndex = 0; fcFlipped = false; }
        else if (phase === 'flashcards') { phase = 'questions'; qIndex = 0; qCorrect = 0; qAnswered = 0; }
        else if (phase === 'questions') { phase = 'done'; }
        render();
      });
    });

    // Flashcard flip
    containerEl.querySelector('.review-flashcard')?.addEventListener('click', () => {
      if (!fcFlipped) { fcFlipped = true; render(); }
    });
    containerEl.querySelector('.review-flip-btn')?.addEventListener('click', () => {
      fcFlipped = true; render();
    });

    // Flashcard actions
    containerEl.querySelectorAll('.fc-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (fcIndex < fcCards.length - 1) {
          fcIndex++;
          fcFlipped = false;
          render();
        }
      });
    });

    // Question options
    containerEl.querySelectorAll('.review-q-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const q = checkQuestions[qIndex];
        const correct = idx === q.correctIndex;
        qAnswered++;
        if (correct) qCorrect++;

        // Disable all options
        containerEl.querySelectorAll('.review-q-opt').forEach(b => {
          b.disabled = true;
          b.classList.add('pointer-events-none');
          const bIdx = parseInt(b.dataset.idx);
          if (bIdx === q.correctIndex) {
            b.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
          }
        });
        if (!correct) {
          btn.classList.add('border-red-500', 'bg-red-50', 'dark:bg-red-900/20');
        }

        // Show feedback
        const feedback = containerEl.querySelector('#review-q-feedback');
        if (feedback && q.explanation) {
          feedback.classList.remove('hidden');
          feedback.className = `mt-4 p-3 rounded-lg text-sm ${correct ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`;
          feedback.innerHTML = `<p class="font-medium mb-1">${correct ? 'Correct!' : 'Not quite.'}</p><p>${q.explanation}</p>`;
        }

        // Auto-advance after delay
        setTimeout(() => {
          if (qIndex < checkQuestions.length - 1) {
            qIndex++;
            render();
          } else {
            phase = 'done';
            render();
          }
        }, correct ? 1500 : 3000);
      });
    });

    // Finish button
    containerEl.querySelector('.review-finish-btn')?.addEventListener('click', () => {
      phase = 'done';
      render();
    });
  }

  return {
    async render() {
      return '<div id="quick-review-container"></div>';
    },

    async mount(el) {
      containerEl = el.querySelector('#quick-review-container');
      data = await store.loadTopicData(topicId);
      if (!data) {
        containerEl.innerHTML = '<div class="text-center py-12 text-slate-500">Topic not found.</div>';
        return;
      }

      // Prepare flashcards from vocabulary
      fcCards = shuffle((data.vocabulary || []).slice());

      // Prepare check questions from sections
      checkQuestions = [];
      (data.sections || []).forEach(s => {
        if (s.checkQuestion) {
          checkQuestions.push(s.checkQuestion);
        }
      });
      checkQuestions = shuffle(checkQuestions);

      render();
    },

    unmount() {
      containerEl = null;
    }
  };
}
