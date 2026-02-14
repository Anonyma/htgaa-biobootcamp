/**
 * HTGAA Week 2 — Topic Page Renderer
 * Builds full chapter pages from JSON data files.
 */

import { store, TOPICS } from './store.js';

// Curated YouTube videos for each topic — key mechanism explanations
// Video IDs verified against YouTube. Each may optionally map to a section for inline rendering.
const TOPIC_VIDEOS = {
  'sequencing': [
    { id: 'FvHRio1yyhQ', title: 'The Sanger Method of DNA Sequencing', channel: 'Animated Biology', duration: '4:05', section: 'sanger-sequencing' },
    { id: 'fCd6B5HRaZ8', title: 'Illumina Sequencing by Synthesis (3D)', channel: 'Illumina', duration: '5:12', section: 'next-gen-sequencing' },
    { id: 'E9-Rm5AoZGw', title: 'Nanopore DNA Sequencing', channel: 'Oxford Nanopore', duration: '4:26', section: 'long-read-sequencing' },
  ],
  'synthesis': [
    { id: 'TNKWgcFPHqw', title: 'Gene Synthesis: From Oligos to Genes', channel: 'Addgene', duration: '5:19', section: 'phosphoramidite-chemistry' },
    { id: 'LnGHkUrc5iY', title: 'Gibson Assembly Overview', channel: 'NEB', duration: '3:22', section: 'assembly-methods' },
    { id: 'vKhFKOBVqwY', title: 'DNA Data Storage Explained', channel: 'Microsoft Research', duration: '6:47', section: 'emerging-methods' },
  ],
  'editing': [
    { id: 'UKbrwPL3wXE', title: 'CRISPR-Cas9 Mechanism of Action', channel: 'McGovern Institute', duration: '4:01' },
    { id: 'HANo__Z8K6s', title: "CRISPR's Next Advance Is Bigger Than You Think", channel: 'TED / Jennifer Doudna', duration: '11:07' },
    { id: '4YKFw2KZA5o', title: 'Genome Editing with CRISPR-Cas9', channel: 'Nature Video', duration: '4:08' },
  ],
  'genetic-codes': [
    { id: 'KTstRrDTmWI', title: 'Sanger Sequencing & Genetic Code', channel: 'Animated Biology', duration: '8:12' },
    { id: 'gG7uCskUOrA', title: 'From DNA to Protein (3D)', channel: 'yourgenome', duration: '2:42' },
  ],
  'gel-electrophoresis': [
    { id: 'vq759wKCCjw', title: 'Gel Electrophoresis', channel: 'HHMI BioInteractive', duration: '5:09' },
    { id: 'e0Bz3MmZdF0', title: 'Restriction Enzymes & DNA Cutting', channel: 'DNA Learning Center', duration: '3:15' },
  ],
  'central-dogma': [
    { id: 'gG7uCskUOrA', title: 'From DNA to Protein (3D)', channel: 'yourgenome', duration: '2:42' },
    { id: 'KTstRrDTmWI', title: 'DNA Sequencing Animation', channel: 'Animated Biology', duration: '8:12' },
    { id: 'itsb2SqR-Do', title: 'Gene Expression & Regulation', channel: 'Amoeba Sisters', duration: '7:47' },
  ],
};

// Build a map of section-specific videos for inline rendering within sections
const SECTION_VIDEOS = {};
Object.entries(TOPIC_VIDEOS).forEach(([topicId, videos]) => {
  videos.forEach(v => {
    if (v.section) {
      const key = `${topicId}:${v.section}`;
      if (!SECTION_VIDEOS[key]) SECTION_VIDEOS[key] = [];
      SECTION_VIDEOS[key].push(v);
    }
  });
});

/** Renders a topic page view. */
function createTopicView(topicId) {
  let simCleanup = [];

  return {
    async render() {
      const data = await store.loadTopicData(topicId);
      if (!data) return renderError(topicId);
      return renderTopicPage(data, topicId);
    },

    async mount(container) {
      const data = store.get('topicData')[topicId];
      if (!data) return;

      // Init quizzes
      initTopicQuizzes(container, topicId);

      // Init collapsibles
      initCollapsibles(container);

      // Init scroll spy
      initScrollSpy(container);

      // Init simulations for this topic
      simCleanup = await initSimulations(container, topicId);

      // Init mark-complete button
      initMarkComplete(container, topicId);

      // Init inline interactions
      initInlineInteractions(container, data);

      // Init inline charts (radar charts, process diagrams, etc.)
      try {
        const { initInlineCharts } = await import('./inline-charts.js');
        initInlineCharts(container);
      } catch (err) {
        console.warn('Inline charts not loaded:', err.message);
      }

      // Init micro-widgets (Phred calculator, coverage calc, translator, etc.)
      try {
        const { initMicroWidgets } = await import('./micro-widgets.js');
        initMicroWidgets(container);
      } catch (err) {
        console.warn('Micro-widgets not loaded:', err.message);
      }

      // Load real images from Wikimedia Commons
      try {
        const { initMediaImages } = await import('./media-loader.js');
        initMediaImages(container, topicId);
      } catch (err) {
        console.warn('Media images not loaded:', err.message);
      }

      // Init collapsible history sections
      container.querySelectorAll('.section-expand').forEach(btn => {
        btn.addEventListener('click', () => {
          const section = btn.closest('.topic-section');
          const body = section?.querySelector('.section-collapsible-body');
          const fade = body?.querySelector('.section-fade');
          if (body) {
            const isExpanded = body.style.maxHeight !== '200px';
            if (isExpanded) {
              body.style.maxHeight = '200px';
              body.style.overflow = 'hidden';
              if (fade) fade.style.display = '';
              btn.innerHTML = '<i data-lucide="chevron-down" class="w-4 h-4"></i> Show full section';
            } else {
              body.style.maxHeight = 'none';
              body.style.overflow = 'visible';
              if (fade) fade.style.display = 'none';
              btn.innerHTML = '<i data-lucide="chevron-up" class="w-4 h-4"></i> Collapse section';
            }
            if (window.lucide) lucide.createIcons();
          }
        });
      });

      // Init vocab toggle
      container.querySelectorAll('.vocab-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const body = btn.nextElementSibling;
          const chevron = btn.querySelector('.vocab-chevron');
          if (body) body.classList.toggle('hidden');
          if (chevron) chevron.style.transform = body?.classList.contains('hidden') ? '' : 'rotate(180deg)';
        });
      });

      // Reading progress bar
      initReadingProgress(container);

      // Scroll reveal animations
      initScrollReveal(container);

      // Section progress indicator
      initSectionProgress(container);

      // Back-to-top button
      initBackToTop();

      // Toast notifications system
      initToastSystem(container, topicId);

      // Add ripple effect to buttons
      initRippleEffect(container);

      // Quick review mini-flashcards
      initQuickReview(container, data);

      // Notes panel
      initNotes(container, topicId);

      // Time spent tracker
      this._timeSpentCleanup = initTimeSpent(container, topicId);

      // Keyboard navigation (j/k for sections, n/p for prev/next topic)
      this._keyHandler = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        const sections = container.querySelectorAll('.topic-section');
        if (e.key === 'j' || e.key === 'k') {
          e.preventDefault();
          const current = [...sections].findIndex(s => {
            const rect = s.getBoundingClientRect();
            return rect.top >= -50 && rect.top < window.innerHeight / 2;
          });
          const next = e.key === 'j' ? Math.min(current + 1, sections.length - 1) : Math.max(current - 1, 0);
          if (sections[next]) smoothScrollToElement(sections[next]);
        }
        if (e.key === 'n' || e.key === 'p') {
          const topicIndex = TOPICS.findIndex(t => t.id === topicId);
          const target = e.key === 'n' ? TOPICS[topicIndex + 1] : TOPICS[topicIndex - 1];
          if (target) window.location.hash = `#/topic/${target.id}`;
        }
      };
      document.addEventListener('keydown', this._keyHandler);

      // Touch swipe navigation between topics
      let touchStartX = 0;
      let touchStartY = 0;
      this._touchStart = (e) => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; };
      this._touchEnd = (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx) * 0.7) return; // too short or too vertical
        const topicIndex = TOPICS.findIndex(t => t.id === topicId);
        if (dx < 0 && TOPICS[topicIndex + 1]) window.location.hash = `#/topic/${TOPICS[topicIndex + 1].id}`;
        if (dx > 0 && TOPICS[topicIndex - 1]) window.location.hash = `#/topic/${TOPICS[topicIndex - 1].id}`;
      };
      container.addEventListener('touchstart', this._touchStart, { passive: true });
      container.addEventListener('touchend', this._touchEnd, { passive: true });
    },

    unmount() {
      simCleanup.forEach(fn => fn());
      simCleanup = [];
      if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
      if (this._timeSpentCleanup) this._timeSpentCleanup();
    }
  };
}

