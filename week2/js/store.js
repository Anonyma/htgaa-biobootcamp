/**
 * HTGAA Week 2 — Lightweight Reactive Store
 * Simple state management with subscriber pattern.
 */

const STORAGE_KEY = 'htgaa-week2-progress';
const THEME_KEY = 'htgaa-theme';
const QUIZ_KEY = 'htgaa-week2-quizzes';
const FLASHCARD_KEY = 'htgaa-week2-flashcards';
const HOMEWORK_KEY = 'htgaa-week2-homework-checks';

const TOPICS = [
  { id: 'sequencing', title: 'DNA Sequencing', icon: 'scan-search', color: 'blue' },
  { id: 'synthesis', title: 'DNA Synthesis', icon: 'pen-tool', color: 'green' },
  { id: 'editing', title: 'Gene Editing', icon: 'scissors', color: 'red' },
  { id: 'genetic-codes', title: 'Genetic Codes', icon: 'dna', color: 'purple' },
  { id: 'gel-electrophoresis', title: 'Gel Electrophoresis', icon: 'flask-conical', color: 'yellow' },
  { id: 'central-dogma', title: 'Central Dogma', icon: 'arrow-right-left', color: 'indigo' },
];

class Store {
  constructor() {
    this._subscribers = new Map();
    this._state = {
      theme: localStorage.getItem(THEME_KEY) || 'light',
      progress: this._loadJSON(STORAGE_KEY, {}),
      quizzes: this._loadJSON(QUIZ_KEY, {}),
      flashcards: this._loadJSON(FLASHCARD_KEY, { cards: [], reviews: {} }),
      homeworkChecks: this._loadJSON(HOMEWORK_KEY, {}),
      currentRoute: '',
      topicData: {},   // cached topic JSON data
      sidebarOpen: false,
    };
  }

  get state() { return this._state; }

  get(key) { return this._state[key]; }

  set(key, value) {
    const old = this._state[key];
    this._state[key] = value;
    this._notify(key, value, old);
  }

  subscribe(key, fn) {
    if (!this._subscribers.has(key)) this._subscribers.set(key, new Set());
    this._subscribers.get(key).add(fn);
    return () => this._subscribers.get(key).delete(fn);
  }

  _notify(key, value, old) {
    const subs = this._subscribers.get(key);
    if (subs) subs.forEach(fn => fn(value, old));
    // Also notify wildcard subscribers
    const all = this._subscribers.get('*');
    if (all) all.forEach(fn => fn(key, value, old));
  }

