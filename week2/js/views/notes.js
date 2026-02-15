/**
 * HTGAA Week 2 — Personal Notes View
 * Aggregates all section notes across topics.
 */

import { store, TOPICS } from '../store.js';

function createNotesView() {
  return {
    render() {
      const allNotes = getAllNotesGrouped();
      const totalNotes = allNotes.reduce((sum, t) => sum + t.notes.length, 0);

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <i data-lucide="sticky-note" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">My Notes</h1>
                <p class="text-sm text-slate-500">${totalNotes} note${totalNotes !== 1 ? 's' : ''} across ${allNotes.filter(t => t.notes.length > 0).length} topic${allNotes.filter(t => t.notes.length > 0).length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </header>

          ${totalNotes === 0 ? `
            <div class="text-center py-16">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <i data-lucide="pencil" class="w-8 h-8 text-slate-400"></i>
              </div>
              <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No notes yet</h3>
              <p class="text-sm text-slate-500 max-w-md mx-auto mb-4">
                As you read through topics, click the <i data-lucide="sticky-note" class="w-3.5 h-3.5 inline text-amber-500"></i> icon on any section to add personal notes.
              </p>
              <a data-route="#/topic/central-dogma" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                <i data-lucide="book-open" class="w-4 h-4"></i> Start Reading
              </a>
            </div>
          ` : `
            <!-- Export button -->
            <div class="flex justify-end mb-4">
              <button id="export-notes" class="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <i data-lucide="download" class="w-4 h-4"></i> Export as Text
              </button>
            </div>

            ${allNotes.filter(t => t.notes.length > 0).map(topicGroup => `
              <div class="mb-8">
                <h2 class="flex items-center gap-2 text-lg font-bold mb-3">
                  <i data-lucide="${topicGroup.icon}" class="w-5 h-5 text-${topicGroup.color}-500"></i>
                  ${topicGroup.title}
                  <span class="text-xs font-normal text-slate-400 ml-1">(${topicGroup.notes.length})</span>
                </h2>
                <div class="space-y-3">
                  ${topicGroup.notes.map(note => `
                    <div class="group relative p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl">
                      <div class="flex items-start justify-between gap-3 mb-1">
                        <a data-route="#/topic/${topicGroup.id}#section-${note.sectionId}" class="text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer">
                          ${note.sectionTitle || note.sectionId}
                        </a>
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button class="delete-note p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 transition-colors" data-topic="${topicGroup.id}" data-section="${note.sectionId}" title="Delete note">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          </button>
                        </div>
                      </div>
                      <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">${escapeHtml(note.text)}</p>
                      <p class="text-xs text-slate-400 mt-2">${formatDate(note.updated)}</p>
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
      // Export notes as text
      container.querySelector('#export-notes')?.addEventListener('click', () => {
        const allNotes = getAllNotesGrouped();
        let text = 'HTGAA Week 2 — My Study Notes\n';
        text += '='.repeat(40) + '\n\n';

        allNotes.filter(t => t.notes.length > 0).forEach(topicGroup => {
          text += `## ${topicGroup.title}\n\n`;
          topicGroup.notes.forEach(note => {
            text += `### ${note.sectionTitle || note.sectionId}\n`;
            text += note.text + '\n\n';
          });
        });

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'htgaa-week2-notes.txt';
        a.click();
        URL.revokeObjectURL(url);
      });

      // Delete note
      container.querySelectorAll('.delete-note').forEach(btn => {
        btn.addEventListener('click', () => {
          const topicId = btn.dataset.topic;
          const sectionId = btn.dataset.section;
          store.saveNote(topicId, sectionId, '');
          // Re-render
          const view = createNotesView();
          container.innerHTML = view.render();
          view.mount(container);
          if (window.lucide) lucide.createIcons();
        });
      });
    }
  };
}

function getAllNotesGrouped() {
  // Get notes from the old format (SECTION_NOTES_KEY = 'htgaa-week2-section-notes')
  const oldNotes = JSON.parse(localStorage.getItem('htgaa-week2-section-notes') || '{}');
  // Also get from new store format
  const newNotes = store.getAllNotes();

  return TOPICS.map(topic => {
    const notes = [];

    // Old format: keys like "topicId:sectionId"
    Object.entries(oldNotes).forEach(([key, text]) => {
      if (key.startsWith(topic.id + ':')) {
        const sectionId = key.split(':')[1];
        notes.push({
          sectionId,
          sectionTitle: formatSectionTitle(sectionId),
          text: typeof text === 'string' ? text : text.text || '',
          updated: typeof text === 'object' ? text.updated : Date.now()
        });
      }
    });

    // New format: nested by topicId
    if (newNotes[topic.id]) {
      Object.entries(newNotes[topic.id]).forEach(([sectionId, data]) => {
        // Avoid duplicates
        if (!notes.some(n => n.sectionId === sectionId)) {
          notes.push({
            sectionId,
            sectionTitle: formatSectionTitle(sectionId),
            text: typeof data === 'string' ? data : data.text || '',
            updated: typeof data === 'object' ? data.updated : Date.now()
          });
        }
      });
    }

    // Sort by most recent
    notes.sort((a, b) => (b.updated || 0) - (a.updated || 0));

    return { id: topic.id, title: topic.title, icon: topic.icon, color: topic.color, notes };
  });
}

function formatSectionTitle(sectionId) {
  return sectionId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export { createNotesView };
