/**
 * HTGAA Week 2 — Reading Frame Explorer
 * Interactive widget showing how reading frames affect protein translation.
 */

function initReadingFrame(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  // Standard genetic code
  const codonTable = {
    'UUU':'Phe','UUC':'Phe','UUA':'Leu','UUG':'Leu',
    'CUU':'Leu','CUC':'Leu','CUA':'Leu','CUG':'Leu',
    'AUU':'Ile','AUC':'Ile','AUA':'Ile','AUG':'Met',
    'GUU':'Val','GUC':'Val','GUA':'Val','GUG':'Val',
    'UCU':'Ser','UCC':'Ser','UCA':'Ser','UCG':'Ser',
    'CCU':'Pro','CCC':'Pro','CCA':'Pro','CCG':'Pro',
    'ACU':'Thr','ACC':'Thr','ACA':'Thr','ACG':'Thr',
    'GCU':'Ala','GCC':'Ala','GCA':'Ala','GCG':'Ala',
    'UAU':'Tyr','UAC':'Tyr','UAA':'Stop','UAG':'Stop',
    'CAU':'His','CAC':'His','CAA':'Gln','CAG':'Gln',
    'AAU':'Asn','AAC':'Asn','AAA':'Lys','AAG':'Lys',
    'GAU':'Asp','GAC':'Asp','GAA':'Glu','GAG':'Glu',
    'UGU':'Cys','UGC':'Cys','UGA':'Stop','UGG':'Trp',
    'CGU':'Arg','CGC':'Arg','CGA':'Arg','CGG':'Arg',
    'AGU':'Ser','AGC':'Ser','AGA':'Arg','AGG':'Arg',
    'GGU':'Gly','GGC':'Gly','GGA':'Gly','GGG':'Gly',
  };

  const dnaToRna = { 'A':'A', 'T':'U', 'G':'G', 'C':'C' };

  // Example sequences
  const sequences = {
    'insulin': { name: 'Human Insulin (B chain start)', dna: 'ATGTTCGTCAACCAACACCTGTGCGGCTCACAC' },
    'gfp':     { name: 'GFP (start)', dna: 'ATGAGTAAAGGAGAAGAACTTTTCACTGGAGTT' },
    'custom':  { name: 'Custom', dna: 'ATGAAAGCGATCTTCACCGCGCTGGAATACGGT' },
  };

  let currentDna = sequences.insulin.dna;
  let frame = 0;

  const baseColors = { 'A': '#ef4444', 'T': '#3b82f6', 'U': '#3b82f6', 'G': '#10b981', 'C': '#f59e0b' };

  el.innerHTML = `
    <div class="flex flex-col gap-4">
      <!-- Sequence selector -->
      <div class="flex items-center gap-2 flex-wrap">
        <label class="text-xs font-semibold text-slate-500">Sequence:</label>
        ${Object.entries(sequences).map(([key, s]) => `
          <button class="rf-seq-btn px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${key === 'insulin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}" data-seq="${key}">${s.name}</button>
        `).join('')}
      </div>

      <!-- Frame selector -->
      <div class="flex items-center gap-3">
        <label class="text-xs font-semibold text-slate-500">Reading Frame:</label>
        <div class="flex gap-1">
          ${[0, 1, 2].map(f => `
            <button class="rf-frame-btn w-10 h-8 rounded-lg text-xs font-bold transition-all ${f === 0 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'}" data-frame="${f}">+${f}</button>
          `).join('')}
        </div>
        <span class="text-xs text-slate-400 ml-2" id="rf-frame-info">Starting at position 1</span>
      </div>

      <!-- DNA/RNA/Protein display -->
      <div id="rf-display" class="overflow-x-auto"></div>

      <!-- Protein output -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <h4 class="text-xs font-bold text-slate-500 mb-2">Translated Protein</h4>
        <p id="rf-protein" class="font-mono text-sm font-bold tracking-wider"></p>
        <p id="rf-note" class="text-xs text-slate-400 mt-2"></p>
      </div>
    </div>
  `;

  const displayEl = el.querySelector('#rf-display');
  const proteinEl = el.querySelector('#rf-protein');
  const noteEl = el.querySelector('#rf-note');
  const frameInfo = el.querySelector('#rf-frame-info');

  function render() {
    const rna = currentDna.split('').map(b => dnaToRna[b] || b).join('');
    const codons = [];
    let protein = '';
    let hitStop = false;

    // Extract codons from frame offset
    for (let i = frame; i + 2 < rna.length; i += 3) {
      const codon = rna[i] + rna[i + 1] + rna[i + 2];
      const aa = codonTable[codon] || '?';
      codons.push({ codon, aa, start: i });
      if (aa === 'Stop') { hitStop = true; break; }
      protein += aa === 'Met' ? 'M' : aa.charAt(0);
    }

    // Build display
    let html = `<div class="font-mono text-xs leading-loose">`;

    // DNA row
    html += `<div class="flex items-center gap-0.5 mb-1"><span class="w-12 text-right text-slate-400 font-semibold mr-2">DNA</span>`;
    html += `<span class="text-slate-300 dark:text-slate-600">${'·'.repeat(frame)}</span>`;
    currentDna.split('').forEach((base, i) => {
      if (i < frame) return;
      const codonIdx = Math.floor((i - frame) / 3);
      const inCodon = (i - frame) % 3 === 0 && codons[codonIdx];
      const isFirst = (i - frame) % 3 === 0;
      html += `<span class="inline-block w-5 text-center font-bold ${isFirst && i > frame ? 'ml-1' : ''}" style="color:${baseColors[base]}">${base}</span>`;
    });
    html += `</div>`;

    // mRNA row
    html += `<div class="flex items-center gap-0.5 mb-1"><span class="w-12 text-right text-slate-400 font-semibold mr-2">mRNA</span>`;
    html += `<span class="text-slate-300 dark:text-slate-600">${'·'.repeat(frame)}</span>`;
    rna.split('').forEach((base, i) => {
      if (i < frame) return;
      const isFirst = (i - frame) % 3 === 0;
      html += `<span class="inline-block w-5 text-center ${isFirst && i > frame ? 'ml-1' : ''}" style="color:${baseColors[base]}80">${base}</span>`;
    });
    html += `</div>`;

    // Amino acid row
    html += `<div class="flex items-center gap-0.5"><span class="w-12 text-right text-slate-400 font-semibold mr-2">AA</span>`;
    html += `<span class="text-transparent">${'·'.repeat(frame)}</span>`;
    codons.forEach((c, idx) => {
      const bgColor = c.aa === 'Met' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        : c.aa === 'Stop' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      html += `<span class="inline-block text-center font-bold rounded px-0.5 ${bgColor} ${idx > 0 ? 'ml-1' : ''}" style="min-width:3.75rem">${c.aa === 'Stop' ? '■' : c.aa}</span>`;
    });
    html += `</div>`;
    html += `</div>`;

    displayEl.innerHTML = html;

    // Protein string
    proteinEl.textContent = protein || '(no protein)';
    const startCodon = codons.find(c => c.aa === 'Met');
    if (!startCodon && frame !== 0) {
      noteEl.textContent = 'No start codon (ATG/AUG) in this frame — translation would not initiate.';
    } else if (hitStop) {
      noteEl.textContent = `Stop codon found → ${codons.length - 1} amino acid polypeptide.`;
    } else {
      noteEl.textContent = `${codons.length} codons read (sequence truncated — no stop codon in view).`;
    }
    frameInfo.textContent = `Starting at position ${frame + 1}`;
  }

  // Sequence buttons
  el.querySelectorAll('.rf-seq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.rf-seq-btn').forEach(b => b.className = 'rf-seq-btn px-2.5 py-1 rounded-lg text-xs font-medium transition-colors bg-slate-100 dark:bg-slate-700 text-slate-500');
      btn.className = 'rf-seq-btn px-2.5 py-1 rounded-lg text-xs font-medium transition-colors bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      currentDna = sequences[btn.dataset.seq].dna;
      render();
    });
  });

  // Frame buttons
  el.querySelectorAll('.rf-frame-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.rf-frame-btn').forEach(b => b.className = 'rf-frame-btn w-10 h-8 rounded-lg text-xs font-bold transition-all bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200');
      btn.className = 'rf-frame-btn w-10 h-8 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white shadow-md';
      frame = parseInt(btn.dataset.frame);
      render();
    });
  });

  render();
}

export { initReadingFrame };
