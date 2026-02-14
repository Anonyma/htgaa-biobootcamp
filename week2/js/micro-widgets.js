/**
 * HTGAA Week 2 — Micro-Widgets Module
 * Interactive educational micro-widgets that enhance topic pages.
 * Each widget is self-contained, responsive, dark-mode aware, and uses
 * D3.js v7 for visualizations where appropriate.
 *
 * Widgets:
 *   1. Phred Score Calculator
 *   2. Sequencing Cost Timeline Slider
 *   3. DNA -> RNA -> Protein Translator
 *   4. Coverage Calculator
 *   5. Read Length Comparison (animated bar chart)
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isDark() {
  return document.documentElement.classList.contains('dark');
}

function colors() {
  const dark = isDark();
  return {
    bg: dark ? '#1e293b' : '#f8fafc',
    cardBg: dark ? '#0f172a' : '#ffffff',
    border: dark ? '#334155' : '#e2e8f0',
    text: dark ? '#e2e8f0' : '#1e293b',
    textMuted: dark ? '#94a3b8' : '#64748b',
    textFaint: dark ? '#475569' : '#cbd5e1',
    accent: '#3b82f6',
    accentLight: dark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',
    green: '#10b981',
    greenLight: dark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)',
    red: '#ef4444',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    baseA: '#22c55e',
    baseT: '#ef4444',
    baseG: '#3b82f6',
    baseC: '#f59e0b',
    baseU: '#f97316',
  };
}

/** Create a widget wrapper div with consistent styling. */
function createWidgetContainer(title, iconName, id) {
  const div = document.createElement('div');
  div.className = 'sim-container micro-widget my-6';
  div.id = id;
  div.innerHTML = `
    <h3 class="flex items-center gap-2 mb-4">
      <i data-lucide="${iconName}" class="w-5 h-5 text-blue-500"></i>
      <span class="font-bold">${title}</span>
    </h3>
    <div class="widget-body"></div>
  `;
  return div;
}

/** Insert a widget after the first element that matches a keyword near an h4. */
function insertNearKeyword(container, widget, keywords) {
  // First check for explicit data-widget placeholders
  const placeholder = container.querySelector(`[data-micro-widget="${widget.id}"]`);
  if (placeholder) {
    placeholder.appendChild(widget);
    return true;
  }

  // Scan h4 headers and surrounding text for keyword matches
  const headers = container.querySelectorAll('h4, h3, h2');
  for (const header of headers) {
    let sectionText = header.textContent.toLowerCase();
    let sibling = header.nextElementSibling;
    let count = 0;
    while (sibling && count < 5 && !/^H[234]$/.test(sibling.tagName)) {
      sectionText += ' ' + sibling.textContent.toLowerCase();
      sibling = sibling.nextElementSibling;
      count++;
    }

    const matched = keywords.some(kw => sectionText.includes(kw.toLowerCase()));
    if (matched) {
      // Insert after the header's next sibling (first paragraph)
      const insertAfter = header.nextElementSibling || header;
      insertAfter.parentNode.insertBefore(widget, insertAfter.nextSibling);
      return true;
    }
  }
  return false;
}


// ---------------------------------------------------------------------------
// 1. Phred Score Calculator
// ---------------------------------------------------------------------------

function createPhredCalculator() {
  const widget = createWidgetContainer('Phred Score Calculator', 'gauge', 'mw-phred-calc');
  const body = widget.querySelector('.widget-body');
  const c = colors();

  body.innerHTML = `
    <p class="text-sm mb-4" style="color:${c.textMuted}">
      Phred quality scores quantify sequencing accuracy. A Phred score of <strong>Q</strong> means the probability of an incorrect base call is 10<sup>-Q/10</sup>.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 items-start">
      <div class="flex-shrink-0">
        <label class="block text-xs font-semibold mb-1" style="color:${c.textMuted}">Phred Score (Q)</label>
        <div class="flex items-center gap-2">
          <input type="range" min="1" max="60" value="30" class="phred-slider" style="width:160px;accent-color:${c.accent}">
          <input type="number" min="1" max="60" value="30" class="phred-input"
            style="width:60px;padding:4px 8px;border:1px solid ${c.border};border-radius:6px;background:${c.cardBg};color:${c.text};text-align:center;font-weight:700;font-size:1.1rem">
        </div>
      </div>
      <div class="flex-1 w-full">
        <div class="phred-results grid grid-cols-3 gap-3 text-center"></div>
        <div class="phred-meter-wrap mt-4" style="position:relative;height:28px;border-radius:14px;overflow:hidden;background:${c.textFaint}">
          <div class="phred-meter-fill" style="height:100%;border-radius:14px;transition:width 0.4s ease, background 0.4s ease"></div>
          <div class="phred-meter-label" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.3)"></div>
        </div>
        <div class="flex justify-between text-xs mt-1" style="color:${c.textFaint}">
          <span>Poor</span><span>Low</span><span>Medium</span><span>High</span><span>Excellent</span>
        </div>
      </div>
    </div>
  `;

  const slider = body.querySelector('.phred-slider');
  const numInput = body.querySelector('.phred-input');
  const results = body.querySelector('.phred-results');
  const meterFill = body.querySelector('.phred-meter-fill');
  const meterLabel = body.querySelector('.phred-meter-label');

  function update(q) {
    q = Math.max(1, Math.min(60, parseInt(q) || 1));
    slider.value = q;
    numInput.value = q;

    const errorProb = Math.pow(10, -q / 10);
    const accuracy = (1 - errorProb) * 100;
    const errorsPerKb = errorProb * 1000;

    const c = colors();
    results.innerHTML = `
      <div style="padding:10px;border-radius:10px;border:1px solid ${c.border};background:${c.cardBg}">
        <div class="text-xs" style="color:${c.textMuted}">Error Probability</div>
        <div class="text-lg font-extrabold" style="color:${c.red}">${errorProb < 0.001 ? errorProb.toExponential(1) : errorProb.toFixed(4)}</div>
      </div>
      <div style="padding:10px;border-radius:10px;border:1px solid ${c.border};background:${c.cardBg}">
        <div class="text-xs" style="color:${c.textMuted}">Accuracy</div>
        <div class="text-lg font-extrabold" style="color:${c.green}">${accuracy >= 99.99 ? accuracy.toFixed(4) : accuracy.toFixed(2)}%</div>
      </div>
      <div style="padding:10px;border-radius:10px;border:1px solid ${c.border};background:${c.cardBg}">
        <div class="text-xs" style="color:${c.textMuted}">Errors per 1kb</div>
        <div class="text-lg font-extrabold" style="color:${c.yellow}">${errorsPerKb < 0.01 ? errorsPerKb.toExponential(1) : errorsPerKb.toFixed(2)}</div>
      </div>
    `;

    // Meter
    const pct = Math.min(100, (q / 50) * 100);
    let meterColor;
    if (q < 10) meterColor = '#ef4444';
    else if (q < 20) meterColor = '#f97316';
    else if (q < 30) meterColor = '#f59e0b';
    else if (q < 40) meterColor = '#22c55e';
    else meterColor = '#10b981';

    meterFill.style.width = pct + '%';
    meterFill.style.background = `linear-gradient(90deg, ${meterColor}, ${meterColor}dd)`;

    let qualLabel;
    if (q < 10) qualLabel = 'Poor quality';
    else if (q < 20) qualLabel = 'Low quality';
    else if (q < 30) qualLabel = 'Medium quality';
    else if (q < 40) qualLabel = 'High quality (Illumina typical)';
    else qualLabel = 'Excellent quality';
    meterLabel.textContent = `Q${q} - ${qualLabel}`;
  }

  slider.addEventListener('input', () => update(slider.value));
  numInput.addEventListener('input', () => update(numInput.value));
  update(30);

  return widget;
}


