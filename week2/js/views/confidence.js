import { store, TOPICS } from '../store.js';

function createConfidenceView() {
  return {
    render() {
      const overallConfidence = calculateOverallConfidence();
      const recommendations = generateRecommendations();

      return `
        <div class="max-w-6xl mx-auto p-6 space-y-8">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <i data-lucide="gauge" class="w-8 h-8 text-blue-600 dark:text-blue-400"></i>
            </div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Confidence Tracker</h1>
            <p class="text-slate-600 dark:text-slate-400">Rate your understanding and get personalized study recommendations</p>
          </div>

          <!-- Overall Confidence Gauge -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 text-center border border-blue-200 dark:border-slate-600">
            <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Overall Confidence</h2>
            ${renderOverallGauge(overallConfidence)}
          </div>

          <!-- Topic Confidence Cards -->
          <div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Rate Your Understanding</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${TOPICS.map(topic => renderTopicCard(topic)).join('')}
            </div>
          </div>

          <!-- Study Recommendations -->
          ${recommendations.length > 0 ? `
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div class="flex items-center gap-2 mb-4">
                <i data-lucide="lightbulb" class="w-5 h-5 text-yellow-500"></i>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white">Study Recommendations</h2>
              </div>
              <div class="space-y-3">
                ${recommendations.map(rec => `
                  <div class="flex items-start gap-3 p-4 rounded-lg ${rec.bgClass}">
                    <i data-lucide="${rec.icon}" class="w-5 h-5 ${rec.iconClass} flex-shrink-0 mt-0.5"></i>
                    <div class="flex-1">
                      <div class="font-medium ${rec.textClass}">${rec.label}</div>
                      <div class="text-sm ${rec.descClass} mt-1">${rec.description}</div>
                      ${rec.link ? `
                        <a href="${rec.link}" data-route="${rec.link}" class="text-sm font-medium ${rec.linkClass} hover:underline mt-2 inline-flex items-center gap-1">
                          ${rec.linkText}
                          <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </a>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Confidence Over Time -->
          ${renderConfidenceTimeline()}

          <!-- Quick Rate All -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Rate All Topics</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Click stars to quickly update your confidence for each topic</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${TOPICS.map(topic => renderQuickRateCard(topic)).join('')}
            </div>
          </div>
        </div>
      `;
    },

    mount(container) {
      // Initialize Lucide icons
      lucide.createIcons();

      // Wire up star rating clicks
      container.querySelectorAll('[data-star-rating]').forEach(starContainer => {
        const topicId = starContainer.dataset.topicId;
        const stars = starContainer.querySelectorAll('[data-star]');

        stars.forEach((star, index) => {
          star.addEventListener('click', () => {
            const rating = index + 1;
            saveConfidenceRating(topicId, rating);

            // Re-render the view to show updated state
            const view = createConfidenceView();
            container.innerHTML = view.render();
            view.mount(container);
          });

          // Hover effect
          star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
              if (i <= index) {
                s.classList.add('text-yellow-400');
                s.classList.remove('text-slate-300', 'dark:text-slate-600');
              }
            });
          });

          starContainer.addEventListener('mouseleave', () => {
            updateStarDisplay(stars, store.getAverageConfidence(topicId));
          });
        });
      });
    }
  };
}

function calculateOverallConfidence() {
  let totalRating = 0;
  let count = 0;

  TOPICS.forEach(topic => {
    const avg = store.getAverageConfidence(topic.id);
    if (avg > 0) {
      totalRating += avg;
      count++;
    }
  });

  return count > 0 ? totalRating / count : 0;
}

function renderOverallGauge(confidence) {
  if (confidence === 0) {
    return `
      <div class="text-slate-500 dark:text-slate-400">
        <i data-lucide="bar-chart-3" class="w-12 h-12 mx-auto mb-2"></i>
        <p>No confidence ratings yet</p>
        <p class="text-sm mt-1">Rate topics below to see your overall confidence</p>
      </div>
    `;
  }

  const percentage = (confidence / 5) * 100;
  let color, bgColor, label;

  if (confidence < 2.5) {
    color = 'text-red-600 dark:text-red-400';
    bgColor = 'bg-red-500';
    label = 'Needs Work';
  } else if (confidence < 3.5) {
    color = 'text-amber-600 dark:text-amber-400';
    bgColor = 'bg-amber-500';
    label = 'Getting There';
  } else {
    color = 'text-green-600 dark:text-green-400';
    bgColor = 'bg-green-500';
    label = 'Confident';
  }

  return `
    <div class="flex flex-col items-center gap-4">
      <!-- Circular gauge -->
      <div class="relative w-40 h-40">
        <svg class="transform -rotate-90 w-40 h-40">
          <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="none" class="text-slate-200 dark:text-slate-600" />
          <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="none"
                  class="${bgColor.replace('bg-', 'text-')}"
                  stroke-dasharray="${2 * Math.PI * 70}"
                  stroke-dashoffset="${2 * Math.PI * 70 * (1 - percentage / 100)}"
                  stroke-linecap="round" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="text-4xl font-bold ${color}">${confidence.toFixed(1)}</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">out of 5</div>
        </div>
      </div>
      <div class="text-lg font-semibold ${color}">${label}</div>
    </div>
  `;
}

function renderTopicCard(topic) {
  const confidence = store.getAverageConfidence(topic.id);
  const ratings = store.getConfidence(topic.id);
  const lastRating = ratings.length > 0 ? ratings[ratings.length - 1] : null;
  const sectionsRead = store.getSectionsRead(topic.id);
  const quizScore = store.getQuizScore(topic.id);

  let bgClass, borderClass;
  if (confidence === 0) {
    bgClass = 'bg-slate-50 dark:bg-slate-800/50';
    borderClass = 'border-slate-200 dark:border-slate-700';
  } else if (confidence < 2.5) {
    bgClass = 'bg-red-50 dark:bg-red-900/10';
    borderClass = 'border-red-200 dark:border-red-900/30';
  } else if (confidence < 3.5) {
    bgClass = 'bg-amber-50 dark:bg-amber-900/10';
    borderClass = 'border-amber-200 dark:border-amber-900/30';
  } else {
    bgClass = 'bg-green-50 dark:bg-green-900/10';
    borderClass = 'border-green-200 dark:border-green-900/30';
  }

  return `
    <div class="${bgClass} ${borderClass} rounded-xl border p-5">
      <div class="flex items-start gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-${topic.color}-100 dark:bg-${topic.color}-900/30 flex items-center justify-center flex-shrink-0">
          <i data-lucide="${topic.icon}" class="w-5 h-5 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-slate-900 dark:text-white">${topic.title}</h3>
          ${lastRating ? `
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last rated ${formatTimestamp(lastRating.timestamp)}
            </p>
          ` : ''}
        </div>
      </div>

      <!-- Star Rating -->
      <div class="mb-4">
        <div class="flex items-center gap-1 mb-2" data-star-rating data-topic-id="${topic.id}">
          ${[1, 2, 3, 4, 5].map(star => `
            <button data-star="${star}" class="transition-colors cursor-pointer hover:scale-110">
              <i data-lucide="${star <= confidence ? 'star' : 'star'}"
                 class="w-6 h-6 ${star <= confidence ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}"></i>
            </button>
          `).join('')}
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          ${confidence > 0 ? `Confidence: ${confidence.toFixed(1)}/5` : 'Click to rate your confidence'}
        </p>
      </div>

      <!-- Progress Stats -->
      <div class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
        <div class="flex items-center gap-2">
          <i data-lucide="book-open" class="w-4 h-4"></i>
          <span>${sectionsRead} section${sectionsRead !== 1 ? 's' : ''} read</span>
        </div>
        ${quizScore ? `
          <div class="flex items-center gap-2">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Quiz: ${quizScore.correct}/${quizScore.total} correct (${Math.round(quizScore.correct / quizScore.total * 100)}%)</span>
          </div>
        ` : `
          <div class="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <i data-lucide="circle" class="w-4 h-4"></i>
            <span>Quiz not taken</span>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderQuickRateCard(topic) {
  const confidence = store.getAverageConfidence(topic.id);

  return `
    <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div class="w-8 h-8 rounded-lg bg-${topic.color}-100 dark:bg-${topic.color}-900/30 flex items-center justify-center flex-shrink-0">
        <i data-lucide="${topic.icon}" class="w-4 h-4 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-slate-900 dark:text-white truncate">${topic.title}</p>
        <div class="flex items-center gap-0.5 mt-1" data-star-rating data-topic-id="${topic.id}">
          ${[1, 2, 3, 4, 5].map(star => `
            <button data-star="${star}" class="transition-colors cursor-pointer hover:scale-110">
              <i data-lucide="${star <= confidence ? 'star' : 'star'}"
                 class="w-4 h-4 ${star <= confidence ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}"></i>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function generateRecommendations() {
  const recommendations = [];

  TOPICS.forEach(topic => {
    const confidence = store.getAverageConfidence(topic.id);
    const quizScore = store.getQuizScore(topic.id);
    const sectionsRead = store.getSectionsRead(topic.id);
    const quizPercentage = quizScore ? (quizScore.correct / quizScore.total) : 0;

    // Priority: Low confidence AND low quiz scores
    if (confidence > 0 && confidence < 2.5 && quizScore && quizPercentage < 0.6) {
      recommendations.push({
        icon: 'alert-circle',
        iconClass: 'text-red-600 dark:text-red-400',
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        textClass: 'text-red-900 dark:text-red-100',
        descClass: 'text-red-700 dark:text-red-300',
        linkClass: 'text-red-600 dark:text-red-400',
        label: `Priority: ${topic.title}`,
        description: `Both confidence (${confidence.toFixed(1)}/5) and quiz score (${Math.round(quizPercentage * 100)}%) are low. Review the material and retake the quiz.`,
        link: `#/topic/${topic.id}`,
        linkText: 'Review topic'
      });
    }
    // High confidence but low quiz score
    else if (confidence >= 4 && quizScore && quizPercentage < 0.7) {
      recommendations.push({
        icon: 'brain',
        iconClass: 'text-amber-600 dark:text-amber-400',
        bgClass: 'bg-amber-50 dark:bg-amber-900/20',
        textClass: 'text-amber-900 dark:text-amber-100',
        descClass: 'text-amber-700 dark:text-amber-300',
        linkClass: 'text-amber-600 dark:text-amber-400',
        label: `Test yourself: ${topic.title}`,
        description: `You feel confident (${confidence.toFixed(1)}/5) but quiz score is ${Math.round(quizPercentage * 100)}%. Practice more to solidify understanding.`,
        link: `#/practice`,
        linkText: 'Take quiz'
      });
    }
    // Not started yet
    else if (sectionsRead === 0 && confidence === 0) {
      recommendations.push({
        icon: 'play-circle',
        iconClass: 'text-blue-600 dark:text-blue-400',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        textClass: 'text-blue-900 dark:text-blue-100',
        descClass: 'text-blue-700 dark:text-blue-300',
        linkClass: 'text-blue-600 dark:text-blue-400',
        label: `Start: ${topic.title}`,
        description: 'You haven\'t begun this topic yet. Start reading to build your knowledge.',
        link: `#/topic/${topic.id}`,
        linkText: 'Begin reading'
      });
    }
    // High confidence and high quiz score
    else if (confidence >= 4 && quizScore && quizPercentage >= 0.8) {
      recommendations.push({
        icon: 'trophy',
        iconClass: 'text-green-600 dark:text-green-400',
        bgClass: 'bg-green-50 dark:bg-green-900/20',
        textClass: 'text-green-900 dark:text-green-100',
        descClass: 'text-green-700 dark:text-green-300',
        linkClass: 'text-green-600 dark:text-green-400',
        label: `Great job: ${topic.title}`,
        description: `Confidence ${confidence.toFixed(1)}/5 and quiz score ${Math.round(quizPercentage * 100)}% - you're well-prepared!`,
        link: null,
        linkText: null
      });
    }
    // Low confidence, no quiz taken
    else if (confidence > 0 && confidence < 3 && !quizScore) {
      recommendations.push({
        icon: 'clipboard-check',
        iconClass: 'text-purple-600 dark:text-purple-400',
        bgClass: 'bg-purple-50 dark:bg-purple-900/20',
        textClass: 'text-purple-900 dark:text-purple-100',
        descClass: 'text-purple-700 dark:text-purple-300',
        linkClass: 'text-purple-600 dark:text-purple-400',
        label: `Practice: ${topic.title}`,
        description: `Your confidence is ${confidence.toFixed(1)}/5. Take the quiz to identify knowledge gaps.`,
        link: `#/practice`,
        linkText: 'Take quiz'
      });
    }
  });

  // Sort: Priority (red) first, then others
  recommendations.sort((a, b) => {
    if (a.bgClass.includes('red') && !b.bgClass.includes('red')) return -1;
    if (!a.bgClass.includes('red') && b.bgClass.includes('red')) return 1;
    return 0;
  });

  return recommendations;
}

function renderConfidenceTimeline() {
  const allRatings = [];

  TOPICS.forEach(topic => {
    const ratings = store.getConfidence(topic.id);
    // Handle both array format [{rating, timestamp}] and object format {idx: {rating, updated}}
    const ratingsList = Array.isArray(ratings) ? ratings : Object.values(ratings);
    ratingsList.forEach(rating => {
      allRatings.push({
        rating: rating.rating,
        timestamp: rating.timestamp || rating.updated || 0,
        topicId: topic.id,
        topicTitle: topic.title
      });
    });
  });

  if (allRatings.length === 0) {
    return '';
  }

  // Sort by timestamp descending (most recent first)
  allRatings.sort((a, b) => b.timestamp - a.timestamp);

  // Show max 10 most recent
  const recentRatings = allRatings.slice(0, 10);

  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div class="flex items-center gap-2 mb-4">
        <i data-lucide="clock" class="w-5 h-5 text-slate-600 dark:text-slate-400"></i>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Recent Confidence Updates</h2>
      </div>
      <div class="space-y-3">
        ${recentRatings.map(rating => `
          <div class="flex items-center gap-3 text-sm">
            <div class="flex-shrink-0 text-slate-500 dark:text-slate-400 w-24">
              ${formatTimestamp(rating.timestamp)}
            </div>
            <div class="flex-1 font-medium text-slate-900 dark:text-white">
              ${rating.topicTitle}
            </div>
            <div class="flex items-center gap-1">
              ${[1, 2, 3, 4, 5].map(star => `
                <i data-lucide="star" class="w-4 h-4 ${star <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}"></i>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function saveConfidenceRating(topicId, rating) {
  // Use store's saveConfidence with objectiveIndex 'overall' for overall topic confidence
  store.saveConfidence(topicId, 'overall', rating);
}

function updateStarDisplay(stars, rating) {
  stars.forEach((star, index) => {
    const starIcon = star.querySelector('i');
    if (index < rating) {
      starIcon.classList.add('text-yellow-400', 'fill-yellow-400');
      starIcon.classList.remove('text-slate-300', 'dark:text-slate-600');
    } else {
      starIcon.classList.remove('text-yellow-400', 'fill-yellow-400');
      starIcon.classList.add('text-slate-300', 'dark:text-slate-600');
    }
  });
}

function formatTimestamp(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export { createConfidenceView };
