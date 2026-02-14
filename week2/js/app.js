/**
 * HTGAA Week 2 — Main Application
 * Initializes SPA router, registers views, manages app shell.
 */

import { store, TOPICS } from './store.js';
import { Router } from './router.js';
import { createTopicView } from './topic-page.js';
import { createHomeView } from './views/home.js';
import { createHomeworkView } from './views/homework.js';
import { createFlashcardsView } from './views/flashcards.js';
import { createConceptMapView } from './concept-map.js';
import { SearchUI } from './search.js';

class App {
  constructor() {
    this.router = null;
  }

  init() {
    // Apply theme
    store.initTheme();

    // Render app shell
    this.renderShell();

    // Init router
    const content = document.getElementById('app-content');
    this.router = new Router(content);

    // Register routes
    this.router
      .on('/', () => createHomeView())
      .on('/topic/:id', ({ id }) => createTopicView(id))
      .on('/homework', () => createHomeworkView())
      .on('/flashcards', () => createFlashcardsView())
      .on('/concept-map', () => createConceptMapView());

    // Start
    this.router.start();

    // Wire up shell interactions
    this.initShell();

    // Listen for progress updates to refresh sidebar
    store.subscribe('progress', () => this.updateSidebarProgress());
    document.addEventListener('progress-updated', () => this.updateSidebarProgress());
  }

  renderShell() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <!-- Top Nav -->
      <nav class="sticky top-0 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button id="sidebar-toggle" class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
            <a data-route="#/" class="flex items-center gap-2 cursor-pointer">
              <span class="text-xl">🧬</span>
              <span class="font-bold text-lg hidden sm:inline">HTGAA Week 2</span>
              <span class="font-bold text-lg sm:hidden">W2</span>
            </a>
          </div>
          <div class="flex items-center gap-2">
            <button id="search-toggle" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Search (⌘K or /)">
              <i data-lucide="search" class="w-5 h-5"></i>
            </button>
            <button id="theme-toggle" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Toggle theme">
              <i data-lucide="sun" class="w-5 h-5 hidden dark:block"></i>
              <i data-lucide="moon" class="w-5 h-5 block dark:hidden"></i>
            </button>
          </div>
        </div>
      </nav>

      <!-- Search Modal -->
      <div id="search-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="search-backdrop"></div>
        <div class="relative max-w-2xl mx-auto mt-20 px-4">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <i data-lucide="search" class="w-5 h-5 text-slate-400"></i>
              <input id="search-input" type="text" placeholder="Search topics, vocabulary, concepts..." class="flex-1 bg-transparent outline-none text-lg" autocomplete="off">
              <kbd class="hidden sm:block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs text-slate-500">ESC</kbd>
            </div>
            <div id="search-results" class="max-h-96 overflow-y-auto p-2"></div>
          </div>
        </div>
      </div>

      <!-- Layout: Sidebar + Content -->
      <div class="flex min-h-[calc(100vh-57px)]">
        <!-- Sidebar -->
        <aside id="app-sidebar" class="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hidden lg:block overflow-y-auto">
          <div class="p-4">
            <!-- Progress -->
            <div class="mb-6 text-center">
              <div class="relative w-16 h-16 mx-auto mb-2">
                <svg class="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="8" class="text-slate-200 dark:text-slate-700"/>
                  <circle id="sidebar-progress-ring" cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="8"
                          stroke-dasharray="264" stroke-dashoffset="264" stroke-linecap="round"
                          class="text-blue-500 transition-all duration-500"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span id="sidebar-progress-pct" class="text-sm font-bold">0%</span>
                </div>
              </div>
              <p class="text-xs text-slate-500">Overall Progress</p>
            </div>

            <!-- Topic Links -->
            <nav class="space-y-1">
              ${TOPICS.map((topic, i) => `
                <a data-route="#/topic/${topic.id}" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" data-topic-id="${topic.id}">
                  <div class="w-6 h-6 rounded flex items-center justify-center bg-${topic.color}-100 dark:bg-${topic.color}-900/40 flex-shrink-0">
                    <i data-lucide="${topic.icon}" class="w-3.5 h-3.5 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
                  </div>
                  <span class="flex-1 truncate">${topic.title}</span>
                  <div class="sidebar-check w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0" data-progress-indicator="${topic.id}">
                    <i data-lucide="check" class="w-2.5 h-2.5 text-green-500 hidden"></i>
                  </div>
                </a>
              `).join('')}
            </nav>

            <!-- Study Tools -->
            <div class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
              <a data-route="#/homework" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="clipboard-list" class="w-4 h-4 text-orange-500"></i>
                <span>Homework</span>
              </a>
              <a data-route="#/flashcards" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="layers" class="w-4 h-4 text-violet-500"></i>
                <span>Flashcards</span>
              </a>
              <a data-route="#/concept-map" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="git-branch" class="w-4 h-4 text-cyan-500"></i>
                <span>Concept Map</span>
              </a>
            </div>
          </div>
        </aside>

