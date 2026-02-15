/**
 * HTGAA Week 2 — Study Session Planner
 * Quick wizard: pick available time → get a personalized study plan.
 */

import { store, TOPICS } from '../store.js';

function createPlannerView() {
  let selectedMinutes = null;
  let containerEl = null;

  return {
    render() {
      return `
        <div class="max-w-3xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <i data-lucide="timer" class="w-5 h-5 text-emerald-600 dark:text-emerald-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Study Planner</h1>
                <p class="text-sm text-slate-500">Get a personalized plan based on your available time</p>
              </div>
            </div>
          </header>

          <!-- Time Selection -->
          <section class="mb-8">
            <h2 class="text-lg font-bold mb-4">How much time do you have?</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="time-options">
              ${[
                { mins: 10, label: '10 min', desc: 'Quick review', icon: 'zap' },
                { mins: 25, label: '25 min', desc: 'One pomodoro', icon: 'clock' },
                { mins: 45, label: '45 min', desc: 'Focused session', icon: 'brain' },
                { mins: 90, label: '90 min', desc: 'Deep dive', icon: 'flame' },
              ].map(opt => `
                <button class="time-option p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-center cursor-pointer group" data-mins="${opt.mins}">
                  <i data-lucide="${opt.icon}" class="w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-emerald-500 transition-colors"></i>
                  <div class="text-xl font-bold text-slate-700 dark:text-slate-200">${opt.label}</div>
                  <div class="text-xs text-slate-400 mt-1">${opt.desc}</div>
                </button>
              `).join('')}
            </div>
          </section>

          <!-- Generated Plan -->
          <div id="plan-output"></div>
        </div>
      `;
    },

    mount(container) {
      containerEl = container;
      container.querySelectorAll('.time-option').forEach(btn => {
        btn.addEventListener('click', () => {
          // Highlight selected
          container.querySelectorAll('.time-option').forEach(b => {
            b.classList.remove('border-emerald-500', 'dark:border-emerald-400', 'bg-emerald-50', 'dark:bg-emerald-900/20');
            b.classList.add('border-slate-200', 'dark:border-slate-700');
          });
          btn.classList.remove('border-slate-200', 'dark:border-slate-700');
          btn.classList.add('border-emerald-500', 'dark:border-emerald-400', 'bg-emerald-50', 'dark:bg-emerald-900/20');

          selectedMinutes = parseInt(btn.dataset.mins);
          generatePlan(selectedMinutes, container.querySelector('#plan-output'));
        });
      });
    }
  };
}

