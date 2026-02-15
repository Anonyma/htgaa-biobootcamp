/**
 * HTGAA Week 2 — Study Summary View
 * Condensed, printable overview of all key takeaways, vocabulary, and facts.
 */

import { store, TOPICS } from '../store.js';

function createStudySummaryView() {
  let allData = [];
  return {
    async render() {
      // Load all topic data
      allData = [];
      for (const topic of TOPICS) {
        const data = await store.loadTopicData(topic.id);
        if (data) allData.push({ topic, data });
      }

      return `
        <div class="max-w-4xl mx-auto px-4 py-8 study-summary-page">
          <header class="mb-8 flex items-center justify-between print:mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center print:hidden">
                <i data-lucide="printer" class="w-6 h-6 text-rose-600 dark:text-rose-400"></i>
              </div>
              <div>
                <h1 class="text-3xl font-extrabold print:text-2xl">Study Summary</h1>
                <p class="text-sm text-slate-500">HTGAA Week 2 — All topics at a glance</p>
              </div>
            </div>
            <div class="flex items-center gap-2 print:hidden">
              <button id="summary-download-md" class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                <i data-lucide="download" class="w-4 h-4"></i> Markdown
              </button>
              <button onclick="window.print()" class="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-2">
                <i data-lucide="printer" class="w-4 h-4"></i> Print
              </button>
            </div>
          </header>

          <!-- Overall Progress -->
          ${(() => {
            const overallPct = store.getOverallProgress();
            const barColor = overallPct >= 80 ? 'bg-green-500' : overallPct >= 50 ? 'bg-amber-500' : 'bg-blue-500';
            return `
            <div class="mb-6 print:hidden">
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
                <span class="font-bold ${overallPct >= 80 ? 'text-green-600' : overallPct >= 50 ? 'text-amber-600' : 'text-blue-600'}">${overallPct}%</span>
              </div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="${barColor} h-full rounded-full transition-all duration-500" style="width:${overallPct}%"></div>
              </div>
            </div>`;
          })()}

          <!-- Summary stats -->
          <div class="mb-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 print:grid-cols-8">
            <div class="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 print:bg-blue-50">
              <div class="text-2xl font-bold text-blue-600">${allData.length}</div>
              <div class="text-xs text-slate-500">Topics</div>
            </div>
            <div class="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 print:bg-green-50">
              <div class="text-2xl font-bold text-green-600">${allData.reduce((s, d) => s + (d.data.sections?.length || 0), 0)}</div>
              <div class="text-xs text-slate-500">Sections</div>
            </div>
            <div class="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 print:bg-purple-50">
              <div class="text-2xl font-bold text-purple-600">${allData.reduce((s, d) => s + (d.data.vocabulary?.length || 0), 0)}</div>
              <div class="text-xs text-slate-500">Vocab Terms</div>
            </div>
            <div class="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 print:bg-amber-50">
              <div class="text-2xl font-bold text-amber-600">${allData.reduce((s, d) => s + (d.data.keyFacts?.length || 0), 0)}</div>
              <div class="text-xs text-slate-500">Key Facts</div>
            </div>
            <div class="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 print:bg-emerald-50">
              ${(() => {
                const masteries = allData.map(({ topic, data }) => store.getTopicMastery(topic.id, data));
                const validMasteries = masteries.filter(m => m && m.mastery > 0);
                const avg = validMasteries.length > 0 ? Math.round(validMasteries.reduce((s, m) => s + m.mastery, 0) / validMasteries.length) : 0;
                const c = avg >= 80 ? 'emerald' : avg >= 50 ? 'amber' : 'slate';
                return `<div class="text-2xl font-bold text-${c}-600">${avg}%</div>
                <div class="text-xs text-slate-500">Avg Mastery</div>`;
              })()}
            </div>
            <div class="text-center p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 print:bg-cyan-50">
              ${(() => {
                try {
                  const t = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
                  const total = Object.values(t).reduce((s, v) => s + v, 0);
                  const mins = Math.floor(total / 60);
                  const hrs = Math.floor(mins / 60);
                  const timeStr = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
                  return `<div class="text-2xl font-bold text-cyan-600">${timeStr}</div>
                  <div class="text-xs text-slate-500">Time Studied</div>`;
                } catch {
                  return `<div class="text-2xl font-bold text-cyan-600">0m</div>
                  <div class="text-xs text-slate-500">Time Studied</div>`;
                }
              })()}
            </div>
            <div class="text-center p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 print:bg-rose-50">
              ${(() => {
                const scores = store.getExamScores();
                const examQs = scores.reduce((s, sc) => s + sc.total, 0);
                let quizQs = 0;
                TOPICS.forEach(t => {
                  const qs = store.getQuizScore(t.id);
                  if (qs) quizQs += qs.total;
                });
                const total = examQs + quizQs;
                return `<div class="text-2xl font-bold text-rose-600">${total}</div>
                <div class="text-xs text-slate-500">Qs Answered</div>`;
              })()}
            </div>
            <div class="text-center p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 print:bg-indigo-50">
              ${(() => {
                const fc = store.get('flashcards') || { reviews: {} };
                const reviews = Object.values(fc.reviews || {});
                const total = reviews.length;
                const due = reviews.filter(r => r.nextReview && r.nextReview <= Date.now()).length;
                return `<div class="text-2xl font-bold text-indigo-600">${total}</div>
                <div class="text-xs text-slate-500">Cards Seen${due > 0 ? ` (${due} due)` : ''}</div>`;
              })()}
            </div>
          </div>

          <!-- Exam Readiness Gauge -->
          ${(() => {
            const masteries = allData.map(({ topic, data }) => store.getTopicMastery(topic.id, data));
            const avgMastery = masteries.filter(m => m && m.mastery > 0).length > 0
              ? Math.round(masteries.filter(m => m).reduce((s, m) => s + m.mastery, 0) / allData.length) : 0;
            const best = store.getBestExamScore();
            const examBonus = best ? Math.min(20, Math.round(best.pct / 5)) : 0;
            const fcStats = store.getFlashcardStats();
            const fcBonus = fcStats.total > 0 ? Math.min(10, Math.round((fcStats.total / allData.reduce((s, d) => s + (d.data.vocabulary?.length || 0), 0)) * 10)) : 0;
            const readiness = Math.min(100, Math.round(avgMastery * 0.7 + examBonus + fcBonus));
            if (readiness === 0) return '';
            const color = readiness >= 80 ? 'green' : readiness >= 50 ? 'amber' : 'red';
            const label = readiness >= 80 ? 'Well Prepared' : readiness >= 60 ? 'Getting There' : readiness >= 30 ? 'Keep Studying' : 'Just Starting';
            return `
            <div class="mb-8 bg-${color}-50 dark:bg-${color}-900/10 rounded-xl p-5 border border-${color}-200 dark:border-${color}-800 print:bg-${color}-50">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full border-4 border-${color}-400 flex items-center justify-center flex-shrink-0">
                  <span class="text-xl font-bold text-${color}-600">${readiness}%</span>
                </div>
                <div>
                  <h3 class="font-bold text-${color}-800 dark:text-${color}-300">Exam Readiness: ${label}</h3>
                  <p class="text-xs text-${color}-600 dark:text-${color}-400 mt-1">Based on mastery (70%), exam scores (20%), and flashcard reviews (10%)</p>
                </div>
                <div class="ml-auto flex-shrink-0 w-12 h-12 rounded-xl bg-${color}-200 dark:bg-${color}-800 flex items-center justify-center">
                  <span class="text-xl font-black text-${color}-700 dark:text-${color}-300">${readiness >= 90 ? 'A' : readiness >= 80 ? 'B' : readiness >= 70 ? 'C' : readiness >= 60 ? 'D' : 'F'}</span>
                </div>
              </div>
            </div>`;
          })()}

          <!-- Strongest/Weakest -->
          ${(() => {
            const ranked = allData.map(({ topic, data }) => {
              const m = store.getTopicMastery(topic.id, data);
              return { topic, mastery: m?.mastery || 0 };
            }).filter(r => r.mastery > 0).sort((a, b) => b.mastery - a.mastery);
            if (ranked.length < 2) return '';
            const strongest = ranked[0];
            const weakest = ranked[ranked.length - 1];
            if (strongest.mastery === weakest.mastery) return '';
            return `
            <div class="mb-8 grid grid-cols-2 gap-4 print:grid-cols-2">
              <div class="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div class="flex items-center gap-2 mb-1">
                  <i data-lucide="trophy" class="w-4 h-4 text-green-500"></i>
                  <span class="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">Strongest Topic</span>
                </div>
                <p class="font-bold text-slate-800 dark:text-slate-200">${strongest.topic.title}</p>
                <p class="text-sm text-green-600 dark:text-green-400 font-medium">${strongest.mastery}% mastery</p>
              </div>
              <div class="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div class="flex items-center gap-2 mb-1">
                  <i data-lucide="target" class="w-4 h-4 text-amber-500"></i>
                  <span class="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Needs Work</span>
                </div>
                <p class="font-bold text-slate-800 dark:text-slate-200">${weakest.topic.title}</p>
                <p class="text-sm text-amber-600 dark:text-amber-400 font-medium">${weakest.mastery}% mastery</p>
              </div>
            </div>`;
          })()}

          <!-- Time Per Topic -->
          ${(() => {
            try {
              const times = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
              const entries = allData.map(({ topic }) => ({ topic, secs: times[topic.id] || 0 })).filter(e => e.secs > 0);
              if (entries.length === 0) return '';
              const maxSecs = Math.max(...entries.map(e => e.secs), 1);
              const fmtTime = (s) => { const m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`; };
              return `
              <div class="mb-8 print:mb-4">
                <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
                  <i data-lucide="clock" class="w-5 h-5 text-cyan-500"></i> Time Per Topic
                </h2>
                <div class="space-y-2">
                  ${entries.map(e => `
                    <div class="flex items-center gap-3">
                      <span class="text-xs font-medium w-32 truncate text-${e.topic.color}-600 dark:text-${e.topic.color}-400">${e.topic.title}</span>
                      <div class="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-full bg-${e.topic.color}-400 rounded-full" style="width:${(e.secs/maxSecs)*100}%"></div>
                      </div>
                      <span class="text-xs text-slate-500 w-12 text-right">${fmtTime(e.secs)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>`;
            } catch { return ''; }
          })()}

          <!-- Study Efficiency -->
          ${(() => {
            try {
              const times = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}');
              const efficiency = allData.map(({ topic, data }) => {
                const m = store.getTopicMastery(topic.id, data);
                const secs = times[topic.id] || 0;
                const mins = Math.round(secs / 60);
                const mastery = m?.mastery || 0;
                const eff = mins > 0 ? Math.round(mastery / mins * 10) / 10 : 0;
                return { topic, mins, mastery, efficiency: eff };
              }).filter(e => e.mins > 0 && e.mastery > 0).sort((a, b) => b.efficiency - a.efficiency);
              if (efficiency.length < 2) return '';
              return '<div class="mb-8 print:mb-4"><h2 class="text-lg font-bold mb-3 flex items-center gap-2"><i data-lucide="gauge" class="w-5 h-5 text-emerald-500"></i> Study Efficiency</h2><p class="text-xs text-slate-400 mb-3">Mastery gained per minute of study time</p><div class="grid grid-cols-' + Math.min(efficiency.length, 3) + ' gap-3">' + efficiency.map(function(e) { var c = e.efficiency >= 3 ? 'green' : e.efficiency >= 1.5 ? 'blue' : 'amber'; return '<div class="text-center p-3 rounded-xl bg-' + c + '-50 dark:bg-' + c + '-900/10 border border-' + c + '-200 dark:border-' + c + '-800"><i data-lucide="' + e.topic.icon + '" class="w-5 h-5 text-' + e.topic.color + '-500 mx-auto mb-1"></i><div class="text-lg font-bold text-' + c + '-600">' + e.efficiency + '</div><div class="text-[10px] text-slate-500">mastery/min</div><div class="text-xs text-slate-400 mt-1">' + e.mastery + '% in ' + e.mins + 'm</div></div>'; }).join('') + '</div></div>';
            } catch { return ''; }
          })()}

          <!-- Focus Areas -->
          ${(() => {
            const unread = [];
            allData.forEach(({ topic, data }) => {
              const sectionsRead = store.getSectionsRead(topic.id);
              const totalSections = (data.sections || []).length;
              const readCount = sectionsRead ? Object.values(sectionsRead).filter(Boolean).length : 0;
              if (totalSections > 0 && readCount < totalSections) {
                const remaining = totalSections - readCount;
                unread.push({ topic, remaining, total: totalSections, pct: Math.round((readCount / totalSections) * 100) });
              }
            });
            if (unread.length === 0) return '';
            unread.sort((a, b) => a.pct - b.pct);
            return '<div class="mb-8 print:mb-4"><h2 class="text-lg font-bold mb-3 flex items-center gap-2"><i data-lucide="focus" class="w-5 h-5 text-orange-500"></i> Focus Areas</h2><p class="text-xs text-slate-400 mb-3">Topics with unread sections</p><div class="space-y-2">' + unread.map(function(u) { return '<div class="flex items-center gap-3"><i data-lucide="' + u.topic.icon + '" class="w-4 h-4 text-' + u.topic.color + '-500 flex-shrink-0"></i><span class="text-sm font-medium w-28 truncate">' + u.topic.title.split(' ')[0] + '</span><div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-' + u.topic.color + '-400 rounded-full" style="width:' + u.pct + '%"></div></div><span class="text-xs text-slate-500">' + u.remaining + ' left</span></div>'; }).join('') + '</div></div>';
          })()}

          ${allData.map(({ topic, data }) => `
            <section class="mb-8 page-break-inside-avoid">
              <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-${topic.color}-600 dark:text-${topic.color}-400 border-b-2 border-${topic.color}-200 dark:border-${topic.color}-800 pb-2">
                <i data-lucide="${topic.icon}" class="w-5 h-5"></i>
                ${data.title}
                ${(() => {
                  const m = store.getTopicMastery(topic.id, data);
                  if (!m || m.mastery === 0) return '';
                  const c = m.mastery >= 80 ? 'green' : m.mastery >= 50 ? 'amber' : 'red';
                  return `<span class="ml-auto text-sm font-bold text-${c}-600 dark:text-${c}-400 print:text-${c}-700">${m.mastery}% mastery</span>`;
                })()}
              </h2>
              ${(() => {
                const m = store.getTopicMastery(topic.id, data);
                if (!m || m.mastery === 0) return '';
                const timeSpent = (() => { try { const ts = JSON.parse(localStorage.getItem('htgaa-week2-time-spent') || '{}'); return ts[topic.id] || 0; } catch { return 0; } })();
                const targetMin = data.readingTime || 30;
                const remaining = Math.max(0, targetMin - timeSpent);
                return `<div class="mb-3 flex gap-4 text-xs text-slate-500 print:text-slate-600 flex-wrap">
                  <span>Sections: ${m.sectionPct}%</span>
                  <span>Quiz: ${m.quizPct}%</span>
                  <span>Flashcards: ${m.fcPct}%</span>
                  <span>Time: ${m.timePct}%</span>
                  ${remaining > 0 ? `<span class="text-amber-500">~${remaining}m remaining</span>` : `<span class="text-green-500">Time goal met</span>`}
                </div>`;
              })()}

              ${(() => {
                const qs = store.getQuizScore(topic.id);
                if (!qs) return '';
                const pct = Math.round((qs.correct / qs.total) * 100);
                const c = pct >= 80 ? 'green' : pct >= 60 ? 'amber' : 'red';
                return `<div class="mb-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-${c}-50 dark:bg-${c}-900/10 border border-${c}-200 dark:border-${c}-800">
                  <i data-lucide="help-circle" class="w-3 h-3 text-${c}-500"></i>
                  <span class="text-${c}-700 dark:text-${c}-400 font-medium">Quiz: ${qs.correct}/${qs.total} (${pct}%)</span>
                </div>`;
              })()}

              ${(() => {
                const dcCount = data.designChallenges?.length || 0;
                const qCount = data.quizQuestions?.length || 0;
                if (dcCount === 0 && qCount === 0) return '';
                return `<div class="mb-3 flex gap-2 flex-wrap">
                  ${qCount > 0 ? `<span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"><i data-lucide="help-circle" class="w-3 h-3"></i> ${qCount} quiz questions</span>` : ''}
                  ${dcCount > 0 ? `<span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400"><i data-lucide="lightbulb" class="w-3 h-3"></i> ${dcCount} design challenges</span>` : ''}
                </div>`;
              })()}

              ${(() => {
                const sr = store.getSectionsRead(topic.id);
                const totalSections = data.sections?.length || 0;
                if (totalSections === 0) return '';
                return `<div class="mb-3 flex items-center gap-2 text-xs">
                  <span class="text-slate-500">Sections:</span>
                  <div class="flex gap-0.5">
                    ${(data.sections || []).map((s, i) => {
                      const isRead = sr.sections ? sr.sections.includes(s.id || `section-${i}`) : false;
                      return `<div class="w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold ${isRead ? `bg-${topic.color}-200 dark:bg-${topic.color}-800 text-${topic.color}-700 dark:text-${topic.color}-300` : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}" title="${s.title}">${i + 1}</div>`;
                    }).join('')}
                  </div>
                  <span class="text-slate-400">${sr.read || 0}/${totalSections}</span>
                </div>`;
              })()}

              ${data.learningObjectives ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Learning Objectives</h3>
                  <ul class="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
                    ${data.learningObjectives.map(obj => `<li class="list-disc">${obj}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${(data.sections || []).some(s => s.takeaway) ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Key Takeaways</h3>
                  <div class="space-y-2">
                    ${data.sections.filter(s => s.takeaway).map(s => `
                      <div class="text-sm border-l-3 border-${topic.color}-300 dark:border-${topic.color}-700 pl-3 py-1">
                        <span class="font-semibold">${s.title}:</span>
                        <span class="text-slate-600 dark:text-slate-400">${s.takeaway}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${data.keyFacts?.length ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Key Facts</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    ${data.keyFacts.map(f => `
                      <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <span class="font-semibold">${f.label || f.fact || ''}</span>
                        ${f.value ? `<span class="text-${topic.color}-600 dark:text-${topic.color}-400 font-bold ml-1">${f.value}</span>` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${data.quickReference?.length ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Quick Reference</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    ${data.quickReference.map(qr => `
                      <div class="p-2 rounded-lg bg-${topic.color}-50 dark:bg-${topic.color}-900/10 border border-${topic.color}-200 dark:border-${topic.color}-800">
                        <span class="font-bold text-xs">${qr.title}</span>
                        <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">${qr.content?.substring(0, 200) || ''}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${data.homeworkConnections?.length ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Homework Connections</h3>
                  <div class="space-y-1.5 text-xs">
                    ${data.homeworkConnections.map(hc => `
                      <div class="flex items-start gap-2 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800">
                        <span class="flex-shrink-0 px-1.5 py-0.5 rounded bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200 font-bold">Part ${hc.hwPart}</span>
                        <div>
                          <span class="font-semibold text-teal-700 dark:text-teal-300">${hc.title}</span>
                          <p class="text-slate-500 dark:text-slate-400 mt-0.5">${hc.relevance}</p>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${data.conceptConnections?.length ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Connections to Other Topics</h3>
                  <div class="text-xs space-y-1">
                    ${data.conceptConnections.map(c => `
                      <div class="flex items-center gap-2">
                        <span class="text-slate-400">&rarr;</span>
                        <span><strong>${TOPICS.find(t => t.id === c.toTopic)?.title || c.toTopic}</strong>: ${c.relationship}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${data.vocabulary?.length ? `
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Vocabulary (${data.vocabulary.length} terms)${(() => {
                    const fcData = store.get('flashcards') || { reviews: {} };
                    const reviews = fcData.reviews || {};
                    let mastered = 0, reviewed = 0;
                    data.vocabulary.forEach((v, vi) => {
                      const cardId = topic.id + '-vocab-' + vi;
                      const r = reviews[cardId];
                      if (r) { reviewed++; if (r.interval >= 21) mastered++; }
                    });
                    if (reviewed === 0) return '';
                    const pct = Math.round((mastered / data.vocabulary.length) * 100);
                    const color = pct >= 75 ? 'text-green-500' : pct >= 40 ? 'text-amber-500' : 'text-red-500';
                    return ` <span class="${color} text-xs font-normal ml-2">${pct}% mastered</span>`;
                  })()}</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    ${data.vocabulary.map(v => `
                      <div class="py-1">
                        <span class="font-bold">${v.term}</span>: <span class="text-slate-500 dark:text-slate-400">${v.definition}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </section>
          `).join('')}

          <!-- Cross-Topic Connection Map -->
          ${(() => {
            const allConnections = [];
            allData.forEach(({ topic, data }) => {
              (data.conceptConnections || []).forEach(c => {
                const target = TOPICS.find(t => t.id === c.toTopic);
                if (target) allConnections.push({ from: topic.title, to: target.title, relationship: c.relationship, concept: c.concept || '' });
              });
            });
            if (allConnections.length === 0) return '';
            return `
            <section class="mb-8 page-break-inside-avoid">
              <h2 class="text-xl font-bold mb-3 flex items-center gap-2 border-b-2 border-slate-300 dark:border-slate-600 pb-2">
                <i data-lucide="network" class="w-5 h-5 text-cyan-500"></i>
                Cross-Topic Connections (${allConnections.length})
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                ${allConnections.map(c => `
                  <div class="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800">
                    <div class="font-bold">${c.from} &rarr; ${c.to}</div>
                    <div class="text-slate-600 dark:text-slate-400 mt-0.5">${c.concept ? `<strong>${c.concept}:</strong> ` : ''}${c.relationship}</div>
                  </div>
                `).join('')}
              </div>
            </section>`;
          })()}

          <footer class="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 print:mt-4">
            HTGAA Spring 2026 — Week 2 Study Summary — Generated ${new Date().toLocaleDateString()}
          </footer>
        </div>
      `;
    },

    mount(container) {
      // Markdown download
      container.querySelector('#summary-download-md')?.addEventListener('click', () => {
        let md = `# HTGAA Week 2 — Study Summary\n\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
        allData.forEach(({ topic, data }) => {
          md += `## ${data.title}\n\n`;
          if (data.learningObjectives) {
            md += `### Learning Objectives\n`;
            data.learningObjectives.forEach(obj => { md += `- ${obj}\n`; });
            md += '\n';
          }
          if (data.sections?.some(s => s.takeaway)) {
            md += `### Key Takeaways\n`;
            data.sections.filter(s => s.takeaway).forEach(s => {
              md += `- **${s.title}**: ${s.takeaway}\n`;
            });
            md += '\n';
          }
          if (data.keyFacts?.length) {
            md += `### Key Facts\n`;
            data.keyFacts.forEach(f => {
              md += `- ${f.label || f.fact || ''} ${f.value || ''}\n`;
            });
            md += '\n';
          }
          if (data.quickReference?.length) {
            md += `### Quick Reference\n`;
            data.quickReference.forEach(qr => {
              md += `- **${qr.title}**: ${(qr.content || '').substring(0, 300)}\n`;
            });
            md += '\n';
          }
          if (data.vocabulary?.length) {
            md += `### Vocabulary (${data.vocabulary.length} terms)\n`;
            data.vocabulary.forEach(v => {
              md += `- **${v.term}**: ${v.definition}\n`;
            });
            md += '\n';
          }
          if (data.conceptConnections?.length) {
            md += `### Connections\n`;
            data.conceptConnections.forEach(c => {
              const target = TOPICS.find(t => t.id === c.toTopic);
              md += `- → **${target?.title || c.toTopic}**: ${c.relationship}\n`;
            });
            md += '\n';
          }
          md += '---\n\n';
        });
        const blob = new Blob([md], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'htgaa-week2-study-summary.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      });
    },
    unmount() {}
  };
}

export { createStudySummaryView };
