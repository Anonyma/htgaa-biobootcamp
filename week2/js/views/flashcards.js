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

  return {
    async render() {
      // Load all topic data and collect vocabulary
      allCards = await loadAllFlashcards();
      dueCards = store.getDueFlashcards(allCards);

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
              return `<button class="fc-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200" data-topic="${t.id}">${t.title} (${count})</button>`;
            }).join('')}
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-2xl font-bold text-green-600" id="fc-due">${dueCards.length}</p>
              <p class="text-xs text-slate-500">Due now</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-2xl font-bold" id="fc-reviewed">0</p>
              <p class="text-xs text-slate-500">Reviewed</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-2xl font-bold" id="fc-total">${allCards.length}</p>
              <p class="text-xs text-slate-500">Total cards</p>
            </div>
          </div>

          <!-- Card Area -->
          <div id="fc-card-area">
            ${dueCards.length > 0 ? renderCard(dueCards[0]) : renderComplete()}
          </div>

          <!-- Instructions -->
          <div class="mt-8 text-center text-sm text-slate-400">
            <p>Click card to flip. Rate your recall: Again (1), Hard (3), Good (4), Easy (5).</p>
            <p class="mt-1">Keyboard: Space to flip, 1-4 to rate.</p>
          </div>
        </div>
      `;
    },

    mount(container) {
      const cardArea = container.querySelector('#fc-card-area');
      let reviewed = 0;

      // Filter buttons
      container.querySelectorAll('.fc-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedTopic = btn.dataset.topic;
          container.querySelectorAll('.fc-filter').forEach(b => {
            b.className = b === btn
              ? 'fc-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'fc-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200';
          });
          const filtered = selectedTopic === 'all' ? allCards : allCards.filter(c => c.topicId === selectedTopic);
          dueCards = store.getDueFlashcards(filtered);
          currentIndex = 0;
          isFlipped = false;
          cardArea.innerHTML = dueCards.length > 0 ? renderCard(dueCards[0]) : renderComplete();
        });
      });

      // Card interaction
      const handleFlip = () => {
        if (dueCards.length === 0) return;
        isFlipped = !isFlipped;
        const inner = cardArea.querySelector('.fc-card-inner');
        if (inner) inner.classList.toggle('flipped', isFlipped);
        const ratingBtns = cardArea.querySelector('.fc-rating');
        if (ratingBtns) ratingBtns.classList.toggle('hidden', !isFlipped);
      };

      const handleRate = (quality) => {
        if (currentIndex >= dueCards.length) return;
        const card = dueCards[currentIndex];
        store.saveFlashcardReview(card.id, quality);
        reviewed++;
        container.querySelector('#fc-reviewed').textContent = reviewed;

        currentIndex++;
        isFlipped = false;
        if (currentIndex < dueCards.length) {
          cardArea.innerHTML = renderCard(dueCards[currentIndex]);
        } else {
          cardArea.innerHTML = renderComplete();
          container.querySelector('#fc-due').textContent = '0';
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

function renderCard(card) {
  if (!card) return renderComplete();
  const topic = TOPICS.find(t => t.id === card.topicId);

  return `
    <div class="fc-card cursor-pointer select-none" style="perspective: 1000px">
      <div class="fc-card-inner relative transition-transform duration-500" style="transform-style: preserve-3d; min-height: 280px">
        <!-- Front -->
        <div class="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center shadow-lg">
          <span class="text-xs text-slate-400 mb-4 flex items-center gap-1">
            <i data-lucide="${topic?.icon || 'book-open'}" class="w-3 h-3"></i> ${topic?.title || 'General'}
          </span>
          <p class="text-xl font-bold">${card.term}</p>
          <p class="text-sm text-slate-400 mt-4">Click to reveal definition</p>
        </div>
        <!-- Back -->
        <div class="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-8 flex flex-col items-center justify-center text-center shadow-lg" style="transform: rotateY(180deg)">
          <p class="font-bold text-blue-600 dark:text-blue-400 mb-3">${card.term}</p>
          <p class="text-sm leading-relaxed">${card.definition}</p>
        </div>
      </div>
    </div>

    <!-- Rating Buttons -->
    <div class="fc-rating hidden mt-6 flex items-center justify-center gap-3">
      <button data-quality="1" class="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold text-sm hover:bg-red-200 transition-colors">
        Again <span class="text-xs opacity-60">(1)</span>
      </button>
      <button data-quality="3" class="px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-semibold text-sm hover:bg-yellow-200 transition-colors">
        Hard <span class="text-xs opacity-60">(2)</span>
      </button>
      <button data-quality="4" class="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold text-sm hover:bg-green-200 transition-colors">
        Good <span class="text-xs opacity-60">(3)</span>
      </button>
      <button data-quality="5" class="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm hover:bg-blue-200 transition-colors">
        Easy <span class="text-xs opacity-60">(4)</span>
      </button>
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

export { createFlashcardsView };
