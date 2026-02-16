/**
 * Topic Review View
 * Spaced review scheduler — suggests what to study based on time since last review.
 */

import { store, TOPICS } from '../store.js';

export function createTopicReviewView() {
  const INTERVALS = [1, 3, 7, 14, 30]; // days for spaced repetition levels

  function getReviewData() {
    try { return JSON.parse(localStorage.getItem('htgaa-week2-topic-reviews') || '{}'); } catch { return {}; }
  }
  function saveReviewData(data) { localStorage.setItem('htgaa-week2-topic-reviews', JSON.stringify(data)); }

  function getDaysSince(timestamp) {
    if (!timestamp) return Infinity;
    return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  }

  function getReviewLevel(topicId) {
    const data = getReviewData();
    return (data[topicId] && data[topicId].level) || 0;
  }

  function getNextReviewInterval(level) {
    return INTERVALS[Math.min(level, INTERVALS.length - 1)];
  }

  function getTopicReviewStatus(topicId) {
    const data = getReviewData();
    const topicData = data[topicId] || {};
    const lastReview = topicData.lastReview || 0;
    const level = topicData.level || 0;
    const daysSince = getDaysSince(lastReview);
    const interval = getNextReviewInterval(level);
    const dueIn = lastReview ? interval - daysSince : 0;
    const isDue = dueIn <= 0;
    const quizScore = store.getQuizScore(topicId);
    const sectionsRead = store.getSectionsRead(topicId);
    const sectionsCount = Array.isArray(sectionsRead) ? sectionsRead.length : Object.keys(sectionsRead || {}).length;

    return {
      topicId,
      lastReview,
      level,
      daysSince: lastReview ? daysSince : null,
      interval,
      dueIn,
      isDue,
      quizScore,
      sectionsRead: sectionsCount,
      reviewCount: topicData.reviewCount || 0
    };
  }

  function markReviewed(topicId, quality) {
    // quality: 'easy' (level up), 'good' (stay), 'hard' (level down)
    const data = getReviewData();
    const current = data[topicId] || { level: 0, reviewCount: 0 };
    if (quality === 'easy') current.level = Math.min(current.level + 1, INTERVALS.length - 1);
    else if (quality === 'hard') current.level = Math.max(current.level - 1, 0);
    current.lastReview = Date.now();
    current.reviewCount = (current.reviewCount || 0) + 1;
    data[topicId] = current;
    saveReviewData(data);
  }

  return {
    render() {
      const statuses = TOPICS.map(t => ({
        ...t,
        review: getTopicReviewStatus(t.id)
      })).sort((a, b) => {
        // Due first, then by most overdue
        if (a.review.isDue && !b.review.isDue) return -1;
        if (!a.review.isDue && b.review.isDue) return 1;
        if (a.review.isDue && b.review.isDue) return (a.review.dueIn || 0) - (b.review.dueIn || 0);
        return a.review.dueIn - b.review.dueIn;
      });

      const dueCount = statuses.filter(s => s.review.isDue).length;
      const totalReviews = statuses.reduce((s, t) => s + t.review.reviewCount, 0);

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Spaced Review</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Review topics at optimal intervals for long-term retention</p>
            </div>
            <a data-route="#/" class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Home
            </a>
          </div>

          <!-- Summary stats -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p class="text-2xl font-bold ${dueCount > 0 ? 'text-red-500' : 'text-green-500'}">${dueCount}</p>
              <p class="text-xs text-slate-500 mt-1">Due for Review</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p class="text-2xl font-bold text-blue-600">${totalReviews}</p>
              <p class="text-xs text-slate-500 mt-1">Total Reviews</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p class="text-2xl font-bold text-purple-600">${6 - dueCount}</p>
              <p class="text-xs text-slate-500 mt-1">Up to Date</p>
            </div>
          </div>

          <!-- How it works -->
          <div class="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 p-4 mb-6">
            <h3 class="font-bold text-blue-700 dark:text-blue-300 text-sm mb-1 flex items-center gap-2">
              <i data-lucide="info" class="w-4 h-4"></i> How Spaced Review Works
            </h3>
            <p class="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
              After studying a topic, mark it as reviewed. The system schedules your next review at increasing intervals:
              <strong>1 day → 3 days → 7 days → 14 days → 30 days</strong>.
              Rate each review as Easy (level up), Good (same level), or Hard (level down) to personalize the schedule.
            </p>
          </div>

          <!-- Topic cards -->
          <div class="space-y-3" id="review-cards">
            ${statuses.map(t => {
              const r = t.review;
              const urgencyClass = r.isDue ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500';
              const levelDots = INTERVALS.map((_, i) =>
                `<span class="w-2 h-2 rounded-full ${i < r.level ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}"></span>`
              ).join('');

              return `
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${urgencyClass} overflow-hidden">
                  <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-3">
                        <span class="w-3 h-3 rounded-full bg-${t.color}-500"></span>
                        <h3 class="font-bold text-slate-800 dark:text-white">${t.title}</h3>
                      </div>
                      <div class="flex items-center gap-1.5">${levelDots}</div>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center gap-4 text-slate-500">
                        <span>Quiz: <strong class="${r.quizScore >= 70 ? 'text-green-600' : r.quizScore > 0 ? 'text-amber-600' : 'text-slate-400'}">${r.quizScore || 0}%</strong></span>
                        <span>Sections: <strong>${r.sectionsRead}</strong></span>
                        <span>Reviews: <strong>${r.reviewCount}</strong></span>
                      </div>
                      <div>
                        ${r.isDue ?
                          `<span class="text-red-500 font-medium text-xs">${r.daysSince === null ? 'Never reviewed' : 'Due now'}</span>` :
                          `<span class="text-green-500 font-medium text-xs">Next in ${r.dueIn} day${r.dueIn !== 1 ? 's' : ''}</span>`
                        }
                      </div>
                    </div>
                    ${r.isDue ? `
                      <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <a data-route="#/topic/${t.id}" class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
                          <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Study Topic
                        </a>
                        <div class="flex gap-2">
                          <button class="review-btn px-3 py-1.5 text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition-colors" data-topic="${t.id}" data-quality="hard">Hard</button>
                          <button class="review-btn px-3 py-1.5 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors" data-topic="${t.id}" data-quality="good">Good</button>
                          <button class="review-btn px-3 py-1.5 text-xs rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors" data-topic="${t.id}" data-quality="easy">Easy</button>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>`;
    },

    mount(container) {
      container.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          markReviewed(btn.dataset.topic, btn.dataset.quality);
          // Re-render the view
          const view = createTopicReviewView();
          container.innerHTML = view.render();
          view.mount(container);
        });
      });

      if (window.lucide) lucide.createIcons();
    }
  };
}
