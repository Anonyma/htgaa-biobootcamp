/**
 * HTGAA Week 2 — Weak Points Analysis View
 * Identifies knowledge gaps from quiz mistakes, low confidence, and unread sections.
 */

import { store, TOPICS } from '../store.js';

function createWeakPointsView() {
  return {
    render() {
      const analysis = analyzeWeakPoints();

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i data-lucide="crosshair" class="w-5 h-5 text-red-600 dark:text-red-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Weak Points</h1>
                <p class="text-sm text-slate-500">Your personalized study focus areas based on quiz performance, confidence, and progress</p>
              </div>
            </div>
          </header>

          ${analysis.weakPoints.length === 0 ? `
            <div class="text-center py-16">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <i data-lucide="check-circle-2" class="w-8 h-8 text-green-500"></i>
              </div>
              <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No weak points detected</h3>
              <p class="text-sm text-slate-500 max-w-md mx-auto">
                ${analysis.hasData ? 'Great work! Keep reviewing to maintain your knowledge.' : 'Start reading topics and taking quizzes to get personalized weak point analysis.'}
              </p>
              <a data-route="#/" class="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
              </a>
            </div>
          ` : `
            <!-- Overall Score -->
            <div class="mb-8 p-5 rounded-2xl ${analysis.overallScore >= 70 ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40' : analysis.overallScore >= 40 ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40' : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40'}">
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <div class="text-3xl font-bold ${analysis.overallScore >= 70 ? 'text-green-600' : analysis.overallScore >= 40 ? 'text-amber-600' : 'text-red-600'}">${analysis.overallScore}%</div>
                  <div class="text-xs text-slate-500">Knowledge Score</div>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-slate-600 dark:text-slate-300">
                    ${analysis.overallScore >= 70
                      ? 'You have a strong foundation. Focus on the areas below to fill remaining gaps.'
                      : analysis.overallScore >= 40
                      ? 'You\'re making progress. These weak points need attention before the homework.'
                      : 'Several areas need significant review. Focus on one topic at a time.'}
                  </p>
                </div>
              </div>
            </div>

            <!-- Priority Actions -->
            <section class="mb-8">
              <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i> Priority Actions
                <span class="text-xs font-normal text-slate-400 ml-1">(${analysis.weakPoints.length} items)</span>
              </h2>
              <div class="space-y-3">
                ${analysis.weakPoints.map((wp, idx) => `
                  <div class="p-4 rounded-xl border ${wp.severity === 'high' ? 'border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-900/10' : wp.severity === 'medium' ? 'border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10' : 'border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-900/10'}">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${wp.severity === 'high' ? 'bg-red-100 dark:bg-red-900/40' : wp.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}">
                        <i data-lucide="${wp.icon}" class="w-4 h-4 ${wp.severity === 'high' ? 'text-red-500' : wp.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'}"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">${wp.title}</span>
                          <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium ${wp.severity === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : wp.severity === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}">${wp.severity}</span>
                        </div>
                        <p class="text-xs text-slate-500 mb-2">${wp.description}</p>
                        <a data-route="${wp.action}" class="inline-flex items-center gap-1.5 text-xs font-medium ${wp.severity === 'high' ? 'text-red-600 hover:text-red-700' : wp.severity === 'medium' ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700'} cursor-pointer">
                          ${wp.actionLabel} <i data-lucide="arrow-right" class="w-3 h-3"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>

            <!-- Topic Breakdown -->
            <section class="mb-8">
              <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                <i data-lucide="bar-chart-3" class="w-5 h-5 text-indigo-500"></i> Topic Breakdown
              </h2>
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                ${analysis.topicBreakdown.map(tb => `
                  <div class="p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <i data-lucide="${tb.icon}" class="w-4 h-4 text-${tb.color}-500 flex-shrink-0"></i>
                      <span class="text-sm font-semibold flex-1">${tb.title}</span>
                      <span class="text-sm font-bold ${tb.score >= 70 ? 'text-green-600' : tb.score >= 40 ? 'text-amber-600' : tb.score > 0 ? 'text-red-600' : 'text-slate-400'}">${tb.score}%</span>
                    </div>
                    <div class="grid grid-cols-4 gap-2 text-xs text-slate-500">
                      <div><span class="font-medium text-slate-600 dark:text-slate-400">${tb.sectionsRead}/${tb.sectionsTotal}</span> sections</div>
                      <div><span class="font-medium text-slate-600 dark:text-slate-400">${tb.quizScore}</span> quiz</div>
                      <div><span class="font-medium text-slate-600 dark:text-slate-400">${tb.confidence}</span> confidence</div>
                      <div class="text-right">
                        <a data-route="#/topic/${tb.id}" class="text-blue-500 hover:text-blue-600 cursor-pointer">Review</a>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>

            <!-- Study Plan -->
            <section class="mb-8">
              <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                <i data-lucide="list-checks" class="w-5 h-5 text-green-500"></i> Recommended Study Plan
              </h2>
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <ol class="space-y-3">
                  ${analysis.studyPlan.map((step, i) => `
                    <li class="flex items-start gap-3">
                      <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">${i + 1}</span>
                      <div>
                        <p class="text-sm font-medium text-slate-700 dark:text-slate-200">${step.title}</p>
                        <p class="text-xs text-slate-500">${step.description}</p>
                      </div>
                    </li>
                  `).join('')}
                </ol>
              </div>
            </section>
          `}
        </div>
      `;
    },

    mount(container) {
      // No special interactivity needed — all links use data-route
    }
  };
}

function analyzeWeakPoints() {
  const weakPoints = [];
  let hasData = false;
  const topicBreakdown = [];

  TOPICS.forEach(topic => {
    const sectionsRead = store.getSectionsRead(topic.id);
    const quizScore = store.getQuizScore(topic.id);
    const confidence = store.getConfidence(topic.id);
    const avgConf = store.getAverageConfidence(topic.id);
    const mastery = store.getTopicMastery(topic.id);
    const masteryPct = mastery?.mastery || 0;

    if (sectionsRead.length > 0 || quizScore) hasData = true;

    // Calculate topic score
    let score = 0;
    let factors = 0;
    if (sectionsRead.length > 0) { score += mastery?.sectionPct || 0; factors++; }
    if (quizScore && quizScore.total > 0) { score += Math.round(quizScore.correct / quizScore.total * 100); factors++; }
    if (avgConf > 0) { score += avgConf * 20; factors++; }
    const topicScore = factors > 0 ? Math.round(score / factors) : 0;

    topicBreakdown.push({
      id: topic.id,
      title: topic.title,
      icon: topic.icon,
      color: topic.color,
      score: topicScore,
      sectionsRead: sectionsRead.length,
      sectionsTotal: mastery?.totalSections || '?',
      quizScore: quizScore ? `${quizScore.correct}/${quizScore.total}` : 'N/A',
      confidence: avgConf > 0 ? `${avgConf.toFixed(1)}/5` : 'N/A'
    });

    // Detect weak points

    // 1. Topic not started
    if (sectionsRead.length === 0 && !quizScore) {
      weakPoints.push({
        severity: 'medium',
        icon: 'book-open',
        title: `${topic.title} — Not Started`,
        description: 'You haven\'t begun this topic yet.',
        action: `#/topic/${topic.id}`,
        actionLabel: 'Start reading'
      });
      return;
    }

    // 2. Low quiz score
    if (quizScore && quizScore.total > 0) {
      const pct = Math.round(quizScore.correct / quizScore.total * 100);
      if (pct < 50) {
        weakPoints.push({
          severity: 'high',
          icon: 'x-circle',
          title: `${topic.title} — Quiz Score ${pct}%`,
          description: `You got ${quizScore.correct} out of ${quizScore.total} correct. Review the content and retry.`,
          action: `#/topic/${topic.id}`,
          actionLabel: 'Review topic'
        });
      } else if (pct < 70) {
        weakPoints.push({
          severity: 'medium',
          icon: 'alert-circle',
          title: `${topic.title} — Quiz Score ${pct}%`,
          description: `Close but needs improvement. Focus on the questions you missed.`,
          action: `#/review/${topic.id}`,
          actionLabel: 'Quick review'
        });
      }
    }

    // 3. Low confidence
    if (avgConf > 0 && avgConf < 3) {
      weakPoints.push({
        severity: avgConf < 2 ? 'high' : 'medium',
        icon: 'star',
        title: `${topic.title} — Low Confidence (${avgConf.toFixed(1)}/5)`,
        description: 'Your self-rated confidence is below average. Consider re-reading and taking notes.',
        action: `#/topic/${topic.id}`,
        actionLabel: 'Review topic'
      });
    }

    // 4. Incomplete sections
    const totalSections = mastery?.totalSections || 0;
    if (totalSections > 0 && sectionsRead.length < totalSections && sectionsRead.length > 0) {
      const readPct = Math.round(sectionsRead.length / totalSections * 100);
      if (readPct < 60) {
        weakPoints.push({
          severity: 'low',
          icon: 'file-text',
          title: `${topic.title} — ${readPct}% Read`,
          description: `You've read ${sectionsRead.length} of ${totalSections} sections.`,
          action: `#/topic/${topic.id}`,
          actionLabel: 'Continue reading'
        });
      }
    }

    // 5. No quiz taken but content read
    if (!quizScore && sectionsRead.length > 2) {
      weakPoints.push({
        severity: 'low',
        icon: 'clipboard-check',
        title: `${topic.title} — Quiz Not Taken`,
        description: 'You\'ve read content but haven\'t tested your knowledge yet.',
        action: `#/topic/${topic.id}`,
        actionLabel: 'Take the quiz'
      });
    }
  });

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  weakPoints.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  topicBreakdown.sort((a, b) => a.score - b.score);

  // Calculate overall score
  const scores = topicBreakdown.filter(t => t.score > 0).map(t => t.score);
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Generate study plan
  const studyPlan = [];
  const weakestTopic = topicBreakdown.find(t => t.score > 0 && t.score < 50) || topicBreakdown[0];
  if (weakestTopic && weakestTopic.score < 70) {
    studyPlan.push({
      title: `Re-read ${weakestTopic.title}`,
      description: `Your weakest topic at ${weakestTopic.score}%. Focus on understanding the core concepts.`
    });
  }
  const noQuiz = topicBreakdown.filter(t => t.quizScore === 'N/A' && t.sectionsRead > 0);
  if (noQuiz.length > 0) {
    studyPlan.push({
      title: `Take quizzes for ${noQuiz.map(t => t.title).join(', ')}`,
      description: 'Testing yourself is the most effective way to solidify knowledge.'
    });
  }
  const lowConf = topicBreakdown.filter(t => t.confidence !== 'N/A' && parseFloat(t.confidence) < 3);
  if (lowConf.length > 0) {
    studyPlan.push({
      title: `Review low-confidence areas`,
      description: `Use flashcards and "Teach It Back" prompts for topics where your confidence is below 3/5.`
    });
  }
  studyPlan.push({
    title: 'Use spaced repetition',
    description: 'Review completed topics after 1 day, then 3 days, then 1 week for long-term retention.'
  });

  return { weakPoints, topicBreakdown, overallScore, hasData, studyPlan };
}

export { createWeakPointsView };
