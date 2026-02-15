import { store, TOPICS } from '../store.js';

function createPrereqsView() {
  // Define prerequisite relationships
  const PREREQS = {
    'central-dogma': [],
    'genetic-codes': ['central-dogma'],
    'gel-electrophoresis': ['central-dogma'],
    'sequencing': ['central-dogma'],
    'synthesis': ['sequencing', 'central-dogma'],
    'editing': ['sequencing', 'synthesis']
  };

  // Estimated reading times (minutes)
  const READING_TIMES = {
    'central-dogma': 15,
    'genetic-codes': 12,
    'gel-electrophoresis': 10,
    'sequencing': 18,
    'synthesis': 15,
    'editing': 20
  };

  // Recommended learning order
  const RECOMMENDED_ORDER = [
    'central-dogma',
    'genetic-codes',
    'gel-electrophoresis',
    'sequencing',
    'synthesis',
    'editing'
  ];

  function getTopicInfo(topicId) {
    return TOPICS.find(t => t.id === topicId);
  }

  function isTopicAvailable(topicId) {
    const prereqs = PREREQS[topicId] || [];
    return prereqs.every(prereqId => store.isTopicComplete(prereqId));
  }

  function getTopicStatus(topicId) {
    if (store.isTopicComplete(topicId)) {
      return 'completed';
    } else if (isTopicAvailable(topicId)) {
      return 'available';
    } else {
      return 'locked';
    }
  }

  function getNextTopic() {
    return RECOMMENDED_ORDER.find(topicId => {
      const status = getTopicStatus(topicId);
      return status === 'available' && !store.isTopicComplete(topicId);
    });
  }

  function getCompletedCount() {
    return RECOMMENDED_ORDER.filter(topicId => store.isTopicComplete(topicId)).length;
  }

  function renderFlowDiagram() {
    const renderNode = (topicId, position = '') => {
      const topic = getTopicInfo(topicId);
      const status = getTopicStatus(topicId);
      const quizScore = store.getQuizScore(topicId);

      let statusIcon, statusColor, borderColor, bgColor;

      if (status === 'completed') {
        statusIcon = 'check-circle';
        statusColor = 'text-green-600';
        borderColor = 'border-green-300 dark:border-green-700';
        bgColor = 'bg-green-50 dark:bg-green-950/30';
      } else if (status === 'available') {
        statusIcon = 'play-circle';
        statusColor = 'text-blue-600';
        borderColor = 'border-blue-300 dark:border-blue-700';
        bgColor = 'bg-blue-50 dark:bg-blue-950/30';
      } else {
        statusIcon = 'lock';
        statusColor = 'text-slate-400';
        borderColor = 'border-slate-200 dark:border-slate-700';
        bgColor = 'bg-slate-50 dark:bg-slate-800/50';
      }

      const isClickable = status !== 'locked';
      const cursorClass = isClickable ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-60';

      return `
        <div class="prereq-node ${position}">
          <a
            href="#/topic/${topicId}"
            data-route="#/topic/${topicId}"
            class="block p-4 rounded-xl border-2 ${borderColor} ${bgColor} ${cursorClass} transition-all"
            ${!isClickable ? 'onclick="return false;"' : ''}
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <i data-lucide="${topic.icon}" class="w-6 h-6 ${statusColor}"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    ${topic.title}
                  </h4>
                  <i data-lucide="${statusIcon}" class="w-4 h-4 ${statusColor} flex-shrink-0"></i>
                </div>
                ${quizScore ? `
                  <div class="text-xs text-slate-600 dark:text-slate-400">
                    Quiz: ${quizScore.correct}/${quizScore.total}
                  </div>
                ` : ''}
                ${status === 'locked' ? `
                  <div class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Complete prerequisites first
                  </div>
                ` : ''}
              </div>
            </div>
          </a>
        </div>
      `;
    };

    return `
      <div class="flow-diagram">
        <!-- Central Dogma - Foundation -->
        <div class="flow-level">
          <div class="flex justify-center">
            ${renderNode('central-dogma')}
          </div>
          <div class="connector-down"></div>
        </div>

        <!-- First Branch: Genetic Codes, Gel Electrophoresis, Sequencing -->
        <div class="flow-level">
          <div class="connector-split-3"></div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            ${renderNode('genetic-codes')}
            ${renderNode('gel-electrophoresis')}
            ${renderNode('sequencing')}
          </div>
        </div>

        <!-- Connector from Sequencing to Synthesis -->
        <div class="flow-level">
          <div class="flex justify-end max-w-4xl mx-auto pr-4 md:pr-0">
            <div class="w-full md:w-1/3 flex justify-center">
              <div class="connector-down"></div>
            </div>
          </div>
        </div>

        <!-- Synthesis -->
        <div class="flow-level">
          <div class="flex justify-end max-w-4xl mx-auto pr-4 md:pr-0">
            <div class="w-full md:w-1/3">
              ${renderNode('synthesis')}
            </div>
          </div>
          <div class="flex justify-end max-w-4xl mx-auto pr-4 md:pr-0">
            <div class="w-full md:w-1/3 flex justify-center">
              <div class="connector-down"></div>
            </div>
          </div>
        </div>

        <!-- Gene Editing - Final -->
        <div class="flow-level">
          <div class="flex justify-end max-w-4xl mx-auto pr-4 md:pr-0">
            <div class="w-full md:w-1/3">
              ${renderNode('editing')}
            </div>
          </div>
        </div>
      </div>

      <style>
        .flow-diagram {
          padding: 2rem 1rem;
        }

        .flow-level {
          margin-bottom: 1rem;
        }

        .prereq-node {
          max-width: 280px;
          margin: 0 auto;
        }

        .connector-down {
          width: 2px;
          height: 24px;
          background: linear-gradient(to bottom, rgb(148 163 184), rgb(148 163 184 / 0.3));
          margin: 0.5rem auto;
        }

        .connector-split-3 {
          height: 24px;
          position: relative;
          max-width: 4xl;
          margin: 0 auto 0.5rem;
        }

        .connector-split-3::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, rgb(148 163 184), rgb(148 163 184 / 0.3));
        }

        @media (prefers-color-scheme: dark) {
          .connector-down {
            background: linear-gradient(to bottom, rgb(71 85 105), rgb(71 85 105 / 0.3));
          }
          .connector-split-3::before {
            background: linear-gradient(to bottom, rgb(71 85 105), rgb(71 85 105 / 0.3));
          }
        }
      </style>
    `;
  }

  function renderRecommendedOrder() {
    const items = RECOMMENDED_ORDER.map((topicId, index) => {
      const topic = getTopicInfo(topicId);
      const status = getTopicStatus(topicId);
      const readingTime = READING_TIMES[topicId];
      const quizScore = store.getQuizScore(topicId);
      const isNext = topicId === getNextTopic();

      let statusBadge, rowClass;

      if (status === 'completed') {
        statusBadge = `
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-medium">
            <i data-lucide="check" class="w-3 h-3"></i>
            Complete
          </span>
        `;
        rowClass = 'opacity-75';
      } else if (isNext) {
        statusBadge = `
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-medium animate-pulse">
            <i data-lucide="arrow-right" class="w-3 h-3"></i>
            Next
          </span>
        `;
        rowClass = 'ring-2 ring-blue-400 dark:ring-blue-600';
      } else if (status === 'available') {
        statusBadge = `
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
            <i data-lucide="circle" class="w-3 h-3"></i>
            Available
          </span>
        `;
        rowClass = '';
      } else {
        statusBadge = `
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-xs">
            <i data-lucide="lock" class="w-3 h-3"></i>
            Locked
          </span>
        `;
        rowClass = 'opacity-50';
      }

      const prereqNames = PREREQS[topicId]
        .map(id => getTopicInfo(id).title)
        .join(', ');

      return `
        <div class="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${rowClass} transition-all">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-${topic.color}-100 dark:bg-${topic.color}-950/30 flex items-center justify-center">
              <span class="text-sm font-bold text-${topic.color}-700 dark:text-${topic.color}-400">
                ${index + 1}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <i data-lucide="${topic.icon}" class="w-4 h-4 text-${topic.color}-600"></i>
                <h4 class="font-semibold text-slate-900 dark:text-slate-100">
                  ${topic.title}
                </h4>
                ${statusBadge}
              </div>
              <div class="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span class="flex items-center gap-1">
                  <i data-lucide="clock" class="w-3 h-3"></i>
                  ${readingTime} min
                </span>
                ${prereqNames ? `
                  <span class="flex items-center gap-1">
                    <i data-lucide="link" class="w-3 h-3"></i>
                    Requires: ${prereqNames}
                  </span>
                ` : `
                  <span class="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <i data-lucide="star" class="w-3 h-3"></i>
                    Foundation
                  </span>
                `}
              </div>
              ${quizScore ? `
                <div class="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Quiz score: ${quizScore.correct}/${quizScore.total} (${Math.round(quizScore.correct / quizScore.total * 100)}%)
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="space-y-3">
        ${items}
      </div>
    `;
  }

  function renderProgressSection() {
    const completedCount = getCompletedCount();
    const totalCount = RECOMMENDED_ORDER.length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    const nextTopic = getNextTopic();
    const nextTopicInfo = nextTopic ? getTopicInfo(nextTopic) : null;

    return `
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-3 mb-4">
          <i data-lucide="trophy" class="w-6 h-6 text-blue-600"></i>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
            Your Progress
          </h3>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
              ${completedCount} of ${totalCount} topics completed
            </span>
            <span class="text-sm font-bold text-blue-600 dark:text-blue-400">
              ${percentage}%
            </span>
          </div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style="width: ${percentage}%"
            ></div>
          </div>
        </div>

        <!-- Next Topic CTA -->
        ${nextTopicInfo ? `
          <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-300 dark:border-blue-700">
            <div class="flex items-center gap-2 mb-3">
              <i data-lucide="compass" class="w-5 h-5 text-blue-600"></i>
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400">
                Recommended Next
              </span>
            </div>
            <a
              href="#/topic/${nextTopic}"
              data-route="#/topic/${nextTopic}"
              class="group flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <i data-lucide="${nextTopicInfo.icon}" class="w-5 h-5 text-white"></i>
                </div>
                <div>
                  <div class="font-semibold text-white">
                    ${nextTopicInfo.title}
                  </div>
                  <div class="text-xs text-blue-100">
                    ${READING_TIMES[nextTopic]} min reading
                  </div>
                </div>
              </div>
              <i data-lucide="arrow-right" class="w-5 h-5 text-white group-hover:translate-x-1 transition-transform"></i>
            </a>
          </div>
        ` : `
          <div class="bg-white dark:bg-slate-800 rounded-lg p-6 text-center border border-green-300 dark:border-green-700">
            <i data-lucide="party-popper" class="w-12 h-12 text-green-600 mx-auto mb-3"></i>
            <h4 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              All Topics Complete!
            </h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              You've completed all recommended topics in the learning path.
            </p>
          </div>
        `}
      </div>
    `;
  }

  return {
    render() {
      return `
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <i data-lucide="git-merge" class="w-8 h-8 text-indigo-600"></i>
              <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Learning Path
              </h1>
            </div>
            <p class="text-slate-600 dark:text-slate-400">
              Recommended study order and topic dependencies
            </p>
          </div>

          <!-- Progress Section -->
          <div class="mb-8">
            ${renderProgressSection()}
          </div>

          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Visual Flow Diagram -->
            <div>
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div class="flex items-center gap-2">
                    <i data-lucide="network" class="w-5 h-5 text-indigo-600"></i>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Topic Dependencies
                    </h2>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Visual map of prerequisites
                  </p>
                </div>
                <div class="p-4">
                  ${renderFlowDiagram()}
                </div>
              </div>
            </div>

            <!-- Recommended Order List -->
            <div>
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div class="flex items-center gap-2">
                    <i data-lucide="list-ordered" class="w-5 h-5 text-indigo-600"></i>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Recommended Order
                    </h2>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Follow this sequence for optimal learning
                  </p>
                </div>
                <div class="p-6">
                  ${renderRecommendedOrder()}
                </div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Legend
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="flex items-center gap-2">
                <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
                <div>
                  <div class="text-sm font-medium text-slate-900 dark:text-slate-100">Completed</div>
                  <div class="text-xs text-slate-600 dark:text-slate-400">You've finished this topic</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="play-circle" class="w-5 h-5 text-blue-600"></i>
                <div>
                  <div class="text-sm font-medium text-slate-900 dark:text-slate-100">Available</div>
                  <div class="text-xs text-slate-600 dark:text-slate-400">Ready to start</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="lock" class="w-5 h-5 text-slate-400"></i>
                <div>
                  <div class="text-sm font-medium text-slate-900 dark:text-slate-100">Locked</div>
                  <div class="text-xs text-slate-600 dark:text-slate-400">Complete prerequisites first</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    mount(container) {
      // Initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Handle internal navigation links
      const links = container.querySelectorAll('a[data-route]');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#/')) {
            e.preventDefault();
            window.location.hash = href;
          }
        });
      });
    }
  };
}

export { createPrereqsView };
