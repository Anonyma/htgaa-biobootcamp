// Central Dogma Animation — DNA → RNA → Protein step-through
// Requires D3.js v7 globally available as `d3`

function initCentralDogma() {
  const container = d3.select('#central-dogma');
  if (container.empty()) return;
  container.html('');

  // --- Constants ---
  const W = 700, H = 400;
  const BASE_COLORS = { A: '#2ecc71', T: '#e74c3c', G: '#3498db', C: '#f1c40f', U: '#e67e22' };
  const CODON_TABLE = { AUG: 'Met', AAA: 'Lys', GCU: 'Ala', UAC: 'Tyr', GAA: 'Glu', UAA: '*' };
  const AA_COLORS = { Met: '#9b59b6', Lys: '#8e44ad', Ala: '#6c3483', Tyr: '#a569bd', Glu: '#7d3c98' };

  // DNA coding strand 5'→3'  (sense strand)
  const codingSeq = 'ATGAAAGCTTATGAA'.split(''); // changed: T instead of U for DNA
  // Template strand 3'→5' (antisense) — complementary
  const complement = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const templateSeq = codingSeq.map(b => complement[b]);
  // mRNA 5'→3' (same as coding but U replaces T)
  const mRNASeq = codingSeq.map(b => b === 'T' ? 'U' : b);
  // Codons and amino acids
  const codons = [];
  for (let i = 0; i < mRNASeq.length; i += 3) codons.push(mRNASeq.slice(i, i + 3).join(''));
  const aminoAcids = codons.map(c => CODON_TABLE[c] || '?').filter(a => a !== '*');

  const STAGES = [
    'DNA Double Strand',
    'Transcription Initiation',
    'mRNA Synthesis',
    'mRNA Complete',
    'Translation Initiation',
    'Elongation',
    'Protein Complete'
  ];

  const DESCRIPTIONS = [
    'The DNA double strand: coding strand (5\'→3\') and template strand (3\'→5\') with complementary base pairing.',
    'RNA Polymerase binds to the promoter region. The DNA strands begin to unwind and separate.',
    'RNA Polymerase moves along the template strand (3\'→5\'), synthesizing mRNA (5\'→3\'). Uracil (U) replaces Thymine (T).',
    'Transcription is complete. RNA Polymerase detaches, DNA re-anneals, and the mature mRNA moves toward the ribosome.',
    'The ribosome binds to the mRNA at the AUG start codon, initiating translation.',
    'tRNA molecules deliver amino acids matching each codon. The polypeptide chain grows as the ribosome advances.',
    'The ribosome reaches a stop codon. The completed protein is released and the ribosome detaches.'
  ];

  // --- State ---
  let stage = 0, playing = false, speed = 1, timer = null;

  // --- Controls ---
  const ctrl = container.append('div')
    .style('display', 'flex').style('align-items', 'center')
    .style('gap', '10px').style('margin-bottom', '8px').style('flex-wrap', 'wrap');

  const btnStyle = (el) => el
    .style('padding', '5px 12px').style('border', '1px solid #555')
    .style('border-radius', '4px').style('background', '#2a2a2a')
    .style('color', '#eee').style('cursor', 'pointer').style('font-size', '13px');

  const resetBtn = btnStyle(ctrl.append('button').text('Reset'));
  const backBtn = btnStyle(ctrl.append('button').text('\u25C0 Back'));
  const playBtn = btnStyle(ctrl.append('button').text('\u25B6 Play'));
  const fwdBtn = btnStyle(ctrl.append('button').text('Next \u25B6'));

  ctrl.append('span').text('Speed:').style('color', '#aaa').style('font-size', '12px').style('margin-left', '8px');
  const speedSel = ctrl.append('select').style('background', '#2a2a2a').style('color', '#eee')
    .style('border', '1px solid #555').style('border-radius', '4px').style('padding', '4px');
  [0.5, 1, 2].forEach(v => speedSel.append('option').attr('value', v).text(v + 'x'));
  speedSel.property('value', 1);

  const stageLabel = ctrl.append('span').style('color', '#76d7c4').style('font-size', '13px')
    .style('font-weight', 'bold').style('margin-left', '12px');

  // --- SVG ---
  const svg = container.append('svg').attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', W).attr('height', H)
    .style('background', '#1a1a2e').style('border-radius', '8px').style('display', 'block');

  // --- Description area ---
  const desc = container.append('div')
    .style('margin-top', '8px').style('color', '#ccc').style('font-size', '13px')
    .style('min-height', '36px').style('line-height', '1.4');

  // --- Helper: draw base letter ---
  function baseText(g, x, y, letter, opts = {}) {
    return g.append('text').attr('x', x).attr('y', y)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('font-family', 'monospace').attr('font-size', opts.size || 13)
      .attr('font-weight', 'bold').attr('fill', BASE_COLORS[letter] || '#ccc')
      .style('opacity', opts.opacity ?? 1)
      .text(letter);
  }

  // --- Layout constants ---
  const BP = codingSeq.length;
  const SPC = 32; // spacing between bases
  const X0 = 70; // left margin for bases
  const DNA_Y = 80; // coding strand y
  const PAIR_GAP = 40; // gap between strands

  // ========== RENDER FUNCTIONS ==========

  function renderStage0(g) {
    // 5' and 3' labels
    g.append('text').attr('x', X0 - 40).attr('y', DNA_Y).text("5'")
      .attr('fill', '#76d7c4').attr('font-size', 12).attr('font-weight', 'bold');
    g.append('text').attr('x', X0 + BP * SPC + 8).attr('y', DNA_Y).text("3'")
      .attr('fill', '#76d7c4').attr('font-size', 12).attr('font-weight', 'bold');
    g.append('text').attr('x', X0 - 40).attr('y', DNA_Y + PAIR_GAP).text("3'")
      .attr('fill', '#76d7c4').attr('font-size', 12).attr('font-weight', 'bold');
    g.append('text').attr('x', X0 + BP * SPC + 8).attr('y', DNA_Y + PAIR_GAP).text("5'")
      .attr('fill', '#76d7c4').attr('font-size', 12).attr('font-weight', 'bold');

    // Labels
    g.append('text').attr('x', X0 + BP * SPC / 2).attr('y', DNA_Y - 28)
      .attr('text-anchor', 'middle').attr('fill', '#82b1ff').attr('font-size', 11)
      .text('Coding Strand (sense)');
    g.append('text').attr('x', X0 + BP * SPC / 2).attr('y', DNA_Y + PAIR_GAP + 28)
      .attr('text-anchor', 'middle').attr('fill', '#82b1ff').attr('font-size', 11)
      .text('Template Strand (antisense)');

    codingSeq.forEach((b, i) => {
      const x = X0 + i * SPC;
      baseText(g, x, DNA_Y, b);
      // Dashes for pairing
      g.append('text').attr('x', x).attr('y', DNA_Y + PAIR_GAP / 2)
        .attr('text-anchor', 'middle').attr('fill', '#666').attr('font-size', 10).text('|');
      baseText(g, x, DNA_Y + PAIR_GAP, templateSeq[i]);
    });
  }

  function renderStage1(g) {
    // DNA strands begin separating — gap widens near promoter (left side)
    const separateN = 6; // first 6 bases separated
    codingSeq.forEach((b, i) => {
      const x = X0 + i * SPC;
      const offset = i < separateN ? -12 : 0;
      baseText(g, x, DNA_Y + offset, b);
      if (i >= separateN) {
        g.append('text').attr('x', x).attr('y', DNA_Y + PAIR_GAP / 2)
          .attr('text-anchor', 'middle').attr('fill', '#666').attr('font-size', 10).text('|');
      }
      baseText(g, x, DNA_Y + PAIR_GAP - offset, templateSeq[i]);
    });

    // RNA Polymerase oval
    const rnapX = X0 + (separateN - 1) * SPC;
    g.append('ellipse').attr('cx', rnapX).attr('cy', DNA_Y + PAIR_GAP / 2)
      .attr('rx', 40).attr('ry', 22).attr('fill', '#e67e22').attr('opacity', 0.85)
      .attr('stroke', '#f39c12').attr('stroke-width', 1.5);
    g.append('text').attr('x', rnapX).attr('y', DNA_Y + PAIR_GAP / 2)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', '#fff').attr('font-size', 10).attr('font-weight', 'bold').text('RNA Pol');

    // Direction arrow
    g.append('text').attr('x', rnapX + 50).attr('y', DNA_Y + PAIR_GAP / 2)
      .attr('fill', '#e67e22').attr('font-size', 14).text('\u2192');

    addDNALabels(g);
  }

  function renderStage2(g) {
    const synthN = 9; // 9 bases synthesized so far
    // DNA strands — all separated
    codingSeq.forEach((b, i) => {
      const x = X0 + i * SPC;
      baseText(g, x, DNA_Y - 12, b, { opacity: 0.4 });
      baseText(g, x, DNA_Y + PAIR_GAP + 12, templateSeq[i]);
    });

    // RNA Polymerase at position synthN
    const rnapX = X0 + (synthN - 1) * SPC;
    g.append('ellipse').attr('cx', rnapX).attr('cy', DNA_Y + PAIR_GAP / 2)
      .attr('rx', 40).attr('ry', 22).attr('fill', '#e67e22').attr('opacity', 0.85)
      .attr('stroke', '#f39c12').attr('stroke-width', 1.5);
    g.append('text').attr('x', rnapX).attr('y', DNA_Y + PAIR_GAP / 2)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', '#fff').attr('font-size', 10).attr('font-weight', 'bold').text('RNA Pol');

    // mRNA growing behind polymerase
    const mRNAY = DNA_Y + PAIR_GAP / 2 + 4;
    for (let i = 0; i < synthN; i++) {
      const x = X0 + i * SPC;
      const t = g.append('text').attr('x', x).attr('y', mRNAY)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('font-family', 'monospace').attr('font-size', 13).attr('font-weight', 'bold')
        .attr('fill', BASE_COLORS[mRNASeq[i]])
        .style('opacity', 0).text(mRNASeq[i]);
      t.transition().delay(i * 120 / speed).duration(200 / speed).style('opacity', 1);
    }

    g.append('text').attr('x', X0 + synthN * SPC / 2).attr('y', mRNAY + 24)
      .attr('text-anchor', 'middle').attr('fill', '#e67e22').attr('font-size', 11)
      .attr('font-style', 'italic').text('mRNA (growing)');

    addDNALabels(g);
  }

  function renderStage3(g) {
    // DNA re-annealed at top
    codingSeq.forEach((b, i) => {
      const x = X0 + i * SPC;
      baseText(g, x, 40, b, { opacity: 0.4 });
      g.append('text').attr('x', x).attr('y', 60)
        .attr('text-anchor', 'middle').attr('fill', '#444').attr('font-size', 10).text('|');
      baseText(g, x, 80, templateSeq[i], { opacity: 0.4 });
    });
    g.append('text').attr('x', X0 + BP * SPC / 2).attr('y', 25)
      .attr('text-anchor', 'middle').attr('fill', '#555').attr('font-size', 11).text('DNA (re-annealed)');

    // mRNA in lower area
    const mY = 200;
    g.append('text').attr('x', X0 - 40).attr('y', mY).text("5'")
      .attr('fill', '#e67e22').attr('font-size', 12).attr('font-weight', 'bold');
    g.append('text').attr('x', X0 + BP * SPC + 8).attr('y', mY).text("3'")
      .attr('fill', '#e67e22').attr('font-size', 12).attr('font-weight', 'bold');
    mRNASeq.forEach((b, i) => baseText(g, X0 + i * SPC, mY, b));
    g.append('text').attr('x', X0 + BP * SPC / 2).attr('y', mY - 20)
      .attr('text-anchor', 'middle').attr('fill', '#e67e22').attr('font-size', 12)
      .attr('font-weight', 'bold').text('Mature mRNA');

    // Codon brackets
    for (let c = 0; c < codons.length; c++) {
      const cx = X0 + c * 3 * SPC + SPC;
      g.append('text').attr('x', cx).attr('y', mY + 18)
        .attr('text-anchor', 'middle').attr('fill', '#888').attr('font-size', 10)
        .text(codons[c]);
    }
  }

  function renderStage4(g) {
    const mY = 160;
    drawMRNA(g, mY);

    // Ribosome at AUG (codon 0)
    const ribX = X0 + SPC; // center of first codon
    drawRibosome(g, ribX, mY, 0);

    g.append('text').attr('x', ribX).attr('y', mY - 62)
      .attr('text-anchor', 'middle').attr('fill', '#76d7c4').attr('font-size', 11)
      .text('Start codon: AUG');
  }

  function renderStage5(g) {
    const mY = 160;
    drawMRNA(g, mY);

    const showAA = 4; // amino acids shown so far
    const ribCodon = showAA; // ribosome at codon index 4 (GAA)
    const ribX = X0 + ribCodon * 3 * SPC + SPC;
    drawRibosome(g, ribX, mY, ribCodon);

    // tRNA at current codon
    const tRNAx = ribX;
    drawTRNA(g, tRNAx, mY + 48, codons[ribCodon], aminoAcids[ribCodon] || '?');

    // Amino acid chain
    const chainY = mY - 80;
    const chainX0 = X0 + 40;
    for (let a = 0; a < showAA; a++) {
      const cx = chainX0 + a * 36;
      g.append('circle').attr('cx', cx).attr('cy', chainY).attr('r', 14)
        .attr('fill', AA_COLORS[aminoAcids[a]] || '#999').attr('stroke', '#fff').attr('stroke-width', 1);
      g.append('text').attr('x', cx).attr('y', chainY)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('fill', '#fff').attr('font-size', 9).attr('font-weight', 'bold')
        .text(aminoAcids[a]);
      if (a < showAA - 1) {
        g.append('line').attr('x1', cx + 14).attr('y1', chainY)
          .attr('x2', cx + 22).attr('y2', chainY)
          .attr('stroke', '#aaa').attr('stroke-width', 2);
      }
    }
    g.append('text').attr('x', chainX0 + (showAA - 1) * 18).attr('y', chainY - 22)
      .attr('text-anchor', 'middle').attr('fill', '#bb8fce').attr('font-size', 11)
      .text('Growing polypeptide');
  }

  function renderStage6(g) {
    const mY = 200;
    drawMRNA(g, mY, 0.4);

    // Detached ribosome off to the side
    g.append('rect').attr('x', 520).attr('y', mY - 20).attr('width', 70).attr('height', 30)
      .attr('rx', 8).attr('fill', '#5d6d7e').attr('opacity', 0.5).attr('stroke', '#85929e');
    g.append('text').attr('x', 555).attr('y', mY - 2)
      .attr('text-anchor', 'middle').attr('fill', '#aaa').attr('font-size', 9).text('Ribosome');

    // Complete protein chain
    const chainY = 80, chainX0 = 140;
    g.append('text').attr('x', W / 2).attr('y', chainY - 35)
      .attr('text-anchor', 'middle').attr('fill', '#bb8fce').attr('font-size', 14)
      .attr('font-weight', 'bold').text('Completed Protein');
    for (let a = 0; a < aminoAcids.length; a++) {
      const cx = chainX0 + a * 50;
      g.append('circle').attr('cx', cx).attr('cy', chainY).attr('r', 18)
        .attr('fill', AA_COLORS[aminoAcids[a]] || '#999')
        .attr('stroke', '#fff').attr('stroke-width', 2);
      g.append('text').attr('x', cx).attr('y', chainY)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('fill', '#fff').attr('font-size', 11).attr('font-weight', 'bold')
        .text(aminoAcids[a]);
      if (a < aminoAcids.length - 1) {
        g.append('line').attr('x1', cx + 18).attr('y1', chainY)
          .attr('x2', cx + 32).attr('y2', chainY)
          .attr('stroke', '#ccc').attr('stroke-width', 2);
      }
    }

    // Stop codon indicator
    const stopX = X0 + (codons.length - 1) * 3 * SPC + SPC;
    g.append('text').attr('x', stopX).attr('y', mY + 24)
      .attr('text-anchor', 'middle').attr('fill', '#e74c3c').attr('font-size', 11)
      .attr('font-weight', 'bold').text('STOP (UAA)');

    // Summary
    g.append('text').attr('x', W / 2).attr('y', H - 30)
      .attr('text-anchor', 'middle').attr('fill', '#76d7c4').attr('font-size', 13)
      .text('DNA \u2192 mRNA \u2192 Protein: The Central Dogma');
  }

  // ========== SHARED DRAWING HELPERS ==========

  function addDNALabels(g) {
    g.append('text').attr('x', X0 - 40).attr('y', DNA_Y - 12).text("5'")
      .attr('fill', '#76d7c4').attr('font-size', 11).attr('font-weight', 'bold');
    g.append('text').attr('x', X0 + BP * SPC + 8).attr('y', DNA_Y - 12).text("3'")
      .attr('fill', '#76d7c4').attr('font-size', 11).attr('font-weight', 'bold');
    g.append('text').attr('x', X0 - 40).attr('y', DNA_Y + PAIR_GAP + 12).text("3'")
      .attr('fill', '#76d7c4').attr('font-size', 11).attr('font-weight', 'bold');
    g.append('text').attr('x', X0 + BP * SPC + 8).attr('y', DNA_Y + PAIR_GAP + 12).text("5'")
      .attr('fill', '#76d7c4').attr('font-size', 11).attr('font-weight', 'bold');
  }

  function drawMRNA(g, y, opacity) {
    const op = opacity ?? 1;
    g.append('text').attr('x', X0 - 40).attr('y', y).text("5'")
      .attr('fill', '#e67e22').attr('font-size', 12).attr('font-weight', 'bold').style('opacity', op);
    g.append('text').attr('x', X0 + BP * SPC + 8).attr('y', y).text("3'")
      .attr('fill', '#e67e22').attr('font-size', 12).attr('font-weight', 'bold').style('opacity', op);
    // Backbone line
    g.append('line').attr('x1', X0 - 8).attr('y1', y).attr('x2', X0 + (BP - 1) * SPC + 8).attr('y2', y)
      .attr('stroke', '#e67e22').attr('stroke-width', 1.5).attr('opacity', 0.3 * (op || 1));
    mRNASeq.forEach((b, i) => baseText(g, X0 + i * SPC, y, b, { opacity: op }));
    // Codon labels
    for (let c = 0; c < codons.length; c++) {
      const cx = X0 + c * 3 * SPC + SPC;
      g.append('text').attr('x', cx).attr('y', y + 18)
        .attr('text-anchor', 'middle').attr('fill', '#888').attr('font-size', 9)
        .style('opacity', op).text(codons[c]);
    }
    g.append('text').attr('x', X0 + BP * SPC / 2).attr('y', y - 18)
      .attr('text-anchor', 'middle').attr('fill', '#e67e22').attr('font-size', 11)
      .style('opacity', op).text('mRNA');
  }

  function drawRibosome(g, cx, mY, codonIdx) {
    // Large subunit (top)
    g.append('rect').attr('x', cx - 48).attr('y', mY - 54).attr('width', 96).attr('height', 34)
      .attr('rx', 12).attr('fill', '#5d6d7e').attr('stroke', '#85929e').attr('stroke-width', 1.5);
    g.append('text').attr('x', cx).attr('y', mY - 35)
      .attr('text-anchor', 'middle').attr('fill', '#eee').attr('font-size', 9).text('Large subunit');
    // Small subunit (bottom)
    g.append('rect').attr('x', cx - 38).attr('y', mY + 22).attr('width', 76).attr('height', 26)
      .attr('rx', 10).attr('fill', '#7f8c8d').attr('stroke', '#95a5a6').attr('stroke-width', 1.5);
    g.append('text').attr('x', cx).attr('y', mY + 38)
      .attr('text-anchor', 'middle').attr('fill', '#eee').attr('font-size', 9).text('Small subunit');
    // Label
    g.append('text').attr('x', cx + 56).attr('y', mY - 42)
      .attr('fill', '#aab7b8').attr('font-size', 10).text('Ribosome');
  }

  function drawTRNA(g, cx, cy, codon, aa) {
    // Simplified T-shape tRNA
    // Vertical stem
    g.append('line').attr('x1', cx).attr('y1', cy).attr('x2', cx).attr('y2', cy + 40)
      .attr('stroke', '#2ecc71').attr('stroke-width', 3);
    // Horizontal top (anticodon)
    g.append('line').attr('x1', cx - 18).attr('y1', cy).attr('x2', cx + 18).attr('y2', cy)
      .attr('stroke', '#2ecc71').attr('stroke-width', 3);
    // Anticodon letters
    const anticodon = codon.split('').map(b => {
      const comp = { A: 'U', U: 'A', G: 'C', C: 'G' };
      return comp[b];
    });
    anticodon.forEach((b, i) => {
      g.append('text').attr('x', cx - 14 + i * 14).attr('y', cy - 6)
        .attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 9)
        .attr('font-family', 'monospace').text(b);
    });
    // Amino acid at top
    g.append('circle').attr('cx', cx).attr('cy', cy + 48).attr('r', 12)
      .attr('fill', AA_COLORS[aa] || '#999').attr('stroke', '#fff').attr('stroke-width', 1);
    g.append('text').attr('x', cx).attr('y', cy + 48)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', '#fff').attr('font-size', 8).attr('font-weight', 'bold').text(aa);
    // Label
    g.append('text').attr('x', cx + 30).attr('y', cy + 20)
      .attr('fill', '#2ecc71').attr('font-size', 10).text('tRNA');
  }

  // ========== STAGE RENDERER ==========

  const renderers = [renderStage0, renderStage1, renderStage2, renderStage3,
                     renderStage4, renderStage5, renderStage6];

  function render() {
    svg.selectAll('*').remove();
    const g = svg.append('g');
    renderers[stage](g);
    stageLabel.text(`Stage ${stage}/${STAGES.length - 1}: ${STAGES[stage]}`);
    desc.text(DESCRIPTIONS[stage]);
    updateButtons();
  }

  function updateButtons() {
    backBtn.style('opacity', stage === 0 ? 0.4 : 1);
    fwdBtn.style('opacity', stage === STAGES.length - 1 ? 0.4 : 1);
    playBtn.text(playing ? '\u23F8 Pause' : '\u25B6 Play');
  }

  // ========== CONTROLS ==========

  function stepForward() {
    if (stage < STAGES.length - 1) { stage++; render(); }
    else if (playing) stopPlay();
  }
  function stepBack() {
    if (stage > 0) { stage--; render(); }
  }
  function startPlay() {
    playing = true;
    updateButtons();
    timer = setInterval(() => stepForward(), 2500 / speed);
  }
  function stopPlay() {
    playing = false;
    clearInterval(timer);
    timer = null;
    updateButtons();
  }

  fwdBtn.on('click', () => { if (playing) stopPlay(); stepForward(); });
  backBtn.on('click', () => { if (playing) stopPlay(); stepBack(); });
  playBtn.on('click', () => playing ? stopPlay() : startPlay());
  resetBtn.on('click', () => { stopPlay(); stage = 0; render(); });
  speedSel.on('change', function () {
    speed = +this.value;
    if (playing) { clearInterval(timer); timer = setInterval(() => stepForward(), 2500 / speed); }
  });

  // --- Init ---
  render();
}
