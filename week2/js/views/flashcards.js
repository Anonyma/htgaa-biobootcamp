/**
 * HTGAA Week 2 — Flashcard View
 * SM-2 spaced repetition system for vocabulary review.
 */

import { store, TOPICS } from '../store.js';

function createFlashcardsView() {
  let allCards = [];
  let dueCards = [];
  let currentIndex = 0;
  let isFlipped = false;
  let selectedTopic = 'all';
  let keyHandler = null;
  let sessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 };

  return {
    async render() {
      // Load all topic data and collect vocabulary
      allCards = await loadAllFlashcards();
      dueCards = store.getDueFlashcards(allCards);

      // Calculate stats
      const stats = calculateStats(allCards);

      return `
        <div class="max-w-3xl mx-auto px-4 py-8">
          <header class="mb-8">
            <a data-route="#/" class="text-sm text-slate-500 hover:text-blue-500 cursor-pointer flex items-center gap-1 mb-4">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
            </a>
            <h1 class="text-3xl font-extrabold mb-3 flex items-center gap-3">
              <i data-lucide="layers" class="w-8 h-8 text-violet-500"></i>
              Flashcards
            </h1>
            <p class="text-slate-500">Spaced repetition review. Cards you struggle with appear more often.</p>
          </header>

          <!-- Topic Filter -->
          <div class="mb-6 flex items-center gap-2 flex-wrap">
            <button class="fc-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" data-topic="all">
              All (${allCards.length})
            </button>
            ${TOPICS.map(t => {
              const count = allCards.filter(c => c.topicId === t.id).length;
              return `<button class="fc-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" data-topic="${t.id}">${t.title} (${count})</button>`;
            }).join('')}
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-2xl font-bold text-red-600 dark:text-red-400" id="fc-due">${dueCards.length}</p>
              <p class="text-xs text-slate-500">Due now</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400" id="fc-new">${stats.newCards}</p>
              <p class="text-xs text-slate-500">New</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400" id="fc-learning">${stats.learning}</p>
              <p class="text-xs text-slate-500">Learning</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-2xl font-bold text-green-600 dark:text-green-400" id="fc-mature">${stats.mature}</p>
              <p class="text-xs text-slate-500">Mature</p>
            </div>
          </div>

          <!-- Progress Bar -->
          ${dueCards.length > 0 ? `
          <div class="mb-6">
            <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Session Progress</span>
              <span id="fc-progress-text">0 / ${dueCards.length}</span>
            </div>
            <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div id="fc-progress-bar" class="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
          ` : ''}

          <!-- Card Area -->
          <div id="fc-card-area">
            ${dueCards.length > 0 ? renderCard(dueCards[0], allCards) : renderComplete()}
          </div>

          <!-- Instructions -->
          <div class="mt-8 text-center text-sm text-slate-400">
            <p>Click card to flip. Rate your recall: Again (1), Hard (2), Good (3), Easy (4).</p>
            <p class="mt-1">Keyboard: Space to flip, 1-4 to rate.</p>
          </div>

          <!-- Session Stats (hidden initially) -->
          <div id="fc-session-stats" class="mt-8 hidden">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
              <i data-lucide="bar-chart" class="w-5 h-5 text-violet-500"></i>
              Session Summary
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
                <p class="text-xl font-bold text-red-600 dark:text-red-400" id="fc-stat-again">0</p>
                <p class="text-xs text-red-600 dark:text-red-400">Again</p>
              </div>
              <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center border border-yellow-200 dark:border-yellow-800">
                <p class="text-xl font-bold text-yellow-600 dark:text-yellow-400" id="fc-stat-hard">0</p>
                <p class="text-xs text-yellow-600 dark:text-yellow-400">Hard</p>
              </div>
              <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                <p class="text-xl font-bold text-green-600 dark:text-green-400" id="fc-stat-good">0</p>
                <p class="text-xs text-green-600 dark:text-green-400">Good</p>
              </div>
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                <p class="text-xl font-bold text-blue-600 dark:text-blue-400" id="fc-stat-easy">0</p>
                <p class="text-xs text-blue-600 dark:text-blue-400">Easy</p>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    mount(container) {
      const cardArea = container.querySelector('#fc-card-area');
      const progressBar = container.querySelector('#fc-progress-bar');
      const progressText = container.querySelector('#fc-progress-text');
      const sessionStatsEl = container.querySelector('#fc-session-stats');

      // Reset session stats
      sessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 };

      // Filter buttons
      container.querySelectorAll('.fc-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedTopic = btn.dataset.topic;
          container.querySelectorAll('.fc-filter').forEach(b => {
            b.className = b === btn
              ? 'fc-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'fc-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600';
          });
          const filtered = selectedTopic === 'all' ? allCards : allCards.filter(c => c.topicId === selectedTopic);
          dueCards = store.getDueFlashcards(filtered);
          currentIndex = 0;
          isFlipped = false;
          sessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 };
          cardArea.innerHTML = dueCards.length > 0 ? renderCard(dueCards[0], allCards) : renderComplete();
          updateProgress();
          if (sessionStatsEl) sessionStatsEl.classList.add('hidden');
        });
      });

      // Update progress display
      const updateProgress = () => {
        if (progressBar && progressText) {
          const progress = (sessionStats.reviewed / dueCards.length) * 100;
          progressBar.style.width = `${progress}%`;
          progressText.textContent = `${sessionStats.reviewed} / ${dueCards.length}`;
        }

        // Update stats cards
        const stats = calculateStats(allCards);
        const dueEl = container.querySelector('#fc-due');
        const newEl = container.querySelector('#fc-new');
        const learningEl = container.querySelector('#fc-learning');
        const matureEl = container.querySelector('#fc-mature');

        if (dueEl) dueEl.textContent = Math.max(0, dueCards.length - sessionStats.reviewed);
        if (newEl) newEl.textContent = stats.newCards;
        if (learningEl) learningEl.textContent = stats.learning;
        if (matureEl) matureEl.textContent = stats.mature;
      };

      // Card interaction
      const handleFlip = () => {
        if (currentIndex >= dueCards.length || dueCards.length === 0) return;
        isFlipped = !isFlipped;
        const inner = cardArea.querySelector('.fc-card-inner');
        if (inner) {
          inner.classList.toggle('flipped', isFlipped);
          inner.setAttribute('aria-label', isFlipped ? 'Card showing definition' : 'Card showing term');
        }
        const ratingBtns = cardArea.querySelector('.fc-rating');
        if (ratingBtns) {
          ratingBtns.classList.toggle('hidden', !isFlipped);
          ratingBtns.style.display = isFlipped ? 'flex' : 'none';
        }
      };

      const handleRate = (quality) => {
        if (currentIndex >= dueCards.length) return;
        const card = dueCards[currentIndex];

        // Save review
        store.saveFlashcardReview(card.id, quality);

        // Update session stats
        sessionStats.reviewed++;
        if (quality === 1) sessionStats.again++;
        else if (quality === 3) sessionStats.hard++;
        else if (quality === 4) sessionStats.good++;
        else if (quality === 5) sessionStats.easy++;

        // Visual feedback
        const ratingBtns = cardArea.querySelector('.fc-rating');
        if (ratingBtns) {
          ratingBtns.style.opacity = '0';
          setTimeout(() => {
            currentIndex++;
            isFlipped = false;

            if (currentIndex < dueCards.length) {
              cardArea.innerHTML = renderCard(dueCards[currentIndex], allCards);
              updateProgress();
              if (window.lucide) window.lucide.createIcons();
            } else {
              // Session complete
              cardArea.innerHTML = renderComplete();
              updateProgress();
              if (sessionStatsEl) {
                sessionStatsEl.classList.remove('hidden');
                container.querySelector('#fc-stat-again').textContent = sessionStats.again;
                container.querySelector('#fc-stat-hard').textContent = sessionStats.hard;
                container.querySelector('#fc-stat-good').textContent = sessionStats.good;
                container.querySelector('#fc-stat-easy').textContent = sessionStats.easy;
              }
              if (window.lucide) window.lucide.createIcons();
            }
          }, 200);
        }
      };

      cardArea.addEventListener('click', (e) => {
        const rateBtn = e.target.closest('[data-quality]');
        if (rateBtn) {
          handleRate(parseInt(rateBtn.dataset.quality, 10));
          return;
        }
        if (e.target.closest('.fc-card')) handleFlip();
      });

      // Keyboard shortcuts
      const onKey = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.code === 'Space') { e.preventDefault(); handleFlip(); }
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(3);
        if (e.key === '3') handleRate(4);
        if (e.key === '4') handleRate(5);
      };
      document.addEventListener('keydown', onKey);
      keyHandler = onKey;
    },

    unmount() {
      if (keyHandler) {
        document.removeEventListener('keydown', keyHandler);
        keyHandler = null;
      }
    }
  };
}

function renderCard(card, allCards) {
  if (!card) return renderComplete();
  const topic = TOPICS.find(t => t.id === card.topicId);
  const cardState = getCardState(card.id);

  // Get next review intervals for preview
  const intervals = getNextIntervals(card.id);

  return `
    <div class="fc-card cursor-pointer select-none" style="perspective: 1000px" aria-label="Card showing term">
      <div class="fc-card-inner relative transition-transform duration-500" style="transform-style: preserve-3d; min-height: 320px">
        <!-- Front -->
        <div class="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center shadow-lg" style="backface-visibility: hidden; -webkit-backface-visibility: hidden;">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-xs px-2 py-1 rounded-full ${getStateBadgeClass(cardState)}">
              ${cardState}
            </span>
            <span class="text-xs text-slate-400 flex items-center gap-1">
              <i data-lucide="${topic?.icon || 'book-open'}" class="w-3 h-3"></i> ${topic?.title || 'General'}
            </span>
          </div>
          <p class="text-2xl font-bold mb-2">${escapeHtml(card.term)}</p>
          <div class="mt-4 flex items-center gap-2 text-slate-400">
            <i data-lucide="flip-horizontal" class="w-4 h-4"></i>
            <p class="text-sm">Click to reveal definition</p>
          </div>
        </div>
        <!-- Back -->
        <div class="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-8 flex flex-col items-center justify-center text-center shadow-lg" style="transform: rotateY(180deg); backface-visibility: hidden; -webkit-backface-visibility: hidden;">
          <p class="font-bold text-blue-600 dark:text-blue-400 mb-3 text-lg">${escapeHtml(card.term)}</p>
          <p class="text-sm leading-relaxed max-w-md">${escapeHtml(card.definition)}</p>
        </div>
      </div>
    </div>

    <!-- Rating Buttons -->
    <div class="fc-rating hidden mt-6 flex flex-col gap-3" style="display: none; transition: opacity 0.3s;">
      <p class="text-xs text-center text-slate-500">How well did you recall this?</p>
      <div class="flex items-center justify-center gap-2 flex-wrap">
        <button data-quality="1" class="flex-1 sm:flex-none px-4 py-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-all hover:scale-105 active:scale-95">
          <div class="flex flex-col items-center gap-1">
            <span>Again</span>
            <span class="text-xs opacity-70">&lt;1 min (1)</span>
          </div>
        </button>
        <button data-quality="3" class="flex-1 sm:flex-none px-4 py-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-semibold text-sm hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all hover:scale-105 active:scale-95">
          <div class="flex flex-col items-center gap-1">
            <span>Hard</span>
            <span class="text-xs opacity-70">${intervals.hard} (2)</span>
          </div>
        </button>
        <button data-quality="4" class="flex-1 sm:flex-none px-4 py-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-all hover:scale-105 active:scale-95">
          <div class="flex flex-col items-center gap-1">
            <span>Good</span>
            <span class="text-xs opacity-70">${intervals.good} (3)</span>
          </div>
        </button>
        <button data-quality="5" class="flex-1 sm:flex-none px-4 py-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all hover:scale-105 active:scale-95">
          <div class="flex flex-col items-center gap-1">
            <span>Easy</span>
            <span class="text-xs opacity-70">${intervals.easy} (4)</span>
          </div>
        </button>
      </div>
    </div>
  `;
}

function renderComplete() {
  return `
    <div class="text-center py-16">
      <i data-lucide="party-popper" class="w-16 h-16 mx-auto mb-4 text-green-400"></i>
      <h3 class="text-2xl font-bold mb-2">All caught up!</h3>
      <p class="text-slate-500 mb-6">No cards due for review right now. Come back later for spaced repetition.</p>
      <a data-route="#/" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
        <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
      </a>
    </div>
  `;
}

async function loadAllFlashcards() {
  const cards = [];
  for (const topic of TOPICS) {
    try {
      const data = await store.loadTopicData(topic.id);
      if (data?.vocabulary) {
        data.vocabulary.forEach((v, i) => {
          cards.push({
            id: `${topic.id}-vocab-${i}`,
            topicId: topic.id,
            term: v.term,
            definition: v.definition,
          });
        });
      }
    } catch { /* skip missing topics */ }
  }
  return cards;
}

/**
 * Calculate statistics about card states
 */
function calculateStats(allCards) {
  const reviews = store.get('flashcards').reviews;
  let newCards = 0;
  let learning = 0;
  let mature = 0;

  allCards.forEach(card => {
    const review = reviews[card.id];
    if (!review) {
      newCards++;
    } else if (review.interval < 21) {
      learning++;
    } else {
      mature++;
    }
  });

  return { newCards, learning, mature };
}

/**
 * Get the state of a card (New, Learning, or Mature)
 */
function getCardState(cardId) {
  const reviews = store.get('flashcards').reviews;
  const review = reviews[cardId];

  if (!review) return 'New';
  if (review.interval < 21) return 'Learning';
  return 'Mature';
}

/**
 * Get badge class for card state
 */
function getStateBadgeClass(state) {
  switch (state) {
    case 'New':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    case 'Learning':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    case 'Mature':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    default:
      return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
  }
}

/**
 * Preview next review intervals for rating buttons
 */
function getNextIntervals(cardId) {
  const reviews = store.get('flashcards').reviews;
  const review = reviews[cardId] || { easeFactor: 2.5, interval: 1, repetitions: 0 };

  const formatInterval = (days) => {
    if (days < 1) return '<1 day';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30);
    if (months === 1) return '1 month';
    return `${months} months`;
  };

  // Simulate SM-2 calculation for each quality
  const calcInterval = (quality) => {
    let interval = review.interval;
    let reps = review.repetitions;

    if (quality >= 3) {
      if (reps === 0) interval = 1;
      else if (reps === 1) interval = 6;
      else interval = Math.round(interval * review.easeFactor);
    } else {
      interval = 1;
    }

    return formatInterval(interval);
  };

  return {
    hard: calcInterval(3),
    good: calcInterval(4),
    easy: calcInterval(5),
  };
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export { createFlashcardsView };
