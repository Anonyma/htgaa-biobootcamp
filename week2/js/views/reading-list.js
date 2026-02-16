/**
 * Reading List View
 * Curated papers, textbook chapters, and online resources organized by topic.
 */

import { store, TOPICS } from '../store.js';

export function createReadingListView() {
  const READINGS = [
    // Sequencing
    { topic: 'sequencing', type: 'paper', title: 'Sanger, Nicklen & Coulson (1977) — DNA sequencing with chain-terminating inhibitors', url: 'https://doi.org/10.1073/pnas.74.12.5463', difficulty: 'foundational', description: 'The original Sanger sequencing paper. Nobel Prize-winning work that enabled modern genomics.' },
    { topic: 'sequencing', type: 'paper', title: 'Shendure et al. (2017) — DNA sequencing at 40: past, present and future', url: 'https://doi.org/10.1038/nature24286', difficulty: 'review', description: 'Comprehensive review of sequencing technology evolution from Sanger to nanopore.' },
    { topic: 'sequencing', type: 'video', title: 'iBiology: Next-Generation Sequencing (Eric Green)', url: 'https://www.youtube.com/watch?v=fCd6B5HRaZ8', difficulty: 'beginner', description: 'Clear overview of NGS technology from the NIH director.' },
    { topic: 'sequencing', type: 'textbook', title: 'Molecular Biology of the Gene (Watson et al.) — Chapter 7: DNA Sequencing', url: null, difficulty: 'intermediate', description: 'Standard molecular biology textbook coverage of sequencing methods.' },
    { topic: 'sequencing', type: 'web', title: 'Illumina Sequencing Technology Overview', url: 'https://www.illumina.com/science/technology/next-generation-sequencing/sequencing-technology.html', difficulty: 'beginner', description: 'Official Illumina guide to their sequencing-by-synthesis technology.' },

    // Synthesis
    { topic: 'synthesis', type: 'paper', title: 'Kosuri & Church (2014) — Large-scale de novo DNA synthesis', url: 'https://doi.org/10.1038/nmeth.2918', difficulty: 'review', description: 'Review of DNA synthesis technologies from oligos to genomes by George Church\'s lab.' },
    { topic: 'synthesis', type: 'paper', title: 'Hughes & Ellington (2017) — Synthetic DNA Synthesis and Assembly', url: 'https://doi.org/10.1101/cshperspect.a023812', difficulty: 'intermediate', description: 'Detailed coverage of phosphoramidite chemistry and gene assembly methods.' },
    { topic: 'synthesis', type: 'video', title: 'Twist Bioscience: How DNA Synthesis Works', url: 'https://www.youtube.com/watch?v=2J9FbFqo_u4', difficulty: 'beginner', description: 'Short video from Twist explaining silicon-based DNA synthesis.' },
    { topic: 'synthesis', type: 'paper', title: 'Gibson et al. (2009) — Enzymatic assembly of DNA molecules up to several hundred kilobases', url: 'https://doi.org/10.1038/nmeth.1318', difficulty: 'foundational', description: 'The original Gibson Assembly paper — a key method for constructing genes from oligos.' },

    // Editing
    { topic: 'editing', type: 'paper', title: 'Jinek et al. (2012) — A programmable dual-RNA-guided DNA endonuclease', url: 'https://doi.org/10.1126/science.1225829', difficulty: 'foundational', description: 'The landmark CRISPR-Cas9 paper by Doudna and Charpentier. Required reading.' },
    { topic: 'editing', type: 'paper', title: 'Anzalone et al. (2019) — Search-and-replace genome editing without double-strand breaks', url: 'https://doi.org/10.1038/s41586-019-1711-4', difficulty: 'advanced', description: 'The prime editing paper — the latest major advance in genome editing.' },
    { topic: 'editing', type: 'video', title: 'HHMI BioInteractive: CRISPR-Cas9 Mechanism & Applications', url: 'https://www.biointeractive.org/classroom-resources/crispr-cas-9-mechanism-applications', difficulty: 'beginner', description: 'Excellent animated explanation of CRISPR from HHMI.' },
    { topic: 'editing', type: 'web', title: 'Addgene CRISPR Guide', url: 'https://www.addgene.org/guides/crispr/', difficulty: 'intermediate', description: 'Practical guide to designing and using CRISPR experiments.' },

    // Genetic Codes
    { topic: 'genetic-codes', type: 'paper', title: 'Chin (2017) — Expanding and reprogramming the genetic code', url: 'https://doi.org/10.1038/nature24031', difficulty: 'advanced', description: 'Review of expanded genetic codes and unnatural amino acid incorporation.' },
    { topic: 'genetic-codes', type: 'textbook', title: 'Molecular Biology of the Cell (Alberts et al.) — Chapter 6: The Genetic Code', url: null, difficulty: 'beginner', description: 'Standard cell biology textbook covering the genetic code, tRNA, and translation.' },
    { topic: 'genetic-codes', type: 'video', title: 'Khan Academy: The Genetic Code', url: 'https://www.khanacademy.org/science/ap-biology/gene-expression-and-regulation/translation/v/the-genetic-code', difficulty: 'beginner', description: 'Clear intro to codons, reading frames, and the standard genetic code.' },

    // Gel Electrophoresis
    { topic: 'gel-electrophoresis', type: 'video', title: 'JoVE: Agarose Gel Electrophoresis', url: 'https://www.jove.com/science-education/5012/agarose-gel-electrophoresis', difficulty: 'beginner', description: 'Video protocol showing gel electrophoresis step by step.' },
    { topic: 'gel-electrophoresis', type: 'web', title: 'NEB Restriction Enzyme Finder', url: 'https://www.neb.com/tools-and-resources/selection-charts/alphabetized-list-of-recognition-specificities', difficulty: 'reference', description: 'Complete list of restriction enzymes with recognition sites and cut patterns.' },
    { topic: 'gel-electrophoresis', type: 'web', title: 'Benchling Virtual Cloning Guide', url: 'https://help.benchling.com/hc/en-us/articles/9684227098765', difficulty: 'intermediate', description: 'How to perform in-silico restriction digests and gel predictions in Benchling.' },

    // Central Dogma
    { topic: 'central-dogma', type: 'paper', title: 'Crick (1970) — Central dogma of molecular biology', url: 'https://doi.org/10.1038/227561a0', difficulty: 'foundational', description: 'Francis Crick\'s clarification of the central dogma — a classic paper.' },
    { topic: 'central-dogma', type: 'video', title: 'MIT OCW: Gene Expression and Regulation', url: 'https://ocw.mit.edu/courses/7-013-introductory-biology-spring-2018/', difficulty: 'intermediate', description: 'MIT lecture recordings covering transcription, translation, and gene regulation.' },
    { topic: 'central-dogma', type: 'web', title: 'iGEM Registry of Standard Biological Parts', url: 'http://parts.igem.org/Main_Page', difficulty: 'reference', description: 'Database of standardized genetic parts (promoters, RBS, terminators) used in synthetic biology.' },
    { topic: 'central-dogma', type: 'web', title: 'Codon Usage Database', url: 'https://www.kazusa.or.jp/codon/', difficulty: 'reference', description: 'Codon usage tables for thousands of organisms — essential for codon optimization.' },
  ];

  let filter = 'all';
  let typeFilter = 'all';
  let readItems = {};
  try { readItems = JSON.parse(localStorage.getItem('htgaa-week2-reading-list-read') || '{}'); } catch {}

  function getFiltered() {
    let items = [...READINGS];
    if (filter !== 'all') items = items.filter(r => r.topic === filter);
    if (typeFilter !== 'all') items = items.filter(r => r.type === typeFilter);
    return items;
  }

  return {
    render() {
      const readCount = Object.values(readItems).filter(Boolean).length;
      const typeIcons = { paper: 'file-text', video: 'play-circle', textbook: 'book', web: 'globe', reference: 'database' };
      const diffColors = { foundational: 'purple', beginner: 'green', intermediate: 'blue', advanced: 'red', review: 'amber', reference: 'slate' };

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Reading List</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${readCount} of ${READINGS.length} read · Curated papers, videos & resources</p>
            </div>
            <a data-route="#/" class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Home
            </a>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap gap-3 mb-6">
            <select id="topic-filter" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
              <option value="all">All Topics</option>
              ${TOPICS.map(t => `<option value="${t.id}">${t.title}</option>`).join('')}
            </select>
            <select id="type-filter" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
              <option value="all">All Types</option>
              <option value="paper">Papers</option>
              <option value="video">Videos</option>
              <option value="textbook">Textbooks</option>
              <option value="web">Web Resources</option>
            </select>
          </div>

          <!-- Reading items -->
          <div id="reading-list" class="space-y-3">
            ${getFiltered().map((r, i) => {
              const topic = TOPICS.find(t => t.id === r.topic);
              const color = topic?.color || 'slate';
              const isRead = readItems[r.title];
              const icon = typeIcons[r.type] || 'file';
              const diffColor = diffColors[r.difficulty] || 'slate';

              return `
                <div class="reading-item bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 ${isRead ? 'opacity-60' : ''}" data-topic="${r.topic}" data-type="${r.type}">
                  <div class="flex items-start gap-3">
                    <button class="read-toggle mt-0.5 flex-shrink-0" data-title="${r.title.replace(/"/g, '&quot;')}">
                      <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isRead ? 'border-green-500 bg-green-100 dark:bg-green-900/30' : 'border-slate-300'}">
                        ${isRead ? '<svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}
                      </span>
                    </button>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap mb-1">
                        <span class="text-xs px-1.5 py-0.5 rounded bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300">${topic?.title || r.topic}</span>
                        <span class="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center gap-1">
                          <i data-lucide="${icon}" class="w-3 h-3"></i> ${r.type}
                        </span>
                        <span class="text-xs px-1.5 py-0.5 rounded bg-${diffColor}-100 dark:bg-${diffColor}-900/30 text-${diffColor}-600 dark:text-${diffColor}-400">${r.difficulty}</span>
                      </div>
                      <h3 class="font-medium text-sm text-slate-800 dark:text-white ${isRead ? 'line-through' : ''}">${r.title}</h3>
                      <p class="text-xs text-slate-500 mt-1 leading-relaxed">${r.description}</p>
                      ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener" class="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-flex items-center gap-1">
                        <i data-lucide="external-link" class="w-3 h-3"></i> Open
                      </a>` : '<span class="text-xs text-slate-400 mt-1 inline-block">Physical resource</span>'}
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>`;
    },

    mount(container) {
      // Read toggles
      container.querySelectorAll('.read-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const title = btn.dataset.title;
          readItems[title] = !readItems[title];
          localStorage.setItem('htgaa-week2-reading-list-read', JSON.stringify(readItems));
          // Re-render
          const view = createReadingListView();
          container.innerHTML = view.render();
          view.mount(container);
        });
      });

      // Filters
      container.querySelector('#topic-filter')?.addEventListener('change', (e) => {
        filter = e.target.value;
        const view = createReadingListView();
        container.innerHTML = view.render();
        view.mount(container);
      });
      container.querySelector('#type-filter')?.addEventListener('change', (e) => {
        typeFilter = e.target.value;
        const view = createReadingListView();
        container.innerHTML = view.render();
        view.mount(container);
      });

      if (window.lucide) lucide.createIcons();
    }
  };
}