function renderError(topicId) {
  return `
    <div class="max-w-3xl mx-auto px-4 py-16 text-center">
      <i data-lucide="alert-circle" class="w-16 h-16 mx-auto mb-4 text-red-400"></i>
      <h2 class="text-2xl font-bold mb-2">Topic Not Found</h2>
      <p class="text-slate-500 mb-6">Could not load content for "${topicId}".</p>
      <a data-route="#/" class="text-blue-500 hover:underline cursor-pointer">Back to Dashboard</a>
    </div>
  `;
}

function renderTopicPage(data, topicId) {
  const topicIndex = TOPICS.findIndex(t => t.id === topicId);
  const prevTopic = topicIndex > 0 ? TOPICS[topicIndex - 1] : null;
  const nextTopic = topicIndex < TOPICS.length - 1 ? TOPICS[topicIndex + 1] : null;
  const topic = TOPICS[topicIndex];
  const isComplete = store.isTopicComplete(topicId);
  const quizScore = store.getQuizScore(topicId);

  return `
    <!-- Reading Progress Bar -->
    <div id="reading-progress" class="fixed top-[57px] left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 z-40">
      <div id="reading-progress-bar" class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-150" style="width:0%"></div>
    </div>

    <!-- Back to Top Button -->
    <button id="back-to-top" aria-label="Back to top">
      <i data-lucide="arrow-up" class="w-5 h-5"></i>
    </button>

    <!-- Section Progress Indicator -->
    <div id="section-progress-indicator" class="section-progress-indicator">
      Section <span class="progress-section-num">1</span> of <span class="progress-section-total">${(data.sections || []).length}</span>
    </div>

    <!-- Topic Nav -->
    <div class="sticky top-[57px] z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 mt-1">
      <div class="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
        <div class="flex items-center gap-2">
          ${prevTopic ? `<a data-route="#/topic/${prevTopic.id}" class="flex items-center gap-1 text-slate-500 hover:text-blue-500 cursor-pointer"><i data-lucide="chevron-left" class="w-4 h-4"></i>${prevTopic.title}</a>` : '<span></span>'}
        </div>
        <a data-route="#/" class="text-slate-500 hover:text-blue-500 cursor-pointer flex items-center gap-1">
          <i data-lucide="layout-grid" class="w-4 h-4"></i> Hub
        </a>
        <div class="flex items-center gap-2">
          ${nextTopic ? `<a data-route="#/topic/${nextTopic.id}" class="flex items-center gap-1 text-slate-500 hover:text-blue-500 cursor-pointer">${nextTopic.title}<i data-lucide="chevron-right" class="w-4 h-4"></i></a>` : '<span></span>'}
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Chapter Header -->
      <header class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-xl bg-${topic.color}-100 dark:bg-${topic.color}-900/40 flex items-center justify-center">
            <i data-lucide="${topic.icon}" class="w-6 h-6 text-${topic.color}-600 dark:text-${topic.color}-400"></i>
          </div>
          <div>
            <p class="text-sm text-slate-500">Chapter ${topicIndex + 1} of ${TOPICS.length}</p>
            <h1 class="text-3xl font-extrabold">${data.title}</h1>
          </div>
        </div>
        <div class="flex items-center gap-4 text-sm text-slate-500 mb-6">
          <span class="flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> ${data.readingTime || 25} min read</span>
          <span class="flex items-center gap-1"><i data-lucide="help-circle" class="w-4 h-4"></i> ${data.quizQuestions?.length || 0} questions</span>
          ${isComplete ? '<span class="flex items-center gap-1 text-green-600"><i data-lucide="check-circle-2" class="w-4 h-4"></i> Completed</span>' : ''}
          ${quizScore ? `<span class="flex items-center gap-1"><i data-lucide="target" class="w-4 h-4"></i> Quiz: ${quizScore.correct}/${quizScore.total}</span>` : ''}
          <span class="flex items-center gap-1" id="time-spent-display"><i data-lucide="timer" class="w-4 h-4"></i> <span id="time-spent-value">0:00</span> spent</span>
        </div>

        <!-- Learning Objectives -->
        ${data.learningObjectives ? `
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <h3 class="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <i data-lucide="target" class="w-5 h-5"></i> What You'll Learn
          </h3>
          <ul class="space-y-2">
            ${data.learningObjectives.map(obj => `
              <li class="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                <i data-lucide="check" class="w-4 h-4 mt-0.5 flex-shrink-0"></i>
                <span>${obj}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </header>

      <!-- Notes Panel -->
      <div class="mb-8">
        <button id="notes-toggle" class="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors cursor-pointer">
          <i data-lucide="pencil" class="w-4 h-4"></i>
          <span>My Notes</span>
          <i data-lucide="chevron-down" class="w-4 h-4 notes-chevron transition-transform"></i>
        </button>
        <div id="notes-panel" class="hidden mt-3">
          <textarea id="topic-notes" class="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm leading-relaxed resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400" placeholder="Type your notes for this topic here... They'll be saved automatically." data-topic-id="${topicId}"></textarea>
          <p class="text-xs text-slate-400 mt-1 notes-status">Notes auto-saved to your browser</p>
        </div>
      </div>

      <!-- Floating Table of Contents (desktop) -->
      <div id="floating-toc" class="hidden xl:block fixed right-4 top-32 w-48 z-20">
        <nav class="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Contents</h3>
          <ol class="space-y-0.5">
            ${(data.sections || []).map((s, i) => `
              <li>
                <a href="#section-${s.id}" class="toc-link block py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 truncate transition-colors">
                  <span class="text-slate-400 font-mono mr-1">${i + 1}.</span>${s.title}
                </a>
              </li>
            `).join('')}
            ${data.furtherReading ? '<li><a href="#further-reading" class="toc-link block py-1 text-xs text-slate-500 hover:text-blue-500">Resources</a></li>' : ''}
            <li><a href="#topic-quiz" class="toc-link block py-1 text-xs text-slate-500 hover:text-blue-500">Quiz</a></li>
          </ol>
        </nav>
      </div>

      <!-- Inline Table of Contents (mobile/tablet) -->
      <nav class="mb-8 xl:hidden bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Contents</h3>
        <div class="flex flex-wrap gap-2">
          ${(data.sections || []).map((s, i) => `
            <a href="#section-${s.id}" class="toc-link text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
              ${i + 1}. ${s.title}
            </a>
          `).join('')}
          <a href="#topic-quiz" class="toc-link text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors">Quiz</a>
        </div>
      </nav>

      <!-- Sections -->
      ${(data.sections || []).map((section, i) => renderSection(section, i, topicId)).join('')}

      <!-- Videos -->
      ${renderVideos(topicId)}

      <!-- Key Facts -->
      ${data.keyFacts ? renderKeyFacts(data.keyFacts) : ''}

      <!-- Further Reading & Resources -->
      ${data.furtherReading ? renderFurtherReading(data.furtherReading) : ''}

      <!-- Quiz Section -->
      ${data.quizQuestions ? renderQuizSection(data.quizQuestions, topicId) : ''}

      <!-- Quick Review Flashcards -->
      ${data.vocabulary && data.vocabulary.length > 0 ? renderQuickReview(data.vocabulary, topicId) : ''}

      <!-- Bottom strip: Vocab, Connections, References -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div>
          ${data.vocabulary ? renderVocabulary(data.vocabulary) : ''}
        </div>
        <div class="space-y-6">
          ${data.conceptConnections ? renderConceptConnectionsCompact(data.conceptConnections) : ''}
          ${data.homeworkConnections ? renderHomeworkConnectionsCompact(data.homeworkConnections) : ''}
          ${data.references ? renderReferencesCompact(data.references) : ''}
        </div>
      </div>

      <!-- Mark Complete / Navigate -->
      <div class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button id="mark-complete-btn"
            class="px-6 py-3 rounded-xl font-semibold transition-all ${isComplete
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-2 border-green-300 dark:border-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }">
            ${isComplete ? '<i data-lucide="check-circle-2" class="w-5 h-5 inline mr-2"></i>Completed' : '<i data-lucide="circle" class="w-5 h-5 inline mr-2"></i>Mark as Complete'}
          </button>
          ${nextTopic ? `
          <a data-route="#/topic/${nextTopic.id}" class="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-colors cursor-pointer">
            Next: ${nextTopic.title} <i data-lucide="arrow-right" class="w-5 h-5"></i>
          </a>
          ` : `
          <a data-route="#/" class="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-colors cursor-pointer">
            Back to Hub <i data-lucide="layout-grid" class="w-5 h-5"></i>
          </a>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderSectionVideos(sectionId, topicId) {
  const key = `${topicId}:${sectionId}`;
  const videos = SECTION_VIDEOS[key];
  if (!videos || videos.length === 0) return '';
  return `
    <div class="section-video-embed my-6">
      <div class="flex items-center gap-2 mb-3">
        <i data-lucide="play-circle" class="w-4 h-4 text-red-500"></i>
        <span class="text-sm font-semibold text-slate-600 dark:text-slate-400">Watch: Visual Explanation</span>
      </div>
      <div class="grid grid-cols-1 ${videos.length > 1 ? 'sm:grid-cols-2' : ''} gap-3">
        ${videos.map(v => renderVideoCard(v)).join('')}
      </div>
    </div>
  `;
}

function renderVideoCard(v) {
  return `
    <div class="video-card lite-yt" data-yt-id="${v.id}" tabindex="0" role="button"
         aria-label="Play video: ${v.title}"
         onclick="this.innerHTML='<iframe src=&quot;https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&quot; frameborder=0 allow=&quot;accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture&quot; allowfullscreen></iframe>';this.classList.add('playing')">
      <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="${v.title}" loading="lazy">
      <div class="play-btn"></div>
      <div class="yt-title">
        <span class="yt-title-text">${v.title}</span>
        <span class="yt-title-meta">${v.channel}${v.duration ? ' \u00b7 ' + v.duration : ''}</span>
      </div>
    </div>
  `;
}

function renderSection(section, index, topicId) {
  // Detect history/timeline sections that should be collapsible
  const isHistorySection = /history|timeline|historical|evolution of/i.test(section.title);

  return `
    <section id="section-${section.id}" data-section="${section.id}" class="mb-8 scroll-mt-28 topic-section">
      <div class="section-header flex items-center gap-3 mb-4 ${isHistorySection ? 'cursor-pointer group' : ''}" ${isHistorySection ? 'data-collapsible-section' : ''}>
        <span class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-mono flex-shrink-0">${index + 1}</span>
        <h2 class="text-2xl font-bold flex-1">${section.title}</h2>
        ${isHistorySection ? '<i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 section-chevron transition-transform group-hover:text-blue-500"></i>' : ''}
      </div>
      <div class="${isHistorySection ? 'section-collapsible-body' : ''}" ${isHistorySection ? 'style="max-height:200px;overflow:hidden;position:relative"' : ''}>
        <div class="prose prose-slate dark:prose-invert max-w-none topic-content">
          ${section.content}
        </div>
        ${isHistorySection ? '<div class="section-fade absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 pointer-events-none"></div>' : ''}
      </div>
      ${isHistorySection ? '<button class="section-expand text-sm text-blue-500 hover:text-blue-600 font-medium mt-2 flex items-center gap-1"><i data-lucide="chevron-down" class="w-4 h-4"></i> Show full section</button>' : ''}

      ${renderSectionVideos(section.id, topicId)}

      ${section.inlineInteractive ? `
        <div class="sim-container my-6" data-interactive="${section.inlineInteractive.type}" data-interactive-id="${section.inlineInteractive.id}">
          <div class="flex items-center gap-2 mb-3">
            <i data-lucide="play-circle" class="w-5 h-5 text-blue-500"></i>
            <span class="font-semibold text-blue-600 dark:text-blue-400">Interactive: ${section.inlineInteractive.title || section.inlineInteractive.id}</span>
          </div>
          <div id="interactive-${section.inlineInteractive.id}" class="interactive-container"></div>
        </div>
      ` : ''}

      ${section.simulation ? `
        <div class="sim-container my-6" id="${section.simulation}">
          <h3 class="flex items-center gap-2">
            <i data-lucide="flask-conical" class="w-5 h-5 text-blue-500"></i>
            Simulation
          </h3>
          <div class="sim-content"></div>
        </div>
      ` : ''}

      ${section.checkQuestion ? renderCheckQuestion(section.checkQuestion, topicId, section.id) : ''}

      <!-- Section divider with DNA motif -->
      <div class="section-divider">
        <div class="section-divider-dna">
          <div class="dna-dot"></div>
          <div class="dna-dot"></div>
          <div class="section-divider-badge">${index + 1}</div>
          <div class="dna-dot"></div>
          <div class="dna-dot"></div>
        </div>
      </div>
    </section>
  `;
}

function renderCheckQuestion(q, topicId, sectionId) {
  const qId = `${topicId}-check-${sectionId}`;
  return `
    <div class="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 quiz-container" data-correct="${q.correctIndex}" data-quiz-id="${qId}">
      <h4 class="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
        <i data-lucide="help-circle" class="w-5 h-5"></i> Check Your Understanding
      </h4>
      <p class="mb-3 font-medium">${q.question}</p>
      <div class="space-y-2">
        ${q.options.map((opt, i) => `
          <button class="quiz-option" data-index="${i}">${opt}</button>
        `).join('')}
      </div>
      <div class="quiz-explanation hidden mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
        ${q.explanation}
      </div>
    </div>
  `;
}

function renderKeyFacts(facts) {
  // Extract a "hero number" from each fact's value for visual emphasis
  function extractNumber(val) {
    const m = val.match(/(\$[\d,.]+\s*(?:billion|million|trillion)?|[\d,.]+%|[\d,.]+\s*(?:kb|bp|Mb|Gb|Tb|nm|g|mg|hours?|minutes?|days?|years?|fold|million|billion|trillion|megabase|zeptoliters?)|\>[\d,.]+%|~[\d,.]+|[\d,.]+×)/i);
    return m ? m[0] : null;
  }

  const icons = ['zap', 'ruler', 'bar-chart-3', 'cpu', 'target', 'globe', 'shield', 'microscope', 'clock', 'database'];

  return `
    <section class="mb-12 key-facts-section">
      <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
        <i data-lucide="lightbulb" class="w-6 h-6 text-yellow-500"></i> Key Facts
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${facts.slice(0, 9).map((fact, i) => {
          const heroNum = extractNumber(fact.value);
          const icon = icons[i % icons.length];
          return `
          <div class="key-fact-card group relative overflow-hidden rounded-xl p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-md">
            <div class="absolute top-0 right-0 w-20 h-20 opacity-5 transform translate-x-4 -translate-y-4">
              <i data-lucide="${icon}" class="w-20 h-20"></i>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i data-lucide="${icon}" class="w-4 h-4 text-white"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">${fact.label}</p>
                ${heroNum ? `<p class="text-lg font-extrabold text-blue-600 dark:text-blue-400 mb-1 tracking-tight">${heroNum}</p>` : ''}
                <p class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">${fact.value}</p>
              </div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderFurtherReading(categories) {
  const categoryMeta = {
    papers: { icon: 'file-text', label: 'Key Papers & Articles', color: 'blue', linkIcon: 'external-link' },
    tools: { icon: 'wrench', label: 'Tools & Databases', color: 'emerald', linkIcon: 'external-link' },
    textbooks: { icon: 'book-open', label: 'Textbook Chapters & Guides', color: 'purple', linkIcon: 'external-link' },
    courses: { icon: 'graduation-cap', label: 'Online Courses', color: 'amber', linkIcon: 'external-link' },
  };

  return `
    <section id="further-reading" class="mb-12 further-reading-section scroll-mt-28">
      <div class="further-reading-header mb-6">
        <h2 class="text-2xl font-bold flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <i data-lucide="library" class="w-5 h-5 text-white"></i>
          </div>
          Further Reading & Resources
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-[52px]">Curated external resources to deepen your understanding</p>
      </div>

      <div class="further-reading-grid">
        ${categories.map(cat => {
          const meta = categoryMeta[cat.category] || { icon: 'link', label: cat.category, color: 'slate', linkIcon: 'external-link' };
          return `
          <div class="fr-category" data-category="${cat.category}">
            <div class="fr-category-header">
              <div class="fr-category-icon fr-icon-${meta.color}">
                <i data-lucide="${meta.icon}" class="w-4 h-4"></i>
              </div>
              <h3 class="fr-category-title">${meta.label}</h3>
              <span class="fr-category-count">${cat.items.length}</span>
            </div>
            <div class="fr-items">
              ${cat.items.map(item => `
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="fr-item group">
                  <div class="fr-item-content">
                    <div class="fr-item-title">
                      ${item.title}
                      <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 fr-external-icon"></i>
                    </div>
                    <p class="fr-item-desc">${item.description}</p>
                    <span class="fr-item-source">${item.source}</span>
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderQuizSlide(q, i, topicId) {
  const type = q.type || 'multiple-choice';
  const quizId = `${topicId}-q${i}`;

  if (type === 'matching') {
    // Matching: pairs of term -> definition, shuffled
    const shuffledDefs = [...q.pairs].sort(() => Math.random() - 0.5);
    return `
      <div class="quiz-slide ${i === 0 ? '' : 'hidden'}" data-slide="${i}" data-type="matching" data-quiz-id="${quizId}">
        <p class="font-semibold text-lg mb-2">${q.question}</p>
        <p class="text-sm text-slate-500 mb-4">Click a term, then click the matching definition.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <p class="text-xs font-semibold text-slate-400 uppercase mb-1">Terms</p>
            ${q.pairs.map((p, j) => `
              <button class="match-term w-full text-left px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 text-sm font-medium hover:border-blue-400 transition-colors cursor-pointer" data-match-idx="${j}">${p.term}</button>
            `).join('')}
          </div>
          <div class="space-y-2">
            <p class="text-xs font-semibold text-slate-400 uppercase mb-1">Definitions</p>
            ${shuffledDefs.map((p, j) => `
              <button class="match-def w-full text-left px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 text-sm hover:border-blue-400 transition-colors cursor-pointer" data-match-answer="${q.pairs.indexOf(p)}">${p.definition}</button>
            `).join('')}
          </div>
        </div>
        <button class="match-check hidden mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Check Answers</button>
        <div class="quiz-explanation hidden mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm leading-relaxed">
          ${q.explanation || 'Match each term to its correct definition.'}
        </div>
      </div>
    `;
  }

  if (type === 'ordering') {
    const shuffled = [...q.items].sort(() => Math.random() - 0.5);
    return `
      <div class="quiz-slide ${i === 0 ? '' : 'hidden'}" data-slide="${i}" data-type="ordering" data-quiz-id="${quizId}" data-correct-order='${JSON.stringify(q.items)}'>
        <p class="font-semibold text-lg mb-2">${q.question}</p>
        <p class="text-sm text-slate-500 mb-4">Drag to reorder, or click items to move them up.</p>
        <div class="ordering-list space-y-2">
          ${shuffled.map((item, j) => `
            <div class="ordering-item flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors" draggable="true" data-order-value="${item}">
              <span class="ordering-num w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">${j + 1}</span>
              <span class="flex-1 text-sm">${item}</span>
              <i data-lucide="grip-vertical" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
            </div>
          `).join('')}
        </div>
        <button class="order-check mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Check Order</button>
        <div class="quiz-explanation hidden mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm leading-relaxed">
          ${q.explanation || 'Arrange the items in the correct order.'}
        </div>
      </div>
    `;
  }

  // Default: multiple choice
  return `
    <div class="quiz-slide ${i === 0 ? '' : 'hidden'}" data-slide="${i}" data-correct="${q.correctIndex}" data-quiz-id="${quizId}">
      <p class="font-semibold text-lg mb-5">${q.question}</p>
      <div class="space-y-2">
        ${q.options.map((opt, j) => `
          <button class="quiz-option" data-index="${j}">${opt}</button>
        `).join('')}
      </div>
      <div class="quiz-explanation hidden mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm leading-relaxed">
        ${q.explanation}
      </div>
    </div>
  `;
}

function renderQuizSection(questions, topicId) {
  return `
    <section id="topic-quiz" data-section="quiz" class="mb-12 scroll-mt-28">
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
        <i data-lucide="clipboard-check" class="w-6 h-6 text-green-500"></i> Quiz
      </h2>
      <div class="quiz-card-container bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm" data-topic-id="${topicId}" data-total="${questions.length}">
        <!-- Progress bar -->
        <div class="h-1.5 bg-slate-100 dark:bg-slate-700">
          <div class="quiz-progress-bar h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300" style="width: ${100/questions.length}%"></div>
        </div>
        <!-- Question area -->
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="quiz-counter text-sm text-slate-500">Question <strong>1</strong> of ${questions.length}</span>
            <span class="quiz-score text-sm font-semibold text-green-600 hidden">Score: <span class="score-val">0</span>/${questions.length}</span>
          </div>
          ${questions.map((q, i) => renderQuizSlide(q, i, topicId)).join('')}
          <!-- Results slide -->
          <div class="quiz-slide quiz-results hidden" data-slide="results">
            <div class="text-center py-6">
              <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <i data-lucide="trophy" class="w-10 h-10 text-green-500"></i>
              </div>
              <h3 class="text-2xl font-bold mb-2">Quiz Complete!</h3>
              <p class="text-lg text-slate-600 dark:text-slate-400">You scored <strong class="quiz-final-score text-green-600">0</strong> out of ${questions.length}</p>
              <button class="quiz-retry mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm">Try Again</button>
            </div>
          </div>
        </div>
        <!-- Navigation -->
        <div class="quiz-nav flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button class="quiz-prev px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30" disabled>
            <i data-lucide="chevron-left" class="w-4 h-4 inline"></i> Previous
          </button>
          <div class="quiz-dots flex items-center gap-1.5">
            ${questions.map((_, i) => `<div class="quiz-dot w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}" data-dot="${i}"></div>`).join('')}
          </div>
          <button class="quiz-next px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-30" disabled>
            Next <i data-lucide="chevron-right" class="w-4 h-4 inline"></i>
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderQuickReview(vocab, topicId) {
  if (!vocab || vocab.length === 0) return '';
  return `
    <div class="topic-section mb-12" id="quick-review">
      <div class="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 rounded-2xl border border-violet-200 dark:border-violet-800 p-6">
        <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
          <i data-lucide="layers" class="w-5 h-5 text-violet-500"></i> Quick Review
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Flip through key terms from this topic. Click a card to reveal the definition.</p>
        <div class="relative">
          <div class="qr-card-container bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 min-h-[160px] cursor-pointer select-none" data-qr-topic="${topicId}">
            <div class="qr-front text-center">
              <p class="text-xs text-slate-400 mb-2">Term</p>
              <p class="text-xl font-bold qr-term"></p>
            </div>
            <div class="qr-back text-center hidden">
              <p class="text-xs text-violet-400 mb-2">Definition</p>
              <p class="text-sm qr-def"></p>
            </div>
          </div>
          <div class="flex items-center justify-between mt-4">
            <button class="qr-prev px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <i data-lucide="chevron-left" class="w-4 h-4 inline"></i> Prev
            </button>
            <span class="qr-counter text-sm text-slate-400"></span>
            <button class="qr-next px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Next <i data-lucide="chevron-right" class="w-4 h-4 inline"></i>
            </button>
          </div>
        </div>
        <div class="mt-3 text-center">
          <a data-route="#/flashcards" class="text-sm text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer">Full flashcard deck with spaced repetition &rarr;</a>
        </div>
      </div>
    </div>
  `;
}

function renderVocabulary(vocab) {
  return `
    <section id="topic-vocab" data-section="vocab" class="mb-12 scroll-mt-28">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button class="vocab-toggle w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
          <h2 class="text-lg font-bold flex items-center gap-2">
            <i data-lucide="book-open" class="w-5 h-5 text-purple-500"></i> Vocabulary
            <span class="text-sm font-normal text-slate-400">(${vocab.length} terms)</span>
          </h2>
          <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 vocab-chevron transition-transform"></i>
        </button>
        <div class="vocab-body hidden border-t border-slate-200 dark:border-slate-700">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 dark:bg-slate-700">
            ${vocab.map(v => `
              <div class="bg-white dark:bg-slate-800 px-4 py-3">
                <dt class="font-semibold text-sm text-blue-600 dark:text-blue-400">${v.term}</dt>
                <dd class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${v.definition}</dd>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderVideos(topicId) {
  const videos = TOPIC_VIDEOS[topicId];
  if (!videos || videos.length === 0) return '';
  return `
    <section class="mb-12 video-gallery-section">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="play-circle" class="w-5 h-5 text-red-500"></i> Watch & Learn
      </h2>
      <div class="grid grid-cols-1 ${videos.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4">
        ${videos.map(v => renderVideoCard(v)).join('')}
      </div>
    </section>
  `;
}

function renderConceptConnections(connections) {
  return `
    <section class="mb-12">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="git-branch" class="w-5 h-5 text-indigo-500"></i> Connected Topics
      </h2>
      <div class="grid gap-3">
        ${connections.map(c => `
          <a data-route="#/topic/${c.toTopic}" class="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 cursor-pointer transition-colors">
            <i data-lucide="link" class="w-5 h-5 text-indigo-500 flex-shrink-0"></i>
            <div>
              <p class="font-semibold text-sm">${TOPICS.find(t => t.id === c.toTopic)?.title || c.toTopic}</p>
              <p class="text-xs text-slate-500">${c.relationship}</p>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

function renderHomeworkConnections(connections) {
  return `
    <section class="mb-12">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="clipboard-list" class="w-5 h-5 text-orange-500"></i> Homework Connection
      </h2>
      <div class="grid gap-3">
        ${connections.map(c => `
          <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <p class="font-semibold text-sm mb-1">Part ${c.hwPart}: ${c.title}</p>
            <p class="text-xs text-slate-600 dark:text-slate-400">${c.relevance}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderReferences(refs) {
  return `
    <section class="mb-12">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="external-link" class="w-5 h-5 text-slate-500"></i> Further Reading
      </h2>
      <div class="grid gap-2">
        ${refs.map(r => `
          <a href="${r.url}" target="_blank" rel="noopener" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors">
            <i data-lucide="${r.type === 'video' ? 'play-circle' : r.type === 'paper' ? 'file-text' : 'link'}" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
            <div>
              <p class="font-medium">${r.title}</p>
              ${r.source ? `<p class="text-xs text-slate-400">${r.source}</p>` : ''}
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

// Compact versions for the bottom 2-column layout
function renderConceptConnectionsCompact(connections) {
  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 class="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
        <i data-lucide="git-branch" class="w-4 h-4"></i> Connected Topics
      </h3>
      <div class="space-y-2">
        ${connections.map(c => `
          <a data-route="#/topic/${c.toTopic}" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 cursor-pointer">
            <i data-lucide="arrow-right" class="w-3 h-3 flex-shrink-0"></i>
            <span><strong>${TOPICS.find(t => t.id === c.toTopic)?.title || c.toTopic}</strong> — ${c.relationship.slice(0, 80)}${c.relationship.length > 80 ? '...' : ''}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

function renderHomeworkConnectionsCompact(connections) {
  return `
    <div class="bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800 p-4">
      <h3 class="text-sm font-bold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-1.5">
        <i data-lucide="clipboard-list" class="w-4 h-4"></i> Homework Connection
      </h3>
      <div class="space-y-2">
        ${connections.map(c => `
          <div class="text-sm">
            <span class="font-semibold">Part ${c.hwPart}:</span>
            <span class="text-slate-600 dark:text-slate-400">${c.relevance.slice(0, 100)}${c.relevance.length > 100 ? '...' : ''}</span>
          </div>
        `).join('')}
      </div>
      <a data-route="#/homework" class="inline-block mt-2 text-xs text-orange-600 hover:underline cursor-pointer">View all homework &rarr;</a>
    </div>
  `;
}

function renderReferencesCompact(refs) {
  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 class="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
        <i data-lucide="external-link" class="w-4 h-4"></i> Further Reading
      </h3>
      <div class="space-y-1.5">
        ${refs.slice(0, 6).map(r => `
          <a href="${r.url}" target="_blank" rel="noopener" class="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-500 transition-colors">
            <i data-lucide="${r.type === 'video' ? 'play-circle' : r.type === 'paper' ? 'file-text' : 'link'}" class="w-3 h-3 flex-shrink-0"></i>
            ${r.title}
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

// --- Interactive Initializers ---

function initMatchingQuiz(slide, idx, markAnswered, answered) {
  const terms = slide.querySelectorAll('.match-term');
  const defs = slide.querySelectorAll('.match-def');
  const checkBtn = slide.querySelector('.match-check');
  let selectedTerm = null;
  const matches = new Map(); // termIdx -> defIdx

  terms.forEach(t => {
    t.addEventListener('click', () => {
      if (answered.has(idx)) return;
      terms.forEach(x => x.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20'));
      t.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
      selectedTerm = parseInt(t.dataset.matchIdx);
    });
  });

  defs.forEach(d => {
    d.addEventListener('click', () => {
      if (answered.has(idx) || selectedTerm === null) return;
      const defAnswer = parseInt(d.dataset.matchAnswer);
      matches.set(selectedTerm, defAnswer);
      // Visual: mark both as paired
      const term = slide.querySelector(`.match-term[data-match-idx="${selectedTerm}"]`);
      term.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
      term.classList.add('border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/20');
      d.classList.add('border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/20');
      selectedTerm = null;
      // Show check button when all matched
      if (matches.size === terms.length) checkBtn.classList.remove('hidden');
    });
  });

  checkBtn?.addEventListener('click', () => {
    let allCorrect = true;
    matches.forEach((defIdx, termIdx) => {
      const term = slide.querySelector(`.match-term[data-match-idx="${termIdx}"]`);
      const isCorrect = termIdx === defIdx;
      if (!isCorrect) allCorrect = false;
      term.classList.remove('border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/20');
      term.classList.add(isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20');
    });
    defs.forEach(d => {
      const defAnswer = parseInt(d.dataset.matchAnswer);
      const matchedBy = [...matches.entries()].find(([, v]) => v === defAnswer);
      if (matchedBy) {
        const isCorrect = matchedBy[0] === defAnswer;
        d.classList.remove('border-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/20');
        d.classList.add(isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20');
      }
    });
    checkBtn.classList.add('hidden');
    terms.forEach(t => t.style.pointerEvents = 'none');
    defs.forEach(d => d.style.pointerEvents = 'none');
    markAnswered(allCorrect);
  });
}

function initOrderingQuiz(slide, idx, markAnswered, answered) {
  const list = slide.querySelector('.ordering-list');
  const checkBtn = slide.querySelector('.order-check');
  const items = list.querySelectorAll('.ordering-item');
  let correctOrder;
  try { correctOrder = JSON.parse(slide.dataset.correctOrder); } catch { correctOrder = []; }

  // Drag and drop
  let dragItem = null;
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      dragItem = item;
      item.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.style.opacity = '1';
      dragItem = null;
      updateNumbers();
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      item.classList.add('border-blue-400');
    });
    item.addEventListener('dragleave', () => item.classList.remove('border-blue-400'));
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('border-blue-400');
      if (dragItem && dragItem !== item) {
        const allItems = [...list.children];
        const fromIdx = allItems.indexOf(dragItem);
        const toIdx = allItems.indexOf(item);
        if (fromIdx < toIdx) item.after(dragItem);
        else item.before(dragItem);
      }
      updateNumbers();
    });
    // Click to move up
    item.addEventListener('click', () => {
      if (answered.has(idx)) return;
      const prev = item.previousElementSibling;
      if (prev) prev.before(item);
      updateNumbers();
    });
  });

  function updateNumbers() {
    list.querySelectorAll('.ordering-item').forEach((item, i) => {
      item.querySelector('.ordering-num').textContent = i + 1;
    });
  }

  checkBtn?.addEventListener('click', () => {
    const currentOrder = [...list.querySelectorAll('.ordering-item')].map(i => i.dataset.orderValue);
    let allCorrect = true;
    list.querySelectorAll('.ordering-item').forEach((item, i) => {
      const isCorrect = currentOrder[i] === correctOrder[i];
      if (!isCorrect) allCorrect = false;
      item.classList.remove('border-slate-200', 'dark:border-slate-600');
      item.classList.add(isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20');
      item.setAttribute('draggable', 'false');
      item.style.cursor = 'default';
    });
    checkBtn.classList.add('hidden');
    markAnswered(allCorrect);
  });
}

function initTopicQuizzes(container, topicId) {
  // Card-based quiz with one question at a time
  const quizCard = container.querySelector('.quiz-card-container');
  if (!quizCard) return;

  const slides = quizCard.querySelectorAll('.quiz-slide:not(.quiz-results)');
  const resultsSlide = quizCard.querySelector('.quiz-results');
  const prevBtn = quizCard.querySelector('.quiz-prev');
  const nextBtn = quizCard.querySelector('.quiz-next');
  const progressBar = quizCard.querySelector('.quiz-progress-bar');
  const counterEl = quizCard.querySelector('.quiz-counter');
  const scoreEl = quizCard.querySelector('.quiz-score');
  const dots = quizCard.querySelectorAll('.quiz-dot');
  const total = slides.length;
  let current = 0;
  let score = 0;
  let answered = new Set();

  function showSlide(idx) {
    slides.forEach((s, i) => s.classList.toggle('hidden', i !== idx));
    resultsSlide?.classList.add('hidden');
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = !answered.has(idx);
    nextBtn.textContent = idx === total - 1 ? 'Finish' : 'Next';
    // Re-add icon
    const iconHtml = idx === total - 1 ? '' : ' <i data-lucide="chevron-right" class="w-4 h-4 inline"></i>';
    nextBtn.innerHTML = (idx === total - 1 ? 'Finish' : 'Next') + iconHtml;
    progressBar.style.width = `${((idx + 1) / total) * 100}%`;
    counterEl.innerHTML = `Question <strong>${idx + 1}</strong> of ${total}`;
    dots.forEach((d, i) => {
      d.className = `quiz-dot w-2 h-2 rounded-full ${i === idx ? 'bg-blue-500' : i < idx && answered.has(i) ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`;
    });
    if (window.lucide) lucide.createIcons();
  }

  // Init each slide's answer handling
  slides.forEach((slide, idx) => {
    const quizType = slide.dataset.type || 'multiple-choice';
    const quizId = slide.dataset.quizId;
    const explanation = slide.querySelector('.quiz-explanation');

    function markAnswered(isCorrect) {
      answered.add(idx);
      if (isCorrect) score++;
      store.markQuizAnswered(quizId, isCorrect);
      if (explanation) explanation.classList.remove('hidden');
      nextBtn.disabled = false;
      scoreEl.classList.remove('hidden');
      scoreEl.querySelector('.score-val').textContent = score;
      dots[idx]?.classList.remove('bg-blue-500');
      dots[idx]?.classList.add(isCorrect ? 'bg-green-500' : 'bg-red-500');
    }

    // Restore previous answers
    if (store.isQuizAnswered(quizId)) {
      answered.add(idx);
      if (store.get('quizzes')[quizId]) score++;
    }

    if (quizType === 'matching') {
      initMatchingQuiz(slide, idx, markAnswered, answered);
    } else if (quizType === 'ordering') {
      initOrderingQuiz(slide, idx, markAnswered, answered);
    } else {
      // Multiple choice
      const correctIndex = parseInt(slide.dataset.correct, 10);
      const options = slide.querySelectorAll('.quiz-option');

      if (store.isQuizAnswered(quizId)) {
        const correct = slide.querySelector(`.quiz-option[data-index="${correctIndex}"]`);
        if (correct) correct.classList.add('bg-green-100', 'border-green-500', 'text-green-800', 'dark:bg-green-900/30');
        if (explanation) explanation.classList.remove('hidden');
        options.forEach(btn => btn.style.pointerEvents = 'none');
      }

      options.forEach(btn => {
        btn.addEventListener('click', () => {
          if (answered.has(idx)) return;
          const chosen = parseInt(btn.dataset.index, 10);
          const isCorrect = chosen === correctIndex;

          if (isCorrect) {
            btn.classList.add('bg-green-100', 'border-green-500', 'text-green-800', 'dark:bg-green-900/30');
          } else {
            btn.classList.add('bg-red-100', 'border-red-500', 'text-red-800', 'dark:bg-red-900/30');
            const correct = slide.querySelector(`.quiz-option[data-index="${correctIndex}"]`);
            if (correct) correct.classList.add('bg-green-100', 'border-green-500', 'text-green-800', 'dark:bg-green-900/30');
          }
          options.forEach(b => b.style.pointerEvents = 'none');
          markAnswered(isCorrect);
        });
      });
    }
  });

  prevBtn.addEventListener('click', () => {
    if (current > 0) { current--; showSlide(current); }
  });

  nextBtn.addEventListener('click', () => {
    if (current < total - 1) {
      current++;
      showSlide(current);
    } else {
      // Show results
      slides.forEach(s => s.classList.add('hidden'));
      resultsSlide?.classList.remove('hidden');
      const finalScore = resultsSlide?.querySelector('.quiz-final-score');
      if (finalScore) finalScore.textContent = score;
      progressBar.style.width = '100%';
      quizCard.querySelector('.quiz-nav')?.classList.add('hidden');
      if (window.lucide) lucide.createIcons();
    }
  });

  // Retry button
  quizCard.querySelector('.quiz-retry')?.addEventListener('click', () => {
    score = 0;
    answered.clear();
    current = 0;
    slides.forEach(slide => {
      slide.querySelectorAll('.quiz-option').forEach(btn => {
        btn.className = 'quiz-option';
        btn.style.pointerEvents = '';
      });
      slide.querySelector('.quiz-explanation')?.classList.add('hidden');
    });
    resultsSlide?.classList.add('hidden');
    quizCard.querySelector('.quiz-nav')?.classList.remove('hidden');
    scoreEl.classList.add('hidden');
    showSlide(0);
  });

  // Also handle inline check-your-understanding questions (keep old behavior)
  container.querySelectorAll('.quiz-container').forEach(qc => {
    const correctIndex = parseInt(qc.dataset.correct, 10);
    const quizId = qc.dataset.quizId;
    const explanation = qc.querySelector('.quiz-explanation');
    const options = qc.querySelectorAll('.quiz-option');

    if (store.isQuizAnswered(quizId)) {
      const correct = qc.querySelector(`.quiz-option[data-index="${correctIndex}"]`);
      if (correct) correct.classList.add('bg-green-100', 'border-green-500', 'text-green-800', 'dark:bg-green-900/30');
      if (explanation) explanation.classList.remove('hidden');
      return;
    }

    options.forEach(btn => {
      btn.addEventListener('click', () => {
        if (qc.classList.contains('answered')) return;
        qc.classList.add('answered');
        const chosen = parseInt(btn.dataset.index, 10);
        const isCorrect = chosen === correctIndex;
        if (isCorrect) {
          btn.classList.add('bg-green-100', 'border-green-500', 'text-green-800', 'dark:bg-green-900/30');
        } else {
          btn.classList.add('bg-red-100', 'border-red-500', 'text-red-800', 'dark:bg-red-900/30');
          const correct = qc.querySelector(`.quiz-option[data-index="${correctIndex}"]`);
          if (correct) correct.classList.add('bg-green-100', 'border-green-500', 'text-green-800', 'dark:bg-green-900/30');
        }
        if (explanation) explanation.classList.remove('hidden');
        store.markQuizAnswered(quizId, isCorrect);
      });
    });
  });

  showSlide(0);
}

function initCollapsibles(container) {
  container.querySelectorAll('.collapsible-header').forEach(header => {
    const content = header.nextElementSibling;
    if (!content?.classList.contains('collapsible-content')) return;

    content.style.maxHeight = '0px';
    content.style.overflow = 'hidden';
    content.style.transition = 'max-height 0.4s ease';

    header.addEventListener('click', () => {
      const isOpen = header.classList.toggle('open');
      content.style.maxHeight = isOpen ? content.scrollHeight + 'px' : '0px';
    });
  });
}

function initScrollSpy(container) {
  const sections = container.querySelectorAll('[data-section]');
  const tocLinks = container.querySelectorAll('.toc-link');
  if (sections.length === 0 || tocLinks.length === 0) return;

  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.replace('#', '');
      const target = document.getElementById(targetId);
      if (target) smoothScrollToElement(target);
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.dataset.section || entry.target.id;
        tocLinks.forEach(link => {
          const href = link.getAttribute('href')?.replace('#', '');
          const sectionEl = document.getElementById(href);
          link.classList.toggle('active', sectionEl?.dataset.section === id || href === entry.target.id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

async function initSimulations(container, topicId) {
  const cleanups = [];

  // Map topic IDs to their simulations
  const simMap = {
    'gel-electrophoresis': ['restriction-sim', 'gel-sim'],
    'genetic-codes': ['codon-wheel'],
    'central-dogma': ['central-dogma', 'cassette-builder'],
  };

  const sims = simMap[topicId] || [];
  for (const simId of sims) {
    const el = container.querySelector(`#${simId}`);
    if (!el) continue;

    try {
      const module = await import(`./${simId}.js`);
      if (module.init) {
        const cleanup = module.init(el);
        if (typeof cleanup === 'function') cleanups.push(cleanup);
      }
    } catch (err) {
      console.warn(`Simulation ${simId} failed:`, err);
    }
  }

  // Initialize D3 visualizations for specific topics
  const vizMap = {
    'sequencing': [
      { module: './seq-compare.js', containerId: 'viz-seq-compare', initFn: 'initSeqCompare', title: 'Sequencing Platform Comparison' },
      { module: './cost-curve.js', containerId: 'viz-cost-curve', initFn: 'initCostCurve', title: 'Sequencing Cost Over Time' },
      { module: './timeline.js', containerId: 'viz-timeline', initFn: 'initTimeline', title: 'DNA Technology Timeline' },
    ],
    'synthesis': [
      { module: './synthesis-anim.js', containerId: 'viz-synthesis-anim', initFn: 'initSynthesisAnim', title: 'Phosphoramidite Synthesis Cycle' },
      { module: './coupling-calc.js', containerId: 'viz-coupling-calc', initFn: 'initCouplingCalc', title: 'Coupling Efficiency Calculator' },
      { module: './storage-calc.js', containerId: 'viz-storage-calc', initFn: 'initStorageCalc', title: 'DNA Data Storage Calculator' },
      { module: './timeline.js', containerId: 'viz-timeline', initFn: 'initTimeline', title: 'DNA Technology Timeline' },
    ],
    'editing': [
      { module: './crispr-anim.js', containerId: 'viz-crispr-anim', initFn: 'initCrisprAnim', title: 'CRISPR-Cas9 Mechanism' },
    ],
    'genetic-codes': [
      { module: './reading-frame.js', containerId: 'viz-reading-frame', initFn: 'initReadingFrame', title: 'Reading Frame Explorer' },
    ],
  };

  const vizs = vizMap[topicId] || [];
  for (const viz of vizs) {
    // Create container if not already in DOM
    let el = container.querySelector(`#${viz.containerId}`);
    if (!el) {
      // Append viz section before the quiz section
      const quizSection = container.querySelector('#topic-quiz');
      const vizSection = document.createElement('section');
      vizSection.className = 'mb-12';
      vizSection.innerHTML = `
        <div class="sim-container">
          <h3 class="flex items-center gap-2 mb-3">
            <i data-lucide="bar-chart-3" class="w-5 h-5 text-blue-500"></i>
            ${viz.title}
          </h3>
          <div id="${viz.containerId}"></div>
        </div>
      `;
      if (quizSection) {
        quizSection.parentNode.insertBefore(vizSection, quizSection);
      } else {
        container.querySelector('.max-w-4xl')?.appendChild(vizSection);
      }
      el = container.querySelector(`#${viz.containerId}`);
      if (window.lucide) lucide.createIcons();
    }

    if (el) {
      try {
        const module = await import(viz.module);
        if (module[viz.initFn]) {
          // Defer until container has dimensions
          const initViz = () => {
            if (el.clientWidth > 0) {
              module[viz.initFn](el);
            } else {
              requestAnimationFrame(initViz);
            }
          };
          requestAnimationFrame(initViz);
        }
      } catch (err) {
        console.warn(`Visualization ${viz.initFn} failed:`, err);
      }
    }
  }

  return cleanups;
}

function initQuickReview(container, data) {
  const vocab = data.vocabulary;
  if (!vocab || vocab.length === 0) return;

  const card = container.querySelector('.qr-card-container');
  if (!card) return;

  const terms = vocab.map(v => ({ term: v.term, def: v.definition }));
  let idx = 0;
  let flipped = false;

  function show() {
    const front = card.querySelector('.qr-front');
    const back = card.querySelector('.qr-back');
    const term = card.querySelector('.qr-term');
    const def = card.querySelector('.qr-def');
    const counter = container.querySelector('.qr-counter');

    term.textContent = terms[idx].term;
    def.textContent = terms[idx].def;
    counter.textContent = `${idx + 1} / ${terms.length}`;
    front.classList.remove('hidden');
    back.classList.add('hidden');
    flipped = false;
  }

  card.addEventListener('click', () => {
    const front = card.querySelector('.qr-front');
    const back = card.querySelector('.qr-back');
    flipped = !flipped;
    front.classList.toggle('hidden', flipped);
    back.classList.toggle('hidden', !flipped);
  });

  container.querySelector('.qr-prev')?.addEventListener('click', () => {
    idx = (idx - 1 + terms.length) % terms.length;
    show();
  });

  container.querySelector('.qr-next')?.addEventListener('click', () => {
    idx = (idx + 1) % terms.length;
    show();
  });

  show();
}

function initTimeSpent(container, topicId) {
  const TIME_KEY = 'htgaa-week2-time-spent';
  let allTime;
  try { allTime = JSON.parse(localStorage.getItem(TIME_KEY) || '{}'); } catch { allTime = {}; }
  let elapsed = allTime[topicId] || 0; // seconds
  const display = container.querySelector('#time-spent-value');
  if (!display) return;

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
  display.textContent = fmt(elapsed);

  const interval = setInterval(() => {
    if (document.hidden) return; // pause when tab hidden
    elapsed++;
    display.textContent = fmt(elapsed);
    // Save every 10 seconds
    if (elapsed % 10 === 0) {
      try {
        const t = JSON.parse(localStorage.getItem(TIME_KEY) || '{}');
        t[topicId] = elapsed;
        localStorage.setItem(TIME_KEY, JSON.stringify(t));
      } catch {}
    }
  }, 1000);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    try {
      const t = JSON.parse(localStorage.getItem(TIME_KEY) || '{}');
      t[topicId] = elapsed;
      localStorage.setItem(TIME_KEY, JSON.stringify(t));
    } catch {}
  };
}

function initNotes(container, topicId) {
  const toggle = container.querySelector('#notes-toggle');
  const panel = container.querySelector('#notes-panel');
  const textarea = container.querySelector('#topic-notes');
  if (!toggle || !panel || !textarea) return;

  const NOTES_KEY = 'htgaa-week2-notes';

  // Load saved notes
  try {
    const allNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    if (allNotes[topicId]) textarea.value = allNotes[topicId];
  } catch {}

  // Toggle panel
  toggle.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    const chevron = toggle.querySelector('.notes-chevron');
    if (chevron) chevron.style.transform = panel.classList.contains('hidden') ? '' : 'rotate(180deg)';
    if (!panel.classList.contains('hidden')) textarea.focus();
  });

  // Auto-save on input (debounced)
  let saveTimer;
  const status = container.querySelector('.notes-status');
  textarea.addEventListener('input', () => {
    clearTimeout(saveTimer);
    if (status) status.textContent = 'Saving...';
    saveTimer = setTimeout(() => {
      try {
        const allNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
        if (textarea.value.trim()) {
          allNotes[topicId] = textarea.value;
        } else {
          delete allNotes[topicId];
        }
        localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
        if (status) status.textContent = 'Saved';
      } catch {
        if (status) status.textContent = 'Save failed';
      }
    }, 500);
  });

  // Show indicator if notes exist
  if (textarea.value.trim()) {
    const label = toggle.querySelector('span');
    if (label) label.textContent = 'My Notes (has notes)';
  }
}

function launchConfetti(originEl) {
  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const particles = 40;

  for (let i = 0; i < particles; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 8 + 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI * 2 * i) / particles + (Math.random() - 0.5) * 0.5;
    const velocity = Math.random() * 200 + 100;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 150; // upward bias

    Object.assign(el.style, {
      position: 'fixed', left: cx + 'px', top: cy + 'px',
      width: size + 'px', height: size + 'px',
      backgroundColor: color, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      zIndex: '9999', pointerEvents: 'none',
      transform: `rotate(${Math.random() * 360}deg)`,
    });
    document.body.appendChild(el);

    const duration = 800 + Math.random() * 400;
    el.animate([
      { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy + 200}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 }
    ], { duration, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' })
      .onfinish = () => el.remove();
  }
}

function initMarkComplete(container, topicId) {
  const btn = container.querySelector('#mark-complete-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isComplete = store.isTopicComplete(topicId);
    if (isComplete) {
      store.markTopicIncomplete(topicId);
      btn.className = 'px-6 py-3 rounded-xl font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl';
      btn.innerHTML = '<i data-lucide="circle" class="w-5 h-5 inline mr-2"></i>Mark as Complete';
    } else {
      store.markTopicComplete(topicId);
      btn.className = 'px-6 py-3 rounded-xl font-semibold transition-all bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-2 border-green-300 dark:border-green-700';
      btn.innerHTML = '<i data-lucide="check-circle-2" class="w-5 h-5 inline mr-2"></i>Completed';
      launchConfetti(btn);
    }
    if (window.lucide) lucide.createIcons();
    // Update sidebar
    document.dispatchEvent(new CustomEvent('progress-updated'));
  });
}

async function initInlineInteractions(container, data) {
  // Load and run content enhancer to transform plain HTML into rich content
  try {
    const { enhanceContent } = await import('./content-enhancer.js');
    container.querySelectorAll('.topic-content').forEach(el => enhanceContent(el));
  } catch (err) {
    console.warn('Content enhancer not loaded:', err.message);
  }

  // Load glossary tooltips
  try {
    const { initGlossaryTooltips } = await import('./glossary.js');
    initGlossaryTooltips(container);
  } catch (err) {
    console.warn('Glossary not loaded:', err.message);
  }

  // Initialize inline interactive placeholders
  container.querySelectorAll('[data-interactive]').forEach(el => {
    const type = el.dataset.interactive;
    const id = el.dataset.interactiveId;
    const target = el.querySelector('.interactive-container');
    if (target && !target.hasChildNodes()) {
      target.innerHTML = `<p class="text-sm text-slate-400 italic py-4 text-center">Interactive element loading...</p>`;
    }
  });
}

function initReadingProgress(container) {
  const bar = document.getElementById('reading-progress-bar');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = pct + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/** Fade-in elements as they scroll into view */
function initScrollReveal(container) {
  // Tag elements for scroll reveal
  container.querySelectorAll('.topic-section, .sim-container, .inline-diagram, .callout, .callout-insight, .callout-fact, .callout-example, .enhanced-table, .key-fact-card, .pull-quote, .image-placeholder, .deep-dive-box, .try-it-card').forEach((el, index) => {
    if (!el.classList.contains('scroll-reveal')) {
      el.classList.add('scroll-reveal');
      // Add stagger delay based on index (capped at 6 for CSS)
      el.style.setProperty('--reveal-index', Math.min(index, 6));
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Slight delay to ensure smooth animation
        requestAnimationFrame(() => {
          entry.target.classList.add('revealed');
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  container.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

/** Show current section number as you scroll */
function initSectionProgress(container) {
  const indicator = document.getElementById('section-progress-indicator');
  if (!indicator) return;

  const sections = container.querySelectorAll('.topic-section[data-section]');
  const totalSpan = indicator.querySelector('.progress-section-total');
  const numSpan = indicator.querySelector('.progress-section-num');
  if (totalSpan) totalSpan.textContent = sections.length;

  let hideTimeout;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(sections).indexOf(entry.target);
        if (idx >= 0 && numSpan) {
          // Trigger animation by removing and re-adding animation class
          numSpan.style.animation = 'none';
          requestAnimationFrame(() => {
            numSpan.style.animation = '';
            numSpan.textContent = idx + 1;
          });
          indicator.classList.add('visible');
          clearTimeout(hideTimeout);
          hideTimeout = setTimeout(() => indicator.classList.remove('visible'), 2000);
        }
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));

  // Also show on scroll, briefly
  let scrollTimeout;
  const onScroll = () => {
    if (sections.length > 0) {
      indicator.classList.add('visible');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => indicator.classList.remove('visible'), 1500);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/** Back-to-top button */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const toggleVisibility = () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
}

/** Toast notification system */
let toastContainer = null;
let toastQueue = [];
let currentToast = null;

function showToast(title, message, type = 'info', duration = 3000) {
  const toast = {
    title,
    message,
    type, // 'success', 'info', 'warning', 'error'
    duration
  };

  toastQueue.push(toast);
  if (!currentToast) {
    displayNextToast();
  }
}

function displayNextToast() {
  if (toastQueue.length === 0) {
    currentToast = null;
    return;
  }

  const toast = toastQueue.shift();
  currentToast = toast;

  // Create toast element
  const el = document.createElement('div');
  el.className = `toast toast--${toast.type}`;
  el.innerHTML = `
    <div class="toast__icon">
      <i data-lucide="${getToastIcon(toast.type)}" class="w-5 h-5"></i>
    </div>
    <div class="toast__content">
      <div class="toast__title">${toast.title}</div>
      ${toast.message ? `<div class="toast__message">${toast.message}</div>` : ''}
    </div>
    <button class="toast__close" aria-label="Close">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  document.body.appendChild(el);
  if (window.lucide) lucide.createIcons();

  // Show toast
  requestAnimationFrame(() => {
    el.classList.add('visible');
  });

  // Close button
  const closeBtn = el.querySelector('.toast__close');
  const closeToast = () => {
    el.classList.remove('visible');
    setTimeout(() => {
      el.remove();
      displayNextToast();
    }, 300);
  };

  closeBtn.addEventListener('click', closeToast);

  // Auto-dismiss
  setTimeout(closeToast, toast.duration);
}

function getToastIcon(type) {
  const icons = {
    success: 'check-circle-2',
    info: 'info',
    warning: 'alert-triangle',
    error: 'alert-circle'
  };
  return icons[type] || 'info';
}

/** Initialize toast system and hook into events */
function initToastSystem(container, topicId) {
  // Show toast when section is marked complete
  const completeBtn = container.querySelector('#mark-complete-btn');
  if (completeBtn) {
    const originalHandler = completeBtn.onclick;
    completeBtn.addEventListener('click', (e) => {
      setTimeout(() => {
        const isComplete = store.isTopicComplete(topicId);
        if (isComplete) {
          showToast('Topic Complete!', 'Great work on finishing this chapter.', 'success', 3000);
        }
      }, 100);
    });
  }

  // Show toast when quiz is completed
  const quizCard = container.querySelector('.quiz-card-container');
  if (quizCard) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const resultsSlide = quizCard.querySelector('.quiz-results:not(.hidden)');
          if (resultsSlide) {
            const scoreEl = resultsSlide.querySelector('.quiz-final-score');
            const total = quizCard.dataset.total;
            if (scoreEl && total) {
              const score = scoreEl.textContent;
              const percentage = Math.round((parseInt(score) / parseInt(total)) * 100);
              const emoji = percentage >= 90 ? '🎉' : percentage >= 70 ? '👍' : '💪';
              showToast(
                'Quiz Complete!',
                `You scored ${score}/${total} (${percentage}%) ${emoji}`,
                percentage >= 70 ? 'success' : 'info',
                4000
              );
            }
            observer.disconnect();
          }
        }
      });
    });
    observer.observe(quizCard, { childList: true, subtree: true });
  }

  // Track section completion (when user reaches the end of a section)
  const sections = container.querySelectorAll('.topic-section');
  const sectionsSeen = new Set();

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
        const sectionId = entry.target.dataset.section;
        if (sectionId && !sectionsSeen.has(sectionId)) {
          sectionsSeen.add(sectionId);
          const sectionIndex = Array.from(sections).indexOf(entry.target);
          if (sectionIndex === sections.length - 1) {
            // Last section
            setTimeout(() => {
              showToast('Section Complete', 'You\'ve reached the end! Ready for the quiz?', 'info', 3000);
            }, 500);
          }
        }
      }
    });
  }, { threshold: 0.8 });

  sections.forEach(s => sectionObserver.observe(s));
}

/** Smooth scroll to element with offset for fixed headers */
function smoothScrollToElement(element) {
  if (!element) return;

  const offset = 120; // Account for fixed header + nav
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/** Add ripple effect to buttons */
function initRippleEffect(container) {
  const buttons = container.querySelectorAll('button:not([disabled]), .quiz-option, #mark-complete-btn');

  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Skip if button already has ripple running
      if (this.querySelector('.ripple')) return;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      this.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

export { createTopicView };
