/**
 * Cornell Notes View
 * Structured note-taking using the Cornell method for each topic.
 */

import { store, TOPICS } from '../store.js';

export function createCornellNotesView() {
  let selectedTopic = TOPICS[0]?.id || 'central-dogma';

  function getNotes() {
    try { return JSON.parse(localStorage.getItem('htgaa-week2-cornell-notes') || '{}'); } catch { return {}; }
  }
  function saveNotes(notes) { localStorage.setItem('htgaa-week2-cornell-notes', JSON.stringify(notes)); }

  function getTopicNotes(topicId) {
    const all = getNotes();
    return all[topicId] || { cues: '', notes: '', summary: '' };
  }

  function saveTopicNotes(topicId, data) {
    const all = getNotes();
    all[topicId] = { ...data, updated: Date.now() };
    saveNotes(all);
  }

  function renderNotepad(container) {
    const area = container.querySelector('#cornell-area');
    if (!area) return;
    const data = getTopicNotes(selectedTopic);
    const topic = TOPICS.find(t => t.id === selectedTopic);
    const color = topic?.color || 'blue';

    area.innerHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <!-- Header -->
        <div class="p-4 bg-${color}-50 dark:bg-${color}-900/10 border-b border-${color}-200 dark:border-${color}-800">
          <div class="flex items-center justify-between">
            <h2 class="font-bold text-${color}-800 dark:text-${color}-200 flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-${color}-500"></span>
              ${topic?.title || selectedTopic}
            </h2>
            <span class="text-xs text-slate-400">${data.updated ? 'Last saved: ' + new Date(data.updated).toLocaleString() : 'Not started'}</span>
          </div>
        </div>

        <!-- Cornell Layout -->
        <div class="grid grid-cols-[200px_1fr] sm:grid-cols-[240px_1fr] min-h-[400px]">
          <!-- Cue Column -->
          <div class="border-r border-slate-200 dark:border-slate-700 p-3">
            <label class="text-xs font-bold text-red-500 uppercase tracking-wide mb-2 block">Cues / Questions</label>
            <textarea id="cornell-cues" placeholder="Write key questions, terms, or cues here after your notes...&#10;&#10;• What is...?&#10;• How does...?&#10;• Why is...?"
              class="w-full h-[340px] text-sm bg-transparent border-none resize-none focus:outline-none text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600">${data.cues || ''}</textarea>
          </div>
          <!-- Notes Column -->
          <div class="p-3">
            <label class="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2 block">Notes</label>
            <textarea id="cornell-notes" placeholder="Take detailed notes here during study...&#10;&#10;• Use bullet points&#10;• Include diagrams (describe them)&#10;• Note key facts and mechanisms&#10;• Write in your own words"
              class="w-full h-[340px] text-sm bg-transparent border-none resize-none focus:outline-none text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600">${data.notes || ''}</textarea>
          </div>
        </div>

        <!-- Summary Section -->
        <div class="border-t border-slate-200 dark:border-slate-700 p-3">
          <label class="text-xs font-bold text-green-500 uppercase tracking-wide mb-2 block">Summary (write after studying)</label>
          <textarea id="cornell-summary" placeholder="Summarize the main ideas in 2-3 sentences. This is the most important part — it forces you to synthesize what you learned."
            class="w-full h-[80px] text-sm bg-transparent border-none resize-none focus:outline-none text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600">${data.summary || ''}</textarea>
        </div>
      </div>

      <!-- Tips -->
      <div class="mt-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
        <h4 class="font-bold text-amber-700 dark:text-amber-300 text-sm mb-2 flex items-center gap-2">
          <i data-lucide="lightbulb" class="w-4 h-4"></i> Cornell Method Tips
        </h4>
        <ul class="text-xs text-amber-600 dark:text-amber-400 space-y-1 list-disc pl-4">
          <li><strong>During study:</strong> Take notes in the right column. Be concise, use your own words.</li>
          <li><strong>After study:</strong> Write cue questions in the left column that your notes answer.</li>
          <li><strong>Review:</strong> Cover the notes column. Try to answer the cue questions from memory.</li>
          <li><strong>Summary:</strong> Write a 2-3 sentence summary at the bottom. This is the most valuable step.</li>
        </ul>
      </div>`;

    // Auto-save on input
    const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
    const save = debounce(() => {
      saveTopicNotes(selectedTopic, {
        cues: container.querySelector('#cornell-cues')?.value || '',
        notes: container.querySelector('#cornell-notes')?.value || '',
        summary: container.querySelector('#cornell-summary')?.value || '',
      });
    }, 500);

    ['cornell-cues', 'cornell-notes', 'cornell-summary'].forEach(id => {
      container.querySelector('#' + id)?.addEventListener('input', save);
    });

    if (window.lucide) lucide.createIcons();
  }

  return {
    render() {
      const allNotes = getNotes();
      const topicsWithNotes = Object.keys(allNotes).length;

      return `
        <div class="max-w-5xl mx-auto px-4 py-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Cornell Notes</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Structured note-taking for deeper learning</p>
            </div>
            <a data-route="#/" class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Home
            </a>
          </div>

          <!-- Topic selector -->
          <div class="flex flex-wrap gap-2 mb-6">
            ${TOPICS.map(t => {
              const notes = allNotes[t.id];
              const hasNotes = notes && (notes.cues || notes.notes || notes.summary);
              return `<button class="topic-tab px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${t.id === selectedTopic ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}" data-topic="${t.id}">
                <span class="w-2 h-2 rounded-full bg-${t.color}-500"></span>
                ${t.title}
                ${hasNotes ? '<span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>' : ''}
              </button>`;
            }).join('')}
          </div>

          <!-- Cornell notes area -->
          <div id="cornell-area"></div>

          <!-- Export -->
          <div class="mt-4 flex gap-2">
            <button id="export-notes" class="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <i data-lucide="download" class="w-4 h-4"></i> Export All Notes
            </button>
            <button id="clear-notes" class="px-4 py-2 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors text-red-500 flex items-center gap-1.5">
              <i data-lucide="trash-2" class="w-4 h-4"></i> Clear This Topic
            </button>
          </div>
        </div>`;
    },

    mount(container) {
      renderNotepad(container);

      // Topic tabs
      container.querySelectorAll('.topic-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedTopic = btn.dataset.topic;
          container.querySelectorAll('.topic-tab').forEach(b => {
            const isActive = b.dataset.topic === selectedTopic;
            b.className = `topic-tab px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`;
          });
          renderNotepad(container);
        });
      });

      // Export
      container.querySelector('#export-notes')?.addEventListener('click', () => {
        const allNotes = getNotes();
        let text = 'HTGAA Week 2 — Cornell Notes\n' + '='.repeat(40) + '\n\n';
        TOPICS.forEach(t => {
          const n = allNotes[t.id];
          if (n && (n.cues || n.notes || n.summary)) {
            text += `## ${t.title}\n\n`;
            if (n.cues) text += `### Cues/Questions\n${n.cues}\n\n`;
            if (n.notes) text += `### Notes\n${n.notes}\n\n`;
            if (n.summary) text += `### Summary\n${n.summary}\n\n`;
            text += '---\n\n';
          }
        });
        navigator.clipboard.writeText(text).then(() => {
          const btn = container.querySelector('#export-notes');
          if (btn) {
            btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
            if (window.lucide) lucide.createIcons();
            setTimeout(() => {
              btn.innerHTML = '<i data-lucide="download" class="w-4 h-4"></i> Export All Notes';
              if (window.lucide) lucide.createIcons();
            }, 2000);
          }
        });
      });

      // Clear
      container.querySelector('#clear-notes')?.addEventListener('click', () => {
        if (confirm(`Clear all Cornell notes for this topic?`)) {
          const allNotes = getNotes();
          delete allNotes[selectedTopic];
          saveNotes(allNotes);
          renderNotepad(container);
        }
      });

      if (window.lucide) lucide.createIcons();
    }
  };
}
