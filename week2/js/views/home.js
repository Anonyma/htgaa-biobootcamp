/**
 * HTGAA Week 2 — Home/Dashboard View
 * Learning path overview, progress dashboard, topic cards.
 */

import { store, TOPICS } from '../store.js';

function createHomeView() {
  return {
    render() {
      const progress = store.get('progress');
      const overallPct = store.getOverallProgress();

      return `
        <!-- Hero -->
        <header class="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-2xl mx-4 mt-6 overflow-hidden">
          <div class="max-w-5xl mx-auto px-6 py-10 md:py-14">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p class="text-blue-200 text-sm font-medium mb-2">HTGAA Spring 2026 — Week 2</p>
                <h1 class="text-3xl md:text-4xl font-extrabold mb-3">DNA Read, Write, & Edit</h1>
                <p class="text-blue-100 max-w-xl leading-relaxed">
                  Master the foundations of DNA sequencing, synthesis, genome editing,
                  genetic codes, gel electrophoresis, and gene expression.
                </p>
                <div class="flex items-center gap-4 mt-4 text-sm text-blue-200">
                  <span class="flex items-center gap-1"><i data-lucide="book-open" class="w-4 h-4"></i> 6 Chapters</span>
                  <span class="flex items-center gap-1"><i data-lucide="flask-conical" class="w-4 h-4"></i> 12+ Simulations</span>
                  <span class="flex items-center gap-1"><i data-lucide="help-circle" class="w-4 h-4"></i> 152 Questions</span>
                  <span class="flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> ~4 hrs</span>
                </div>
              </div>
              <div class="flex flex-col items-center">
                <div class="relative w-28 h-28">
                  <svg class="progress-ring w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
                    <circle id="hero-progress-circle" cx="50" cy="50" r="42" fill="none" stroke="white" stroke-width="8"
                            stroke-dasharray="264" stroke-dashoffset="${264 - (overallPct / 100) * 264}" stroke-linecap="round"
                            style="transition: stroke-dashoffset 0.8s ease"/>
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-2xl font-bold">${overallPct}%</span>
                  </div>
                </div>
                <span class="text-blue-200 text-sm mt-2">Progress</span>
              </div>
            </div>
          </div>
        </header>

        <main class="max-w-5xl mx-auto px-4 py-8">
          <!-- All Complete Celebration -->
          ${overallPct === 100 ? renderAllCompleteCelebration() : ''}

          <!-- Continue Reading -->
          ${renderContinueReading(progress)}

          <!-- Flashcard Review Reminder -->
          ${renderReviewReminder()}

          <!-- Today's Study Plan -->
          ${renderStudyPlan(progress)}

          <!-- Stats Dashboard -->
          ${renderStatsDashboard(progress)}

          <!-- Visual Learning Path -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="route" class="w-5 h-5 text-blue-500"></i> Learning Path
            </h2>
            ${renderLearningPath(progress)}
          </section>

          <!-- Topic Cards (detailed) -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="layout-grid" class="w-5 h-5 text-indigo-500"></i> Topics
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              ${TOPICS.map((topic, i) => renderTopicCard(topic, i, progress)).join('')}
            </div>
          </section>

          <!-- Study Stats -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="bar-chart-3" class="w-5 h-5 text-emerald-500"></i> Your Stats
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              ${renderStatCard('trophy', 'Topics Done', `${Object.values(progress).filter(Boolean).length}/6`, 'amber')}
              ${renderStatCard('help-circle', 'Quiz Score', getQuizStats(), 'blue')}
              ${renderStatCard('check-square', 'HW Steps', getHWStats(), 'green')}
              ${renderStatCard('brain', 'Flashcards', getFlashcardStats(), 'purple')}
              ${renderStatCard('timer', 'Time Studied', getTimeStudied(), 'cyan')}
            </div>
          </section>

          <!-- Bookmarks -->
          ${renderBookmarks()}

          <!-- Study Activity Heatmap -->
          ${renderStudyHeatmap()}

          <!-- Quick Actions -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="zap" class="w-5 h-5 text-yellow-500"></i> Study Tools
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <a data-route="#/flashcards" class="block p-5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-800 hover:border-violet-400 cursor-pointer transition-colors">
                <i data-lucide="layers" class="w-6 h-6 text-violet-500 mb-2"></i>
                <h3 class="font-bold">Flashcards</h3>
                <p class="text-sm text-slate-500 mt-1">Spaced repetition review</p>
              </a>
              <a data-route="#/homework" class="block p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800 hover:border-orange-400 cursor-pointer transition-colors">
                <i data-lucide="clipboard-list" class="w-6 h-6 text-orange-500 mb-2"></i>
                <h3 class="font-bold">Homework Hub</h3>
                <p class="text-sm text-slate-500 mt-1">Guidance & checklists</p>
              </a>
              <a data-route="#/concept-map" class="block p-5 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 cursor-pointer transition-colors">
                <i data-lucide="git-branch" class="w-6 h-6 text-cyan-500 mb-2"></i>
                <h3 class="font-bold">Concept Map</h3>
                <p class="text-sm text-slate-500 mt-1">How topics connect</p>
              </a>
              <a data-route="#/exam" class="block p-5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800 hover:border-amber-400 cursor-pointer transition-colors">
                <i data-lucide="trophy" class="w-6 h-6 text-amber-500 mb-2"></i>
                <h3 class="font-bold">Exam Mode</h3>
                <p class="text-sm text-slate-500 mt-1">Timed practice quiz</p>
              </a>
              <a data-route="#/compare" class="block p-5 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl border border-teal-200 dark:border-teal-800 hover:border-teal-400 cursor-pointer transition-colors">
                <i data-lucide="columns" class="w-6 h-6 text-teal-500 mb-2"></i>
                <h3 class="font-bold">Compare</h3>
                <p class="text-sm text-slate-500 mt-1">Side-by-side topics</p>
              </a>
            </div>
          </section>

          <!-- Lecturers -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="users" class="w-5 h-5 text-slate-500"></i> Lecturers
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              ${renderLecturer('George Church', 'Reading & Writing Life', 'Genetic codes, sequencing, expanded alphabets, CRISPR, MAGE, genome recoding, DNA data storage')}
              ${renderLecturer('Joe Jacobson', 'Gene Synthesis', 'Phosphoramidite chemistry, chip-based synthesis, error correction, Gibson assembly, bioFPGA')}
              ${renderLecturer('Emily Leproust', 'DNA Synthesis Development', 'History of chemical synthesis, Twist Bioscience platform, silicon chip synthesis, oligo pools')}
            </div>
          </section>

          <!-- Achievements -->
          ${renderAchievements()}

          <!-- Export & Data -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="download" class="w-5 h-5 text-teal-500"></i> Export Your Data
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button id="export-notes-btn" class="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-400 transition-colors cursor-pointer text-left">
                <i data-lucide="file-text" class="w-5 h-5 text-teal-500 flex-shrink-0"></i>
                <div>
                  <div class="font-bold text-sm">Export Notes</div>
                  <div class="text-xs text-slate-500">Download all your topic notes</div>
                </div>
              </button>
              <button id="export-progress-btn" class="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer text-left">
                <i data-lucide="bar-chart" class="w-5 h-5 text-blue-500 flex-shrink-0"></i>
                <div>
                  <div class="font-bold text-sm">Export Progress</div>
                  <div class="text-xs text-slate-500">Quiz scores, time, streaks</div>
                </div>
              </button>
              <button id="reset-progress-btn" class="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-400 transition-colors cursor-pointer text-left">
                <i data-lucide="rotate-ccw" class="w-5 h-5 text-red-400 flex-shrink-0"></i>
                <div>
                  <div class="font-bold text-sm">Reset Progress</div>
                  <div class="text-xs text-slate-500">Start fresh (keeps notes)</div>
                </div>
              </button>
            </div>
          </section>

          <!-- Quick Links -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="link" class="w-5 h-5 text-slate-500"></i> Resources
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              ${[
                { name: 'GenBank (NCBI)', url: 'https://www.ncbi.nlm.nih.gov/genbank/' },
                { name: 'Benchling', url: 'https://benchling.com' },
                { name: 'Twist Bioscience', url: 'https://www.twistbioscience.com' },
                { name: 'Addgene RE Reference', url: 'https://www.addgene.org/mol-bio-reference/restriction-enzymes/' },
                { name: 'DNA Sequencing at 40', url: 'https://www.nature.com/articles/nature24286' },
                { name: 'Gel Art Lab', url: '#/gel-art-lab' },
              ].map(link => `
                <a href="${link.url}" ${link.url.startsWith('#') ? `data-route="${link.url}"` : 'target="_blank" rel="noopener"'} class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
                  <i data-lucide="external-link" class="w-4 h-4 flex-shrink-0"></i> ${link.name}
                </a>
              `).join('')}
            </div>
          </section>
        </main>
      `;
    },

    mount(container) {
      // Listen for progress updates
      const unsub = store.subscribe('progress', () => {
        // Update progress ring
        const pct = store.getOverallProgress();
        const circle = container.querySelector('#hero-progress-circle');
        if (circle) {
          circle.setAttribute('stroke-dashoffset', 264 - (pct / 100) * 264);
        }
        const pctEl = circle?.closest('.relative')?.querySelector('span');
        if (pctEl) pctEl.textContent = pct + '%';
      });

      container._homeUnsub = unsub;

      // Export Notes
      container.querySelector('#export-notes-btn')?.addEventListener('click', () => {
        const notes = JSON.parse(localStorage.getItem('htgaa-week2-notes') || '{}');
        const topicNames = { sequencing: 'DNA Sequencing', synthesis: 'DNA Synthesis', editing: 'Genome Editing', 'genetic-codes': 'Genetic Codes', 'gel-electrophoresis': 'Gel Electrophoresis', 'central-dogma': 'Central Dogma' };
        let text = '# HTGAA Week 2 — Study Notes\n# Exported: ' + new Date().toLocaleString() + '\n\n';
        let hasNotes = false;
        for (const [id, note] of Object.entries(notes)) {
          if (note && note.trim()) {
            hasNotes = true;
            text += `## ${topicNames[id] || id}\n\n${note.trim()}\n\n---\n\n`;
          }
        }
        if (!hasNotes) {
          text += '(No notes yet. Open a topic and click "My Notes" to start writing.)\n';
        }
        downloadFile('htgaa-week2-notes.txt', text);
      });

      // Export Progress
      container.querySelector('#export-progress-btn')?.addEventListener('click', () => {
        const progress = store.get('progress');
        const quizzes = store.get('quizzes') || {};
        const log = store.getStudyLog();
        const timeSpent = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
        const flashcards = store.get('flashcards') || {};
        const examScores = store.get('examScores') || [];

        let text = '# HTGAA Week 2 — Progress Report\n# Exported: ' + new Date().toLocaleString() + '\n\n';

        // Topics
        text += '## Topic Completion\n';
        for (const t of TOPICS) {
          text += `- [${progress[t.id] ? 'x' : ' '}] ${t.title}\n`;
        }

        // Quiz scores
        const qEntries = Object.entries(quizzes);
        const correct = qEntries.filter(([, v]) => v === true).length;
        text += `\n## Quiz Scores\nOverall: ${correct}/${qEntries.length} correct\n`;

        // Time spent per topic
        text += '\n## Time Spent\n';
        const topicNames = { sequencing: 'DNA Sequencing', synthesis: 'DNA Synthesis', editing: 'Genome Editing', 'genetic-codes': 'Genetic Codes', 'gel-electrophoresis': 'Gel Electrophoresis', 'central-dogma': 'Central Dogma' };
        let totalTime = 0;
        for (const [id, secs] of Object.entries(timeSpent)) {
          totalTime += secs;
          const mins = Math.floor(secs / 60);
          text += `- ${topicNames[id] || id}: ${mins}m ${secs % 60}s\n`;
        }
        text += `- Total: ${Math.floor(totalTime / 60)}m\n`;

        // Exam scores
        if (examScores.length > 0) {
          text += '\n## Exam History\n';
          for (const s of examScores) {
            text += `- ${new Date(s.date).toLocaleDateString()}: ${s.correct}/${s.total} (${Math.round(s.correct / s.total * 100)}%)\n`;
          }
        }

        // Study activity
        const activeDays = Object.entries(log).filter(([, v]) => v > 0).length;
        text += `\n## Study Activity\nActive days: ${activeDays}\n`;

        downloadFile('htgaa-week2-progress.txt', text);
      });

      // Reset Progress
      container.querySelector('#reset-progress-btn')?.addEventListener('click', () => {
        if (confirm('Reset all progress, quiz scores, and study activity? Your notes will be kept.')) {
          const notes = localStorage.getItem('htgaa-week2-notes');
          const keys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('htgaa-week2')) keys.push(key);
          }
          keys.forEach(k => localStorage.removeItem(k));
          if (notes) localStorage.setItem('htgaa-week2-notes', notes);
          window.location.hash = '#/';
          window.location.reload();
        }
      });
      // Check milestones
      checkMilestones();
    },

    unmount() {}
  };
}

