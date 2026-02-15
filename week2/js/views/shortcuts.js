import { store, TOPICS } from '../store.js';

function createShortcutsView() {
  return {
    render() {
      return `
        <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <!-- Header -->
          <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
            <div class="max-w-5xl mx-auto px-6 py-8">
              <div class="flex items-center gap-4 mb-3">
                <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                  <i data-lucide="keyboard" class="w-7 h-7"></i>
                </div>
                <div>
                  <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
                    Keyboard Shortcuts
                  </h1>
                  <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Navigate faster with keyboard shortcuts
                  </p>
                </div>
              </div>

              <!-- Search Filter -->
              <div class="mt-6">
                <div class="relative">
                  <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                  <input
                    type="text"
                    id="shortcut-search"
                    placeholder="Search shortcuts..."
                    class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-5xl mx-auto px-6 py-8 pb-16">
            <div class="space-y-6" id="shortcuts-container">

              <!-- Navigation Section -->
              <div class="shortcut-section bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm" data-category="navigation">
                <div class="flex items-center gap-3 mb-5">
                  <i data-lucide="compass" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white">Navigation</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="shortcut-item flex items-center gap-3" data-search="h home go to home">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">h</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Go to Home</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="home go to home">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">Home</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Go to Home</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="1 2 3 4 5 6 jump to topic">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">1</kbd>
                    <span class="text-slate-500 dark:text-slate-500 mx-1">-</span>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">6</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Jump to topic 1-6</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="g h homework">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">g</kbd>
                    <span class="text-slate-500 dark:text-slate-500 mx-1">then</span>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">h</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Homework</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="g f flashcards">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">g</kbd>
                    <span class="text-slate-500 dark:text-slate-500 mx-1">then</span>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">f</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Flashcards</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="g e exam mode">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">g</kbd>
                    <span class="text-slate-500 dark:text-slate-500 mx-1">then</span>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">e</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Exam Mode</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="g g glossary">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">g</kbd>
                    <span class="text-slate-500 dark:text-slate-500 mx-1">then</span>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">g</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Glossary</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="g c concept map">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">g</kbd>
                    <span class="text-slate-500 dark:text-slate-500 mx-1">then</span>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">c</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Concept Map</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="g p quick practice">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">g</kbd>
                    <span class="text-slate-500 dark:text-slate-500 mx-1">then</span>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">p</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Quick Practice</span>
                  </div>
                </div>
              </div>

              <!-- Study Tools Section -->
              <div class="shortcut-section bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm" data-category="study tools">
                <div class="flex items-center gap-3 mb-5">
                  <i data-lucide="tool" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white">Study Tools</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="shortcut-item flex items-center gap-3" data-search="f focus mode toggle">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">f</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Toggle Focus Mode</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="d dark mode toggle theme">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">d</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Toggle Dark Mode</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="/ search open">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">/</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Open Search</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="cmd k command k search open">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">⌘</kbd>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">K</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Open Search</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="? help shortcuts show">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">?</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Show Shortcuts Help</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="esc escape close modal exit">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">Esc</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Close modal / exit search</span>
                  </div>
                </div>
              </div>

              <!-- Topic Page Section -->
              <div class="shortcut-section bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm" data-category="topic page">
                <div class="flex items-center gap-3 mb-5">
                  <i data-lucide="book-open" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white">Topic Page</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="shortcut-item flex items-center gap-3" data-search="j next section down">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">j</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Next section</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="k previous section up">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">k</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Previous section</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="n next topic forward">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">n</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Next topic</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="p previous topic back">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">p</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Previous topic</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="b bookmark current section save">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">b</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Bookmark current section</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="q quiz jump to quiz section">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">q</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Jump to quiz section</span>
                  </div>
                </div>
              </div>

              <!-- Quiz/Practice Section -->
              <div class="shortcut-section bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm" data-category="quiz practice">
                <div class="flex items-center gap-3 mb-5">
                  <i data-lucide="check-circle" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white">Quiz/Practice</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="shortcut-item flex items-center gap-3" data-search="1 2 3 4 a b c d select answer option">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">1</kbd>
                    <span class="text-slate-500 dark:text-slate-500 mx-1">-</span>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">4</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Select answer option</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="a b c d select answer option">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">a</kbd>
                    <span class="text-slate-500 dark:text-slate-500 mx-1">-</span>
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">d</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Select answer option</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="enter submit next continue">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">Enter</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Submit / Next</span>
                  </div>
                  <div class="shortcut-item flex items-center gap-3" data-search="space skip question">
                    <kbd class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-sm">Space</kbd>
                    <span class="text-sm text-slate-600 dark:text-slate-400">Skip question</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Footer Note -->
            <div class="mt-8 text-center">
              <div class="inline-flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg">
                <i data-lucide="info" class="w-4 h-4 text-indigo-600 dark:text-indigo-400"></i>
                <span class="text-sm text-indigo-700 dark:text-indigo-300">
                  Press
                  <kbd class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 mx-1 bg-white dark:bg-slate-700 border border-indigo-300 dark:border-indigo-600 rounded text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">?</kbd>
                  anywhere to see this page
                </span>
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

      // Search/filter functionality
      const searchInput = container.querySelector('#shortcut-search');
      const shortcutItems = container.querySelectorAll('.shortcut-item');
      const shortcutSections = container.querySelectorAll('.shortcut-section');

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase().trim();

          if (!query) {
            // Show all items and sections
            shortcutItems.forEach(item => {
              item.style.display = 'flex';
            });
            shortcutSections.forEach(section => {
              section.style.display = 'block';
            });
            return;
          }

          // Filter items
          shortcutItems.forEach(item => {
            const searchText = item.getAttribute('data-search') || '';
            const visible = searchText.includes(query);
            item.style.display = visible ? 'flex' : 'none';
          });

          // Hide sections with no visible items
          shortcutSections.forEach(section => {
            const visibleItems = section.querySelectorAll('.shortcut-item[style="display: flex;"], .shortcut-item:not([style*="display"])');
            const hasVisible = Array.from(section.querySelectorAll('.shortcut-item')).some(item => {
              return item.style.display !== 'none';
            });
            section.style.display = hasVisible ? 'block' : 'none';
          });
        });

        // Focus search input on mount
        searchInput.focus();
      }

      // Clear search on Escape
      container.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchInput) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
          searchInput.blur();
        }
      });
    }
  };
}

export { createShortcutsView };
