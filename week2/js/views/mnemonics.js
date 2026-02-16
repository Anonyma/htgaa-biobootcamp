/**
 * HTGAA Week 2 — Mnemonics View
 * Memory aids and mnemonics for key bioengineering concepts.
 * Includes 25+ pre-built mnemonics, custom mnemonic creation,
 * quiz mode, and spaced recall tracking.
 */

import { store, TOPICS } from '../store.js';

const CUSTOM_KEY = 'htgaa-week2-custom-mnemonics';
const MEMORIZED_KEY = 'htgaa-week2-memorized-mnemonics';

const TOPIC_COLORS = {
  'central-dogma':      { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-700', accent: 'indigo' },
  'sequencing':         { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-300 dark:border-blue-700',   accent: 'blue' },
  'synthesis':          { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700', accent: 'green' },
  'editing':            { bg: 'bg-red-100 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-300',     border: 'border-red-300 dark:border-red-700',     accent: 'red' },
  'genetic-codes':      { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700', accent: 'purple' },
  'gel-electrophoresis': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700', accent: 'yellow' },
};

const BUILT_IN_MNEMONICS = [
  // === Central Dogma (6) ===
  {
    id: 'cd-1',
    topic: 'central-dogma',
    concept: 'The Central Dogma: DNA \u2192 RNA \u2192 Protein',
    mnemonic: '"Don\'t Run Past" or "Dogs Run Playfully" \u2014 DNA is transcribed to RNA, which is translated to Protein.',
    detail: 'Information flows in one direction: replication (DNA\u2192DNA), transcription (DNA\u2192RNA), translation (RNA\u2192Protein).',
  },
  {
    id: 'cd-2',
    topic: 'central-dogma',
    concept: 'DNA nucleotide bases: Adenine, Thymine, Guanine, Cytosine',
    mnemonic: '"All Tigers Go Crazy" \u2014 A, T, G, C. Pairs: A=T (2 H-bonds), G\u2261C (3 H-bonds).',
    detail: 'A pairs with T via 2 hydrogen bonds; G pairs with C via 3 hydrogen bonds (stronger).',
  },
  {
    id: 'cd-3',
    topic: 'central-dogma',
    concept: 'RNA bases: Adenine, Uracil, Guanine, Cytosine',
    mnemonic: '"All Universities Grant Credits" \u2014 A, U, G, C. RNA replaces Thymine with Uracil.',
    detail: 'Uracil (U) replaces Thymine (T) in RNA. U still pairs with A.',
  },
  {
    id: 'cd-4',
    topic: 'central-dogma',
    concept: 'Purines (A, G) vs Pyrimidines (C, T, U)',
    mnemonic: '"PURe As Gold" \u2014 purines are A and G (2 rings). "CUT the PYe" \u2014 pyrimidines are C, U, T (1 ring).',
    detail: 'Purines have a double-ring structure; pyrimidines have a single ring. A purine always pairs with a pyrimidine.',
  },
  {
    id: 'cd-5',
    topic: 'central-dogma',
    concept: 'Start codon: AUG codes for Methionine',
    mnemonic: '"AUGust is the start of school" \u2014 AUG is always the START codon and codes for Methionine (Met).',
    detail: 'Every protein begins with Methionine. AUG is the universal start codon recognized by the ribosome.',
  },
  {
    id: 'cd-6',
    topic: 'central-dogma',
    concept: 'Expression cassette order: Promoter \u2192 RBS \u2192 Start \u2192 CDS \u2192 Stop \u2192 Terminator',
    mnemonic: '"Please Read Slowly, Children Stop Talking" \u2014 Promoter, RBS, Start codon, CDS, Stop codon, Terminator.',
    detail: 'A minimal gene expression unit needs all six elements in order for proper transcription and translation.',
  },

  // === Sequencing (4) ===
  {
    id: 'seq-1',
    topic: 'sequencing',
    concept: 'Sanger sequencing cycle steps',
    mnemonic: '"Denature, Anneal, Extend \u2014 DAE!" \u2014 the three thermal cycling steps of Sanger sequencing.',
    detail: 'Denature (95\u00b0C) separates strands, Anneal (~55\u00b0C) binds primers, Extend (72\u00b0C) polymerase adds bases + random ddNTPs terminate.',
  },
  {
    id: 'seq-2',
    topic: 'sequencing',
    concept: 'NGS platforms ranked by read length',
    mnemonic: '"Short Illumina, Long PacBio, Ultra-long Nanopore \u2014 SLU" \u2014 read lengths from shortest to longest.',
    detail: 'Illumina: ~150-300 bp. PacBio HiFi: ~15-20 kb. Oxford Nanopore: up to 2+ Mb reads.',
  },
  {
    id: 'seq-3',
    topic: 'sequencing',
    concept: 'Fluorescent ddNTP labeling in Sanger sequencing',
    mnemonic: '"Four Fluorescent Friends Find the Final base" \u2014 each ddNTP (ddATP, ddTTP, ddGTP, ddCTP) has a unique fluorescent color.',
    detail: 'Chain-terminating dideoxynucleotides lack the 3\'-OH needed for elongation; each emits a different wavelength when laser-excited.',
  },
  {
    id: 'seq-4',
    topic: 'sequencing',
    concept: 'Phred quality score meaning',
    mnemonic: '"Q30 = 1 in 1,000 error" \u2014 every +10 in Phred score = 10x fewer errors. Q20=1%, Q30=0.1%, Q40=0.01%.',
    detail: 'Phred score Q = -10 log10(P). A Q30 base call has 99.9% accuracy.',
  },

  // === Synthesis (4) ===
  {
    id: 'syn-1',
    topic: 'synthesis',
    concept: 'Phosphoramidite synthesis cycle: 4 steps',
    mnemonic: '"Don\'t Carelessly Cap Oxygen" \u2014 DCCO: Detritylation, Coupling, Capping, Oxidation.',
    detail: 'Each cycle adds one nucleotide. Detritylation removes the DMT protecting group, Coupling adds the next base, Capping blocks failures, Oxidation stabilizes the phosphite linkage.',
  },
  {
    id: 'syn-2',
    topic: 'synthesis',
    concept: 'DNA synthesis direction: 3\' to 5\'',
    mnemonic: '"Synthesis goes backward \u2014 3 comes before 5 alphabetically too!" Chemical synthesis builds 3\'\u21925\', opposite to biological 5\'\u21923\'.',
    detail: 'Phosphoramidite chemistry adds nucleotides to the 5\' end of the growing chain, so the oligo grows 3\'\u21925\' on a solid support.',
  },
  {
    id: 'syn-3',
    topic: 'synthesis',
    concept: 'Gibson Assembly mechanism',
    mnemonic: '"Exonuclease Exposes, Single strands Stick, Polymerase Patches, Ligase Links, Everything\'s connected" \u2014 5 steps of Gibson Assembly.',
    detail: 'T5 exonuclease chews back 5\' ends, creating complementary overhangs that anneal; Phusion polymerase fills gaps; Taq ligase seals nicks. All in one isothermal reaction at 50\u00b0C.',
  },
  {
    id: 'syn-4',
    topic: 'synthesis',
    concept: 'Error rate of oligo synthesis',
    mnemonic: '"1 error per 200 bases" \u2014 coupling efficiency ~99.5% means errors accumulate. A 200-mer has ~63% chance of being perfect.',
    detail: 'At 99.5% stepwise yield, probability of perfect n-mer = 0.995^n. For n=200: 0.995^200 \u2248 0.37, so ~37% are perfect.',
  },

  // === Editing (4) ===
  {
    id: 'ed-1',
    topic: 'editing',
    concept: 'CRISPR-Cas9 components',
    mnemonic: '"Cas9 is the Scissors, gRNA is the GPS" \u2014 the guide RNA directs Cas9 to the target; Cas9 cuts the DNA.',
    detail: 'The ~20 nt spacer in the gRNA base-pairs with the target. Cas9 makes a blunt-ended double-strand break 3 bp upstream of the PAM.',
  },
  {
    id: 'ed-2',
    topic: 'editing',
    concept: 'DNA repair: NHEJ vs HDR',
    mnemonic: '"NHEJ is Messy (Non-Homologous = No template), HDR is Precise (Homology-Directed = has a donor template)."',
    detail: 'NHEJ introduces random indels (knockouts). HDR uses a homologous donor to make precise edits (knock-ins, corrections).',
  },
  {
    id: 'ed-3',
    topic: 'editing',
    concept: 'Base editors: CBE and ABE',
    mnemonic: '"CBE: C becomes T (Cytosine \u2192 Uracil \u2192 Thymine). ABE: A becomes G (Adenine \u2192 Inosine \u2192 Guanine)." C\u2192T, A\u2192G.',
    detail: 'Base editors use a catalytically impaired Cas9 (nickase) fused to a deaminase. No double-strand break needed.',
  },
  {
    id: 'ed-4',
    topic: 'editing',
    concept: 'PAM sequence for SpCas9',
    mnemonic: '"NGG is the Cas9 doorbell" \u2014 SpCas9 requires a 5\'-NGG-3\' PAM immediately downstream of the target on the non-target strand.',
    detail: 'PAM = Protospacer Adjacent Motif. Without PAM recognition, Cas9 cannot bind or cut. Different Cas variants recognize different PAMs.',
  },

  // === Genetic Codes (4) ===
  {
    id: 'gc-1',
    topic: 'genetic-codes',
    concept: 'Three stop codons: UAA, UAG, UGA',
    mnemonic: '"U Are Annoying" (UAA), "U Are Gone" (UAG), "U Go Away" (UGA) \u2014 all three tell the ribosome to STOP.',
    detail: 'Stop codons are recognized by release factors, not tRNAs. They trigger peptide release and ribosome disassembly.',
  },
  {
    id: 'gc-2',
    topic: 'genetic-codes',
    concept: 'Wobble position in codons',
    mnemonic: '"Third base Wobbles \u2014 it\'s the most flexible" \u2014 the 3rd position of a codon tolerates non-standard base pairing.',
    detail: 'Wobble allows one tRNA to read multiple codons differing only at position 3. This is why the genetic code is degenerate.',
  },
  {
    id: 'gc-3',
    topic: 'genetic-codes',
    concept: 'Amino acid property groups',
    mnemonic: 'Memory palace: "Nonpolar = GAL VAMP FIW" (Gly, Ala, Leu, Val, Met, Pro, Phe, Ile, Trp). Charged = "DREK" (Asp, Arg, Glu, Lys).',
    detail: 'The 20 amino acids: nonpolar (9), polar uncharged (6: Ser, Thr, Cys, Tyr, Asn, Gln), positive (Arg, Lys, His), negative (Asp, Glu).',
  },
  {
    id: 'gc-4',
    topic: 'genetic-codes',
    concept: 'Genetic code is degenerate but unambiguous',
    mnemonic: '"Many roads, one destination" \u2014 multiple codons can code for the same amino acid, but each codon specifies exactly one amino acid.',
    detail: '64 codons map to 20 amino acids + 3 stops. Degeneracy mostly occurs at the 3rd (wobble) position.',
  },

  // === Gel Electrophoresis (5) ===
  {
    id: 'gel-1',
    topic: 'gel-electrophoresis',
    concept: 'DNA migration in gel electrophoresis',
    mnemonic: '"Small Swims Swift" \u2014 smaller DNA fragments migrate faster through the gel matrix toward the positive electrode.',
    detail: 'DNA is negatively charged (phosphate backbone) and moves toward the anode (+). Smaller fragments navigate pores more easily.',
  },
  {
    id: 'gel-2',
    topic: 'gel-electrophoresis',
    concept: 'Gel concentration vs fragment resolution',
    mnemonic: '"High catches tiny" \u2014 higher % agarose gels resolve smaller fragments better; lower % gels resolve larger fragments.',
    detail: '0.5% gel: resolves 1-30 kb. 1% gel: resolves 0.5-10 kb. 2% gel: resolves 0.1-2 kb. Higher % = smaller pores.',
  },
  {
    id: 'gel-3',
    topic: 'gel-electrophoresis',
    concept: 'Ethidium bromide (EtBr) staining',
    mnemonic: '"EtBr glows under UV \u2014 Ethidium Bromide is the Bright Reporter" \u2014 intercalates between bases and fluoresces orange.',
    detail: 'EtBr is a DNA intercalator and mutagen. Modern alternatives: SYBR Safe, GelRed. Always wear gloves.',
  },
  {
    id: 'gel-4',
    topic: 'gel-electrophoresis',
    concept: 'EcoRI restriction site: GAATTC',
    mnemonic: '"Going Away And Then Toward the Center" \u2014 GAATTC is a palindrome. EcoRI cuts between G and A, leaving 5\' sticky ends.',
    detail: 'EcoRI is a Type II restriction endonuclease from E. coli. It creates 4-nt 5\' overhangs (sticky ends) useful for cloning.',
  },
  {
    id: 'gel-5',
    topic: 'gel-electrophoresis',
    concept: 'DNA ladder / molecular weight marker',
    mnemonic: '"The ladder is your ruler" \u2014 always run a known-size ladder alongside samples to estimate fragment sizes by comparison.',
    detail: 'Common ladders: 1 kb ladder (0.5-10 kb), 100 bp ladder (100-1500 bp). The brightest band is usually a reference (e.g., 500 bp or 3 kb).',
  },
];

function loadCustomMnemonics() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || [];
  } catch { return []; }
}

function saveCustomMnemonics(list) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

function loadMemorized() {
  try {
    return JSON.parse(localStorage.getItem(MEMORIZED_KEY)) || {};
  } catch { return {}; }
}

function saveMemorized(obj) {
  localStorage.setItem(MEMORIZED_KEY, JSON.stringify(obj));
}

function getTopicLabel(topicId) {
  const t = TOPICS.find(t => t.id === topicId);
  return t ? t.title : topicId;
}

function getTopicStyle(topicId) {
  return TOPIC_COLORS[topicId] || TOPIC_COLORS['central-dogma'];
}

export function createMnemonicsView() {
  let allMnemonics = [];
  let filtered = [];
  let selectedTopic = 'all';
  let filterMode = 'all'; // all | memorized | learning | custom
  let searchQuery = '';
  let quizMode = false;
  let quizIndex = 0;
  let quizRevealed = false;
  let editingId = null;

  function getAllMnemonics() {
    const customs = loadCustomMnemonics().map(c => ({ ...c, isCustom: true }));
    return [...BUILT_IN_MNEMONICS, ...customs];
  }

  function applyFilters() {
    const memorized = loadMemorized();
    let list = allMnemonics;

    if (selectedTopic !== 'all') {
      list = list.filter(m => m.topic === selectedTopic);
    }
    if (filterMode === 'memorized') {
      list = list.filter(m => memorized[m.id]);
    } else if (filterMode === 'learning') {
      list = list.filter(m => !memorized[m.id]);
    } else if (filterMode === 'custom') {
      list = list.filter(m => m.isCustom);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.concept.toLowerCase().includes(q) ||
        m.mnemonic.toLowerCase().includes(q) ||
        (m.detail && m.detail.toLowerCase().includes(q))
      );
    }
    filtered = list;
  }

  function renderStats() {
    const memorized = loadMemorized();
    const total = allMnemonics.length;
    const memCount = allMnemonics.filter(m => memorized[m.id]).length;
    const customCount = allMnemonics.filter(m => m.isCustom).length;
    const pct = total > 0 ? Math.round((memCount / total) * 100) : 0;
    return `
      <div class="flex items-center gap-4 text-sm mb-1">
        <span class="font-semibold text-emerald-600 dark:text-emerald-400">${memCount} memorized</span>
        <span class="text-slate-400">/</span>
        <span class="text-slate-600 dark:text-slate-300">${total} total</span>
        ${customCount > 0 ? `<span class="text-slate-400">|</span><span class="text-violet-600 dark:text-violet-400">${customCount} custom</span>` : ''}
      </div>
      <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" style="width:${pct}%"></div>
      </div>
    `;
  }

  function renderCard(m, idx) {
    const memorized = loadMemorized();
    const isMem = memorized[m.id];
    const style = getTopicStyle(m.topic);
    const topicLabel = getTopicLabel(m.topic);

    return `
      <div class="mnemonic-card group relative border rounded-xl p-5 cursor-pointer transition-all duration-200
        ${style.border} hover:shadow-lg hover:scale-[1.01]
        ${isMem ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' : 'bg-white dark:bg-slate-800/60'}"
        data-card-id="${m.id}" data-idx="${idx}">

        <!-- Topic badge + memorized indicator -->
        <div class="flex items-center justify-between mb-3">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}">
            ${topicLabel}
          </span>
          <div class="flex items-center gap-2">
            ${m.isCustom ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 font-medium">Custom</span>' : ''}
            ${isMem ? '<span class="text-emerald-500" title="Memorized"><i data-lucide="check-circle-2" class="w-5 h-5"></i></span>' : '<span class="text-slate-300 dark:text-slate-600" title="Still learning"><i data-lucide="circle" class="w-5 h-5"></i></span>'}
          </div>
        </div>

        <!-- Front: concept -->
        <h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-relaxed mb-2">${m.concept}</h3>

        <!-- Back: mnemonic (hidden by default) -->
        <div class="mnemonic-answer hidden mt-3 pt-3 border-t border-dashed ${style.border}">
          <p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">${m.mnemonic}</p>
          ${m.detail ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">${m.detail}</p>` : ''}
        </div>

        <!-- Tap hint -->
        <p class="mnemonic-hint text-[10px] text-slate-400 dark:text-slate-500 mt-3 text-center italic">Tap to reveal</p>

        <!-- Action buttons (visible on hover or after reveal) -->
        <div class="mnemonic-actions hidden mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <button class="mn-toggle-mem flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors
            ${isMem ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
            hover:opacity-80" data-mn-id="${m.id}">
            <i data-lucide="${isMem ? 'check-circle-2' : 'circle'}" class="w-3.5 h-3.5"></i>
            ${isMem ? 'Memorized' : 'Mark memorized'}
          </button>
          ${m.isCustom ? `
            <button class="mn-edit text-xs px-2.5 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:opacity-80" data-mn-id="${m.id}">
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button class="mn-delete text-xs px-2.5 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:opacity-80" data-mn-id="${m.id}">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderQuiz() {
    if (filtered.length === 0) {
      return `<div class="text-center py-12 text-slate-500">No mnemonics match your current filters. Try adjusting filters.</div>`;
    }
    const m = filtered[quizIndex];
    const style = getTopicStyle(m.topic);
    const topicLabel = getTopicLabel(m.topic);
    const memorized = loadMemorized();
    const isMem = memorized[m.id];

    return `
      <div class="max-w-xl mx-auto">
        <div class="text-center text-sm text-slate-500 mb-4">${quizIndex + 1} of ${filtered.length}</div>

        <div class="border-2 ${style.border} rounded-2xl p-8 bg-white dark:bg-slate-800/80 shadow-lg">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} mb-4">
            ${topicLabel}
          </span>
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed mb-6">${m.concept}</h3>

          ${quizRevealed ? `
            <div class="mt-4 p-4 rounded-xl ${style.bg} border ${style.border}">
              <p class="text-sm font-medium ${style.text} leading-relaxed">${m.mnemonic}</p>
              ${m.detail ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">${m.detail}</p>` : ''}
            </div>
            <div class="flex items-center justify-center gap-3 mt-6">
              <button id="quiz-still-learning" class="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isMem ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 ring-2 ring-amber-300 dark:ring-amber-700'}
                hover:opacity-80">
                <i data-lucide="brain" class="w-4 h-4 inline -mt-0.5 mr-1"></i> Still Learning
              </button>
              <button id="quiz-memorized" class="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isMem ? 'bg-emerald-500 text-white ring-2 ring-emerald-400' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'}
                hover:opacity-80">
                <i data-lucide="check-circle-2" class="w-4 h-4 inline -mt-0.5 mr-1"></i> Memorized
              </button>
            </div>
          ` : `
            <button id="quiz-reveal" class="w-full mt-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:from-violet-600 hover:to-blue-600 transition-all shadow-md">
              Reveal Mnemonic
            </button>
          `}
        </div>

        <div class="flex items-center justify-between mt-6">
          <button id="quiz-prev" class="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:opacity-80 transition-colors ${quizIndex === 0 ? 'opacity-40 pointer-events-none' : ''}">
            <i data-lucide="chevron-left" class="w-4 h-4 inline -mt-0.5"></i> Prev
          </button>
          <button id="quiz-exit" class="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:opacity-80 transition-colors">
            Exit Quiz
          </button>
          <button id="quiz-next" class="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:opacity-80 transition-colors ${quizIndex >= filtered.length - 1 ? 'opacity-40 pointer-events-none' : ''}">
            Next <i data-lucide="chevron-right" class="w-4 h-4 inline -mt-0.5"></i>
          </button>
        </div>
      </div>
    `;
  }

  function renderAddForm() {
    const editing = editingId ? [...loadCustomMnemonics()].find(c => c.id === editingId) : null;
    return `
      <div id="mn-add-form" class="hidden mb-8 border border-violet-300 dark:border-violet-700 rounded-xl p-5 bg-violet-50/50 dark:bg-violet-950/20">
        <h3 class="text-sm font-bold text-violet-700 dark:text-violet-300 mb-4">${editing ? 'Edit' : 'Add'} Custom Mnemonic</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Topic</label>
            <select id="mn-form-topic" class="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              ${TOPICS.map(t => `<option value="${t.id}" ${editing && editing.topic === t.id ? 'selected' : ''}>${t.title}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Concept / Question</label>
            <input id="mn-form-concept" type="text" class="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" placeholder="e.g. PCR steps" value="${editing ? editing.concept.replace(/"/g, '&quot;') : ''}" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Mnemonic / Memory Aid</label>
            <textarea id="mn-form-mnemonic" rows="2" class="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" placeholder="Your clever memory trick...">${editing ? editing.mnemonic : ''}</textarea>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Extra Detail (optional)</label>
            <textarea id="mn-form-detail" rows="2" class="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" placeholder="Additional explanation...">${editing && editing.detail ? editing.detail : ''}</textarea>
          </div>
          <div class="flex gap-2">
            <button id="mn-form-save" class="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors">
              ${editing ? 'Update' : 'Add Mnemonic'}
            </button>
            <button id="mn-form-cancel" class="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:opacity-80 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function fullRender() {
    allMnemonics = getAllMnemonics();
    applyFilters();

    const topicCounts = {};
    allMnemonics.forEach(m => { topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1; });

    return `
      <div class="max-w-4xl mx-auto px-4 py-8">
        <header class="mb-8">
          <a data-route="#/" class="text-sm text-slate-500 hover:text-blue-500 cursor-pointer flex items-center gap-1 mb-4">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
          </a>
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <i data-lucide="lightbulb" class="w-6 h-6 text-amber-600 dark:text-amber-400"></i>
            </div>
            <div>
              <h1 class="text-3xl font-extrabold text-slate-800 dark:text-white">Mnemonics</h1>
              <p class="text-slate-500 text-sm">Memory aids for key bioengineering concepts</p>
            </div>
          </div>
          <div class="mt-4">
            ${renderStats()}
          </div>
        </header>

        <!-- Controls bar -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <!-- Search -->
          <div class="relative flex-1">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input id="mn-search" type="text" placeholder="Search mnemonics..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
              value="${searchQuery}" />
          </div>
          <!-- Buttons -->
          <div class="flex gap-2">
            <button id="mn-quiz-btn" class="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:from-violet-600 hover:to-blue-600 transition-all shadow-sm flex items-center gap-1.5">
              <i data-lucide="brain" class="w-4 h-4"></i> Quiz Me
            </button>
            <button id="mn-add-btn" class="px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 hover:opacity-80 transition-colors flex items-center gap-1.5">
              <i data-lucide="plus" class="w-4 h-4"></i> Add
            </button>
          </div>
        </div>

        <!-- Topic filter -->
        <div class="flex items-center gap-2 flex-wrap mb-4">
          <button class="mn-topic-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedTopic === 'all' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-topic="all">
            All (${allMnemonics.length})
          </button>
          ${TOPICS.map(t => {
            const count = topicCounts[t.id] || 0;
            const isActive = selectedTopic === t.id;
            const ts = getTopicStyle(t.id);
            return `<button class="mn-topic-filter px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive ? ts.bg + ' ' + ts.text + ' ring-1 ' + ts.border : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-topic="${t.id}">
              ${t.title} (${count})
            </button>`;
          }).join('')}
        </div>

        <!-- Status filter -->
        <div class="flex items-center gap-2 mb-6">
          ${['all', 'memorized', 'learning', 'custom'].map(mode => {
            const labels = { all: 'All', memorized: 'Memorized', learning: 'Still Learning', custom: 'Custom Only' };
            const icons = { all: 'list', memorized: 'check-circle-2', learning: 'circle-dashed', custom: 'user' };
            return `<button class="mn-filter-mode px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${filterMode === mode ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-mode="${mode}">
              <i data-lucide="${icons[mode]}" class="w-3 h-3"></i> ${labels[mode]}
            </button>`;
          }).join('')}
        </div>

        <!-- Add form -->
        ${renderAddForm()}

        <!-- Content area -->
        <div id="mn-content">
          ${quizMode ? renderQuiz() : renderCardGrid()}
        </div>
      </div>
    `;
  }

  function renderCardGrid() {
    if (filtered.length === 0) {
      return `
        <div class="text-center py-16">
          <i data-lucide="search-x" class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4"></i>
          <p class="text-slate-500 text-sm">No mnemonics match your filters.</p>
        </div>
      `;
    }
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${filtered.map((m, i) => renderCard(m, i)).join('')}
      </div>
    `;
  }

  function rerender(container) {
    container.innerHTML = fullRender();
    mountHandlers(container);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function mountHandlers(container) {
    // Card flip
    container.querySelectorAll('.mnemonic-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.mn-toggle-mem') || e.target.closest('.mn-edit') || e.target.closest('.mn-delete')) return;
        const answer = card.querySelector('.mnemonic-answer');
        const hint = card.querySelector('.mnemonic-hint');
        const actions = card.querySelector('.mnemonic-actions');
        if (answer) {
          const isHidden = answer.classList.contains('hidden');
          answer.classList.toggle('hidden');
          if (hint) hint.textContent = isHidden ? 'Tap to hide' : 'Tap to reveal';
          if (actions) actions.classList.toggle('hidden', !isHidden);
        }
      });
    });

    // Toggle memorized
    container.querySelectorAll('.mn-toggle-mem').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.mnId;
        const mem = loadMemorized();
        mem[id] = !mem[id];
        if (!mem[id]) delete mem[id];
        saveMemorized(mem);
        rerender(container);
      });
    });

    // Delete custom
    container.querySelectorAll('.mn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.mnId;
        if (!confirm('Delete this custom mnemonic?')) return;
        const customs = loadCustomMnemonics().filter(c => c.id !== id);
        saveCustomMnemonics(customs);
        const mem = loadMemorized();
        delete mem[id];
        saveMemorized(mem);
        rerender(container);
      });
    });

    // Edit custom
    container.querySelectorAll('.mn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        editingId = btn.dataset.mnId;
        rerender(container);
        const form = container.querySelector('#mn-add-form');
        if (form) form.classList.remove('hidden');
        // Populate form with existing data
        const customs = loadCustomMnemonics();
        const item = customs.find(c => c.id === editingId);
        if (item) {
          const topicEl = container.querySelector('#mn-form-topic');
          const conceptEl = container.querySelector('#mn-form-concept');
          const mnemonicEl = container.querySelector('#mn-form-mnemonic');
          const detailEl = container.querySelector('#mn-form-detail');
          if (topicEl) topicEl.value = item.topic;
          if (conceptEl) conceptEl.value = item.concept;
          if (mnemonicEl) mnemonicEl.value = item.mnemonic;
          if (detailEl) detailEl.value = item.detail || '';
        }
      });
    });

    // Search
    const searchInput = container.querySelector('#mn-search');
    if (searchInput) {
      let debounce = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          searchQuery = searchInput.value;
          applyFilters();
          const content = container.querySelector('#mn-content');
          if (content) {
            content.innerHTML = quizMode ? renderQuiz() : renderCardGrid();
            mountCardHandlers(container);
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }
        }, 200);
      });
    }

    // Topic filter buttons
    container.querySelectorAll('.mn-topic-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedTopic = btn.dataset.topic;
        rerender(container);
      });
    });

    // Status filter buttons
    container.querySelectorAll('.mn-filter-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        filterMode = btn.dataset.mode;
        rerender(container);
      });
    });

    // Quiz button
    const quizBtn = container.querySelector('#mn-quiz-btn');
    if (quizBtn) {
      quizBtn.addEventListener('click', () => {
        quizMode = true;
        quizIndex = 0;
        quizRevealed = false;
        applyFilters();
        // Shuffle filtered for quiz
        for (let i = filtered.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        rerender(container);
      });
    }

    // Add button
    const addBtn = container.querySelector('#mn-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        editingId = null;
        const form = container.querySelector('#mn-add-form');
        if (form) {
          form.classList.toggle('hidden');
          if (!form.classList.contains('hidden')) {
            container.querySelector('#mn-form-concept').value = '';
            container.querySelector('#mn-form-mnemonic').value = '';
            container.querySelector('#mn-form-detail').value = '';
            container.querySelector('#mn-form-concept').focus();
          }
        }
      });
    }

    // Form save
    const saveBtn = container.querySelector('#mn-form-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const topic = container.querySelector('#mn-form-topic').value;
        const concept = container.querySelector('#mn-form-concept').value.trim();
        const mnemonic = container.querySelector('#mn-form-mnemonic').value.trim();
        const detail = container.querySelector('#mn-form-detail').value.trim();
        if (!concept || !mnemonic) { alert('Concept and mnemonic are required.'); return; }

        const customs = loadCustomMnemonics();
        if (editingId) {
          const idx = customs.findIndex(c => c.id === editingId);
          if (idx >= 0) {
            customs[idx] = { ...customs[idx], topic, concept, mnemonic, detail };
          }
          editingId = null;
        } else {
          customs.push({ id: 'custom-' + Date.now(), topic, concept, mnemonic, detail });
        }
        saveCustomMnemonics(customs);
        rerender(container);
      });
    }

    // Form cancel
    const cancelBtn = container.querySelector('#mn-form-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        editingId = null;
        const form = container.querySelector('#mn-add-form');
        if (form) form.classList.add('hidden');
      });
    }

    // Quiz handlers
    mountQuizHandlers(container);
  }

  function mountCardHandlers(container) {
    container.querySelectorAll('.mnemonic-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.mn-toggle-mem') || e.target.closest('.mn-edit') || e.target.closest('.mn-delete')) return;
        const answer = card.querySelector('.mnemonic-answer');
        const hint = card.querySelector('.mnemonic-hint');
        const actions = card.querySelector('.mnemonic-actions');
        if (answer) {
          const isHidden = answer.classList.contains('hidden');
          answer.classList.toggle('hidden');
          if (hint) hint.textContent = isHidden ? 'Tap to hide' : 'Tap to reveal';
          if (actions) actions.classList.toggle('hidden', !isHidden);
        }
      });
    });

    container.querySelectorAll('.mn-toggle-mem').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.mnId;
        const mem = loadMemorized();
        mem[id] = !mem[id];
        if (!mem[id]) delete mem[id];
        saveMemorized(mem);
        rerender(container);
      });
    });

    container.querySelectorAll('.mn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.mnId;
        if (!confirm('Delete this custom mnemonic?')) return;
        const customs = loadCustomMnemonics().filter(c => c.id !== id);
        saveCustomMnemonics(customs);
        rerender(container);
      });
    });

    container.querySelectorAll('.mn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        editingId = btn.dataset.mnId;
        rerender(container);
        const form = container.querySelector('#mn-add-form');
        if (form) form.classList.remove('hidden');
      });
    });
  }

  function mountQuizHandlers(container) {
    const revealBtn = container.querySelector('#quiz-reveal');
    if (revealBtn) {
      revealBtn.addEventListener('click', () => {
        quizRevealed = true;
        const content = container.querySelector('#mn-content');
        if (content) {
          content.innerHTML = renderQuiz();
          mountQuizHandlers(container);
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      });
    }

    const memBtn = container.querySelector('#quiz-memorized');
    if (memBtn) {
      memBtn.addEventListener('click', () => {
        const m = filtered[quizIndex];
        if (m) {
          const mem = loadMemorized();
          mem[m.id] = true;
          saveMemorized(mem);
        }
        advanceQuiz(container);
      });
    }

    const learnBtn = container.querySelector('#quiz-still-learning');
    if (learnBtn) {
      learnBtn.addEventListener('click', () => {
        const m = filtered[quizIndex];
        if (m) {
          const mem = loadMemorized();
          delete mem[m.id];
          saveMemorized(mem);
        }
        advanceQuiz(container);
      });
    }

    const prevBtn = container.querySelector('#quiz-prev');
    if (prevBtn && quizIndex > 0) {
      prevBtn.addEventListener('click', () => {
        quizIndex--;
        quizRevealed = false;
        const content = container.querySelector('#mn-content');
        if (content) {
          content.innerHTML = renderQuiz();
          mountQuizHandlers(container);
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      });
    }

    const nextBtn = container.querySelector('#quiz-next');
    if (nextBtn && quizIndex < filtered.length - 1) {
      nextBtn.addEventListener('click', () => {
        quizIndex++;
        quizRevealed = false;
        const content = container.querySelector('#mn-content');
        if (content) {
          content.innerHTML = renderQuiz();
          mountQuizHandlers(container);
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      });
    }

    const exitBtn = container.querySelector('#quiz-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        quizMode = false;
        rerender(container);
      });
    }
  }

  function advanceQuiz(container) {
    if (quizIndex < filtered.length - 1) {
      quizIndex++;
      quizRevealed = false;
    } else {
      // Quiz complete
      quizMode = false;
      rerender(container);
      return;
    }
    const content = container.querySelector('#mn-content');
    if (content) {
      content.innerHTML = renderQuiz();
      mountQuizHandlers(container);
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  return {
    render() {
      allMnemonics = getAllMnemonics();
      applyFilters();
      return fullRender();
    },

    mount(container) {
      mountHandlers(container);
    }
  };
}
