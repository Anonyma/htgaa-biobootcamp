import { store, TOPICS } from '../store.js';

const ACHIEVEMENTS = [
  // Getting Started
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Read your first section',
    icon: 'footprints',
    category: 'Getting Started',
    check: () => {
      return TOPICS.some(topic => store.getSectionsRead(topic.id).length > 0);
    }
  },
  {
    id: 'curious-mind',
    title: 'Curious Mind',
    description: 'Visit 3 different topics',
    icon: 'lightbulb',
    category: 'Getting Started',
    check: () => {
      return TOPICS.filter(topic => store.getSectionsRead(topic.id).length > 0).length >= 3;
    }
  },
  {
    id: 'quiz-taker',
    title: 'Quiz Taker',
    description: 'Answer your first quiz question',
    icon: 'circle-help',
    category: 'Getting Started',
    check: () => {
      return TOPICS.some(topic => {
        const score = store.getQuizScore(topic.id);
        return score && score.total > 0;
      });
    }
  },

  // Progress
  {
    id: 'chapter-complete',
    title: 'Chapter Complete',
    description: 'Complete your first topic',
    icon: 'book-check',
    category: 'Progress',
    check: () => {
      return TOPICS.some(topic => store.isTopicComplete(topic.id));
    }
  },
  {
    id: 'halfway-there',
    title: 'Halfway There',
    description: 'Complete 3 topics',
    icon: 'milestone',
    category: 'Progress',
    check: () => {
      return TOPICS.filter(topic => store.isTopicComplete(topic.id)).length >= 3;
    }
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Complete all 6 topics',
    icon: 'graduation-cap',
    category: 'Progress',
    check: () => {
      return TOPICS.filter(topic => store.isTopicComplete(topic.id)).length === 6;
    }
  },

  // Quiz Mastery
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Score 80% or higher on any topic quiz',
    icon: 'brain',
    category: 'Quiz Mastery',
    check: () => {
      return TOPICS.some(topic => {
        const score = store.getQuizScore(topic.id);
        return score && score.total > 0 && (score.correct / score.total) >= 0.8;
      });
    }
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Score 100% on any topic quiz',
    icon: 'star',
    category: 'Quiz Mastery',
    check: () => {
      return TOPICS.some(topic => {
        const score = store.getQuizScore(topic.id);
        return score && score.total > 0 && score.correct === score.total;
      });
    }
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Score 80% or higher on all 6 topic quizzes',
    icon: 'crown',
    category: 'Quiz Mastery',
    check: () => {
      return TOPICS.every(topic => {
        const score = store.getQuizScore(topic.id);
        return score && score.total > 0 && (score.correct / score.total) >= 0.8;
      });
    }
  },

  // Flashcards
  {
    id: 'card-collector',
    title: 'Card Collector',
    description: 'Review 10 flashcards',
    icon: 'layers',
    category: 'Flashcards',
    check: () => {
      const stats = store.getFlashcardStats();
      return stats.totalReviews >= 10;
    }
  },
  {
    id: 'memory-palace',
    title: 'Memory Palace',
    description: 'Have 20 or more mature flashcards',
    icon: 'castle',
    category: 'Flashcards',
    check: () => {
      const stats = store.getFlashcardStats();
      return stats.mature >= 20;
    }
  },

  // Exam
  {
    id: 'exam-ready',
    title: 'Exam Ready',
    description: 'Take your first exam',
    icon: 'clipboard-check',
    category: 'Exam',
    check: () => {
      return store.getExamScores().length > 0;
    }
  },
  {
    id: 'honor-roll',
    title: 'Honor Roll',
    description: 'Score 80% or higher on an exam',
    icon: 'award',
    category: 'Exam',
    check: () => {
      const best = store.getBestExamScore();
      return best && best.pct >= 80;
    }
  },
  {
    id: 'deans-list',
    title: "Dean's List",
    description: 'Score 95% or higher on an exam',
    icon: 'medal',
    category: 'Exam',
    check: () => {
      const best = store.getBestExamScore();
      return best && best.pct >= 95;
    }
  },

  // Study Habits
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Study on 3 different days',
    icon: 'sunrise',
    category: 'Study Habits',
    check: () => {
      const studyLog = store.getStudyLog();
      return Object.keys(studyLog).length >= 3;
    }
  },
  {
    id: 'consistent',
    title: 'Consistent',
    description: 'Study on 7 different days',
    icon: 'calendar-check',
    category: 'Study Habits',
    check: () => {
      const studyLog = store.getStudyLog();
      return Object.keys(studyLog).length >= 7;
    }
  },
  {
    id: 'dedicated',
    title: 'Dedicated',
    description: 'Study on 14 different days',
    icon: 'flame',
    category: 'Study Habits',
    check: () => {
      const studyLog = store.getStudyLog();
      return Object.keys(studyLog).length >= 14;
    }
  },
  {
    id: 'streak-master',
    title: 'Streak Master',
    description: 'Achieve a 5-day study streak',
    icon: 'zap',
    category: 'Study Habits',
    check: () => {
      return store.getLongestStreak() >= 5;
    }
  },

  // Community
  {
    id: 'note-taker',
    title: 'Note Taker',
    description: 'Create 5 notes',
    icon: 'pencil',
    category: 'Community',
    check: () => {
      return store.getNotesCount() >= 5;
    }
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Bookmark 10 sections',
    icon: 'bookmark',
    category: 'Community',
    check: () => {
      return store.getBookmarks().length >= 10;
    }
  }
];

