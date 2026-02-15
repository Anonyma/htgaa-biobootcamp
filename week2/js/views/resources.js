/**
 * HTGAA Week 2 — Resource Library
 * Curated external resources: videos, tools, papers, references.
 */

import { store, TOPICS } from '../store.js';

const RESOURCES = [
  // === DNA Sequencing ===
  {
    topicId: 'sequencing',
    category: 'video',
    title: 'Sanger Sequencing — How It Works',
    description: 'Clear step-by-step animation of chain termination sequencing with dideoxynucleotides.',
    url: 'https://www.youtube.com/watch?v=KTstRrDTmWI',
    source: 'Animated Biology',
    duration: '5 min'
  },
  {
    topicId: 'sequencing',
    category: 'video',
    title: 'Next-Generation Sequencing (Illumina)',
    description: 'How bridge amplification and sequencing by synthesis works on the Illumina platform.',
    url: 'https://www.youtube.com/watch?v=fCd6B5HRaZ8',
    source: 'Illumina',
    duration: '5 min'
  },
  {
    topicId: 'sequencing',
    category: 'video',
    title: 'Nanopore Sequencing Explained',
    description: 'How Oxford Nanopore reads DNA by threading it through a protein pore.',
    url: 'https://www.youtube.com/watch?v=RcP85JHLmnI',
    source: 'Oxford Nanopore',
    duration: '3 min'
  },
  {
    topicId: 'sequencing',
    category: 'tool',
    title: 'NCBI BLAST',
    description: 'Search and compare nucleotide/protein sequences against databases.',
    url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
    source: 'NCBI'
  },
  {
    topicId: 'sequencing',
    category: 'reference',
    title: 'DNA Sequencing Costs (NHGRI)',
    description: 'Historical data on the cost per genome, tracking the precipitous drop over two decades.',
    url: 'https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Costs-Data',
    source: 'NHGRI'
  },

  // === DNA Synthesis ===
  {
    topicId: 'synthesis',
    category: 'video',
    title: 'Phosphoramidite Chemistry',
    description: 'The four-step chemical cycle used to build DNA oligos one base at a time.',
    url: 'https://www.youtube.com/watch?v=TNKyO1dqAUo',
    source: 'IDT',
    duration: '7 min'
  },
  {
    topicId: 'synthesis',
    category: 'video',
    title: 'Gibson Assembly Explained',
    description: 'How overlapping DNA fragments are joined using exonuclease, polymerase, and ligase.',
    url: 'https://www.youtube.com/watch?v=wJPe7pWUM4s',
    source: 'NEB',
    duration: '4 min'
  },
  {
    topicId: 'synthesis',
    category: 'tool',
    title: 'Twist Bioscience Order Portal',
    description: 'Commercial gene synthesis ordering platform. Used in HTGAA homework.',
    url: 'https://www.twistbioscience.com/products/genes',
    source: 'Twist Bioscience'
  },
  {
    topicId: 'synthesis',
    category: 'tool',
    title: 'IDT OligoAnalyzer',
    description: 'Calculate Tm, secondary structure, and primer properties for oligonucleotides.',
    url: 'https://www.idtdna.com/calc/analyzer',
    source: 'IDT'
  },
  {
    topicId: 'synthesis',
    category: 'reference',
    title: 'Synthesis Cost Trends',
    description: 'How the cost of DNA synthesis has dropped from $10/base to <$0.10/base.',
    url: 'https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Costs-Data',
    source: 'NHGRI'
  },

  // === Gene Editing ===
  {
    topicId: 'editing',
    category: 'video',
    title: 'CRISPR-Cas9 Mechanism',
    description: 'Detailed animation of how the CRISPR-Cas9 system finds and cuts DNA at specific locations.',
    url: 'https://www.youtube.com/watch?v=2pp17E4E-O8',
    source: 'McGovern Institute',
    duration: '4 min'
  },
  {
    topicId: 'editing',
    category: 'video',
    title: 'Base Editing and Prime Editing',
    description: 'How newer editing tools make precise changes without double-strand breaks.',
    url: 'https://www.youtube.com/watch?v=N06bN-Ozlrs',
    source: 'Broad Institute',
    duration: '6 min'
  },
  {
    topicId: 'editing',
    category: 'tool',
    title: 'Benchling',
    description: 'Cloud-based molecular biology platform for sequence design, CRISPR guide RNA design, and lab notebooks.',
    url: 'https://www.benchling.com/',
    source: 'Benchling'
  },
  {
    topicId: 'editing',
    category: 'reference',
    title: 'ClinicalTrials.gov — CRISPR',
    description: 'Search active clinical trials using CRISPR gene editing therapies.',
    url: 'https://clinicaltrials.gov/search?term=CRISPR',
    source: 'NIH'
  },

  // === Genetic Codes ===
  {
    topicId: 'genetic-codes',
    category: 'video',
    title: 'The Genetic Code — From DNA to Protein',
    description: 'How the triplet code is read by ribosomes to produce proteins.',
    url: 'https://www.youtube.com/watch?v=gG7uCskUOrA',
    source: 'Amoeba Sisters',
    duration: '8 min'
  },
  {
    topicId: 'genetic-codes',
    category: 'video',
    title: 'Expanding the Genetic Code',
    description: 'How researchers are creating organisms with unnatural base pairs and amino acids.',
    url: 'https://www.youtube.com/watch?v=xDBaHPp7VIQ',
    source: 'Scripps Research',
    duration: '5 min'
  },
  {
    topicId: 'genetic-codes',
    category: 'tool',
    title: 'Codon Usage Database',
    description: 'Look up codon frequency tables for thousands of organisms.',
    url: 'https://www.kazusa.or.jp/codon/',
    source: 'Kazusa DNA Research Institute'
  },
  {
    topicId: 'genetic-codes',
    category: 'reference',
    title: 'NCBI Genetic Codes Table',
    description: 'Standard and alternative genetic codes used across different organisms.',
    url: 'https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi',
    source: 'NCBI'
  },

  // === Gel Electrophoresis ===
  {
    topicId: 'gel-electrophoresis',
    category: 'video',
    title: 'Gel Electrophoresis Explained',
    description: 'How DNA fragments are separated by size using agarose gels and electric fields.',
    url: 'https://www.youtube.com/watch?v=vq759wKCCUQ',
    source: 'Amoeba Sisters',
    duration: '7 min'
  },
  {
    topicId: 'gel-electrophoresis',
    category: 'video',
    title: 'Restriction Enzymes and DNA Digestion',
    description: 'How restriction enzymes recognize and cut specific DNA sequences.',
    url: 'https://www.youtube.com/watch?v=IcBSTvFNaQ4',
    source: 'iBiology',
    duration: '6 min'
  },
  {
    topicId: 'gel-electrophoresis',
    category: 'tool',
    title: 'NEBcutter',
    description: 'Virtual restriction enzyme digest tool — find cut sites in any DNA sequence.',
    url: 'https://nc3.neb.com/NEBcutter/',
    source: 'New England Biolabs'
  },
  {
    topicId: 'gel-electrophoresis',
    category: 'reference',
    title: 'NEB Restriction Enzyme Database',
    description: 'Complete catalog of restriction enzymes with recognition sites and conditions.',
    url: 'https://www.neb.com/en-us/tools-and-resources/selection-charts/alphabetized-list-of-recognition-specificities',
    source: 'NEB'
  },

  // === Central Dogma ===
  {
    topicId: 'central-dogma',
    category: 'video',
    title: 'Central Dogma of Molecular Biology',
    description: 'DNA → RNA → Protein: transcription and translation explained with animations.',
    url: 'https://www.youtube.com/watch?v=gG7uCskUOrA',
    source: 'Amoeba Sisters',
    duration: '8 min'
  },
  {
    topicId: 'central-dogma',
    category: 'video',
    title: 'Gene Expression — Promoters to Terminators',
    description: 'How gene regulatory elements control when and how much protein is made.',
    url: 'https://www.youtube.com/watch?v=ztPkv7wc3bU',
    source: 'Shomu\'s Biology',
    duration: '10 min'
  },
  {
    topicId: 'central-dogma',
    category: 'tool',
    title: 'iGEM Registry of Standard Biological Parts',
    description: 'Database of characterized biological parts (promoters, RBS, terminators) for synthetic biology.',
    url: 'https://parts.igem.org/Main_Page',
    source: 'iGEM'
  },
  {
    topicId: 'central-dogma',
    category: 'tool',
    title: 'Expasy Translate Tool',
    description: 'Translate a nucleotide sequence to protein in all six reading frames.',
    url: 'https://web.expasy.org/translate/',
    source: 'SIB Swiss Institute of Bioinformatics'
  },

  // === General / Cross-topic ===
  {
    topicId: 'general',
    category: 'reference',
    title: 'HTGAA Course Page',
    description: 'Official MIT course page with syllabus, lectures, and assignments.',
    url: 'http://fab.cba.mit.edu/classes/S66.26/index.html',
    source: 'MIT MAS.S66'
  },
  {
    topicId: 'general',
    category: 'video',
    title: 'Molecular Biology of the Gene (MIT OCW)',
    description: 'Full MIT OpenCourseWare lectures on molecular biology fundamentals.',
    url: 'https://ocw.mit.edu/courses/7-013-introductory-biology-spring-2018/',
    source: 'MIT OCW'
  },
  {
    topicId: 'general',
    category: 'tool',
    title: 'NCBI GenBank',
    description: 'Public database of all published DNA sequences. Essential for gene design.',
    url: 'https://www.ncbi.nlm.nih.gov/genbank/',
    source: 'NCBI'
  },
  {
    topicId: 'general',
    category: 'tool',
    title: 'UniProt Protein Database',
    description: 'Comprehensive protein sequence and function database.',
    url: 'https://www.uniprot.org/',
    source: 'UniProt Consortium'
  },
];

