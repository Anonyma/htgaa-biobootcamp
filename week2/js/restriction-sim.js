/**
 * Restriction Enzyme Cutting Simulator
 * Interactive tool for visualizing how restriction enzymes cut DNA.
 * Uses D3.js for SVG fragment animation. Enzyme data loaded from enzymes.json.
 */

const LAMBDA_EXCERPT =
  'GACCTGAATTCAAAGGATCCGAATTCTAGAAGCTTGATATCGTCGACGAGCTCGGTACCTTAAGAATTCGGCC';

// Complement mapping for generating the antisense strand
const COMPLEMENT = { A: 'T', T: 'A', G: 'C', C: 'G' };

// Fragment color palette
const FRAG_COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
  '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'];

let enzymes = [];
let selectedEnzyme = null;
let cutSites = []; // indices into the sense strand where recognition starts

/* ------------------------------------------------------------------ */
/*  Initialization                                                     */
/* ------------------------------------------------------------------ */

function initRestrictionSim() {
  const root = document.getElementById('restriction-sim');
  if (!root) return;
  root.innerHTML = '';

  // --- Controls row ---
  const controls = el('div', { className: 'rs-controls' });
  const textarea = el('textarea', {
    id: 'rs-seq-input',
    rows: 3,
    placeholder: 'Paste a DNA sequence (A/T/G/C only)…'
  });
  const loadBtn = el('button', { textContent: 'Load Lambda excerpt', className: 'rs-btn' });
  const enzymeSelect = el('select', { id: 'rs-enzyme-select' });
  enzymeSelect.appendChild(el('option', { value: '', textContent: '— select enzyme —', disabled: true, selected: true }));
  const findBtn = el('button', { textContent: 'Find Sites', className: 'rs-btn' });
  const cutBtn  = el('button', { textContent: 'Cut!', className: 'rs-btn rs-btn-cut', disabled: true });

  controls.append(textarea, row(loadBtn, enzymeSelect, findBtn, cutBtn));
  root.appendChild(controls);

  // --- Sequence display (sense / pairing / antisense) ---
  const seqDisplay = el('div', { id: 'rs-seq-display', className: 'rs-seq-display' });
  root.appendChild(seqDisplay);

  // --- SVG container for cutting animation ---
  const svgWrap = el('div', { id: 'rs-svg-wrap' });
  root.appendChild(svgWrap);

  // --- Results area ---
  const results = el('div', { id: 'rs-results', className: 'rs-results' });
  root.appendChild(results);

  // --- Load enzyme data ---
  fetch('data/enzymes.json')
    .then(r => r.json())
    .then(data => {
      enzymes = data.enzymes;
      enzymes.forEach(enz => {
        enzymeSelect.appendChild(el('option', { value: enz.name, textContent: enz.name }));
      });
    })
    .catch(err => console.error('Failed to load enzymes.json:', err));

  // --- Event listeners ---
  loadBtn.addEventListener('click', () => { textarea.value = LAMBDA_EXCERPT; clearResults(); });
  enzymeSelect.addEventListener('change', () => {
    selectedEnzyme = enzymes.find(e => e.name === enzymeSelect.value) || null;
    clearResults();
  });
  findBtn.addEventListener('click', () => findSites(textarea.value));
  cutBtn.addEventListener('click', () => animateCut(textarea.value));
}

/* ------------------------------------------------------------------ */
/*  Find recognition sites & render highlighted sequence               */
/* ------------------------------------------------------------------ */

function findSites(rawSeq) {
  const seq = cleanSeq(rawSeq);
  if (!seq) return alert('Enter a valid DNA sequence (A, T, G, C only).');
  if (!selectedEnzyme) return alert('Select a restriction enzyme first.');

  const rec = selectedEnzyme.recognition;
  cutSites = [];
  let i = seq.indexOf(rec);
  while (i !== -1) {
    cutSites.push(i);
    i = seq.indexOf(rec, i + 1);
  }

  renderSequence(seq);

  // Enable cut button only if sites were found
  document.getElementById('restriction-sim').querySelector('.rs-btn-cut').disabled = cutSites.length === 0;

  if (cutSites.length === 0) {
    document.getElementById('rs-results').innerHTML =
      `<p>No <strong>${selectedEnzyme.name}</strong> sites found in this sequence.</p>`;
  } else {
    document.getElementById('rs-results').innerHTML =
      `<p>Found <strong>${cutSites.length}</strong> ${selectedEnzyme.name} site(s). Press <em>Cut!</em> to digest.</p>`;
  }
}

/* ------------------------------------------------------------------ */
/*  Render sense + antisense with highlights                           */
/* ------------------------------------------------------------------ */

function renderSequence(seq) {
  const display = document.getElementById('rs-seq-display');
  display.innerHTML = '';

  const recLen = selectedEnzyme ? selectedEnzyme.recognition.length : 0;
  const anti = complement(seq);

  // Build highlighted HTML for each strand
  let senseHTML = "5' ";
  let pairHTML  = '   ';
  let antiHTML  = "3' ";

  for (let i = 0; i < seq.length; i++) {
    const inSite = cutSites.some(s => i >= s && i < s + recLen);
    const cls = inSite ? ' class="rs-hl"' : '';
    senseHTML += `<span${cls}>${seq[i]}</span>`;
    pairHTML  += `<span${cls}>|</span>`;
    antiHTML  += `<span${cls}>${anti[i]}</span>`;
  }

  senseHTML += " 3'";
  pairHTML  += '   ';
  antiHTML  += " 5'";

  const pre = el('pre');
  pre.innerHTML = senseHTML + '\n' + pairHTML + '\n' + antiHTML;
  display.appendChild(pre);
}