const STORAGE_KEY = 'htgaa-week2-achievements';

function getEarnedAchievements() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

function saveEarnedAchievement(achievementId) {
  const earned = getEarnedAchievements();
  if (!earned[achievementId]) {
    earned[achievementId] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
    return true; // newly earned
  }
  return false; // already earned
}

function checkAndUpdateAchievements() {
  const newlyEarned = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (achievement.check()) {
      const isNew = saveEarnedAchievement(achievement.id);
      if (isNew) {
        newlyEarned.push(achievement);
      }
    }
  });

  return newlyEarned;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function createAchievementsView() {
  return {
    render() {
      const newlyEarned = checkAndUpdateAchievements();
      const earnedData = getEarnedAchievements();
      const earnedCount = Object.keys(earnedData).length;
      const totalCount = ACHIEVEMENTS.length;
      const earnedPercent = Math.round((earnedCount / totalCount) * 100);

      // Group achievements by category
      const categories = {};
      ACHIEVEMENTS.forEach(achievement => {
        if (!categories[achievement.category]) {
          categories[achievement.category] = [];
        }
        categories[achievement.category].push(achievement);
      });

      // Render recent achievements
      const recentAchievements = Object.entries(earnedData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, timestamp]) => {
          const achievement = ACHIEVEMENTS.find(a => a.id === id);
          if (!achievement) return '';

          return `
            <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <div class="w-12 h-12 rounded-full bg-amber-400 dark:bg-amber-500 flex items-center justify-center text-white">
                <i data-lucide="${achievement.icon}" class="w-6 h-6"></i>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-slate-900 dark:text-white">${achievement.title}</div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Earned ${formatDate(timestamp)}</div>
              </div>
              ${newlyEarned.some(a => a.id === id) ? '<span class="px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 rounded-full">NEW</span>' : ''}
            </div>
          `;
        })
        .join('');

      return `
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <i data-lucide="trophy" class="w-6 h-6"></i>
              </div>
              <div>
                <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Achievements</h1>
                <p class="text-slate-600 dark:text-slate-400">${earnedCount} of ${totalCount} earned</p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" style="width: ${earnedPercent}%"></div>
            </div>
            <div class="text-center mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              ${earnedPercent}% Complete
            </div>
          </div>

          <!-- Recent Achievements -->
          ${earnedCount > 0 ? `
            <div class="mb-8">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <i data-lucide="sparkles" class="w-5 h-5 text-amber-500"></i>
                Recent Achievements
              </h2>
              <div class="space-y-3">
                ${recentAchievements}
              </div>
            </div>
          ` : ''}

          <!-- Achievement Categories -->
          ${Object.entries(categories).map(([category, achievements]) => `
            <div class="mb-8">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">${category}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${achievements.map(achievement => {
                  const isEarned = !!earnedData[achievement.id];
                  const earnedDate = earnedData[achievement.id];
                  const isNew = newlyEarned.some(a => a.id === achievement.id);

                  return `
                    <div class="relative bg-white dark:bg-slate-800 rounded-xl border ${isEarned ? 'border-amber-400 shadow-lg shadow-amber-500/20' : 'border-slate-200 dark:border-slate-700'} p-6 transition-all ${!isEarned ? 'opacity-40 grayscale' : ''}">
                      ${isNew ? '<div class="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 rounded-full">NEW</div>' : ''}

                      <div class="flex items-start gap-4 mb-3">
                        <div class="w-14 h-14 rounded-full ${isEarned ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-slate-200 dark:bg-slate-700'} flex items-center justify-center flex-shrink-0 ${isEarned ? 'shadow-lg' : ''}">
                          <i data-lucide="${achievement.icon}" class="w-7 h-7 ${isEarned ? 'text-white' : 'text-slate-400 dark:text-slate-500'}"></i>
                        </div>
                        <div class="flex-1">
                          <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-1">${achievement.title}</h3>
                          <p class="text-sm text-slate-600 dark:text-slate-400">${achievement.description}</p>
                        </div>
                      </div>

                      ${isEarned ? `
                        <div class="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-semibold">
                          <i data-lucide="check-circle" class="w-4 h-4"></i>
                          <span>Unlocked ${formatDate(earnedDate)}</span>
                        </div>
                      ` : `
                        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 font-semibold">
                          <i data-lucide="lock" class="w-4 h-4"></i>
                          <span>Locked</span>
                        </div>
                      `}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}

          <!-- Motivational Footer -->
          ${earnedCount < totalCount ? `
            <div class="mt-12 text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                <i data-lucide="target" class="w-8 h-8"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Keep Going!</h3>
              <p class="text-slate-600 dark:text-slate-400">
                You have ${totalCount - earnedCount} more achievement${totalCount - earnedCount === 1 ? '' : 's'} to unlock. Continue your learning journey!
              </p>
            </div>
          ` : `
            <div class="mt-12 text-center p-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg animate-bounce">
                <i data-lucide="crown" class="w-8 h-8"></i>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Achievement Master!</h3>
              <p class="text-slate-600 dark:text-slate-400">
                Congratulations! You've unlocked all ${totalCount} achievements. You're a true scholar!
              </p>
            </div>
          `}
        </div>
      `;
    },

    mount(container) {
      // Initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  };
}

export { createAchievementsView };
