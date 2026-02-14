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
                  <span class="flex items-center gap-1"><i data-lucide="help-circle" class="w-4 h-4"></i> 80 Questions</span>
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
          <!-- Learning Path -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="route" class="w-5 h-5 text-blue-500"></i> Learning Path
            </h2>
            <div class="relative">
              <!-- Connection line -->
              <div class="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0"></div>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
                ${TOPICS.map((topic, i) => {
                  const isComplete = progress[topic.id];
                  const colorMap = {
                    blue: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700', hover: 'hover:border-blue-400' },
                    green: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400', border: 'border-green-300 dark:border-green-700', hover: 'hover:border-green-400' },
                    red: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400', border: 'border-red-300 dark:border-red-700', hover: 'hover:border-red-400' },
                    purple: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700', hover: 'hover:border-purple-400' },
                    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-700', hover: 'hover:border-yellow-400' },
                    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-300 dark:border-indigo-700', hover: 'hover:border-indigo-400' },
                  };
                  const c = colorMap[topic.color] || colorMap.blue;
                  return `
                    <a data-route="#/topic/${topic.id}" class="topic-card block bg-white dark:bg-slate-800 rounded-xl p-4 border-2 ${isComplete ? 'border-green-400 dark:border-green-600' : c.border} ${c.hover} cursor-pointer text-center transition-all">
                      <div class="w-10 h-10 mx-auto rounded-xl ${c.bg} flex items-center justify-center mb-2 relative">
                        <i data-lucide="${topic.icon}" class="w-5 h-5 ${c.text}"></i>
                        ${isComplete ? '<div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><i data-lucide="check" class="w-3 h-3 text-white"></i></div>' : ''}
                      </div>
                      <p class="font-semibold text-sm">${topic.title}</p>
                      <p class="text-xs text-slate-400 mt-1">Ch. ${i + 1}</p>
                    </a>
                  `;
                }).join('')}
              </div>
            </div>
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
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              ${renderStatCard('trophy', 'Topics Done', `${Object.values(progress).filter(Boolean).length}/6`, 'amber')}
              ${renderStatCard('help-circle', 'Quiz Score', getQuizStats(), 'blue')}
              ${renderStatCard('check-square', 'HW Steps', getHWStats(), 'green')}
              ${renderStatCard('brain', 'Flashcards', getFlashcardStats(), 'purple')}
            </div>
          </section>

          <!-- Study Activity Heatmap -->
          ${renderStudyHeatmap()}

          <!-- Quick Actions -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="zap" class="w-5 h-5 text-yellow-500"></i> Study Tools
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
    },

    unmount() {}
  };
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

  return `
    <a data-route="#/topic/${topic.id}" class="topic-card group block bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-${topic.color}-400 dark:hover:border-${topic.color}-500 cursor-pointer transition-all">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-${topic.color}-100 dark:bg-${topic.color}-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <i data-lucide="${topic.icon}" class="w-6 h-6 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
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
            <span class="flex items-center gap-1"><i data-lucide="arrow-right" class="w-3 h-3"></i> Start reading</span>
          </div>
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

export { createHomeView };
