/**
 * HTGAA Week 2 — Progress Report View
 * Generates a shareable/printable progress report with topic breakdown,
 * study statistics, strengths & weaknesses analysis.
 */

import { store, TOPICS } from '../store.js';

const STUDENT_NAME_KEY = 'htgaa-week2-student-name';

const COLOR_MAP = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', ring: 'stroke-blue-500', bar: 'bg-blue-500' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', ring: 'stroke-green-500', bar: 'bg-green-500' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', ring: 'stroke-red-500', bar: 'bg-red-500' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', ring: 'stroke-purple-500', bar: 'bg-purple-500' },
  yellow: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', ring: 'stroke-amber-500', bar: 'bg-amber-500' },
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', ring: 'stroke-indigo-500', bar: 'bg-indigo-500' },
};

function rowColorClass(pct) {
  if (pct >= 70) return 'border-l-4 border-l-green-500';
  if (pct >= 30) return 'border-l-4 border-l-amber-500';
  return 'border-l-4 border-l-red-500';
}

function masteryLabel(pct) {
  if (pct >= 80) return '<span class="text-green-600 dark:text-green-400 font-semibold">Mastered</span>';
  if (pct >= 60) return '<span class="text-blue-600 dark:text-blue-400 font-semibold">Proficient</span>';
  if (pct >= 30) return '<span class="text-amber-600 dark:text-amber-400 font-semibold">Developing</span>';
  if (pct > 0) return '<span class="text-orange-600 dark:text-orange-400 font-semibold">Beginning</span>';
  return '<span class="text-slate-400 font-semibold">Not Started</span>';
}