// ---------------------------------------------------------------------------
// 2. Sequencing Cost Timeline Slider
// ---------------------------------------------------------------------------

function createCostSlider() {
  const widget = createWidgetContainer('Sequencing Cost Explorer', 'trending-down', 'mw-cost-slider');
  const body = widget.querySelector('.widget-body');

  // Data
  const costData = [
    { year: 2001, cost: 100000000, event: 'Human Genome Project era' },
    { year: 2002, cost: 70000000, event: '' },
    { year: 2003, cost: 50000000, event: 'HGP completed' },
    { year: 2004, cost: 20000000, event: '' },
    { year: 2005, cost: 14000000, event: '' },
    { year: 2006, cost: 10000000, event: '454 Life Sciences GS20' },
    { year: 2007, cost: 8000000, event: 'Illumina Genome Analyzer' },
    { year: 2008, cost: 1500000, event: 'NGS price crash begins' },
    { year: 2009, cost: 100000, event: '' },
    { year: 2010, cost: 50000, event: '' },
    { year: 2011, cost: 10000, event: 'HiSeq 2000' },
    { year: 2012, cost: 7000, event: '' },
    { year: 2013, cost: 5000, event: '' },
    { year: 2014, cost: 1000, event: 'HiSeq X Ten ($1000 genome)' },
    { year: 2015, cost: 1500, event: '' },
    { year: 2016, cost: 1100, event: '' },
    { year: 2017, cost: 1000, event: '' },
    { year: 2018, cost: 800, event: '' },
    { year: 2019, cost: 600, event: 'NovaSeq 6000' },
    { year: 2020, cost: 500, event: '' },
    { year: 2021, cost: 400, event: '' },
    { year: 2022, cost: 200, event: 'Ultima Genomics, Element Bio' },
    { year: 2023, cost: 200, event: '' },
    { year: 2024, cost: 150, event: '$100 genome approaching' },
  ];

  const c = colors();

  body.innerHTML = `
    <p class="text-sm mb-3" style="color:${c.textMuted}">
      Drag the slider to explore how sequencing costs plummeted faster than Moore's Law.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 items-start">
      <div class="flex-1 w-full">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-xs font-semibold" style="color:${c.textMuted}">2001</span>
          <input type="range" min="0" max="${costData.length - 1}" value="0" class="cost-year-slider flex-1" style="accent-color:${c.accent}">
          <span class="text-xs font-semibold" style="color:${c.textMuted}">2024</span>
        </div>
        <div class="cost-display text-center mb-3"></div>
        <div class="cost-bar-area" style="height:180px;position:relative"></div>
        <div class="cost-legend flex items-center justify-center gap-6 mt-3 text-xs" style="color:${c.textMuted}">
          <span class="flex items-center gap-1"><span style="display:inline-block;width:12px;height:3px;background:${c.accent};border-radius:2px"></span> Sequencing cost</span>
          <span class="flex items-center gap-1"><span style="display:inline-block;width:12px;height:3px;background:${c.textFaint};border-radius:2px;border-bottom:2px dashed ${c.textMuted}"></span> Moore's Law</span>
        </div>
      </div>
    </div>
  `;

  const slider = body.querySelector('.cost-year-slider');
  const display = body.querySelector('.cost-display');
  const barArea = body.querySelector('.cost-bar-area');

  function mooresCost(year) {
    return 100000000 * Math.pow(0.5, (year - 2001) / 1.5);
  }

  function update(idx) {
    idx = Math.max(0, Math.min(costData.length - 1, parseInt(idx)));
    const entry = costData[idx];
    const c = colors();

    // Cost display
    const costStr = entry.cost >= 1000000
      ? '$' + (entry.cost / 1000000).toFixed(0) + 'M'
      : entry.cost >= 1000
        ? '$' + (entry.cost / 1000).toFixed(0) + 'K'
        : '$' + entry.cost;

    const mooreCost = mooresCost(entry.year);
    const mooreStr = mooreCost >= 1000000
      ? '$' + (mooreCost / 1000000).toFixed(1) + 'M'
      : mooreCost >= 1000
        ? '$' + (mooreCost / 1000).toFixed(1) + 'K'
        : '$' + mooreCost.toFixed(0);

    const fasterThanMoore = entry.cost < mooreCost;

    display.innerHTML = `
      <div class="flex items-center justify-center gap-4 flex-wrap">
        <div>
          <div class="text-3xl font-extrabold" style="color:${c.text}">${entry.year}</div>
        </div>
        <div style="padding:8px 16px;border-radius:10px;background:${c.accentLight};border:1px solid ${c.accent}40">
          <div class="text-xs" style="color:${c.textMuted}">Cost per Genome</div>
          <div class="text-xl font-extrabold" style="color:${c.accent}">${costStr}</div>
        </div>
        <div style="padding:8px 16px;border-radius:10px;background:${c.cardBg};border:1px solid ${c.border}">
          <div class="text-xs" style="color:${c.textMuted}">Moore's Law would predict</div>
          <div class="text-lg font-bold" style="color:${c.textMuted}">${mooreStr}</div>
        </div>
      </div>
      ${entry.event ? `<div class="mt-2 text-xs font-semibold" style="color:${c.accent}">${entry.event}</div>` : ''}
      ${fasterThanMoore ? `<div class="mt-1 text-xs" style="color:${c.green}">Sequencing cost is below Moore's Law prediction</div>` : ''}
    `;

    // Log-scale bar chart comparing actual vs Moore's Law
    const maxLog = Math.log10(100000000);
    const minLog = Math.log10(50);
    const range = maxLog - minLog;

    const actualPct = ((Math.log10(Math.max(entry.cost, 50)) - minLog) / range) * 100;
    const moorePct = ((Math.log10(Math.max(mooreCost, 50)) - minLog) / range) * 100;

    barArea.innerHTML = `
      <div style="position:absolute;bottom:0;left:0;right:0;display:flex;align-items:flex-end;justify-content:center;gap:24px;height:100%">
        <div style="text-align:center;flex:0 0 80px">
          <div style="width:60px;margin:0 auto;background:linear-gradient(to top, ${c.accent}, ${c.accent}aa);border-radius:6px 6px 0 0;transition:height 0.5s ease;height:${actualPct}%"></div>
          <div class="text-xs mt-1 font-semibold" style="color:${c.accent}">Actual</div>
          <div class="text-xs" style="color:${c.textMuted}">${costStr}</div>
        </div>
        <div style="text-align:center;flex:0 0 80px">
          <div style="width:60px;margin:0 auto;background:linear-gradient(to top, ${c.textFaint}, ${c.textFaint}88);border-radius:6px 6px 0 0;transition:height 0.5s ease;height:${moorePct}%;border:2px dashed ${c.textMuted}"></div>
          <div class="text-xs mt-1 font-semibold" style="color:${c.textMuted}">Moore's Law</div>
          <div class="text-xs" style="color:${c.textMuted}">${mooreStr}</div>
        </div>
      </div>
      <div style="position:absolute;top:0;left:0;bottom:0;width:1px">
        ${[100000000, 10000000, 1000000, 100000, 10000, 1000, 100].map(v => {
          const pct = ((Math.log10(v) - minLog) / range) * 100;
          const label = v >= 1000000 ? '$' + v / 1000000 + 'M' : v >= 1000 ? '$' + v / 1000 + 'K' : '$' + v;
          return `<div style="position:absolute;bottom:${pct}%;left:0;right:-200px;display:flex;align-items:center;gap:4px">
            <div style="width:200px;height:1px;background:${c.border};opacity:0.4"></div>
            <span style="font-size:9px;color:${c.textFaint};white-space:nowrap">${label}</span>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  slider.addEventListener('input', () => update(slider.value));
  update(0);

  return widget;
}


// ---------------------------------------------------------------------------
// 3. DNA -> RNA -> Protein Translator
// ---------------------------------------------------------------------------

function createDnaTranslator() {
  const widget = createWidgetContainer('DNA \u2192 RNA \u2192 Protein Translator', 'dna', 'mw-dna-translator');
  const body = widget.querySelector('.widget-body');
  const c = colors();

  const codonTable = {
    UUU:'Phe',UUC:'Phe',UUA:'Leu',UUG:'Leu',CUU:'Leu',CUC:'Leu',CUA:'Leu',CUG:'Leu',
    AUU:'Ile',AUC:'Ile',AUA:'Ile',AUG:'Met',GUU:'Val',GUC:'Val',GUA:'Val',GUG:'Val',
    UCU:'Ser',UCC:'Ser',UCA:'Ser',UCG:'Ser',CCU:'Pro',CCC:'Pro',CCA:'Pro',CCG:'Pro',
    ACU:'Thr',ACC:'Thr',ACA:'Thr',ACG:'Thr',GCU:'Ala',GCC:'Ala',GCA:'Ala',GCG:'Ala',
    UAU:'Tyr',UAC:'Tyr',UAA:'Stop',UAG:'Stop',CAU:'His',CAC:'His',CAA:'Gln',CAG:'Gln',
    AAU:'Asn',AAC:'Asn',AAA:'Lys',AAG:'Lys',GAU:'Asp',GAC:'Asp',GAA:'Glu',GAG:'Glu',
    UGU:'Cys',UGC:'Cys',UGA:'Stop',UGG:'Trp',CGU:'Arg',CGC:'Arg',CGA:'Arg',CGG:'Arg',
    AGU:'Ser',AGC:'Ser',AGA:'Arg',AGG:'Arg',GGU:'Gly',GGC:'Gly',GGA:'Gly',GGG:'Gly'
  };

  const aaColors = {
    Met:'#9b59b6', Phe:'#5b7fd9', Leu:'#4a90d9', Ile:'#4a88cc', Val:'#3d7fc2',
    Ser:'#2ecc71', Pro:'#1abc9c', Thr:'#27ae60', Ala:'#16a085',
    Tyr:'#82c91e', His:'#d63384', Gln:'#6f42c1', Asn:'#198754', Cys:'#20c997',
    Trp:'#6610f2', Arg:'#dc3545', Lys:'#e74c3c', Asp:'#fd7e14', Glu:'#ffc107',
    Gly:'#6c757d', Stop:'#555',
  };

  body.innerHTML = `
    <p class="text-sm mb-3" style="color:${c.textMuted}">
      Type a DNA sequence (5' to 3', up to 30 bp) to see transcription and translation in real-time.
    </p>
    <div class="mb-3">
      <label class="block text-xs font-semibold mb-1" style="color:${c.textMuted}">DNA sequence (coding strand, 5' \u2192 3')</label>
      <div class="flex gap-2 items-center">
        <input type="text" class="dna-input flex-1" value="ATGAAAGCTTACGAA"
          maxlength="30" spellcheck="false" autocomplete="off"
          placeholder="e.g. ATGAAAGCTTACGAA"
          style="padding:8px 12px;border:2px solid ${c.border};border-radius:8px;background:${c.cardBg};color:${c.text};font-family:monospace;font-size:1rem;letter-spacing:2px;text-transform:uppercase">
        <button class="dna-random-btn" style="padding:6px 12px;border-radius:8px;border:1px solid ${c.border};background:${c.cardBg};color:${c.textMuted};cursor:pointer;font-size:12px;white-space:nowrap" title="Random sequence">Random</button>
      </div>
    </div>
    <div class="dna-output space-y-3"></div>
    <div class="dna-codon-detail mt-3" style="min-height:24px"></div>
  `;

  const input = body.querySelector('.dna-input');
  const output = body.querySelector('.dna-output');
  const detail = body.querySelector('.dna-codon-detail');
  const randomBtn = body.querySelector('.dna-random-btn');

  function baseColor(base) {
    const map = { A: colors().baseA, T: colors().baseT, G: colors().baseG, C: colors().baseC, U: colors().baseU };
    return map[base.toUpperCase()] || colors().textMuted;
  }

  function colorBase(base, label) {
    return `<span style="color:${baseColor(base)};font-weight:700">${base}</span>`;
  }

  function renderOutput(dna) {
    const c = colors();
    dna = dna.toUpperCase().replace(/[^ATGC]/g, '');
    if (dna.length === 0) {
      output.innerHTML = `<p class="text-xs italic" style="color:${c.textFaint}">Enter a valid DNA sequence using A, T, G, C</p>`;
      detail.innerHTML = '';
      return;
    }

    // Transcription: DNA coding -> mRNA (T -> U)
    const mRNA = dna.replace(/T/g, 'U');

    // Template strand (complement of coding, read 3'->5')
    const complement = { A: 'T', T: 'A', G: 'C', C: 'G' };
    const template = dna.split('').map(b => complement[b] || '?').join('');

    // Translation (read mRNA in codons)
    const codons = [];
    for (let i = 0; i + 2 < mRNA.length; i += 3) {
      codons.push(mRNA.slice(i, i + 3));
    }
    const aminoAcids = codons.map(codon => codonTable[codon] || '???');

    // Render colored bases
    const dnaColored = dna.split('').map(b => colorBase(b)).join('');
    const templateColored = template.split('').map(b => colorBase(b)).join('');
    const mrnaColored = mRNA.split('').map(b => colorBase(b)).join('');

    // Codon-grouped mRNA
    const codonGrouped = codons.map((codon, i) => {
      const aa = aminoAcids[i];
      const bgColor = aaColors[aa] || c.textFaint;
      const bases = codon.split('').map(b => colorBase(b)).join('');
      return `<span class="dna-codon-group" data-codon-idx="${i}"
        style="display:inline-block;padding:2px 4px;margin:1px;border-radius:4px;border-bottom:3px solid ${bgColor};cursor:pointer;transition:background 0.15s"
        onmouseenter="this.style.background='${bgColor}22'"
        onmouseleave="this.style.background='transparent'">${bases}</span>`;
    }).join('');

    // Amino acid chain
    const aaChain = aminoAcids.map((aa, i) => {
      const bgColor = aaColors[aa] || '#777';
      if (aa === 'Stop') {
        return `<span class="dna-aa-badge" data-codon-idx="${i}" style="display:inline-block;padding:2px 8px;margin:2px;border-radius:6px;background:${bgColor};color:white;font-size:11px;font-weight:700;cursor:pointer">STOP</span>`;
      }
      return `<span class="dna-aa-badge" data-codon-idx="${i}" style="display:inline-block;padding:2px 8px;margin:2px;border-radius:6px;background:${bgColor};color:white;font-size:11px;font-weight:700;cursor:pointer">${aa}</span>`;
    }).join('');

    // Remaining bases that don't form a complete codon
    const remainder = mRNA.length % 3;
    const remainderNote = remainder > 0 ? `<span class="text-xs italic" style="color:${c.textFaint}"> (+${remainder} leftover base${remainder > 1 ? 's' : ''})</span>` : '';

    output.innerHTML = `
      <div style="overflow-x:auto">
        <table style="border-collapse:collapse;font-family:monospace;font-size:0.85rem;line-height:1.8">
          <tr>
            <td style="padding-right:8px;font-size:10px;font-weight:700;color:${c.textMuted};vertical-align:middle;white-space:nowrap">5' DNA</td>
            <td style="letter-spacing:2px">${dnaColored}</td>
            <td style="padding-left:4px;font-size:10px;color:${c.textMuted}">3'</td>
          </tr>
          <tr>
            <td style="padding-right:8px;font-size:10px;font-weight:700;color:${c.textMuted};vertical-align:middle;white-space:nowrap">3' Template</td>
            <td style="letter-spacing:2px;opacity:0.6">${templateColored}</td>
            <td style="padding-left:4px;font-size:10px;color:${c.textMuted}">5'</td>
          </tr>
          <tr><td colspan="3" style="height:4px"></td></tr>
          <tr>
            <td style="padding-right:8px;font-size:10px;font-weight:700;color:${c.textMuted};vertical-align:middle;white-space:nowrap">5' mRNA</td>
            <td>${codonGrouped}${remainderNote}</td>
            <td style="padding-left:4px;font-size:10px;color:${c.textMuted}">3'</td>
          </tr>
          <tr><td colspan="3" style="height:4px"></td></tr>
          <tr>
            <td style="padding-right:8px;font-size:10px;font-weight:700;color:${c.textMuted};vertical-align:middle;white-space:nowrap">Protein</td>
            <td colspan="2">${aaChain}</td>
          </tr>
        </table>
      </div>
    `;

    // Codon click detail
    output.querySelectorAll('[data-codon-idx]').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.codonIdx);
        const codon = codons[idx];
        const aa = aminoAcids[idx];
        const bgColor = aaColors[aa] || '#777';
        // Find all codons that encode this AA
        const synonymous = Object.entries(codonTable).filter(([, v]) => v === aa).map(([k]) => k);
        detail.innerHTML = `
          <div style="padding:8px 12px;border-radius:8px;border:1px solid ${bgColor}44;background:${bgColor}11;font-size:12px">
            <strong style="color:${bgColor}">${codon}</strong> \u2192 <strong>${aa}</strong>
            ${aa !== 'Stop' ? ` | Degeneracy: ${synonymous.length} codon${synonymous.length > 1 ? 's' : ''} (${synonymous.join(', ')})` : ' | Translation terminates here'}
          </div>
        `;
      });
    });
  }

  input.addEventListener('input', () => renderOutput(input.value));

  randomBtn.addEventListener('click', () => {
    const bases = 'ATGC';
    // Always start with ATG for a meaningful translation
    let seq = 'ATG';
    const len = 12 + Math.floor(Math.random() * 6) * 3; // 12-27 bp, divisible by 3 after ATG
    for (let i = 3; i < len; i++) {
      seq += bases[Math.floor(Math.random() * 4)];
    }
    input.value = seq;
    renderOutput(seq);
  });

  renderOutput(input.value);

  return widget;
}


// ---------------------------------------------------------------------------
// 4. Coverage Calculator
// ---------------------------------------------------------------------------

function createCoverageCalculator() {
  const widget = createWidgetContainer('Sequencing Coverage Calculator', 'layers', 'mw-coverage-calc');
  const body = widget.querySelector('.widget-body');
  const c = colors();

  const presets = [
    { label: 'E. coli', genome: 4600000, reads: 1000000, readLen: 150 },
    { label: 'Human', genome: 3200000000, reads: 800000000, readLen: 150 },
    { label: 'Yeast', genome: 12000000, reads: 2000000, readLen: 250 },
    { label: 'Arabidopsis', genome: 135000000, reads: 50000000, readLen: 150 },
  ];

  body.innerHTML = `
    <p class="text-sm mb-3" style="color:${c.textMuted}">
      Coverage depth = (Number of reads \u00D7 Read length) / Genome size. Higher coverage means more confidence in each base call.
    </p>
    <div class="flex flex-wrap gap-2 mb-3">
      <span class="text-xs font-semibold" style="color:${c.textMuted};line-height:28px">Presets:</span>
      ${presets.map((p, i) => `<button class="cov-preset" data-idx="${i}" style="padding:3px 10px;border-radius:6px;border:1px solid ${c.border};background:${c.cardBg};color:${c.textMuted};cursor:pointer;font-size:11px;transition:all 0.15s">${p.label}</button>`).join('')}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      <div>
        <label class="block text-xs font-semibold mb-1" style="color:${c.textMuted}">Genome size (bp)</label>
        <input type="text" class="cov-genome" value="4,600,000"
          style="width:100%;padding:6px 10px;border:1px solid ${c.border};border-radius:6px;background:${c.cardBg};color:${c.text};font-size:0.9rem">
      </div>
      <div>
        <label class="block text-xs font-semibold mb-1" style="color:${c.textMuted}">Read length (bp)</label>
        <input type="number" class="cov-readlen" value="150" min="1"
          style="width:100%;padding:6px 10px;border:1px solid ${c.border};border-radius:6px;background:${c.cardBg};color:${c.text};font-size:0.9rem">
      </div>
      <div>
        <label class="block text-xs font-semibold mb-1" style="color:${c.textMuted}">Number of reads</label>
        <input type="text" class="cov-reads" value="1,000,000"
          style="width:100%;padding:6px 10px;border:1px solid ${c.border};border-radius:6px;background:${c.cardBg};color:${c.text};font-size:0.9rem">
      </div>
    </div>
    <div class="cov-result"></div>
  `;

  const genomeInput = body.querySelector('.cov-genome');
  const readLenInput = body.querySelector('.cov-readlen');
  const readsInput = body.querySelector('.cov-reads');
  const result = body.querySelector('.cov-result');

  function parseNum(val) {
    return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
  }

  function formatNum(n) {
    return Number(n).toLocaleString('en-US');
  }

  function update() {
    const G = parseNum(genomeInput.value);
    const L = parseNum(readLenInput.value) || parseInt(readLenInput.value) || 0;
    const N = parseNum(readsInput.value);
    const c = colors();

    if (G === 0 || L === 0) {
      result.innerHTML = `<p class="text-sm italic" style="color:${c.textFaint}">Enter valid values to calculate coverage.</p>`;
      return;
    }

    const coverage = (N * L) / G;
    const totalBases = N * L;

    // Determine quality assessment
    let qualityLabel, qualityColor, qualityDesc;
    if (coverage < 5) {
      qualityLabel = 'Very Low';
      qualityColor = c.red;
      qualityDesc = 'Insufficient for most applications. Many positions may lack reads.';
    } else if (coverage < 15) {
      qualityLabel = 'Low';
      qualityColor = '#f97316';
      qualityDesc = 'Marginal for variant calling. May miss heterozygous variants.';
    } else if (coverage < 30) {
      qualityLabel = 'Moderate';
      qualityColor = c.yellow;
      qualityDesc = 'Adequate for many applications but may miss rare variants.';
    } else if (coverage < 50) {
      qualityLabel = 'Good';
      qualityColor = c.green;
      qualityDesc = 'Standard for whole genome sequencing and reliable variant calling.';
    } else if (coverage < 100) {
      qualityLabel = 'High';
      qualityColor = '#10b981';
      qualityDesc = 'Excellent depth. Good for clinical and research applications.';
    } else {
      qualityLabel = 'Very High';
      qualityColor = '#06b6d4';
      qualityDesc = 'Deep sequencing. Suitable for rare variant detection and clonal analysis.';
    }

    // Depth meter (max out visual at 100x)
    const meterPct = Math.min(100, (coverage / 100) * 100);

    // Visual coverage stack representation
    const stackLayers = Math.min(10, Math.round(coverage));

    result.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div style="text-align:center;padding:16px;border-radius:12px;border:2px solid ${qualityColor}40;background:${qualityColor}08">
            <div class="text-xs font-semibold mb-1" style="color:${c.textMuted}">Coverage Depth</div>
            <div class="text-4xl font-extrabold" style="color:${qualityColor}">${coverage.toFixed(1)}\u00D7</div>
            <div class="text-xs font-bold mt-1" style="color:${qualityColor}">${qualityLabel}</div>
          </div>
          <div class="mt-3" style="height:20px;border-radius:10px;overflow:hidden;background:${c.textFaint}30;position:relative">
            <div style="height:100%;border-radius:10px;width:${meterPct}%;background:linear-gradient(90deg, ${qualityColor}, ${qualityColor}cc);transition:width 0.5s ease"></div>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.3)">${coverage.toFixed(1)}\u00D7</div>
          </div>
          <p class="text-xs mt-2" style="color:${c.textMuted}">${qualityDesc}</p>
        </div>
        <div>
          <div class="text-xs mb-2 font-semibold" style="color:${c.textMuted}">Calculation</div>
          <div style="padding:12px;border-radius:8px;background:${c.cardBg};border:1px solid ${c.border};font-family:monospace;font-size:12px;line-height:2">
            <div>N = ${formatNum(N)} reads</div>
            <div>L = ${formatNum(L)} bp/read</div>
            <div>G = ${formatNum(G)} bp genome</div>
            <div style="border-top:1px solid ${c.border};margin-top:4px;padding-top:4px">
              <strong>C = N \u00D7 L / G</strong>
            </div>
            <div>C = ${formatNum(totalBases)} / ${formatNum(G)}</div>
            <div><strong style="color:${qualityColor}">C = ${coverage.toFixed(2)}\u00D7</strong></div>
          </div>
          <div class="mt-3 text-xs" style="color:${c.textMuted}">
            Total bases sequenced: <strong>${totalBases >= 1e9 ? (totalBases / 1e9).toFixed(1) + ' Gb' : totalBases >= 1e6 ? (totalBases / 1e6).toFixed(1) + ' Mb' : formatNum(totalBases) + ' bp'}</strong>
          </div>
        </div>
      </div>
    `;
  }

  // Auto-format number inputs with commas
  function formatInput(input) {
    const raw = input.value.replace(/[^0-9]/g, '');
    if (raw) input.value = formatNum(parseInt(raw));
  }

  genomeInput.addEventListener('input', () => { formatInput(genomeInput); update(); });
  readsInput.addEventListener('input', () => { formatInput(readsInput); update(); });
  readLenInput.addEventListener('input', update);

  // Presets
  body.querySelectorAll('.cov-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = presets[parseInt(btn.dataset.idx)];
      genomeInput.value = formatNum(p.genome);
      readLenInput.value = p.readLen;
      readsInput.value = formatNum(p.reads);
      // Highlight active preset
      body.querySelectorAll('.cov-preset').forEach(b => {
        b.style.borderColor = colors().border;
        b.style.background = colors().cardBg;
        b.style.color = colors().textMuted;
      });
      btn.style.borderColor = colors().accent;
      btn.style.background = colors().accentLight;
      btn.style.color = colors().accent;
      update();
    });
  });

  update();

  return widget;
}