function checkMilestones() {
  const MILESTONE_KEY = 'htgaa-week2-milestones-shown';
  let shown;
  try { shown = JSON.parse(localStorage.getItem(MILESTONE_KEY) || '{}'); } catch { shown = {}; }

  const progress = store.get('progress');
  const completedTopics = Object.keys(progress).filter(k => progress[k]).length;
  const quizzes = store.get('quizzes') || {};
  const quizTotal = Object.keys(quizzes).length;

  const milestones = [
    { id: 'first-topic', check: completedTopics >= 1, title: 'First Topic Done!', msg: 'You completed your first chapter. Keep going!' },
    { id: 'three-topics', check: completedTopics >= 3, title: 'Halfway There!', msg: '3 of 6 topics complete. You\'re doing great!' },
    { id: 'first-quiz', check: quizTotal >= 1, title: 'First Quiz Answer!', msg: 'You answered your first quiz question. Test your knowledge!' },
    { id: 'ten-quizzes', check: quizTotal >= 10, title: '10 Quiz Questions!', msg: 'You\'ve answered 10 quiz questions. Nice progress!' },
    { id: 'fifty-quizzes', check: quizTotal >= 50, title: '50 Questions!', msg: 'You\'ve tackled 50 quiz questions. Knowledge is growing!' },
  ];

  for (const m of milestones) {
    if (m.check && !shown[m.id]) {
      shown[m.id] = Date.now();
      localStorage.setItem(MILESTONE_KEY, JSON.stringify(shown));
      // Show toast after a brief delay
      setTimeout(() => {
        showMilestoneToast(m.title, m.msg);
      }, 500);
      break; // Only show one milestone per visit
    }
  }
}

