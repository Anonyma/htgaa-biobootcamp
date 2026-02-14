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
    objectives: [
      'Understand the physics: charge-to-mass ratio and why DNA migrates to the anode',
      'Learn how agarose concentration controls pore size and fragment separation range',
      'Master DNA visualization with intercalating dyes (EtBr, SYBR Safe)',
      'Use DNA ladders to estimate fragment sizes from gel images',
    ],
    prereqTopics: ['gel-electrophoresis'],
    steps: [
      'Read the Gel Electrophoresis chapter thoroughly',
      'Understand charge-to-mass ratio and why DNA migrates to the anode',
      'Learn how agarose concentration affects resolution',
      'Practice estimating fragment sizes using the gel simulator',
      'Review DNA ladder standards (1 kb, 100 bp)',
    ],
    tips: [
      'Pay special attention to the logarithmic relationship between fragment size and migration distance',
      'Try the interactive gel simulator to build intuition about how different concentrations affect separation',
      'Memorize the standard agarose concentration guide: 0.5% (1-30 kb), 1.0% (0.4-8 kb), 2.0% (0.1-2 kb)',
    ],
    tools: [
      { name: 'Gel Electrophoresis Chapter', url: '#/topic/gel-electrophoresis', desc: 'Required reading', internal: true },
    ],
  },
  {
    id: 'part1',
    title: 'Part 1: Virtual Restriction Digest (Benchling)',
    description: 'Use Benchling to perform a virtual restriction digest of a plasmid. Identify cut sites, predict fragment sizes, and simulate gel banding patterns.',
    objectives: [
      'Set up and navigate the Benchling molecular biology platform',
      'Identify restriction enzyme cut sites in a plasmid sequence',
      'Predict fragment sizes from single and double digests',
      'Design artistic gel banding patterns by strategic enzyme selection',
    ],
    prereqTopics: ['gel-electrophoresis'],
    steps: [
      'Create a free Benchling account',
      'Import or find a plasmid sequence (e.g., pUC19, pBR322)',
      'Use the restriction enzyme finder to identify cut sites',
      'Perform a single digest with EcoRI — note fragment count and sizes',
      'Perform a double digest (e.g., EcoRI + HindIII) — compare results',
      'Export or screenshot the virtual gel image',
      'Design your "gel art" pattern by choosing enzymes strategically',
    ],
    tips: [
      'pUC19 (2,686 bp) is a great starter plasmid with multiple common restriction sites',
      'For gel art, aim for 3-6 bands per lane to create interesting patterns',
      'Remember: circular plasmid with n cut sites → n fragments',
      'Screenshot both the plasmid map (with cut sites marked) and the virtual gel for your submission',
    ],
    tools: [
      { name: 'Benchling', url: 'https://benchling.com', desc: 'Free molecular biology platform' },
      { name: 'NEBcutter', url: 'https://nc3.neb.com/NEBcutter/', desc: 'Alternative restriction site finder' },
      { name: 'Addgene Plasmid Database', url: 'https://www.addgene.org/', desc: 'Find well-characterized plasmids' },
    ],
  },
  {
    id: 'part2',
    title: 'Part 2: Gel Art Lab (Wet Lab)',
    description: 'Hands-on: digest plasmid DNA with restriction enzymes, run on agarose gels, and create artistic banding patterns.',
    objectives: [
      'Execute restriction enzyme digests following proper enzyme handling and buffer compatibility',
      'Cast, load, and run an agarose gel with optimal voltage and timing',
      'Image DNA under UV/blue light with appropriate safety protocols',
      'Compare predicted (Benchling) vs. observed fragment patterns',
    ],
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
    tips: [
      'Keep enzymes on ice at all times — they denature quickly at room temperature',
      'Use the "Run to Red" mnemonic: DNA runs toward the red (positive) electrode',
      'Watch the bromophenol blue tracking dye: stop when it reaches 2/3 down the gel',
      'For best gel art photos, adjust exposure time and DNA loading to get bright, clear bands',
      'Common mistake: forgetting to add loading dye means samples will float away!',
    ],
    tools: [
      { name: 'Gel Art Lab Protocol', url: '#/gel-art-lab', desc: 'Step-by-step lab guide', internal: true },
      { name: 'NEB Double Digest Finder', url: 'https://www.neb.com/tools-and-resources/interactive-tools/double-digest-finder', desc: 'Check enzyme buffer compatibility' },
    ],
  },
  {
    id: 'part3',
    title: 'Part 3: DNA Design Challenge',
    description: 'Design a complete gene expression construct: choose a protein, reverse-translate, codon-optimize, and build an expression cassette.',
    objectives: [
      'Select a protein and retrieve its amino acid sequence from databases',
      'Reverse-translate amino acids to DNA codons using the genetic code',
      'Optimize codon usage for your chosen expression host',
      'Assemble a complete expression cassette with promoter, RBS, CDS, and terminator',
    ],
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
    tips: [
      'Start simple: small proteins (100-300 amino acids) are easier to design and cheaper to synthesize',
      'Popular beginner proteins: GFP (green fluorescent protein), mCherry, luciferase',
      'For E. coli: use T7 or tac promoter, BBa_B0034 RBS, double stop codon (TAATAA)',
      'Codon optimization can improve expression 5-10x — use your host's preferred codons',
      'Always add a His6 tag (HHHHHH) or FLAG tag for purification and Western blotting',
      'Check your design: total sequence length modulo 3 should equal 0 (no frameshift)',
    ],
    tools: [
      { name: 'UniProt', url: 'https://www.uniprot.org', desc: 'Protein sequence database' },
      { name: 'NCBI Protein', url: 'https://www.ncbi.nlm.nih.gov/protein/', desc: 'Alternative protein database' },
      { name: 'Codon Usage Database', url: 'https://www.kazusa.or.jp/codon/', desc: 'Organism codon tables' },
      { name: 'iGEM Parts Registry', url: 'http://parts.igem.org', desc: 'Standard biological parts' },
      { name: 'Benchling', url: 'https://benchling.com', desc: 'Design and annotate your construct' },
      { name: 'IDT Codon Optimization Tool', url: 'https://www.idtdna.com/codonopt', desc: 'Automated codon optimization' },
    ],
  },
  {
    id: 'part4',
    title: 'Part 4: Twist Synthesis Order',
    description: 'Practice the DNA synthesis ordering workflow: format your sequence, check constraints, and understand the ordering process.',
    objectives: [
      'Format DNA sequences in FASTA format for synthesis orders',
      'Validate sequences against synthesis constraints (GC content, repeats, secondary structure)',
      'Navigate a commercial DNA synthesis ordering portal',
      'Understand pricing, turnaround time, and complexity flags',
    ],
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
    tips: [
      'FASTA format: first line is >SequenceName, second line onward is the DNA sequence',
      'GC content: aim for 40-65%. Too high or low makes synthesis difficult and error-prone',
      'Homopolymers: avoid runs of >6 identical bases (e.g., AAAAAAA). Break them up with synonymous codons',
      'Hairpins and secondary structure: use tools like NUPACK to check for problematic folding',
      'Typical gene synthesis cost: $0.07-0.15 per base pair for standard complexity',
      'Turnaround: 5-10 business days for standard synthesis, 2-3 days for rush orders',
      'You do NOT need to actually place an order — just document the process and pricing',
    ],
    tools: [
      { name: 'Twist Bioscience', url: 'https://www.twistbioscience.com', desc: 'DNA synthesis provider' },
      { name: 'IDT (Integrated DNA Technologies)', url: 'https://www.idtdna.com/pages/products/genes-and-gene-fragments/double-stranded-dna-fragments/gblocks-gene-fragments', desc: 'Alternative synthesis provider (gBlocks)' },
      { name: 'GenScript Gene Synthesis', url: 'https://www.genscript.com/gene-synthesis.html', desc: 'Another synthesis option' },
      { name: 'NUPACK', url: 'http://www.nupack.org/', desc: 'Predict DNA secondary structure' },
    ],
  },
];

