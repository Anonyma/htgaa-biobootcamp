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
                  <span id="hero-question-count" class="flex items-center gap-1"><i data-lucide="help-circle" class="w-4 h-4"></i> <span data-count>150+</span> Questions</span>
                  <span class="flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> ~4 hrs</span>
                </div>
              </div>
              <div class="flex flex-col items-center">
                <div class="relative w-28 h-28" style="width:112px;height:112px">
                  <svg class="progress-ring w-28 h-28 -rotate-90" viewBox="0 0 100 100" style="width:112px;height:112px">
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

          <!-- Continue Reading (primary CTA) -->
          ${renderContinueReading(progress)}

          <!-- Today's Study Plan -->
          ${renderStudyPlan(progress)}

          <!-- Topic Cards (the core content) -->
          <section class="mb-10">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i data-lucide="layout-grid" class="w-5 h-5 text-indigo-500"></i> Topics
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              ${TOPICS.map((topic, i) => renderTopicCard(topic, i, progress)).join('')}
            </div>
          </section>

          <!-- Study Tools (compact row) -->
          <section class="mb-10">
            <div class="flex flex-wrap gap-3">
              <a data-route="#/flashcards" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-400 cursor-pointer transition-colors text-sm font-medium">
                <i data-lucide="layers" class="w-4 h-4 text-violet-500"></i> Flashcards
                ${(() => { const fc = store.getFlashcardStats(); return fc.due > 0 ? `<span class="text-xs text-red-500 font-bold">${fc.due} due</span>` : ''; })()}
              </a>
              <a data-route="#/homework" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-400 cursor-pointer transition-colors text-sm font-medium">
                <i data-lucide="clipboard-list" class="w-4 h-4 text-orange-500"></i> Homework
              </a>
              <a data-route="#/exam" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer transition-colors text-sm font-medium">
                <i data-lucide="trophy" class="w-4 h-4 text-amber-500"></i> Exam Mode
              </a>
              <a data-route="#/glossary" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-400 cursor-pointer transition-colors text-sm font-medium">
                <i data-lucide="book-a" class="w-4 h-4 text-emerald-500"></i> Glossary
              </a>
              <a data-route="#/concept-map" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-400 cursor-pointer transition-colors text-sm font-medium">
                <i data-lucide="git-branch" class="w-4 h-4 text-cyan-500"></i> Concept Map
              </a>
            </div>
          </section>

          <!-- Expandable analytics -->
          <div class="mb-10">
            <button id="show-more-dashboard" class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mx-auto">
              <i data-lucide="chevron-down" class="w-4 h-4"></i> Show analytics & more
            </button>
            <div id="more-dashboard-content" class="hidden mt-8 space-y-10">
              ${renderStatsDashboard(progress)}
              ${renderMasteryRanking()}
              ${renderExamHistoryChart()}

              <section>
                <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                  <i data-lucide="download" class="w-5 h-5 text-teal-500"></i> Export
                </h2>
                <div class="flex flex-wrap gap-3">
                  <button id="export-notes-btn" class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-400 transition-colors cursor-pointer text-sm">
                    <i data-lucide="file-text" class="w-4 h-4 text-teal-500"></i> Export Notes
                  </button>
                  <button id="export-progress-btn" class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer text-sm">
                    <i data-lucide="bar-chart" class="w-4 h-4 text-blue-500"></i> Export Progress
                  </button>
                  <button id="reset-progress-btn" class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-400 transition-colors cursor-pointer text-sm">
                    <i data-lucide="rotate-ccw" class="w-4 h-4 text-red-400"></i> Reset
                  </button>
                </div>
              </section>
            </div>
          </div>        </main>
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

      // "Show analytics & more" toggle
      const showMoreBtn = container.querySelector('#show-more-dashboard');
      const moreContent = container.querySelector('#more-dashboard-content');
      if (showMoreBtn && moreContent) {
        showMoreBtn.addEventListener('click', () => {
          const isHidden = moreContent.classList.contains('hidden');
          moreContent.classList.toggle('hidden');
          moreContent.style.display = isHidden ? 'block' : 'none';
          showMoreBtn.innerHTML = isHidden
            ? '<i data-lucide="chevron-up" class="w-4 h-4"></i> Hide analytics'
            : '<i data-lucide="chevron-down" class="w-4 h-4"></i> Show analytics & more';
          if (typeof lucide !== 'undefined') lucide.createIcons();
        });
      }

      // Dynamic question count + glossary count — load all topic data
      (async () => {
        let totalQ = 0;
        let totalVocab = 0;
        for (const topic of TOPICS) {
          try {
            const data = await store.loadTopicData(topic.id);
            if (data?.quizQuestions) totalQ += data.quizQuestions.length;
            if (data?.sections) {
              data.sections.forEach(s => { if (s.checkQuestion) totalQ++; });
            }
            if (data?.vocabulary) totalVocab += data.vocabulary.length;
          } catch {}
        }
        const countEl = container.querySelector('#hero-question-count [data-count]');
        if (countEl && totalQ > 0) countEl.textContent = totalQ;
        const glossaryEl = container.querySelector('#glossary-term-count');
        if (glossaryEl && totalVocab > 0) glossaryEl.textContent = `All ${totalVocab} terms searchable`;
      })();

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
      // Study goal setter
      container.querySelector('.study-goal-btn')?.addEventListener('click', (e) => {
        const current = parseInt(e.target.dataset.currentGoal) || 30;
        const goals = [15, 30, 45, 60, 90];
        const nextIdx = (goals.indexOf(current) + 1) % goals.length;
        const newGoal = goals[nextIdx];
        localStorage.setItem('htgaa-week2-daily-goal', newGoal);
        e.target.dataset.currentGoal = newGoal;
        // Update display
        const parent = e.target.closest('.flex.items-center');
        if (parent) {
          const label = parent.querySelector('.font-medium');
          if (label) {
            const todayTime = parseInt(label.textContent) || 0;
            label.textContent = `${todayTime}/${newGoal}m today`;
          }
        }
      });

      // What's New toggle
      const whatsNewToggle = container.querySelector('#whats-new-toggle');
      if (whatsNewToggle) {
        let expanded = false;
        whatsNewToggle.addEventListener('click', () => {
          expanded = !expanded;
          container.querySelectorAll('.changelog-item').forEach(el => {
            const idx = parseInt(el.dataset.changelogIdx);
            if (idx >= 3) el.classList.toggle('hidden', !expanded);
          });
          whatsNewToggle.innerHTML = expanded
            ? '<i data-lucide="chevron-up" class="w-3.5 h-3.5"></i> Show less'
            : '<i data-lucide="chevron-down" class="w-3.5 h-3.5"></i> Show all';
          if (window.lucide) lucide.createIcons();
        });
      }

      // Resolve struggling term names asynchronously
      (async () => {
        const fcData = store.get('flashcards') || { reviews: {} };
        const reviews = fcData.reviews || {};
        for (const [cardId, r] of Object.entries(reviews)) {
          if (r.lapses >= 3) {
            const match = cardId.match(/^(.+)-vocab-(\d+)$/);
            if (match) {
              const data = await store.loadTopicData(match[1]);
              if (data?.vocabulary?.[parseInt(match[2])]) {
                const elId = `struggling-term-${cardId.replace(/[^a-zA-Z0-9-]/g, '')}`;
                const el = container.querySelector(`#${elId}`);
                if (el) el.textContent = data.vocabulary[parseInt(match[2])].term;
              }
            }
          }
        }
      })();

      // Exam bookmark remove buttons
      container.querySelectorAll('.exam-bookmark-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.bmIdx);
          try {
            const bm = JSON.parse(localStorage.getItem('htgaa-exam-bookmarks') || '[]');
            bm.splice(idx, 1);
            localStorage.setItem('htgaa-exam-bookmarks', JSON.stringify(bm));
            btn.closest('.p-3')?.remove();
          } catch {}
        });
      });

      // Quick Quiz on home page
      initQuickQuiz(container);

      // Vocab of the Day
      initVocabDay(container);

      // Check milestones
      checkMilestones();
    },

    unmount() {}
  };
}

