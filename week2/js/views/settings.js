/**
 * HTGAA Week 2 — Settings View
 * Export/import progress, reset data, and configure preferences.
 */

import { store, TOPICS } from '../store.js';

const PROGRESS_KEYS = [
  'htgaa-week2-progress',
  'htgaa-week2-quizzes',
  'htgaa-week2-flashcards',
  'htgaa-week2-homework-checks',
  'htgaa-week2-study-log',
  'htgaa-week2-activity-feed',
  'htgaa-week2-exam-scores',
  'htgaa-week2-bookmarks',
  'htgaa-week2-section-progress',
  'htgaa-week2-notes',
  'htgaa-week2-confidence',
  'htgaa-week2-time-spent',
  'htgaa-week2-session-start',
];

function createSettingsView() {
  return {
    render() {
      const progress = store.get('progress');
      const completedCount = TOPICS.filter(t => progress[t.id]).length;
      const quizzes = store.get('quizzes') || {};
      const quizCount = Object.keys(quizzes).length;
      const notesCount = store.getNotesCount();
      const bookmarks = store.getBookmarks();
      const fcStats = store.getFlashcardStats();
      const log = store.getStudyLog();
      const activeDays = Object.values(log).filter(v => v > 0).length;

      return `
        <div class="max-w-3xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <i data-lucide="settings" class="w-5 h-5 text-slate-600 dark:text-slate-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Settings</h1>
                <p class="text-sm text-slate-500">Manage your data, export progress, and preferences</p>
              </div>
            </div>
          </header>

          <!-- Current Data Overview -->
          <section class="mb-8">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <i data-lucide="database" class="w-5 h-5 text-blue-500"></i> Your Data
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
                <div class="text-xl font-bold text-blue-600">${completedCount}/6</div>
                <div class="text-xs text-slate-500">Topics</div>
              </div>
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
                <div class="text-xl font-bold text-green-600">${quizCount}</div>
                <div class="text-xs text-slate-500">Quiz answers</div>
              </div>
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
                <div class="text-xl font-bold text-violet-600">${fcStats.total}</div>
                <div class="text-xs text-slate-500">Flashcards</div>
              </div>
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
                <div class="text-xl font-bold text-amber-600">${activeDays}</div>
                <div class="text-xs text-slate-500">Study days</div>
              </div>
            </div>
            <div class="text-xs text-slate-400">
              Also stored: ${notesCount} notes, ${bookmarks.length} bookmarks, ${store.getExamScores().length} exam scores
            </div>
          </section>

          <!-- Export/Import -->
          <section class="mb-8">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <i data-lucide="hard-drive-download" class="w-5 h-5 text-emerald-500"></i> Export & Import
            </h2>
            <div class="space-y-3">
              <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Export Progress</h3>
                    <p class="text-xs text-slate-500">Download a JSON file with all your progress data. Use this to back up or transfer to another device.</p>
                  </div>
                  <button id="export-btn" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                    <i data-lucide="download" class="w-4 h-4"></i> Export
                  </button>
                </div>
              </div>

              <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Import Progress</h3>
                    <p class="text-xs text-slate-500">Load a previously exported JSON file. This will merge with existing data.</p>
                  </div>
                  <label class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer">
                    <i data-lucide="upload" class="w-4 h-4"></i> Import
                    <input type="file" accept=".json" id="import-input" class="hidden">
                  </label>
                </div>
                <div id="import-status" class="hidden mt-2 p-2 rounded-lg text-xs"></div>
              </div>
            </div>
          </section>

          <!-- Danger Zone -->
          <section class="mb-8">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2 text-red-500">
              <i data-lucide="alert-triangle" class="w-5 h-5"></i> Danger Zone
            </h2>
            <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/40">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-bold text-red-700 dark:text-red-300">Reset All Progress</h3>
                  <p class="text-xs text-red-500 dark:text-red-400">Permanently delete all your study data. This cannot be undone.</p>
                </div>
                <button id="reset-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  Reset
                </button>
              </div>
              <div id="reset-confirm" class="hidden mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-red-300 dark:border-red-700">
                <p class="text-xs text-red-600 dark:text-red-400 font-medium mb-2">Are you sure? Type "RESET" to confirm:</p>
                <div class="flex gap-2">
                  <input type="text" id="reset-input" class="flex-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-700 bg-transparent text-sm outline-none focus:border-red-400" placeholder="Type RESET">
                  <button id="reset-confirm-btn" class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Confirm</button>
                  <button id="reset-cancel-btn" class="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-300">Cancel</button>
                </div>
              </div>
            </div>
          </section>

          <!-- Storage Info -->
          <section class="mb-8">
            <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Storage</h2>
            <div class="text-xs text-slate-500 space-y-1">
              <p>All data is stored in your browser's localStorage. It persists across sessions but is device-specific.</p>
              <p>Total storage used: <span class="font-mono font-bold">${getStorageSize()}</span></p>
              <p>Data keys: ${PROGRESS_KEYS.length}</p>
            </div>
          </section>
        </div>
      `;
    },

    mount(container) {
      // Export button
      container.querySelector('#export-btn')?.addEventListener('click', () => {
        const data = {};
        PROGRESS_KEYS.forEach(key => {
          const val = localStorage.getItem(key);
          if (val !== null) data[key] = val;
        });
        data._exportDate = new Date().toISOString();
        data._version = 'htgaa-week2-v1';

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `htgaa-week2-progress-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      // Import button
      container.querySelector('#import-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const statusEl = container.querySelector('#import-status');

        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            let imported = 0;

            PROGRESS_KEYS.forEach(key => {
              if (data[key] !== undefined) {
                localStorage.setItem(key, data[key]);
                imported++;
              }
            });

            // Reload store state
            store._state.progress = JSON.parse(localStorage.getItem('htgaa-week2-progress') || '{}');
            store._state.quizzes = JSON.parse(localStorage.getItem('htgaa-week2-quizzes') || '{}');
            store._state.flashcards = JSON.parse(localStorage.getItem('htgaa-week2-flashcards') || '{"cards":[],"reviews":{}}');
            store._state.homeworkChecks = JSON.parse(localStorage.getItem('htgaa-week2-homework-checks') || '{}');

            statusEl.className = 'mt-2 p-2 rounded-lg text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            statusEl.textContent = `Imported ${imported} data keys from ${data._exportDate ? 'export dated ' + new Date(data._exportDate).toLocaleDateString() : 'file'}. Refreshing...`;
            statusEl.classList.remove('hidden');

            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            statusEl.className = 'mt-2 p-2 rounded-lg text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            statusEl.textContent = `Error: Invalid file format. ${err.message}`;
            statusEl.classList.remove('hidden');
          }
        };
        reader.readAsText(file);
      });

      // Reset flow
      const resetBtn = container.querySelector('#reset-btn');
      const resetConfirm = container.querySelector('#reset-confirm');
      const resetInput = container.querySelector('#reset-input');
      const confirmBtn = container.querySelector('#reset-confirm-btn');
      const cancelBtn = container.querySelector('#reset-cancel-btn');

      resetBtn?.addEventListener('click', () => {
        resetConfirm.classList.remove('hidden');
        resetBtn.classList.add('hidden');
      });

      cancelBtn?.addEventListener('click', () => {
        resetConfirm.classList.add('hidden');
        resetBtn.classList.remove('hidden');
        resetInput.value = '';
      });

      resetInput?.addEventListener('input', () => {
        confirmBtn.disabled = resetInput.value !== 'RESET';
      });

      confirmBtn?.addEventListener('click', () => {
        if (resetInput.value !== 'RESET') return;
        PROGRESS_KEYS.forEach(key => localStorage.removeItem(key));
        window.location.hash = '#/';
        window.location.reload();
      });
    }
  };
}

function getStorageSize() {
  let total = 0;
  PROGRESS_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) total += key.length + val.length;
  });
  if (total < 1024) return `${total} bytes`;
  if (total < 1048576) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / 1048576).toFixed(1)} MB`;
}

export { createSettingsView };