function createHomeworkView() {
  return {
    render() {
      const checks = store.get('homeworkChecks');
      const progress = store.get('progress');
      const readiness = calculateReadiness(progress);

      return `
        <div class="max-w-5xl mx-auto px-4 py-8">
          <header class="mb-10">
            <a data-route="#/" class="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1 mb-4">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
            </a>
            <h1 class="text-3xl font-extrabold mb-3 flex items-center gap-3">
              <i data-lucide="clipboard-list" class="w-8 h-8 text-orange-500"></i>
              Homework Hub
            </h1>
            <div class="flex items-center justify-between">
              <p class="text-slate-600 dark:text-slate-300 max-w-2xl">Week 2 homework: 5 parts covering gel electrophoresis, Benchling, DNA design, and synthesis ordering. Due Feb 17, 2026.</p>
              <button onclick="window.print()" class="print:hidden px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 flex-shrink-0">
                <i data-lucide="printer" class="w-4 h-4"></i> Print
              </button>
            </div>

            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Due Date -->
              <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-1">
                  <i data-lucide="calendar" class="w-4 h-4 text-orange-600 dark:text-orange-400"></i>
                  <span class="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase">Due Date</span>
                </div>
                <div class="text-lg font-bold text-orange-900 dark:text-orange-200">Feb 17, 2026</div>
                ${(() => {
                  const due = new Date('2026-02-17');
                  const now = new Date();
                  const days = Math.ceil((due - now) / 86400000);
                  if (days < 0) return `<div class="text-xs text-red-600 dark:text-red-400 font-medium mt-1">Past due</div>`;
                  if (days === 0) return `<div class="text-xs text-red-600 dark:text-red-400 font-medium mt-1 animate-pulse">Due today!</div>`;
                  if (days <= 3) return `<div class="text-xs text-red-600 dark:text-red-400 font-medium mt-1">${days} day${days > 1 ? 's' : ''} left</div>`;
                  return `<div class="text-xs text-slate-500 mt-1">${days} days left</div>`;
                })()}
              </div>

              <!-- Progress -->
              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-1">
                  <i data-lucide="check-circle" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i>
                  <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Progress</span>
                </div>
                <div class="text-lg font-bold text-blue-900 dark:text-blue-200">${getHomeworkProgress(checks)}</div>
              </div>

              <!-- Readiness -->
              <div class="bg-${readiness.color}-50 dark:bg-${readiness.color}-900/20 border border-${readiness.color}-200 dark:border-${readiness.color}-800 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-1">
                  <i data-lucide="${readiness.icon}" class="w-4 h-4 text-${readiness.color}-600 dark:text-${readiness.color}-400"></i>
                  <span class="text-xs font-semibold text-${readiness.color}-600 dark:text-${readiness.color}-400 uppercase">Readiness</span>
                </div>
                <div class="text-lg font-bold text-${readiness.color}-900 dark:text-${readiness.color}-200">${readiness.label}</div>
              </div>
            </div>
          </header>

          <!-- External Tools Section -->
          ${renderExternalTools()}

          <!-- Homework Parts -->
          <div class="space-y-6 mb-8">
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

      // Wire up expand/collapse
      container.querySelectorAll('.hw-part-header').forEach(header => {
        header.addEventListener('click', (e) => {
          // Don't toggle if clicking a link
          if (e.target.closest('a')) return;

          const partId = header.dataset.partId;
          const content = container.querySelector(`#${partId}-content`);
          const chevron = header.querySelector('.chevron-icon');

          if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            chevron.style.transform = 'rotate(180deg)';
          } else {
            content.classList.add('hidden');
            chevron.style.transform = 'rotate(0deg)';
          }
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

  let status = 'not-started';
  let statusColor = 'slate';
  let statusIcon = 'circle';
  if (pct === 100) {
    status = 'complete';
    statusColor = 'green';
    statusIcon = 'check-circle-2';
  } else if (pct > 0) {
    status = 'in-progress';
    statusColor = 'blue';
    statusIcon = 'loader';
  }

  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <!-- Collapsible Header -->
      <div class="hw-part-header p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors" data-part-id="${part.id}">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-xl font-bold">${part.title}</h2>
              <div class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-${statusColor}-100 dark:bg-${statusColor}-900/30 text-${statusColor}-700 dark:text-${statusColor}-400">
                <i data-lucide="${statusIcon}" class="w-3 h-3"></i>
                ${status === 'complete' ? 'Complete' : status === 'in-progress' ? 'In Progress' : 'Not Started'}
              </div>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300">${part.description}</p>

            <!-- Prerequisites -->
            ${part.prereqTopics.length > 0 ? `
            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Prerequisites:</span>
              ${part.prereqTopics.map(topicId => {
                const topic = TOPICS.find(t => t.id === topicId);
                const done = progress[topicId];
                return `
                  <a data-route="#/topic/${topicId}" class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors ${done
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }" onclick="event.stopPropagation()">
                    <i data-lucide="${done ? 'check-circle-2' : 'circle'}" class="w-3 h-3"></i>
                    ${topic?.title || topicId}
                  </a>
                `;
              }).join('')}
            </div>
            ` : ''}
          </div>

          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="text-right">
              <div class="text-sm font-semibold ${pct === 100 ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}">${pct}%</div>
              <div class="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300 ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}" style="width:${pct}%"></div>
              </div>
            </div>
            <i data-lucide="chevron-down" class="chevron-icon w-5 h-5 text-slate-400 transition-transform duration-200"></i>
          </div>
        </div>
      </div>

      <!-- Expandable Content -->
      <div id="${part.id}-content" class="hidden">
        <!-- Objectives -->
        ${part.objectives && part.objectives.length > 0 ? `
        <div class="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <i data-lucide="target" class="w-4 h-4 text-purple-500"></i>
            Learning Objectives
          </h3>
          <ul class="space-y-1.5 ml-6">
            ${part.objectives.map(obj => `
              <li class="text-sm text-slate-600 dark:text-slate-300 list-disc">${obj}</li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- Steps Checklist -->
        <div class="p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <i data-lucide="list-checks" class="w-4 h-4 text-blue-500"></i>
            Step-by-Step Checklist
          </h3>
          <ol class="space-y-2.5">
            ${part.steps.map((step, i) => {
              const checkId = `${part.id}-${i}`;
              const checked = checks[checkId];
              return `
                <li class="flex items-start gap-3 group">
                  <input type="checkbox" class="hw-check mt-1 w-4 h-4 rounded accent-green-500 cursor-pointer" data-check-id="${checkId}" ${checked ? 'checked' : ''}>
                  <span class="text-sm flex-1 ${checked ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}">${i + 1}. ${step}</span>
                </li>
              `;
            }).join('')}
          </ol>
        </div>

        <!-- Tips -->
        ${part.tips && part.tips.length > 0 ? `
        <div class="px-5 py-4 bg-blue-50 dark:bg-blue-900/10 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
            <i data-lucide="lightbulb" class="w-4 h-4"></i>
            Helpful Tips
          </h3>
          <ul class="space-y-2">
            ${part.tips.map(tip => `
              <li class="text-sm text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0"></i>
                <span>${tip}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- Tools -->
        ${part.tools.length > 0 ? `
        <div class="px-5 py-4">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <i data-lucide="wrench" class="w-4 h-4 text-orange-500"></i>
            Tools & Resources
          </h3>
          <div class="flex flex-wrap gap-2">
            ${part.tools.map(tool => {
              const isInternal = tool.internal || tool.url.startsWith('#');
              return `
                <a href="${tool.url}" ${isInternal ? `data-route="${tool.url}"` : 'target="_blank" rel="noopener"'} class="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer border border-slate-200 dark:border-slate-600">
                  <i data-lucide="${isInternal ? 'file-text' : 'external-link'}" class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400"></i>
                  <div class="flex flex-col items-start">
                    <span class="font-medium text-slate-800 dark:text-slate-200">${tool.name}</span>
                    ${tool.desc ? `<span class="text-xs text-slate-500 dark:text-slate-400">${tool.desc}</span>` : ''}
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function getHomeworkProgress(checks) {
  const total = HW_PARTS.reduce((sum, p) => sum + p.steps.length, 0);
  const done = Object.values(checks).filter(Boolean).length;
  return `${done}/${total}`;
}

function calculateReadiness(progress) {
  // Calculate how many prerequisite topics are complete
  const allPrereqs = new Set();
  HW_PARTS.forEach(part => {
    part.prereqTopics.forEach(t => allPrereqs.add(t));
  });

  const prereqsComplete = Array.from(allPrereqs).filter(t => progress[t]).length;
  const prereqsTotal = allPrereqs.size;
  const pct = prereqsTotal > 0 ? (prereqsComplete / prereqsTotal) * 100 : 100;

  if (pct === 100) {
    return { label: 'Ready', color: 'green', icon: 'check-circle' };
  } else if (pct >= 50) {
    return { label: 'Almost Ready', color: 'yellow', icon: 'alert-circle' };
  } else {
    return { label: 'Study More', color: 'orange', icon: 'book-open' };
  }
}

function renderExternalTools() {
  const tools = [
    {
      name: 'Benchling',
      url: 'https://benchling.com',
      desc: 'Molecular biology design platform',
      icon: 'dna',
      color: 'blue',
    },
    {
      name: 'Twist Bioscience',
      url: 'https://www.twistbioscience.com',
      desc: 'DNA synthesis ordering',
      icon: 'shopping-cart',
      color: 'purple',
    },
    {
      name: 'NCBI BLAST',
      url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
      desc: 'Sequence alignment search',
      icon: 'search',
      color: 'green',
    },
    {
      name: 'GenBank',
      url: 'https://www.ncbi.nlm.nih.gov/genbank/',
      desc: 'DNA sequence database',
      icon: 'database',
      color: 'indigo',
    },
    {
      name: 'UniProt',
      url: 'https://www.uniprot.org',
      desc: 'Protein sequence database',
      icon: 'box',
      color: 'red',
    },
    {
      name: 'NEBcutter',
      url: 'https://nc3.neb.com/NEBcutter/',
      desc: 'Restriction site finder',
      icon: 'scissors',
      color: 'orange',
    },
  ];

  return `
    <div class="mb-8 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
        <i data-lucide="globe" class="w-5 h-5 text-cyan-500"></i>
        External Tools & Databases
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        ${tools.map(tool => `
          <a href="${tool.url}" target="_blank" rel="noopener" class="group flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-${tool.color}-300 dark:hover:border-${tool.color}-700 hover:shadow-md transition-all cursor-pointer">
            <div class="w-10 h-10 rounded-lg bg-${tool.color}-100 dark:bg-${tool.color}-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-${tool.color}-200 dark:group-hover:bg-${tool.color}-900/50 transition-colors">
              <i data-lucide="${tool.icon}" class="w-5 h-5 text-${tool.color}-600 dark:text-${tool.color}-400"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-${tool.color}-600 dark:group-hover:text-${tool.color}-400 transition-colors flex items-center gap-1">
                ${tool.name}
                <i data-lucide="external-link" class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${tool.desc}</div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

export { createHomeworkView };
