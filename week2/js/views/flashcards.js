/**
 * HTGAA Week 2 — Flashcard View
 * SM-2 spaced repetition system for vocabulary review.
 */

import { store, TOPICS } from '../store.js';

let _fcSessionTimerInterval = null;
let _fcReverseMode = false;

function createFlashcardsView() {
  let allCards = [];
  let dueCards = [];
  let currentIndex = 0;
  let isFlipped = false;
  let selectedTopic = 'all';
  let keyHandler = null;
  let sessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, byTopic: {}, streak: 0, bestStreak: 0 };

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
            ${(() => {
              const reviews = store.get('flashcards').reviews || {};
              const total = allCards.length;
              if (total === 0) return '';
              let mastered = 0, learning = 0;
              allCards.forEach(c => {
                const r = reviews[c.id];
                if (r?.interval >= 21) mastered++;
                else if (r) learning++;
              });
              const masteredPct = Math.round((mastered / total) * 100);
              const learningPct = Math.round((learning / total) * 100);
              return `
              <div class="mt-3 flex items-center gap-3">
                <div class="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                  ${mastered > 0 ? `<div class="bg-green-500" style="width:${(mastered/total)*100}%"></div>` : ''}
                  ${learning > 0 ? `<div class="bg-yellow-400" style="width:${(learning/total)*100}%"></div>` : ''}
                </div>
                <span class="text-xs text-slate-500 flex-shrink-0">${masteredPct}% mastered</span>
              </div>`;
            })()}
          </header>

          <!-- Topic Filter -->
          <div class="mb-6 flex items-center gap-2 flex-wrap">
            <button class="fc-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" data-topic="all">
              All (${allCards.length})
            </button>
            ${TOPICS.map(t => {
              const topicCards = allCards.filter(c => c.topicId === t.id);
              const count = topicCards.length;
              const reviews = store.get('flashcards').reviews || {};
              const reviewed = topicCards.filter(c => reviews[c.id]).length;
              const pct = count > 0 ? Math.round((reviewed / count) * 100) : 0;
              const pctBadge = pct > 0 ? ` <span class="text-[9px] ${pct >= 100 ? 'text-green-500' : pct >= 50 ? 'text-blue-400' : 'text-slate-400'}">${pct}%</span>` : '';
              const eases = topicCards.map(c => reviews[c.id]?.easeFactor).filter(e => e != null);
              const avgEase = eases.length > 0 ? (eases.reduce((s, e) => s + e, 0) / eases.length).toFixed(1) : '';
              const easeBadge = avgEase ? ` <span class="text-[8px] ${parseFloat(avgEase) >= 2.5 ? 'text-green-400' : parseFloat(avgEase) >= 2.0 ? 'text-blue-400' : 'text-red-400'}" title="Avg ease factor">${avgEase}E</span>` : '';
              const lastReviewed = (() => {
                const times = topicCards.map(c => reviews[c.id]?.nextReview).filter(Boolean);
                if (times.length === 0) return '';
                const latest = Math.max(...times.map(t => t - (reviews[topicCards.find(c => reviews[c.id]?.nextReview === t)?.id]?.interval || 1) * 86400000));
                const diff = Math.floor((Date.now() - latest) / 86400000);
                if (diff <= 0) return ' · today';
                if (diff === 1) return ' · 1d ago';
                if (diff < 7) return ` · ${diff}d ago`;
                return '';
              })();
              return `<button class="fc-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" data-topic="${t.id}">${t.title} (${count})${pctBadge}${easeBadge}<span class="text-[8px] text-slate-300 dark:text-slate-600">${lastReviewed}</span></button>`;
            }).join('')}
          </div>

          <!-- Struggling Cards Alert -->
          ${(() => {
            const reviews = store.get('flashcards').reviews;
            const struggling = allCards.filter(c => {
              const r = reviews[c.id];
              return r && r.lapses >= 3;
            });
            if (struggling.length === 0) return '';
            return `
            <div class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-2">
                <i data-lucide="alert-triangle" class="w-4 h-4 text-red-500"></i>
                <span class="text-sm font-semibold text-red-700 dark:text-red-400">${struggling.length} struggling card${struggling.length > 1 ? 's' : ''}</span>
              </div>
              <p class="text-xs text-red-600 dark:text-red-400 mb-2">These terms have been marked "Again" 3+ times. Try reading the related topic sections.</p>
              <div class="flex flex-wrap gap-1">
                ${struggling.slice(0, 8).map(c => {
                  const topic = TOPICS.find(t => t.id === c.topicId);
                  return `<span class="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">${c.term}</span>`;
                }).join('')}
                ${struggling.length > 8 ? `<span class="text-xs text-red-400">+${struggling.length - 8} more</span>` : ''}
              </div>
            </div>
            `;
          })()}

          <!-- Review Streak -->
          ${(() => {
            const log = store.getStudyLog();
            const dates = Object.keys(log).filter(d => log[d] > 0).sort().reverse();
            if (dates.length === 0) return '';
            const today = new Date().toISOString().slice(0, 10);
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            let streakDays = 0;
            if (dates[0] === today || dates[0] === yesterday) {
              let checkDate = new Date(dates[0] + 'T00:00:00');
              for (const d of dates) {
                const dDate = new Date(d + 'T00:00:00');
                if (Math.abs(checkDate - dDate) <= 86400000) {
                  streakDays++;
                  checkDate = new Date(dDate.getTime() - 86400000);
                } else break;
              }
            }
            if (streakDays < 2) return '';
            return `
            <div class="mb-4 flex items-center gap-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg px-4 py-2 border border-orange-200 dark:border-orange-800">
              <i data-lucide="flame" class="w-4 h-4 text-orange-500 flex-shrink-0"></i>
              <span class="text-sm font-medium text-orange-700 dark:text-orange-400">${streakDays}-day study streak!</span>
              <span class="text-xs text-orange-500 ml-auto">Keep it going</span>
            </div>`;
          })()}

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
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
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p class="text-2xl font-bold text-violet-600 dark:text-violet-400">${(() => {
                const feed = JSON.parse(localStorage.getItem('htgaa-week2-activity-feed') || '[]');
                const todayStr = new Date().toISOString().slice(0, 10);
                return feed.filter(a => a.action === 'flashcard' && new Date(a.time).toISOString().slice(0, 10) === todayStr).length;
              })()}</p>
              <p class="text-xs text-slate-500">Today</p>
            </div>
          </div>

          <!-- Daily Review Goal -->
          ${(() => {
            const dailyGoal = 20;
            const feed = JSON.parse(localStorage.getItem('htgaa-week2-activity-feed') || '[]');
            const todayStr = new Date().toISOString().slice(0, 10);
            const todayCount = feed.filter(a => a.action === 'flashcard' && new Date(a.time).toISOString().slice(0, 10) === todayStr).length;
            const pct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));
            const goalColor = pct >= 100 ? 'green' : pct >= 50 ? 'blue' : 'slate';
            return `
            <div class="mb-4 flex items-center gap-3 text-xs">
              <span class="text-slate-500 flex-shrink-0">Daily goal:</span>
              <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-${goalColor}-500 rounded-full transition-all" style="width:${pct}%"></div>
              </div>
              <span class="text-${goalColor}-600 dark:text-${goalColor}-400 font-medium flex-shrink-0">${todayCount}/${dailyGoal}${pct >= 100 ? ' ✓' : ''}</span>
            </div>`;
          })()}

          <!-- Average Ease Factor -->
          ${(() => {
            const fcStats = store.getFlashcardStats();
            if (fcStats.total === 0) return '';
            const ease = parseFloat(fcStats.averageEase);
            const easeLabel = ease >= 2.5 ? 'Easy' : ease >= 2.0 ? 'Moderate' : ease >= 1.5 ? 'Challenging' : 'Hard';
            const easeColor = ease >= 2.5 ? 'green' : ease >= 2.0 ? 'blue' : ease >= 1.5 ? 'amber' : 'red';
            return `
            <div class="mb-4 flex items-center gap-3 bg-${easeColor}-50 dark:bg-${easeColor}-900/10 rounded-lg px-4 py-2 border border-${easeColor}-200 dark:border-${easeColor}-800">
              <i data-lucide="gauge" class="w-4 h-4 text-${easeColor}-500 flex-shrink-0"></i>
              <div class="flex-1 text-sm">
                <span class="font-medium text-${easeColor}-700 dark:text-${easeColor}-400">Difficulty: ${easeLabel}</span>
                <span class="text-${easeColor}-500 ml-1 text-xs">(ease ${ease})</span>
              </div>
              <span class="text-xs text-${easeColor}-500">${fcStats.totalReviews} total reviews</span>
            </div>`;
          })()}

          <!-- Card Maturity Distribution Bar -->
          ${allCards.length > 0 ? (() => {
            const reviews = store.get('flashcards').reviews;
            let newCount = 0, learningCount = 0, matureCount = 0;
            allCards.forEach(c => {
              const r = reviews[c.id];
              if (!r) newCount++;
              else if (r.interval < 21) learningCount++;
              else matureCount++;
            });
            const total = allCards.length;
            const newPct = (newCount / total) * 100;
            const learnPct = (learningCount / total) * 100;
            const maturePct = (matureCount / total) * 100;
            return `
            <div class="mb-6">
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Card Maturity</span>
                <span>${matureCount} mature of ${total}</span>
              </div>
              <div class="h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
                ${maturePct > 0 ? `<div class="bg-green-500 transition-all" style="width:${maturePct}%" title="${matureCount} mature"></div>` : ''}
                ${learnPct > 0 ? `<div class="bg-yellow-400 transition-all" style="width:${learnPct}%" title="${learningCount} learning"></div>` : ''}
                ${newPct > 0 ? `<div class="bg-blue-400 transition-all" style="width:${newPct}%" title="${newCount} new"></div>` : ''}
              </div>
              <div class="flex gap-3 mt-1 text-[10px] text-slate-400">
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Mature</span>
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span> Learning</span>
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> New</span>
              </div>
            </div>`;
          })() : ''}

          <!-- Hardest Cards -->
          ${(() => {
            const reviews = store.get('flashcards').reviews;
            const reviewed = allCards.filter(c => reviews[c.id] && reviews[c.id].easeFactor);
            if (reviewed.length < 5) return '';
            const hardest = [...reviewed]
              .sort((a, b) => reviews[a.id].easeFactor - reviews[b.id].easeFactor)
              .slice(0, 5);
            // Only show if some cards are actually hard (ease < 2.3)
            if (reviews[hardest[0].id].easeFactor >= 2.3) return '';
            return `
            <details class="mb-6">
              <summary class="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1">
                <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-amber-500"></i> Hardest Cards (lowest ease)
              </summary>
              <div class="mt-2 space-y-1">
                ${hardest.map(c => {
                  const r = reviews[c.id];
                  const topic = TOPICS.find(t => t.id === c.topicId);
                  const easeColor = r.easeFactor < 1.5 ? 'red' : r.easeFactor < 2.0 ? 'amber' : 'slate';
                  return `<div class="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span class="font-bold text-${easeColor}-600 dark:text-${easeColor}-400 w-8 text-right">${r.easeFactor.toFixed(1)}</span>
                    <span class="font-medium truncate flex-1">${c.term}</span>
                    <span class="text-slate-400 truncate max-w-[100px]">${topic?.title || ''}</span>
                  </div>`;
                }).join('')}
              </div>
            </details>`;
          })()}

          <!-- Progress Bar -->
          ${dueCards.length > 0 ? `
          <div class="mb-6">
            <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Session Progress</span>
              <span id="fc-progress-text">0 / ${dueCards.length} · ~${Math.ceil(dueCards.length * 0.5)} min</span>
            </div>
            <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div id="fc-progress-bar" class="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
          ` : ''}

          <!-- Review All Button (when no cards due) -->
          ${dueCards.length === 0 && allCards.length > 0 ? `
          <div class="mb-6 flex items-center justify-center gap-3 flex-wrap">
            <button id="fc-review-all" class="px-5 py-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">
              <i data-lucide="repeat" class="w-4 h-4 inline"></i> Practice All (${allCards.length})
            </button>
            ${(() => {
              const reviews = store.get('flashcards').reviews;
              const filtered = selectedTopic === 'all' ? allCards : allCards.filter(c => c.topicId === selectedTopic);
              const newOnly = filtered.filter(c => !reviews[c.id]);
              if (newOnly.length === 0 || newOnly.length === filtered.length) return '';
              return `<button id="fc-new-only" class="px-5 py-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <i data-lucide="sparkles" class="w-4 h-4 inline"></i> New Only (${newOnly.length})
              </button>`;
            })()}
            ${(() => {
              const reviews = store.get('flashcards').reviews;
              const filtered = selectedTopic === 'all' ? allCards : allCards.filter(c => c.topicId === selectedTopic);
              const weak = filtered.filter(c => reviews[c.id] && reviews[c.id].easeFactor < 2.0);
              if (weak.length === 0) return '';
              return `<button id="fc-focus-weak" class="px-5 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                <i data-lucide="target" class="w-4 h-4 inline"></i> Focus Weak (${weak.length})
              </button>`;
            })()}
            <button id="fc-reverse-toggle" class="px-5 py-2.5 rounded-xl ${_fcReverseMode ? 'bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'} font-medium hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors">
              <i data-lucide="flip-horizontal" class="w-4 h-4 inline"></i> Reverse${_fcReverseMode ? ' ✓' : ''}
            </button>
          </div>
          ` : ''}

          <!-- Review Forecast -->
          ${(() => {
            const reviews = store.get('flashcards').reviews || {};
            const now = Date.now();
            const dayMs = 86400000;
            const days = [];
            for (let d = 0; d < 7; d++) {
              const dayStart = now + d * dayMs;
              const dayEnd = dayStart + dayMs;
              let count = 0;
              Object.values(reviews).forEach(r => {
                if (r.nextReview && r.nextReview >= dayStart && r.nextReview < dayEnd) count++;
              });
              // Day 0 also includes already-overdue cards
              if (d === 0) {
                Object.values(reviews).forEach(r => {
                  if (r.nextReview && r.nextReview < now) count++;
                });
              }
              const label = d === 0 ? 'Today' : d === 1 ? 'Tmrw' : new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short' });
              days.push({ label, count });
            }
            const maxCount = Math.max(...days.map(d => d.count), 1);
            const totalUpcoming = days.reduce((s, d) => s + d.count, 0);
            if (totalUpcoming === 0) return '';
            return `
            <div class="mb-6">
              <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span class="font-medium">7-Day Review Forecast</span>
                <span>${totalUpcoming} cards upcoming</span>
              </div>
              <div class="flex items-end gap-1 h-16">
                ${days.map(d => `
                  <div class="flex-1 flex flex-col items-center gap-0.5">
                    ${d.count > 0 ? `<span class="text-[9px] text-slate-400">${d.count}</span>` : ''}
                    <div class="w-full rounded-t-sm ${d.count > 0 ? 'bg-violet-400 dark:bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}" style="height: ${Math.max(2, (d.count / maxCount) * 100)}%"></div>
                    <span class="text-[9px] text-slate-400">${d.label}</span>
                  </div>
                `).join('')}
              </div>
            </div>`;
          })()}

          <!-- Card Area -->
          <div id="fc-card-area">
            ${dueCards.length > 0 ? renderCard(dueCards[0], allCards) : renderComplete()}
          </div>

          <!-- Live Streak -->
          <div id="fc-live-streak" class="text-center mt-3 transition-all duration-300" style="min-height:24px"></div>

          <!-- Session Timer & Running Stats -->
          <div class="mt-4 text-center text-sm text-slate-400 flex items-center justify-center gap-4 flex-wrap">
            <span class="flex items-center gap-1"><i data-lucide="timer" class="w-3.5 h-3.5"></i> Session${(() => {
              try {
                const feed = JSON.parse(localStorage.getItem('htgaa-week2-activity-feed') || '[]');
                const today = new Date().toISOString().slice(0, 10);
                const todayFcTimes = feed.filter(a => a.action === 'flashcard' && new Date(a.time).toISOString().slice(0, 10) === today).map(a => a.time);
                let sessions = 0, lastT = 0;
                todayFcTimes.sort().forEach(t => { if (t - lastT > 600000) { sessions++; lastT = t; } });
                return sessions > 0 ? ` #${sessions + 1}` : '';
              } catch { return ''; }
            })()}: <span id="fc-session-timer" class="font-mono">0:00</span></span>
            <span class="text-slate-300 dark:text-slate-600">|</span>
            <span id="fc-running-accuracy" class="hidden font-medium"></span>
            <span class="text-slate-300 dark:text-slate-600 hidden" id="fc-accuracy-divider">|</span>
            <span>Click card to flip. 1-4 to rate.</span>
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
      sessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, byTopic: {}, streak: 0, bestStreak: 0 };

      // Session timer (module-level so unmount can clean up without container ref)
      let sessionSeconds = 0;
      const sessionTimerEl = container.querySelector('#fc-session-timer');
      if (_fcSessionTimerInterval) clearInterval(_fcSessionTimerInterval);
      _fcSessionTimerInterval = setInterval(() => {
        sessionSeconds++;
        if (sessionTimerEl) {
          const m = Math.floor(sessionSeconds / 60);
          const s = sessionSeconds % 60;
          sessionTimerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }
      }, 1000);

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
          sessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, byTopic: {}, streak: 0, bestStreak: 0 };
          cardArea.innerHTML = dueCards.length > 0 ? renderCard(dueCards[0], allCards) : renderComplete();
          updateProgress();
          if (sessionStatsEl) sessionStatsEl.classList.add('hidden');
        });
      });

      // Review All button (practice mode - review all, not just due)
      container.querySelector('#fc-review-all')?.addEventListener('click', () => {
        const filtered = selectedTopic === 'all' ? allCards : allCards.filter(c => c.topicId === selectedTopic);
        dueCards = [...filtered]; // treat all as due
        currentIndex = 0;
        isFlipped = false;
        sessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, byTopic: {}, streak: 0, bestStreak: 0 };
        cardArea.innerHTML = dueCards.length > 0 ? renderCard(dueCards[0], allCards) : renderComplete();
        // Show progress bar
        if (progressBar) progressBar.parentElement.parentElement.classList.remove('hidden');
        updateProgress();
        if (window.lucide) window.lucide.createIcons();
      });

      // New Cards Only button
      container.querySelector('#fc-new-only')?.addEventListener('click', () => {
        const reviews = store.get('flashcards').reviews;
        const filtered = selectedTopic === 'all' ? allCards : allCards.filter(c => c.topicId === selectedTopic);
        dueCards = filtered.filter(c => !reviews[c.id]);
        currentIndex = 0;
        isFlipped = false;
        sessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, byTopic: {}, streak: 0, bestStreak: 0 };
        cardArea.innerHTML = dueCards.length > 0 ? renderCard(dueCards[0], allCards) : renderComplete();
        if (progressBar) progressBar.parentElement.parentElement.classList.remove('hidden');
        updateProgress();
        if (window.lucide) window.lucide.createIcons();
      });

      // Focus Weak button — review cards with low ease factor
      container.querySelector('#fc-focus-weak')?.addEventListener('click', () => {
        const reviews = store.get('flashcards').reviews;
        const filtered = selectedTopic === 'all' ? allCards : allCards.filter(c => c.topicId === selectedTopic);
        dueCards = filtered.filter(c => reviews[c.id] && reviews[c.id].easeFactor < 2.0);
        currentIndex = 0;
        isFlipped = false;
        sessionStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, byTopic: {}, streak: 0, bestStreak: 0 };
        cardArea.innerHTML = dueCards.length > 0 ? renderCard(dueCards[0], allCards) : renderComplete();
        if (progressBar) progressBar.parentElement.parentElement.classList.remove('hidden');
        updateProgress();
        if (window.lucide) window.lucide.createIcons();
      });

      // Reverse mode toggle
      container.querySelector('#fc-reverse-toggle')?.addEventListener('click', () => {
        _fcReverseMode = !_fcReverseMode;
        const btn = container.querySelector('#fc-reverse-toggle');
        if (btn) {
          btn.className = `px-5 py-2.5 rounded-xl ${_fcReverseMode ? 'bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'} font-medium hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors`;
          btn.innerHTML = `<i data-lucide="flip-horizontal" class="w-4 h-4 inline"></i> Reverse${_fcReverseMode ? ' ✓' : ''}`;
          if (window.lucide) lucide.createIcons();
        }
        // Re-render current card
        if (currentIndex < dueCards.length) {
          cardArea.innerHTML = renderCard(dueCards[currentIndex], allCards);
          if (window.lucide) lucide.createIcons();
        }
      });

      // Update progress display
      const updateProgress = () => {
        if (progressBar && progressText) {
          const progress = (sessionStats.reviewed / dueCards.length) * 100;
          progressBar.style.width = `${progress}%`;
          const remaining = dueCards.length - sessionStats.reviewed;
          const estMin = remaining > 0 ? ` · ~${Math.ceil(remaining * 0.5)} min` : '';
          progressText.textContent = `${sessionStats.reviewed} / ${dueCards.length}${estMin}`;
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
        // Per-topic tracking
        const tid = card.topicId;
        if (!sessionStats.byTopic[tid]) sessionStats.byTopic[tid] = { reviewed: 0, correct: 0 };
        sessionStats.byTopic[tid].reviewed++;
        if (quality >= 4) sessionStats.byTopic[tid].correct++;
        // Track streak
        if (quality >= 4) {
          sessionStats.streak++;
          if (sessionStats.streak > sessionStats.bestStreak) sessionStats.bestStreak = sessionStats.streak;
        } else {
          sessionStats.streak = 0;
        }

        // Update live streak indicator
        const streakEl = container.querySelector('#fc-live-streak');
        if (streakEl) {
          if (sessionStats.streak >= 2) {
            const flames = sessionStats.streak >= 10 ? '🔥🔥🔥' : sessionStats.streak >= 5 ? '🔥🔥' : '🔥';
            streakEl.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold animate-bounce-once">${flames} ${sessionStats.streak} correct streak!</span>`;
          } else {
            streakEl.innerHTML = '';
          }
        }

        // Update running accuracy display
        const accEl = container.querySelector('#fc-running-accuracy');
        const accDivider = container.querySelector('#fc-accuracy-divider');
        if (accEl && sessionStats.reviewed > 0) {
          const acc = Math.round(((sessionStats.good + sessionStats.easy) / sessionStats.reviewed) * 100);
          const accColor = acc >= 80 ? 'text-green-500' : acc >= 60 ? 'text-amber-500' : 'text-red-500';
          accEl.className = `${accColor} font-medium`;
          accEl.textContent = `${acc}% recall`;
          accEl.classList.remove('hidden');
          if (accDivider) accDivider.classList.remove('hidden');
        }

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
        // Copy session results
        const copyBtn = e.target.closest('#fc-copy-session');
        if (copyBtn && sessionStats.reviewed > 0) {
          const acc = Math.round(((sessionStats.good + sessionStats.easy) / sessionStats.reviewed) * 100);
          const topicLines = Object.entries(sessionStats.byTopic).map(([tid, ts]) => {
            const topic = TOPICS.find(t => t.id === tid);
            return `  ${topic?.title || tid}: ${Math.round((ts.correct / ts.reviewed) * 100)}% (${ts.reviewed} cards)`;
          }).join('\n');
          const text = `Flashcard Session Results\nCards: ${sessionStats.reviewed} · Recall: ${acc}%\nAgain: ${sessionStats.again} · Hard: ${sessionStats.hard} · Good: ${sessionStats.good} · Easy: ${sessionStats.easy}${sessionStats.bestStreak >= 3 ? `\nBest streak: ${sessionStats.bestStreak}` : ''}${topicLines ? `\n\nBy Topic:\n${topicLines}` : ''}`;
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
            if (window.lucide) lucide.createIcons();
          }).catch(() => {});
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
      if (_fcSessionTimerInterval) {
        clearInterval(_fcSessionTimerInterval);
        _fcSessionTimerInterval = null;
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
            <span class="text-[10px] text-slate-300 dark:text-slate-600">${(() => {
              const topicCards = allCards.filter(c => c.topicId === card.topicId);
              const idx = topicCards.findIndex(c => c.id === card.id);
              return idx >= 0 ? `${idx + 1}/${topicCards.length}` : '';
            })()}</span>
            ${(() => {
              const r = store.get('flashcards').reviews[card.id];
              if (r && r.lapses >= 3) return `<span class="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Struggling</span>`;
              if (r && r.reviewCount > 0) {
                const lastReview = r.nextReview ? new Date(r.nextReview - r.interval * 86400000) : null;
                const lastStr = lastReview ? (() => {
                  const diff = Math.floor((Date.now() - lastReview) / 86400000);
                  if (diff === 0) return 'today';
                  if (diff === 1) return 'yesterday';
                  if (diff < 7) return `${diff}d ago`;
                  return lastReview.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                })() : '';
                return `<span class="text-xs text-slate-300 dark:text-slate-600">${r.reviewCount}× ${lastStr ? `· ${lastStr}` : ''}</span>`;
              }
              return '';
            })()}
          </div>
          <p class="text-2xl font-bold mb-2">${_fcReverseMode ? `<span class="text-base font-normal text-slate-600 dark:text-slate-400 leading-relaxed">${escapeHtml(card.definition)}</span>` : escapeHtml(card.term)}</p>
          <div class="mt-4 flex items-center gap-2 text-slate-400">
            <i data-lucide="flip-horizontal" class="w-4 h-4"></i>
            <p class="text-sm">Click to reveal ${_fcReverseMode ? 'term' : 'definition'}</p>
          </div>
        </div>
        <!-- Back -->
        <div class="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-8 flex flex-col items-center justify-center text-center shadow-lg" style="transform: rotateY(180deg); backface-visibility: hidden; -webkit-backface-visibility: hidden;">
          ${_fcReverseMode ? `
            <p class="font-bold text-blue-600 dark:text-blue-400 mb-3 text-2xl">${escapeHtml(card.term)}</p>
            <p class="text-sm leading-relaxed max-w-md text-slate-500">${escapeHtml(card.definition)}</p>
          ` : `
            <p class="font-bold text-blue-600 dark:text-blue-400 mb-3 text-lg">${escapeHtml(card.term)}</p>
            <p class="text-sm leading-relaxed max-w-md">${escapeHtml(card.definition)}</p>
          `}
          ${(() => {
            const r = store.get('flashcards').reviews[card.id];
            if (!r || !r.easeFactor) return '';
            const ef = r.easeFactor.toFixed(2);
            const eColor = r.easeFactor >= 2.5 ? 'green' : r.easeFactor >= 2.0 ? 'blue' : r.easeFactor >= 1.5 ? 'amber' : 'red';
            return `<p class="text-[10px] text-${eColor}-500 mt-3 opacity-70">Ease: ${ef} · Interval: ${r.interval}d</p>`;
          })()}
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
  const stats = store.getFlashcardStats();
  const hasSession = sessionStats.reviewed > 0;
  const sessionAccuracy = hasSession ? Math.round(((sessionStats.good + sessionStats.easy) / sessionStats.reviewed) * 100) : 0;
  const sessionGrade = sessionAccuracy >= 90 ? 'Excellent' : sessionAccuracy >= 70 ? 'Good' : sessionAccuracy >= 50 ? 'Fair' : 'Needs Work';
  const gradeColor = sessionAccuracy >= 90 ? 'green' : sessionAccuracy >= 70 ? 'blue' : sessionAccuracy >= 50 ? 'amber' : 'red';

  return `
    <div class="text-center py-12">
      <i data-lucide="party-popper" class="w-16 h-16 mx-auto mb-4 text-green-400"></i>
      <h3 class="text-2xl font-bold mb-2">All caught up!</h3>
      <p class="text-slate-500 mb-4">No cards due for review right now. Come back later for spaced repetition.</p>

      ${hasSession ? `
        <!-- Session Summary -->
        <div class="max-w-sm mx-auto mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 text-left">
          <h4 class="font-bold text-sm mb-3 flex items-center gap-2 justify-center">
            <i data-lucide="bar-chart-3" class="w-4 h-4 text-${gradeColor}-500"></i> Session Summary
          </h4>
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="text-center">
              <div class="text-xl font-bold text-${gradeColor}-600 dark:text-${gradeColor}-400">${sessionAccuracy}%</div>
              <div class="text-[10px] text-slate-500">Recall Rate</div>
            </div>
            <div class="text-center">
              <div class="text-xl font-bold text-slate-700 dark:text-slate-300">${sessionStats.reviewed}</div>
              <div class="text-[10px] text-slate-500">Cards Reviewed</div>
            </div>
            <div class="text-center">
              <div class="text-xl font-bold text-${gradeColor}-600 dark:text-${gradeColor}-400">${sessionGrade}</div>
              <div class="text-[10px] text-slate-500">Performance</div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs justify-center flex-wrap">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Again: ${sessionStats.again}</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-500"></span> Hard: ${sessionStats.hard}</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Good: ${sessionStats.good}</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Easy: ${sessionStats.easy}</span>
            ${sessionStats.bestStreak >= 3 ? `<span class="flex items-center gap-1 text-amber-500 font-medium"><span class="text-xs">🔥</span> Best streak: ${sessionStats.bestStreak}</span>` : ''}
          </div>
          ${sessionStats.reviewed >= 3 ? `
          <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p class="text-[10px] text-slate-400 mb-1.5 text-center uppercase tracking-wider">Rating Distribution</p>
            <div class="flex items-end gap-1 justify-center h-10">
              ${[
                { label: 'A', count: sessionStats.again, color: 'bg-red-400' },
                { label: 'H', count: sessionStats.hard, color: 'bg-yellow-400' },
                { label: 'G', count: sessionStats.good, color: 'bg-green-400' },
                { label: 'E', count: sessionStats.easy, color: 'bg-blue-400' }
              ].map(b => {
                const maxC = Math.max(sessionStats.again, sessionStats.hard, sessionStats.good, sessionStats.easy, 1);
                const h = Math.max(4, Math.round((b.count / maxC) * 32));
                return `<div class="flex flex-col items-center gap-0.5">
                  <span class="text-[8px] text-slate-400">${b.count}</span>
                  <div class="${b.color} rounded-sm" style="width:16px;height:${h}px"></div>
                  <span class="text-[8px] text-slate-400">${b.label}</span>
                </div>`;
              }).join('')}
            </div>
          </div>
          ` : ''}
          ${Object.keys(sessionStats.byTopic).length > 1 ? `
          <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p class="text-[10px] text-slate-400 mb-2 text-center uppercase tracking-wider">By Topic</p>
            <div class="space-y-1.5">
              ${Object.entries(sessionStats.byTopic).map(([tid, ts]) => {
                const topic = TOPICS.find(t => t.id === tid);
                const pct = Math.round((ts.correct / ts.reviewed) * 100);
                return `<div class="flex items-center gap-2 text-xs">
                  <i data-lucide="${topic?.icon || 'book'}" class="w-3 h-3 text-${topic?.color || 'slate'}-500 flex-shrink-0"></i>
                  <span class="flex-1 truncate">${topic?.title || tid}</span>
                  <span class="font-medium ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-red-500'}">${pct}%</span>
                  <span class="text-slate-400">(${ts.reviewed})</span>
                </div>`;
              }).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      ` : ''}

      ${stats.total > 0 ? `
        <div class="max-w-xs mx-auto mb-6">
          <div class="flex items-center gap-1 h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            ${stats.mature > 0 ? `<div class="h-full bg-green-500" style="width: ${(stats.mature / (stats.total || 1)) * 100}%" title="Mature: ${stats.mature}"></div>` : ''}
            ${stats.learning > 0 ? `<div class="h-full bg-yellow-500" style="width: ${(stats.learning / (stats.total || 1)) * 100}%" title="Learning: ${stats.learning}"></div>` : ''}
          </div>
          <div class="flex justify-between text-xs text-slate-400 mt-1">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Mature: ${stats.mature}</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-500"></span> Learning: ${stats.learning}</span>
            <span>Total reviews: ${stats.totalReviews}</span>
          </div>
        </div>
      ` : ''}
      <div class="flex justify-center gap-3 flex-wrap">
        <a data-route="#/" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
        </a>
        <a data-route="#/exam" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <i data-lucide="trophy" class="w-4 h-4"></i> Take Exam
        </a>
        ${hasSession ? `
        <button id="fc-copy-session" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <i data-lucide="copy" class="w-4 h-4"></i> Copy Results
        </button>` : ''}
      </div>
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