        <!-- Mobile Sidebar Overlay -->
        <div id="sidebar-overlay" class="fixed inset-0 z-40 bg-black/50 hidden lg:hidden" style="display:none"></div>

        <!-- Main Content -->
        <main id="app-content" class="flex-1 min-w-0"></main>
      </div>

      <!-- Keyboard Shortcuts Modal -->
      <div id="shortcuts-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="document.getElementById('shortcuts-modal').classList.add('hidden')"></div>
        <div class="relative max-w-md mx-auto mt-24 px-4">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <i data-lucide="keyboard" class="w-5 h-5 text-blue-500"></i> Keyboard Shortcuts
            </h2>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Search</span><div class="flex gap-1"><kbd class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">/</kbd> or <kbd class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">⌘K</kbd></div></div>
              <div class="flex justify-between"><span class="text-slate-500">Next section</span><kbd class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">j</kbd></div>
              <div class="flex justify-between"><span class="text-slate-500">Previous section</span><kbd class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">k</kbd></div>
              <div class="flex justify-between"><span class="text-slate-500">Next topic</span><kbd class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">n</kbd></div>
              <div class="flex justify-between"><span class="text-slate-500">Previous topic</span><kbd class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">p</kbd></div>
              <div class="flex justify-between"><span class="text-slate-500">Toggle theme</span><kbd class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">t</kbd></div>
              <div class="flex justify-between"><span class="text-slate-500">Home</span><kbd class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">h</kbd></div>
              <div class="flex justify-between"><span class="text-slate-500">This help</span><kbd class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">?</kbd></div>
            </div>
            <p class="text-xs text-slate-400 mt-4 text-center">Press ESC to close</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="border-t border-slate-200 dark:border-slate-700">
        <div class="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-slate-400">
          HTGAA Spring 2026 — How to Grow (Almost) Anything — MIT MAS.885
        </div>
      </footer>
    `;

    // Init icons
    if (window.lucide) lucide.createIcons();

    // Update progress display
    this.updateSidebarProgress();
  }

  initShell() {
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      store.toggleTheme();
      if (window.lucide) lucide.createIcons();
    });

    // Sidebar toggle (mobile)
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('sidebar-toggle');

    toggle?.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('mobile-open');
      if (isOpen) {
        sidebar.classList.remove('mobile-open');
        sidebar.classList.add('hidden');
        sidebar.classList.remove('fixed', 'inset-y-0', 'left-0', 'z-50');
        overlay.style.display = 'none';
      } else {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('mobile-open', 'fixed', 'inset-y-0', 'left-0', 'z-50');
        overlay.style.display = 'block';
      }
    });

    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open', 'fixed', 'inset-y-0', 'left-0', 'z-50');
      sidebar.classList.add('hidden');
      overlay.style.display = 'none';
    });

    // Close sidebar on navigation (mobile)
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-route]') && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open', 'fixed', 'inset-y-0', 'left-0', 'z-50');
        sidebar.classList.add('hidden');
        overlay.style.display = 'none';
      }
    });

    // Search — use the full SearchUI module (fuzzy matching, keyboard nav, Cmd+K)
    this.searchUI = new SearchUI();
    this.searchUI.init();

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      const shortcuts = document.getElementById('shortcuts-modal');
      if (e.key === '?') {
        e.preventDefault();
        shortcuts.classList.toggle('hidden');
      }
      if (e.key === 'Escape' && !shortcuts.classList.contains('hidden')) {
        shortcuts.classList.add('hidden');
      }
      if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
        store.toggleTheme();
        if (window.lucide) lucide.createIcons();
      }
      if (e.key === 'h' && !e.metaKey && !e.ctrlKey) {
        window.location.hash = '#/';
      }
    });
  }

  updateSidebarProgress() {
    const pct = store.getOverallProgress();
    const ring = document.getElementById('sidebar-progress-ring');
    const pctEl = document.getElementById('sidebar-progress-pct');

    if (ring) ring.setAttribute('stroke-dashoffset', 264 - (pct / 100) * 264);
    if (pctEl) pctEl.textContent = pct + '%';

    // Update individual topic indicators
    TOPICS.forEach(topic => {
      const indicator = document.querySelector(`[data-progress-indicator="${topic.id}"]`);
      if (!indicator) return;
      const isComplete = store.isTopicComplete(topic.id);
      if (isComplete) {
        indicator.classList.remove('border-slate-300', 'dark:border-slate-600');
        indicator.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/30');
        const check = indicator.querySelector('i');
        if (check) check.classList.remove('hidden');
      }
    });
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
