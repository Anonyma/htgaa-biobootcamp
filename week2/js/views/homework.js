/**
 * HTGAA Week 2 — Homework Hub View
 * Assignment guidance, checklists, and topic prep links.
 */

import { store, TOPICS } from '../store.js';

const HW_PARTS = [
  {
    id: 'part0',
    title: 'Part 0: Gel Electrophoresis Basics',
    description: 'Learn the fundamental principles of gel electrophoresis, including how DNA migrates in agarose gels, the role of molecular weight markers (DNA ladders), and how to estimate fragment sizes from gel images.',
    prereqTopics: ['gel-electrophoresis'],
    steps: [
      'Read the Gel Electrophoresis chapter',
      'Understand charge-to-mass ratio and why DNA migrates to the anode',
      'Learn how agarose concentration affects resolution',
      'Practice estimating fragment sizes using the gel simulator',
      'Review DNA ladder standards (1 kb, 100 bp)',
    ],
    tools: [],
  },
  {
    id: 'part1',
    title: 'Part 1: Virtual Restriction Digest (Benchling)',
    description: 'Use Benchling to perform a virtual restriction digest of a plasmid. Identify cut sites, predict fragment sizes, and simulate gel banding patterns.',
    prereqTopics: ['gel-electrophoresis'],
    steps: [
      'Create a free Benchling account',
      'Import or find a plasmid sequence (e.g., pUC19)',
      'Use the restriction enzyme finder to identify cut sites',
      'Perform a single digest with EcoRI — note fragment count and sizes',
      'Perform a double digest (e.g., EcoRI + HindIII) — compare results',
      'Export or screenshot the virtual gel image',
      'Design your "gel art" pattern by choosing enzymes strategically',
    ],
    tools: [
      { name: 'Benchling', url: 'https://benchling.com', desc: 'Free molecular biology platform' },
    ],
  },
  {
    id: 'part2',
    title: 'Part 2: Gel Art Lab (Wet Lab)',
    description: 'Hands-on: digest plasmid DNA with restriction enzymes, run on agarose gels, and create artistic banding patterns.',
    prereqTopics: ['gel-electrophoresis'],
    steps: [
      'Review the lab protocol thoroughly before lab day',
      'Prepare restriction enzyme digests (follow volumes and temperatures)',
      'Set up and pour agarose gel (1% in TAE buffer)',
      'Load samples with loading dye + DNA ladder',
      'Run gel at recommended voltage for 30-45 min',
      'Image gel under UV/blue light with proper safety equipment',
      'Annotate your gel image: label lanes, identify fragment sizes',
      'Compare observed fragments to predicted sizes from Benchling',
    ],
    tools: [
      { name: 'Gel Art Lab Protocol', url: '#/gel-art-lab', desc: 'Step-by-step lab guide' },
    ],
  },
  {
    id: 'part3',
    title: 'Part 3: DNA Design Challenge',
    description: 'Design a complete gene expression construct: choose a protein, reverse-translate, codon-optimize, and build an expression cassette.',
    prereqTopics: ['central-dogma', 'genetic-codes', 'synthesis'],
    steps: [
      'Choose a protein of interest and find its amino acid sequence (UniProt/NCBI)',
      'Decide on an expression host (E. coli, yeast, mammalian)',
      'Reverse-translate the amino acid sequence to DNA codons',
      'Codon-optimize for your chosen host organism',
      'Design the expression cassette: promoter → RBS → start → CDS → stop → terminator',
      'Select appropriate parts (e.g., T7 promoter, BBa_B0034 RBS for E. coli)',
      'Add any tags (His-tag for purification)',
      'Verify reading frame is correct (no frameshifts)',
      'Check for internal restriction sites that might interfere',
      'Document your design rationale',
    ],
    tools: [
      { name: 'UniProt', url: 'https://www.uniprot.org', desc: 'Protein sequence database' },
      { name: 'Codon Usage Database', url: 'https://www.kazusa.or.jp/codon/', desc: 'Organism codon tables' },
      { name: 'iGEM Parts Registry', url: 'http://parts.igem.org', desc: 'Standard biological parts' },
    ],
  },
  {
    id: 'part4',
    title: 'Part 4: Twist Synthesis Order',
    description: 'Practice the DNA synthesis ordering workflow: format your sequence, check constraints, and understand the ordering process.',
    prereqTopics: ['synthesis'],
    steps: [
      'Format your designed gene sequence in FASTA format',
      'Check synthesis constraints: GC content (40-65%), no long repeats, no homopolymers >6',
      'Check for secondary structures that might hinder synthesis',
      'Navigate the Twist Bioscience ordering portal',
      'Enter your sequence and review automated screening results',
      'Note the estimated cost, turnaround time, and any complexity flags',
      'Document the ordering process (screenshots for your submission)',
    ],
    tools: [
      { name: 'Twist Bioscience', url: 'https://www.twistbioscience.com', desc: 'DNA synthesis provider' },
    ],
  },
];

