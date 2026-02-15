import { store, TOPICS } from '../store.js';

function createCheatsheetView() {
  return {
    render() {
      return `
        <div class="max-w-7xl mx-auto p-6 print:p-4">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-6 print:hidden">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-white mb-2">Week 2 Cheat Sheet</h1>
                <p class="text-blue-100 text-lg">Key formulas, facts, and concepts — print-optimized</p>
              </div>
              <button
                onclick="window.print()"
                class="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <i data-lucide="printer" class="w-5 h-5"></i>
                Print
              </button>
            </div>
          </div>

          <!-- Print Header -->
          <div class="hidden print:block mb-4 pb-2 border-b-2 border-slate-900">
            <h1 class="text-2xl font-bold text-slate-900">HTGAA BioBootcamp Week 2 — Cheat Sheet</h1>
            <p class="text-sm text-slate-600">Key formulas, facts, and concepts</p>
          </div>

          <!-- Two-column layout -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">

            <!-- DNA Sequencing -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 print:p-3 print:break-inside-avoid">
              <div class="flex items-center gap-3 mb-4 print:mb-2 border-l-4 border-blue-500 pl-3">
                <i data-lucide="scan-search" class="w-5 h-5 text-blue-500 print:hidden"></i>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white print:text-base">DNA Sequencing</h2>
              </div>
              <div class="space-y-3 text-sm print:text-xs print:space-y-2">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Sanger Sequencing</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>ddNTPs (dideoxynucleotides) terminate DNA chains</li>
                    <li>Gel or capillary electrophoresis separation</li>
                    <li>Read length: ~800 bp, high accuracy (99.9%)</li>
                    <li>Low throughput, gold standard for validation</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Illumina (NGS)</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>Bridge amplification creates clusters</li>
                    <li>Sequencing by synthesis with reversible terminators</li>
                    <li>Read length: ~150 bp (paired-end: 2×150)</li>
                    <li>Ultra-high throughput, low cost per base</li>
                    <li>Error rate: ~0.1% (substitutions mostly)</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">PacBio (SMRT)</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>Single molecule, real-time sequencing</li>
                    <li>Read length: 10-25 kb (HiFi mode)</li>
                    <li>High accuracy via circular consensus (CCS)</li>
                    <li>Detects methylation directly</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Oxford Nanopore</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>Ionic current changes as DNA passes through pore</li>
                    <li>Read length: >100 kb (ultra-long reads)</li>
                    <li>Portable, real-time, direct RNA sequencing</li>
                    <li>Error rate: ~5% (but improving)</li>
                  </ul>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg print:bg-gray-100 print:p-2">
                  <p class="font-semibold text-blue-900 dark:text-blue-200 mb-1 print:text-slate-900">Key Metrics</p>
                  <p class="text-blue-800 dark:text-blue-300 print:text-slate-900">Read Length × Accuracy × Throughput × Cost</p>
                </div>
              </div>
            </div>

            <!-- DNA Synthesis -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 print:p-3 print:break-inside-avoid">
              <div class="flex items-center gap-3 mb-4 print:mb-2 border-l-4 border-green-500 pl-3">
                <i data-lucide="pen-tool" class="w-5 h-5 text-green-500 print:hidden"></i>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white print:text-base">DNA Synthesis</h2>
              </div>
              <div class="space-y-3 text-sm print:text-xs print:space-y-2">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Phosphoramidite Chemistry</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>4-step cycle: detritylation → coupling → capping → oxidation</li>
                    <li>Coupling efficiency: ~99.5% per step</li>
                    <li>Build 3' to 5' direction</li>
                    <li>Column-based synthesis: ~200 nt max length</li>
                  </ul>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg print:bg-gray-100 print:p-2">
                  <p class="font-semibold text-green-900 dark:text-green-200 mb-1 print:text-slate-900">Yield Formula</p>
                  <p class="text-green-800 dark:text-green-300 font-mono print:text-slate-900">Yield = (efficiency)^N</p>
                  <p class="text-green-700 dark:text-green-400 text-xs mt-1 print:text-slate-900">For 200-mer at 99.5%: 0.995^200 = 36.7%</p>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Chip-Based Synthesis</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>Millions of oligos in parallel (microarray)</li>
                    <li>1000× cheaper than column synthesis</li>
                    <li>Shorter oligos: 50-200 nt typical</li>
                    <li>Used for gene assembly, screening</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Gibson Assembly</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>5' exonuclease creates single-strand overhangs (20-40 bp)</li>
                    <li>Overhangs anneal by complementarity</li>
                    <li>Polymerase fills gaps, ligase seals nicks</li>
                    <li>Isothermal, single reaction tube</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Error Rates</h3>
                  <p class="text-slate-600 dark:text-slate-300 print:text-slate-900">Oligo synthesis: ~1/200 bp | After error correction: ~1/10,000 bp</p>
                </div>
              </div>
            </div>

            <!-- Gene Editing -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 print:p-3 print:break-inside-avoid">
              <div class="flex items-center gap-3 mb-4 print:mb-2 border-l-4 border-red-500 pl-3">
                <i data-lucide="scissors" class="w-5 h-5 text-red-500 print:hidden"></i>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white print:text-base">Gene Editing</h2>
              </div>
              <div class="space-y-3 text-sm print:text-xs print:space-y-2">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">CRISPR-Cas9</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>sgRNA (20 nt) guides Cas9 to target site</li>
                    <li>Cas9 creates double-strand break (DSB)</li>
                    <li>NHEJ repair: error-prone, creates indels (knockouts)</li>
                    <li>HDR repair: template-directed, precise edits (harder)</li>
                    <li>PAM requirement: NGG (SpCas9), 3' of target</li>
                  </ul>
                </div>
                <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg print:bg-gray-100 print:p-2">
                  <p class="font-semibold text-red-900 dark:text-red-200 mb-1 print:text-slate-900">Target Site Structure</p>
                  <p class="text-red-800 dark:text-red-300 font-mono text-xs print:text-slate-900">5'-[20 nt target]-[NGG PAM]-3'</p>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Base Editing</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>CBE (Cytosine Base Editor): C → T conversion</li>
                    <li>ABE (Adenine Base Editor): A → G conversion</li>
                    <li>No DSB required, less off-target damage</li>
                    <li>Editing window: ~5 nt within target</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Prime Editing</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>pegRNA + Cas9 nickase + reverse transcriptase</li>
                    <li>"Search and replace" — writes new sequence directly</li>
                    <li>No DSB, no donor DNA template needed</li>
                    <li>Insertions, deletions, all 12 base transitions</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Off-Target Effects</h3>
                  <p class="text-slate-600 dark:text-slate-300 print:text-slate-900">Mismatches in seed region (8-12 nt PAM-proximal) most critical. Use high-fidelity Cas9 variants (e.g., HiFi Cas9).</p>
                </div>
              </div>
            </div>

            <!-- Genetic Codes -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 print:p-3 print:break-inside-avoid">
              <div class="flex items-center gap-3 mb-4 print:mb-2 border-l-4 border-purple-500 pl-3">
                <i data-lucide="dna" class="w-5 h-5 text-purple-500 print:hidden"></i>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white print:text-base">Genetic Codes</h2>
              </div>
              <div class="space-y-3 text-sm print:text-xs print:space-y-2">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Standard Genetic Code</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>64 codons → 20 amino acids + 3 stop codons</li>
                    <li>Start codon: AUG (codes for Methionine)</li>
                    <li>Stop codons: UAA, UAG, UGA ("amber", "ochre", "opal")</li>
                    <li>Degeneracy: most amino acids have multiple codons</li>
                  </ul>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg print:bg-gray-100 print:p-2">
                  <p class="font-semibold text-purple-900 dark:text-purple-200 mb-1 print:text-slate-900">Wobble Position</p>
                  <p class="text-purple-800 dark:text-purple-300 print:text-slate-900">3rd codon position allows flexible base pairing (G-U wobble). Often synonymous mutations.</p>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Expanded Genetic Codes</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>Unnatural base pairs: dNaM-dTPT3, Ds-Px (Hachimoji DNA)</li>
                    <li>Unnatural amino acids (UAAs): suppress stop codons</li>
                    <li>Amber suppression: UAG reassigned to UAA via tRNA</li>
                    <li>Applications: bio-orthogonal chemistry, new protein functions</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Codon Optimization</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>Match codon usage to host organism (E. coli, yeast, mammalian)</li>
                    <li>Replace rare codons with synonymous frequent codons</li>
                    <li>Improves expression, avoids ribosome stalling</li>
                    <li>Avoid: repeats, hairpins, cryptic splice sites</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Gel Electrophoresis -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 print:p-3 print:break-inside-avoid">
              <div class="flex items-center gap-3 mb-4 print:mb-2 border-l-4 border-yellow-500 pl-3">
                <i data-lucide="flask-conical" class="w-5 h-5 text-yellow-600 print:hidden"></i>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white print:text-base">Gel Electrophoresis</h2>
              </div>
              <div class="space-y-3 text-sm print:text-xs print:space-y-2">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Principle</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>DNA is negatively charged (phosphate backbone)</li>
                    <li>Migrates toward positive electrode (+)</li>
                    <li>Smaller fragments migrate faster through agarose matrix</li>
                    <li>Separation by size (molecular weight)</li>
                  </ul>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg print:bg-gray-100 print:p-2">
                  <p class="font-semibold text-yellow-900 dark:text-yellow-200 mb-1 print:text-slate-900">Agarose Concentration</p>
                  <p class="text-yellow-800 dark:text-yellow-300 print:text-slate-900">0.5% → large fragments (>10 kb) | 1% → standard (0.5-10 kb) | 2% → small (<500 bp)</p>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Common Restriction Enzymes</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900 font-mono text-xs">
                    <li>EcoRI: G↓AATTC (sticky 5' overhang)</li>
                    <li>HindIII: A↓AGCTT (sticky 5' overhang)</li>
                    <li>BamHI: G↓GATCC (sticky 5' overhang)</li>
                    <li>PstI: CTGCA↓G (sticky 3' overhang)</li>
                    <li>SmaI: CCC↓GGG (blunt ends)</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Sticky vs Blunt Ends</h3>
                  <p class="text-slate-600 dark:text-slate-300 print:text-slate-900"><strong>Sticky ends:</strong> Overhangs, easier ligation (directional cloning). <strong>Blunt ends:</strong> No overhangs, harder ligation, non-directional.</p>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">DNA Ladder</h3>
                  <p class="text-slate-600 dark:text-slate-300 print:text-slate-900">Reference bands of known sizes (e.g., 100 bp ladder: 100, 200, 300... 1000 bp). Use to estimate unknown fragment sizes.</p>
                </div>
              </div>
            </div>

            <!-- Central Dogma -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 print:p-3 print:break-inside-avoid">
              <div class="flex items-center gap-3 mb-4 print:mb-2 border-l-4 border-indigo-500 pl-3">
                <i data-lucide="arrow-right-left" class="w-5 h-5 text-indigo-500 print:hidden"></i>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white print:text-base">Central Dogma</h2>
              </div>
              <div class="space-y-3 text-sm print:text-xs print:space-y-2">
                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg print:bg-gray-100 print:p-2">
                  <p class="font-semibold text-indigo-900 dark:text-indigo-200 mb-1 print:text-slate-900">Flow</p>
                  <p class="text-indigo-800 dark:text-indigo-300 font-mono print:text-slate-900">DNA → (transcription) → mRNA → (translation) → Protein</p>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Expression Cassette Structure</h3>
                  <p class="text-slate-600 dark:text-slate-300 font-mono text-xs print:text-slate-900">Promoter → RBS → Start (ATG) → CDS → Stop → Terminator</p>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Promoters</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>Constitutive: always "on" (e.g., J23100, CMV)</li>
                    <li>Inducible: controlled by signal (e.g., lac, T7, Tet)</li>
                    <li>Strength: weak/medium/strong → expression level</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Ribosome Binding Site (RBS)</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>Shine-Dalgarno sequence: 5'-AGGAGG-3' (prokaryotes)</li>
                    <li>~8 bp upstream of start codon (ATG)</li>
                    <li>Ribosome recognizes and binds for translation</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Codon Optimization (Recap)</h3>
                  <p class="text-slate-600 dark:text-slate-300 print:text-slate-900">Replace rare codons with frequent synonymous codons for host. Improves translation efficiency.</p>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Common Tags</h3>
                  <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 print:text-slate-900">
                    <li>His-tag (6×His): affinity purification via Ni-NTA</li>
                    <li>GFP/mCherry: fluorescent visualization</li>
                    <li>FLAG tag: detection and purification</li>
                    <li>Position: N-terminal or C-terminal fusion</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          <!-- Key Formulas Summary -->
          <div class="mt-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border-2 border-slate-300 dark:border-slate-600 p-6 print:bg-white print:border-slate-900 print:p-4 print:mt-4">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4 print:text-lg print:mb-2">Key Formulas & Rules</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
              <div class="bg-white dark:bg-slate-900 rounded-lg p-4 print:p-2 print:bg-gray-50">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-2 print:mb-1 text-sm">Synthesis Yield</h3>
                <p class="font-mono text-sm text-slate-700 dark:text-slate-300 print:text-xs print:text-slate-900">Y = (coupling_efficiency)^N</p>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 print:text-slate-900">N = number of nucleotides</p>
              </div>
              <div class="bg-white dark:bg-slate-900 rounded-lg p-4 print:p-2 print:bg-gray-50">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-2 print:mb-1 text-sm">DNA Migration</h3>
                <p class="font-mono text-sm text-slate-700 dark:text-slate-300 print:text-xs print:text-slate-900">distance ∝ 1/log(MW)</p>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 print:text-slate-900">Smaller fragments travel farther</p>
              </div>
              <div class="bg-white dark:bg-slate-900 rounded-lg p-4 print:p-2 print:bg-gray-50">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-2 print:mb-1 text-sm">Restriction Fragments</h3>
                <p class="font-mono text-sm text-slate-700 dark:text-slate-300 print:text-xs print:text-slate-900">n sites → n+1 fragments</p>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 print:text-slate-900">Linear DNA only</p>
              </div>
              <div class="bg-white dark:bg-slate-900 rounded-lg p-4 print:p-2 print:bg-gray-50">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-2 print:mb-1 text-sm">Fragment Size (Gel)</h3>
                <p class="text-sm text-slate-700 dark:text-slate-300 print:text-xs print:text-slate-900">Interpolate from ladder</p>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 print:text-slate-900">Log-linear plot: log(size) vs distance</p>
              </div>
            </div>
          </div>

          <!-- Print footer -->
          <div class="hidden print:block mt-4 pt-2 border-t border-slate-300 text-xs text-slate-600 text-center">
            <p>HTGAA BioBootcamp — htgaa-biobootcamp.netlify.app — Week 2 Cheat Sheet</p>
          </div>
        </div>
      `;
    },

    mount(container) {
      // Initialize Lucide icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  };
}

export { createCheatsheetView };
