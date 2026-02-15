/**
 * HTGAA Week 2 — Progress Timeline View
 * Visual timeline of the student's learning journey with milestones and achievements.
 */

import { store, TOPICS } from '../store.js';

function createTimelineView() {
  return {
    render() {
      const events = buildTimeline();
      const achievements = computeAchievements();

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <i data-lucide="milestone" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Your Learning Journey</h1>
                <p class="text-sm text-slate-500">${events.length} milestone${events.length !== 1 ? 's' : ''} so far</p>
              </div>
            </div>
          </header>

          <!-- Achievements Row -->
          ${achievements.length > 0 ? `
            <section class="mb-8">
              <h2 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Achievements Unlocked</h2>
              <div class="flex flex-wrap gap-3">
                ${achievements.filter(a => a.unlocked).map(a => `
                  <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br ${a.gradient} border ${a.border} shadow-sm">
                    <span class="text-lg">${a.emoji}</span>
                    <div>
                      <div class="text-xs font-bold ${a.textColor}">${a.title}</div>
                      <div class="text-[10px] ${a.subtextColor}">${a.desc}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          <!-- Locked Achievements -->
          ${achievements.filter(a => !a.unlocked).length > 0 ? `
            <section class="mb-8">
              <h2 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Next Achievements</h2>
              <div class="flex flex-wrap gap-3">
                ${achievements.filter(a => !a.unlocked).slice(0, 4).map(a => `
                  <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-60">
                    <span class="text-lg grayscale">${a.emoji}</span>
                    <div>
                      <div class="text-xs font-bold text-slate-400">${a.title}</div>
                      <div class="text-[10px] text-slate-400">${a.hint}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          <!-- Timeline -->
          ${events.length === 0 ? `
            <div class="text-center py-16">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <i data-lucide="milestone" class="w-8 h-8 text-slate-400"></i>
              </div>
              <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No milestones yet</h3>
              <p class="text-sm text-slate-500 max-w-md mx-auto mb-4">
                Start reading topics and taking quizzes to build your learning timeline.
              </p>
              <a data-route="#/" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                <i data-lucide="book-open" class="w-4 h-4"></i> Start Learning
              </a>
            </div>
          ` : `
            <section>
              <h2 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Timeline</h2>
              <div class="relative pl-8 space-y-0">
                <!-- Vertical line -->
                <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-400 via-indigo-400 to-purple-400 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600 rounded-full"></div>

                ${events.map((event, i) => `
                  ${event.dateSeparator ? `
                    <div class="relative pb-2 pt-${i === 0 ? '0' : '4'}">
                      <div class="absolute left-[-20px] w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-400 dark:border-indigo-500 flex items-center justify-center z-10">
                        <i data-lucide="calendar" class="w-3 h-3 text-indigo-500"></i>
                      </div>
                      <div class="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">${event.dateSeparator}</div>
                    </div>
                  ` : ''}
                  <div class="relative pb-6">
                    <div class="absolute left-[-20px] w-6 h-6 rounded-full ${event.dotColor} flex items-center justify-center z-10 shadow-sm">
                      <i data-lucide="${event.icon}" class="w-3 h-3 ${event.iconColor}"></i>
                    </div>
                    <div class="ml-2 p-3 rounded-xl ${event.bgColor} border ${event.borderColor} hover:shadow-sm transition-shadow">
                      <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">${event.title}</span>
                        ${event.badge ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium ${event.badgeColor}">${event.badge}</span>` : ''}
                      </div>
                      <p class="text-xs text-slate-500">${event.description}</p>
                      <div class="flex items-center gap-3 mt-1.5">
                        <span class="text-[10px] text-slate-400">${event.timeAgo}</span>
                        ${event.link ? `<a data-route="${event.link}" class="text-[10px] font-medium text-blue-500 hover:text-blue-600 cursor-pointer">${event.linkLabel}</a>` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          `}
        </div>
      `;
    },

    mount(container) {
      // No special interactivity — all links use data-route
    }
  };
}

function buildTimeline() {
  const events = [];

  // Gather all timestamped events from store
  const feed = store.getActivityFeed(50);
  const examScores = store.getExamScores();
  const bookmarks = store.getBookmarks();
  const progress = store.get('progress');
  const allNotes = store.getAllNotes();

  // Topic completions
  TOPICS.forEach(topic => {
    if (progress[topic.id]) {
      // We don't have exact timestamps for topic completions, but we can infer from activity feed
      const completeEvent = feed.find(f => f.action === 'complete' && f.detail?.topicId === topic.id);
      events.push({
        time: completeEvent?.time || Date.now(),
        type: 'complete',
        title: `Completed: ${topic.title}`,
        description: `Finished reading all sections of ${topic.title}.`,
        icon: 'check-circle-2',
        iconColor: 'text-white',
        dotColor: 'bg-green-500',
        bgColor: 'bg-green-50/50 dark:bg-green-900/10',
        borderColor: 'border-green-200 dark:border-green-800/40',
        badge: 'Complete',
        badgeColor: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        link: `#/topic/${topic.id}`,
        linkLabel: 'Review'
      });
    }
  });

  // Exam scores
  examScores.forEach(exam => {
    const topicNames = (exam.topics || []).map(id => {
      const t = TOPICS.find(t => t.id === id);
      return t ? t.title : id;
    }).join(', ');
    events.push({
      time: exam.date,
      type: 'exam',
      title: `Exam: ${exam.pct}%`,
      description: `Scored ${exam.score}/${exam.total}${topicNames ? ` on ${topicNames}` : ''}.`,
      icon: 'trophy',
      iconColor: exam.pct >= 80 ? 'text-white' : 'text-amber-700',
      dotColor: exam.pct >= 80 ? 'bg-amber-500' : 'bg-amber-200 dark:bg-amber-800',
      bgColor: exam.pct >= 80 ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'bg-slate-50 dark:bg-slate-800',
      borderColor: exam.pct >= 80 ? 'border-amber-200 dark:border-amber-800/40' : 'border-slate-200 dark:border-slate-700',
      badge: exam.pct >= 90 ? 'A+' : exam.pct >= 80 ? 'A' : exam.pct >= 70 ? 'B' : exam.pct >= 60 ? 'C' : 'Retry',
      badgeColor: exam.pct >= 80 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
      link: '#/exam',
      linkLabel: 'Exam mode'
    });
  });

  // Quiz milestones from activity feed
  const quizEvents = feed.filter(f => f.action === 'quiz');
  // Group by topic to show first quiz taken per topic
  const quizTopics = new Set();
  quizEvents.forEach(q => {
    const topicId = q.detail?.quizId?.split('-')[0];
    if (topicId && !quizTopics.has(topicId)) {
      quizTopics.add(topicId);
      const topic = TOPICS.find(t => t.id === topicId);
      const score = store.getQuizScore(topicId);
      if (topic && score) {
        events.push({
          time: q.time,
          type: 'quiz',
          title: `Quiz: ${topic.title}`,
          description: `Answered ${score.correct}/${score.total} questions correctly (${Math.round(score.correct / score.total * 100)}%).`,
          icon: 'help-circle',
          iconColor: 'text-white',
          dotColor: 'bg-blue-500',
          bgColor: 'bg-blue-50/50 dark:bg-blue-900/10',
          borderColor: 'border-blue-200 dark:border-blue-800/40',
          link: `#/topic/${topicId}`,
          linkLabel: 'Review answers'
        });
      }
    }
  });

  // Section reading milestones
  const sectionEvents = feed.filter(f => f.action === 'section');
  // Group by topic, show first section read per topic
  const readTopics = new Set();
  sectionEvents.forEach(s => {
    const topicId = s.detail?.topicId;
    if (topicId && !readTopics.has(topicId)) {
      readTopics.add(topicId);
      const topic = TOPICS.find(t => t.id === topicId);
      if (topic) {
        events.push({
          time: s.time,
          type: 'started',
          title: `Started: ${topic.title}`,
          description: `Began reading ${topic.title}.`,
          icon: 'book-open',
          iconColor: 'text-white',
          dotColor: `bg-${topic.color}-400`,
          bgColor: `bg-${topic.color}-50/50 dark:bg-${topic.color}-900/10`,
          borderColor: `border-${topic.color}-200 dark:border-${topic.color}-800/40`,
          link: `#/topic/${topicId}`,
          linkLabel: 'Continue'
        });
      }
    }
  });

  // Flashcard sessions
  const fcEvents = feed.filter(f => f.action === 'flashcard');
  if (fcEvents.length > 0) {
    const stats = store.getFlashcardStats();
    events.push({
      time: fcEvents[0].time,
      type: 'flashcard',
      title: `Flashcard Reviews`,
      description: `${stats.totalReviews} total reviews, ${stats.mature} mature cards.`,
      icon: 'layers',
      iconColor: 'text-white',
      dotColor: 'bg-violet-500',
      bgColor: 'bg-violet-50/50 dark:bg-violet-900/10',
      borderColor: 'border-violet-200 dark:border-violet-800/40',
      link: '#/flashcards',
      linkLabel: 'Review cards'
    });
  }

  // Sort by time descending
  events.sort((a, b) => (b.time || 0) - (a.time || 0));

  // Add date separators
  let lastDate = '';
  events.forEach(event => {
    const d = new Date(event.time);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (dateStr !== lastDate) {
      event.dateSeparator = dateStr;
      lastDate = dateStr;
    }
    event.timeAgo = formatTimeAgo(event.time);
  });

  return events;
}

function computeAchievements() {
  const progress = store.get('progress');
  const completedCount = TOPICS.filter(t => progress[t.id]).length;
  const examScores = store.getExamScores();
  const bestExam = store.getBestExamScore();
  const streak = store.getLongestStreak();
  const bookmarks = store.getBookmarks();
  const notesCount = store.getNotesCount();
  const fcStats = store.getFlashcardStats();
  const log = store.getStudyLog();
  const activeDays = Object.values(log).filter(v => v > 0).length;

  return [
    {
      id: 'first-topic',
      emoji: '\u{1F331}',
      title: 'First Steps',
      desc: 'Completed your first topic',
      hint: 'Complete any topic',
      unlocked: completedCount >= 1,
      gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      border: 'border-green-200 dark:border-green-800/40',
      textColor: 'text-green-700 dark:text-green-300',
      subtextColor: 'text-green-500 dark:text-green-400',
    },
    {
      id: 'half-done',
      emoji: '\u{26A1}',
      title: 'Halfway There',
      desc: 'Completed 3 of 6 topics',
      hint: 'Complete 3 topics',
      unlocked: completedCount >= 3,
      gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      border: 'border-amber-200 dark:border-amber-800/40',
      textColor: 'text-amber-700 dark:text-amber-300',
      subtextColor: 'text-amber-500 dark:text-amber-400',
    },
    {
      id: 'all-done',
      emoji: '\u{1F451}',
      title: 'Week 2 Master',
      desc: 'Completed all 6 topics',
      hint: 'Complete all 6 topics',
      unlocked: completedCount >= 6,
      gradient: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      border: 'border-purple-200 dark:border-purple-800/40',
      textColor: 'text-purple-700 dark:text-purple-300',
      subtextColor: 'text-purple-500 dark:text-purple-400',
    },
    {
      id: 'exam-pass',
      emoji: '\u{1F3C6}',
      title: 'Exam Ace',
      desc: `Best score: ${bestExam?.pct || 0}%`,
      hint: 'Score 80%+ on an exam',
      unlocked: bestExam && bestExam.pct >= 80,
      gradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
      border: 'border-yellow-200 dark:border-yellow-800/40',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      subtextColor: 'text-yellow-500 dark:text-yellow-400',
    },
    {
      id: 'streak-3',
      emoji: '\u{1F525}',
      title: 'On Fire',
      desc: `${streak}-day study streak`,
      hint: 'Study 3 days in a row',
      unlocked: streak >= 3,
      gradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      border: 'border-orange-200 dark:border-orange-800/40',
      textColor: 'text-orange-700 dark:text-orange-300',
      subtextColor: 'text-orange-500 dark:text-orange-400',
    },
    {
      id: 'streak-7',
      emoji: '\u{1F4AA}',
      title: 'Unstoppable',
      desc: `${streak}-day streak`,
      hint: 'Study 7 days in a row',
      unlocked: streak >= 7,
      gradient: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
      border: 'border-red-200 dark:border-red-800/40',
      textColor: 'text-red-700 dark:text-red-300',
      subtextColor: 'text-red-500 dark:text-red-400',
    },
    {
      id: 'note-taker',
      emoji: '\u{1F4DD}',
      title: 'Note Taker',
      desc: `${notesCount} notes written`,
      hint: 'Write 5+ study notes',
      unlocked: notesCount >= 5,
      gradient: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20',
      border: 'border-sky-200 dark:border-sky-800/40',
      textColor: 'text-sky-700 dark:text-sky-300',
      subtextColor: 'text-sky-500 dark:text-sky-400',
    },
    {
      id: 'fc-master',
      emoji: '\u{1F9E0}',
      title: 'Memory Master',
      desc: `${fcStats.mature} mature cards`,
      hint: 'Get 10+ mature flashcards',
      unlocked: fcStats.mature >= 10,
      gradient: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
      border: 'border-violet-200 dark:border-violet-800/40',
      textColor: 'text-violet-700 dark:text-violet-300',
      subtextColor: 'text-violet-500 dark:text-violet-400',
    },
    {
      id: 'active-learner',
      emoji: '\u{1F4C5}',
      title: 'Dedicated',
      desc: `${activeDays} active study days`,
      hint: 'Study on 5+ different days',
      unlocked: activeDays >= 5,
      gradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
      border: 'border-teal-200 dark:border-teal-800/40',
      textColor: 'text-teal-700 dark:text-teal-300',
      subtextColor: 'text-teal-500 dark:text-teal-400',
    },
    {
      id: 'bookworm',
      emoji: '\u{1F4DA}',
      title: 'Bookworm',
      desc: `${bookmarks.length} bookmarks saved`,
      hint: 'Bookmark 10+ sections',
      unlocked: bookmarks.length >= 10,
      gradient: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
      border: 'border-indigo-200 dark:border-indigo-800/40',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      subtextColor: 'text-indigo-500 dark:text-indigo-400',
    },
  ];
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export { createTimelineView };