async function initQuickQuiz(container) {
  const qContainer = container.querySelector('#quick-quiz-container');
  const refreshBtn = container.querySelector('#quick-quiz-refresh');
  if (!qContainer) return;

  // Gather all quiz questions from all topics
  const allQuestions = [];
  for (const topic of TOPICS) {
    const data = await store.loadTopicData(topic.id);
    if (data?.quizQuestions) {
      data.quizQuestions.forEach(q => {
        if (q.options && q.correctIndex !== undefined) {
          allQuestions.push({ ...q, topicId: topic.id, topicTitle: topic.title, topicColor: topic.color });
        }
      });
    }
  }

  if (allQuestions.length === 0) {
    qContainer.innerHTML = '<p class="text-sm text-slate-400">No quiz questions available.</p>';
    return;
  }

  function showQuestion() {
    const q = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    const qId = `quick-${q.topicId}-${Date.now()}`;
    qContainer.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <span class="text-xs px-2 py-0.5 rounded-full bg-${q.topicColor}-100 dark:bg-${q.topicColor}-900/30 text-${q.topicColor}-600 dark:text-${q.topicColor}-400 font-medium">${q.topicTitle}</span>
      </div>
      <p class="font-semibold text-sm mb-4">${q.question}</p>
      <div class="space-y-2">
        ${q.options.map((opt, i) => `
          <button class="quick-quiz-opt w-full text-left px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors" data-idx="${i}" data-correct="${i === q.correctIndex}">
            <span class="font-medium text-slate-400 mr-2">${String.fromCharCode(65 + i)}.</span> ${opt}
          </button>
        `).join('')}
      </div>
      <div class="quick-quiz-feedback hidden mt-3 p-3 rounded-lg text-sm"></div>
    `;

    if (window.lucide) lucide.createIcons();

    const feedback = qContainer.querySelector('.quick-quiz-feedback');
    qContainer.querySelectorAll('.quick-quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        // Disable all buttons
        qContainer.querySelectorAll('.quick-quiz-opt').forEach(b => {
          b.disabled = true;
          b.classList.remove('hover:bg-blue-50', 'dark:hover:bg-blue-900/20', 'hover:border-blue-300');
          if (b.dataset.correct === 'true') {
            b.classList.add('bg-green-50', 'dark:bg-green-900/20', 'border-green-400', 'dark:border-green-700');
          }
          if (b === btn && !isCorrect) {
            b.classList.add('bg-red-50', 'dark:bg-red-900/20', 'border-red-400', 'dark:border-red-700');
          }
        });
        // Show feedback
        if (feedback) {
          feedback.classList.remove('hidden');
          if (isCorrect) {
            feedback.className = 'quick-quiz-feedback mt-3 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
            feedback.textContent = q.explanation || 'Correct!';
          } else {
            feedback.className = 'quick-quiz-feedback mt-3 p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
            feedback.textContent = q.explanation || `Incorrect. The answer is ${String.fromCharCode(65 + q.correctIndex)}.`;
          }
        }
        // Record in store
        store.markQuizAnswered(qId, isCorrect);
      });
    });
  }

  showQuestion();
  refreshBtn?.addEventListener('click', showQuestion);
}

async function initVocabDay(container) {
  const vContainer = container.querySelector('#vocab-day-container');
  const refreshBtn = container.querySelector('#vocab-day-refresh');
  if (!vContainer) return;

  const allTerms = [];
  for (const topic of TOPICS) {
    const data = await store.loadTopicData(topic.id);
    if (data?.vocabulary) {
      data.vocabulary.forEach(v => {
        allTerms.push({ ...v, topicId: topic.id, topicTitle: topic.title, topicColor: topic.color });
      });
    }
  }

  if (allTerms.length === 0) return;

  function showTerm() {
    const t = allTerms[Math.floor(Math.random() * allTerms.length)];
    vContainer.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xs px-2 py-0.5 rounded-full bg-${t.topicColor}-100 dark:bg-${t.topicColor}-900/30 text-${t.topicColor}-600 dark:text-${t.topicColor}-400 font-medium">${t.topicTitle}</span>
      </div>
      <p class="text-lg font-bold text-amber-900 dark:text-amber-200">${t.term}</p>
      <p class="text-sm text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">${t.definition}</p>
      <div class="mt-3 flex items-center gap-3">
        <button class="vocab-day-flip text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
          <i data-lucide="eye" class="w-3 h-3"></i> Can you define this term?
        </button>
        <a href="#/topic/${t.topicId}" class="text-xs text-blue-500 hover:underline ml-auto">Study this topic &rarr;</a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  showTerm();
  refreshBtn?.addEventListener('click', showTerm);
}

function checkMilestones() {
  const MILESTONE_KEY = 'htgaa-week2-milestones-shown';
  let shown;
  try { shown = JSON.parse(localStorage.getItem(MILESTONE_KEY) || '{}'); } catch { shown = {}; }

  const progress = store.get('progress');
  const completedTopics = Object.keys(progress).filter(k => progress[k]).length;
  const quizzes = store.get('quizzes') || {};
  const quizTotal = Object.keys(quizzes).length;

  // Section reading progress
  let totalSectionsRead = 0;
  TOPICS.forEach(t => { totalSectionsRead += store.getSectionsRead(t.id).length; });

  // Flashcard reviews
  const fcStats = store.getFlashcardStats();

  // Quiz accuracy
  let quizCorrect = 0;
  Object.values(quizzes).forEach(v => { if (v) quizCorrect++; });
  const quizAccuracy = quizTotal > 0 ? Math.round(quizCorrect / quizTotal * 100) : 0;

  // Best exam
  const bestExam = store.getBestExamScore();

  const milestones = [
    { id: 'first-topic', check: completedTopics >= 1, title: 'First Topic Done!', msg: 'You completed your first chapter. Keep going!' },
    { id: 'three-topics', check: completedTopics >= 3, title: 'Halfway There!', msg: '3 of 6 topics complete. You\'re doing great!' },
    { id: 'all-topics', check: completedTopics >= 6, title: 'All Topics Complete!', msg: 'You\'ve mastered all 6 chapters. Amazing work!' },
    { id: 'first-quiz', check: quizTotal >= 1, title: 'First Quiz Answer!', msg: 'You answered your first quiz question. Test your knowledge!' },
    { id: 'ten-quizzes', check: quizTotal >= 10, title: '10 Quiz Questions!', msg: 'You\'ve answered 10 quiz questions. Nice progress!' },
    { id: 'fifty-quizzes', check: quizTotal >= 50, title: '50 Questions!', msg: 'You\'ve tackled 50 quiz questions. Knowledge is growing!' },
    { id: 'quiz-master', check: quizTotal >= 20 && quizAccuracy >= 90, title: 'Quiz Master!', msg: '90%+ accuracy across 20+ questions. Brilliant!' },
    { id: 'ten-sections', check: totalSectionsRead >= 10, title: '10 Sections Read!', msg: 'You\'ve read through 10 sections. Deep learning in progress!' },
    { id: 'twenty-sections', check: totalSectionsRead >= 20, title: '20 Sections Read!', msg: 'You\'ve read 20 sections. You\'re becoming an expert!' },
    { id: 'all-sections', check: totalSectionsRead >= 38, title: 'All Sections Read!', msg: 'Every single section read. You know this material inside out!' },
    { id: 'first-flashcard', check: fcStats.totalReviews >= 1, title: 'First Flashcard!', msg: 'You started spaced repetition. Great study strategy!' },
    { id: 'twenty-flashcards', check: fcStats.totalReviews >= 20, title: '20 Flashcard Reviews!', msg: 'Consistent repetition builds lasting memory!' },
    { id: 'first-exam', check: !!bestExam, title: 'First Exam Taken!', msg: 'You completed a practice exam. Review your results!' },
    { id: 'exam-ace', check: bestExam && bestExam.pct >= 90, title: 'Exam Ace!', msg: '90%+ on a practice exam. You\'re ready for class!' },
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

function renderExamBookmarks() {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('htgaa-exam-bookmarks') || '[]');
    if (bookmarks.length === 0) return '';
    return `
    <section class="mb-8">
      <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
        <i data-lucide="bookmark" class="w-5 h-5 text-amber-500"></i> Saved Questions
        <span class="text-xs text-slate-400 font-normal">${bookmarks.length} saved</span>
      </h2>
      <div class="space-y-2">
        ${bookmarks.slice(0, 8).map((b, i) => `
          <div class="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-xs text-slate-400 mb-1">${b.topic}</p>
                <p class="font-medium text-slate-700 dark:text-slate-300 text-sm">${b.question}</p>
                <p class="text-xs text-green-600 dark:text-green-400 mt-1">Answer: ${b.correctAnswer}</p>
                ${b.explanation ? `<p class="text-xs text-slate-400 mt-0.5">${b.explanation}</p>` : ''}
              </div>
              <button class="exam-bookmark-remove text-slate-300 hover:text-red-400 transition-colors flex-shrink-0" data-bm-idx="${i}" title="Remove">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `).join('')}
        ${bookmarks.length > 8 ? `<p class="text-xs text-slate-400 text-center">+ ${bookmarks.length - 8} more saved questions</p>` : ''}
      </div>
    </section>`;
  } catch { return ''; }
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

function renderWeakestTopicSuggestion(progress) {
  // Find the topic with the lowest combined score (quiz accuracy + section completion)
  const sectionCounts = { 'sequencing': 7, 'synthesis': 7, 'editing': 7, 'genetic-codes': 6, 'gel-electrophoresis': 6, 'central-dogma': 7 };
  let hasAnyActivity = false;
  const scores = TOPICS.map(topic => {
    const quiz = store.getQuizScore(topic.id);
    const sr = store.getSectionsRead(topic.id).length;
    const st = sectionCounts[topic.id] || 6;
    const quizPct = quiz ? (quiz.correct / quiz.total) : null;
    const sectionPct = sr / st;
    if (sr > 0 || quiz) hasAnyActivity = true;
    // Combined score: weight quiz accuracy and section completion equally
    // Null quiz counts as 0 if they haven't tried any
    const combined = quizPct !== null ? (quizPct + sectionPct) / 2 : sectionPct * 0.5;
    return { topic, combined, sectionPct, quizPct, sr, st };
  });

  if (!hasAnyActivity) return '';

  // Find weakest non-complete topic
  const weakest = scores
    .filter(s => !progress[s.topic.id] && s.combined < 0.9)
    .sort((a, b) => a.combined - b.combined)[0];

  if (!weakest) return '';

  const reason = weakest.quizPct !== null && weakest.quizPct < 0.7
    ? `Quiz accuracy is ${Math.round(weakest.quizPct * 100)}%`
    : weakest.sr === 0
    ? `Not started yet`
    : `${weakest.sr}/${weakest.st} sections read`;

  return `
    <div class="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-4">
      <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
        <i data-lucide="target" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm text-amber-900 dark:text-amber-200">Focus Area: ${weakest.topic.title}</p>
        <p class="text-xs text-amber-700 dark:text-amber-400 mt-0.5">${reason} — this topic needs more attention</p>
      </div>
      <a href="#/topic/${weakest.topic.id}" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0">
        Study Now
      </a>
    </div>
  `;
}

function renderTopicsGlance() {
  const topics = TOPICS.map(t => {
    const m = store.getTopicMastery(t.id, null);
    const mastery = m?.mastery || 0;
    const sr = store.getSectionsRead(t.id);
    const qs = store.getQuizScore(t.id);
    return { topic: t, mastery, sections: sr, quiz: qs };
  });
  if (topics.every(t => t.mastery === 0)) return '';

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="grid-3x3" class="w-5 h-5 text-indigo-500"></i> Topics at a Glance
      </h2>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
        ${topics.map(({ topic, mastery, quiz }) => {
          const bg = mastery >= 80 ? 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700' :
                     mastery >= 50 ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' :
                     mastery > 0 ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700' :
                     'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
          const qPct = quiz ? Math.round((quiz.correct / quiz.total) * 100) : null;
          return `
            <a data-route="#/topic/${topic.id}" class="p-3 rounded-xl border ${bg} cursor-pointer hover:shadow-md transition-all text-center">
              <i data-lucide="${topic.icon}" class="w-5 h-5 mx-auto text-${topic.color}-500 mb-1"></i>
              <div class="text-xs font-bold truncate">${topic.title.split(' ')[0]}</div>
              <div class="text-lg font-bold ${mastery >= 80 ? 'text-green-600' : mastery >= 50 ? 'text-amber-600' : mastery > 0 ? 'text-red-500' : 'text-slate-400'}">${mastery}%</div>
              ${qPct !== null ? `<div class="text-[9px] text-slate-400">Quiz: ${qPct}%</div>` : ''}
            </a>`;
        }).join('')}
      </div>
    </section>
  `;
}

function renderMasteryRanking() {
  const ranked = TOPICS.map(t => {
    const m = store.getTopicMastery(t.id, null);
    return { topic: t, mastery: m ? m.mastery : 0 };
  }).sort((a, b) => b.mastery - a.mastery);

  // Only show if at least one topic has mastery > 0
  if (ranked[0].mastery === 0) return '';

  const medals = ['🥇', '🥈', '🥉'];
  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="award" class="w-5 h-5 text-amber-500"></i> Mastery Ranking
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
        ${ranked.map((r, i) => {
          const barColor = r.mastery >= 80 ? 'bg-green-500' : r.mastery >= 50 ? 'bg-amber-500' : r.mastery > 0 ? 'bg-red-400' : 'bg-slate-300 dark:bg-slate-600';
          return `
          <div class="flex items-center gap-3 px-4 py-3">
            <span class="w-6 text-center text-sm ${i < 3 && r.mastery > 0 ? '' : 'text-slate-400'}">${i < 3 && r.mastery > 0 ? medals[i] : `#${i + 1}`}</span>
            <i data-lucide="${r.topic.icon}" class="w-4 h-4 text-${r.topic.color}-500 flex-shrink-0"></i>
            <span class="text-sm font-medium flex-1 truncate">${r.topic.title}</span>
            <div class="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div class="${barColor} h-full rounded-full transition-all" style="width:${r.mastery}%"></div>
            </div>
            <span class="text-sm font-bold w-10 text-right ${r.mastery >= 80 ? 'text-green-600' : r.mastery >= 50 ? 'text-amber-600' : r.mastery > 0 ? 'text-red-500' : 'text-slate-400'}">${r.mastery}%</span>
          </div>`;
        }).join('')}
      </div>
    </section>
  `;
}

function renderMasteryMilestones() {
  const milestones = [25, 50, 75, 100];
  const topicMilestones = TOPICS.map(function(t) {
    const m = store.getTopicMastery(t.id);
    const mastery = m?.mastery || 0;
    const next = milestones.find(function(ms) { return mastery < ms; }) || null;
    const prev = milestones.filter(function(ms) { return mastery >= ms; });
    return { topic: t, mastery: mastery, next: next, achieved: prev };
  }).filter(function(tm) { return tm.next !== null; });
  if (topicMilestones.length === 0) return '';
  topicMilestones.sort(function(a, b) { return (b.next - b.mastery) - (a.next - a.mastery); });
  return `
  <section class="mb-10">
    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
      <i data-lucide="milestone" class="w-5 h-5 text-amber-500"></i> Next Milestones
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      ${topicMilestones.slice(0, 6).map(function(tm) {
        var gap = tm.next - tm.mastery;
        var c = gap <= 10 ? 'green' : gap <= 25 ? 'amber' : 'slate';
        return '<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3"><div class="flex items-center gap-2 mb-2"><i data-lucide="' + tm.topic.icon + '" class="w-4 h-4 text-' + tm.topic.color + '-500"></i><span class="text-sm font-medium truncate">' + tm.topic.title.split(' ')[0] + '</span></div><div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative"><div class="h-full bg-' + tm.topic.color + '-400 rounded-full" style="width:' + tm.mastery + '%"></div><div class="absolute top-0 h-full border-r-2 border-' + c + '-500 border-dashed" style="left:' + tm.next + '%"></div></div><div class="flex justify-between text-[10px] mt-1"><span class="text-slate-500">' + tm.mastery + '%</span><span class="font-medium text-' + c + '-600">→ ' + tm.next + '%</span></div></div>';
      }).join('')}
    </div>
  </section>
  `;
}

function renderQuickReview() {
  try {
    const items = JSON.parse(localStorage.getItem('htgaa-review-later') || '[]');
    if (items.length === 0) return '';
    const recent = items.slice(-5).reverse();
    return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="clock" class="w-5 h-5 text-violet-500"></i> Review Later
        <span class="text-sm font-normal text-slate-400">${items.length} saved</span>
      </h2>
      <div class="space-y-3">
        ${recent.map(function(item) {
          var topic = TOPICS.find(function(t) { return t.id === item.topicId; });
          return '<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"><p class="text-sm font-medium mb-2">' + item.question + '</p><div class="flex items-center gap-3 text-xs"><span class="text-red-500 line-through">' + item.yourAnswer + '</span><span class="text-slate-400">&rarr;</span><span class="text-green-600 font-medium">' + item.correctAnswer + '</span></div>' + (item.explanation ? '<p class="text-xs text-slate-400 mt-1">' + item.explanation + '</p>' : '') + '<div class="flex items-center gap-2 mt-2"><span class="text-[10px] px-1.5 py-0.5 rounded bg-' + (topic?.color || 'slate') + '-100 dark:bg-' + (topic?.color || 'slate') + '-900/30 text-' + (topic?.color || 'slate') + '-600">' + (topic?.title || item.topic) + '</span></div></div>';
        }).join('')}
      </div>
      ${items.length > 5 ? '<p class="text-xs text-slate-400 text-center mt-2">Showing 5 of ' + items.length + ' saved questions</p>' : ''}
    </section>
    `;
  } catch { return ''; }
}

function renderStudyStrengths() {
  const dims = [
    { key: 'sectionPct', label: 'Reading', icon: 'book-open', color: 'blue' },
    { key: 'quizPct', label: 'Quizzes', icon: 'help-circle', color: 'green' },
    { key: 'fcPct', label: 'Flashcards', icon: 'layers', color: 'violet' },
    { key: 'timePct', label: 'Study Time', icon: 'clock', color: 'cyan' }
  ];
  const avgDims = {};
  let count = 0;
  TOPICS.forEach(function(t) {
    var m = store.getTopicMastery(t.id);
    if (!m || m.mastery === 0) return;
    count++;
    dims.forEach(function(d) { avgDims[d.key] = (avgDims[d.key] || 0) + (m[d.key] || 0); });
  });
  if (count < 2) return '';
  dims.forEach(function(d) { avgDims[d.key] = Math.round(avgDims[d.key] / count); });
  const sorted = dims.slice().sort(function(a, b) { return avgDims[b.key] - avgDims[a.key]; });
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  return `
  <section class="mb-10">
    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
      <i data-lucide="sparkles" class="w-5 h-5 text-amber-500"></i> Your Strengths
    </h2>
    <div class="grid grid-cols-4 gap-3">
      ${sorted.map(function(d) {
        var val = avgDims[d.key];
        var isTop = d.key === strongest.key;
        var isBottom = d.key === weakest.key;
        return '<div class="bg-white dark:bg-slate-800 rounded-xl border ' + (isTop ? 'border-green-300 dark:border-green-700' : isBottom ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700') + ' p-3 text-center"><i data-lucide="' + d.icon + '" class="w-5 h-5 text-' + d.color + '-500 mx-auto mb-1"></i><div class="text-lg font-bold ' + (isTop ? 'text-green-600' : isBottom ? 'text-red-500' : 'text-slate-700 dark:text-slate-300') + '">' + val + '%</div><div class="text-[10px] text-slate-500">' + d.label + '</div>' + (isTop ? '<div class="text-[8px] text-green-600 mt-1 font-bold">Strongest</div>' : '') + (isBottom ? '<div class="text-[8px] text-red-500 mt-1 font-bold">Needs work</div>' : '') + '</div>';
      }).join('')}
    </div>
  </section>
  `;
}

function renderKnowledgeGaps() {
  const gaps = TOPICS.map(t => {
    const qs = store.getQuizScore(t.id);
    const quizPct = qs ? Math.round((qs.correct / qs.total) * 100) : null;
    const fc = store.getFlashcardStats();
    const reviews = store.get('flashcards').reviews || {};
    // Count mastered flashcards for this topic
    let fcMastered = 0, fcTotal = 0;
    Object.entries(reviews).forEach(([id, r]) => {
      if (id.startsWith(t.id + '-')) {
        fcTotal++;
        if (r.interval >= 21) fcMastered++;
      }
    });
    const fcPct = fcTotal > 0 ? Math.round((fcMastered / fcTotal) * 100) : null;
    if (quizPct === null || fcPct === null) return null;
    const gap = fcPct - quizPct;
    return { topic: t, quizPct, fcPct, gap };
  }).filter(g => g && Math.abs(g.gap) > 15).sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));

  if (gaps.length === 0) return '';

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="puzzle" class="w-5 h-5 text-orange-500"></i> Knowledge Gaps
      </h2>
      <div class="space-y-3">
        ${gaps.map(g => {
          const isMemoryGap = g.gap > 0; // high flashcard mastery but low quiz scores
          return `
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div class="flex items-center gap-3">
              <i data-lucide="${g.topic.icon}" class="w-5 h-5 text-${g.topic.color}-500 flex-shrink-0"></i>
              <div class="flex-1">
                <p class="text-sm font-medium">${g.topic.title}</p>
                <p class="text-xs text-slate-400 mt-0.5">${isMemoryGap ? 'You know the terms but struggle applying them in quizzes' : 'Good quiz scores but vocabulary needs reinforcement'}</p>
              </div>
              <div class="flex gap-3 text-center">
                <div>
                  <div class="text-sm font-bold ${g.quizPct >= 70 ? 'text-green-600' : 'text-red-500'}">${g.quizPct}%</div>
                  <div class="text-[9px] text-slate-400">Quiz</div>
                </div>
                <div>
                  <div class="text-sm font-bold ${g.fcPct >= 70 ? 'text-green-600' : 'text-red-500'}">${g.fcPct}%</div>
                  <div class="text-[9px] text-slate-400">Cards</div>
                </div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </section>
  `;
}

function renderLearningInsights() {
  const insights = [];
  const fc = store.getFlashcardStats();
  const scores = store.getExamScores();
  const log = store.getStudyLog();
  const activeDays = Object.keys(log).filter(d => log[d] > 0);
  const progress = store.get('progress');

  // Insight: studying consistency
  if (activeDays.length >= 2) {
    const totalMin = activeDays.reduce((s, d) => s + log[d], 0);
    const avgMin = Math.round(totalMin / activeDays.length);
    insights.push({ icon: 'clock', color: 'cyan', text: `You study an average of ${avgMin} minutes per session across ${activeDays.length} days.` });
  }

  // Insight: exam improvement
  if (scores.length >= 3) {
    const first3 = scores.slice(0, 3).reduce((s, sc) => s + sc.pct, 0) / 3;
    const last3 = scores.slice(-3).reduce((s, sc) => s + sc.pct, 0) / 3;
    const diff = Math.round(last3 - first3);
    if (diff > 5) insights.push({ icon: 'trending-up', color: 'green', text: `Your exam scores improved by ${diff}% from your first 3 exams to your last 3.` });
    else if (diff < -5) insights.push({ icon: 'trending-down', color: 'red', text: `Your recent exam scores dropped by ${Math.abs(diff)}%. Consider reviewing weak topics.` });
  }

  // Insight: flashcard efficiency
  if (fc.reviewed >= 20) {
    const masteredPct = fc.mastered > 0 ? Math.round((fc.mastered / fc.total) * 100) : 0;
    if (masteredPct >= 50) insights.push({ icon: 'star', color: 'amber', text: `${masteredPct}% of your flashcards are mastered. Great memory retention!` });
    else if (masteredPct < 20) insights.push({ icon: 'repeat', color: 'violet', text: `Only ${masteredPct}% mastered. Try reviewing cards daily for better retention.` });
  }

  // Insight: weakest topic
  const weakest = TOPICS.map(t => ({ topic: t, mastery: store.getTopicMastery(t.id, null)?.mastery || 0 }))
    .filter(t => t.mastery > 0).sort((a, b) => a.mastery - b.mastery)[0];
  if (weakest && weakest.mastery < 50) {
    insights.push({ icon: 'target', color: 'red', text: `${weakest.topic.title} is your weakest topic at ${weakest.mastery}%. Focus here for the biggest improvement.` });
  }

  if (insights.length === 0) return '';

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="lightbulb" class="w-5 h-5 text-yellow-500"></i> Learning Insights
      </h2>
      <div class="space-y-2">
        ${insights.slice(0, 3).map(ins => `
          <div class="flex items-start gap-3 p-3 rounded-xl bg-${ins.color}-50 dark:bg-${ins.color}-900/10 border border-${ins.color}-200 dark:border-${ins.color}-800">
            <i data-lucide="${ins.icon}" class="w-4 h-4 text-${ins.color}-500 flex-shrink-0 mt-0.5"></i>
            <p class="text-sm text-slate-700 dark:text-slate-300">${ins.text}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderMilestoneBadges() {
  const badges = [];
  const progress = store.get('progress');
  const completed = Object.values(progress).filter(Boolean).length;
  const fc = store.getFlashcardStats();
  const scores = store.getExamScores();
  const best = store.getBestExamScore();
  const log = store.getStudyLog();
  const activeDays = Object.keys(log).filter(d => log[d] > 0).length;

  if (completed >= 1) badges.push({ icon: '📖', label: 'First Chapter', desc: 'Read your first topic' });
  if (completed >= 3) badges.push({ icon: '📚', label: 'Halfway', desc: 'Completed 3 topics' });
  if (completed >= 6) badges.push({ icon: '🎓', label: 'Scholar', desc: 'All topics complete' });
  if (fc.reviewed >= 10) badges.push({ icon: '🃏', label: 'Card Shark', desc: '10+ flashcards reviewed' });
  if (fc.reviewed >= 50) badges.push({ icon: '🧠', label: 'Memory Pro', desc: '50+ flashcards reviewed' });
  if (scores.length >= 1) badges.push({ icon: '📝', label: 'Test Taker', desc: 'First exam completed' });
  if (scores.length >= 5) badges.push({ icon: '🏋️', label: 'Exam Grinder', desc: '5+ exams completed' });
  if (best && best.pct >= 90) badges.push({ icon: '🌟', label: 'A+ Student', desc: '90%+ exam score' });
  if (best && best.pct === 100) badges.push({ icon: '💯', label: 'Perfect Score', desc: '100% on an exam' });
  if (activeDays >= 3) badges.push({ icon: '🔥', label: 'Consistent', desc: '3+ study days' });
  if (activeDays >= 7) badges.push({ icon: '⚡', label: 'Dedicated', desc: '7+ study days' });

  if (badges.length === 0) return '';

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="medal" class="w-5 h-5 text-amber-500"></i> Badges Earned
        <span class="text-xs font-normal text-slate-400 ml-auto">${badges.length} unlocked</span>
      </h2>
      <div class="flex flex-wrap gap-3">
        ${badges.map(b => `
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800" title="${b.desc}">
            <span class="text-xl">${b.icon}</span>
            <div>
              <div class="text-xs font-bold text-amber-800 dark:text-amber-300">${b.label}</div>
              <div class="text-[10px] text-amber-600 dark:text-amber-400">${b.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderExamHistoryChart() {
  const scores = store.getExamScores();
  if (!scores || scores.length === 0) return '';

  const recent = scores.slice(-8);
  const maxScore = 100;
  const barW = 28;
  const gap = 6;
  const chartH = 60;
  const svgW = recent.length * (barW + gap);

  const bars = recent.map((s, i) => {
    const pct = Math.round((s.score / s.total) * 100);
    const h = Math.max(2, (pct / maxScore) * chartH);
    const x = i * (barW + gap);
    const y = chartH - h;
    const fill = pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444';
    const date = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${fill}" opacity="0.85"/>
      <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" fill="currentColor" font-size="9" font-weight="bold" class="text-slate-600 dark:text-slate-300">${pct}%</text>
      <text x="${x + barW / 2}" y="${chartH + 12}" text-anchor="middle" fill="currentColor" font-size="7" class="text-slate-400">${date}</text>`;
  }).join('');

  const avg = Math.round(recent.reduce((sum, s) => sum + (s.score / s.total) * 100, 0) / recent.length);
  const trend = recent.length >= 2
    ? Math.round((recent[recent.length - 1].score / recent[recent.length - 1].total) * 100) -
      Math.round((recent[0].score / recent[0].total) * 100)
    : 0;
  const trendIcon = trend > 0 ? 'trending-up' : trend < 0 ? 'trending-down' : 'minus';
  const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-slate-400';

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="bar-chart-2" class="w-5 h-5 text-blue-500"></i> Exam History
        <span class="text-xs font-normal text-slate-400 ml-auto">Last ${recent.length} exams &middot; Avg ${avg}%
          <i data-lucide="${trendIcon}" class="w-3 h-3 ${trendColor} inline ml-1"></i>
          <span class="${trendColor}">${trend > 0 ? '+' : ''}${trend}%</span>
        </span>
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 overflow-x-auto">
        <svg viewBox="0 0 ${svgW} ${chartH + 18}" class="w-full max-w-md mx-auto" style="min-width:${svgW}px">
          <line x1="0" y1="${chartH}" x2="${svgW}" y2="${chartH}" stroke="rgba(148,163,184,0.2)" stroke-width="0.5"/>
          ${bars}
        </svg>
      </div>
    </section>
  `;
}

function renderStrugglingTerms() {
  const fcData = store.get('flashcards') || { reviews: {} };
  const reviews = fcData.reviews || {};

  // Find cards with 3+ lapses (struggling)
  const struggling = [];
  Object.entries(reviews).forEach(([cardId, r]) => {
    if (r.lapses >= 3) {
      // Parse topic and term index from card ID (format: topicId-vocab-N)
      const match = cardId.match(/^(.+)-vocab-(\d+)$/);
      if (match) {
        struggling.push({ cardId, topicId: match[1], vocabIdx: parseInt(match[2]), lapses: r.lapses, easeFactor: r.easeFactor });
      }
    }
  });

  if (struggling.length === 0) return '';

  // Sort by most lapses first
  struggling.sort((a, b) => b.lapses - a.lapses);
  const shown = struggling.slice(0, 6);

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="alert-triangle" class="w-5 h-5 text-red-500"></i> Struggling Terms
        <span class="text-xs text-slate-400 font-normal ml-auto">${struggling.length} term${struggling.length > 1 ? 's' : ''} need attention</span>
      </h2>
      <div class="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-5">
        <p class="text-sm text-red-700 dark:text-red-400 mb-4">These flashcard terms have been marked "Again" 3+ times. Consider reviewing the related topics.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${shown.map(s => {
            const topic = TOPICS.find(t => t.id === s.topicId);
            return `
              <a data-route="#/topic/${s.topicId}" class="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-red-100 dark:border-red-900/30 hover:border-red-400 transition-colors cursor-pointer group">
                <div class="w-8 h-8 rounded-lg bg-${topic?.color || 'slate'}-100 dark:bg-${topic?.color || 'slate'}-900/40 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="${topic?.icon || 'book'}" class="w-4 h-4 text-${topic?.color || 'slate'}-500"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold truncate" id="struggling-term-${s.cardId.replace(/[^a-zA-Z0-9-]/g, '')}">${s.cardId}</div>
                  <div class="text-xs text-red-500">${s.lapses} lapses</div>
                </div>
                <i data-lucide="arrow-right" class="w-4 h-4 text-slate-300 group-hover:text-red-400 flex-shrink-0 transition-colors"></i>
              </a>
            `;
          }).join('')}
        </div>
        <div class="mt-4 text-center">
          <a data-route="#/flashcards" class="text-sm text-red-600 dark:text-red-400 hover:underline cursor-pointer font-medium">
            Review all struggling cards &rarr;
          </a>
        </div>
      </div>
    </section>
  `;
}

function renderChangelog() {
  const changes = [
    { ver: 'v115', items: ['Exam half-time score split', 'Glossary letter count badges', 'Dashboard study strengths'] },
    { ver: 'v114', items: ['Exam review-topic links', 'Dashboard completion forecast', 'Compare study order recommendation'] },
    { ver: 'v113', items: ['Exam career stats in results', 'Flashcard mastery donut chart', 'Study summary knowledge map'] },
    { ver: 'v112', items: ['Exam time per question histogram', 'Dashboard mastery milestones', 'Glossary sticky letter index'] },
    { ver: 'v111', items: ['Glossary random term button', 'Flashcard reverse mode indicator', 'Compare quiz pool comparison'] },
    { ver: 'v110', items: ['Study summary mastery velocity', 'Exam review-later buttons', 'Dashboard quick review widget'] },
    { ver: 'v109', items: ['Exam difficulty breakdown chart', 'Flashcard 7-day review calendar', 'Dashboard weekly goals tracker'] },
    { ver: 'v108', items: ['Exam difficulty badges in review', 'Glossary Anki TSV export', 'Compare combined study plan'] },
    { ver: 'v107', items: ['Exam grade distribution on setup', 'Flashcard daily review comparison', 'Dashboard best study day stat'] },
    { ver: 'v106', items: ['Exam question pool preview', 'Compare mastery race chart', 'Study summary focus areas'] },
    { ver: 'v105', items: ['Flashcard hard cards mode', 'Dashboard knowledge gaps widget', 'Glossary mastery by topic'] },
    { ver: 'v104', items: ['Study summary efficiency metrics', 'Compare study time recommendation', 'Exam per-topic accuracy trend arrows'] },
    { ver: 'v103', items: ['Glossary mastery by topic breakdown', 'Exam best streak highlight', 'Dashboard topic connections map'] },
    { ver: 'v102', items: ['Exam focus-weak-topics button', 'Compare prerequisite chain', 'Dashboard flashcard review forecast'] },
    { ver: 'v101', items: ['Exam difficulty filter on setup', 'Dashboard recent sessions timeline', 'Flashcard session history tracking'] },
    { ver: 'v100', items: ['Exam answer change analysis', 'Flashcard session comparison vs previous', 'v100 milestone badge'] },
    { ver: 'v99', items: ['Dashboard topics at a glance grid', 'Compare content size comparison', 'Dashboard estimated completion date'] },
    { ver: 'v98', items: ['Exam print results button', 'Dashboard estimated completion date', 'Glossary term difficulty labels'] },
    { ver: 'v97', items: ['Glossary mini quiz button', 'Compare flashcard maturity', 'Dashboard day streak stat'] },
    { ver: 'v96', items: ['Dashboard learning insights', 'Exam cumulative accuracy chart', 'Study summary progress bar'] },
    { ver: 'v95', items: ['Dashboard milestone badges', 'Exam per-question time sparkline', 'Flashcard maturity counts in header'] },
    { ver: 'v94', items: ['Exam question quick-jump navigation', 'Dashboard time distribution donut', 'Compare quiz head-to-head'] },
    { ver: 'v93', items: ['Glossary recently viewed terms', 'Study summary time remaining per topic', 'Flashcard topic last-reviewed date'] },
    { ver: 'v92', items: ['Exam topic question bars on setup', 'Dashboard study pace stat', 'Flashcard topic last-reviewed date'] },
    { ver: 'v91', items: ['Exam confidence breakdown in results', 'Compare shared vocabulary panel', 'Study summary vocab mastery %'] },
    { ver: 'v90', items: ['Exam history bar chart on dashboard', 'Flashcard live streak indicator', 'Study summary vocab mastery %'] },
    { ver: 'v89', items: ['Compare reading time bars', 'Flashcard session number today', 'Exam seen questions count on setup'] },
    { ver: 'v88', items: ['Exam difficulty breakdown on setup', 'Glossary copy term to clipboard', 'Study summary section completion grid'] },
    { ver: 'v87', items: ['Compare design challenge comparison', 'Exam cumulative time on setup', 'Flashcard overall mastery bar'] },
    { ver: 'v86', items: ['Exam bookmarks count on setup', 'Compare homework connection overlap', 'Study summary readiness grade letter'] },
    { ver: 'v85', items: ['Saved exam questions on dashboard', 'Flashcard avg ease on topic filters', 'Glossary letter mastery dots'] },
    { ver: 'v84', items: ['Exam question bookmarks for later review', 'Dashboard weekly progress comparison', 'Glossary letter mastery dots'] },
    { ver: 'v83', items: ['Study summary time per topic bars', 'Flashcard deck position indicator', 'Exam new/seen in results'] },
    { ver: 'v82', items: ['Exam new/seen question counts in results', 'Glossary definition complexity badges', 'Dashboard vocab mastery stat'] },
    { ver: 'v81', items: ['Compare exam exposure stats', 'Flashcard rating distribution chart', 'Exam new question tracking'] },
    { ver: 'v80', items: ['Dashboard sessions stat', 'Study summary homework connections', 'Exam new question badges'] },
    { ver: 'v79', items: ['Flashcard reverse mode', 'Exam enhanced streak indicator', 'Compare flashcard mastery'] },
    { ver: 'v78', items: ['Glossary related terms expand', 'Exam cumulative accuracy trend', 'Study summary quiz/challenge counts'] },
    { ver: 'v77', items: ['Exam topic selection persistence', 'Flashcard copy session results', 'Knowledge radar on dashboard'] },
    { ver: 'v76', items: ['Knowledge radar chart on dashboard', 'Study summary strongest/weakest', 'Exam answer distribution chart'] },
    { ver: 'v75', items: ['Exam confidence labels on review', 'Flashcard session time estimate', 'Glossary word count badges'] },
    { ver: 'v74', items: ['Exam difficulty distribution', 'Flashcard topic completion %', 'Sections read dashboard stat'] },
    { ver: 'v73', items: ['Flashcard 7-day review forecast', 'Exam topic radar chart', 'Compare time invested'] },
    { ver: 'v72', items: ['Exam answer change tracking', 'Study summary total Qs answered', 'Glossary sort by topic/status'] },
    { ver: 'v71', items: ['Exam time distribution histogram', 'Flashcard session streak counter', 'Best streak in session summary'] },
    { ver: 'v70', items: ['Exam personal best badge', 'Flashcard ease/interval on card back', 'Flashcard last-reviewed date'] },
    { ver: 'v69', items: ['Compare combined stats', 'Flashcard last-reviewed timestamp', 'Exam topic question index in review'] },
    { ver: 'v68', items: ['Exam question pool size on setup', 'Glossary flashcard progress bar', 'Streak milestone emojis'] },
    { ver: 'v67', items: ['Flashcard focus-weak mode', 'Overdue flashcard urgency alert', 'Exam improvement from last attempt'] },
    { ver: 'v66', items: ['Glossary term of the day', 'Study summary readiness gauge', 'Exam improvement from last attempt'] },
    { ver: 'v65', items: ['Exam skipped question badges', 'Flashcard daily review goal bar', 'Mastered terms count on dashboard'] },
    { ver: 'v64', items: ['Exam topic history count on setup', 'Flashcard hardest cards list', 'Exam score trend arrow on dashboard'] },
    { ver: 'v63', items: ['Exam early submit with unanswered warning', 'Flashcard new-cards-only mode', 'Dynamic glossary term count'] },
    { ver: 'v62', items: ['Exam fastest/slowest correct highlight', 'Most deliberate answer insight'] },
    { ver: 'v61', items: ['Study summary quiz scores', 'Compare learning objectives', 'Per-topic quiz accuracy in summary'] },
    { ver: 'v60', items: ['Exam difficulty badges', 'Last active stat on dashboard', 'Question difficulty labels'] },
    { ver: 'v59', items: ['Flashcard per-topic session breakdown', 'Session topic accuracy in completion summary'] },
    { ver: 'v58', items: ['Exam correct vs incorrect time analysis', 'Glossary topic filter term counts'] },
    { ver: 'v57', items: ['Flashcard review streak banner', 'Topic mastery ranking leaderboard', 'Exam speed indicators on results'] },
    { ver: 'v56', items: ['Exam slow question warning', 'Flashcard running accuracy', 'Exam time pressure hints'] },
    { ver: 'v55', items: ['Glossary flashcard status badges', 'Study summary time stat'] },
    { ver: 'v54', items: ['Knowledge radar chart', 'Flashcard difficulty gauge', 'Weekly progress comparison'] },
    { ver: 'v53', items: ['Exam mastery % on topic toggles', 'Topic page flashcard review link', 'Weekly comparison stat'] },
    { ver: 'v52', items: ['Topic mastery breakdown on chapter page', 'Compare suggested comparisons', 'Struggling terms dashboard'] },
    { ver: 'v51', items: ['Exam retry incorrect only', 'Flashcard session summary', 'Struggling terms dashboard widget'] },
    { ver: 'v50', items: ['TOC section read indicators', 'Quick quiz question type filter'] },
    { ver: 'v49', items: ['Exam score sparkline and average', 'Copy exam results to clipboard', 'Flashcard maturity distribution bar', 'Today study time stat'] },
    { ver: 'v48', items: ['Exam flagged question warning dialog', 'Study summary average mastery', 'Overall mastery breakdown'] },
    { ver: 'v47', items: ['Live stats on study tool cards', 'Concept map fullscreen and reset', 'Concept map node statistics'] },
    { ver: 'v46', items: ['Homework progress bar', 'Auto-expand incomplete HW', 'Glossary back-to-top', 'Exam unanswered counter'] },
    { ver: 'v45', items: ['Exam flag/bookmark questions', 'Compare mastery breakdown', 'Study summary mastery scores'] },
    { ver: 'v44', items: ['Glossary search highlighting', 'Exam topic confidence indicator', 'Flashcard today counter', 'Flashcard timer leak fix'] },
    { ver: 'v43', items: ['Compare view markdown export', 'Last-studied timestamps', 'Daily time tracking'] },
    { ver: 'v42', items: ['Flashcard session timer', 'Glossary CSV export', 'Topic card mastery display'] },
    { ver: 'v41', items: ['Exam flashcard link for weak topics', 'Topic word count', 'Daily study goal tracker'] },
    { ver: 'v40', items: ['Per-question timer in exams', 'Enhanced study summary export', 'This changelog'] },
    { ver: 'v39', items: ['Concept map connected nodes panel', 'Cross-topic connections in study summary'] },
    { ver: 'v38', items: ['Practice all flashcards button', 'Glossary letter term counts', 'Per-topic time tracking on dashboard'] },
    { ver: 'v37', items: ['Topic mastery scoring system', 'Longest study streak tracking', 'Per-topic exam timing breakdown'] },
    { ver: 'v36', items: ['Study summary markdown export', 'Printable review sheet'] },
    { ver: 'v35', items: ['Visual learning path', 'Study streak calendar'] },
    { ver: 'v34', items: ['Keyboard shortcuts modal', 'DNA storage calculator'] },
    { ver: 'v33', items: ['Spaced repetition flashcards', 'Homework guidance hub'] },
    { ver: 'v32', items: ['Scroll animations and polish', 'Design challenges in quizzes'] },
  ];

  // Show only first 3 by default
  return changes.map((c, i) => `
    <div class="changelog-item flex gap-3 py-2 ${i >= 3 ? 'hidden' : ''}" data-changelog-idx="${i}">
      <span class="text-xs font-mono font-bold text-violet-500 dark:text-violet-400 w-8 flex-shrink-0 mt-0.5">${c.ver}</span>
      <div class="text-sm text-slate-600 dark:text-slate-400">${c.items.join(' &middot; ')}</div>
    </div>
  `).join('');
}

function renderReviewReminder() {
  const fcData = store.get('flashcards') || { reviews: {} };
  const reviews = fcData.reviews || {};
  const now = Date.now();

  // Count due reviews and overdue (>24h past due)
  let dueCount = 0;
  let overdueCount = 0;
  const oneDayMs = 86400000;
  Object.values(reviews).forEach(r => {
    if (r.nextReview && r.nextReview <= now) {
      dueCount++;
      if (now - r.nextReview > oneDayMs) overdueCount++;
    }
  });

  if (dueCount === 0) return '';

  const urgent = overdueCount > 5;
  const borderColor = urgent ? 'red' : 'violet';
  const bgFrom = urgent ? 'red' : 'violet';
  const bgTo = urgent ? 'rose' : 'purple';

  return `
    <section class="mb-6">
      <a data-route="#/flashcards" class="block bg-gradient-to-r from-${bgFrom}-50 to-${bgTo}-50 dark:from-${bgFrom}-900/20 dark:to-${bgTo}-900/20 rounded-xl border border-${borderColor}-200 dark:border-${borderColor}-800 p-4 cursor-pointer hover:border-${borderColor}-400 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-${borderColor}-100 dark:bg-${borderColor}-900/40 flex items-center justify-center flex-shrink-0">
            <i data-lucide="${urgent ? 'alert-circle' : 'brain'}" class="w-5 h-5 text-${borderColor}-600 dark:text-${borderColor}-400"></i>
          </div>
          <div class="flex-1">
            <p class="font-bold text-${borderColor}-800 dark:text-${borderColor}-300">${dueCount} flashcard${dueCount > 1 ? 's' : ''} due for review${overdueCount > 0 ? ` (${overdueCount} overdue)` : ''}</p>
            <p class="text-xs text-${borderColor}-600 dark:text-${borderColor}-400">${urgent ? 'You have many overdue cards — review now to prevent forgetting!' : 'Spaced repetition works best when reviews are done on time. Click to start.'}</p>
          </div>
          <i data-lucide="arrow-right" class="w-5 h-5 text-${borderColor}-400 flex-shrink-0"></i>
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
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        ${(() => {
          // Today's study time from activity feed
          const feed = JSON.parse(localStorage.getItem('htgaa-week2-activity-feed') || '[]');
          const todayActivities = feed.filter(a => new Date(a.time).toISOString().slice(0, 10) === today).length;
          const todayMins = Math.min(todayActivities * 2, 120); // rough estimate: ~2min per activity
          return `<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">${todayMins > 0 ? todayMins + 'm' : '—'}</div>
          <div class="text-xs text-slate-500 mt-1">Today</div>
        </div>`;
        })()}
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

      <!-- Weekly Comparison -->
      ${(() => {
        const log = store.getStudyLog();
        const now = new Date();
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
        thisWeekStart.setHours(0, 0, 0, 0);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        let thisWeekSessions = 0, lastWeekSessions = 0;
        Object.entries(log).forEach(([dateStr, count]) => {
          const d = new Date(dateStr + 'T00:00:00');
          if (d >= thisWeekStart) thisWeekSessions += count;
          else if (d >= lastWeekStart && d < thisWeekStart) lastWeekSessions += count;
        });

        if (lastWeekSessions === 0 && thisWeekSessions === 0) return '';

        const diff = thisWeekSessions - lastWeekSessions;
        const arrow = diff > 0 ? 'trending-up' : diff < 0 ? 'trending-down' : 'minus';
        const diffColor = diff > 0 ? 'green' : diff < 0 ? 'red' : 'slate';
        const diffText = diff > 0 ? `+${diff}` : `${diff}`;

        return `
        <div class="mt-3 flex items-center gap-4 text-xs text-slate-500 px-1">
          <span class="flex items-center gap-1">
            <i data-lucide="${arrow}" class="w-3.5 h-3.5 text-${diffColor}-500"></i>
            <span class="font-medium text-${diffColor}-600 dark:text-${diffColor}-400">${diffText}</span> vs last week
          </span>
          <span>This week: ${thisWeekSessions} sessions</span>
          <span>Last week: ${lastWeekSessions} sessions</span>
        </div>`;
      })()}

      <!-- Knowledge Radar -->
      ${(() => {
        const topicDataCache = store.get('topicData') || {};
        const masteryScores = TOPICS.map(t => {
          const td = topicDataCache[t.id];
          return td ? { ...store.getTopicMastery(t.id, td), topic: t } : null;
        }).filter(Boolean);
        if (masteryScores.length < 3 || masteryScores.every(m => m.mastery === 0)) return '';

        // SVG radar chart
        const cx = 100, cy = 100, r = 70;
        const n = masteryScores.length;
        const angleStep = (2 * Math.PI) / n;

        // Background polygon (100% ring)
        const bgPts = masteryScores.map((_, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');

        // 50% ring
        const midPts = masteryScores.map((_, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          return `${cx + (r * 0.5) * Math.cos(angle)},${cy + (r * 0.5) * Math.sin(angle)}`;
        }).join(' ');

        // Data polygon
        const dataPts = masteryScores.map((m, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const val = Math.max(0.05, m.mastery / 100) * r;
          return `${cx + val * Math.cos(angle)},${cy + val * Math.sin(angle)}`;
        }).join(' ');

        // Labels
        const labels = masteryScores.map((m, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const lx = cx + (r + 18) * Math.cos(angle);
          const ly = cy + (r + 18) * Math.sin(angle);
          const anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
          return `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="central" class="fill-slate-500 dark:fill-slate-400" font-size="8" font-weight="600">${m.topic.title.replace('DNA ', '').replace('Gel ', '')}</text>
          <text x="${lx}" y="${ly + 10}" text-anchor="${anchor}" dominant-baseline="central" class="fill-slate-400" font-size="7">${m.mastery}%</text>`;
        }).join('');

        return `
        <div class="mt-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 text-center">Knowledge Radar</h3>
          <svg viewBox="0 0 200 200" class="w-full max-w-[280px] mx-auto" style="max-height: 220px">
            <!-- Grid -->
            <polygon points="${bgPts}" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="1"/>
            <polygon points="${midPts}" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="0.5" stroke-dasharray="3,3"/>
            <!-- Axes -->
            ${masteryScores.map((_, i) => {
              const angle = -Math.PI / 2 + i * angleStep;
              return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="0.5"/>`;
            }).join('')}
            <!-- Data -->
            <polygon points="${dataPts}" fill="url(#radar-fill)" stroke="#8b5cf6" stroke-width="2" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="radar-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.1"/>
              </linearGradient>
            </defs>
            <!-- Dots -->
            ${masteryScores.map((m, i) => {
              const angle = -Math.PI / 2 + i * angleStep;
              const val = Math.max(0.05, m.mastery / 100) * r;
              return `<circle cx="${cx + val * Math.cos(angle)}" cy="${cy + val * Math.sin(angle)}" r="3" fill="#8b5cf6"/>`;
            }).join('')}
            <!-- Labels -->
            ${labels}
          </svg>
        </div>`;
      })()}

      <!-- Overall Mastery -->
      ${(() => {
        const topicDataCache = store.get('topicData') || {};
        const masteryScores = TOPICS.map(t => {
          const td = topicDataCache[t.id];
          return td ? store.getTopicMastery(t.id, td) : null;
        }).filter(Boolean);
        if (masteryScores.length === 0) return '';
        const avgMastery = Math.round(masteryScores.reduce((s, m) => s + m.mastery, 0) / masteryScores.length);
        if (avgMastery === 0) return '';
        const masteryLabel = avgMastery >= 80 ? 'Expert' : avgMastery >= 60 ? 'Proficient' : avgMastery >= 40 ? 'Learning' : 'Beginner';
        const masteryGradient = avgMastery >= 80 ? 'from-green-500 to-emerald-500' : avgMastery >= 60 ? 'from-blue-500 to-indigo-500' : avgMastery >= 40 ? 'from-amber-500 to-orange-500' : 'from-slate-400 to-slate-500';
        return `
        <div class="mt-4 bg-gradient-to-r ${masteryGradient} rounded-xl p-4 text-white flex items-center gap-4">
          <div class="relative w-16 h-16 flex-shrink-0" style="width:64px;height:64px">
            <svg class="w-16 h-16 -rotate-90" viewBox="0 0 100 100" style="width:64px;height:64px">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"
                stroke-dasharray="264" stroke-dashoffset="${264 - (avgMastery / 100) * 264}"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-lg font-bold">${avgMastery}%</span>
            </div>
          </div>
          <div>
            <div class="font-bold text-lg">Overall Mastery: ${masteryLabel}</div>
            <div class="text-sm opacity-80">Combines reading progress, quiz accuracy, flashcard reviews, and study time across all topics</div>
          </div>
        </div>`;
      })()}

      <!-- Per-topic breakdown -->
      <div class="mt-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
              <th class="text-left px-4 py-2 font-medium">Topic</th>
              <th class="text-center px-2 py-2 font-medium">Sections</th>
              <th class="text-center px-2 py-2 font-medium">Quiz</th>
              <th class="text-center px-2 py-2 font-medium hidden md:table-cell">Time</th>
              <th class="text-center px-2 py-2 font-medium hidden sm:table-cell">Mastery</th>
              <th class="text-center px-2 py-2 font-medium hidden sm:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              let topicTimeSpent = {};
              try { topicTimeSpent = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}'); } catch {}
              return TOPICS.map(topic => {
              const sr = store.getSectionsRead(topic.id).length;
              const st = sectionCounts[topic.id] || 6;
              const quiz = store.getQuizScore(topic.id);
              const isComplete = !!progress[topic.id];
              const topicData = store.get('topicData')[topic.id];
              const mastery = topicData ? store.getTopicMastery(topic.id, topicData) : null;
              const masteryPct = mastery ? mastery.mastery : 0;
              const masteryColor = masteryPct >= 80 ? 'green' : masteryPct >= 50 ? 'amber' : masteryPct > 0 ? 'red' : 'slate';
              const topicSecs = topicTimeSpent[topic.id] || 0;
              const topicMins = Math.floor(topicSecs / 60);
              return `<tr class="border-t border-slate-100 dark:border-slate-700/50">
                <td class="px-4 py-2">
                  <a href="#/topic/${topic.id}" class="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <i data-lucide="${topic.icon}" class="w-3.5 h-3.5 text-${topic.color}-500"></i>
                    <span class="truncate">${topic.title}</span>
                  </a>
                </td>
                <td class="text-center px-2 py-2">
                  <span class="${sr === st ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500'}">${sr}/${st}</span>
                </td>
                <td class="text-center px-2 py-2">
                  ${quiz ? `<span class="${quiz.correct === quiz.total ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500'}">${Math.round(quiz.correct / quiz.total * 100)}%</span>` : '<span class="text-slate-300 dark:text-slate-600">—</span>'}
                </td>
                <td class="text-center px-2 py-2 hidden md:table-cell">
                  ${topicMins > 0 ? `<span class="text-xs ${topicMins >= 20 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-500'}">${topicMins}m</span>` : '<span class="text-slate-300 dark:text-slate-600">—</span>'}
                </td>
                <td class="text-center px-2 py-2 hidden sm:table-cell">
                  ${mastery && (sr > 0 || quiz) ? `
                    <div class="flex items-center gap-1.5 justify-center" title="Sections ${mastery.sectionPct}% | Quiz ${mastery.quizPct}% | Cards ${mastery.fcPct}% | Time ${mastery.timePct}%">
                      <div class="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div class="h-full rounded-full bg-${masteryColor}-500 transition-all" style="width:${masteryPct}%"></div>
                      </div>
                      <span class="text-xs font-medium text-${masteryColor}-600 dark:text-${masteryColor}-400">${masteryPct}%</span>
                    </div>
                  ` : '<span class="text-slate-300 dark:text-slate-600">—</span>'}
                </td>
                <td class="text-center px-2 py-2 hidden sm:table-cell">
                  ${isComplete ? '<span class="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><i data-lucide="check-circle" class="w-3 h-3"></i></span>' : sr > 0 ? '<span class="text-xs text-blue-500">In progress</span>' : '<span class="text-xs text-slate-400">Not started</span>'}
                </td>
              </tr>`;
            }).join('');
            })()}
          </tbody>
        </table>
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
        <div class="flex items-center gap-6 mb-4 text-sm flex-wrap">
          <div class="flex items-center gap-2">
            <i data-lucide="flame" class="w-4 h-4 text-orange-500"></i>
            <span class="font-bold text-lg ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}">${streak}</span>
            <span class="text-slate-500 dark:text-slate-400">day streak${streak >= 7 ? ' 🔥' : streak >= 3 ? ' 💪' : ''}</span>
          </div>
          ${(() => {
            const longest = store.getLongestStreak();
            return longest > streak && longest >= 2 ? `
            <div class="flex items-center gap-2">
              <i data-lucide="award" class="w-4 h-4 text-amber-500"></i>
              <span class="font-bold text-lg text-amber-600 dark:text-amber-400">${longest}</span>
              <span class="text-slate-500 dark:text-slate-400">best streak</span>
            </div>` : '';
          })()}
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
          ${(() => {
            const goalKey = 'htgaa-week2-daily-goal';
            let goal = 30; // default 30 min
            try { goal = parseInt(localStorage.getItem(goalKey)) || 30; } catch {}
            let todayTime = 0;
            try {
              const ts = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
              const todayStr = new Date().toISOString().slice(0, 10);
              const dailyLog = JSON.parse(localStorage.getItem('htgaa-week2-daily-time') || '{}');
              todayTime = Math.floor((dailyLog[todayStr] || 0) / 60);
            } catch {}
            const goalPct = Math.min(100, Math.round((todayTime / goal) * 100));
            const goalColor = goalPct >= 100 ? 'green' : goalPct >= 50 ? 'amber' : 'slate';
            return `
          <div class="flex items-center gap-2 ml-auto">
            <div class="relative w-8 h-8">
              <svg class="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="3"/>
                <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" class="text-${goalColor}-500" stroke-width="3"
                  stroke-dasharray="${75.4}" stroke-dashoffset="${75.4 - (goalPct / 100) * 75.4}" stroke-linecap="round"/>
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-${goalColor}-600 dark:text-${goalColor}-400">${goalPct}%</span>
            </div>
            <div class="text-xs">
              <div class="font-medium text-slate-600 dark:text-slate-300">${todayTime}/${goal}m today</div>
              <button class="study-goal-btn text-slate-400 hover:text-blue-500 transition-colors" data-current-goal="${goal}">set goal</button>
            </div>
          </div>`;
          })()}
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

function renderTopicConnections() {
  // Simple connection matrix showing which topics link to which
  const connections = [
    { from: 'central-dogma', to: 'sequencing', label: 'reads' },
    { from: 'central-dogma', to: 'synthesis', label: 'builds' },
    { from: 'central-dogma', to: 'editing', label: 'modifies' },
    { from: 'central-dogma', to: 'genetic-codes', label: 'encodes' },
    { from: 'sequencing', to: 'gel-electrophoresis', label: 'separates' },
    { from: 'synthesis', to: 'editing', label: 'enables' },
    { from: 'genetic-codes', to: 'synthesis', label: 'guides' },
    { from: 'gel-electrophoresis', to: 'editing', label: 'verifies' },
  ];

  const topicPositions = {};
  const n = TOPICS.length;
  const cx = 120, cy = 90, r = 65;
  TOPICS.forEach((t, i) => {
    const angle = -Math.PI / 2 + (i / n) * 2 * Math.PI;
    topicPositions[t.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), topic: t };
  });

  const colors = { blue: '#3b82f6', green: '#22c55e', red: '#ef4444', purple: '#a855f7', yellow: '#eab308', indigo: '#6366f1' };

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="network" class="w-5 h-5 text-indigo-500"></i> Topic Connections
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <svg viewBox="0 0 240 180" class="w-full max-w-md mx-auto">
          ${connections.map(c => {
            const from = topicPositions[c.from];
            const to = topicPositions[c.to];
            if (!from || !to) return '';
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            return '<line x1="' + from.x + '" y1="' + from.y + '" x2="' + to.x + '" y2="' + to.y + '" stroke="rgba(148,163,184,0.3)" stroke-width="1"/><text x="' + mx + '" y="' + (my - 2) + '" text-anchor="middle" font-size="4" fill="rgba(148,163,184,0.6)">' + c.label + '</text>';
          }).join('')}
          ${TOPICS.map(t => {
            const pos = topicPositions[t.id];
            const m = store.getTopicMastery(t.id, null);
            const pct = m?.mastery || 0;
            const fill = colors[t.color] || '#94a3b8';
            const radius = 12 + (pct / 100) * 6;
            return '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="' + radius + '" fill="' + fill + '" opacity="0.2"/><circle cx="' + pos.x + '" cy="' + pos.y + '" r="8" fill="' + fill + '" opacity="0.8"/><text x="' + pos.x + '" y="' + (pos.y + 18) + '" text-anchor="middle" font-size="5" fill="currentColor" class="text-slate-600 dark:text-slate-400">' + t.title.split(' ')[0] + '</text>';
          }).join('')}
        </svg>
        <p class="text-xs text-slate-400 text-center mt-2">Node size reflects mastery level</p>
      </div>
    </section>
  `;
}

function renderFlashcardForecast() {
  const fc = store.get('flashcards');
  const reviews = fc?.reviews || {};
  const entries = Object.values(reviews);
  if (entries.length < 3) return '';

  const now = Date.now();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = now + i * 86400000;
    const dayEnd = dayStart + 86400000;
    const due = entries.filter(r => r.nextReview && r.nextReview >= (i === 0 ? 0 : dayStart) && r.nextReview < dayEnd).length;
    days.push({ label: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short' }), count: due });
  }

  const maxCount = Math.max(...days.map(d => d.count), 1);

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="calendar-days" class="w-5 h-5 text-violet-500"></i> Review Forecast
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-end gap-2 h-24">
          ${days.map(d => {
            const h = Math.max(4, Math.round((d.count / maxCount) * 80));
            const color = d.count >= 15 ? 'bg-red-400' : d.count >= 8 ? 'bg-amber-400' : d.count > 0 ? 'bg-violet-400' : 'bg-slate-200 dark:bg-slate-700';
            return `<div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-[10px] font-bold text-slate-500">${d.count}</span>
              <div class="${color} rounded-t-sm w-full" style="height:${h}px"></div>
              <span class="text-[10px] text-slate-400">${d.label}</span>
            </div>`;
          }).join('')}
        </div>
        <p class="text-xs text-slate-400 mt-3 text-center">${days[0].count} cards due today · ${days.reduce((s, d) => s + d.count, 0)} total this week</p>
      </div>
    </section>
  `;
}

function renderCompletionForecast() {
  try {
    const times = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
    const feed = JSON.parse(localStorage.getItem('htgaa-week2-activity-feed') || '[]');
    if (feed.length < 5) return '';
    // Calculate daily study rate (minutes per day over last 7 days)
    const weekAgo = Date.now() - 7 * 86400000;
    const recentFeed = feed.filter(function(a) { return new Date(a.time).getTime() > weekAgo; });
    const daysActive = new Set(recentFeed.map(function(a) { return new Date(a.time).toISOString().slice(0, 10); })).size;
    if (daysActive === 0) return '';
    const forecasts = TOPICS.map(function(t) {
      var m = store.getTopicMastery(t.id);
      var mastery = m?.mastery || 0;
      if (mastery >= 95) return null;
      var remaining = 100 - mastery;
      var minsSpent = Math.round((times[t.id] || 0) / 60);
      var rate = mastery > 0 && minsSpent > 0 ? mastery / minsSpent : 2;
      var minsNeeded = Math.round(remaining / rate);
      var daysNeeded = Math.max(1, Math.ceil(minsNeeded / (30 / daysActive)));
      return { topic: t, mastery: mastery, daysNeeded: daysNeeded, remaining: remaining };
    }).filter(Boolean);
    if (forecasts.length === 0) return '';
    forecasts.sort(function(a, b) { return a.daysNeeded - b.daysNeeded; });
    return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="calendar-clock" class="w-5 h-5 text-indigo-500"></i> Completion Forecast
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="space-y-2">
          ${forecasts.map(function(f) {
            var c = f.daysNeeded <= 3 ? 'green' : f.daysNeeded <= 7 ? 'blue' : 'amber';
            return '<div class="flex items-center gap-3"><i data-lucide="' + f.topic.icon + '" class="w-4 h-4 text-' + f.topic.color + '-500 flex-shrink-0"></i><span class="text-sm w-24 truncate">' + f.topic.title.split(' ')[0] + '</span><div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-' + f.topic.color + '-400 rounded-full" style="width:' + f.mastery + '%"></div></div><span class="text-xs font-medium text-' + c + '-600">~' + f.daysNeeded + 'd</span></div>';
          }).join('')}
        </div>
        <p class="text-[10px] text-slate-400 text-center mt-3">Based on your study pace of ${daysActive} active days/week</p>
      </div>
    </section>
    `;
  } catch { return ''; }
}

function renderWeeklyGoal() {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString().slice(0, 10);

    // Count flashcard reviews this week
    const fcSessions = JSON.parse(localStorage.getItem('htgaa-fc-sessions') || '[]');
    let fcThisWeek = 0;
    fcSessions.forEach(function(s) {
      if (s.date >= weekKey) fcThisWeek += s.reviewed;
    });

    // Count exams this week
    const examScores = store.getExamScores();
    let examsThisWeek = 0;
    examScores.forEach(function(s) {
      if (s.date && new Date(s.date) >= weekStart) examsThisWeek++;
    });

    // Count study minutes this week
    const feed = JSON.parse(localStorage.getItem('htgaa-week2-activity-feed') || '[]');
    let studyMinsThisWeek = 0;
    const times = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
    const totalSecs = Object.values(times).reduce(function(s, v) { return s + v; }, 0);
    studyMinsThisWeek = Math.round(totalSecs / 60);

    const goals = [
      { label: 'Flashcards', current: fcThisWeek, target: 30, icon: 'layers', color: 'violet' },
      { label: 'Exams', current: examsThisWeek, target: 3, icon: 'trophy', color: 'amber' },
      { label: 'Study mins', current: studyMinsThisWeek, target: 120, icon: 'clock', color: 'cyan' }
    ];

    const overallPct = Math.min(100, Math.round(goals.reduce(function(s, g) { return s + Math.min(100, (g.current / g.target) * 100); }, 0) / goals.length));

    return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="target" class="w-5 h-5 text-orange-500"></i> Weekly Goals
        <span class="text-sm font-normal text-slate-400">${overallPct}% complete</span>
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-4">
          <div class="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all" style="width:${overallPct}%"></div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          ${goals.map(function(g) {
            var pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return '<div class="text-center"><div class="text-lg font-bold text-' + g.color + '-600 dark:text-' + g.color + '-400">' + g.current + '<span class="text-xs text-slate-400 font-normal">/' + g.target + '</span></div><div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1 mb-1"><div class="h-full rounded-full bg-' + g.color + '-500" style="width:' + pct + '%"></div></div><div class="text-[10px] text-slate-500">' + g.label + '</div></div>';
          }).join('')}
        </div>
      </div>
    </section>
    `;
  } catch { return ''; }
}

function renderStudyPlanner(progress) {
  const incomplete = TOPICS.filter(t => !progress[t.id]);
  if (incomplete.length === 0) return ''; // All done!

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const todayDay = today.getDay();

  // Spread remaining topics across the next 7 days, 1 per day, skipping none
  const plan = [];
  for (let i = 0; i < Math.min(7, incomplete.length); i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const topic = incomplete[i];
    const readingTimes = { 'sequencing': 35, 'synthesis': 35, 'editing': 35, 'genetic-codes': 28, 'gel-electrophoresis': 28, 'central-dogma': 35 };
    plan.push({
      day: dayNames[d.getDay()],
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: i === 0,
      topic,
      time: readingTimes[topic.id] || 30,
    });
  }

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="calendar-check" class="w-5 h-5 text-indigo-500"></i> Study Plan
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">${incomplete.length} topic${incomplete.length > 1 ? 's' : ''} remaining — here's a suggested schedule:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(plan.length, 4)} gap-3">
          ${plan.map(p => `
            <a data-route="#/topic/${p.topic.id}" class="block p-3 rounded-lg border ${p.isToday ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'} hover:border-indigo-400 cursor-pointer transition-colors">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold ${p.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}">${p.isToday ? 'Today' : p.day}</span>
                <span class="text-xs text-slate-400">${p.date}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-${p.topic.color}-100 dark:bg-${p.topic.color}-900/40 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="${p.topic.icon}" class="w-4 h-4 text-${p.topic.color}-600 dark:text-${p.topic.color}-400"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold leading-tight">${p.topic.title}</p>
                  <p class="text-xs text-slate-400">${p.time} min</p>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderActivityFeed() {
  const feed = store.getActivityFeed(5);
  if (feed.length === 0) return '';

  const icons = { quiz: 'help-circle', flashcard: 'layers', complete: 'check-circle-2', section: 'book-open' };
  const colors = { quiz: 'blue', flashcard: 'violet', complete: 'green', section: 'slate' };
  const labels = {
    quiz: (d) => `Answered quiz question ${d.correct ? 'correctly' : 'incorrectly'}`,
    flashcard: (d) => `Reviewed flashcard`,
    complete: (d) => {
      const topic = TOPICS.find(t => t.id === d.topicId);
      return `Completed ${topic?.title || d.topicId}`;
    },
    section: (d) => {
      const topic = TOPICS.find(t => t.id === d.topicId);
      return `Read section in ${topic?.title || d.topicId}`;
    },
  };

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="history" class="w-5 h-5 text-slate-400"></i> Recent Activity
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
        ${feed.map(item => {
          const icon = icons[item.action] || 'activity';
          const color = colors[item.action] || 'slate';
          const label = labels[item.action] ? labels[item.action](item.detail || {}) : item.action;
          return `
            <div class="flex items-center gap-3 px-4 py-3">
              <div class="w-8 h-8 rounded-lg bg-${color}-100 dark:bg-${color}-900/40 flex items-center justify-center flex-shrink-0">
                <i data-lucide="${icon}" class="w-4 h-4 text-${color}-500"></i>
              </div>
              <span class="text-sm flex-1">${label}</span>
              <span class="text-xs text-slate-400">${timeAgo(item.time)}</span>
            </div>
          `;
        }).join('')}
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
  const difficulties = {
    'central-dogma': { level: 'Foundational', color: 'green' },
    'genetic-codes': { level: 'Intermediate', color: 'amber' },
    'gel-electrophoresis': { level: 'Foundational', color: 'green' },
    'sequencing': { level: 'Intermediate', color: 'amber' },
    'synthesis': { level: 'Advanced', color: 'red' },
    'editing': { level: 'Advanced', color: 'red' },
  };
  const diff = difficulties[topic.id] || { level: 'Intermediate', color: 'amber' };
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
          <div class="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span class="px-1.5 py-0.5 rounded text-${diff.color}-600 dark:text-${diff.color}-400 bg-${diff.color}-50 dark:bg-${diff.color}-900/20 font-medium">${diff.level}</span>
            <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${readingTimes[topic.id] || 30} min</span>
            ${quizScore ? `<span>Quiz: ${quizScore.correct}/${quizScore.total}</span>` : ''}
            ${sectionsRead > 0 ? `<span class="flex items-center gap-1"><i data-lucide="book-open" class="w-3 h-3"></i> ${sectionsRead}/${totalSections} read</span>` : ''}
            ${sectionsRead === 0 ? `<span class="flex items-center gap-1"><i data-lucide="arrow-right" class="w-3 h-3"></i> Start reading</span>` : ''}
            ${(() => {
              const m = store.getTopicMastery(topic.id, null);
              return m && m.mastery > 0 ? `<span class="font-semibold text-${m.mastery >= 80 ? 'green' : m.mastery >= 50 ? 'amber' : 'slate'}-600 dark:text-${m.mastery >= 80 ? 'green' : m.mastery >= 50 ? 'amber' : 'slate'}-400">${m.mastery}% mastery</span>` : '';
            })()}
            ${(() => {
              try {
                const pos = JSON.parse(localStorage.getItem('htgaa-week2-scroll-pos') || '{}');
                const ts = pos[topic.id]?.ts;
                if (!ts) return '';
                const ago = Date.now() - ts;
                const agoStr = ago < 3600000 ? 'just now' : ago < 86400000 ? `${Math.floor(ago / 3600000)}h ago` : `${Math.floor(ago / 86400000)}d ago`;
                return `<span class="text-slate-400">${agoStr}</span>`;
              } catch { return ''; }
            })()}
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
  const reviews = fc.reviews || {};
  const reviewed = Object.keys(reviews).length;
  if (reviewed === 0) return '0';
  const mastered = Object.values(reviews).filter(r => r.interval >= 21).length;
  return mastered > 0 ? `${reviewed} (${mastered}★)` : `${reviewed}`;
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

function getEstimatedRemaining(progress) {
  const readingTimes = { 'central-dogma': 35, 'genetic-codes': 30, 'gel-electrophoresis': 30, 'sequencing': 35, 'synthesis': 35, 'editing': 35 };
  let remaining = 0;
  TOPICS.forEach(t => {
    if (!progress[t.id]) {
      const sectionCounts = { 'sequencing': 7, 'synthesis': 7, 'editing': 7, 'genetic-codes': 6, 'gel-electrophoresis': 6, 'central-dogma': 7 };
      const read = store.getSectionsRead(t.id).length;
      const total = sectionCounts[t.id] || 6;
      const topicTime = readingTimes[t.id] || 30;
      remaining += Math.round(topicTime * (1 - read / total));
    }
  });
  if (remaining === 0) return 'Done!';
  if (remaining < 60) return `~${remaining}m`;
  const hrs = Math.floor(remaining / 60);
  return `~${hrs}h ${remaining % 60}m`;
}

function renderSessionTimeline() {
  let activityFeed;
  try { activityFeed = JSON.parse(localStorage.getItem('htgaa-week2-activity-feed') || '[]'); } catch { return ''; }
  if (activityFeed.length === 0) return '';

  // Group by date, show last 7 days
  const byDate = {};
  const now = new Date();
  activityFeed.forEach(entry => {
    const d = new Date(entry.time);
    const key = d.toISOString().split('T')[0];
    const daysAgo = Math.floor((now - d) / 86400000);
    if (daysAgo > 6) return;
    if (!byDate[key]) byDate[key] = { entries: [], totalMin: 0 };
    byDate[key].entries.push(entry);
  });

  // Add time data
  let timeData;
  try { timeData = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}'); } catch { timeData = {}; }

  const dates = Object.keys(byDate).sort().reverse().slice(0, 7);
  if (dates.length === 0) return '';

  const icons = {
    'section-read': 'book-open',
    'quiz-complete': 'check-circle',
    'flashcard-review': 'layers',
    'exam-complete': 'trophy',
    'topic-complete': 'flag',
  };
  const colors = {
    'section-read': 'blue',
    'quiz-complete': 'green',
    'flashcard-review': 'violet',
    'exam-complete': 'amber',
    'topic-complete': 'emerald',
  };

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="calendar-clock" class="w-5 h-5 text-cyan-500"></i> Recent Sessions
      </h2>
      <div class="space-y-3">
        ${dates.map(dateStr => {
          const d = new Date(dateStr + 'T12:00:00');
          const isToday = dateStr === now.toISOString().split('T')[0];
          const label = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          const entries = byDate[dateStr].entries.slice(-5); // Last 5 per day
          return `
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold ${isToday ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'}">${label}</span>
              <span class="text-xs text-slate-400">${entries.length} ${entries.length === 1 ? 'activity' : 'activities'}</span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              ${entries.map(e => {
                const icon = icons[e.type] || 'circle';
                const color = colors[e.type] || 'slate';
                const msg = (e.message || e.type || '').replace(/"/g, '&quot;');
                const shortMsg = msg.substring(0, 40);
                return `<span class="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-${color}-50 dark:bg-${color}-900/20 text-${color}-700 dark:text-${color}-400" title="${msg}">
                  <i data-lucide="${icon}" class="w-3 h-3"></i> ${shortMsg}
                </span>`;
              }).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </section>
  `;
}

function renderTimeDistribution() {
  let timeData;
  try { timeData = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}'); } catch { return ''; }
  const segments = TOPICS.map(t => ({ topic: t, minutes: timeData[t.id] || 0 })).filter(s => s.minutes > 0);
  if (segments.length === 0) return '';

  const total = segments.reduce((s, seg) => s + seg.minutes, 0);
  const colors = { blue: '#3b82f6', green: '#22c55e', red: '#ef4444', purple: '#a855f7', yellow: '#eab308', indigo: '#6366f1' };
  const cx = 60, cy = 60, r = 50, innerR = 30;

  let startAngle = -Math.PI / 2;
  const arcs = segments.map(seg => {
    const sweep = (seg.minutes / total) * 2 * Math.PI;
    const endAngle = startAngle + sweep;
    const largeArc = sweep > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle), iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle), iy2 = cy + innerR * Math.sin(startAngle);
    const path = `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${ix1},${iy1} A${innerR},${innerR} 0 ${largeArc} 0 ${ix2},${iy2} Z`;
    startAngle = endAngle;
    return `<path d="${path}" fill="${colors[seg.topic.color] || '#94a3b8'}" opacity="0.8"/>`;
  }).join('');

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="pie-chart" class="w-5 h-5 text-violet-500"></i> Time Distribution
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center gap-6">
          <svg viewBox="0 0 120 120" class="w-28 h-28 flex-shrink-0">
            ${arcs}
            <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="currentColor" font-size="12" font-weight="bold" class="text-slate-700 dark:text-slate-200">${total}</text>
            <text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="currentColor" font-size="6" class="text-slate-400">min</text>
          </svg>
          <div class="flex-1 grid grid-cols-2 gap-2">
            ${segments.sort((a, b) => b.minutes - a.minutes).map(seg => `
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-sm flex-shrink-0" style="background:${colors[seg.topic.color] || '#94a3b8'}"></span>
                <span class="text-xs text-slate-600 dark:text-slate-400 truncate">${seg.topic.title.split(' ')[0]}</span>
                <span class="text-xs font-bold ml-auto">${seg.minutes}m</span>
                <span class="text-[10px] text-slate-400">${Math.round((seg.minutes / total) * 100)}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderKnowledgeRadar() {
  const topics = TOPICS.map(t => {
    const m = store.getTopicMastery(t.id, null);
    return { topic: t, mastery: m?.mastery || 0 };
  });
  if (topics.every(t => t.mastery === 0)) return '';

  const n = topics.length;
  const cx = 100, cy = 100, r = 70;
  const angleStep = (2 * Math.PI) / n;

  const gridCircles = [25, 50, 75, 100].map(pct => {
    const gr = (pct / 100) * r;
    return `<circle cx="${cx}" cy="${cy}" r="${gr}" fill="none" stroke="rgba(148,163,184,0.15)" stroke-width="0.5"/>`;
  }).join('');

  const axes = topics.map(({ topic }, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const lx = cx + (r + 16) * Math.cos(angle);
    const ly = cy + (r + 16) * Math.sin(angle);
    return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(148,163,184,0.2)" stroke-width="0.5"/>
      <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" fill="currentColor" font-size="5.5" class="text-slate-500">${topic.title.split(' ')[0]}</text>`;
  }).join('');

  const points = topics.map(({ mastery }, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + (mastery / 100) * r * Math.cos(angle);
    const y = cy + (mastery / 100) * r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const dots = topics.map(({ topic, mastery }, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + (mastery / 100) * r * Math.cos(angle);
    const y = cy + (mastery / 100) * r * Math.sin(angle);
    const colors = { blue: '#3b82f6', green: '#22c55e', red: '#ef4444', purple: '#a855f7', yellow: '#eab308', indigo: '#6366f1' };
    return `<circle cx="${x}" cy="${y}" r="3" fill="${colors[topic.color] || '#3b82f6'}" stroke="white" stroke-width="1"/>`;
  }).join('');

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="radar" class="w-5 h-5 text-violet-500"></i> Knowledge Radar
      </h2>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex justify-center">
        <svg viewBox="0 0 200 200" class="w-64 h-64 text-slate-600 dark:text-slate-400">
          ${gridCircles}
          ${axes}
          <polygon points="${points}" fill="rgba(99,102,241,0.12)" stroke="#6366f1" stroke-width="1.5" stroke-linejoin="round"/>
          ${dots}
        </svg>
      </div>
    </section>
  `;
}

function getSessionCount() {
  const examScores = store.getExamScores();
  const feed = JSON.parse(localStorage.getItem('htgaa-week2-activity-feed') || '[]');
  // Count distinct flashcard sessions (group by 10-min windows)
  const fcTimes = feed.filter(a => a.action === 'flashcard').map(a => a.time);
  let fcSessions = 0;
  let lastSessionTime = 0;
  fcTimes.sort().forEach(t => {
    if (t - lastSessionTime > 600000) { fcSessions++; lastSessionTime = t; }
  });
  return `${examScores.length + fcSessions}`;
}

function getSectionsReadStats() {
  let read = 0;
  let total = 0;
  TOPICS.forEach(t => {
    const sr = store.getSectionsRead(t.id);
    read += sr.read;
    total += sr.total;
  });
  if (total === 0) return '0';
  return `${read}/${total}`;
}

function renderWeeklyComparison() {
  const log = store.getStudyLog();
  const today = new Date();
  const getWeekDays = (weeksAgo) => {
    const days = [];
    for (let d = 6; d >= 0; d--) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - d - (weeksAgo * 7));
      days.push(dt.toISOString().slice(0, 10));
    }
    return days;
  };
  const thisWeek = getWeekDays(0);
  const lastWeek = getWeekDays(1);
  const thisCount = thisWeek.reduce((s, d) => s + (log[d] || 0), 0);
  const lastCount = lastWeek.reduce((s, d) => s + (log[d] || 0), 0);
  if (thisCount === 0 && lastCount === 0) return '';
  const diff = thisCount - lastCount;
  const diffPct = lastCount > 0 ? Math.round((diff / lastCount) * 100) : thisCount > 0 ? 100 : 0;
  const color = diff > 0 ? 'green' : diff < 0 ? 'red' : 'slate';
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '—';
  return `
  <div class="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
      <i data-lucide="calendar-range" class="w-4 h-4 text-blue-500"></i> Weekly Comparison
    </h3>
    <div class="grid grid-cols-3 gap-4 text-center">
      <div>
        <div class="text-xl font-bold text-slate-600 dark:text-slate-300">${lastCount}</div>
        <div class="text-[10px] text-slate-400">Last Week</div>
      </div>
      <div>
        <div class="text-xl font-bold text-${color}-600 dark:text-${color}-400">${arrow} ${Math.abs(diffPct)}%</div>
        <div class="text-[10px] text-slate-400">Change</div>
      </div>
      <div>
        <div class="text-xl font-bold text-blue-600 dark:text-blue-400">${thisCount}</div>
        <div class="text-[10px] text-slate-400">This Week</div>
      </div>
    </div>
  </div>`;
}

function getVocabMastery() {
  const fc = store.get('flashcards') || { reviews: {} };
  const reviews = fc.reviews || {};
  const total = Object.keys(reviews).length;
  if (total === 0) return '—';
  const mastered = Object.values(reviews).filter(r => r.interval >= 21).length;
  return `${Math.round((mastered / total) * 100)}%`;
}

function getLastActive() {
  const log = store.getStudyLog();
  const dates = Object.keys(log).filter(d => log[d] > 0).sort().reverse();
  if (dates.length === 0) return 'Never';
  const last = new Date(dates[0] + 'T12:00:00');
  const now = new Date();
  const diffDays = Math.floor((now - last) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return last.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getStudyPace() {
  const log = store.getStudyLog();
  const activeDays = Object.keys(log).filter(d => log[d] > 0);
  if (activeDays.length === 0) return '—';
  const totalMin = Object.values(log).reduce((s, v) => s + v, 0);
  const avgMin = Math.round(totalMin / activeDays.length);
  if (avgMin < 60) return `${avgMin}m/day`;
  return `${(avgMin / 60).toFixed(1)}h/day`;
}

function getDayStreak() {
  const log = store.getStudyLog();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (log[key] && log[key] > 0) {
      streak++;
      d = new Date(d.getTime() - 86400000);
    } else if (key === today) {
      // Today might not have activity yet, check yesterday
      d = new Date(d.getTime() - 86400000);
    } else {
      break;
    }
  }
  return streak > 0 ? `${streak}d` : '—';
}

function getEstCompletionDate() {
  const log = store.getStudyLog();
  const activeDays = Object.keys(log).filter(d => log[d] > 0);
  if (activeDays.length < 2) return '—';
  const overallPct = store.getOverallProgress();
  if (overallPct >= 100) return 'Done!';
  if (overallPct === 0) return '—';
  const firstDay = new Date(activeDays.sort()[0] + 'T00:00:00');
  const daysElapsed = Math.max(1, Math.ceil((Date.now() - firstDay) / 86400000));
  const pctPerDay = overallPct / daysElapsed;
  if (pctPerDay <= 0) return '—';
  const daysRemaining = Math.ceil((100 - overallPct) / pctPerDay);
  if (daysRemaining > 30) return `~${Math.ceil(daysRemaining / 7)}w`;
  if (daysRemaining <= 1) return 'Today';
  const targetDate = new Date(Date.now() + daysRemaining * 86400000);
  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getBestStudyDay() {
  const log = store.getStudyLog();
  const entries = Object.entries(log).filter(([, v]) => v > 0);
  if (entries.length === 0) return '—';
  const best = entries.reduce((a, b) => a[1] > b[1] ? a : b);
  const d = new Date(best[0] + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