function generatePlan(minutes, outputEl) {
  const progress = store.get('progress');
  const completedCount = TOPICS.filter(t => progress[t.id]).length;
  const fcStats = store.getFlashcardStats();
  const activities = [];
  let timeLeft = minutes;

  // Priority order for activities
  const order = ['central-dogma', 'gel-electrophoresis', 'genetic-codes', 'sequencing', 'synthesis', 'editing'];

  // 1. Overdue flashcards (high priority, quick wins)
  if (fcStats.due > 0 && timeLeft >= 3) {
    const fcTime = Math.min(Math.ceil(fcStats.due * 0.5), Math.floor(timeLeft * 0.3), 15);
    const cardsToReview = Math.floor(fcTime / 0.5);
    activities.push({
      type: 'flashcards',
      title: `Review ${cardsToReview} flashcards`,
      description: `${fcStats.due} cards are overdue. Spaced repetition works best when reviews are on time.`,
      time: fcTime,
      route: '#/flashcards',
      icon: 'layers',
      color: 'violet',
      priority: 'high'
    });
    timeLeft -= fcTime;
  }

  // 2. Continue in-progress topics
  const inProgress = order
    .map(id => ({ topic: TOPICS.find(t => t.id === id), sr: store.getSectionsRead(id).length }))
    .filter(t => t.topic && !progress[t.topic.id] && t.sr > 0)
    .sort((a, b) => b.sr - a.sr);

  for (const item of inProgress) {
    if (timeLeft < 5) break;
    const sectionCounts = { 'sequencing': 7, 'synthesis': 7, 'editing': 7, 'genetic-codes': 6, 'gel-electrophoresis': 6, 'central-dogma': 7 };
    const remaining = (sectionCounts[item.topic.id] || 6) - item.sr;
    const readTime = Math.min(remaining * 4, Math.floor(timeLeft * 0.5), 30);
    const sectionsToRead = Math.max(1, Math.floor(readTime / 4));
    activities.push({
      type: 'read',
      title: `Continue ${item.topic.title}`,
      description: `Read ${sectionsToRead} more section${sectionsToRead > 1 ? 's' : ''} (${item.sr}/${sectionCounts[item.topic.id] || 6} done).`,
      time: readTime,
      route: `#/topic/${item.topic.id}`,
      icon: item.topic.icon,
      color: item.topic.color,
      priority: 'medium'
    });
    timeLeft -= readTime;
  }

  // 3. Start new topics
  if (timeLeft >= 10) {
    const notStarted = order
      .map(id => TOPICS.find(t => t.id === id))
      .filter(t => t && !progress[t.id] && store.getSectionsRead(t.id).length === 0);

    if (notStarted.length > 0) {
      const next = notStarted[0];
      const readTime = Math.min(20, Math.floor(timeLeft * 0.6));
      activities.push({
        type: 'new',
        title: `Start ${next.title}`,
        description: `Begin this topic — read the introduction and first section.`,
        time: readTime,
        route: `#/topic/${next.id}`,
        icon: next.icon,
        color: next.color,
        priority: 'medium'
      });
      timeLeft -= readTime;
    }
  }

  // 4. Take a quiz (if time remains and topics are read enough)
  if (timeLeft >= 5) {
    const needsQuiz = TOPICS.filter(t => {
      const sr = store.getSectionsRead(t.id).length;
      const qs = store.getQuizScore(t.id);
      return sr >= 3 && !qs;
    });
    if (needsQuiz.length > 0) {
      activities.push({
        type: 'quiz',
        title: `Quiz: ${needsQuiz[0].title}`,
        description: `Test yourself on what you've read. Active recall strengthens memory.`,
        time: Math.min(8, timeLeft),
        route: `#/topic/${needsQuiz[0].id}`,
        icon: 'help-circle',
        color: 'blue',
        priority: 'low'
      });
      timeLeft -= Math.min(8, timeLeft);
    }
  }

  // 5. Practice exam (if lots of time and mostly done)
  if (timeLeft >= 10 && completedCount >= 3) {
    activities.push({
      type: 'exam',
      title: 'Practice exam',
      description: `Test across all completed topics. Great for identifying weak spots.`,
      time: Math.min(15, timeLeft),
      route: '#/exam',
      icon: 'trophy',
      color: 'amber',
      priority: 'low'
    });
    timeLeft -= Math.min(15, timeLeft);
  }

  // 6. Review mistakes (if any, fill remaining time)
  const wrongAnswers = store.getAllWrongAnswers();
  if (timeLeft >= 3 && wrongAnswers.length > 0) {
    activities.push({
      type: 'review',
      title: 'Review mistakes',
      description: `Go over your ${wrongAnswers.length} wrong answer${wrongAnswers.length > 1 ? 's' : ''} and understand why.`,
      time: Math.min(5, timeLeft),
      route: '#/mistakes',
      icon: 'circle-x',
      color: 'rose',
      priority: 'low'
    });
    timeLeft -= Math.min(5, timeLeft);
  }

  // 7. If nothing to do (all complete), suggest review
  if (activities.length === 0) {
    if (completedCount === 6) {
      activities.push({
        type: 'review',
        title: 'Full review session',
        description: 'All topics complete! Use this time to strengthen weak areas.',
        time: Math.min(minutes, 15),
        route: '#/weak-points',
        icon: 'crosshair',
        color: 'red',
        priority: 'medium'
      });
    } else {
      const next = order.find(id => !progress[id]);
      if (next) {
        const topic = TOPICS.find(t => t.id === next);
        activities.push({
          type: 'new',
          title: `Start ${topic.title}`,
          description: 'Begin your study journey here.',
          time: minutes,
          route: `#/topic/${next}`,
          icon: topic.icon,
          color: topic.color,
          priority: 'high'
        });
      }
    }
  }

  // Calculate used time
  const usedTime = minutes - timeLeft;

  // Render
  let html = `
    <section class="mb-8 animate-fade-in">
      <h2 class="text-lg font-bold mb-2 flex items-center gap-2">
        <i data-lucide="route" class="w-5 h-5 text-emerald-500"></i>
        Your ${minutes}-Minute Plan
      </h2>
      <p class="text-sm text-slate-500 mb-4">${activities.length} activit${activities.length === 1 ? 'y' : 'ies'} planned (${usedTime} min used${timeLeft > 0 ? `, ${timeLeft} min buffer` : ''})</p>

      <!-- Timeline -->
      <div class="relative pl-8 space-y-4">
        <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-400 to-blue-400 dark:from-emerald-600 dark:to-blue-600 rounded-full"></div>

        ${activities.map((act, i) => {
          const elapsed = activities.slice(0, i).reduce((s, a) => s + a.time, 0);
          return `
            <div class="relative">
              <div class="absolute left-[-20px] w-6 h-6 rounded-full bg-${act.color}-100 dark:bg-${act.color}-900/40 flex items-center justify-center z-10 shadow-sm border-2 border-${act.color}-300 dark:border-${act.color}-700">
                <i data-lucide="${act.icon}" class="w-3 h-3 text-${act.color}-600 dark:text-${act.color}-400"></i>
              </div>
              <a data-route="${act.route}" class="block ml-2 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-${act.color}-300 dark:hover:border-${act.color}-700 cursor-pointer transition-all hover:shadow-sm group">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-${act.color}-600">${act.title}</span>
                  <span class="text-xs font-medium text-${act.color}-500 bg-${act.color}-50 dark:bg-${act.color}-900/20 px-2 py-0.5 rounded-full">${act.time} min</span>
                </div>
                <p class="text-xs text-slate-500">${act.description}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-[10px] text-slate-400">+${elapsed} min in</span>
                  <span class="text-xs font-medium text-${act.color}-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Start <i data-lucide="arrow-right" class="w-3 h-3"></i>
                  </span>
                </div>
              </a>
            </div>
          `;
        }).join('')}

        <!-- End marker -->
        <div class="relative">
          <div class="absolute left-[-20px] w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center z-10 shadow-sm">
            <i data-lucide="check" class="w-3 h-3 text-white"></i>
          </div>
          <div class="ml-2 py-2">
            <span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Done! (${usedTime} min)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Tips -->
    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Study Tips</h3>
      <ul class="text-xs text-slate-500 space-y-1">
        ${minutes <= 15 ? '<li>Short sessions are perfect for flashcard review and quick reads.</li>' : ''}
        ${minutes >= 25 ? '<li>Try the Pomodoro technique: 25 min focused study, 5 min break.</li>' : ''}
        ${minutes >= 45 ? '<li>Take a 5-minute break halfway through to refresh your focus.</li>' : ''}
        ${minutes >= 90 ? '<li>For long sessions, alternate between reading and active recall (quizzes).</li>' : ''}
        <li>Active recall (testing yourself) is 2-3x more effective than re-reading.</li>
      </ul>
    </div>
  `;

  outputEl.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

export { createPlannerView };