function progressRingSVG(pct, size = 120, strokeWidth = 10) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 70 ? '#22c55e' : pct >= 30 ? '#f59e0b' : '#ef4444';
  return `
    <svg width="${size}" height="${size}" class="transform -rotate-90">
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
        fill="none" stroke="currentColor" stroke-width="${strokeWidth}"
        class="text-slate-200 dark:text-slate-700" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
        fill="none" stroke="${color}" stroke-width="${strokeWidth}"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round" class="transition-all duration-700" />
    </svg>`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function createProgressReportView() {
  let topicRows = [];

  return {
    async render() {
      const overallPct = store.getOverallProgress();
      const savedName = localStorage.getItem(STUDENT_NAME_KEY) || '';
      const now = new Date();

      // Load all topic data and compute mastery for each
      topicRows = [];
      for (const topic of TOPICS) {
        const data = await store.loadTopicData(topic.id);
        const quiz = store.getQuizScore(topic.id);
        const sectionsRead = store.getSectionsRead(topic.id);
        const mastery = store.getTopicMastery(topic.id, data);
        const totalSections = data?.sections?.length || 6;
        topicRows.push({ topic, data, quiz, sectionsRead, mastery, totalSections });
      }

      // Study statistics
      const studyLog = store.getStudyLog();
      const totalStudySessions = Object.values(studyLog).reduce((a, b) => a + b, 0);
      const fcStats = store.getFlashcardStats();
      const examScores = store.getExamScores();
      const bestExam = store.getBestExamScore();
      const notesCount = store.getNotesCount();
      const bookmarksCount = store.getBookmarks().length;
      const longestStreak = store.getLongestStreak();

      // Strengths & weaknesses
      const sorted = [...topicRows].sort((a, b) => {
        const aScore = a.quiz ? (a.quiz.correct / a.quiz.total) * 100 : -1;
        const bScore = b.quiz ? (b.quiz.correct / b.quiz.total) * 100 : -1;
        return bScore - aScore;
      });
      const strengths = sorted.filter(r => r.quiz && r.quiz.total > 0).slice(0, 3);
      const weaknesses = sorted.filter(r => !r.quiz || r.quiz.total === 0 || (r.quiz.correct / r.quiz.total) < 0.5).reverse().slice(0, 3);
      const wrongAnswers = store.getAllWrongAnswers();

      return `
        <style>
          @media print {
            nav, .sidebar, .nav-bar, [data-print-hide], .print-hide { display: none !important; }
            body, html { background: white !important; color: black !important; font-size: 11pt !important; }
            .dark body, .dark html { background: white !important; color: black !important; }
            .progress-report-page { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
            .progress-report-page * { color: black !important; border-color: #ccc !important; background: white !important; }
            .report-card { break-inside: avoid; page-break-inside: avoid; box-shadow: none !important; border: 1px solid #ddd !important; }
            .report-header { text-align: center; margin-bottom: 1rem; }
            .topic-table { width: 100%; font-size: 10pt; }
            @page { margin: 1.5cm; }
          }
        </style>
        <div class="max-w-4xl mx-auto px-4 py-8 progress-report-page">

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2 mb-6 print-hide" data-print-hide>
            <button id="pr-print" class="px-4 py-2 rounded-lg bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <i data-lucide="printer" class="w-4 h-4"></i> Print Report
            </button>
            <button id="pr-copy" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <i data-lucide="copy" class="w-4 h-4"></i> Copy as Text
            </button>
            <button id="pr-share" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <i data-lucide="share-2" class="w-4 h-4"></i> Share
            </button>
          </div>

          <!-- Report Header -->
          <div class="report-header text-center mb-8">
            <h1 class="text-3xl font-extrabold mb-1">HTGAA Week 2 — Progress Report</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Generated ${formatDate(now)}</p>
            <div class="flex items-center justify-center gap-2 mb-6 print-hide" data-print-hide>
              <label class="text-sm font-medium text-slate-600 dark:text-slate-300">Student:</label>
              <input id="pr-student-name" type="text" value="${savedName.replace(/"/g, '&quot;')}"
                placeholder="Enter your name"
                class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            ${savedName ? `<p class="hidden print:block text-lg font-semibold">${savedName}</p>` : ''}

            <!-- Overall Progress Ring -->
            <div class="flex flex-col items-center mt-4">
              <div class="relative">
                ${progressRingSVG(overallPct, 140, 12)}
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <span class="text-3xl font-extrabold">${overallPct}%</span>
                    <br/>
                    <span class="text-xs text-slate-500 dark:text-slate-400">Overall</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Topic Breakdown Table -->
          <div class="report-card bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
            <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 class="text-lg font-bold flex items-center gap-2">
                <i data-lucide="bar-chart-3" class="w-5 h-5 text-blue-500 print-hide"></i>
                Topic Breakdown
              </h2>
            </div>
            <div class="overflow-x-auto">
              <table class="topic-table w-full text-sm">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th class="px-5 py-3">Topic</th>
                    <th class="px-4 py-3 text-center">Sections</th>
                    <th class="px-4 py-3 text-center">Quiz Score</th>
                    <th class="px-4 py-3 text-center">Mastery</th>
                    <th class="px-4 py-3 text-center">Level</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  ${topicRows.map(r => {
                    const c = COLOR_MAP[r.topic.color] || COLOR_MAP.blue;
                    const quizPct = r.quiz ? Math.round((r.quiz.correct / r.quiz.total) * 100) : 0;
                    const readCount = r.sectionsRead.length;
                    return `
                    <tr class="${rowColorClass(r.mastery.mastery)} hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td class="px-5 py-3">
                        <div class="flex items-center gap-2">
                          <span class="inline-block w-3 h-3 rounded-full ${c.bar}"></span>
                          <span class="font-medium">${r.topic.title}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-center">
                        <span class="font-semibold">${readCount}</span>
                        <span class="text-slate-400">/ ${r.totalSections}</span>
                      </td>
                      <td class="px-4 py-3 text-center">
                        ${r.quiz ? `<span class="font-semibold">${r.quiz.correct}/${r.quiz.total}</span> <span class="text-slate-400">(${quizPct}%)</span>` : '<span class="text-slate-400">--</span>'}
                      </td>
                      <td class="px-4 py-3 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <div class="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                            <div class="h-full rounded-full ${c.bar} transition-all" style="width: ${r.mastery.mastery}%"></div>
                          </div>
                          <span class="text-xs font-bold w-8 text-right">${r.mastery.mastery}%</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-center text-xs">${masteryLabel(r.mastery.mastery)}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Study Statistics Grid -->
          <div class="report-card bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
            <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 class="text-lg font-bold flex items-center gap-2">
                <i data-lucide="activity" class="w-5 h-5 text-green-500 print-hide"></i>
                Study Statistics
              </h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-700">
              ${[
                { label: 'Study Activities', value: totalStudySessions, icon: 'book-open', color: 'blue' },
                { label: 'Flashcards Reviewed', value: fcStats.total, icon: 'layers', color: 'purple' },
                { label: 'Cards Mature', value: fcStats.mature, icon: 'check-circle', color: 'green' },
                { label: 'Cards Learning', value: fcStats.learning, icon: 'rotate-cw', color: 'amber' },
                { label: 'Exam Attempts', value: examScores.length, icon: 'file-text', color: 'indigo' },
                { label: 'Best Exam Score', value: bestExam ? bestExam.pct + '%' : '--', icon: 'trophy', color: 'yellow' },
                { label: 'Personal Notes', value: notesCount, icon: 'sticky-note', color: 'rose' },
                { label: 'Bookmarks', value: bookmarksCount, icon: 'bookmark', color: 'sky' },
                { label: 'Longest Streak', value: longestStreak + (longestStreak === 1 ? ' day' : ' days'), icon: 'flame', color: 'orange' },
              ].map(s => `
                <div class="bg-white dark:bg-slate-800 px-5 py-4 flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-${s.color}-100 dark:bg-${s.color}-900/30 flex items-center justify-center shrink-0 print-hide">
                    <i data-lucide="${s.icon}" class="w-4 h-4 text-${s.color}-600 dark:text-${s.color}-400"></i>
                  </div>
                  <div>
                    <div class="text-lg font-bold">${s.value}</div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">${s.label}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Strengths & Weaknesses -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Strengths -->
            <div class="report-card bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 class="text-base font-bold flex items-center gap-2 text-green-700 dark:text-green-400">
                  <i data-lucide="trending-up" class="w-5 h-5 print-hide"></i>
                  Top Strengths
                </h2>
              </div>
              <div class="p-5">
                ${strengths.length > 0 ? `<ul class="space-y-3">
                  ${strengths.map((r, i) => {
                    const qPct = r.quiz ? Math.round((r.quiz.correct / r.quiz.total) * 100) : 0;
                    const c = COLOR_MAP[r.topic.color] || COLOR_MAP.blue;
                    return `
                    <li class="flex items-center gap-3">
                      <span class="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-400">${i + 1}</span>
                      <span class="inline-block w-2.5 h-2.5 rounded-full ${c.bar}"></span>
                      <span class="font-medium">${r.topic.title}</span>
                      <span class="ml-auto text-sm font-semibold text-green-600 dark:text-green-400">${qPct}%</span>
                    </li>`;
                  }).join('')}
                </ul>` : '<p class="text-sm text-slate-400">No quizzes completed yet. Take some quizzes to see your strengths.</p>'}
              </div>
            </div>

            <!-- Weaknesses -->
            <div class="report-card bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 class="text-base font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <i data-lucide="trending-down" class="w-5 h-5 print-hide"></i>
                  Needs Improvement
                </h2>
              </div>
              <div class="p-5">
                ${weaknesses.length > 0 ? `<ul class="space-y-3">
                  ${weaknesses.map((r, i) => {
                    const qPct = r.quiz ? Math.round((r.quiz.correct / r.quiz.total) * 100) : 0;
                    const c = COLOR_MAP[r.topic.color] || COLOR_MAP.blue;
                    const reason = !r.quiz || r.quiz.total === 0 ? 'No quizzes taken' : `${qPct}% quiz score`;
                    return `
                    <li class="flex items-center gap-3">
                      <span class="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400">${i + 1}</span>
                      <span class="inline-block w-2.5 h-2.5 rounded-full ${c.bar}"></span>
                      <span class="font-medium">${r.topic.title}</span>
                      <span class="ml-auto text-xs text-slate-500">${reason}</span>
                    </li>`;
                  }).join('')}
                </ul>` : '<p class="text-sm text-slate-400">Great job -- no weak areas detected.</p>'}
              </div>
            </div>
          </div>

          <!-- Wrong Answer Patterns -->
          ${wrongAnswers.length > 0 ? `
          <div class="report-card bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
            <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 class="text-base font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
                <i data-lucide="x-circle" class="w-5 h-5 print-hide"></i>
                Wrong Answer Patterns (${wrongAnswers.length} incorrect)
              </h2>
            </div>
            <div class="p-5">
              <div class="flex flex-wrap gap-2">
                ${(() => {
                  const byTopic = {};
                  wrongAnswers.forEach(id => {
                    const topicId = id.split('-').slice(0, -1).join('-');
                    const matched = TOPICS.find(t => id.startsWith(t.id + '-'));
                    const key = matched ? matched.id : topicId;
                    byTopic[key] = (byTopic[key] || 0) + 1;
                  });
                  return Object.entries(byTopic).map(([tid, count]) => {
                    const t = TOPICS.find(x => x.id === tid);
                    const c = t ? COLOR_MAP[t.color] || COLOR_MAP.blue : COLOR_MAP.blue;
                    const name = t ? t.title : tid;
                    return `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${c.bg} ${c.text}">
                      ${name}: ${count} wrong
                    </span>`;
                  }).join('');
                })()}
              </div>
              <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Review these topics using the Mistakes view to improve your scores.</p>
            </div>
          </div>` : ''}

          <!-- Exam Score History -->
          ${examScores.length > 0 ? `
          <div class="report-card bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
            <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 class="text-base font-bold flex items-center gap-2">
                <i data-lucide="file-text" class="w-5 h-5 text-indigo-500 print-hide"></i>
                Exam History
              </h2>
            </div>
            <div class="p-5">
              <div class="space-y-2">
                ${examScores.slice(-5).reverse().map((e, i) => {
                  const d = new Date(e.date);
                  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const barW = e.pct;
                  const barColor = e.pct >= 70 ? 'bg-green-500' : e.pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
                  return `
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-slate-500 w-16 shrink-0">${dateStr}</span>
                    <div class="flex-1 h-5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div class="h-full rounded-full ${barColor} transition-all flex items-center justify-end pr-2" style="width: ${Math.max(barW, 8)}%">
                        <span class="text-[10px] font-bold text-white">${e.pct}%</span>
                      </div>
                    </div>
                    <span class="text-xs text-slate-500 w-12 text-right">${e.score}/${e.total}</span>
                  </div>`;
                }).join('')}
              </div>
            </div>
          </div>` : ''}

          <!-- Footer -->
          <div class="text-center text-xs text-slate-400 dark:text-slate-500 mt-8 pb-4">
            HTGAA BioBootcamp Week 2 Progress Report &middot; Generated by Study Companion
          </div>

        </div>`;
    },

    mount(container) {
      // Student name persistence
      const nameInput = container.querySelector('#pr-student-name');
      if (nameInput) {
        nameInput.addEventListener('input', () => {
          localStorage.setItem(STUDENT_NAME_KEY, nameInput.value);
        });
      }

      // Print
      const printBtn = container.querySelector('#pr-print');
      if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
      }

      // Copy as text
      const copyBtn = container.querySelector('#pr-copy');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const text = buildPlainText(nameInput?.value || '');
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
            if (window.lucide) lucide.createIcons({ nodes: [copyBtn] });
            setTimeout(() => {
              copyBtn.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i> Copy as Text';
              if (window.lucide) lucide.createIcons({ nodes: [copyBtn] });
            }, 2000);
          });
        });
      }

      // Share
      const shareBtn = container.querySelector('#pr-share');
      if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
          const text = buildPlainText(nameInput?.value || '');
          if (navigator.share) {
            try {
              await navigator.share({ title: 'HTGAA Week 2 Progress Report', text });
            } catch { /* user cancelled */ }
          } else {
            navigator.clipboard.writeText(text).then(() => {
              shareBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
              if (window.lucide) lucide.createIcons({ nodes: [shareBtn] });
              setTimeout(() => {
                shareBtn.innerHTML = '<i data-lucide="share-2" class="w-4 h-4"></i> Share';
                if (window.lucide) lucide.createIcons({ nodes: [shareBtn] });
              }, 2000);
            });
          }
        });
      }

      // Initialize Lucide icons
      if (window.lucide) lucide.createIcons({ nodes: [container] });
    }
  };

  function buildPlainText(studentName) {
    const lines = [];
    lines.push('========================================');
    lines.push('  HTGAA Week 2 — Progress Report');
    lines.push('========================================');
    if (studentName) lines.push(`Student: ${studentName}`);
    lines.push(`Generated: ${formatDate(new Date())}`);
    lines.push(`Overall Completion: ${store.getOverallProgress()}%`);
    lines.push('');
    lines.push('--- Topic Breakdown ---');
    lines.push('');
    const colW = { name: 22, sections: 12, quiz: 14, mastery: 10 };
    lines.push(
      'Topic'.padEnd(colW.name) +
      'Sections'.padEnd(colW.sections) +
      'Quiz'.padEnd(colW.quiz) +
      'Mastery'
    );
    lines.push('-'.repeat(colW.name + colW.sections + colW.quiz + colW.mastery));
    topicRows.forEach(r => {
      const qStr = r.quiz ? `${r.quiz.correct}/${r.quiz.total}` : '--';
      lines.push(
        r.topic.title.padEnd(colW.name) +
        `${r.sectionsRead.length}/${r.totalSections}`.padEnd(colW.sections) +
        qStr.padEnd(colW.quiz) +
        `${r.mastery.mastery}%`
      );
    });
    lines.push('');
    lines.push('--- Study Stats ---');
    const studyLog = store.getStudyLog();
    const totalActs = Object.values(studyLog).reduce((a, b) => a + b, 0);
    const fcStats = store.getFlashcardStats();
    const bestExam = store.getBestExamScore();
    lines.push(`Study activities: ${totalActs}`);
    lines.push(`Flashcards reviewed: ${fcStats.total} (${fcStats.mature} mature, ${fcStats.learning} learning)`);
    lines.push(`Exam attempts: ${store.getExamScores().length}${bestExam ? `, best: ${bestExam.pct}%` : ''}`);
    lines.push(`Notes: ${store.getNotesCount()} | Bookmarks: ${store.getBookmarks().length}`);
    lines.push(`Longest streak: ${store.getLongestStreak()} days`);
    lines.push('');
    const wrongAnswers = store.getAllWrongAnswers();
    if (wrongAnswers.length > 0) {
      lines.push(`Wrong answers: ${wrongAnswers.length} total`);
    }
    lines.push('');
    lines.push('Generated by HTGAA BioBootcamp Study Companion');
    return lines.join('\n');
  }
}