function createHomeworkView() {
  return {
    render() {
      const checks = store.get('homeworkChecks');
      const progress = store.get('progress');

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <header class="mb-10">
            <a data-route="#/" class="text-sm text-slate-500 hover:text-blue-500 cursor-pointer flex items-center gap-1 mb-4">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
            </a>
            <h1 class="text-3xl font-extrabold mb-3 flex items-center gap-3">
              <i data-lucide="clipboard-list" class="w-8 h-8 text-orange-500"></i>
              Homework Hub
            </h1>
            <p class="text-slate-500 max-w-2xl">Week 2 homework: 5 parts covering gel electrophoresis, Benchling, DNA design, and synthesis ordering. Due Feb 17, 2026.</p>
            <div class="mt-4 flex items-center gap-3">
              <div class="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-lg text-sm font-semibold">
                <i data-lucide="calendar" class="w-4 h-4 inline mr-1"></i> Due: Feb 17, 2026
              </div>
              <div class="text-sm text-slate-500">
                ${getHomeworkProgress(checks)} steps completed
              </div>
            </div>
          </header>

          <div class="space-y-8">
            ${HW_PARTS.map(part => renderHWPart(part, checks, progress)).join('')}
          </div>
        </div>
      `;
    },

    mount(container) {
      // Wire up checkboxes
      container.querySelectorAll('.hw-check').forEach(cb => {
        cb.addEventListener('change', () => {
          store.toggleHomeworkCheck(cb.dataset.checkId);
        });
      });
    },

    unmount() {}
  };
}

function renderHWPart(part, checks, progress) {
  const completedSteps = part.steps.filter((_, i) => checks[`${part.id}-${i}`]).length;
  const pct = Math.round((completedSteps / part.steps.length) * 100);
  const prereqsMet = part.prereqTopics.every(t => progress[t]);

  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="p-5 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold mb-1">${part.title}</h2>
            <p class="text-sm text-slate-500">${part.description}</p>
          </div>
          <div class="flex-shrink-0 text-right">
            <div class="text-sm font-semibold ${pct === 100 ? 'text-green-600' : 'text-slate-500'}">${pct}%</div>
            <div class="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300 ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}" style="width:${pct}%"></div>
            </div>
          </div>
        </div>

        <!-- Prerequisites -->
        ${part.prereqTopics.length > 0 ? `
        <div class="mt-3 flex items-center gap-2 flex-wrap">
          <span class="text-xs text-slate-500">Prerequisites:</span>
          ${part.prereqTopics.map(topicId => {
            const topic = TOPICS.find(t => t.id === topicId);
            const done = progress[topicId];
            return `
              <a data-route="#/topic/${topicId}" class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors ${done
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-100'
              }">
                <i data-lucide="${done ? 'check-circle-2' : 'circle'}" class="w-3 h-3"></i>
                ${topic?.title || topicId}
              </a>
            `;
          }).join('')}
        </div>
        ` : ''}
      </div>

      <!-- Steps Checklist -->
      <div class="p-5">
        <h3 class="text-sm font-semibold text-slate-500 mb-3">Steps</h3>
        <ol class="space-y-2">
          ${part.steps.map((step, i) => {
            const checkId = `${part.id}-${i}`;
            const checked = checks[checkId];
            return `
              <li class="flex items-start gap-3">
                <input type="checkbox" class="hw-check mt-1 w-4 h-4 rounded accent-green-500 cursor-pointer" data-check-id="${checkId}" ${checked ? 'checked' : ''}>
                <span class="text-sm ${checked ? 'text-slate-400 line-through' : ''}">${step}</span>
              </li>
            `;
          }).join('')}
        </ol>
      </div>

      <!-- Tools -->
      ${part.tools.length > 0 ? `
      <div class="px-5 pb-5">
        <h3 class="text-sm font-semibold text-slate-500 mb-2">Tools & Resources</h3>
        <div class="flex flex-wrap gap-2">
          ${part.tools.map(tool => `
            <a href="${tool.url}" ${tool.url.startsWith('#') ? `data-route="${tool.url}"` : 'target="_blank" rel="noopener"'} class="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
              <i data-lucide="external-link" class="w-3 h-3"></i>
              ${tool.name}
            </a>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  `;
}

function getHomeworkProgress(checks) {
  const total = HW_PARTS.reduce((sum, p) => sum + p.steps.length, 0);
  const done = Object.values(checks).filter(Boolean).length;
  return `${done}/${total}`;
}

export { createHomeworkView };
