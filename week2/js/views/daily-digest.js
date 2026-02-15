/**
 * HTGAA Week 2 — Daily Digest View
 * Personalized daily study plan based on progress, spaced repetition, and weak areas.
 */

import { store, TOPICS } from '../store.js';

function createDailyDigestView() {
  return {
    render() {
      const digest = buildDailyDigest();
      const today = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      return `
        <div class="max-w-3xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <i data-lucide="sunrise" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Daily Digest</h1>
                <p class="text-sm text-slate-500">${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}</p>
              </div>
            </div>
          </header>

          <!-- Greeting -->
          <div class="mb-8 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/15 dark:to-blue-900/15 border border-indigo-200/60 dark:border-indigo-800/50">
            <p class="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-1">${digest.greeting}</p>
            <p class="text-sm text-indigo-700 dark:text-indigo-400">${digest.summary}</p>
          </div>

          <!-- Today's Priority -->
          ${digest.priority ? `
          <section class="mb-8">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <i data-lucide="star" class="w-5 h-5 text-amber-500"></i> Today's Priority
            </h2>
            <a data-route="${digest.priority.route}" class="block p-5 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 hover:border-amber-400 cursor-pointer transition-colors group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <i data-lucide="${digest.priority.icon}" class="w-6 h-6 text-amber-600 dark:text-amber-400"></i>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-slate-800 dark:text-white">${digest.priority.title}</p>
                  <p class="text-sm text-slate-500 mt-0.5">${digest.priority.description}</p>
                </div>
                <i data-lucide="arrow-right" class="w-5 h-5 text-amber-400 flex-shrink-0 group-hover:translate-x-1 transition-transform"></i>
              </div>
            </a>
          </section>
          ` : ''}

          <!-- Study Checklist -->
          <section class="mb-8">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <i data-lucide="list-checks" class="w-5 h-5 text-green-500"></i> Today's Checklist
              <span class="text-xs font-normal text-slate-400 ml-auto">${digest.checklist.filter(c => c.done).length}/${digest.checklist.length} done</span>
            </h2>
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
              ${digest.checklist.map((item, i) => `
                <div class="flex items-center gap-3 p-4 ${item.done ? 'opacity-60' : ''}">
                  <div class="w-6 h-6 rounded-full ${item.done ? 'bg-green-100 dark:bg-green-900/30' : 'border-2 border-slate-300 dark:border-slate-600'} flex items-center justify-center flex-shrink-0">
                    ${item.done ? '<i data-lucide="check" class="w-3.5 h-3.5 text-green-600 dark:text-green-400"></i>' : ''}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium ${item.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}">${item.title}</p>
                    <p class="text-xs text-slate-400 mt-0.5">${item.detail}</p>
                  </div>
                  ${item.route && !item.done ? `
                    <a data-route="${item.route}" class="text-xs font-medium text-blue-500 hover:text-blue-600 flex-shrink-0 cursor-pointer">Go &rarr;</a>
                  ` : ''}
                  ${item.time ? `<span class="text-xs text-slate-400 flex-shrink-0">${item.time}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </section>

          <!-- Flashcard Review Forecast -->
          ${digest.forecast.length > 0 ? `
          <section class="mb-8">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <i data-lucide="calendar" class="w-5 h-5 text-violet-500"></i> Review Forecast
              <span class="text-xs font-normal text-slate-400 ml-auto">Next 7 days</span>
            </h2>
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div class="flex items-end gap-1 h-20 mb-2">
                ${digest.forecast.map(day => {
                  const maxCount = Math.max(1, ...digest.forecast.map(d => d.count));
                  const h = Math.max(4, (day.count / maxCount) * 100);
                  const color = day.isToday ? 'bg-violet-500' : 'bg-violet-200 dark:bg-violet-800';
                  return `
                    <div class="flex-1 flex flex-col items-center gap-1">
                      <span class="text-[10px] font-bold text-slate-500">${day.count}</span>
                      <div class="${color} rounded-t w-full" style="height:${h}%"></div>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="flex gap-1">
                ${digest.forecast.map(day => `
                  <div class="flex-1 text-center text-[10px] ${day.isToday ? 'font-bold text-violet-600 dark:text-violet-400' : 'text-slate-400'}">${day.label}</div>
                `).join('')}
              </div>
            </div>
          </section>
          ` : ''}

          <!-- Quick Stats -->
          <section class="mb-8">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <i data-lucide="bar-chart-3" class="w-5 h-5 text-blue-500"></i> Your Stats
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              ${digest.stats.map(s => `
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                  <div class="text-2xl font-bold text-${s.color}-600 dark:text-${s.color}-400">${s.value}</div>
                  <div class="text-xs text-slate-500 mt-1">${s.label}</div>
                </div>
              `).join('')}
            </div>
          </section>

          <!-- Motivational Quote -->
          <div class="text-center py-6 border-t border-slate-200 dark:border-slate-700">
            <p class="text-sm text-slate-400 italic">"${digest.quote}"</p>
          </div>
        </div>
      `;
    },

    mount(container) {
      // No special interactivity needed — all links use data-route
    }
  };
}

function buildDailyDigest() {
  const progress = store.get('progress');
  const completedCount = TOPICS.filter(t => progress[t.id]).length;
  const overallPct = store.getOverallProgress();
  const fcStats = store.getFlashcardStats();
  const today = new Date().toISOString().slice(0, 10);
  const log = store.getStudyLog();
  const todayActivity = log[today] || 0;

  // Greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  let greeting, summary;
  if (completedCount === 0) {
    greeting = `${timeGreeting}! Ready to start?`;
    summary = "You haven't begun Week 2 yet. Let's start with the Central Dogma — it's the foundation for everything else.";
  } else if (completedCount === 6) {
    greeting = `${timeGreeting}! All topics complete!`;
    summary = `Focus on flashcard reviews and practice exams to solidify your knowledge. You're at ${overallPct}% mastery.`;
  } else {
    greeting = `${timeGreeting}! ${completedCount}/6 topics done.`;
    summary = `You're ${overallPct}% through the material. ${todayActivity > 0 ? `You've already studied today — great!` : `No study activity yet today. Even 10 minutes helps!`}`;
  }

  // Priority
  let priority = null;
  if (fcStats.due > 5) {
    priority = {
      icon: 'layers', route: '#/flashcards',
      title: `Review ${fcStats.due} overdue flashcards`,
      description: 'Spaced repetition only works if you review on time. This should take about ' + Math.ceil(fcStats.due * 0.5) + ' minutes.'
    };
  } else if (completedCount < 6) {
    // Find the most in-progress topic
    const inProgress = TOPICS.filter(t => !progress[t.id]).map(t => ({
      topic: t, sr: store.getSectionsRead(t.id).length
    })).sort((a, b) => b.sr - a.sr);

    const best = inProgress[0];
    if (best && best.sr > 0) {
      const sectionCounts = { 'sequencing': 7, 'synthesis': 7, 'editing': 7, 'genetic-codes': 6, 'gel-electrophoresis': 6, 'central-dogma': 7 };
      priority = {
        icon: best.topic.icon, route: `#/topic/${best.topic.id}`,
        title: `Continue ${best.topic.title}`,
        description: `You've read ${best.sr}/${sectionCounts[best.topic.id] || 6} sections. Finish this chapter to build momentum.`
      };
    } else {
      const order = ['central-dogma', 'gel-electrophoresis', 'genetic-codes', 'sequencing', 'synthesis', 'editing'];
      const nextId = order.find(id => !progress[id] && store.getSectionsRead(id).length === 0);
      if (nextId) {
        const topic = TOPICS.find(t => t.id === nextId);
        priority = {
          icon: topic.icon, route: `#/topic/${nextId}`,
          title: `Start ${topic.title}`,
          description: 'This is the next recommended topic in the learning path.'
        };
      }
    }
  }

  // Checklist
  const checklist = [];

  // 1. Read a section
  const unfinished = TOPICS.filter(t => !progress[t.id]).sort((a, b) => store.getSectionsRead(b.id).length - store.getSectionsRead(a.id).length);
  if (unfinished.length > 0) {
    const t = unfinished[0];
    const sr = store.getSectionsRead(t.id).length;
    checklist.push({
      title: `Read a section of ${t.title}`,
      detail: sr > 0 ? `${sr} sections done so far` : 'Not started yet',
      route: `#/topic/${t.id}`,
      done: todayActivity >= 3,
      time: '~5 min'
    });
  }

  // 2. Review flashcards
  checklist.push({
    title: 'Review due flashcards',
    detail: fcStats.due > 0 ? `${fcStats.due} cards waiting` : 'All caught up!',
    route: '#/flashcards',
    done: fcStats.due === 0,
    time: fcStats.due > 0 ? `~${Math.ceil(fcStats.due * 0.5)} min` : ''
  });

  // 3. Answer a quiz question
  const quizzes = store.get('quizzes') || {};
  const todayQuizzes = Object.keys(quizzes).filter(k => k.includes('qotd'));
  checklist.push({
    title: 'Answer the Question of the Day',
    detail: 'Test your recall with a daily challenge',
    route: '#/',
    done: localStorage.getItem(`htgaa-week2-qotd-${Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)}`) !== null,
    time: '~1 min'
  });

  // 4. Take a quiz if reading is far enough along
  const needsQuiz = TOPICS.filter(t => {
    const sr = store.getSectionsRead(t.id).length;
    const qs = store.getQuizScore(t.id);
    return sr >= 4 && !qs;
  });
  if (needsQuiz.length > 0) {
    checklist.push({
      title: `Take the ${needsQuiz[0].title} quiz`,
      detail: 'You\'ve read enough to test yourself',
      route: `#/topic/${needsQuiz[0].id}`,
      done: false,
      time: '~5 min'
    });
  }

  // 5. Practice exam if 3+ topics done
  if (completedCount >= 3) {
    const examScores = store.getExamScores();
    checklist.push({
      title: 'Take a practice exam',
      detail: examScores.length > 0 ? `Best: ${store.getBestExamScore()?.pct || 0}%` : 'Test yourself across all topics',
      route: '#/exam',
      done: examScores.length > 0 && (Date.now() - examScores[examScores.length - 1].date) < 86400000,
      time: '~10 min'
    });
  }

  // Flashcard review forecast (next 7 days)
  const forecast = [];
  const fcData = store.get('flashcards') || { reviews: {} };
  const reviews = fcData.reviews || {};
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let d = 0; d < 7; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    date.setHours(23, 59, 59, 999);
    const dayEnd = date.getTime();
    date.setHours(0, 0, 0, 0);
    const dayStart = date.getTime();

    let count = 0;
    Object.values(reviews).forEach(r => {
      if (r.nextReview && r.nextReview >= dayStart && r.nextReview <= dayEnd) count++;
    });
    // Day 0 (today) includes already overdue
    if (d === 0) {
      Object.values(reviews).forEach(r => {
        if (r.nextReview && r.nextReview < dayStart) count++;
      });
    }

    forecast.push({
      label: d === 0 ? 'Today' : d === 1 ? 'Tmw' : dayLabels[date.getDay()],
      count,
      isToday: d === 0
    });
  }

  // Stats
  const timeSpent = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
  const totalSecs = Object.values(timeSpent).reduce((s, v) => s + v, 0);
  const totalMin = Math.floor(totalSecs / 60);
  const quizEntries = Object.entries(quizzes);
  const correctQ = quizEntries.filter(([, v]) => v === true).length;

  // Study streak
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const ds = cursor.toISOString().slice(0, 10);
    if ((log[ds] || 0) >= 1) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }

  const stats = [
    { value: `${completedCount}/6`, label: 'Topics Done', color: 'green' },
    { value: totalMin > 60 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m` : `${totalMin}m`, label: 'Time Studied', color: 'blue' },
    { value: quizEntries.length > 0 ? `${Math.round(correctQ / quizEntries.length * 100)}%` : '—', label: 'Quiz Accuracy', color: 'purple' },
    { value: streak > 0 ? `${streak}d` : '0', label: 'Streak', color: 'orange' },
  ];

  // Motivational quotes
  const quotes = [
    "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. — Brian Herbert",
    "Tell me and I forget, teach me and I may remember, involve me and I learn. — Benjamin Franklin",
    "Education is not the filling of a pail, but the lighting of a fire. — W.B. Yeats",
    "The more that you read, the more things you will know. The more that you learn, the more places you'll go. — Dr. Seuss",
    "Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi",
    "An investment in knowledge pays the best interest. — Benjamin Franklin",
    "The beautiful thing about learning is that nobody can take it away from you. — B.B. King",
  ];
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = quotes[dayOfYear % quotes.length];

  return { greeting, summary, priority, checklist, forecast, stats, quote };
}

export { createDailyDigestView };