/* ------------------------------------------------------------------ */
/*  Cutting animation with D3                                          */
/* ------------------------------------------------------------------ */

function animateCut(rawSeq) {
  const seq = cleanSeq(rawSeq);
  if (!seq || !selectedEnzyme || cutSites.length === 0) return;

  const enz = selectedEnzyme;
  const recLen = enz.recognition.length;

  // Determine actual cut positions on each strand
  const senseCuts = cutSites.map(s => s + enz.cutSense);
  const antiCuts  = cutSites.map(s => s + enz.cutAnti);

  // Build fragments (sense strand boundaries)
  const boundaries = [0, ...senseCuts.sort((a, b) => a - b), seq.length];
  const fragments = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end   = boundaries[i + 1];
    fragments.push({
      sense: seq.slice(start, end),
      anti:  complement(seq).slice(
        i === 0 ? 0 : antiCuts.sort((a, b) => a - b)[i - 1],
        i < antiCuts.length ? antiCuts.sort((a, b) => a - b)[i] : seq.length
      ),
      size: end - start,
      color: FRAG_COLORS[i % FRAG_COLORS.length]
    });
  }

  // Overhang label
  const overhangLabel = enz.overhang === 'blunt' ? 'Blunt ends'
    : enz.overhang === 'sticky-5prime' ? "5' sticky ends"
    : "3' sticky ends";

  // --- D3 SVG visualization ---
  const wrap = document.getElementById('rs-svg-wrap');
  wrap.innerHTML = '';

  const margin = 20;
  const fragH = 48;
  const gap = 30;
  const svgW = Math.max(600, wrap.clientWidth || 600);
  const svgH = margin * 2 + fragH + 50;

  const svg = d3.select(wrap).append('svg')
    .attr('width', svgW)
    .attr('height', svgH)
    .attr('class', 'rs-svg');

  // Calculate x positions: start packed together, then separate
  const totalBp = fragments.reduce((s, f) => s + f.size, 0);
  const scale = (svgW - margin * 2 - gap * (fragments.length - 1)) / totalBp;

  let xCursor = margin;
  const fragData = fragments.map((f, i) => {
    const w = f.size * scale;
    const d = { ...f, x0: xCursor, w, index: i };
    xCursor += w; // no gap initially — they start adjacent
    return d;
  });

  // Draw fragment groups (start at packed position)
  const groups = svg.selectAll('g.frag')
    .data(fragData)
    .enter().append('g')
    .attr('class', 'frag')
    .attr('transform', d => `translate(${d.x0}, ${margin})`);

  // Rectangle for each fragment
  groups.append('rect')
    .attr('width', d => d.w)
    .attr('height', fragH)
    .attr('rx', 4)
    .attr('fill', d => d.color)
    .attr('opacity', 0.85);

  // Sense strand label (top)
  groups.append('text')
    .attr('x', d => d.w / 2)
    .attr('y', 16)
    .attr('text-anchor', 'middle')
    .attr('class', 'rs-frag-label')
    .text(d => truncate(d.sense, Math.floor(d.w / 8)));

  // Antisense strand label (bottom)
  groups.append('text')
    .attr('x', d => d.w / 2)
    .attr('y', fragH - 6)
    .attr('text-anchor', 'middle')
    .attr('class', 'rs-frag-label')
    .text(d => truncate(complement(d.sense), Math.floor(d.w / 8)));

  // Size badge
  groups.append('text')
    .attr('x', d => d.w / 2)
    .attr('y', fragH + 18)
    .attr('text-anchor', 'middle')
    .attr('class', 'rs-frag-size')
    .text(d => `${d.size} bp`);

  // Animate: slide fragments apart after short delay
  let xSeparated = margin;
  const targets = fragData.map(d => {
    const tx = xSeparated;
    xSeparated += d.w + gap;
    return tx;
  });

  groups.transition()
    .delay(300)
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr('transform', (d, i) => `translate(${targets[i]}, ${margin})`);

  // --- Results summary ---
  const sorted = fragments.map(f => f.size).sort((a, b) => b - a);
  const resultsDiv = document.getElementById('rs-results');
  resultsDiv.innerHTML = `
    <h4>Digest Results — ${enz.name}</h4>
    <p><strong>Cuts:</strong> ${cutSites.length} &nbsp;|&nbsp;
       <strong>Fragments:</strong> ${fragments.length} &nbsp;|&nbsp;
       <strong>Overhang:</strong> ${overhangLabel}</p>
    <p><strong>Fragment sizes (bp):</strong> ${sorted.join(', ')}</p>
  `;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Clean and uppercase a raw sequence string, stripping non-ATGC chars */
function cleanSeq(raw) {
  const s = raw.toUpperCase().replace(/[^ATGC]/g, '');
  return s.length > 0 ? s : null;
}

/** Return the complementary strand (same direction, so reverse later if needed) */
function complement(seq) {
  return seq.split('').map(b => COMPLEMENT[b] || 'N').join('');
}

/** Truncate a string for display inside a narrow rectangle */
function truncate(str, max) {
  if (max < 5) return '..';
  return str.length <= max ? str : str.slice(0, max - 2) + '..';
}

/** Create a DOM element with optional properties */
function el(tag, props) {
  const e = document.createElement(tag);
  if (props) Object.assign(e, props);
  return e;
}

/** Wrap elements in a flex row div */
function row(...children) {
  const d = el('div', { className: 'rs-row' });
  children.forEach(c => d.appendChild(c));
  return d;
}

/** Clear results, SVG, and sequence display */
function clearResults() {
  const r = document.getElementById('rs-results');
  const s = document.getElementById('rs-svg-wrap');
  if (r) r.innerHTML = '';
  if (s) s.innerHTML = '';
}