// ---------------------------------------------------------------------------
// 5. Read Length Comparison (Animated Bar Chart)
// ---------------------------------------------------------------------------

function createReadLengthComparison() {
  const widget = createWidgetContainer('Sequencing Read Length Comparison', 'bar-chart-3', 'mw-read-length');
  const body = widget.querySelector('.widget-body');
  const c = colors();

  const platforms = [
    { name: 'Sanger', length: 900, maxLength: 1200, color: '#8b5cf6', desc: 'Gold standard for accuracy; chain termination method', gen: '1st Gen' },
    { name: 'Illumina', length: 300, maxLength: 600, color: '#3b82f6', desc: 'Short reads, highest throughput; sequencing by synthesis', gen: '2nd Gen' },
    { name: 'Ion Torrent', length: 400, maxLength: 600, color: '#06b6d4', desc: 'Semiconductor sequencing; pH-based detection', gen: '2nd Gen' },
    { name: 'PacBio HiFi', length: 20000, maxLength: 25000, color: '#10b981', desc: 'Long accurate reads; circular consensus sequencing', gen: '3rd Gen' },
    { name: 'PacBio CLR', length: 50000, maxLength: 100000, color: '#22c55e', desc: 'Ultra-long single-pass reads; higher error rate', gen: '3rd Gen' },
    { name: 'ONT Nanopore', length: 100000, maxLength: 2000000, color: '#f59e0b', desc: 'Ultra-long reads possible; real-time sequencing', gen: '3rd Gen' },
  ];

  body.innerHTML = `
    <p class="text-sm mb-4" style="color:${c.textMuted}">
      Read length varies dramatically across platforms. Bars show typical read length; labels show the maximum achievable. Note the logarithmic scale.
    </p>
    <div class="read-length-chart"></div>
    <div class="read-length-detail mt-3" style="min-height:24px"></div>
  `;

  const chartEl = body.querySelector('.read-length-chart');
  const detailEl = body.querySelector('.read-length-detail');

  function drawChart() {
    chartEl.innerHTML = '';
    const c = colors();

    // Use D3 if available, otherwise pure HTML
    if (typeof d3 === 'undefined') {
      drawChartFallback();
      return;
    }

    const margin = { top: 8, right: 80, bottom: 30, left: 100 };
    const fullWidth = chartEl.clientWidth || 500;
    const width = fullWidth - margin.left - margin.right;
    const barHeight = 32;
    const barGap = 8;
    const height = platforms.length * (barHeight + barGap);

    const svg = d3.select(chartEl).append('svg')
      .attr('width', fullWidth)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Log scale for x axis
    const x = d3.scaleLog()
      .domain([100, 2500000])
      .range([0, width])
      .clamp(true);

    // Y scale
    const y = d3.scaleBand()
      .domain(platforms.map(p => p.name))
      .range([0, height])
      .padding(0.2);

    // Grid lines
    const gridValues = [100, 1000, 10000, 100000, 1000000];
    g.selectAll('.grid-line')
      .data(gridValues)
      .join('line')
      .attr('x1', d => x(d))
      .attr('x2', d => x(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', c.border)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5);

    // Grid labels
    g.selectAll('.grid-label')
      .data(gridValues)
      .join('text')
      .attr('x', d => x(d))
      .attr('y', height + 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', c.textMuted)
      .text(d => d >= 1000000 ? (d / 1000000) + 'Mb' : d >= 1000 ? (d / 1000) + 'kb' : d + 'bp');

    // Platform labels
    g.selectAll('.platform-label')
      .data(platforms)
      .join('text')
      .attr('x', -8)
      .attr('y', d => y(d.name) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', d => d.color)
      .text(d => d.name);

    // Generation badges
    g.selectAll('.gen-badge')
      .data(platforms)
      .join('text')
      .attr('x', -8)
      .attr('y', d => y(d.name) + y.bandwidth() / 2 + 12)
      .attr('text-anchor', 'end')
      .attr('font-size', '8px')
      .attr('fill', c.textFaint)
      .text(d => d.gen);

    // Bars (animated on scroll into view)
    const bars = g.selectAll('.bar')
      .data(platforms)
      .join('rect')
      .attr('x', 0)
      .attr('y', d => y(d.name))
      .attr('width', 0) // start at 0 for animation
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .attr('opacity', 0.85)
      .style('cursor', 'pointer');

    // Max length whisker lines
    const whiskers = g.selectAll('.whisker')
      .data(platforms)
      .join('line')
      .attr('x1', d => x(d.length))
      .attr('x2', d => x(d.length)) // start same position
      .attr('y1', d => y(d.name) + y.bandwidth() * 0.3)
      .attr('y2', d => y(d.name) + y.bandwidth() * 0.7)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2')
      .attr('opacity', 0);

    // Value labels on bars
    const valueLabels = g.selectAll('.value-label')
      .data(platforms)
      .join('text')
      .attr('x', 4)
      .attr('y', d => y(d.name) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', 'white')
      .attr('opacity', 0)
      .text(d => d.length >= 1000 ? (d.length / 1000) + 'kb' : d.length + 'bp');

    // Max label
    const maxLabels = g.selectAll('.max-label')
      .data(platforms)
      .join('text')
      .attr('x', d => x(Math.min(d.maxLength, 2500000)) + 6)
      .attr('y', d => y(d.name) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '9px')
      .attr('fill', c.textMuted)
      .attr('opacity', 0)
      .text(d => {
        if (d.maxLength === d.length) return '';
        const max = d.maxLength >= 1000000 ? (d.maxLength / 1000000) + 'Mb' : d.maxLength >= 1000 ? (d.maxLength / 1000) + 'kb' : d.maxLength + 'bp';
        return 'max: ' + max;
      });

    // Hover interaction
    bars
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 1);
        detailEl.innerHTML = `
          <div style="padding:8px 12px;border-radius:8px;border:1px solid ${d.color}44;background:${d.color}11;font-size:12px;color:${c.text}">
            <strong style="color:${d.color}">${d.name}</strong> (${d.gen}) \u2014 ${d.desc}
            <br>Typical: <strong>${d.length >= 1000 ? (d.length / 1000) + 'kb' : d.length + 'bp'}</strong>
            | Max: <strong>${d.maxLength >= 1000000 ? (d.maxLength / 1000000) + 'Mb' : d.maxLength >= 1000 ? (d.maxLength / 1000) + 'kb' : d.maxLength + 'bp'}</strong>
          </div>`;
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.85);
      });

    // Animate on scroll into view
    let animated = false;
    function animateBars() {
      if (animated) return;
      animated = true;

      bars.transition()
        .duration(800)
        .delay((d, i) => i * 120)
        .ease(d3.easeCubicOut)
        .attr('width', d => Math.max(4, x(d.length)));

      valueLabels.transition()
        .duration(400)
        .delay((d, i) => i * 120 + 500)
        .attr('opacity', 1);

      whiskers.transition()
        .duration(400)
        .delay((d, i) => i * 120 + 600)
        .attr('x2', d => x(Math.min(d.maxLength, 2500000)))
        .attr('opacity', 0.6);

      maxLabels.transition()
        .duration(400)
        .delay((d, i) => i * 120 + 700)
        .attr('opacity', 1);
    }

    // IntersectionObserver for scroll-triggered animation
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateBars();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(chartEl);
  }

  // Fallback for when D3 is not available
  function drawChartFallback() {
    const c = colors();
    const maxLog = Math.log10(2500000);
    const minLog = Math.log10(100);
    const range = maxLog - minLog;

    chartEl.innerHTML = platforms.map(p => {
      const pct = ((Math.log10(p.length) - minLog) / range) * 100;
      const label = p.length >= 1000 ? (p.length / 1000) + 'kb' : p.length + 'bp';
      return `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div style="width:80px;text-align:right;font-size:12px;font-weight:600;color:${p.color};flex-shrink:0">${p.name}</div>
          <div style="flex:1;height:28px;background:${c.border}30;border-radius:6px;overflow:hidden;position:relative">
            <div style="height:100%;width:${pct}%;background:${p.color};border-radius:6px;transition:width 0.8s ease"></div>
            <span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:10px;font-weight:700;color:white">${label}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Draw and handle resize
  drawChart();
  let resizeTimer;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawChart, 250);
  });
  resizeObserver.observe(chartEl);

  return widget;
}


// ---------------------------------------------------------------------------
// Main: initMicroWidgets
// ---------------------------------------------------------------------------

/**
 * Scans the rendered content container and inserts interactive micro-widgets
 * near relevant sections, identified by keyword matching on headings and content.
 *
 * @param {HTMLElement} container - The topic page content container
 */
export function initMicroWidgets(container) {
  if (!container || container.dataset.microWidgetsInit) return;
  container.dataset.microWidgetsInit = 'true';

  // Avoid inserting duplicates
  if (container.querySelector('.micro-widget')) return;

  // Build all widgets
  const widgets = [
    {
      create: createPhredCalculator,
      keywords: ['phred', 'quality score', 'base quality', 'q20', 'q30', 'error rate', 'base call accuracy', 'sequencing accuracy'],
    },
    {
      create: createCostSlider,
      keywords: ['cost per genome', 'sequencing cost', '$1000 genome', 'cost curve', 'moore\'s law', 'price per genome', 'cost of sequencing'],
    },
    {
      create: createDnaTranslator,
      keywords: ['central dogma', 'transcription', 'translation', 'mrna', 'codon', 'amino acid', 'reading frame', 'protein synthesis', 'genetic code'],
    },
    {
      create: createCoverageCalculator,
      keywords: ['coverage', 'coverage depth', 'sequencing depth', 'fold coverage', 'reads per base', 'genome coverage'],
    },
    {
      create: createReadLengthComparison,
      keywords: ['read length', 'short read', 'long read', 'nanopore', 'pacbio', 'sequencing platform', 'sanger sequencing', 'illumina'],
    },
  ];

  // Try to place each widget near relevant content
  const inserted = new Set();
  for (const w of widgets) {
    const widgetEl = w.create();
    if (insertNearKeyword(container, widgetEl, w.keywords)) {
      inserted.add(widgetEl.id);
    }
  }

  // For any widgets that were not placed by keyword, append them in a
  // dedicated section before the quiz (if it exists) as supplementary tools
  const unplaced = widgets.filter(w => {
    const id = w.create === createPhredCalculator ? 'mw-phred-calc'
      : w.create === createCostSlider ? 'mw-cost-slider'
      : w.create === createDnaTranslator ? 'mw-dna-translator'
      : w.create === createCoverageCalculator ? 'mw-coverage-calc'
      : 'mw-read-length';
    return !inserted.has(id);
  });

  if (unplaced.length > 0) {
    // Find a good insertion point: before quiz or at end of .max-w-4xl
    const insertionParent = container.querySelector('#topic-quiz')?.parentElement
      || container.querySelector('.max-w-4xl')
      || container;

    const insertionRef = container.querySelector('#topic-quiz')
      || container.querySelector('.key-facts-section')
      || null;

    const section = document.createElement('section');
    section.className = 'mb-12 micro-widgets-extras';
    section.innerHTML = `
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i data-lucide="cpu" class="w-5 h-5 text-blue-500"></i> Interactive Tools
      </h2>
    `;

    for (const w of unplaced) {
      section.appendChild(w.create());
    }

    if (insertionRef) {
      insertionParent.insertBefore(section, insertionRef);
    } else {
      insertionParent.appendChild(section);
    }
  }

  // Refresh Lucide icons for newly inserted widgets
  if (window.lucide) {
    requestAnimationFrame(() => lucide.createIcons());
  }
}