const CATEGORY_META = {
  video: { icon: 'play-circle', color: 'red', label: 'Videos' },
  tool: { icon: 'wrench', color: 'blue', label: 'Tools' },
  reference: { icon: 'book-open', color: 'green', label: 'References' },
  paper: { icon: 'file-text', color: 'violet', label: 'Papers' },
};

function createResourcesView() {
  let activeFilter = 'all';
  let activeCategory = 'all';

  return {
    render() {
      return `
        <div class="max-w-5xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <i data-lucide="library" class="w-5 h-5 text-teal-600 dark:text-teal-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Resource Library</h1>
                <p class="text-sm text-slate-500">Curated videos, tools, and references for deeper learning</p>
              </div>
            </div>
          </header>

          <!-- Filters -->
          <div class="flex flex-wrap gap-4 mb-8">
            <!-- Topic filter -->
            <div class="flex flex-wrap gap-1.5" id="topic-filters">
              <button class="filter-btn topic-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-800 text-white dark:bg-white dark:text-slate-800" data-topic="all">All Topics</button>
              ${TOPICS.map(t => `
                <button class="filter-btn topic-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-${t.color}-100 dark:hover:bg-${t.color}-900/30" data-topic="${t.id}">
                  <i data-lucide="${t.icon}" class="w-3 h-3 inline"></i> ${t.title}
                </button>
              `).join('')}
              <button class="filter-btn topic-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" data-topic="general">General</button>
            </div>

            <!-- Category filter -->
            <div class="flex gap-1.5" id="category-filters">
              <button class="filter-btn cat-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-800 text-white dark:bg-white dark:text-slate-800" data-cat="all">All Types</button>
              ${Object.entries(CATEGORY_META).map(([key, meta]) => `
                <button class="filter-btn cat-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" data-cat="${key}">
                  <i data-lucide="${meta.icon}" class="w-3 h-3 inline"></i> ${meta.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Resource count -->
          <div class="mb-4 text-sm text-slate-500">
            <span id="resource-count">${RESOURCES.length}</span> resources
          </div>

          <!-- Resources Grid -->
          <div id="resources-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${renderResources(RESOURCES)}
          </div>
        </div>
      `;
    },

    mount(container) {
      // Topic filter
      container.querySelectorAll('.topic-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          activeFilter = btn.dataset.topic;
          updateFilters(container);
        });
      });

      // Category filter
      container.querySelectorAll('.cat-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          activeCategory = btn.dataset.cat;
          updateFilters(container);
        });
      });
    }
  };

  function updateFilters(container) {
    // Update button styles
    container.querySelectorAll('.topic-filter').forEach(btn => {
      if (btn.dataset.topic === activeFilter) {
        btn.className = 'filter-btn topic-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-800 text-white dark:bg-white dark:text-slate-800';
      } else {
        btn.className = 'filter-btn topic-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
      }
    });

    container.querySelectorAll('.cat-filter').forEach(btn => {
      if (btn.dataset.cat === activeCategory) {
        btn.className = 'filter-btn cat-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-800 text-white dark:bg-white dark:text-slate-800';
      } else {
        btn.className = 'filter-btn cat-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
      }
    });

    // Filter resources
    const filtered = RESOURCES.filter(r => {
      const topicMatch = activeFilter === 'all' || r.topicId === activeFilter;
      const catMatch = activeCategory === 'all' || r.category === activeCategory;
      return topicMatch && catMatch;
    });

    // Update grid
    const grid = container.querySelector('#resources-grid');
    if (grid) {
      grid.innerHTML = renderResources(filtered);
      if (window.lucide) lucide.createIcons();
    }

    // Update count
    const countEl = container.querySelector('#resource-count');
    if (countEl) countEl.textContent = filtered.length;
  }
}

function renderResources(resources) {
  if (resources.length === 0) {
    return `
      <div class="col-span-full text-center py-12 text-slate-400">
        <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2"></i>
        <p class="text-sm">No resources match the current filters.</p>
      </div>
    `;
  }

  return resources.map(r => {
    const topic = TOPICS.find(t => t.id === r.topicId);
    const catMeta = CATEGORY_META[r.category] || CATEGORY_META.reference;

    return `
      <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="block p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-${catMeta.color}-400 dark:hover:border-${catMeta.color}-600 transition-all hover:shadow-sm group">
        <div class="flex items-start gap-3 mb-2">
          <div class="w-8 h-8 rounded-lg bg-${catMeta.color}-100 dark:bg-${catMeta.color}-900/30 flex items-center justify-center flex-shrink-0">
            <i data-lucide="${catMeta.icon}" class="w-4 h-4 text-${catMeta.color}-600 dark:text-${catMeta.color}-400"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-${catMeta.color}-600 transition-colors leading-tight">${r.title}</h3>
          </div>
          <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed mb-3">${r.description}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            ${topic ? `
              <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-${topic.color}-100 dark:bg-${topic.color}-900/30 text-${topic.color}-600 dark:text-${topic.color}-400">${topic.title}</span>
            ` : `
              <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">General</span>
            `}
            <span class="text-[10px] text-slate-400">${r.source}</span>
          </div>
          ${r.duration ? `<span class="text-[10px] text-slate-400 flex items-center gap-0.5"><i data-lucide="clock" class="w-2.5 h-2.5"></i> ${r.duration}</span>` : ''}
        </div>
      </a>
    `;
  }).join('');
}

export { createResourcesView };
