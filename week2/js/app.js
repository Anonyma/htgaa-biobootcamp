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
import { createExamView } from './views/exam.js';
import { createCompareView } from './views/compare.js';
import { createGlossaryView } from './views/glossary.js';
import { createStudySummaryView } from './views/study-summary.js';
import { createQuickReviewView } from './views/quick-review.js';
import { createNotesView } from './views/notes.js';
import { createWeakPointsView } from './views/weak-points.js';
import { createBookmarksView } from './views/bookmarks.js';
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
      .on('/concept-map', () => createConceptMapView())
      .on('/exam', () => createExamView())
      .on('/compare', () => createCompareView())
      .on('/compare/:a/:b', ({ a, b }) => createCompareView(a, b))
      .on('/glossary', () => createGlossaryView())
      .on('/review/:id', ({ id }) => createQuickReviewView(id))
      .on('/summary', () => createStudySummaryView())
      .on('/notes', () => createNotesView())
      .on('/weak-points', () => createWeakPointsView())
      .on('/bookmarks', () => createBookmarksView());

    // Start
    this.router.start();

    // Wire up shell interactions
    this.initShell();

    // Listen for progress updates to refresh sidebar
    store.subscribe('progress', () => this.updateSidebarProgress());
    store.subscribe('topicData', () => this.updateSidebarProgress());
    document.addEventListener('progress-updated', () => this.updateSidebarProgress());
  }

  renderShell() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <!-- Skip to Content -->
      <a href="#app-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none" id="skip-link">
        Skip to content
      </a>

      <!-- Top Nav -->
      <nav class="sticky top-0 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-slate-200 dark:border-slate-700" role="navigation" aria-label="Main navigation">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button id="sidebar-toggle" class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle sidebar" aria-expanded="false">
              <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
            <a data-route="#/" class="flex items-center gap-2 cursor-pointer">
              <span class="text-xl">🧬</span>
              <span class="font-bold text-lg hidden sm:inline">HTGAA Week 2</span>
              <span class="font-bold text-lg sm:hidden">W2</span>
            </a>
          </div>
          <div class="flex items-center gap-1">
            <button id="search-toggle" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Search (⌘K or /)">
              <i data-lucide="search" class="w-5 h-5"></i>
            </button>
            <button id="font-size-toggle" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Font size">
              <i data-lucide="type" class="w-5 h-5"></i>
            </button>
            <button id="focus-toggle" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Focus mode (f)">
              <i data-lucide="maximize-2" class="w-5 h-5"></i>
            </button>
            <button id="theme-toggle" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Toggle theme">
              <i data-lucide="sun" class="w-5 h-5 hidden dark:block"></i>
              <i data-lucide="moon" class="w-5 h-5 block dark:hidden"></i>
            </button>
          </div>
        </div>
      </nav>

      <!-- Search Modal -->
      <div id="search-modal" class="fixed inset-0 z-[100] hidden" style="display:none">
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
        <aside id="app-sidebar" class="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hidden lg:block overflow-y-auto" role="complementary" aria-label="Study navigation">
          <div class="p-4">
            <!-- Progress -->
            <div class="mb-6 text-center">
              <div class="relative w-16 h-16 mx-auto mb-2" style="width:64px;height:64px">
                <svg class="w-16 h-16 -rotate-90" viewBox="0 0 100 100" style="width:64px;height:64px">
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
                  <div class="flex items-center gap-1.5 flex-shrink-0">
                    <div class="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" data-sidebar-bar="${topic.id}">
                      <div class="h-full rounded-full bg-${topic.color}-500 transition-all duration-500" style="width: 0%"></div>
                    </div>
                    <div class="sidebar-check w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0" data-progress-indicator="${topic.id}">
                      <i data-lucide="check" class="w-2.5 h-2.5 text-green-500 hidden"></i>
                    </div>
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
                <span class="flex-1">Flashcards</span>
                <span id="sidebar-fc-due" class="hidden text-xs px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold"></span>
              </a>
              <a data-route="#/concept-map" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="git-branch" class="w-4 h-4 text-cyan-500"></i>
                <span>Concept Map</span>
              </a>
              <a data-route="#/exam" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="trophy" class="w-4 h-4 text-amber-500"></i>
                <span class="flex-1">Exam Mode</span>
                ${(() => {
                  const best = store.getBestExamScore();
                  if (!best) return '';
                  const color = best.pct >= 80 ? 'green' : best.pct >= 60 ? 'yellow' : 'red';
                  return `<span class="text-xs px-1.5 py-0.5 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 font-bold">${best.pct}%</span>`;
                })()}
              </a>
              <a data-route="#/compare" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="columns" class="w-4 h-4 text-teal-500"></i>
                <span>Compare Topics</span>
              </a>
              <a data-route="#/glossary" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="book-a" class="w-4 h-4 text-emerald-500"></i>
                <span>Glossary</span>
              </a>
              <a data-route="#/summary" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="file-text" class="w-4 h-4 text-rose-500"></i>
                <span>Study Summary</span>
              </a>
              <a data-route="#/notes" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="sticky-note" class="w-4 h-4 text-amber-500"></i>
                <span class="flex-1">My Notes</span>
                <span id="sidebar-notes-count" class="hidden text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold"></span>
              </a>
              <a data-route="#/weak-points" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="crosshair" class="w-4 h-4 text-red-500"></i>
                <span>Weak Points</span>
              </a>
              <a data-route="#/bookmarks" class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <i data-lucide="bookmark" class="w-4 h-4 text-blue-500"></i>
                <span class="flex-1">Bookmarks</span>
                <span id="sidebar-bookmarks-count" class="hidden text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"></span>
              </a>
            </div>

            <!-- Pomodoro Study Timer -->
            <div class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div class="px-3 py-2">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pomodoro Timer</span>
                  <div class="flex items-center gap-1">
                    <button id="session-timer-reset" class="text-xs text-slate-400 hover:text-slate-600 font-medium hidden" title="Reset">
                      <i data-lucide="rotate-ccw" class="w-3 h-3 inline"></i>
                    </button>
                    <button id="session-timer-toggle" class="text-xs text-blue-500 hover:text-blue-600 font-medium" title="Start/Pause">
                      <i data-lucide="play" class="w-3.5 h-3.5 inline"></i>
                    </button>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="relative" style="width:48px;height:48px">
                    <svg class="-rotate-90" viewBox="0 0 48 48" style="width:48px;height:48px">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-200 dark:text-slate-700"/>
                      <circle id="pomodoro-ring" cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="3" class="text-blue-500"
                        stroke-dasharray="125.66" stroke-dashoffset="125.66" stroke-linecap="round" style="transition:stroke-dashoffset 1s linear"/>
                    </svg>
                    <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-500" id="pomodoro-cycle">1</span>
                  </div>
                  <div>
                    <div class="text-2xl font-mono font-bold text-slate-700 dark:text-slate-300" id="session-timer-display">25:00</div>
                    <p class="text-xs text-slate-400" id="session-timer-status">25 min focus session</p>
                  </div>
                </div>
                <div class="flex gap-1 mt-2" id="pomodoro-dots">
                  <span class="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" data-dot="1"></span>
                  <span class="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" data-dot="2"></span>
                  <span class="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" data-dot="3"></span>
                  <span class="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" data-dot="4"></span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Mobile Sidebar Overlay -->
        <div id="sidebar-overlay" class="fixed inset-0 z-40 bg-black/50 hidden lg:hidden" style="display:none"></div>

        <!-- Main Content -->
        <main id="app-content" class="flex-1 min-w-0" role="main" aria-label="Topic content"></main>
      </div>

      <!-- Keyboard Shortcuts Modal -->
      <div id="shortcuts-modal" class="shortcuts-modal-overlay hidden">
        <div class="shortcuts-modal-backdrop" onclick="document.getElementById('shortcuts-modal').classList.add('hidden')"></div>
        <div class="shortcuts-modal-container">
          <div class="shortcuts-modal-content">
            <div class="shortcuts-modal-header">
              <h2 class="shortcuts-modal-title">
                <i data-lucide="keyboard" class="w-5 h-5"></i> Keyboard Shortcuts
              </h2>
              <button class="shortcuts-modal-close" onclick="document.getElementById('shortcuts-modal').classList.add('hidden')" aria-label="Close">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>

            <div class="shortcuts-modal-body">
              <!-- Navigation group -->
              <div class="shortcuts-group">
                <h3 class="shortcuts-group-label">Navigation</h3>
                <div class="shortcuts-grid">
                  <div class="shortcut-row"><kbd class="shortcut-key">j</kbd><span class="shortcut-desc">Next section</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">k</kbd><span class="shortcut-desc">Previous section</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">n</kbd><span class="shortcut-desc">Next topic</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">p</kbd><span class="shortcut-desc">Previous topic</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">h</kbd><span class="shortcut-desc">Go home</span></div>
                </div>
              </div>

              <!-- Search & UI group -->
              <div class="shortcuts-group">
                <h3 class="shortcuts-group-label">Search & Interface</h3>
                <div class="shortcuts-grid">
                  <div class="shortcut-row"><div class="flex items-center gap-1"><kbd class="shortcut-key">/</kbd><span class="shortcut-or">or</span><kbd class="shortcut-key">\u2318K</kbd></div><span class="shortcut-desc">Open search</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">f</kbd><span class="shortcut-desc">Toggle focus mode</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">t</kbd><span class="shortcut-desc">Toggle dark/light theme</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">c</kbd><span class="shortcut-desc">Toggle table of contents</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">Esc</kbd><span class="shortcut-desc">Close modal / search</span></div>
                </div>
              </div>

              <!-- Flashcards group -->
              <div class="shortcuts-group">
                <h3 class="shortcuts-group-label">Flashcards</h3>
                <div class="shortcuts-grid">
                  <div class="shortcut-row"><kbd class="shortcut-key">Space</kbd><span class="shortcut-desc">Flip card</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">1</kbd><span class="shortcut-desc">Rate: Again</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">2</kbd><span class="shortcut-desc">Rate: Hard</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">3</kbd><span class="shortcut-desc">Rate: Good</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">4</kbd><span class="shortcut-desc">Rate: Easy</span></div>
                </div>
              </div>

              <!-- Exam group -->
              <div class="shortcuts-group">
                <h3 class="shortcuts-group-label">Exam Mode</h3>
                <div class="shortcuts-grid">
                  <div class="shortcut-row"><kbd class="shortcut-key">\u2190 \u2192</kbd><span class="shortcut-desc">Prev / next question</span></div>
                  <div class="shortcut-row"><kbd class="shortcut-key">1-4</kbd><span class="shortcut-desc">Select answer A-D</span></div>
                </div>
              </div>

              <!-- Help group -->
              <div class="shortcuts-group">
                <h3 class="shortcuts-group-label">Help</h3>
                <div class="shortcuts-grid">
                  <div class="shortcut-row"><kbd class="shortcut-key">?</kbd><span class="shortcut-desc">Show this help</span></div>
                </div>
              </div>
            </div>

            <div class="shortcuts-modal-footer">
              Press <kbd class="shortcut-key shortcut-key-inline">Esc</kbd> or <kbd class="shortcut-key shortcut-key-inline">?</kbd> to close
            </div>
          </div>
        </div>
      </div>

      <!-- Keyboard Shortcuts Help Button -->
      <button id="keyboard-help-btn" class="keyboard-help-btn" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">
        <span>?</span>
      </button>

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

    // Focus mode
    const toggleFocus = () => {
      document.body.classList.toggle('focus-mode');
      const btn = document.getElementById('focus-toggle');
      if (btn) {
        const isFocused = document.body.classList.contains('focus-mode');
        btn.innerHTML = isFocused
          ? '<i data-lucide="minimize-2" class="w-5 h-5"></i>'
          : '<i data-lucide="maximize-2" class="w-5 h-5"></i>';
        if (window.lucide) lucide.createIcons();
      }
    };
    document.getElementById('focus-toggle')?.addEventListener('click', toggleFocus);

    // Font size toggle (cycles: normal -> large -> xl -> normal)
    const FONT_SIZES = ['text-base', 'text-lg', 'text-xl'];
    let fontIdx = 0;
    document.getElementById('font-size-toggle')?.addEventListener('click', () => {
      const content = document.getElementById('app-content');
      if (!content) return;
      content.classList.remove(FONT_SIZES[fontIdx]);
      fontIdx = (fontIdx + 1) % FONT_SIZES.length;
      content.classList.add(FONT_SIZES[fontIdx]);
    });

    // Global keyboard shortcuts
    const toggleShortcutsModal = () => {
      const modal = document.getElementById('shortcuts-modal');
      modal.classList.toggle('hidden');
      if (!modal.classList.contains('hidden') && window.lucide) lucide.createIcons();
    };

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      const shortcuts = document.getElementById('shortcuts-modal');
      if (e.key === '?') {
        e.preventDefault();
        toggleShortcutsModal();
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
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        toggleFocus();
      }
    });

    // "?" help button in bottom-right corner
    document.getElementById('keyboard-help-btn')?.addEventListener('click', toggleShortcutsModal);

    // Session study timer
    this.initSessionTimer();
  }

  initSessionTimer() {
    const display = document.getElementById('session-timer-display');
    const toggleBtn = document.getElementById('session-timer-toggle');
    const resetBtn = document.getElementById('session-timer-reset');
    const statusEl = document.getElementById('session-timer-status');
    const ring = document.getElementById('pomodoro-ring');
    const cycleEl = document.getElementById('pomodoro-cycle');
    const dotsEl = document.getElementById('pomodoro-dots');
    if (!display || !toggleBtn) return;

    const WORK_DURATION = 25 * 60;
    const BREAK_DURATION = 5 * 60;
    const LONG_BREAK = 15 * 60;
    const CIRCUMFERENCE = 125.66;

    let remaining = WORK_DURATION;
    let running = false;
    let interval = null;
    let isBreak = false;
    let cycle = 1;
    let completedPomodoros = 0;

    const fmt = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const updateRing = () => {
      if (!ring) return;
      const total = isBreak ? (cycle % 4 === 0 ? LONG_BREAK : BREAK_DURATION) : WORK_DURATION;
      const progress = 1 - (remaining / total);
      ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
      ring.classList.toggle('text-blue-500', !isBreak);
      ring.classList.toggle('text-green-500', isBreak);
    };

    const updateDots = () => {
      if (!dotsEl) return;
      dotsEl.querySelectorAll('[data-dot]').forEach((dot, i) => {
        dot.className = `w-2 h-2 rounded-full ${i < completedPomodoros ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`;
      });
    };

    const update = () => {
      display.textContent = fmt(remaining);
      updateRing();
      if (cycleEl) cycleEl.textContent = cycle;
    };

    const startBreak = () => {
      isBreak = true;
      completedPomodoros++;
      const isLong = completedPomodoros % 4 === 0;
      remaining = isLong ? LONG_BREAK : BREAK_DURATION;
      if (statusEl) {
        statusEl.textContent = isLong ? '15 min long break' : '5 min break';
        statusEl.classList.add('text-green-500');
        statusEl.classList.remove('text-blue-500', 'text-amber-500');
      }
      display.classList.add('text-green-500');
      display.classList.remove('text-slate-700', 'dark:text-slate-300');
      updateDots();
      update();
    };

    const startWork = () => {
      isBreak = false;
      cycle++;
      remaining = WORK_DURATION;
      if (statusEl) {
        statusEl.textContent = 'Focus session';
        statusEl.classList.remove('text-green-500', 'text-amber-500');
      }
      display.classList.remove('text-green-500');
      update();
    };

    const tick = () => {
      if (document.hidden) return;
      remaining--;
      if (remaining <= 0) {
        if (isBreak) {
          startWork();
        } else {
          startBreak();
        }
      }
      update();
    };

    toggleBtn.addEventListener('click', () => {
      if (running) {
        clearInterval(interval);
        running = false;
        toggleBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5 inline"></i>';
        if (statusEl) statusEl.textContent = 'Paused';
        if (resetBtn) resetBtn.classList.remove('hidden');
      } else {
        interval = setInterval(tick, 1000);
        running = true;
        toggleBtn.innerHTML = '<i data-lucide="pause" class="w-3.5 h-3.5 inline"></i>';
        if (statusEl) {
          statusEl.textContent = isBreak ? 'Break time' : 'Focus session';
          statusEl.classList.remove('text-amber-500');
        }
        if (resetBtn) resetBtn.classList.add('hidden');
      }
      if (window.lucide) lucide.createIcons();
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        clearInterval(interval);
        running = false;
        isBreak = false;
        cycle = 1;
        completedPomodoros = 0;
        remaining = WORK_DURATION;
        toggleBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5 inline"></i>';
        if (statusEl) { statusEl.textContent = '25 min focus session'; statusEl.className = 'text-xs text-slate-400'; }
        display.className = 'text-2xl font-mono font-bold text-slate-700 dark:text-slate-300';
        resetBtn.classList.add('hidden');
        updateDots();
        update();
        if (window.lucide) lucide.createIcons();
      });
    }

    update();
  }

  updateSidebarProgress() {
    const pct = store.getOverallProgress();
    const ring = document.getElementById('sidebar-progress-ring');
    const pctEl = document.getElementById('sidebar-progress-pct');

    if (ring) ring.setAttribute('stroke-dashoffset', 264 - (pct / 100) * 264);
    if (pctEl) pctEl.textContent = pct + '%';

    // Update flashcard due count badge
    this.updateFlashcardBadge();

    // Update notes count badge
    const notesBadge = document.getElementById('sidebar-notes-count');
    if (notesBadge) {
      const count = store.getNotesCount();
      if (count > 0) { notesBadge.textContent = count; notesBadge.classList.remove('hidden'); }
      else { notesBadge.classList.add('hidden'); }
    }

    const bmBadge = document.getElementById('sidebar-bookmarks-count');
    if (bmBadge) {
      const count = store.getBookmarks().length;
      if (count > 0) { bmBadge.textContent = count; bmBadge.classList.remove('hidden'); }
      else { bmBadge.classList.add('hidden'); }
    }

    // Update individual topic indicators + progress bars
    TOPICS.forEach(topic => {
      const indicator = document.querySelector(`[data-progress-indicator="${topic.id}"]`);
      if (indicator) {
        const isComplete = store.isTopicComplete(topic.id);
        if (isComplete) {
          indicator.classList.remove('border-slate-300', 'dark:border-slate-600');
          indicator.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/30');
          const check = indicator.querySelector('i');
          if (check) check.classList.remove('hidden');
        }
      }

      // Update sidebar progress bar
      const bar = document.querySelector(`[data-sidebar-bar="${topic.id}"] > div`);
      if (bar) {
        const topicData = store.get('topicData')[topic.id];
        const totalSections = topicData?.sections?.length || 0;
        if (totalSections > 0) {
          const sectionsRead = store.getSectionsRead(topic.id).length;
          const sectionPct = Math.round((sectionsRead / totalSections) * 100);
          bar.style.width = sectionPct + '%';
        }
      }
    });
  }
  async updateFlashcardBadge() {
    const badge = document.getElementById('sidebar-fc-due');
    if (!badge) return;
    try {
      // Load all vocab cards to check due count
      let allCards = [];
      for (const topic of TOPICS) {
        const data = await store.loadTopicData(topic.id);
        if (data?.vocabulary) {
          data.vocabulary.forEach((v, i) => {
            allCards.push({ id: `${topic.id}-vocab-${i}`, topicId: topic.id, term: v.term, definition: v.definition });
          });
        }
      }
      const dueCards = store.getDueFlashcards(allCards);
      if (dueCards.length > 0) {
        badge.textContent = dueCards.length;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    } catch { /* ignore */ }
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
