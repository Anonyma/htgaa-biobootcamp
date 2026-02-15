/**
 * HTGAA Week 2 — Lightweight Reactive Store
 * Simple state management with subscriber pattern.
 */

const STORAGE_KEY = 'htgaa-week2-progress';
const THEME_KEY = 'htgaa-theme';
const QUIZ_KEY = 'htgaa-week2-quizzes';
const FLASHCARD_KEY = 'htgaa-week2-flashcards';
const HOMEWORK_KEY = 'htgaa-week2-homework-checks';
const STUDY_LOG_KEY = 'htgaa-week2-study-log';

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
    this.recordStudyActivity('complete', { topicId });
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
    this.recordStudyActivity('quiz', { quizId, correct });
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
    this.recordStudyActivity('flashcard', { cardId, quality });
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

  // --- Study Activity Log ---
  recordStudyActivity(action, detail) {
    const today = new Date().toISOString().slice(0, 10);
    const log = this._loadJSON(STUDY_LOG_KEY, {});
    log[today] = (log[today] || 0) + 1;
    localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(log));

    // Also log individual activity for feed
    if (action) {
      const feed = this._loadJSON('htgaa-week2-activity-feed', []);
      feed.unshift({ action, detail, time: Date.now() });
      // Keep last 50
      if (feed.length > 50) feed.length = 50;
      localStorage.setItem('htgaa-week2-activity-feed', JSON.stringify(feed));
    }
  }

  getStudyLog() {
    return this._loadJSON(STUDY_LOG_KEY, {});
  }

  getActivityFeed(limit = 5) {
    const feed = this._loadJSON('htgaa-week2-activity-feed', []);
    return feed.slice(0, limit);
  }

  // --- Exam Scores ---
  saveExamScore(score, total, elapsed, topics, topicBreakdown) {
    const key = 'htgaa-week2-exam-scores';
    const scores = this._loadJSON(key, []);
    const entry = { score, total, pct: Math.round((score / total) * 100), elapsed, topics, date: Date.now() };
    if (topicBreakdown) entry.topicBreakdown = topicBreakdown;
    scores.push(entry);
    // Keep last 20 scores
    if (scores.length > 20) scores.splice(0, scores.length - 20);
    localStorage.setItem(key, JSON.stringify(scores));
  }

  getExamScores() {
    return this._loadJSON('htgaa-week2-exam-scores', []);
  }

  getBestExamScore() {
    const scores = this.getExamScores();
    if (!scores.length) return null;
    return scores.reduce((best, s) => s.pct > best.pct ? s : best, scores[0]);
  }

  // --- Bookmarks ---
  getBookmarks() {
    return this._loadJSON('htgaa-week2-bookmarks', []);
  }

  addBookmark(topicId, sectionId, sectionTitle) {
    const bookmarks = this.getBookmarks();
    if (bookmarks.some(b => b.topicId === topicId && b.sectionId === sectionId)) return;
    bookmarks.push({ topicId, sectionId, sectionTitle, date: Date.now() });
    localStorage.setItem('htgaa-week2-bookmarks', JSON.stringify(bookmarks));
  }

  removeBookmark(topicId, sectionId) {
    let bookmarks = this.getBookmarks();
    bookmarks = bookmarks.filter(b => !(b.topicId === topicId && b.sectionId === sectionId));
    localStorage.setItem('htgaa-week2-bookmarks', JSON.stringify(bookmarks));
  }

  isBookmarked(topicId, sectionId) {
    return this.getBookmarks().some(b => b.topicId === topicId && b.sectionId === sectionId);
  }

  // --- Section Progress ---
  markSectionRead(topicId, sectionId) {
    const key = 'htgaa-week2-section-progress';
    const data = this._loadJSON(key, {});
    if (!data[topicId]) data[topicId] = [];
    if (!data[topicId].includes(sectionId)) {
      data[topicId].push(sectionId);
      localStorage.setItem(key, JSON.stringify(data));
      this.recordStudyActivity('section', { topicId, sectionId });
    }
  }

  getSectionsRead(topicId) {
    const data = this._loadJSON('htgaa-week2-section-progress', {});
    return data[topicId] || [];
  }

  getSectionProgress(topicId, totalSections) {
    const read = this.getSectionsRead(topicId).length;
    return { read, total: totalSections, pct: totalSections > 0 ? Math.round((read / totalSections) * 100) : 0 };
  }

  // --- Topic Mastery Score ---
  // Composite metric: 40% sections read, 30% quiz accuracy, 20% flashcard maturity, 10% time spent
  getTopicMastery(topicId, topicData) {
    const sectionCounts = { 'sequencing': 7, 'synthesis': 7, 'editing': 7, 'genetic-codes': 6, 'gel-electrophoresis': 6, 'central-dogma': 7 };
    const totalSections = topicData?.sections?.length || sectionCounts[topicId] || 6;
    const sectionsRead = this.getSectionsRead(topicId).length;
    const sectionPct = totalSections > 0 ? sectionsRead / totalSections : 0;

    const quiz = this.getQuizScore(topicId);
    const quizPct = quiz && quiz.total > 0 ? quiz.correct / quiz.total : 0;

    // Flashcard maturity for this topic's vocab
    const reviews = this._state.flashcards.reviews || {};
    let fcMature = 0, fcTotal = 0;
    const vocabCount = topicData?.vocabulary?.length || 0;
    for (let i = 0; i < vocabCount; i++) {
      const cardId = `${topicId}-vocab-${i}`;
      fcTotal++;
      const r = reviews[cardId];
      if (r && r.interval >= 21) fcMature++;
      else if (r && r.repetitions > 0) fcMature += 0.3;
    }
    const fcPct = fcTotal > 0 ? fcMature / fcTotal : 0;

    // Time spent (target: 20+ mins per topic = 100%)
    let timeSpent = 0;
    try {
      const t = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
      timeSpent = t[topicId] || 0;
    } catch {}
    const timePct = Math.min(1, timeSpent / 1200); // 20 min = 100%

    const mastery = Math.round((sectionPct * 0.4 + quizPct * 0.3 + fcPct * 0.2 + timePct * 0.1) * 100);
    return { mastery, sectionPct: Math.round(sectionPct * 100), quizPct: Math.round(quizPct * 100), fcPct: Math.round(fcPct * 100), timePct: Math.round(timePct * 100) };
  }

  // --- Longest Streak ---
  getLongestStreak() {
    const log = this.getStudyLog();
    const dates = Object.keys(log).filter(d => log[d] > 0).sort();
    if (dates.length === 0) return 0;
    let longest = 1, current = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr - prev) / 86400000;
      if (diff === 1) { current++; longest = Math.max(longest, current); }
      else { current = 1; }
    }
    return longest;
  }

  // --- Personal Notes ---
  getNotes(topicId) {
    const all = this._loadJSON('htgaa-week2-notes', {});
    return all[topicId] || {};
  }

  saveNote(topicId, sectionId, text) {
    const all = this._loadJSON('htgaa-week2-notes', {});
    if (!all[topicId]) all[topicId] = {};
    if (text.trim()) {
      all[topicId][sectionId] = { text: text.trim(), updated: Date.now() };
    } else {
      delete all[topicId][sectionId];
    }
    localStorage.setItem('htgaa-week2-notes', JSON.stringify(all));
  }

  getAllNotes() {
    return this._loadJSON('htgaa-week2-notes', {});
  }

  getNotesCount() {
    const all = this.getAllNotes();
    return Object.values(all).reduce((sum, topic) => sum + Object.keys(topic).length, 0);
  }

  // --- Mistakes Review ---
  getWrongAnswers(topicId) {
    const entries = Object.entries(this._state.quizzes)
      .filter(([k, v]) => k.startsWith(topicId + '-') && !v);
    return entries.map(([k]) => k);
  }

  getAllWrongAnswers() {
    return Object.entries(this._state.quizzes)
      .filter(([, v]) => !v)
      .map(([k]) => k);
  }

  // --- Confidence Self-Check ---
  getConfidence(topicId) {
    const all = this._loadJSON('htgaa-week2-confidence', {});
    return all[topicId] || {};
  }

  saveConfidence(topicId, objectiveIndex, rating) {
    const all = this._loadJSON('htgaa-week2-confidence', {});
    if (!all[topicId]) all[topicId] = {};
    all[topicId][objectiveIndex] = { rating, updated: Date.now() };
    localStorage.setItem('htgaa-week2-confidence', JSON.stringify(all));
  }

  getAverageConfidence(topicId) {
    const ratings = this.getConfidence(topicId);
    const values = Object.values(ratings).map(r => r.rating);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10;
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
