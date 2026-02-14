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
    const review = fc.reviews[cardId] || { easeFactor: 2.5, interval: 1, repetitions: 0 };

    if (quality >= 3) {
      if (review.repetitions === 0) review.interval = 1;
      else if (review.repetitions === 1) review.interval = 6;
      else review.interval = Math.round(review.interval * review.easeFactor);
      review.repetitions++;
    } else {
      review.repetitions = 0;
      review.interval = 1;
    }

    review.easeFactor = Math.max(1.3,
      review.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
    review.lastReview = Date.now();
    review.nextReview = Date.now() + review.interval * 86400000;

    fc.reviews[cardId] = review;
    this.set('flashcards', fc);
    localStorage.setItem(FLASHCARD_KEY, JSON.stringify(fc));
  }

  getDueFlashcards(allCards) {
    const now = Date.now();
    const reviews = this._state.flashcards.reviews;
    return allCards.filter(card => {
      const r = reviews[card.id];
      if (!r) return true; // never reviewed
      return r.nextReview <= now;
    });
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
