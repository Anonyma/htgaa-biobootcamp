/**
 * HTGAA Week 2 — Exam Mode
 * Timed quiz across selected topics. Shuffles questions, tracks score,
 * shows detailed results with explanations.
 */

import { store, TOPICS } from '../store.js';

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function createExamView() {
  let state = 'setup'; // setup | running | review
  let questions = [];
  let currentIndex = 0;
  let answers = {};
  let timerInterval = null;
  let elapsedSeconds = 0;
  let selectedTopics = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('htgaa-exam-topics'));
      if (saved && Array.isArray(saved) && saved.length > 0) return new Set(saved);
    } catch {}
    return new Set(TOPICS.map(t => t.id));
  })();
  let questionCount = 20;
  let containerEl = null;
  let activeKeyHandler = null;
  let streak = 0;
  let bestStreak = 0;
  let questionTimes = [];
  let questionStartTime = 0;
  let questionElapsed = [];
  let questionTimerInterval = null;
  let flaggedQuestions = new Set();
  let answerChanges = {}; // track {questionIdx: [{from, to, time}]}

  function cleanupKeyHandler() {
    if (activeKeyHandler) {
      document.removeEventListener('keydown', activeKeyHandler);
      activeKeyHandler = null;
    }
  }

  return {
    render() {
      return `<div id="exam-container" class="max-w-3xl mx-auto px-4 py-8"></div>`;
    },

    async mount(el) {
      containerEl = el.querySelector('#exam-container');
      renderSetup();
    },

    unmount() {
      if (timerInterval) clearInterval(timerInterval);
      if (questionTimerInterval) clearInterval(questionTimerInterval);
      cleanupKeyHandler();
    }
  };

  function renderSetup() {
    containerEl.innerHTML = `
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
          <i data-lucide="trophy" class="w-8 h-8 text-white"></i>
        </div>
        <h1 class="text-3xl font-bold mb-2">Exam Mode</h1>
        <p class="text-slate-500 dark:text-slate-400">Test your knowledge across all topics with a timed quiz</p>
        ${(() => {
          const best = store.getBestExamScore();
          const scores = store.getExamScores();
          if (!best) return '';
          const avg = Math.round(scores.reduce((s, sc) => s + sc.pct, 0) / scores.length);
          // SVG sparkline of past scores
          const sparkline = scores.length >= 2 ? (() => {
            const w = 120, h = 32, pad = 2;
            const pts = scores.map((s, i) => {
              const x = pad + (i / (scores.length - 1)) * (w - 2 * pad);
              const y = h - pad - (s.pct / 100) * (h - 2 * pad);
              return `${x},${y}`;
            });
            return `<svg class="inline-block ml-2 align-middle" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
              <polyline points="${pts.join(' ')}" fill="none" stroke="url(#spark-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs>
              <circle cx="${pts[pts.length - 1].split(',')[0]}" cy="${pts[pts.length - 1].split(',')[1]}" r="3" fill="#f59e0b"/>
            </svg>`;
          })() : '';
          return `<div class="mt-3 flex items-center justify-center gap-6 text-sm">
            <span class="text-slate-400"><i data-lucide="trophy" class="w-4 h-4 inline text-amber-500"></i> Best: <strong class="text-slate-700 dark:text-slate-200">${best.pct}%</strong></span>
            <span class="text-slate-400"><i data-lucide="bar-chart-3" class="w-4 h-4 inline text-blue-500"></i> Avg: <strong class="text-slate-700 dark:text-slate-200">${avg}%</strong></span>
            <span class="text-slate-400">Attempts: <strong class="text-slate-700 dark:text-slate-200">${scores.length}</strong></span>
          </div>
          ${sparkline ? `<div class="mt-2 text-center"><span class="text-xs text-slate-400">Trend</span>${sparkline}</div>` : ''}`;
        })()}
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 class="font-semibold mb-4 flex items-center gap-2">
          <i data-lucide="list-checks" class="w-5 h-5 text-blue-500"></i> Select Topics
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          ${TOPICS.map(t => {
            const mastery = store.getTopicMastery(t.id, null);
            const mPct = mastery ? mastery.mastery : 0;
            const mColor = mPct >= 80 ? 'green' : mPct >= 50 ? 'amber' : mPct > 0 ? 'red' : 'slate';
            return `
            <label class="flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all
              ${selectedTopics.has(t.id) ? `border-${t.color}-400 bg-${t.color}-50 dark:bg-${t.color}-900/20` : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}
              exam-topic-toggle" data-topic="${t.id}">
              <input type="checkbox" ${selectedTopics.has(t.id) ? 'checked' : ''} class="sr-only" data-topic-check="${t.id}">
              <div class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors
                ${selectedTopics.has(t.id) ? `bg-${t.color}-500 text-white` : 'bg-slate-200 dark:bg-slate-600'}">
                <i data-lucide="check" class="w-3 h-3 ${selectedTopics.has(t.id) ? '' : 'hidden'}"></i>
              </div>
              <span class="text-sm font-medium truncate flex-1">${escapeHtml(t.title)}</span>
              ${(() => {
                // Show historical exam accuracy for this topic
                const scores = store.getExamScores();
                const topicScores = scores.flatMap(s => {
                  // Look for per-topic breakdown in recent exams — approximate from stored data
                  return s.topics && s.topics.includes(t.id) ? [s] : [];
                });
                const examHist = topicScores.length > 0 ? `<span class="text-[9px] text-slate-400" title="Included in ${topicScores.length} exam(s)">${topicScores.length}x</span>` : '';
                return examHist;
              })()}
              ${mPct > 0 ? `<span class="text-[10px] font-bold text-${mColor}-600 dark:text-${mColor}-400">${mPct}%</span>` : ''}
            </label>`;
          }).join('')}
        </div>
        <div class="flex items-center gap-2">
          <button class="text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" id="exam-select-all">Select All</button>
          <button class="text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" id="exam-select-none">Deselect All</button>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 class="font-semibold mb-4 flex items-center gap-2">
          <i data-lucide="settings" class="w-5 h-5 text-violet-500"></i> Settings
        </h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm text-slate-500 dark:text-slate-400 mb-1 block">Number of Questions</label>
            <div class="flex items-center gap-3">
              <input type="range" min="5" max="40" step="5" value="${questionCount}" id="exam-count-slider"
                class="flex-1 accent-blue-500">
              <span id="exam-count-display" class="text-lg font-bold w-8 text-center">${questionCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div id="exam-pool-info" class="text-center text-xs text-slate-400 mb-3">
        <span id="exam-pool-count">Loading question pool...</span>
      </div>
      <button id="exam-start" class="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg
        hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
        Start Exam
      </button>
    `;

    if (window.lucide) lucide.createIcons();

    // Topic toggles
    containerEl.querySelectorAll('.exam-topic-toggle').forEach(label => {
      label.addEventListener('click', () => {
        const tid = label.dataset.topic;
        if (selectedTopics.has(tid)) selectedTopics.delete(tid);
        else selectedTopics.add(tid);
        localStorage.setItem('htgaa-exam-topics', JSON.stringify([...selectedTopics]));
        renderSetup();
      });
    });

    // Select all/none
    containerEl.querySelector('#exam-select-all')?.addEventListener('click', () => {
      selectedTopics = new Set(TOPICS.map(t => t.id));
      localStorage.setItem('htgaa-exam-topics', JSON.stringify([...selectedTopics]));
      renderSetup();
    });
    containerEl.querySelector('#exam-select-none')?.addEventListener('click', () => {
      selectedTopics.clear();
      localStorage.setItem('htgaa-exam-topics', JSON.stringify([]));
      renderSetup();
    });

    // Count slider
    const slider = containerEl.querySelector('#exam-count-slider');
    const display = containerEl.querySelector('#exam-count-display');
    slider?.addEventListener('input', () => {
      questionCount = parseInt(slider.value);
      display.textContent = questionCount;
    });

    // Start button
    containerEl.querySelector('#exam-start')?.addEventListener('click', startExam);

    // Load question pool count asynchronously
    (async () => {
      let poolSize = 0;
      for (const tid of selectedTopics) {
        const data = await store.loadTopicData(tid);
        if (data?.quizQuestions) {
          poolSize += data.quizQuestions.filter(q => q.type === 'multiple-choice').length;
        }
      }
      const poolEl = containerEl.querySelector('#exam-pool-count');
      if (poolEl) {
        poolEl.textContent = poolSize > 0
          ? `Drawing from ${poolSize} available questions across ${selectedTopics.size} topic${selectedTopics.size > 1 ? 's' : ''}`
          : 'No topics selected';
      }
    })();
  }

  async function startExam() {
    if (selectedTopics.size === 0) return;

    // Load questions from selected topics
    const allQuestions = [];
    for (const tid of selectedTopics) {
      const data = await store.loadTopicData(tid);
      if (!data?.quizQuestions) continue;
      const topic = TOPICS.find(t => t.id === tid);
      data.quizQuestions.forEach((q, i) => {
        if (q.type === 'multiple-choice') {
          allQuestions.push({
            ...q,
            topicId: tid,
            topicTitle: topic?.title || tid,
            topicColor: topic?.color || 'blue',
            id: `${tid}-q${i}`
          });
        }
      });
    }

    if (allQuestions.length === 0) return;

    // Shuffle and take requested count
    questions = shuffle(allQuestions).slice(0, questionCount);
    // Shuffle options for each question
    questions = questions.map(q => ({
      ...q,
      shuffledOptions: shuffle(q.options.map((opt, i) => ({ text: opt, originalIndex: i })))
    }));

    currentIndex = 0;
    answers = {};
    elapsedSeconds = 0;
    streak = 0;
    bestStreak = 0;
    flaggedQuestions = new Set();
    answerChanges = {};
    questionTimes = new Array(questions.length).fill(0);
    questionElapsed = new Array(questions.length).fill(0);
    questionStartTime = Date.now();
    state = 'running';

    // Start timer
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      const timerEl = containerEl.querySelector('#exam-timer');
      if (timerEl) timerEl.textContent = formatTime(elapsedSeconds);
      // Update per-question timer with slow warning
      const qTimerEl = containerEl.querySelector('#question-timer');
      if (qTimerEl) {
        const qSec = Math.floor((Date.now() - questionStartTime) / 1000) + (questionElapsed[currentIndex] || 0);
        qTimerEl.textContent = formatTime(qSec);
        if (qSec >= 90) {
          qTimerEl.classList.add('text-red-500', 'font-bold');
          qTimerEl.classList.remove('text-xs');
        } else if (qSec >= 60) {
          qTimerEl.classList.add('text-amber-500');
        }
      }
      // Show slow question hint
      const slowHint = containerEl.querySelector('#slow-question-hint');
      if (slowHint) {
        const qSec = Math.floor((Date.now() - questionStartTime) / 1000) + (questionElapsed[currentIndex] || 0);
        if (qSec >= 60 && slowHint.classList.contains('hidden')) {
          slowHint.classList.remove('hidden');
        }
      }
    }, 1000);

    renderQuestion();
  }

  function renderQuestion() {
    const q = questions[currentIndex];
    const answered = answers[currentIndex] !== undefined;
    const progress = ((currentIndex) / questions.length) * 100;

    containerEl.innerHTML = `
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-500">
            Question ${currentIndex + 1} of ${questions.length}
          </span>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-${q.topicColor}-100 text-${q.topicColor}-700 dark:bg-${q.topicColor}-900/30 dark:text-${q.topicColor}-400">
            ${escapeHtml(q.topicTitle)}
          </span>
          ${streak >= 2 ? `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 animate-pulse">${streak} streak</span>` : ''}
          ${q.difficulty ? `<span class="px-2 py-0.5 rounded-full text-xs font-medium ${
            q.difficulty === 'hard' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
            q.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
            'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }">${q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}</span>` : ''}
          ${(() => {
            const qs = store.getQuizScore(q.topicId);
            if (!qs || qs.total < 2) return '';
            const pct = Math.round((qs.correct / qs.total) * 100);
            if (pct >= 80) return `<span class="text-xs text-green-500" title="Your ${q.topicTitle} quiz score: ${pct}%"><i data-lucide="trending-up" class="w-3 h-3 inline"></i></span>`;
            if (pct < 50) return `<span class="text-xs text-red-500" title="Your ${q.topicTitle} quiz score: ${pct}%"><i data-lucide="trending-down" class="w-3 h-3 inline"></i></span>`;
            return '';
          })()}
        </div>
        <div class="flex items-center gap-3 text-sm">
          <button id="exam-flag-btn" class="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${flaggedQuestions.has(currentIndex) ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'}" title="Flag for review">
            <i data-lucide="flag" class="w-3.5 h-3.5"></i>
            ${flaggedQuestions.has(currentIndex) ? '<span class="text-xs">Flagged</span>' : ''}
          </button>
          <span class="flex items-center gap-1 text-slate-400" title="This question">
            <i data-lucide="timer" class="w-3.5 h-3.5"></i>
            <span id="question-timer" class="font-mono text-xs">${formatTime(questionElapsed[currentIndex] || 0)}</span>
          </span>
          <span class="flex items-center gap-1">
            <i data-lucide="clock" class="w-4 h-4 text-slate-400"></i>
            <span id="exam-timer" class="font-mono font-medium">${formatTime(elapsedSeconds)}</span>
          </span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
        <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300" style="width:${progress}%"></div>
      </div>

      <!-- Question -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <p class="text-lg font-medium mb-6">${escapeHtml(q.question)}</p>
        <div class="space-y-3" id="exam-options">
          ${q.shuffledOptions.map((opt, i) => {
            const isSelected = answers[currentIndex] === i;
            return `
              <button class="exam-option w-full text-left p-4 rounded-xl border-2 transition-all
                ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                ${answered ? 'pointer-events-none' : ''}"
                data-option-index="${i}">
                <div class="flex items-center gap-3">
                  <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-sm font-medium
                    ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'}">
                    ${String.fromCharCode(65 + i)}
                  </div>
                  <span>${escapeHtml(opt.text)}</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
        <div id="slow-question-hint" class="hidden mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
          <i data-lucide="lightbulb" class="w-3.5 h-3.5 flex-shrink-0"></i>
          Taking a while? Consider flagging this and moving on — you can return to it later.
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <button id="exam-prev" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium
          hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${currentIndex === 0 ? 'invisible' : ''}">
          <i data-lucide="chevron-left" class="w-4 h-4 inline"></i> Previous
        </button>

        <!-- Question dots -->
        <div class="hidden sm:flex gap-1 flex-wrap justify-center max-w-xs">
          ${questions.map((_, i) => `
            <button class="exam-dot w-3 h-3 rounded-full transition-colors ${
              i === currentIndex ? 'bg-amber-500 scale-125' :
              flaggedQuestions.has(i) ? 'bg-orange-400 ring-1 ring-orange-300' :
              answers[i] !== undefined ? 'bg-blue-400' : 'bg-slate-300 dark:bg-slate-600'
            }" data-dot-index="${i}" title="${flaggedQuestions.has(i) ? 'Flagged' : ''}"></button>
          `).join('')}
        </div>

        ${Object.keys(answers).length === questions.length ? `
          <button id="exam-finish" class="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium
            hover:from-amber-600 hover:to-orange-600 transition-all">
            ${flaggedQuestions.size > 0 ? `Finish (${flaggedQuestions.size} flagged)` : 'Finish Exam'}
          </button>
        ` : `
          <div class="flex items-center gap-2">
            ${(() => {
              const unanswered = questions.length - Object.keys(answers).length;
              const answered = Object.keys(answers).length;
              let parts = '';
              if (unanswered > 0 && answered > 0) {
                parts += `<span class="text-xs text-slate-400">${unanswered} left</span>`;
                parts += `<button id="exam-submit-early" class="px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">Submit Early</button>`;
              }
              return parts;
            })()}
            <button id="exam-next" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium
              hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${answers[currentIndex] === undefined ? 'opacity-40' : ''}">
              Next <i data-lucide="chevron-right" class="w-4 h-4 inline"></i>
            </button>
          </div>
        `}
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Option clicks
    containerEl.querySelectorAll('.exam-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const wasUnanswered = answers[currentIndex] === undefined;
        const prevAnswer = answers[currentIndex];
        const newAnswer = parseInt(btn.dataset.optionIndex);
        // Track answer changes
        if (!wasUnanswered && prevAnswer !== newAnswer) {
          if (!answerChanges[currentIndex]) answerChanges[currentIndex] = [];
          answerChanges[currentIndex].push({ from: prevAnswer, to: newAnswer, time: elapsedSeconds });
        }
        answers[currentIndex] = newAnswer;
        // Track question time
        questionTimes[currentIndex] = elapsedSeconds;
        // Track streak
        if (wasUnanswered) {
          const selectedOpt = questions[currentIndex].shuffledOptions[answers[currentIndex]];
          if (selectedOpt?.originalIndex === questions[currentIndex].correctIndex) {
            streak++;
            if (streak > bestStreak) bestStreak = streak;
          } else {
            streak = 0;
          }
        }
        renderQuestion();
      });
    });

    // Navigation — save per-question elapsed time when moving
    function saveQuestionTime() {
      questionElapsed[currentIndex] = (questionElapsed[currentIndex] || 0) + Math.floor((Date.now() - questionStartTime) / 1000);
    }
    function navigateTo(idx) {
      saveQuestionTime();
      currentIndex = idx;
      questionStartTime = Date.now();
      renderQuestion();
    }
    containerEl.querySelector('#exam-prev')?.addEventListener('click', () => {
      if (currentIndex > 0) navigateTo(currentIndex - 1);
    });
    containerEl.querySelector('#exam-next')?.addEventListener('click', () => {
      if (currentIndex < questions.length - 1) navigateTo(currentIndex + 1);
    });
    containerEl.querySelector('#exam-submit-early')?.addEventListener('click', () => {
      const unanswered = questions.length - Object.keys(answers).length;
      const warning = document.createElement('div');
      warning.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
      warning.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm mx-4 shadow-xl border border-slate-200 dark:border-slate-700">
          <h3 class="font-bold text-lg mb-2 flex items-center gap-2"><i data-lucide="alert-circle" class="w-5 h-5 text-amber-500"></i> ${unanswered} Unanswered</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Unanswered questions will be marked incorrect.</p>
          <div class="flex gap-2">
            <button id="exam-back-to-questions" class="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 transition-colors">Go Back</button>
            <button id="exam-submit-anyway" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:from-amber-600 hover:to-orange-600 transition-colors">Submit Anyway</button>
          </div>
        </div>
      `;
      document.body.appendChild(warning);
      if (window.lucide) lucide.createIcons();
      warning.querySelector('#exam-back-to-questions').addEventListener('click', () => {
        warning.remove();
        // Navigate to first unanswered question
        const firstUnanswered = questions.findIndex((_, i) => answers[i] === undefined);
        if (firstUnanswered >= 0) navigateTo(firstUnanswered);
      });
      warning.querySelector('#exam-submit-anyway').addEventListener('click', () => {
        warning.remove();
        finishExam();
      });
      warning.addEventListener('click', (e) => { if (e.target === warning) warning.remove(); });
    });
    containerEl.querySelector('#exam-finish')?.addEventListener('click', () => {
      if (flaggedQuestions.size > 0) {
        // Show warning with option to review flagged or finish
        const firstFlagged = [...flaggedQuestions][0];
        const warning = document.createElement('div');
        warning.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        warning.innerHTML = `
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm mx-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 class="font-bold text-lg mb-2 flex items-center gap-2"><i data-lucide="flag" class="w-5 h-5 text-orange-500"></i> ${flaggedQuestions.size} Flagged Question${flaggedQuestions.size > 1 ? 's' : ''}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">You flagged ${flaggedQuestions.size} question${flaggedQuestions.size > 1 ? 's' : ''} for review. Want to go back and check?</p>
            <div class="flex gap-2">
              <button id="exam-review-flagged" class="flex-1 py-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-medium text-sm hover:bg-orange-200 transition-colors">Review Flagged</button>
              <button id="exam-finish-anyway" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:from-amber-600 hover:to-orange-600 transition-colors">Finish Anyway</button>
            </div>
          </div>
        `;
        document.body.appendChild(warning);
        if (window.lucide) lucide.createIcons();
        warning.querySelector('#exam-review-flagged').addEventListener('click', () => {
          warning.remove();
          navigateTo(firstFlagged);
        });
        warning.querySelector('#exam-finish-anyway').addEventListener('click', () => {
          warning.remove();
          finishExam();
        });
        warning.addEventListener('click', (e) => { if (e.target === warning) warning.remove(); });
      } else {
        finishExam();
      }
    });

    // Flag button
    containerEl.querySelector('#exam-flag-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (flaggedQuestions.has(currentIndex)) flaggedQuestions.delete(currentIndex);
      else flaggedQuestions.add(currentIndex);
      renderQuestion();
    });

    // Dot navigation
    containerEl.querySelectorAll('.exam-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        navigateTo(parseInt(dot.dataset.dotIndex));
      });
    });

    // Keyboard — clean up previous handler first
    cleanupKeyHandler();
    activeKeyHandler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        navigateTo(currentIndex + 1);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        navigateTo(currentIndex - 1);
      }
      if (e.key === 'f') {
        if (flaggedQuestions.has(currentIndex)) flaggedQuestions.delete(currentIndex);
        else flaggedQuestions.add(currentIndex);
        renderQuestion();
      }
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        if (idx < questions[currentIndex].shuffledOptions.length) {
          answers[currentIndex] = idx;
          renderQuestion();
        }
      }
    };
    document.addEventListener('keydown', activeKeyHandler);
  }

  function finishExam() {
    // Save time for current question before finishing
    questionElapsed[currentIndex] = (questionElapsed[currentIndex] || 0) + Math.floor((Date.now() - questionStartTime) / 1000);
    if (timerInterval) clearInterval(timerInterval);
    if (questionTimerInterval) clearInterval(questionTimerInterval);
    state = 'review';

    // Calculate results
    let correct = 0;
    const results = questions.map((q, i) => {
      const selectedIdx = answers[i];
      const selectedOpt = q.shuffledOptions[selectedIdx];
      const isCorrect = selectedOpt?.originalIndex === q.correctIndex;
      if (isCorrect) correct++;
      return { question: q, selectedIdx, isCorrect };
    });

    const pct = Math.round((correct / questions.length) * 100);
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    const gradeColor = pct >= 80 ? 'green' : pct >= 60 ? 'yellow' : 'red';

    // Check personal best before saving
    const prevBest = store.getBestExamScore();
    const isNewBest = !prevBest || pct > prevBest.pct;

    // Save score
    store.saveExamScore(correct, questions.length, elapsedSeconds, [...selectedTopics]);
    store.recordStudyActivity();

    // Per-topic breakdown
    const topicBreakdown = {};
    results.forEach(r => {
      const tid = r.question.topicId;
      if (!topicBreakdown[tid]) topicBreakdown[tid] = { correct: 0, total: 0, title: r.question.topicTitle, color: r.question.topicColor };
      topicBreakdown[tid].total++;
      if (r.isCorrect) topicBreakdown[tid].correct++;
    });

    containerEl.innerHTML = `
      <!-- Results Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-${gradeColor}-100 dark:bg-${gradeColor}-900/30 mb-4">
          <span class="text-4xl font-bold text-${gradeColor}-600 dark:text-${gradeColor}-400">${grade}</span>
        </div>
        <h1 class="text-3xl font-bold mb-2">Exam Complete</h1>
        ${isNewBest && prevBest ? `<p class="text-sm font-bold text-amber-500 mb-1">🏆 New Personal Best! (was ${prevBest.pct}%)</p>` : ''}
        <p class="text-xl text-slate-500">
          <span class="font-bold text-slate-900 dark:text-white">${correct}</span> / ${questions.length} correct
          ${(() => { const skipped = questions.filter((_, i) => answers[i] === undefined).length; return skipped > 0 ? `<span class="text-slate-400 mx-2">|</span><span class="text-slate-500">${skipped} skipped</span>` : ''; })()}
          <span class="text-slate-400 mx-2">|</span>
          <span class="font-bold text-slate-900 dark:text-white">${pct}%</span>
        </p>
        ${(() => {
          const allScores = store.getExamScores();
          // Current score was just saved, so previous is second-to-last
          if (allScores.length >= 2) {
            const prev = allScores[allScores.length - 2];
            const diff = pct - prev.pct;
            if (diff > 0) return `<p class="text-sm text-green-500 font-medium mt-1">↑ ${diff}% improvement from last attempt</p>`;
            if (diff < 0) return `<p class="text-sm text-red-400 font-medium mt-1">↓ ${Math.abs(diff)}% from last attempt</p>`;
            return `<p class="text-sm text-slate-400 mt-1">Same score as last attempt</p>`;
          }
          return '';
        })()}
        <p class="text-sm text-slate-400 mt-1">
          <i data-lucide="clock" class="w-4 h-4 inline"></i> ${formatTime(elapsedSeconds)}
          <span class="mx-2">|</span>
          ~${Math.round(elapsedSeconds / questions.length)}s per question
          ${bestStreak >= 3 ? `<span class="mx-2">|</span> <span class="text-amber-500 font-medium">Best streak: ${bestStreak}</span>` : ''}
          ${Object.keys(answerChanges).length > 0 ? `<span class="mx-2">|</span> <span class="text-violet-500">${Object.keys(answerChanges).length} answer${Object.keys(answerChanges).length > 1 ? 's' : ''} changed</span>` : ''}
        </p>
        ${(() => {
          const correctIdxs = results.map((r, i) => r.isCorrect ? i : -1).filter(i => i >= 0);
          const incorrectIdxs = results.map((r, i) => !r.isCorrect ? i : -1).filter(i => i >= 0);
          const avgC = correctIdxs.length > 0 ? Math.round(correctIdxs.reduce((s, i) => s + (questionElapsed[i] || 0), 0) / correctIdxs.length) : 0;
          const avgI = incorrectIdxs.length > 0 ? Math.round(incorrectIdxs.reduce((s, i) => s + (questionElapsed[i] || 0), 0) / incorrectIdxs.length) : 0;
          if (avgC === 0 && avgI === 0) return '';
          const parts = [];
          if (correctIdxs.length > 0) parts.push(`<span class="text-green-500">Correct: ~${avgC}s avg</span>`);
          if (incorrectIdxs.length > 0) parts.push(`<span class="text-red-400">Incorrect: ~${avgI}s avg</span>`);
          return `<p class="text-xs text-slate-400 mt-1">${parts.join(' <span class="text-slate-300 mx-1">|</span> ')}</p>`;
        })()}
      </div>

      <!-- Fastest/Slowest Correct -->
      ${(() => {
        const correctWithTimes = results.map((r, i) => ({ ...r, idx: i, time: questionElapsed[i] || 0 }))
          .filter(r => r.isCorrect && r.time > 0);
        if (correctWithTimes.length < 2) return '';
        const fastest = correctWithTimes.reduce((a, b) => a.time < b.time ? a : b);
        const slowest = correctWithTimes.reduce((a, b) => a.time > b.time ? a : b);
        if (fastest.idx === slowest.idx) return '';
        return `
        <div class="grid grid-cols-2 gap-3 mb-6">
          <div class="bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800 p-4">
            <div class="flex items-center gap-2 mb-2"><span class="text-lg">⚡</span><span class="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">Fastest Correct</span></div>
            <p class="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">${escapeHtml(fastest.question.question.substring(0, 80))}${fastest.question.question.length > 80 ? '...' : ''}</p>
            <p class="text-xs text-green-600 dark:text-green-400 mt-1 font-bold">${fastest.time}s</p>
          </div>
          <div class="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
            <div class="flex items-center gap-2 mb-2"><span class="text-lg">🧠</span><span class="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">Most Deliberate</span></div>
            <p class="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">${escapeHtml(slowest.question.question.substring(0, 80))}${slowest.question.question.length > 80 ? '...' : ''}</p>
            <p class="text-xs text-amber-600 dark:text-amber-400 mt-1 font-bold">${slowest.time}s</p>
          </div>
        </div>`;
      })()}

      <!-- Difficulty Distribution -->
      ${(() => {
        const diffs = { easy: 0, medium: 0, hard: 0 };
        const diffCorrect = { easy: 0, medium: 0, hard: 0 };
        results.forEach(r => {
          const d = r.question.difficulty || 'medium';
          diffs[d] = (diffs[d] || 0) + 1;
          if (r.isCorrect) diffCorrect[d] = (diffCorrect[d] || 0) + 1;
        });
        const hasDiffs = diffs.easy + diffs.hard > 0;
        if (!hasDiffs) return '';
        const entries = [
          { label: 'Easy', count: diffs.easy, correct: diffCorrect.easy, color: 'green', icon: '🟢' },
          { label: 'Medium', count: diffs.medium, correct: diffCorrect.medium, color: 'amber', icon: '🟡' },
          { label: 'Hard', count: diffs.hard, correct: diffCorrect.hard, color: 'red', icon: '🔴' },
        ].filter(e => e.count > 0);
        return `
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 class="font-semibold mb-3">By Difficulty</h2>
          <div class="grid grid-cols-${entries.length} gap-3">
            ${entries.map(e => {
              const pct = e.count > 0 ? Math.round((e.correct / e.count) * 100) : 0;
              return `
              <div class="text-center p-3 rounded-xl bg-${e.color}-50 dark:bg-${e.color}-900/10 border border-${e.color}-200 dark:border-${e.color}-800">
                <div class="text-lg mb-1">${e.icon}</div>
                <div class="text-xs font-medium text-${e.color}-700 dark:text-${e.color}-400">${e.label}</div>
                <div class="text-lg font-bold text-${e.color}-600">${e.correct}/${e.count}</div>
                <div class="text-[10px] text-slate-400">${pct}% correct</div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      })()}

      <!-- Topic Breakdown -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 class="font-semibold mb-4">Score by Topic</h2>
        <div class="space-y-3">
          ${Object.entries(topicBreakdown).map(([tid, tb]) => {
            const tbPct = Math.round((tb.correct / tb.total) * 100);
            // Calculate average time per question for this topic
            const topicQIdxs = results.map((r, i) => r.question.topicId === tid ? i : -1).filter(i => i >= 0);
            const avgTime = topicQIdxs.length > 0 && questionElapsed.length > 0
              ? Math.round(topicQIdxs.reduce((s, i) => s + (questionElapsed[i] || 0), 0) / topicQIdxs.length)
              : null;
            return `
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium">${escapeHtml(tb.title)}</span>
                  <span class="text-slate-500">
                    ${tb.correct}/${tb.total} (${tbPct}%)
                    ${avgTime !== null ? `<span class="text-slate-400 ml-1">~${avgTime}s/q</span>` : ''}
                  </span>
                </div>
                <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all ${tbPct >= 80 ? 'bg-green-500' : tbPct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}"
                    style="width:${tbPct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Topic Radar Chart -->
      ${Object.keys(topicBreakdown).length >= 3 ? (() => {
        const topics = Object.entries(topicBreakdown);
        const n = topics.length;
        const cx = 100, cy = 100, r = 75;
        const angleStep = (2 * Math.PI) / n;
        // Grid circles
        const gridCircles = [25, 50, 75, 100].map(pct => {
          const gr = (pct / 100) * r;
          return `<circle cx="${cx}" cy="${cy}" r="${gr}" fill="none" stroke="rgba(148,163,184,0.2)" stroke-width="0.5"/>`;
        }).join('');
        // Axis lines and labels
        const axes = topics.map(([, tb], i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const x2 = cx + r * Math.cos(angle);
          const y2 = cy + r * Math.sin(angle);
          const lx = cx + (r + 14) * Math.cos(angle);
          const ly = cy + (r + 14) * Math.sin(angle);
          const shortTitle = tb.title.length > 10 ? tb.title.substring(0, 9) + '…' : tb.title;
          return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(148,163,184,0.3)" stroke-width="0.5"/>
            <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" fill="currentColor" font-size="5" class="text-slate-500">${shortTitle}</text>`;
        }).join('');
        // Data polygon
        const points = topics.map(([, tb], i) => {
          const pct = Math.round((tb.correct / tb.total) * 100);
          const angle = -Math.PI / 2 + i * angleStep;
          const x = cx + (pct / 100) * r * Math.cos(angle);
          const y = cy + (pct / 100) * r * Math.sin(angle);
          return `${x},${y}`;
        }).join(' ');
        // Data dots
        const dots = topics.map(([, tb], i) => {
          const pct = Math.round((tb.correct / tb.total) * 100);
          const angle = -Math.PI / 2 + i * angleStep;
          const x = cx + (pct / 100) * r * Math.cos(angle);
          const y = cy + (pct / 100) * r * Math.sin(angle);
          return `<circle cx="${x}" cy="${y}" r="2.5" fill="#f59e0b" stroke="white" stroke-width="0.5"/>`;
        }).join('');
        return `
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 class="font-semibold mb-2">Topic Radar</h2>
          <div class="flex justify-center">
            <svg viewBox="0 0 200 200" class="w-48 h-48 text-slate-600 dark:text-slate-400">
              ${gridCircles}
              ${axes}
              <polygon points="${points}" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/>
              ${dots}
            </svg>
          </div>
        </div>`;
      })() : ''}

      <!-- Score History -->
      ${(() => {
        const scores = store.getExamScores();
        if (scores.length < 2) return '';
        const maxPct = 100;
        const barWidth = Math.max(12, Math.min(40, Math.floor(300 / scores.length)));
        return `
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 class="font-semibold mb-4">Score History</h2>
          <div class="flex items-end gap-1 h-32">
            ${scores.map((s, i) => `
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-xs font-medium ${i === scores.length - 1 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}">${s.pct}%</span>
                <div class="w-full rounded-t-sm transition-all ${i === scores.length - 1 ? 'bg-gradient-to-t from-amber-500 to-orange-400' : 'bg-slate-300 dark:bg-slate-600'}" style="height: ${Math.max(4, (s.pct / maxPct) * 100)}%"></div>
              </div>
            `).join('')}
          </div>
          <p class="text-xs text-slate-400 text-center mt-2">${scores.length} attempts</p>
        </div>
        `;
      })()}

      <!-- Time Distribution -->
      ${(() => {
        const times = questionElapsed.filter(t => t > 0);
        if (times.length < 3) return '';
        // Bucket into ranges: 0-10s, 10-20s, 20-30s, 30-60s, 60s+
        const buckets = [
          { label: '<10s', min: 0, max: 10, count: 0 },
          { label: '10-20s', min: 10, max: 20, count: 0 },
          { label: '20-30s', min: 20, max: 30, count: 0 },
          { label: '30-60s', min: 30, max: 60, count: 0 },
          { label: '60s+', min: 60, max: Infinity, count: 0 },
        ];
        times.forEach(t => {
          const b = buckets.find(b => t >= b.min && t < b.max);
          if (b) b.count++;
        });
        const maxCount = Math.max(...buckets.map(b => b.count));
        if (maxCount === 0) return '';
        return `
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 class="font-semibold mb-4">Time Distribution</h2>
          <div class="flex items-end gap-2 h-24">
            ${buckets.map(b => `
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-[10px] text-slate-400">${b.count}</span>
                <div class="w-full rounded-t-sm ${b.count > 0 ? 'bg-blue-400 dark:bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}" style="height: ${maxCount > 0 ? Math.max(2, (b.count / maxCount) * 100) : 2}%"></div>
                <span class="text-[10px] text-slate-500">${b.label}</span>
              </div>
            `).join('')}
          </div>
        </div>`;
      })()}

      <!-- Answer Distribution -->
      ${(() => {
        const dist = {};
        results.forEach((r, i) => {
          if (answers[i] === undefined) return;
          const letter = String.fromCharCode(65 + answers[i]);
          dist[letter] = (dist[letter] || 0) + 1;
        });
        const entries = Object.entries(dist).sort((a, b) => a[0].localeCompare(b[0]));
        if (entries.length < 2) return '';
        const maxCount = Math.max(...entries.map(e => e[1]));
        const answered = Object.values(dist).reduce((s, v) => s + v, 0);
        return `
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 class="font-semibold mb-3">Answer Distribution</h2>
          <div class="flex items-end gap-3 h-20">
            ${entries.map(([letter, count]) => `
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-xs text-slate-400">${count}</span>
                <div class="w-full rounded-t-sm bg-blue-400 dark:bg-blue-600" style="height: ${Math.max(4, (count / maxCount) * 100)}%"></div>
                <span class="text-xs font-bold text-slate-500">${letter}</span>
              </div>
            `).join('')}
          </div>
          <p class="text-[10px] text-slate-400 text-center mt-2">${answered} answered · ${questions.length - answered} skipped</p>
        </div>`;
      })()}

      <!-- Question Review -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold">Question Review</h2>
          ${results.some(r => !r.isCorrect) ? `
            <button id="exam-toggle-missed" class="text-xs px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium">
              Show missed only (${results.filter(r => !r.isCorrect).length})
            </button>
          ` : ''}
        </div>
        <div class="space-y-4" id="exam-review-questions">
          ${results.map((r, i) => `
            <div class="p-4 rounded-xl border ${r.isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'}">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${r.isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white">
                  <i data-lucide="${r.isCorrect ? 'check' : 'x'}" class="w-4 h-4"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm mb-1">
                    <span class="text-slate-400">Q${i + 1}</span>
                    <span class="mx-1 px-1.5 py-0.5 rounded text-xs bg-${r.question.topicColor}-100 text-${r.question.topicColor}-700 dark:bg-${r.question.topicColor}-900/30 dark:text-${r.question.topicColor}-400">${escapeHtml(r.question.topicTitle)}${(() => { const topicQs = results.filter(x => x.question.topicId === r.question.topicId); const qIdx = topicQs.indexOf(r) + 1; return topicQs.length > 1 ? ` ${qIdx}/${topicQs.length}` : ''; })()}</span>
                    ${answers[i] === undefined ? '<span class="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 font-medium">Skipped</span>' : ''}
                    ${flaggedQuestions.has(i) ? '<span class="text-orange-500 text-xs"><i data-lucide="flag" class="w-3 h-3 inline"></i></span>' : ''}
                    ${questionElapsed[i] > 0 ? `<span class="text-slate-400 text-xs ml-1">${questionElapsed[i]}s</span>` : ''}
                    ${questionElapsed[i] > 0 ? (() => {
                      const t = questionElapsed[i];
                      if (t <= 15) return '<span class="text-xs text-green-500 ml-1" title="Quick answer">⚡</span>';
                      if (t >= 60) return '<span class="text-xs text-red-400 ml-1" title="Took a while">🐢</span>';
                      return '';
                    })() : ''}
                    ${(() => {
                      // Confidence: correct+fast=high, correct+slow=medium, incorrect=low
                      const t = questionElapsed[i] || 0;
                      if (r.isCorrect && t > 0 && t <= 20) return '<span class="text-[9px] px-1 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 ml-1">High confidence</span>';
                      if (r.isCorrect && t > 30) return '<span class="text-[9px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ml-1">Lucky guess?</span>';
                      if (!r.isCorrect && t <= 10) return '<span class="text-[9px] px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 ml-1">Misconception</span>';
                      return '';
                    })()}
                  </p>
                  <p class="text-sm mb-2">${escapeHtml(r.question.question)}</p>
                  ${!r.isCorrect ? `
                    <p class="text-xs text-red-600 dark:text-red-400">Your answer: ${escapeHtml(r.question.shuffledOptions[r.selectedIdx]?.text || 'Skipped')}</p>
                    <p class="text-xs text-green-600 dark:text-green-400">Correct: ${escapeHtml(r.question.options[r.question.correctIndex])}</p>
                  ` : ''}
                  ${answerChanges[i]?.length ? `<p class="text-xs text-violet-500 mt-1"><i data-lucide="repeat" class="w-3 h-3 inline"></i> Changed answer ${answerChanges[i].length}x${(() => {
                    const changes = answerChanges[i];
                    const lastChange = changes[changes.length - 1];
                    const fromLetter = String.fromCharCode(65 + lastChange.from);
                    const toLetter = String.fromCharCode(65 + lastChange.to);
                    return ` (${fromLetter} → ${toLetter})`;
                  })()}</p>` : ''}
                  ${r.question.explanation ? `<p class="text-xs text-slate-500 mt-1">${escapeHtml(r.question.explanation)}</p>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Study Recommendations -->
      ${(() => {
        const weakTopics = Object.entries(topicBreakdown)
          .filter(([, tb]) => Math.round((tb.correct / tb.total) * 100) < 70)
          .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));
        if (weakTopics.length === 0) return '';
        return `
        <div class="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 mb-6">
          <h2 class="font-semibold mb-3 flex items-center gap-2">
            <i data-lucide="target" class="w-5 h-5 text-amber-600"></i> Recommended Review
          </h2>
          <p class="text-sm text-amber-800 dark:text-amber-200 mb-3">These topics scored below 70%. Review them before retaking the exam:</p>
          <div class="space-y-2">
            ${weakTopics.map(([tid, tb]) => {
              const topic = TOPICS.find(t => t.id === tid);
              return `
                <a data-route="#/topic/${tid}" class="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                  <div class="flex items-center gap-2">
                    <i data-lucide="${topic?.icon || 'book'}" class="w-4 h-4 text-${tb.color}-500"></i>
                    <span class="text-sm font-medium">${escapeHtml(tb.title)}</span>
                  </div>
                  <span class="text-xs text-red-600 dark:text-red-400 font-bold">${Math.round((tb.correct / tb.total) * 100)}%</span>
                </a>
              `;
            }).join('')}
          </div>
        </div>
        `;
      })()}

      <!-- Actions -->
      <div class="flex gap-3 flex-wrap">
        <button id="exam-retry" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium
          hover:from-amber-600 hover:to-orange-600 transition-all min-w-[140px]">
          Try Again
        </button>
        ${results.some(r => !r.isCorrect) ? `
        <button id="exam-retry-incorrect" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium
          hover:from-red-600 hover:to-rose-600 transition-all min-w-[140px] flex items-center justify-center gap-2">
          <i data-lucide="rotate-ccw" class="w-4 h-4"></i> Retry Incorrect (${results.filter(r => !r.isCorrect).length})
        </button>
        ` : ''}
        <button id="exam-copy-results" class="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium
          hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-w-[140px] flex items-center justify-center gap-2">
          <i data-lucide="copy" class="w-4 h-4"></i> Copy Results
        </button>
        ${(() => {
          const weakTids = Object.entries(topicBreakdown)
            .filter(([, tb]) => Math.round((tb.correct / tb.total) * 100) < 80)
            .map(([tid]) => tid);
          if (weakTids.length === 0) return '';
          return `<a data-route="#/flashcards" class="flex-1 py-3 rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 font-medium text-center text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors cursor-pointer min-w-[140px]">
            <i data-lucide="layers" class="w-4 h-4 inline mr-1"></i> Review Flashcards
          </a>`;
        })()}
        <a data-route="#/" class="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-center
          hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer min-w-[140px]">
          Back to Home
        </a>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    containerEl.querySelector('#exam-retry')?.addEventListener('click', () => {
      state = 'setup';
      renderSetup();
    });

    // Retry incorrect only
    containerEl.querySelector('#exam-retry-incorrect')?.addEventListener('click', () => {
      const incorrectQuestions = results.filter(r => !r.isCorrect).map(r => r.question);
      if (incorrectQuestions.length === 0) return;
      // Reset state and start exam with only incorrect questions
      state = 'running';
      questions = shuffle(incorrectQuestions).map(q => {
        const shuffledOptions = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        return { ...q, shuffledOptions };
      });
      currentIndex = 0;
      answers = {};
      elapsedSeconds = 0;
      streak = 0;
      bestStreak = 0;
      questionElapsed = [];
      questionStartTime = Date.now();
      flaggedQuestions = new Set();
      answerChanges = {};
      // Start timer
      timerInterval = setInterval(() => { elapsedSeconds++; }, 1000);
      renderQuestion();
    });

    // Copy results to clipboard
    containerEl.querySelector('#exam-copy-results')?.addEventListener('click', () => {
      const topicLines = Object.entries(topicBreakdown).map(([, tb]) => {
        const tbPct = Math.round((tb.correct / tb.total) * 100);
        return `  ${tb.title}: ${tb.correct}/${tb.total} (${tbPct}%)`;
      }).join('\n');
      const text = `HTGAA Week 2 Exam Results\nScore: ${correct}/${questions.length} (${pct}%) — Grade: ${grade}\nTime: ${formatTime(elapsedSeconds)}\n\nBy Topic:\n${topicLines}`;
      navigator.clipboard.writeText(text).then(() => {
        const btn = containerEl.querySelector('#exam-copy-results');
        if (btn) { btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!'; if (window.lucide) lucide.createIcons(); }
      }).catch(() => {});
    });

    // Toggle missed-only filter
    const toggleMissed = containerEl.querySelector('#exam-toggle-missed');
    if (toggleMissed) {
      let showMissedOnly = false;
      toggleMissed.addEventListener('click', () => {
        showMissedOnly = !showMissedOnly;
        toggleMissed.textContent = showMissedOnly ? 'Show all' : `Show missed only (${results.filter(r => !r.isCorrect).length})`;
        const reviewItems = containerEl.querySelectorAll('#exam-review-questions > div');
        reviewItems.forEach((el, i) => {
          if (showMissedOnly && results[i].isCorrect) {
            el.style.display = 'none';
          } else {
            el.style.display = '';
          }
        });
      });
    }

    cleanupKeyHandler();
  }
}
