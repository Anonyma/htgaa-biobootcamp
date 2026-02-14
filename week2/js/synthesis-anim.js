/**
 * HTGAA Week 2 — Phosphoramidite Synthesis Step-Through
 * Interactive 4-step DNA synthesis cycle animation with D3.
 */

function initSynthesisAnim(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const steps = [
    {
      title: '1. Detritylation (Deblocking)',
      desc: 'Acid (trichloroacetic acid, TCA) removes the 5\'-DMT protecting group from the last nucleotide on the solid support, exposing the 5\'-OH for the next coupling.',
      color: '#ef4444',
      detail: 'TCA in DCM • ~15 seconds • DMT⁺ cation is orange → monitored spectrophotometrically',
      yield: null,
    },
    {
      title: '2. Coupling',
      desc: 'A new phosphoramidite monomer (with its own DMT group) is activated by tetrazole and couples to the free 5\'-OH. This is the critical step — efficiency must be >99%.',
      color: '#3b82f6',
      detail: 'Tetrazole activator • 20-60 seconds • Coupling efficiency: 99.0-99.8%',
      yield: '99.5%',
    },
    {
      title: '3. Capping',
      desc: 'Acetic anhydride caps any unreacted 5\'-OH groups (failure sequences) with an acetyl group, preventing them from participating in subsequent cycles.',
      color: '#f59e0b',
      detail: 'Ac₂O + NMI in THF • ~10 seconds • Prevents deletion mutants',
      yield: null,
    },
    {
      title: '4. Oxidation',
      desc: 'Iodine oxidizes the phosphite triester linkage to a stable phosphotriester (P(III) → P(V)). This completes one synthesis cycle.',
      color: '#10b981',
      detail: 'I₂ in THF/pyridine/H₂O • ~15 seconds • Stabilizes the backbone',
      yield: null,
    },
  ];

  let currentStep = 0;
  let oligoLength = 1;
  const maxOligo = 8;

  el.innerHTML = `
    <div class="flex flex-col gap-4">
      <!-- Cycle counter -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-500">Synthesis Cycle:</span>
          <span id="synth-cycle" class="text-sm font-bold text-blue-600">${oligoLength} of ${maxOligo}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">Growing oligo:</span>
          <span id="synth-oligo-display" class="font-mono text-xs font-bold">3'—<span class="text-green-600">G</span>—5'</span>
        </div>
      </div>

      <!-- Step progress bar -->
      <div class="flex gap-1 h-2 rounded-full overflow-hidden">
        ${steps.map((s, i) => `
          <div class="synth-prog flex-1 rounded-full transition-all duration-300" data-step="${i}"
            style="background:${i === 0 ? s.color : (document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0')}"></div>
        `).join('')}
      </div>

      <!-- Visualization -->
      <div id="synth-viz" style="width:100%; height:220px;"></div>

      <!-- Info panel -->
      <div class="rounded-xl p-4 border transition-colors" id="synth-info"
        style="background:${steps[0].color}08; border-color:${steps[0].color}30">
        <div class="flex items-center justify-between mb-2">
          <h4 id="synth-title" class="font-bold text-sm" style="color:${steps[0].color}">${steps[0].title}</h4>
          <span id="synth-detail" class="text-xs text-slate-400">${steps[0].detail}</span>
        </div>
        <p id="synth-desc" class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">${steps[0].desc}</p>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between">
        <button id="synth-prev" class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30" disabled>← Previous</button>
        <div class="flex items-center gap-2">
          <button id="synth-reset" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 transition-colors">Reset</button>
          <button id="synth-next" class="px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">Next Step →</button>
        </div>
      </div>

      <!-- Yield calculator -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-xs text-slate-500">
        <span class="font-semibold">Cumulative yield:</span>
        <span id="synth-yield" class="font-mono font-bold text-blue-600">99.5%</span>
        <span class="mx-1">·</span>
        <span>Formula: (0.995)<sup id="synth-n">1</sup> = <span id="synth-yield-val">99.5%</span></span>
      </div>
    </div>
  `;

  const vizEl = el.querySelector('#synth-viz');
  const titleEl = el.querySelector('#synth-title');
  const descEl = el.querySelector('#synth-desc');
  const detailEl = el.querySelector('#synth-detail');
  const infoEl = el.querySelector('#synth-info');
  const cycleEl = el.querySelector('#synth-cycle');
  const oligoDisplay = el.querySelector('#synth-oligo-display');
  const yieldEl = el.querySelector('#synth-yield');
  const yieldN = el.querySelector('#synth-n');
  const yieldVal = el.querySelector('#synth-yield-val');
  const prevBtn = el.querySelector('#synth-prev');
  const nextBtn = el.querySelector('#synth-next');
  const resetBtn = el.querySelector('#synth-reset');
  const progBars = el.querySelectorAll('.synth-prog');

  const oligoSeq = ['G', 'A', 'T', 'C', 'A', 'G', 'T', 'C'];
  const baseColors = { 'A': '#ef4444', 'T': '#3b82f6', 'G': '#10b981', 'C': '#f59e0b' };

  function updateUI() {
    const step = steps[currentStep];
    titleEl.textContent = step.title;
    titleEl.style.color = step.color;
    descEl.textContent = step.desc;
    detailEl.textContent = step.detail;
    infoEl.style.background = step.color + '08';
    infoEl.style.borderColor = step.color + '30';

    const isDark = document.documentElement.classList.contains('dark');
    progBars.forEach((bar, i) => {
      bar.style.background = i <= currentStep ? steps[i].color : (isDark ? '#334155' : '#e2e8f0');
    });

    prevBtn.disabled = currentStep === 0 && oligoLength === 1;
    cycleEl.textContent = `${oligoLength} of ${maxOligo}`;

    // Oligo display
    let oligoHtml = "3'—";
    for (let i = 0; i < oligoLength; i++) {
      const base = oligoSeq[i];
      oligoHtml += `<span style="color:${baseColors[base]}">${base}</span>`;
      if (i < oligoLength - 1) oligoHtml += '·';
    }
    oligoHtml += "—5'";
    oligoDisplay.innerHTML = oligoHtml;

    // Yield
    const y = Math.pow(0.995, oligoLength) * 100;
    yieldEl.textContent = y.toFixed(1) + '%';
    yieldN.textContent = oligoLength;
    yieldVal.textContent = y.toFixed(1) + '%';

    drawViz();
  }

  function drawViz() {
    vizEl.innerHTML = '';
    const isDark = document.documentElement.classList.contains('dark');
    const w = vizEl.clientWidth;
    const h = 220;
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const svg = d3.select(vizEl).append('svg').attr('width', w).attr('height', h);

    // Solid support (bottom)
    svg.append('rect')
      .attr('x', 0).attr('y', h - 25)
      .attr('width', w).attr('height', 25)
      .attr('fill', isDark ? '#334155' : '#e2e8f0');
    svg.append('text')
      .attr('x', w / 2).attr('y', h - 9)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', textColor)
      .text('Solid Support (CPG bead)');

    // Draw existing oligo chain
    const baseW = 28;
    const baseH = 30;
    const chainStart = w / 2 - (oligoLength * baseW) / 2;
    const chainY = h - 55;

    for (let i = 0; i < oligoLength; i++) {
      const base = oligoSeq[i];
      const bx = chainStart + i * baseW;

      // Backbone connector
      if (i > 0) {
        svg.append('line')
          .attr('x1', bx).attr('y1', chainY + baseH / 2)
          .attr('x2', bx - 2).attr('y2', chainY + baseH / 2)
          .attr('stroke', textColor).attr('stroke-width', 2);
      }

      // Nucleotide box
      svg.append('rect')
        .attr('x', bx + 2).attr('y', chainY)
        .attr('width', baseW - 4).attr('height', baseH)
        .attr('rx', 4)
        .attr('fill', baseColors[base] + '20')
        .attr('stroke', baseColors[base]).attr('stroke-width', 1.5);

      svg.append('text')
        .attr('x', bx + baseW / 2).attr('y', chainY + baseH / 2 + 4)
        .attr('text-anchor', 'middle').attr('font-size', '12px').attr('font-weight', '700')
        .attr('fill', baseColors[base])
        .text(base);

      // Linker to support
      if (i === 0) {
        svg.append('line')
          .attr('x1', bx + baseW / 2).attr('y1', chainY + baseH)
          .attr('x2', bx + baseW / 2).attr('y2', h - 25)
          .attr('stroke', textColor).attr('stroke-width', 2);
      }
    }

    // 5' end DMT group or exposed OH
    const endX = chainStart + (oligoLength - 1) * baseW + baseW;
    if (currentStep === 0) {
      // DMT being removed - show it fading
      svg.append('rect')
        .attr('x', endX + 4).attr('y', chainY + 2)
        .attr('width', 32).attr('height', 26)
        .attr('rx', 4)
        .attr('fill', '#ef444430').attr('stroke', '#ef4444').attr('stroke-width', 1).attr('stroke-dasharray', '3,3');
      svg.append('text')
        .attr('x', endX + 20).attr('y', chainY + 19)
        .attr('text-anchor', 'middle').attr('font-size', '9px').attr('font-weight', '700')
        .attr('fill', '#ef4444')
        .text('DMT');

      // Arrow showing removal
      svg.append('text')
        .attr('x', endX + 50).attr('y', chainY - 5)
        .attr('font-size', '16px')
        .text('↗');
      svg.append('text')
        .attr('x', endX + 60).attr('y', chainY - 5)
        .attr('font-size', '9px').attr('fill', '#ef4444').attr('font-weight', '600')
        .text('TCA removes DMT');

    } else if (currentStep === 1) {
      // Coupling - new base approaching
      const newBase = oligoSeq[oligoLength] || 'A';
      svg.append('text')
        .attr('x', endX + 6).attr('y', chainY + 18)
        .attr('font-size', '12px').attr('font-weight', '700')
        .attr('fill', textColor)
        .text('OH');

      // Incoming nucleotide
      const incomingX = endX + 55;
      const incomingY = chainY - 40;
      svg.append('rect')
        .attr('x', incomingX).attr('y', incomingY)
        .attr('width', baseW).attr('height', baseH)
        .attr('rx', 4)
        .attr('fill', baseColors[newBase] + '20')
        .attr('stroke', baseColors[newBase]).attr('stroke-width', 2);
      svg.append('text')
        .attr('x', incomingX + baseW / 2).attr('y', incomingY + baseH / 2 + 4)
        .attr('text-anchor', 'middle').attr('font-size', '12px').attr('font-weight', '700')
        .attr('fill', baseColors[newBase])
        .text(newBase);

      // DMT on incoming
      svg.append('rect')
        .attr('x', incomingX + baseW + 2).attr('y', incomingY + 2)
        .attr('width', 28).attr('height', 26).attr('rx', 4)
        .attr('fill', '#8b5cf620').attr('stroke', '#8b5cf6').attr('stroke-width', 1);
      svg.append('text')
        .attr('x', incomingX + baseW + 16).attr('y', incomingY + 19)
        .attr('text-anchor', 'middle').attr('font-size', '8px').attr('font-weight', '700')
        .attr('fill', '#8b5cf6')
        .text('DMT');

      // Arrow
      svg.append('path')
        .attr('d', `M ${incomingX} ${incomingY + baseH} Q ${endX + 30} ${chainY + 10} ${endX + 20} ${chainY + 5}`)
        .attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)');

      // Arrowhead def
      svg.append('defs').append('marker')
        .attr('id', 'arrowhead').attr('markerWidth', 6).attr('markerHeight', 4)
        .attr('refX', 6).attr('refY', 2).attr('orient', 'auto')
        .append('polygon').attr('points', '0 0, 6 2, 0 4').attr('fill', '#3b82f6');

      svg.append('text')
        .attr('x', incomingX + 30).attr('y', incomingY - 6)
        .attr('text-anchor', 'middle').attr('font-size', '9px').attr('fill', '#3b82f6').attr('font-weight', '600')
        .text('Tetrazole activates');

    } else if (currentStep === 2) {
      // Capping - acetyl groups on failures
      svg.append('text')
        .attr('x', endX + 6).attr('y', chainY + 18)
        .attr('font-size', '10px').attr('font-weight', '700')
        .attr('fill', '#f59e0b')
        .text('Ac');

      svg.append('text')
        .attr('x', endX + 40).attr('y', chainY + 10)
        .attr('font-size', '9px').attr('fill', '#f59e0b').attr('font-weight', '600')
        .text('Cap failures');

      // Show a "failed" branch below
      const failY = chainY + baseH + 20;
      svg.append('rect')
        .attr('x', chainStart + baseW + 5).attr('y', failY)
        .attr('width', baseW * 2).attr('height', 18).attr('rx', 3)
        .attr('fill', '#fef3c7').attr('stroke', '#f59e0b').attr('stroke-width', 1);
      svg.append('text')
        .attr('x', chainStart + baseW * 2 + 5).attr('y', failY + 13)
        .attr('text-anchor', 'middle').attr('font-size', '8px').attr('fill', '#92400e')
        .text('Capped failure');

    } else if (currentStep === 3) {
      // Oxidation
      svg.append('text')
        .attr('x', endX + 6).attr('y', chainY + 18)
        .attr('font-size', '10px').attr('font-weight', '700')
        .attr('fill', '#10b981')
        .text('P=O');

      // Show backbone stabilization
      for (let i = 0; i < oligoLength - 1; i++) {
        const bx = chainStart + i * baseW + baseW;
        svg.append('circle')
          .attr('cx', bx).attr('cy', chainY + baseH + 8)
          .attr('r', 4)
          .attr('fill', '#10b98130').attr('stroke', '#10b981').attr('stroke-width', 1);
        svg.append('text')
          .attr('x', bx).attr('y', chainY + baseH + 11)
          .attr('text-anchor', 'middle').attr('font-size', '6px').attr('font-weight', '700')
          .attr('fill', '#10b981')
          .text('P');
      }

      svg.append('text')
        .attr('x', w / 2).attr('y', 20)
        .attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#10b981').attr('font-weight', '600')
        .text('I₂ oxidizes P(III) → P(V): stabilizes backbone');
    }

    // Direction labels
    svg.append('text')
      .attr('x', chainStart - 5).attr('y', chainY + baseH / 2 + 4)
      .attr('text-anchor', 'end').attr('font-size', '10px').attr('font-weight', '600')
      .attr('fill', textColor)
      .text("3'");
    svg.append('text')
      .attr('x', chainStart + oligoLength * baseW + 5).attr('y', chainY + baseH / 2 + 4)
      .attr('text-anchor', 'start').attr('font-size', '10px').attr('font-weight', '600')
      .attr('fill', textColor)
      .text("5'");
  }

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
    } else if (oligoLength > 1) {
      oligoLength--;
      currentStep = 3;
    }
    updateUI();
  });

  nextBtn.addEventListener('click', () => {
    if (currentStep < 3) {
      currentStep++;
    } else if (oligoLength < maxOligo) {
      oligoLength++;
      currentStep = 0;
    }
    updateUI();
  });

  resetBtn.addEventListener('click', () => {
    currentStep = 0;
    oligoLength = 1;
    updateUI();
  });

  updateUI();
}

export { initSynthesisAnim };