  _loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  // --- Theme ---
  toggleTheme() {
    const next = this._state.theme === 'dark' ? 'light' : 'dark';
    this.set('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem(THEME_KEY, next);
  }

  initTheme() {
    if (this._state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }

  // --- Progress ---
  markTopicComplete(topicId) {
    const progress = { ...this._state.progress, [topicId]: true };
    this.set('progress', progress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  markTopicIncomplete(topicId) {
    const progress = { ...this._state.progress };
    delete progress[topicId];
    this.set('progress', progress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  isTopicComplete(topicId) {
    return !!this._state.progress[topicId];
  }

  getOverallProgress() {
    const completed = TOPICS.filter(t => this._state.progress[t.id]).length;
    return Math.round((completed / TOPICS.length) * 100);
  }

  // --- Quizzes ---
  markQuizAnswered(quizId, correct) {
    const quizzes = { ...this._state.quizzes, [quizId]: correct };
    this.set('quizzes', quizzes);
    localStorage.setItem(QUIZ_KEY, JSON.stringify(quizzes));
  }

  isQuizAnswered(quizId) {
    return this._state.quizzes[quizId] !== undefined;
  }

  getQuizScore(topicId) {
    const entries = Object.entries(this._state.quizzes)
      .filter(([k]) => k.startsWith(topicId + '-'));
    if (entries.length === 0) return null;
    const correct = entries.filter(([, v]) => v).length;
    return { correct, total: entries.length };
  }

  // --- Homework ---
  toggleHomeworkCheck(checkId) {
    const checks = { ...this._state.homeworkChecks };
    checks[checkId] = !checks[checkId];
    this.set('homeworkChecks', checks);
    localStorage.setItem(HOMEWORK_KEY, JSON.stringify(checks));
  }

  // --- Flashcards (SM-2) ---
  saveFlashcardReview(cardId, quality) {
    const fc = { ...this._state.flashcards };
    const review = fc.reviews[cardId] || {
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      lastReview: null,
      nextReview: null,
      reviewCount: 0,
      lapses: 0
    };

    // SM-2 Algorithm Implementation
    // Quality: 1 (Again), 3 (Hard), 4 (Good), 5 (Easy)

    // Update ease factor using SM-2 formula
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    review.easeFactor = Math.max(1.3, review.easeFactor + efDelta);

    // Calculate new interval based on quality
    if (quality >= 3) {
      // Correct response
      if (review.repetitions === 0) {
        review.interval = 1; // First successful review: 1 day
      } else if (review.repetitions === 1) {
        review.interval = 6; // Second successful review: 6 days
      } else {
        // Subsequent reviews: multiply by ease factor
        review.interval = Math.round(review.interval * review.easeFactor);
      }
      review.repetitions++;
    } else {
      // Incorrect response: reset to beginning
      review.repetitions = 0;
      review.interval = 1;
      review.lapses++;
    }

    // Hard (quality 3) gets a shorter interval multiplier
    if (quality === 3 && review.repetitions > 1) {
      review.interval = Math.round(review.interval * 0.85);
    }

    // Easy (quality 5) gets a bonus multiplier
    if (quality === 5 && review.repetitions > 0) {
      review.interval = Math.round(review.interval * 1.3);
    }

    // Cap maximum interval at 1 year
    review.interval = Math.min(review.interval, 365);

    // Update review timestamps
    review.lastReview = Date.now();
    review.nextReview = Date.now() + review.interval * 86400000; // interval in days
    review.reviewCount++;

    fc.reviews[cardId] = review;
    this.set('flashcards', fc);
    localStorage.setItem(FLASHCARD_KEY, JSON.stringify(fc));
  }

  getDueFlashcards(allCards) {
    const now = Date.now();
    const reviews = this._state.flashcards.reviews;
    return allCards.filter(card => {
      const r = reviews[card.id];
      if (!r) return true; // never reviewed (new cards)
      return r.nextReview <= now; // review due
    });
  }

  getFlashcardStats() {
    const reviews = this._state.flashcards.reviews;
    const stats = {
      total: Object.keys(reviews).length,
      new: 0,
      learning: 0,
      mature: 0,
      due: 0,
      averageEase: 0,
      totalReviews: 0
    };

    const now = Date.now();
    let easeSum = 0;
    let easeCount = 0;

    Object.values(reviews).forEach(r => {
      stats.totalReviews += r.reviewCount || 0;
      if (r.interval < 21) stats.learning++;
      else stats.mature++;
      if (r.nextReview <= now) stats.due++;

      easeSum += r.easeFactor;
      easeCount++;
    });

    if (easeCount > 0) {
      stats.averageEase = (easeSum / easeCount).toFixed(2);
    }

    return stats;
  }

  // --- Topic Data Cache ---
  async loadTopicData(topicId) {
    if (this._state.topicData[topicId]) return this._state.topicData[topicId];
    try {
      const resp = await fetch(`data/${topicId}.json`);
      if (!resp.ok) throw new Error(`Failed to load ${topicId}`);
      const data = await resp.json();
      const td = { ...this._state.topicData, [topicId]: data };
      this.set('topicData', td);
      return data;
    } catch (err) {
      console.error(`Error loading topic ${topicId}:`, err);
      return null;
    }
  }
}

const store = new Store();
export { store, TOPICS };
