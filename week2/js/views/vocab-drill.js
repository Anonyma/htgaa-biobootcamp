/**
 * HTGAA Week 2 — Vocabulary Drill View
 * Focused vocabulary practice with multiple drill modes,
 * smart term weighting, and session tracking.
 */

import { store, TOPICS } from '../store.js';

const BEST_STREAK_KEY = 'htgaa-week2-vocab-best-streak';
const STRUGGLES_KEY = 'htgaa-week2-vocab-struggles';

function createVocabDrillView() {
  let allTerms = [];
  let filteredTerms = [];
  let currentTerm = null;
  let currentOptions = [];
  let mode = 'term-to-def'; // 'term-to-def' | 'def-to-term' | 'spelling'
  let selectedTopic = 'all';
  let sessionCorrect = 0;
  let sessionTotal = 0;
  let streak = 0;
  let bestStreak = 0;
  let sessionHistory = []; // indices of terms shown this session
  let lastTermIndex = -1;
  let isLocked = false; // prevent double-clicks during feedback
  let keyHandler = null;
  let autoAdvanceTimer = null;

  // Load best streak from localStorage
  function loadBestStreak() {
    try {
      return parseInt(localStorage.getItem(BEST_STREAK_KEY), 10) || 0;
    } catch { return 0; }
  }

  function saveBestStreak(val) {
    localStorage.setItem(BEST_STREAK_KEY, String(val));
  }

  // Load/save struggle map: { "topicId::term": wrongCount }
  function loadStruggles() {
    try {
      return JSON.parse(localStorage.getItem(STRUGGLES_KEY)) || {};
    } catch { return {}; }
  }

  function saveStruggles(map) {
    localStorage.setItem(STRUGGLES_KEY, JSON.stringify(map));
  }

  function termKey(t) {
    return `${t.topicId}::${t.term}`;
  }

  // Levenshtein distance for fuzzy matching
  function levenshtein(a, b) {
    const an = a.length, bn = b.length;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix = Array.from({ length: an + 1 }, (_, i) => {
      const row = new Array(bn + 1);
      row[0] = i;
      return row;
    });
    for (let j = 0; j <= bn; j++) matrix[0][j] = j;
    for (let i = 1; i <= an; i++) {
      for (let j = 1; j <= bn; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[an][bn];
  }

  // Fuzzy match: allow up to ~20% character errors, min 2
  function isFuzzyMatch(input, target) {
    const a = input.trim().toLowerCase();
    const b = target.trim().toLowerCase();
    if (a === b) return true;
    const maxDist = Math.max(2, Math.floor(b.length * 0.2));
    return levenshtein(a, b) <= maxDist;
  }

  // Smart term selection: weight struggled terms more heavily
  function pickNextTerm() {
    if (filteredTerms.length === 0) return null;
    if (filteredTerms.length === 1) return filteredTerms[0];

    const struggles = loadStruggles();
    const weights = filteredTerms.map((t, i) => {
      if (i === lastTermIndex) return 0; // never repeat the same term
      const s = struggles[termKey(t)] || 0;
      // base weight 1, +2 per wrong answer, capped at 10
      return Math.min(10, 1 + s * 2);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) {
      // Edge case: only one term and it was last shown
      return filteredTerms[0];
    }

    let r = Math.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        lastTermIndex = i;
        return filteredTerms[i];
      }
    }
    lastTermIndex = filteredTerms.length - 1;
    return filteredTerms[filteredTerms.length - 1];
  }

  // Pick 3 wrong options from all terms (excluding the correct one)
  function pickDistractors(correct, count) {
    const pool = allTerms.filter(t => t.term !== correct.term);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Generate the current question
  function generateQuestion() {
    currentTerm = pickNextTerm();
    if (!currentTerm) return;

    sessionHistory.push(allTerms.indexOf(currentTerm));

    if (mode === 'spelling') {
      currentOptions = [];
      return;
    }

    const distractors = pickDistractors(currentTerm, 3);
    const options = [currentTerm, ...distractors].sort(() => Math.random() - 0.5);

    if (mode === 'term-to-def') {
      currentOptions = options.map(o => ({
        label: o.definition,
        isCorrect: o.term === currentTerm.term,
        term: o
      }));
    } else {
      currentOptions = options.map(o => ({
        label: o.term,
        isCorrect: o.term === currentTerm.term,
        term: o
      }));
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getProgressPct() {
    if (filteredTerms.length === 0) return 0;
    return Math.min(100, Math.round((sessionTotal / filteredTerms.length) * 100));
  }

  return {
    async render() {
      // Load all vocabulary from all topics
      allTerms = [];
      for (const topic of TOPICS) {
        try {
          const data = await store.loadTopicData(topic.id);
          if (data?.vocabulary) {
            data.vocabulary.forEach((v, i) => {
              allTerms.push({
                topicId: topic.id,
                term: v.term,
                definition: v.definition,
                index: i
              });
            });
          }
        } catch { /* skip */ }
      }

      filteredTerms = [...allTerms];
      bestStreak = loadBestStreak();
      sessionCorrect = 0;
      sessionTotal = 0;
      streak = 0;
      sessionHistory = [];
      lastTermIndex = -1;
      generateQuestion();

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <!-- Header -->
          <header class="mb-6">
            <a data-route="#/" class="text-sm text-slate-500 hover:text-blue-500 cursor-pointer flex items-center gap-1 mb-4">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
            </a>
            <h1 class="text-3xl font-extrabold mb-2 flex items-center gap-3">
              <i data-lucide="spell-check" class="w-8 h-8 text-emerald-500"></i>
              Vocabulary Drill
            </h1>
            <p class="text-slate-500 dark:text-slate-400">
              ${allTerms.length} terms across ${TOPICS.length} topics. Terms you struggle with appear more often.
            </p>
          </header>

          <!-- Mode Selector -->
          <div class="mb-4 flex items-center gap-2 flex-wrap">
            <span class="text-xs text-slate-400 mr-1">Mode:</span>
            <button class="vd-mode px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" data-mode="term-to-def">
              Term &rarr; Def
            </button>
            <button class="vd-mode px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" data-mode="def-to-term">
              Def &rarr; Term
            </button>
            <button class="vd-mode px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" data-mode="spelling">
              Spelling Bee
            </button>
          </div>

          <!-- Topic Filter -->
          <div class="mb-6 flex items-center gap-2 flex-wrap">
            <span class="text-xs text-slate-400 mr-1">Topic:</span>
            <select id="vd-topic-filter" class="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none">
              <option value="all">All Topics (${allTerms.length})</option>
              ${TOPICS.map(t => {
                const count = allTerms.filter(v => v.topicId === t.id).length;
                return `<option value="${t.id}">${t.title} (${count})</option>`;
              }).join('')}
            </select>
          </div>

          <!-- Progress Bar -->
          <div class="mb-6">
            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Session Progress</span>
              <span id="vd-progress-label">0 / ${filteredTerms.length}</span>
            </div>
            <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div id="vd-progress-bar" class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full" style="width: 0%"></div>
            </div>
          </div>

          <!-- Prompt Card -->
          <div id="vd-card-area" class="mb-6">
            ${currentTerm ? renderQuestion() : renderEmpty()}
          </div>

          <!-- Stats Bar -->
          <div id="vd-stats" class="flex items-center justify-center gap-6 text-sm flex-wrap py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-1.5">
              <span class="text-orange-500">&#x1F525;</span>
              <span class="text-slate-500 dark:text-slate-400">Streak:</span>
              <span id="vd-streak" class="font-bold text-slate-700 dark:text-slate-200">${streak}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <i data-lucide="target" class="w-4 h-4 text-blue-500"></i>
              <span class="text-slate-500 dark:text-slate-400">Score:</span>
              <span id="vd-score" class="font-bold text-slate-700 dark:text-slate-200">${sessionCorrect} / ${sessionTotal}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <i data-lucide="trophy" class="w-4 h-4 text-amber-500"></i>
              <span class="text-slate-500 dark:text-slate-400">Best:</span>
              <span id="vd-best" class="font-bold text-amber-600 dark:text-amber-400">${bestStreak}</span>
            </div>
          </div>

          <!-- Keyboard hint -->
          <p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
            Keys: <kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">1</kbd>-<kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">4</kbd> answer &middot; <kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">S</kbd> skip &middot; <kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">Enter</kbd> submit (spelling)
          </p>
        </div>
      `;
    },

    mount(container) {
      const cardArea = container.querySelector('#vd-card-area');
      const progressBar = container.querySelector('#vd-progress-bar');
      const progressLabel = container.querySelector('#vd-progress-label');
      const streakEl = container.querySelector('#vd-streak');
      const scoreEl = container.querySelector('#vd-score');
      const bestEl = container.querySelector('#vd-best');

      function updateStats() {
        if (streakEl) streakEl.textContent = streak;
        if (scoreEl) scoreEl.textContent = `${sessionCorrect} / ${sessionTotal}`;
        if (bestEl) bestEl.textContent = bestStreak;
        if (progressBar) progressBar.style.width = `${getProgressPct()}%`;
        if (progressLabel) progressLabel.textContent = `${sessionTotal} / ${filteredTerms.length}`;
      }

      function advance() {
        isLocked = false;
        if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
        generateQuestion();
        if (currentTerm) {
          cardArea.innerHTML = renderQuestion();
          if (mode === 'spelling') {
            const inp = cardArea.querySelector('#vd-spelling-input');
            if (inp) inp.focus();
          }
        } else {
          cardArea.innerHTML = renderEmpty();
        }
        updateStats();
        if (window.lucide) window.lucide.createIcons();
      }

      function handleCorrect() {
        sessionCorrect++;
        sessionTotal++;
        streak++;
        if (streak > bestStreak) {
          bestStreak = streak;
          saveBestStreak(bestStreak);
        }
        store.recordStudyActivity('vocab-drill', { term: currentTerm.term, correct: true, mode });
        updateStats();
      }

      function handleWrong() {
        sessionTotal++;
        streak = 0;
        // Record struggle
        const struggles = loadStruggles();
        const key = termKey(currentTerm);
        struggles[key] = (struggles[key] || 0) + 1;
        saveStruggles(struggles);
        store.recordStudyActivity('vocab-drill', { term: currentTerm.term, correct: false, mode });
        updateStats();
      }

      function handleSkip() {
        if (isLocked) return;
        advance();
      }

      // Handle answer clicks (multiple choice)
      function handleOptionClick(optionIndex) {
        if (isLocked || mode === 'spelling') return;
        isLocked = true;

        const option = currentOptions[optionIndex];
        const buttons = cardArea.querySelectorAll('.vd-option');
        const isCorrect = option.isCorrect;

        // Highlight all buttons
        buttons.forEach((btn, i) => {
          btn.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-700', 'hover:border-slate-300', 'dark:hover:border-slate-500');
          btn.style.pointerEvents = 'none';
          if (currentOptions[i].isCorrect) {
            btn.classList.remove('border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800');
            btn.classList.add('border-green-400', 'dark:border-green-600', 'bg-green-50', 'dark:bg-green-900/20');
            const check = btn.querySelector('.vd-icon');
            if (check) check.innerHTML = '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
          }
          if (i === optionIndex && !isCorrect) {
            btn.classList.remove('border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800');
            btn.classList.add('border-red-400', 'dark:border-red-600', 'bg-red-50', 'dark:bg-red-900/20');
            const cross = btn.querySelector('.vd-icon');
            if (cross) cross.innerHTML = '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
          }
        });

        // Update feedback
        const feedback = cardArea.querySelector('#vd-feedback');
        if (feedback) {
          feedback.classList.remove('hidden');
          if (isCorrect) {
            feedback.innerHTML = '<span class="text-green-600 dark:text-green-400 font-semibold">Correct!</span>';
          } else {
            const correctLabel = mode === 'term-to-def' ? escapeHtml(currentTerm.definition) : escapeHtml(currentTerm.term);
            feedback.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">Wrong.</span> <span class="text-slate-500 dark:text-slate-400">Correct: ${correctLabel.length > 100 ? correctLabel.slice(0, 100) + '...' : correctLabel}</span>`;
          }
        }

        if (isCorrect) {
          handleCorrect();
          autoAdvanceTimer = setTimeout(advance, 800);
        } else {
          handleWrong();
          autoAdvanceTimer = setTimeout(advance, 1500);
        }
      }

      // Handle spelling submission
      function handleSpellingSubmit() {
        if (isLocked || mode !== 'spelling') return;
        isLocked = true;

        const input = cardArea.querySelector('#vd-spelling-input');
        if (!input) return;
        const answer = input.value.trim();
        if (!answer) { isLocked = false; return; }

        const isCorrect = isFuzzyMatch(answer, currentTerm.term);
        const feedback = cardArea.querySelector('#vd-feedback');
        const inputWrap = cardArea.querySelector('#vd-spelling-wrap');

        if (inputWrap) {
          inputWrap.classList.remove('border-slate-200', 'dark:border-slate-700');
          inputWrap.classList.add(
            isCorrect ? 'border-green-400' : 'border-red-400',
            isCorrect ? 'dark:border-green-600' : 'dark:border-red-600'
          );
        }

        if (feedback) {
          feedback.classList.remove('hidden');
          if (isCorrect) {
            feedback.innerHTML = `<span class="text-green-600 dark:text-green-400 font-semibold">Correct!</span> <span class="text-slate-500 dark:text-slate-400">${escapeHtml(currentTerm.term)}</span>`;
          } else {
            feedback.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">Wrong.</span> <span class="text-slate-500 dark:text-slate-400">Correct: <strong>${escapeHtml(currentTerm.term)}</strong></span>`;
          }
        }

        if (isCorrect) {
          handleCorrect();
          autoAdvanceTimer = setTimeout(advance, 800);
        } else {
          handleWrong();
          autoAdvanceTimer = setTimeout(advance, 1500);
        }
      }

      // Event delegation on card area
      cardArea.addEventListener('click', (e) => {
        const optionBtn = e.target.closest('.vd-option');
        if (optionBtn) {
          const idx = parseInt(optionBtn.dataset.index, 10);
          if (!isNaN(idx)) handleOptionClick(idx);
          return;
        }
        const skipBtn = e.target.closest('#vd-skip');
        if (skipBtn) { handleSkip(); return; }
        const submitBtn = e.target.closest('#vd-spelling-submit');
        if (submitBtn) { handleSpellingSubmit(); return; }
      });

      // Mode selector
      container.querySelectorAll('.vd-mode').forEach(btn => {
        btn.addEventListener('click', () => {
          mode = btn.dataset.mode;
          container.querySelectorAll('.vd-mode').forEach(b => {
            const isActive = b === btn;
            b.className = `vd-mode px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`;
          });
          // Reset session
          sessionCorrect = 0;
          sessionTotal = 0;
          streak = 0;
          sessionHistory = [];
          lastTermIndex = -1;
          isLocked = false;
          if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
          generateQuestion();
          cardArea.innerHTML = currentTerm ? renderQuestion() : renderEmpty();
          updateStats();
          if (mode === 'spelling') {
            const inp = cardArea.querySelector('#vd-spelling-input');
            if (inp) inp.focus();
          }
          if (window.lucide) window.lucide.createIcons();
        });
      });

      // Topic filter
      const topicSelect = container.querySelector('#vd-topic-filter');
      if (topicSelect) {
        topicSelect.addEventListener('change', () => {
          selectedTopic = topicSelect.value;
          filteredTerms = selectedTopic === 'all'
            ? [...allTerms]
            : allTerms.filter(t => t.topicId === selectedTopic);
          // Reset session
          sessionCorrect = 0;
          sessionTotal = 0;
          streak = 0;
          sessionHistory = [];
          lastTermIndex = -1;
          isLocked = false;
          if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
          generateQuestion();
          cardArea.innerHTML = currentTerm ? renderQuestion() : renderEmpty();
          updateStats();
          // Update progress label denominator
          if (progressLabel) progressLabel.textContent = `0 / ${filteredTerms.length}`;
          if (progressBar) progressBar.style.width = '0%';
          if (mode === 'spelling') {
            const inp = cardArea.querySelector('#vd-spelling-input');
            if (inp) inp.focus();
          }
          if (window.lucide) window.lucide.createIcons();
        });
      }

      // Keyboard shortcuts
      const onKey = (e) => {
        if (e.target.tagName === 'SELECT') return;
        // Allow typing in the spelling input
        if (e.target.id === 'vd-spelling-input') {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSpellingSubmit();
          }
          return;
        }
        if (mode !== 'spelling') {
          if (e.key === '1') handleOptionClick(0);
          if (e.key === '2') handleOptionClick(1);
          if (e.key === '3') handleOptionClick(2);
          if (e.key === '4') handleOptionClick(3);
        }
        if (e.key === 's' || e.key === 'S') handleSkip();
      };
      document.addEventListener('keydown', onKey);
      keyHandler = onKey;

      // Focus spelling input on initial load if in spelling mode
      if (mode === 'spelling') {
        const inp = cardArea.querySelector('#vd-spelling-input');
        if (inp) inp.focus();
      }
    },

    unmount() {
      if (keyHandler) {
        document.removeEventListener('keydown', keyHandler);
        keyHandler = null;
      }
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }
    }
  };

  // ---- Render helpers (closured so they can access state) ----

  function renderQuestion() {
    if (!currentTerm) return renderEmpty();

    const topicObj = TOPICS.find(t => t.id === currentTerm.topicId);
    const topicLabel = topicObj ? topicObj.title : currentTerm.topicId;
    const topicIcon = topicObj ? topicObj.icon : 'book-open';
    const topicColor = topicObj ? topicObj.color : 'slate';
    const struggles = loadStruggles();
    const wrongCount = struggles[termKey(currentTerm)] || 0;

    // Prompt: what we show the user
    let promptText = '';
    let promptLabel = '';
    if (mode === 'term-to-def') {
      promptText = escapeHtml(currentTerm.term);
      promptLabel = 'What is the definition?';
    } else if (mode === 'def-to-term') {
      promptText = escapeHtml(currentTerm.definition);
      promptLabel = 'What is the term?';
    } else {
      // spelling
      promptText = escapeHtml(currentTerm.definition);
      promptLabel = 'Type the term:';
    }

    const promptSizeClass = mode === 'term-to-def'
      ? 'text-2xl sm:text-3xl font-bold'
      : 'text-base sm:text-lg leading-relaxed';

    let answersHtml = '';
    if (mode === 'spelling') {
      answersHtml = `
        <div class="mt-6 max-w-md mx-auto">
          <div id="vd-spelling-wrap" class="flex items-center gap-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-colors bg-white dark:bg-slate-800">
            <input
              id="vd-spelling-input"
              type="text"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="Type the term..."
              class="flex-1 px-4 py-3 text-lg bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
            <button id="vd-spelling-submit" class="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors flex-shrink-0">
              Submit
            </button>
          </div>
        </div>
      `;
    } else {
      // Multiple choice 2x2 grid
      const optionLetters = ['A', 'B', 'C', 'D'];
      const labelSizeClass = mode === 'term-to-def' ? 'text-sm leading-relaxed' : 'text-base font-medium';
      answersHtml = `
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${currentOptions.map((opt, i) => {
            const truncated = opt.label.length > 160 ? opt.label.slice(0, 157) + '...' : opt.label;
            return `
              <button
                class="vd-option group relative text-left px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all"
                data-index="${i}"
              >
                <div class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    ${optionLetters[i]}
                  </span>
                  <span class="${labelSizeClass} text-slate-700 dark:text-slate-300 flex-1">${escapeHtml(truncated)}</span>
                  <span class="vd-icon flex-shrink-0 w-5 h-5"></span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      <!-- Prompt Card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <!-- Topic badge bar -->
        <div class="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <i data-lucide="${topicIcon}" class="w-4 h-4 text-${topicColor}-500"></i>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">${topicLabel}</span>
            ${wrongCount > 0 ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" title="Missed ${wrongCount} time${wrongCount > 1 ? 's' : ''}">&#x26A0; ${wrongCount}x wrong</span>` : ''}
          </div>
          <button id="vd-skip" class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1">
            <i data-lucide="skip-forward" class="w-3 h-3"></i> Skip
          </button>
        </div>

        <!-- Prompt -->
        <div class="px-6 py-8 sm:px-8 sm:py-10 text-center">
          <p class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">${promptLabel}</p>
          <p class="${promptSizeClass} text-slate-800 dark:text-slate-100">${promptText}</p>
        </div>

        <!-- Answers -->
        <div class="px-5 pb-6 sm:px-8 sm:pb-8">
          ${answersHtml}

          <!-- Feedback -->
          <div id="vd-feedback" class="hidden mt-4 text-center text-sm py-2"></div>
        </div>
      </div>
    `;
  }

  function renderEmpty() {
    return `
      <div class="text-center py-16">
        <i data-lucide="book-check" class="w-16 h-16 mx-auto mb-4 text-emerald-400"></i>
        <h3 class="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">No vocabulary loaded</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-6">Make sure topic data is available, or select a different topic.</p>
        <a data-route="#/" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors cursor-pointer">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
        </a>
      </div>
    `;
  }
}

export { createVocabDrillView };