function showMilestoneToast(title, message) {
  const toast = document.createElement('div');
  toast.className = 'milestone-toast';
  toast.innerHTML = `
    <div class="milestone-toast-inner">
      <span class="milestone-emoji">&#127881;</span>
      <div>
        <p class="font-bold text-sm">${title}</p>
        <p class="text-xs text-slate-500">${message}</p>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function renderAchievements() {
  const progress = store.get('progress');
  const quizzes = store.get('quizzes') || {};
  const fcData = store.get('flashcards') || { reviews: {} };
  const examScores = store.getExamScores();
  const log = store.getStudyLog();
  const timeSpent = (() => {
    try {
      const t = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
      return Object.values(t).reduce((s, v) => s + v, 0);
    } catch { return 0; }
  })();

  const completedTopics = Object.keys(progress).filter(k => progress[k]).length;
  const quizTotal = Object.keys(quizzes).length;
  const quizCorrect = Object.values(quizzes).filter(v => v === true).length;
  const fcReviewed = Object.keys(fcData.reviews).length;
  const activeDays = Object.values(log).filter(v => v > 0).length;
  const bestExam = store.getBestExamScore();

  // Compute streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);
  while (true) {
    const ds = cursor.toISOString().slice(0, 10);
    if ((log[ds] || 0) >= 1) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }

  const badges = [
    { id: 'first-topic', icon: '1', label: 'First Steps', desc: 'Complete your first topic', earned: completedTopics >= 1 },
    { id: 'three-topics', icon: '3', label: 'Halfway There', desc: 'Complete 3 topics', earned: completedTopics >= 3 },
    { id: 'all-topics', icon: '6', label: 'Scholar', desc: 'Complete all 6 topics', earned: completedTopics >= 6 },
    { id: 'quiz-10', icon: 'Q', label: 'Quiz Starter', desc: 'Answer 10 quiz questions', earned: quizTotal >= 10 },
    { id: 'quiz-50', icon: 'Q', label: 'Quiz Master', desc: 'Answer 50 quiz questions', earned: quizTotal >= 50 },
    { id: 'quiz-ace', icon: 'A', label: 'Perfect Score', desc: '90%+ on an exam', earned: bestExam && bestExam.pct >= 90 },
    { id: 'fc-10', icon: 'F', label: 'Flash Learner', desc: 'Review 10 flashcards', earned: fcReviewed >= 10 },
    { id: 'streak-3', icon: 'S', label: '3-Day Streak', desc: 'Study 3 days in a row', earned: streak >= 3 },
    { id: 'streak-7', icon: 'W', label: 'Week Warrior', desc: 'Study 7 days in a row', earned: streak >= 7 },
    { id: 'time-30', icon: 'T', label: 'Dedicated', desc: 'Study for 30+ minutes', earned: timeSpent >= 1800 },
    { id: 'time-120', icon: 'T', label: 'Deep Learner', desc: 'Study for 2+ hours', earned: timeSpent >= 7200 },
    { id: 'active-7', icon: 'D', label: 'Consistent', desc: 'Study on 7 different days', earned: activeDays >= 7 },
  ];

  const earnedCount = badges.filter(b => b.earned).length;
  if (earnedCount === 0 && completedTopics === 0) return ''; // Don't show if no progress at all

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="award" class="w-5 h-5 text-amber-500"></i> Achievements
        <span class="text-xs text-slate-400 font-normal ml-auto">${earnedCount}/${badges.length} earned</span>
      </h2>
      <div class="flex flex-wrap gap-3">
        ${badges.map(b => `
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl border ${b.earned ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-40'}" title="${b.desc}">
            <div class="w-8 h-8 rounded-full ${b.earned ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'} flex items-center justify-center text-xs font-bold">
              ${b.icon}
            </div>
            <div>
              <div class="text-xs font-bold ${b.earned ? '' : 'text-slate-400'}">${b.label}</div>
              <div class="text-[10px] text-slate-500">${b.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderBookmarks() {
  const bookmarks = store.getBookmarks();
  if (bookmarks.length === 0) return '';

  const topicNames = {};
  TOPICS.forEach(t => topicNames[t.id] = t.title);

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="bookmark" class="w-5 h-5 text-blue-500"></i> Bookmarked Sections
        <span class="text-xs text-slate-400 font-normal ml-auto">${bookmarks.length} saved</span>
      </h2>
      <div class="flex flex-wrap gap-2">
        ${bookmarks.map(b => `
          <a data-route="#/topic/${b.topicId}" class="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-sm cursor-pointer transition-colors group">
            <i data-lucide="bookmark" class="w-3.5 h-3.5 text-blue-500 fill-blue-500 flex-shrink-0"></i>
            <span class="text-slate-500 text-xs">${topicNames[b.topicId] || b.topicId}:</span>
            <span class="font-medium">${b.sectionTitle}</span>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

function renderContinueReading(progress) {
  // Find the most recently viewed topic from scroll positions
  try {
    const positions = JSON.parse(localStorage.getItem('htgaa-week2-scroll-pos') || '{}');
    const timeSpent = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');

    // Find most recent topic with saved position
    let latest = null;
    let latestTs = 0;
    for (const [topicId, data] of Object.entries(positions)) {
      if (data.ts > latestTs && !progress[topicId]) {
        latest = topicId;
        latestTs = data.ts;
      }
    }

    if (!latest) return '';

    const topic = TOPICS.find(t => t.id === latest);
    if (!topic) return '';

    const sectionCounts = { 'sequencing': 7, 'synthesis': 7, 'editing': 7, 'genetic-codes': 6, 'gel-electrophoresis': 6, 'central-dogma': 7 };
    const sectionsRead = store.getSectionsRead(latest).length;
    const totalSections = sectionCounts[latest] || 6;
    const spent = timeSpent[latest] || 0;
    const spentMin = Math.floor(spent / 60);

    // How long ago
    const ago = Date.now() - latestTs;
    const agoStr = ago < 3600000 ? 'just now' : ago < 86400000 ? `${Math.floor(ago / 3600000)}h ago` : `${Math.floor(ago / 86400000)}d ago`;

    return `
      <section class="mb-6">
        <a data-route="#/topic/${latest}" class="block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5 cursor-pointer hover:border-blue-400 transition-all hover:shadow-md group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-${topic.color}-100 dark:bg-${topic.color}-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <i data-lucide="${topic.icon}" class="w-6 h-6 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-blue-500 font-medium mb-0.5">Continue Reading</p>
              <p class="font-bold text-lg text-slate-800 dark:text-white">${topic.title}</p>
              <div class="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>${sectionsRead}/${totalSections} sections read</span>
                ${spentMin > 0 ? `<span>${spentMin}m studied</span>` : ''}
                <span>Last viewed ${agoStr}</span>
              </div>
            </div>
            <i data-lucide="arrow-right" class="w-6 h-6 text-blue-400 flex-shrink-0 group-hover:translate-x-1 transition-transform"></i>
          </div>
        </a>
      </section>
    `;
  } catch { return ''; }
}

function renderReviewReminder() {
  const fcData = store.get('flashcards') || { reviews: {} };
  const reviews = fcData.reviews || {};
  const now = Date.now();

  // Count due reviews
  let dueCount = 0;
  Object.values(reviews).forEach(r => {
    if (r.nextReview && r.nextReview <= now) dueCount++;
  });

  if (dueCount === 0) return '';

  return `
    <section class="mb-6">
      <a data-route="#/flashcards" class="block bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-800 p-4 cursor-pointer hover:border-violet-400 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
            <i data-lucide="brain" class="w-5 h-5 text-violet-600 dark:text-violet-400"></i>
          </div>
          <div class="flex-1">
            <p class="font-bold text-violet-800 dark:text-violet-300">${dueCount} flashcard${dueCount > 1 ? 's' : ''} due for review</p>
            <p class="text-xs text-violet-600 dark:text-violet-400">Spaced repetition works best when reviews are done on time. Click to start.</p>
          </div>
          <i data-lucide="arrow-right" class="w-5 h-5 text-violet-400 flex-shrink-0"></i>
        </div>
      </a>
    </section>
  `;
}

function renderAllCompleteCelebration() {
  let totalTime = 0;
  try {
    const t = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
    totalTime = Object.values(t).reduce((sum, s) => sum + s, 0);
  } catch {}
  const hrs = Math.floor(totalTime / 3600);
  const mins = Math.floor((totalTime % 3600) / 60);
  const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  let totalCorrect = 0, totalAnswered = 0;
  TOPICS.forEach(t => {
    const s = store.getQuizScore(t.id);
    if (s) { totalCorrect += s.correct; totalAnswered += s.total; }
  });
  const quizPct = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0;

  const bestExam = store.getBestExamScore();

  return `
    <section class="mb-8 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/15 dark:to-orange-900/20 rounded-2xl border-2 border-amber-300 dark:border-amber-700 p-6 text-center">
      <div class="text-4xl mb-3">&#127942;</div>
      <h2 class="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mb-2">Week 2 Complete!</h2>
      <p class="text-slate-600 dark:text-slate-400 mb-4 max-w-lg mx-auto">
        You've mastered all 6 chapters of DNA Read, Write & Edit. Outstanding work!
      </p>
      <div class="grid grid-cols-3 gap-4 max-w-md mx-auto mb-4">
        <div>
          <div class="text-xl font-bold text-blue-600 dark:text-blue-400">${timeStr}</div>
          <div class="text-xs text-slate-500">Studied</div>
        </div>
        <div>
          <div class="text-xl font-bold text-green-600 dark:text-green-400">${quizPct}%</div>
          <div class="text-xs text-slate-500">Quiz Accuracy</div>
        </div>
        <div>
          <div class="text-xl font-bold text-purple-600 dark:text-purple-400">${bestExam ? bestExam.pct + '%' : '—'}</div>
          <div class="text-xs text-slate-500">Best Exam</div>
        </div>
      </div>
      <div class="flex justify-center gap-3">
        <a data-route="#/exam" class="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 cursor-pointer transition-colors text-sm">Take Final Exam</a>
        <a data-route="#/flashcards" class="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer transition-colors text-sm">Review Flashcards</a>
      </div>
    </section>
  `;
}

function renderStatsDashboard(progress) {
  // Calculate total time studied
  let totalTime = 0;
  try {
    const t = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
    totalTime = Object.values(t).reduce((sum, s) => sum + s, 0);
  } catch {}

  const formatTime = (secs) => {
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  // Quiz stats
  let totalQuizCorrect = 0, totalQuizAnswered = 0;
  TOPICS.forEach(t => {
    const score = store.getQuizScore(t.id);
    if (score) {
      totalQuizCorrect += score.correct;
      totalQuizAnswered += score.total;
    }
  });

  // Section coverage
  let totalSectionsRead = 0, totalSections = 0;
  const sectionCounts = { 'sequencing': 7, 'synthesis': 7, 'editing': 7, 'genetic-codes': 6, 'gel-electrophoresis': 6, 'central-dogma': 7 };
  TOPICS.forEach(t => {
    totalSectionsRead += store.getSectionsRead(t.id).length;
    totalSections += sectionCounts[t.id] || 6;
  });

  // Flashcard stats
  const fcStats = store.getFlashcardStats();

  // Best exam
  const bestExam = store.getBestExamScore();

  // Study streak
  const studyLog = store.getStudyLog();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  const d = new Date();
  while (true) {
    const dateStr = d.toISOString().slice(0, 10);
    if (studyLog[dateStr]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }

  // Only show if there's any activity
  if (totalTime === 0 && totalQuizAnswered === 0 && fcStats.totalReviews === 0) return '';

  return `
    <section class="mb-8">
      <h2 class="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
        <i data-lucide="bar-chart-3" class="w-5 h-5 text-emerald-500"></i> Your Stats
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${formatTime(totalTime)}</div>
          <div class="text-xs text-slate-500 mt-1">Total Study Time</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">${totalQuizAnswered > 0 ? Math.round(totalQuizCorrect / totalQuizAnswered * 100) + '%' : '—'}</div>
          <div class="text-xs text-slate-500 mt-1">Quiz Accuracy</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${totalSectionsRead}/${totalSections}</div>
          <div class="text-xs text-slate-500 mt-1">Sections Read</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div class="text-2xl font-bold text-violet-600 dark:text-violet-400">${fcStats.totalReviews}</div>
          <div class="text-xs text-slate-500 mt-1">Flashcard Reviews</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">${bestExam ? bestExam.pct + '%' : '—'}</div>
          <div class="text-xs text-slate-500 mt-1">Best Exam Score</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">${streak > 0 ? streak + 'd' : '—'}</div>
          <div class="text-xs text-slate-500 mt-1">Study Streak</div>
        </div>
      </div>
    </section>
  `;
}

function renderStudyPlan(progress) {
  const tasks = [];
  const completedTopics = Object.keys(progress).filter(k => progress[k]);
  const incompleteTopics = TOPICS.filter(t => !progress[t.id]);

  // Recommended learning order
  const learningOrder = ['central-dogma', 'genetic-codes', 'gel-electrophoresis', 'sequencing', 'synthesis', 'editing'];

  // 1. Next topic to read (based on learning order)
  const nextTopic = learningOrder.find(id => !progress[id]);
  if (nextTopic) {
    const topic = TOPICS.find(t => t.id === nextTopic);
    tasks.push({
      icon: 'book-open',
      color: 'blue',
      title: `Read: ${topic.title}`,
      desc: completedTopics.length === 0 ? 'Start your learning journey' : `Topic ${completedTopics.length + 1} of 6`,
      route: `#/topic/${nextTopic}`,
      priority: 'high'
    });
  }

  // 2. Flashcards due
  const fcData = store.get('flashcards') || { reviews: {} };
  const now = Date.now();
  const dueCount = Object.values(fcData.reviews).filter(r => r.nextReview <= now).length;
  if (dueCount > 0) {
    tasks.push({
      icon: 'layers',
      color: 'violet',
      title: `Review ${dueCount} flashcard${dueCount > 1 ? 's' : ''}`,
      desc: 'Spaced repetition cards due today',
      route: '#/flashcards',
      priority: 'high'
    });
  }

  // 3. Topics with low quiz scores (below 70%)
  for (const t of TOPICS) {
    const score = store.getQuizScore(t.id);
    if (score && score.total >= 3 && (score.correct / score.total) < 0.7) {
      tasks.push({
        icon: 'refresh-cw',
        color: 'amber',
        title: `Retry: ${t.title} Quiz`,
        desc: `${score.correct}/${score.total} correct — aim for 70%+`,
        route: `#/topic/${t.id}`,
        priority: 'medium'
      });
    }
  }

  // 4. Homework check
  const hwChecks = store.get('homeworkChecks') || {};
  const hwDone = Object.values(hwChecks).filter(Boolean).length;
  if (hwDone < 37 && completedTopics.length >= 2) {
    tasks.push({
      icon: 'clipboard-list',
      color: 'orange',
      title: 'Work on Homework',
      desc: `${hwDone}/37 steps done`,
      route: '#/homework',
      priority: 'medium'
    });
  }

  // 5. Take an exam if all topics done
  if (completedTopics.length === 6) {
    const best = store.getBestExamScore();
    tasks.push({
      icon: 'trophy',
      color: 'amber',
      title: best ? 'Beat Your Best Exam Score' : 'Take Practice Exam',
      desc: best ? `Current best: ${best.pct}%` : 'Test yourself across all topics',
      route: '#/exam',
      priority: 'medium'
    });
  }

  // 6. Concept map exploration if started but not completed all
  if (completedTopics.length >= 1 && completedTopics.length < 6) {
    tasks.push({
      icon: 'git-branch',
      color: 'cyan',
      title: 'Explore Concept Map',
      desc: 'See how topics connect to each other',
      route: '#/concept-map',
      priority: 'low'
    });
  }

  if (tasks.length === 0) {
    return ''; // Nothing to recommend (unlikely)
  }

  // Show top 3 tasks
  const topTasks = tasks.slice(0, 3);

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="target" class="w-5 h-5 text-rose-500"></i> Today's Study Plan
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${topTasks.map((task, i) => `
          <a data-route="${task.route}" class="group block bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-${task.color}-400 cursor-pointer transition-all hover:shadow-md">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-${task.color}-100 dark:bg-${task.color}-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <i data-lucide="${task.icon}" class="w-5 h-5 text-${task.color}-500"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  ${i === 0 ? '<span class="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">Next Up</span>' : ''}
                </div>
                <h3 class="font-bold text-sm">${task.title}</h3>
                <p class="text-xs text-slate-500 mt-0.5">${task.desc}</p>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

function renderStudyHeatmap() {
  const log = store.getStudyLog();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build 12 weeks of data (84 days)
  // Grid: 7 rows (Mon-Sun), 12 columns (weeks, newest on right)
  // Start from 83 days ago, aligned to Monday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 83);
  // Align to Monday (getDay(): 0=Sun,1=Mon...6=Sat)
  const dayOfWeek = startDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(startDate.getDate() + mondayOffset);

  // Build the grid: weeks as columns, days as rows
  const weeks = [];
  const cursor = new Date(startDate);
  for (let w = 0; w < 12; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const count = log[dateStr] || 0;
      const isFuture = cursor > today;
      week.push({ dateStr, count, isFuture });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Compute streak (consecutive days ending at today with count >= 1)
  let streak = 0;
  const streakCursor = new Date(today);
  while (true) {
    const ds = streakCursor.toISOString().slice(0, 10);
    if ((log[ds] || 0) >= 1) {
      streak++;
      streakCursor.setDate(streakCursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Total sessions
  const totalSessions = Object.values(log).reduce((s, v) => s + v, 0);
  const activeDays = Object.values(log).filter(v => v > 0).length;

  // Color function
  function cellColor(count, isFuture) {
    if (isFuture) return 'bg-slate-100 dark:bg-slate-800/50';
    if (count === 0) return 'bg-slate-200 dark:bg-slate-700';
    if (count <= 3) return 'bg-green-300 dark:bg-green-800';
    if (count <= 7) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-700 dark:bg-green-400';
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
        <i data-lucide="calendar-days" class="w-5 h-5 text-green-500"></i> Study Activity
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <!-- Stats row -->
        <div class="flex items-center gap-6 mb-4 text-sm">
          <div class="flex items-center gap-2">
            <i data-lucide="flame" class="w-4 h-4 text-orange-500"></i>
            <span class="font-bold text-lg ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}">${streak}</span>
            <span class="text-slate-500 dark:text-slate-400">day streak</span>
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="activity" class="w-4 h-4 text-green-500"></i>
            <span class="font-bold text-lg text-green-600 dark:text-green-400">${totalSessions}</span>
            <span class="text-slate-500 dark:text-slate-400">sessions</span>
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="calendar-check" class="w-4 h-4 text-blue-500"></i>
            <span class="font-bold text-lg text-blue-600 dark:text-blue-400">${activeDays}</span>
            <span class="text-slate-500 dark:text-slate-400">active days</span>
          </div>
        </div>
        <!-- Heatmap grid -->
        <div class="flex gap-1 items-start overflow-x-auto">
          <!-- Day labels column -->
          <div class="flex flex-col gap-1 mr-1 flex-shrink-0">
            ${dayLabels.map(label => `<div class="w-4 h-4 text-[10px] text-slate-400 flex items-center justify-center">${label}</div>`).join('')}
          </div>
          <!-- Week columns -->
          ${weeks.map(week => `
            <div class="flex flex-col gap-1">
              ${week.map(day => `<div class="w-4 h-4 rounded-sm ${cellColor(day.count, day.isFuture)} transition-colors" title="${day.dateStr}: ${day.count} session${day.count !== 1 ? 's' : ''}"></div>`).join('')}
            </div>
          `).join('')}
        </div>
        <!-- Legend -->
        <div class="flex items-center gap-2 mt-3 text-[10px] text-slate-400">
          <span>Less</span>
          <div class="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
          <div class="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800"></div>
          <div class="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
          <div class="w-3 h-3 rounded-sm bg-green-700 dark:bg-green-400"></div>
          <span>More</span>
        </div>
      </div>
    </section>
  `;
}

function renderLearningPath(progress) {
  // Define the learning path: two rows of 3, with recommended order
  // Row 1: Central Dogma -> Genetic Codes -> Gel Electrophoresis
  // Row 2: DNA Sequencing -> DNA Synthesis -> Gene Editing
  const pathOrder = [
    { id: 'central-dogma', tagline: 'The Foundations', time: 35 },
    { id: 'genetic-codes', tagline: 'Life\'s Language', time: 28 },
    { id: 'gel-electrophoresis', tagline: 'Seeing DNA', time: 28 },
    { id: 'sequencing', tagline: 'Reading DNA', time: 35 },
    { id: 'synthesis', tagline: 'Writing DNA', time: 35 },
    { id: 'editing', tagline: 'Editing Genomes', time: 35 },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-300 dark:ring-blue-700', glow: 'shadow-blue-200 dark:shadow-blue-900/50' },
    green: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-300 dark:ring-green-700', glow: 'shadow-green-200 dark:shadow-green-900/50' },
    red: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400', ring: 'ring-red-300 dark:ring-red-700', glow: 'shadow-red-200 dark:shadow-red-900/50' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-300 dark:ring-purple-700', glow: 'shadow-purple-200 dark:shadow-purple-900/50' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-600 dark:text-yellow-400', ring: 'ring-yellow-300 dark:ring-yellow-700', glow: 'shadow-yellow-200 dark:shadow-yellow-900/50' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-300 dark:ring-indigo-700', glow: 'shadow-indigo-200 dark:shadow-indigo-900/50' },
  };

  function renderNode(pathItem, index) {
    const topic = TOPICS.find(t => t.id === pathItem.id);
    if (!topic) return '';
    const isComplete = progress[topic.id];
    const c = colorMap[topic.color] || colorMap.blue;
    const stepNum = index + 1;

    return `
      <a data-route="#/topic/${topic.id}" class="lp-node topic-card group block bg-white dark:bg-slate-800 rounded-xl p-4 border-2 ${isComplete ? 'border-green-400 dark:border-green-600 shadow-md shadow-green-100 dark:shadow-green-900/30' : 'border-slate-200 dark:border-slate-700'} hover:border-${topic.color}-400 cursor-pointer transition-all relative">
        <!-- Step number badge -->
        <div class="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full ${isComplete ? 'bg-green-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} text-white text-xs font-bold flex items-center justify-center shadow-sm z-10">
          ${isComplete ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : stepNum}
        </div>
        <!-- Icon -->
        <div class="w-12 h-12 mx-auto rounded-xl ${c.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform relative">
          <i data-lucide="${topic.icon}" class="w-6 h-6 ${c.text}"></i>
        </div>
        <!-- Title -->
        <p class="font-bold text-sm text-center leading-tight">${topic.title}</p>
        <!-- Tagline -->
        <p class="text-xs text-center ${isComplete ? 'text-green-500 dark:text-green-400 font-medium' : 'text-slate-400 dark:text-slate-500'} mt-1">${isComplete ? 'Completed' : pathItem.tagline}</p>
        <!-- Time -->
        <div class="flex items-center justify-center gap-1 mt-2 text-xs text-slate-400">
          <i data-lucide="clock" class="w-3 h-3"></i>
          <span>${pathItem.time} min</span>
        </div>
      </a>
    `;
  }

  // Check completion for arrow coloring
  function arrowClasses(fromIdx) {
    const fromComplete = progress[pathOrder[fromIdx].id];
    const toComplete = progress[pathOrder[fromIdx + 1]?.id];
    if (fromComplete && toComplete) return 'lp-arrow--done';
    if (fromComplete) return 'lp-arrow--next';
    return 'lp-arrow--pending';
  }

  // Vertical arrow between row 1 last item and row 2 first item
  function verticalArrowClasses() {
    const fromComplete = progress[pathOrder[2].id]; // gel-electrophoresis
    const toComplete = progress[pathOrder[3].id];   // sequencing
    if (fromComplete && toComplete) return 'lp-arrow--done';
    if (fromComplete) return 'lp-arrow--next';
    return 'lp-arrow--pending';
  }

  const row1 = pathOrder.slice(0, 3);
  const row2 = pathOrder.slice(3, 6);

  return `
    <div class="lp-container">
      <!-- Row 1 -->
      <div class="lp-row">
        ${row1.map((item, i) => {
          const node = renderNode(item, i);
          if (i < 2) {
            return node + `<div class="lp-arrow ${arrowClasses(i)}"><svg width="40" height="20" viewBox="0 0 40 20" fill="none"><path d="M0 10 L30 10" stroke="currentColor" stroke-width="2" stroke-dasharray="var(--lp-dash)"/><path d="M26 5 L34 10 L26 15" stroke="currentColor" stroke-width="2" fill="none"/></svg></div>`;
          }
          return node;
        }).join('')}
      </div>

      <!-- Vertical connector: row 1 -> row 2 -->
      <div class="lp-vertical-connector ${verticalArrowClasses()}">
        <svg width="20" height="40" viewBox="0 0 20 40" fill="none"><path d="M10 0 L10 30" stroke="currentColor" stroke-width="2" stroke-dasharray="var(--lp-dash)"/><path d="M5 26 L10 34 L15 26" stroke="currentColor" stroke-width="2" fill="none"/></svg>
      </div>

      <!-- Row 2 -->
      <div class="lp-row">
        ${row2.map((item, i) => {
          const node = renderNode(item, i + 3);
          if (i < 2) {
            return node + `<div class="lp-arrow ${arrowClasses(i + 3)}"><svg width="40" height="20" viewBox="0 0 40 20" fill="none"><path d="M0 10 L30 10" stroke="currentColor" stroke-width="2" stroke-dasharray="var(--lp-dash)"/><path d="M26 5 L34 10 L26 15" stroke="currentColor" stroke-width="2" fill="none"/></svg></div>`;
          }
          return node;
        }).join('')}
      </div>
    </div>
  `;
}

function renderTopicCard(topic, index, progress) {
  const isComplete = progress[topic.id];
  const quizScore = store.getQuizScore(topic.id);
  const descriptions = {
    'sequencing': 'Sanger to nanopore: how we read DNA. Illumina SBS, PacBio SMRT, Oxford Nanopore, and spatial omics.',
    'synthesis': 'Writing DNA: phosphoramidite chemistry, chip-based synthesis, Gibson assembly, and error correction.',
    'editing': 'CRISPR-Cas9, base editors, prime editors, MAGE, PASTE, and genomically recoded organisms.',
    'genetic-codes': 'The standard genetic code, expanded alphabets, non-standard amino acids, and codon optimization.',
    'gel-electrophoresis': 'Restriction enzymes, gel art protocol, DNA ladders, and interactive gel simulation.',
    'central-dogma': 'Expression cassettes, codon optimization, reverse translation, and metabolic engineering.',
  };
  const readingTimes = {
    'sequencing': 35, 'synthesis': 35, 'editing': 35,
    'genetic-codes': 28, 'gel-electrophoresis': 28, 'central-dogma': 35,
  };
  const sectionCounts = {
    'sequencing': 7, 'synthesis': 7, 'editing': 7,
    'genetic-codes': 6, 'gel-electrophoresis': 6, 'central-dogma': 7,
  };
  const totalSections = sectionCounts[topic.id] || 6;
  const sectionsRead = store.getSectionsRead(topic.id).length;
  const sectionPct = Math.round((sectionsRead / totalSections) * 100);

  return `
    <a data-route="#/topic/${topic.id}" class="topic-card group block bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-${topic.color}-400 dark:hover:border-${topic.color}-500 cursor-pointer transition-all">
      <div class="flex items-start gap-4">
        <div class="relative w-12 h-12 flex-shrink-0 group-hover:scale-110 transition-transform">
          ${sectionPct > 0 ? `
          <svg class="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="3"/>
            <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" class="text-${topic.color}-500" stroke-width="3" stroke-linecap="round"
              stroke-dasharray="${2 * Math.PI * 21}" stroke-dashoffset="${2 * Math.PI * 21 * (1 - sectionPct / 100)}"
              style="transition: stroke-dashoffset 0.6s ease"/>
          </svg>` : ''}
          <div class="w-12 h-12 rounded-xl ${sectionPct > 0 ? '' : `bg-${topic.color}-100 dark:bg-${topic.color}-900/40`} flex items-center justify-center">
            <i data-lucide="${topic.icon}" class="w-6 h-6 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-bold text-lg">${topic.title}</h3>
            ${isComplete
              ? '<span class="flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full"><i data-lucide="check" class="w-3 h-3"></i>Done</span>'
              : `<span class="text-xs text-slate-400">Ch. ${index + 1}</span>`
            }
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">${descriptions[topic.id] || ''}</p>
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${readingTimes[topic.id] || 30} min</span>
            ${quizScore ? `<span>Quiz: ${quizScore.correct}/${quizScore.total}</span>` : ''}
            ${sectionsRead > 0 ? `<span class="flex items-center gap-1"><i data-lucide="book-open" class="w-3 h-3"></i> ${sectionsRead}/${totalSections} read</span>` : ''}
            ${sectionsRead === 0 ? `<span class="flex items-center gap-1"><i data-lucide="arrow-right" class="w-3 h-3"></i> Start reading</span>` : ''}
          </div>
          ${sectionsRead > 0 && !isComplete ? `
            <div class="mt-2 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div class="h-full rounded-full bg-${topic.color}-400 transition-all" style="width: ${sectionPct}%"></div>
            </div>
          ` : ''}
        </div>
      </div>
    </a>
  `;
}

function renderLecturer(name, title, topics) {
  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
      <h3 class="font-bold">${name}</h3>
      <p class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">${title}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">${topics}</p>
    </div>
  `;
}

function renderStatCard(icon, label, value, color) {
  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
      <i data-lucide="${icon}" class="w-6 h-6 text-${color}-500 mx-auto mb-2"></i>
      <div class="text-2xl font-bold text-${color}-600 dark:text-${color}-400">${value}</div>
      <div class="text-xs text-slate-500 mt-1">${label}</div>
    </div>
  `;
}

function getQuizStats() {
  const quizzes = store.get('quizzes') || {};
  const entries = Object.entries(quizzes);
  if (entries.length === 0) return '0/0';
  const correct = entries.filter(([, v]) => v === true).length;
  return `${correct}/${entries.length}`;
}

function getHWStats() {
  const checks = store.get('homeworkChecks') || {};
  const done = Object.values(checks).filter(Boolean).length;
  return `${done}/37`;
}

function getFlashcardStats() {
  const fc = store.get('flashcards') || { reviews: {} };
  const reviewed = Object.keys(fc.reviews || {}).length;
  return reviewed > 0 ? `${reviewed}` : '0';
}

function getTimeStudied() {
  try {
    const t = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
    const total = Object.values(t).reduce((s, v) => s + v, 0);
    if (total < 60) return `${total}s`;
    const mins = Math.floor(total / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  } catch { return '0m'; }
}

function downloadFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export { createHomeView };
