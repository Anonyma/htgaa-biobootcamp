/**
 * Formula Sheet View
 * Key formulas, equations, and quantitative relationships for HTGAA Week 2.
 */

import { store, TOPICS } from '../store.js';

export function createFormulaSheetView() {
  const FORMULAS = [
    {
      topic: 'synthesis',
      title: 'Oligo Synthesis Yield',
      formula: 'Yield = (Coupling Efficiency)^N',
      explanation: 'Where N = number of coupling steps (oligo length - 1). At 99% efficiency for a 200-mer: 0.99^199 = 13.5% yield.',
      example: '100-mer at 99.5%: 0.995^99 = 60.7% yield\n100-mer at 99.0%: 0.990^99 = 37.0% yield\n200-mer at 99.5%: 0.995^199 = 36.8% yield',
      variables: [
        { symbol: 'N', desc: 'Number of coupling steps (length - 1)' },
        { symbol: 'η', desc: 'Coupling efficiency per step (typically 98.5-99.5%)' },
      ]
    },
    {
      topic: 'synthesis',
      title: 'Error Rate in Synthesis',
      formula: 'P(error-free) = (1 - ε)^N',
      explanation: 'Where ε = error rate per base and N = oligo length. At 1/200 error rate for 200 bases: (1 - 0.005)^200 = 36.7% of oligos are perfect.',
      example: 'Typical error rate: 1 in 200 bases (ε = 0.005)\n200-mer: 36.7% error-free\n1000-mer (gene): 0.7% error-free → need error correction!',
      variables: [
        { symbol: 'ε', desc: 'Error rate per base (typically ~1/200)' },
        { symbol: 'N', desc: 'Sequence length in bases' },
      ]
    },
    {
      topic: 'sequencing',
      title: 'Sequencing Coverage',
      formula: 'Coverage = (Reads × Read Length) / Genome Size',
      explanation: 'Coverage (X) indicates how many times each base has been sequenced on average. 30X is standard for human WGS.',
      example: 'Human genome (3 Gb):\n100M reads × 150 bp = 15 Gb → 5X coverage\n600M reads × 150 bp = 90 Gb → 30X coverage',
      variables: [
        { symbol: 'X', desc: 'Coverage depth (fold coverage)' },
        { symbol: 'L', desc: 'Read length in bases' },
        { symbol: 'G', desc: 'Genome size in bases' },
      ]
    },
    {
      topic: 'sequencing',
      title: 'Phred Quality Score',
      formula: 'Q = -10 × log₁₀(P)',
      explanation: 'Where P = probability of an incorrect base call. Q30 means 1 in 1000 chance of error (99.9% accuracy). Q40 = 1 in 10,000.',
      example: 'Q10: P = 0.1 (90% accuracy)\nQ20: P = 0.01 (99% accuracy)\nQ30: P = 0.001 (99.9% accuracy)\nQ40: P = 0.0001 (99.99% accuracy)',
      variables: [
        { symbol: 'Q', desc: 'Quality score' },
        { symbol: 'P', desc: 'Probability of incorrect base call' },
      ]
    },
    {
      topic: 'gel-electrophoresis',
      title: 'DNA Migration in Gels',
      formula: 'Mobility ∝ 1 / log₁₀(Molecular Weight)',
      explanation: 'In agarose gels, linear DNA fragments migrate at rates inversely proportional to the log of their molecular weight (size in bp). Smaller fragments move faster.',
      example: '100 bp → migrates fast (near bottom)\n500 bp → moderate\n1000 bp → slower\n10,000 bp → very slow (near top)',
      variables: [
        { symbol: 'μ', desc: 'Electrophoretic mobility' },
        { symbol: 'MW', desc: 'Molecular weight (proportional to bp)' },
      ]
    },
    {
      topic: 'gel-electrophoresis',
      title: 'Restriction Fragment Sizes',
      formula: 'Fragments = Cuts + 1 (for linear DNA)',
      explanation: 'A linear DNA molecule cut N times yields N+1 fragments. A circular molecule cut N times yields N fragments. Fragment sizes must sum to the original size.',
      example: 'Linear 5000 bp cut at positions 1000 and 3000:\nFragment 1: 1000 bp\nFragment 2: 2000 bp\nFragment 3: 2000 bp\nTotal: 5000 bp ✓',
      variables: [
        { symbol: 'N', desc: 'Number of restriction sites cut' },
      ]
    },
    {
      topic: 'central-dogma',
      title: 'Codon to Protein Length',
      formula: 'Protein Length = (CDS length - 3) / 3',
      explanation: 'The coding sequence (CDS) length in nucleotides divided by 3 gives the number of codons. Subtract 1 for the stop codon to get amino acid count.',
      example: 'GFP gene: 720 nt CDS\n(720 - 3) / 3 = 239 amino acids\nMolecular weight ≈ 239 × 110 Da ≈ 26.3 kDa',
      variables: [
        { symbol: 'CDS', desc: 'Coding sequence length in nucleotides (includes stop)' },
        { symbol: 'AA', desc: 'Number of amino acids in protein' },
      ]
    },
    {
      topic: 'central-dogma',
      title: 'Average Amino Acid Molecular Weight',
      formula: 'Protein MW ≈ AA count × 110 Da',
      explanation: 'Average amino acid molecular weight is ~110 Daltons (including the peptide bond). Useful for estimating protein size from sequence length.',
      example: 'Cas9: 1368 AA × 110 = ~150 kDa\nGFP: 239 AA × 110 = ~26 kDa\nInsulin: 51 AA × 110 = ~5.6 kDa',
      variables: [
        { symbol: 'Da', desc: 'Daltons (atomic mass units)' },
        { symbol: 'kDa', desc: 'kiloDaltons (1000 Da)' },
      ]
    },
    {
      topic: 'synthesis',
      title: 'DNA Data Storage Capacity',
      formula: 'Storage = N × 2 bits (per nucleotide)',
      explanation: 'Each nucleotide can encode 2 bits (4 possible bases = 2^2). One gram of DNA can theoretically store ~215 petabytes of data.',
      example: '1 base = 2 bits\n1 byte = 4 bases\n1 KB = 4,096 bases\n1 MB = ~4 million bases\n1 human genome (3 Gb) = ~750 MB',
      variables: [
        { symbol: 'N', desc: 'Number of nucleotides' },
      ]
    },
    {
      topic: 'editing',
      title: 'CRISPR Efficiency Factors',
      formula: 'Editing Efficiency = f(guide design, PAM, delivery, repair pathway)',
      explanation: 'Not a single formula — editing efficiency depends on multiple factors: guide RNA design (GC content 40-60% optimal), PAM availability, delivery method efficiency, and which repair pathway dominates (NHEJ vs HDR).',
      example: 'Typical efficiencies:\nNHEJ knockout: 30-80%\nHDR knock-in: 5-30%\nBase editing: 30-70%\nPrime editing: 10-50%',
      variables: [
        { symbol: 'NHEJ', desc: 'Non-Homologous End Joining (error-prone)' },
        { symbol: 'HDR', desc: 'Homology-Directed Repair (precise, needs template)' },
      ]
    },
  ];

  return {
    render() {
      return `
        <style>
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
          }
        </style>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <div class="flex items-center justify-between mb-6 no-print">
            <div>
              <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Formula Sheet</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Key equations and quantitative relationships</p>
            </div>
            <div class="flex items-center gap-3">
              <button id="print-formulas" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
                <i data-lucide="printer" class="w-4 h-4"></i> Print
              </button>
              <a data-route="#/" class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Home
              </a>
            </div>
          </div>

          <!-- Topic filter -->
          <div class="flex flex-wrap gap-2 mb-6 no-print">
            <button class="topic-filter px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500 text-white transition-colors" data-topic="all">All</button>
            ${TOPICS.map(t => `<button class="topic-filter px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors" data-topic="${t.id}">${t.title}</button>`).join('')}
          </div>

          <!-- Formula Cards -->
          <div id="formula-list" class="space-y-4">
            ${FORMULAS.map(f => {
              const topic = TOPICS.find(t => t.id === f.topic);
              const color = topic ? topic.color : 'slate';
              return `
                <div class="formula-card bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden" data-topic="${f.topic}">
                  <div class="p-4 border-b border-slate-100 dark:border-slate-700 bg-${color}-50 dark:bg-${color}-900/10">
                    <div class="flex items-center justify-between">
                      <h3 class="font-bold text-slate-800 dark:text-white">${f.title}</h3>
                      <span class="text-xs px-2 py-0.5 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300">${topic?.title || f.topic}</span>
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 mb-3 text-center">
                      <code class="text-lg font-bold text-blue-700 dark:text-blue-300">${f.formula}</code>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">${f.explanation}</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div class="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <p class="text-xs font-bold text-green-700 dark:text-green-300 mb-1">Example</p>
                        <pre class="text-xs text-green-600 dark:text-green-400 whitespace-pre-wrap font-mono">${f.example}</pre>
                      </div>
                      <div class="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <p class="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">Variables</p>
                        ${f.variables.map(v => `<p class="text-xs text-blue-600 dark:text-blue-400"><code class="font-bold">${v.symbol}</code> — ${v.desc}</p>`).join('')}
                      </div>
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>`;
    },

    mount(container) {
      // Topic filter
      container.querySelectorAll('.topic-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          const topic = btn.dataset.topic;
          container.querySelectorAll('.topic-filter').forEach(b => {
            b.className = `topic-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${b.dataset.topic === topic ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`;
          });
          container.querySelectorAll('.formula-card').forEach(card => {
            card.style.display = (topic === 'all' || card.dataset.topic === topic) ? 'block' : 'none';
          });
        });
      });

      // Print
      container.querySelector('#print-formulas')?.addEventListener('click', () => window.print());

      if (window.lucide) lucide.createIcons();
    }
  };
}
