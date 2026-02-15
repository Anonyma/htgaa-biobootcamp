/**
 * HTGAA Week 2 — Search Engine
 * Loads all topic JSON files, builds a search index, and provides
 * fuzzy-ish ranked search with snippet extraction and highlighting.
 */

import { TOPICS } from './store.js';

const TOPIC_IDS = TOPICS.map(t => t.id);

/** Strip HTML tags from a string */
function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/** Truncate text to a max length, trying to break at word boundaries */
function truncateAt(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.lastIndexOf(' ', maxLen);
  return text.slice(0, cut > maxLen * 0.5 ? cut : maxLen) + '\u2026';
}

/**
 * Extract a snippet around the first occurrence of `query` in `text`.
 * Returns ~120 chars centered on the match.
 */
function extractSnippet(text, query, snippetLen = 140) {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return truncateAt(text, snippetLen);
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + query.length + 90);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = '\u2026' + snippet;
  if (end < text.length) snippet += '\u2026';
  return snippet;
}

/**
 * Score a query against a text field.
 * Returns 0 if no match, higher = better relevance.
 * Bonuses: word-boundary match, exact match, starts-with.
 */
function scoreMatch(text, queryLower) {
  const textLower = text.toLowerCase();
  if (!textLower.includes(queryLower)) return 0;

  let score = 1;

  // Exact match bonus
  if (textLower === queryLower) score += 10;

  // Starts with bonus
  if (textLower.startsWith(queryLower)) score += 5;

  // Word boundary bonus: query appears at start of a word
  const wordBoundaryRe = new RegExp('(?:^|[\\s,;.!?()\\[\\]{}"\'/\\-])' + escapeRegex(queryLower));
  if (wordBoundaryRe.test(textLower)) score += 3;

  // Shorter fields that match get a boost (more specific)
  if (text.length < 60) score += 2;
  else if (text.length < 200) score += 1;

  return score;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Search Index ───────────────────────────────────────────

class SearchIndex {
  constructor() {
    /** @type {Array<{type: string, topicId: string, sectionId: string|null, title: string, text: string, source: string}>} */
    this.entries = [];
    this.ready = false;
    this._buildPromise = null;
  }

  /** Load all topic JSONs and build the index. Returns a promise. */
  async build() {
    if (this._buildPromise) return this._buildPromise;
    this._buildPromise = this._doBuild();
    return this._buildPromise;
  }

  async _doBuild() {
    const fetches = TOPIC_IDS.map(async (id) => {
      try {
        const resp = await fetch(`data/${id}.json`);
        if (!resp.ok) return null;
        return { id, data: await resp.json() };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(fetches);

    for (const result of results) {
      if (!result) continue;
      const { id: topicId, data } = result;

      // Sections: title + content
      for (const section of (data.sections || [])) {
        this.entries.push({
          type: 'section',
          topicId,
          sectionId: section.id,
          title: section.title,
          text: stripHtml(section.content).slice(0, 2000), // limit for perf
          source: 'Section',
        });

        // Check question per section
        if (section.checkQuestion) {
          this.entries.push({
            type: 'quiz',
            topicId,
            sectionId: section.id,
            title: section.checkQuestion.question,
            text: (section.checkQuestion.options || []).join(' | '),
            source: 'Check Question',
          });
        }
      }

      // Vocabulary
      for (const v of (data.vocabulary || [])) {
        this.entries.push({
          type: 'vocab',
          topicId,
          sectionId: null,
          title: v.term,
          text: v.definition,
          source: 'Vocabulary',
        });
      }

      // Key facts
      for (const f of (data.keyFacts || [])) {
        this.entries.push({
          type: 'fact',
          topicId,
          sectionId: null,
          title: f.label,
          text: f.value,
          source: 'Key Fact',
        });
      }

      // Quiz questions (standalone)
      for (const q of (data.quizQuestions || [])) {
        this.entries.push({
          type: 'quiz',
          topicId,
          sectionId: null,
          title: q.question,
          text: (q.options || []).join(' | '),
          source: 'Quiz',
        });
      }
    }

    this.ready = true;
  }

  /**
   * Search the index. Returns up to `limit` results ranked by relevance.
   * Each result: { type, topicId, sectionId, title, snippet, score, source }
   */
  search(query, limit = 25) {
    if (!this.ready || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/).filter(w => w.length >= 2);
    const hits = [];

    for (const entry of this.entries) {
      // Score against title (high weight) and text (lower weight)
      let titleScore = scoreMatch(entry.title, queryLower) * 4;
      let textScore = scoreMatch(entry.text, queryLower);

      // Multi-word: also check individual words
      if (words.length > 1) {
        for (const word of words) {
          titleScore += scoreMatch(entry.title, word) * 2;
          textScore += scoreMatch(entry.text, word) * 0.5;
        }
      }

      const totalScore = titleScore + textScore;
      if (totalScore <= 0) continue;

      // Type bonus: vocab & section titles should rank higher
      const typeBonus = entry.type === 'vocab' ? 2 : entry.type === 'section' ? 1.5 : entry.type === 'fact' ? 1.2 : 1;

      const snippet = titleScore > textScore
        ? truncateAt(entry.text, 140)
        : extractSnippet(entry.text, queryLower);

      hits.push({
        type: entry.type,
        topicId: entry.topicId,
        sectionId: entry.sectionId,
        title: entry.title,
        snippet,
        score: totalScore * typeBonus,
        source: entry.source,
      });
    }

    // Deduplicate: if same topicId+sectionId appears multiple times, keep the highest score
    const seen = new Map();
    const deduped = [];
    for (const hit of hits) {
      const key = `${hit.topicId}:${hit.sectionId || ''}:${hit.type}:${hit.title.slice(0, 40)}`;
      const existing = seen.get(key);
      if (!existing || hit.score > existing.score) {
        if (existing) {
          const idx = deduped.indexOf(existing);
          if (idx !== -1) deduped.splice(idx, 1);
        }
        seen.set(key, hit);
        deduped.push(hit);
      }
    }

    deduped.sort((a, b) => b.score - a.score);
    return deduped.slice(0, limit);
  }
}

// ─── Search UI Controller ───────────────────────────────────

class SearchUI {
  constructor() {
    this.index = new SearchIndex();
    this.selectedIdx = -1;
    this.results = [];
    this._debounceTimer = null;
    this._indexBuilding = false;
  }

  /** Initialize: wire up events, start building index in background */
  init() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    const backdrop = document.getElementById('search-backdrop');
    const toggleBtn = document.getElementById('search-toggle');

    if (!modal || !input || !resultsEl) return;

    this.modal = modal;
    this.input = input;
    this.resultsEl = resultsEl;

    // Start building index in background
    this._ensureIndex();

    // Open
    toggleBtn?.addEventListener('click', () => this.open());
    backdrop?.addEventListener('click', () => this.close());

    // Keyboard: ESC to close, Cmd+K / Ctrl+K to open
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
        return;
      }
      if (e.key === 'Escape' && this.isOpen()) {
        e.preventDefault();
        this.close();
        return;
      }
    });

    // "/" shortcut (only when not in an input)
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        this.open();
      }
    });

    // Debounced input
    input.addEventListener('input', () => {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this._onInput(), 200);
    });

    // Keyboard navigation inside search
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._moveSelection(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._moveSelection(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this._activateSelection();
      }
    });
  }

  async _ensureIndex() {
    if (this.index.ready || this._indexBuilding) return;
    this._indexBuilding = true;
    await this.index.build();
    this._indexBuilding = false;
  }

  isOpen() {
    return !this.modal.classList.contains('hidden');
  }

  open() {
    this._ensureIndex();
    this.modal.classList.remove('hidden');
    this.modal.style.display = 'block';
    this.input.value = '';
    this.input.focus();
    this.resultsEl.innerHTML = this._emptyStateHtml();
    this.selectedIdx = -1;
    this.results = [];
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.add('hidden');
    this.modal.style.display = 'none';
    this.input.value = '';
    this.selectedIdx = -1;
    this.results = [];
    document.body.style.overflow = '';
  }

  toggle() {
    if (this.isOpen()) this.close();
    else this.open();
  }

  _emptyStateHtml() {
    return `
      <div class="p-6 text-center">
        <p class="text-sm text-slate-400">Type to search across all topics, vocabulary, and quizzes</p>
        <div class="mt-3 flex items-center justify-center gap-3 text-xs text-slate-400">
          <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">\u2191\u2193</kbd> navigate</span>
          <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">\u21B5</kbd> open</span>
          <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">esc</kbd> close</span>
        </div>
      </div>
    `;
  }

  _onInput() {
    const query = this.input.value.trim();
    if (query.length < 2) {
      this.resultsEl.innerHTML = this._emptyStateHtml();
      this.selectedIdx = -1;
      this.results = [];
      return;
    }

    if (!this.index.ready) {
      this.resultsEl.innerHTML = '<p class="text-sm text-slate-400 p-4 text-center">Loading search index\u2026</p>';
      // Retry after index loads
      this._ensureIndex().then(() => this._onInput());
      return;
    }

    this.results = this.index.search(query);
    this.selectedIdx = -1;
    this._renderResults(query);
  }

  _renderResults(query) {
    if (this.results.length === 0) {
      this.resultsEl.innerHTML = `
        <div class="p-6 text-center">
          <div class="text-3xl mb-2 opacity-40">
            <i data-lucide="search-x" class="w-8 h-8 mx-auto text-slate-400"></i>
          </div>
          <p class="text-sm text-slate-400">No results for "<strong>${escapeHtml(query)}</strong>"</p>
          <p class="text-xs text-slate-400 mt-1">Try different keywords or check spelling</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide' });
      return;
    }

    const topicMap = {};
    for (const t of TOPICS) topicMap[t.id] = t;

    this.resultsEl.innerHTML = this.results.map((hit, i) => {
      const topic = topicMap[hit.topicId] || { title: hit.topicId, icon: 'file', color: 'slate' };
      const href = hit.sectionId
        ? `#/topic/${hit.topicId}#section-${hit.sectionId}`
        : `#/topic/${hit.topicId}`;
      const typeLabel = this._typeIcon(hit.type);

      return `
        <a href="${href}"
           class="search-result flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${i === this.selectedIdx ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}"
           data-idx="${i}"
           data-href="${href}">
          <div class="w-8 h-8 rounded-lg bg-${topic.color}-100 dark:bg-${topic.color}-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i data-lucide="${topic.icon}" class="w-4 h-4 text-${topic.color}-500"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-sm leading-snug">${highlightMatch(escapeHtml(hit.title), query)}</p>
            ${hit.snippet ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">${highlightMatch(escapeHtml(hit.snippet), query)}</p>` : ''}
            <div class="flex items-center gap-1.5 mt-1">
              ${typeLabel}
              <span class="text-[10px] text-slate-400">${topic.title}</span>
            </div>
          </div>
        </a>
      `;
    }).join('');

    // Wire up click handlers
    this.resultsEl.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const href = el.dataset.href;
        this.close();
        window.location.hash = href;
      });
    });

    if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide' });
  }

  _typeIcon(type) {
    const icons = {
      section: { icon: 'file-text', label: 'Section', color: 'blue' },
      vocab: { icon: 'book-open', label: 'Vocabulary', color: 'purple' },
      fact: { icon: 'sparkles', label: 'Key Fact', color: 'amber' },
      quiz: { icon: 'help-circle', label: 'Quiz', color: 'green' },
    };
    const t = icons[type] || icons.section;
    return `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-${t.color}-100 dark:bg-${t.color}-900/40 text-${t.color}-600 dark:text-${t.color}-400">${t.label}</span>`;
  }

  _moveSelection(delta) {
    if (this.results.length === 0) return;
    const prev = this.selectedIdx;
    this.selectedIdx = Math.max(-1, Math.min(this.results.length - 1, this.selectedIdx + delta));
    if (this.selectedIdx === prev) return;

    // Update visual selection
    this.resultsEl.querySelectorAll('.search-result').forEach((el, i) => {
      if (i === this.selectedIdx) {
        el.classList.add('bg-blue-50', 'dark:bg-blue-900/30');
        el.classList.remove('hover:bg-slate-50', 'dark:hover:bg-slate-700/50');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('bg-blue-50', 'dark:bg-blue-900/30');
        el.classList.add('hover:bg-slate-50', 'dark:hover:bg-slate-700/50');
      }
    });
  }

  _activateSelection() {
    if (this.selectedIdx >= 0 && this.selectedIdx < this.results.length) {
      const el = this.resultsEl.querySelector(`[data-idx="${this.selectedIdx}"]`);
      if (el) {
        const href = el.dataset.href;
        this.close();
        window.location.hash = href;
      }
    }
  }
}

// ─── Utility ────────────────────────────────────────────────

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlightMatch(text, query) {
  if (!query || query.length < 2) return text;
  // Highlight each word in the query
  const words = query.trim().split(/\s+/).filter(w => w.length >= 2);
  let result = text;
  for (const word of words) {
    const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
    result = result.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded px-0.5">$1</mark>');
  }
  return result;
}

// ─── Export ─────────────────────────────────────────────────

export { SearchUI };
