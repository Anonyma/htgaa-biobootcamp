/**
 * HTGAA Week 2 — Bookmarks View
 * Shows all bookmarked sections for quick access and review.
 */

import { store, TOPICS } from '../store.js';

function createBookmarksView() {
  return {
    render() {
      const bookmarks = store.getBookmarks();

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <i data-lucide="bookmark" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Bookmarks</h1>
                <p class="text-sm text-slate-500">${bookmarks.length} saved section${bookmarks.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </header>

          ${bookmarks.length === 0 ? `
            <div class="text-center py-16">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <i data-lucide="bookmark" class="w-8 h-8 text-slate-400"></i>
              </div>
              <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No bookmarks yet</h3>
              <p class="text-sm text-slate-500 max-w-md mx-auto mb-4">
                While reading topics, click the <i data-lucide="bookmark" class="w-3.5 h-3.5 inline text-blue-500"></i> icon on any section to save it for later.
              </p>
              <a data-route="#/" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                <i data-lucide="book-open" class="w-4 h-4"></i> Browse Topics
              </a>
            </div>
          ` : `
            <!-- Group by topic -->
            ${groupByTopic(bookmarks).map(group => `
              <div class="mb-6">
                <h2 class="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  <i data-lucide="${group.topic.icon}" class="w-4 h-4 text-${group.topic.color}-500"></i>
                  ${group.topic.title}
                  <span class="text-xs font-normal">(${group.items.length})</span>
                </h2>
                <div class="space-y-2">
                  ${group.items.map(bm => `
                    <div class="group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                      <i data-lucide="bookmark" class="w-4 h-4 text-blue-500 flex-shrink-0"></i>
                      <a data-route="#/topic/${bm.topicId}#section-${bm.sectionId}" class="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 cursor-pointer">
                        ${bm.sectionTitle || bm.sectionId}
                      </a>
                      <span class="text-xs text-slate-400">${formatDate(bm.date)}</span>
                      <button class="remove-bookmark opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600" data-topic="${bm.topicId}" data-section="${bm.sectionId}" title="Remove">
                        <i data-lucide="x" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          `}
        </div>
      `;
    },

    mount(container) {
      container.querySelectorAll('.remove-bookmark').forEach(btn => {
        btn.addEventListener('click', () => {
          store.removeBookmark(btn.dataset.topic, btn.dataset.section);
          const view = createBookmarksView();
          container.innerHTML = view.render();
          view.mount(container);
          if (window.lucide) lucide.createIcons();
        });
      });
    }
  };
}

function groupByTopic(bookmarks) {
  const groups = {};
  bookmarks.forEach(bm => {
    if (!groups[bm.topicId]) {
      const topic = TOPICS.find(t => t.id === bm.topicId) || { id: bm.topicId, title: bm.topicId, icon: 'book', color: 'slate' };
      groups[bm.topicId] = { topic, items: [] };
    }
    groups[bm.topicId].items.push(bm);
  });
  // Sort items by date (most recent first)
  Object.values(groups).forEach(g => g.items.sort((a, b) => (b.date || 0) - (a.date || 0)));
  return Object.values(groups);
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export { createBookmarksView };
