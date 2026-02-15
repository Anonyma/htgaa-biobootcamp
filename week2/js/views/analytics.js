/**
 * HTGAA Week 2 — Study Analytics Dashboard
 * Comprehensive statistics, charts, and insights about learning progress.
 */

import { store, TOPICS } from '../store.js';

function createAnalyticsView() {
  return {
    render() {
      const progress = store.get('progress');
      const completedCount = TOPICS.filter(t => progress[t.id]).length;
      const quizzes = store.get('quizzes') || {};
      const totalAnswered = Object.keys(quizzes).length;
      const totalCorrect = Object.values(quizzes).filter(v => v).length;
      const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
      const fcStats = store.getFlashcardStats();
      const log = store.getStudyLog();
      const activeDays = Object.values(log).filter(v => v > 0).length;
      const totalActivities = Object.values(log).reduce((s, v) => s + v, 0);
      const longestStreak = store.getLongestStreak();
      const examScores = store.getExamScores();
      const notesCount = store.getNotesCount();
      const bookmarks = store.getBookmarks();

      // Calculate current streak
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let currentStreak = 0;
      let checkDate = new Date();
      while (true) {
        const dateStr = checkDate.toISOString().slice(0, 10);
        if (log[dateStr] && log[dateStr] > 0) {
          currentStreak++;
          checkDate = new Date(checkDate - 86400000);
        } else {
          break;
        }
      }

      // Average daily activity
      const avgDaily = activeDays > 0 ? (totalActivities / activeDays).toFixed(1) : '0';

      // Time spent
      let timeSpent = {};
      try { timeSpent = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}'); } catch {}
      const totalTime = Object.values(timeSpent).reduce((s, v) => s + v, 0);

      return `
        <div class="max-w-5xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <i data-lucide="bar-chart-3" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Study Analytics</h1>
                <p class="text-sm text-slate-500">Deep dive into your learning metrics</p>
              </div>
            </div>
          </header>

          <!-- Key Metrics Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            ${renderMetricCard('Topics Done', `${completedCount}/6`, completedCount === 6 ? 'green' : 'blue', 'book-open')}
            ${renderMetricCard('Quiz Accuracy', `${accuracy}%`, accuracy >= 80 ? 'green' : accuracy >= 60 ? 'amber' : 'red', 'target')}
            ${renderMetricCard('Active Days', activeDays, activeDays >= 7 ? 'green' : 'blue', 'calendar-days')}
            ${renderMetricCard('Current Streak', `${currentStreak}d`, currentStreak >= 3 ? 'green' : 'blue', 'flame')}
            ${renderMetricCard('Flashcards', fcStats.total, 'violet', 'layers')}
            ${renderMetricCard('Study Time', formatTime(totalTime), 'emerald', 'clock')}
          </div>

          <!-- Two-column layout -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <!-- Topic Mastery Radar -->
            <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <i data-lucide="radar" class="w-4 h-4"></i> Topic Mastery
              </h2>
              <div id="mastery-bars" class="space-y-3">
                <div class="text-center py-4 text-slate-400 text-sm">Loading mastery data...</div>
              </div>
            </section>

            <!-- Quiz Performance by Topic -->
            <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <i data-lucide="pie-chart" class="w-4 h-4"></i> Quiz Performance
              </h2>
              <div class="space-y-3">
                ${TOPICS.map(topic => {
                  const score = store.getQuizScore(topic.id);
                  if (!score) return `
                    <div class="flex items-center gap-3">
                      <div class="w-6 h-6 rounded flex items-center justify-center bg-${topic.color}-100 dark:bg-${topic.color}-900/40 flex-shrink-0">
                        <i data-lucide="${topic.icon}" class="w-3.5 h-3.5 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
                      </div>
                      <span class="text-sm flex-1 truncate">${topic.title}</span>
                      <span class="text-xs text-slate-400">No attempts</span>
                    </div>
                  `;
                  const pct = Math.round((score.correct / score.total) * 100);
                  const barColor = pct >= 80 ? 'green' : pct >= 60 ? 'amber' : 'red';
                  return `
                    <div class="flex items-center gap-3">
                      <div class="w-6 h-6 rounded flex items-center justify-center bg-${topic.color}-100 dark:bg-${topic.color}-900/40 flex-shrink-0">
                        <i data-lucide="${topic.icon}" class="w-3.5 h-3.5 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
                      </div>
                      <span class="text-sm flex-1 truncate">${topic.title}</span>
                      <div class="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div class="h-full rounded-full bg-${barColor}-500 transition-all" style="width: ${pct}%"></div>
                      </div>
                      <span class="text-xs font-bold text-${barColor}-600 w-12 text-right">${score.correct}/${score.total}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </section>
          </div>

          <!-- Activity Heatmap -->
          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-8">
            <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i data-lucide="activity" class="w-4 h-4"></i> Activity Over Time
            </h2>
            ${renderActivityChart(log)}
          </section>

          <!-- Two more columns -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <!-- Exam Score History -->
            <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <i data-lucide="trophy" class="w-4 h-4"></i> Exam Score History
              </h2>
              ${examScores.length === 0 ? `
                <p class="text-sm text-slate-400 text-center py-4">No exams taken yet. Try <a data-route="#/exam" class="text-blue-500 cursor-pointer">Exam Mode</a>.</p>
              ` : `
                <div class="space-y-2">
                  ${examScores.slice(-8).reverse().map((s, i) => {
                    const color = s.pct >= 80 ? 'green' : s.pct >= 60 ? 'amber' : 'red';
                    return `
                      <div class="flex items-center gap-3 py-1.5 ${i === 0 ? 'bg-' + color + '-50 dark:bg-' + color + '-900/10 rounded-lg px-2' : ''}">
                        <span class="text-xs text-slate-400 w-20">${new Date(s.date).toLocaleDateString()}</span>
                        <div class="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div class="h-full rounded-full bg-${color}-500" style="width: ${s.pct}%"></div>
                        </div>
                        <span class="text-sm font-bold text-${color}-600 w-12 text-right">${s.pct}%</span>
                        <span class="text-xs text-slate-400">${s.score}/${s.total}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
                ${examScores.length > 1 ? `
                  <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs text-slate-500">
                    <span>Best: <span class="font-bold text-green-600">${Math.max(...examScores.map(s => s.pct))}%</span></span>
                    <span>Average: <span class="font-bold">${Math.round(examScores.reduce((s, e) => s + e.pct, 0) / examScores.length)}%</span></span>
                    <span>Attempts: <span class="font-bold">${examScores.length}</span></span>
                  </div>
                ` : ''}
              `}
            </section>

            <!-- Flashcard Stats -->
            <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <i data-lucide="layers" class="w-4 h-4"></i> Flashcard Progress
              </h2>
              ${fcStats.total === 0 ? `
                <p class="text-sm text-slate-400 text-center py-4">No flashcards reviewed yet. Try <a data-route="#/flashcards" class="text-blue-500 cursor-pointer">Flashcards</a>.</p>
              ` : `
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10">
                    <div class="text-xl font-bold text-blue-600">${fcStats.learning}</div>
                    <div class="text-xs text-slate-500">Learning</div>
                  </div>
                  <div class="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/10">
                    <div class="text-xl font-bold text-green-600">${fcStats.mature}</div>
                    <div class="text-xs text-slate-500">Mature</div>
                  </div>
                  <div class="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/10">
                    <div class="text-xl font-bold text-red-600">${fcStats.due}</div>
                    <div class="text-xs text-slate-500">Due Now</div>
                  </div>
                  <div class="text-center p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10">
                    <div class="text-xl font-bold text-violet-600">${fcStats.totalReviews}</div>
                    <div class="text-xs text-slate-500">Total Reviews</div>
                  </div>
                </div>
                <!-- Maturity bar -->
                <div class="mb-2">
                  <div class="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Card Maturity</span>
                    <span>${fcStats.total > 0 ? Math.round((fcStats.mature / fcStats.total) * 100) : 0}%</span>
                  </div>
                  <div class="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                    <div class="h-full bg-green-500" style="width: ${fcStats.total > 0 ? (fcStats.mature / fcStats.total) * 100 : 0}%"></div>
                    <div class="h-full bg-blue-500" style="width: ${fcStats.total > 0 ? (fcStats.learning / fcStats.total) * 100 : 0}%"></div>
                  </div>
                  <div class="flex gap-4 mt-1 text-[10px] text-slate-400">
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Mature</span>
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Learning</span>
                  </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Average ease factor: ${fcStats.averageEase}</p>
              `}
            </section>
          </div>

          <!-- Summary Stats Table -->
          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-8">
            <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i data-lucide="list" class="w-4 h-4"></i> Summary
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              <div><span class="text-slate-500">Topics completed:</span> <span class="font-bold">${completedCount}/6</span></div>
              <div><span class="text-slate-500">Questions answered:</span> <span class="font-bold">${totalAnswered}</span></div>
              <div><span class="text-slate-500">Correct answers:</span> <span class="font-bold text-green-600">${totalCorrect}</span></div>
              <div><span class="text-slate-500">Wrong answers:</span> <span class="font-bold text-red-600">${totalAnswered - totalCorrect}</span></div>
              <div><span class="text-slate-500">Active study days:</span> <span class="font-bold">${activeDays}</span></div>
              <div><span class="text-slate-500">Longest streak:</span> <span class="font-bold">${longestStreak} days</span></div>
              <div><span class="text-slate-500">Avg. daily actions:</span> <span class="font-bold">${avgDaily}</span></div>
              <div><span class="text-slate-500">Total actions:</span> <span class="font-bold">${totalActivities}</span></div>
              <div><span class="text-slate-500">Notes written:</span> <span class="font-bold">${notesCount}</span></div>
              <div><span class="text-slate-500">Bookmarks saved:</span> <span class="font-bold">${bookmarks.length}</span></div>
              <div><span class="text-slate-500">Exams taken:</span> <span class="font-bold">${examScores.length}</span></div>
              <div><span class="text-slate-500">Total study time:</span> <span class="font-bold">${formatTime(totalTime)}</span></div>
            </div>
          </section>

          <!-- Time per Topic -->
          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i data-lucide="timer" class="w-4 h-4"></i> Time per Topic
            </h2>
            <div class="space-y-3">
              ${TOPICS.map(topic => {
                const secs = timeSpent[topic.id] || 0;
                const maxSecs = Math.max(1, ...Object.values(timeSpent));
                const pct = Math.round((secs / maxSecs) * 100);
                return `
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded flex items-center justify-center bg-${topic.color}-100 dark:bg-${topic.color}-900/40 flex-shrink-0">
                      <i data-lucide="${topic.icon}" class="w-3.5 h-3.5 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
                    </div>
                    <span class="text-sm flex-1 truncate">${topic.title}</span>
                    <div class="w-32 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div class="h-full rounded-full bg-${topic.color}-500 transition-all" style="width: ${pct}%"></div>
                    </div>
                    <span class="text-xs text-slate-500 w-16 text-right">${formatTime(secs)}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        </div>
      `;
    },

    async mount(container) {
      // Load topic data for mastery calculation
      const masteryEl = container.querySelector('#mastery-bars');
      if (!masteryEl) return;

      const masteryData = [];
      for (const topic of TOPICS) {
        const data = await store.loadTopicData(topic.id);
        const mastery = store.getTopicMastery(topic.id, data);
        masteryData.push({ topic, mastery });
      }

      let html = '';
      for (const { topic, mastery } of masteryData) {
        const color = mastery.mastery >= 80 ? 'green' : mastery.mastery >= 50 ? 'amber' : 'blue';
        html += `
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded flex items-center justify-center bg-${topic.color}-100 dark:bg-${topic.color}-900/40 flex-shrink-0">
                <i data-lucide="${topic.icon}" class="w-3.5 h-3.5 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
              </div>
              <span class="text-sm flex-1 truncate">${topic.title}</span>
              <span class="text-sm font-bold text-${color}-600">${mastery.mastery}%</span>
            </div>
            <div class="ml-9 grid grid-cols-4 gap-1.5">
              <div title="Sections read: ${mastery.sectionPct}%">
                <div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div class="h-full rounded-full bg-blue-400" style="width: ${mastery.sectionPct}%"></div>
                </div>
                <span class="text-[9px] text-slate-400">Read ${mastery.sectionPct}%</span>
              </div>
              <div title="Quiz accuracy: ${mastery.quizPct}%">
                <div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div class="h-full rounded-full bg-green-400" style="width: ${mastery.quizPct}%"></div>
                </div>
                <span class="text-[9px] text-slate-400">Quiz ${mastery.quizPct}%</span>
              </div>
              <div title="Flashcard maturity: ${mastery.fcPct}%">
                <div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div class="h-full rounded-full bg-violet-400" style="width: ${mastery.fcPct}%"></div>
                </div>
                <span class="text-[9px] text-slate-400">Cards ${mastery.fcPct}%</span>
              </div>
              <div title="Time spent: ${mastery.timePct}%">
                <div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div class="h-full rounded-full bg-amber-400" style="width: ${mastery.timePct}%"></div>
                </div>
                <span class="text-[9px] text-slate-400">Time ${mastery.timePct}%</span>
              </div>
            </div>
          </div>
        `;
      }
      masteryEl.innerHTML = html;
      if (window.lucide) lucide.createIcons();
    }
  };
}

function renderMetricCard(label, value, color, icon) {
  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
      <i data-lucide="${icon}" class="w-4 h-4 mx-auto mb-1 text-${color}-500"></i>
      <div class="text-xl font-bold text-${color}-600">${value}</div>
      <div class="text-[10px] text-slate-500 uppercase tracking-wider">${label}</div>
    </div>
  `;
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function renderActivityChart(log) {
  // Get last 30 days
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, count: log[dateStr] || 0, day: d.toLocaleDateString('en', { weekday: 'narrow' }) });
  }

  const maxCount = Math.max(1, ...days.map(d => d.count));

  return `
    <div class="flex items-end gap-1 h-24">
      ${days.map(d => {
        const height = d.count > 0 ? Math.max(8, (d.count / maxCount) * 100) : 4;
        const color = d.count === 0 ? 'bg-slate-200 dark:bg-slate-700' : d.count >= maxCount * 0.7 ? 'bg-green-500' : d.count >= maxCount * 0.3 ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-700';
        return `
          <div class="flex-1 flex flex-col items-center justify-end h-full group relative">
            <div class="${color} rounded-sm w-full transition-all hover:opacity-80" style="height: ${height}%"></div>
            <div class="absolute bottom-full mb-1 px-1.5 py-0.5 bg-slate-800 text-white text-[10px] rounded hidden group-hover:block whitespace-nowrap z-10">
              ${d.date}: ${d.count} actions
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="flex justify-between mt-1 text-[9px] text-slate-400">
      <span>${days[0].date.slice(5)}</span>
      <span>${days[14].date.slice(5)}</span>
      <span>${days[29].date.slice(5)}</span>
    </div>
  `;
}

export { createAnalyticsView };
