/**
 * HTGAA Week 2 — Gibson Assembly Step-Through Animation
 * Interactive visualization of the 4-step Gibson Assembly process using D3.
 */

function initGibsonAnim(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const steps = [
    {
      title: '1. Starting Fragments',
      desc: 'Three DNA fragments with 20-40 bp overlapping ends are mixed in a single tube at 50°C with the Gibson Assembly master mix containing three enzymes.',
      color: '#6366f1',
      detail: '50°C isothermal reaction · 3 enzymes · 15-60 min incubation',
    },
    {
      title: '2. T5 Exonuclease Chewback',
      desc: 'T5 exonuclease degrades the 5\' ends of each fragment, creating single-stranded 3\' overhangs. These exposed overhangs contain the complementary overlap sequences.',
      color: '#ef4444',
      detail: 'T5 exonuclease · 5\'→3\' degradation · Creates 3\' ssDNA overhangs',
    },
    {
      title: '3. Annealing of Overlaps',
      desc: 'The complementary 3\' overhangs from adjacent fragments spontaneously anneal (base-pair) to each other. T5 exonuclease is heat-inactivated at 50°C.',
      color: '#f59e0b',
      detail: 'Complementary overhangs hybridize · T5 heat-inactivated at 50°C',
    },
    {
      title: '4. Gap Fill & Ligation',
      desc: 'Phusion DNA polymerase fills in the single-stranded gaps. Taq DNA ligase seals the remaining nicks, creating a continuous, fully double-stranded assembled product.',
      color: '#10b981',
      detail: 'Phusion polymerase fills gaps · Taq ligase seals nicks · Product complete',
    },
  ];

  let currentStep = 0;
  const isDark = () => document.documentElement.classList.contains('dark');

  el.innerHTML = `
    <div class="flex flex-col gap-4">
      <!-- Step progress bar -->
      <div class="flex gap-1 h-2 rounded-full overflow-hidden">
        ${steps.map((s, i) => `
          <div class="gibson-prog flex-1 rounded-full transition-all duration-300" data-step="${i}"
            style="background:${i === 0 ? s.color : (isDark() ? '#334155' : '#e2e8f0')}"></div>
        `).join('')}
      </div>

      <!-- Visualization area -->
      <div id="gibson-viz" style="width:100%; height:260px; position:relative; overflow:hidden;"></div>

      <!-- Info panel -->
      <div class="rounded-xl p-4 border transition-colors" id="gibson-info"
        style="background:${steps[0].color}08; border-color:${steps[0].color}30">
        <div class="flex items-center justify-between mb-2">
          <h4 id="gibson-title" class="font-bold text-sm" style="color:${steps[0].color}">${steps[0].title}</h4>
          <span id="gibson-detail" class="text-xs text-slate-400">${steps[0].detail}</span>
        </div>
        <p id="gibson-desc" class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">${steps[0].desc}</p>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between">
        <button id="gibson-prev" class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30" disabled>← Previous</button>
        <div class="flex items-center gap-2">
          <button id="gibson-reset" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 transition-colors">Reset</button>
          <button id="gibson-next" class="px-4 py-1.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Next Step →</button>
        </div>
      </div>

      <!-- Enzyme legend -->
      <div class="flex flex-wrap gap-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span> T5 Exonuclease</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Phusion Polymerase</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Taq Ligase</span>
        <span class="mx-2">·</span>
        <span class="font-semibold">50°C isothermal · Single tube · 15-60 min</span>
      </div>
    </div>
  `;

  const vizEl = el.querySelector('#gibson-viz');
  const titleEl = el.querySelector('#gibson-title');
  const descEl = el.querySelector('#gibson-desc');
  const detailEl = el.querySelector('#gibson-detail');
  const infoEl = el.querySelector('#gibson-info');
  const prevBtn = el.querySelector('#gibson-prev');
  const nextBtn = el.querySelector('#gibson-next');
  const resetBtn = el.querySelector('#gibson-reset');
  const progBars = el.querySelectorAll('.gibson-prog');

  // Fragment definitions
  const fragColors = ['#6366f1', '#f59e0b', '#10b981']; // indigo, amber, green
  const fragLabels = ['Fragment A', 'Fragment B', 'Fragment C'];
  const overlapColor = '#ec4899'; // pink for overlaps

  // D3 setup
  const w = vizEl.clientWidth || 600;
  const h = 260;
  const svg = d3.select(vizEl).append('svg')
    .attr('width', '100%')
    .attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`);

  // Draw functions for each step
  function drawStep0() {
    // Three separate fragments with overlap regions highlighted
    svg.selectAll('*').remove();
    const fragW = w * 0.28;
    const fragH = 28;
    const gap = w * 0.04;
    const startX = (w - (3 * fragW + 2 * gap)) / 2;
    const cy = h / 2;

    const frags = svg.selectAll('.frag-group')
      .data([0, 1, 2])
      .enter().append('g')
      .attr('class', 'frag-group')
      .attr('transform', (d, i) => `translate(${startX + i * (fragW + gap)}, ${cy - fragH})`);

    // Top strand
    frags.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', fragW).attr('height', fragH / 2 - 1)
      .attr('rx', 3)
      .attr('fill', (d, i) => fragColors[i])
      .attr('opacity', 0.8);

    // Bottom strand
    frags.append('rect')
      .attr('x', 0).attr('y', fragH / 2 + 1)
      .attr('width', fragW).attr('height', fragH / 2 - 1)
      .attr('rx', 3)
      .attr('fill', (d, i) => fragColors[i])
      .attr('opacity', 0.5);

    // Overlap regions on the right end (except last fragment)
    frags.filter((d, i) => i < 2).each(function(d, i) {
      const g = d3.select(this);
      // Right overlap
      g.append('rect')
        .attr('x', fragW - 30).attr('y', 0)
        .attr('width', 30).attr('height', fragH - 1)
        .attr('rx', 3).attr('fill', overlapColor).attr('opacity', 0.6);
    });

    // Overlap regions on the left end (except first fragment)
    frags.filter((d, i) => i > 0).each(function(d, i) {
      const g = d3.select(this);
      g.append('rect')
        .attr('x', 0).attr('y', 0)
        .attr('width', 30).attr('height', fragH - 1)
        .attr('rx', 3).attr('fill', overlapColor).attr('opacity', 0.6);
    });

    // Labels
    frags.append('text')
      .attr('x', fragW / 2).attr('y', fragH + 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', (d, i) => fragColors[i])
      .text((d, i) => fragLabels[i]);

    // 5' / 3' labels
    frags.append('text')
      .attr('x', -8).attr('y', 8).attr('font-size', '8px')
      .attr('fill', isDark() ? '#94a3b8' : '#64748b').text("5'");
    frags.append('text')
      .attr('x', fragW + 3).attr('y', 8).attr('font-size', '8px')
      .attr('fill', isDark() ? '#94a3b8' : '#64748b').text("3'");
    frags.append('text')
      .attr('x', -8).attr('y', fragH - 2).attr('font-size', '8px')
      .attr('fill', isDark() ? '#94a3b8' : '#64748b').text("3'");
    frags.append('text')
      .attr('x', fragW + 3).attr('y', fragH - 2).attr('font-size', '8px')
      .attr('fill', isDark() ? '#94a3b8' : '#64748b').text("5'");

    // Overlap markers
    svg.append('text')
      .attr('x', startX + fragW - 15).attr('y', cy + fragH + 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px').attr('fill', overlapColor).attr('font-weight', '600')
      .text('overlap');
    svg.append('text')
      .attr('x', startX + fragW + gap + 15).attr('y', cy + fragH + 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px').attr('fill', overlapColor).attr('font-weight', '600')
      .text('overlap');

    // Temperature indicator
    svg.append('text')
      .attr('x', w / 2).attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px').attr('font-weight', '700')
      .attr('fill', isDark() ? '#e2e8f0' : '#334155')
      .text('50°C Isothermal Reaction');
  }

  function drawStep1() {
    // T5 exonuclease chewing back 5' ends
    svg.selectAll('*').remove();
    const fragW = w * 0.28;
    const fragH = 28;
    const gap = w * 0.04;
    const startX = (w - (3 * fragW + 2 * gap)) / 2;
    const cy = h / 2;
    const chewBack = 35;

    const frags = svg.selectAll('.frag-group')
      .data([0, 1, 2])
      .enter().append('g')
      .attr('class', 'frag-group')
      .attr('transform', (d, i) => `translate(${startX + i * (fragW + gap)}, ${cy - fragH})`);

    // Top strand (5'→3') — chewed back from 5' end
    frags.append('rect')
      .attr('x', chewBack).attr('y', 0)
      .attr('width', fragW - chewBack).attr('height', fragH / 2 - 1)
      .attr('rx', 3)
      .attr('fill', (d, i) => fragColors[i])
      .attr('opacity', 0.8);

    // Dashed lines showing degraded 5' region
    frags.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', chewBack).attr('height', fragH / 2 - 1)
      .attr('rx', 3)
      .attr('fill', 'none')
      .attr('stroke', (d, i) => fragColors[i])
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.4);

    // Bottom strand (3'→5') — full length, exposed as single-stranded 3' overhang
    frags.append('rect')
      .attr('x', 0).attr('y', fragH / 2 + 1)
      .attr('width', fragW).attr('height', fragH / 2 - 1)
      .attr('rx', 3)
      .attr('fill', (d, i) => fragColors[i])
      .attr('opacity', 0.5);

    // 3' overhang highlight
    frags.append('rect')
      .attr('x', 0).attr('y', fragH / 2 + 1)
      .attr('width', chewBack).attr('height', fragH / 2 - 1)
      .attr('rx', 3)
      .attr('fill', overlapColor)
      .attr('opacity', 0.5);

    // Same for 3' end (5' of complementary strand chewed from right)
    frags.append('rect')
      .attr('x', 0).attr('y', fragH / 2 + 1)
      .attr('width', fragW - chewBack).attr('height', fragH / 2 - 1)
      .attr('rx', 3)
      .attr('fill', (d, i) => fragColors[i])
      .attr('opacity', 0.5);

    // T5 enzyme indicators
    frags.append('circle')
      .attr('cx', chewBack / 2).attr('cy', fragH / 4)
      .attr('r', 8)
      .attr('fill', '#ef4444')
      .attr('opacity', 0.9);
    frags.append('text')
      .attr('x', chewBack / 2).attr('y', fragH / 4 + 3)
      .attr('text-anchor', 'middle')
      .attr('font-size', '6px').attr('font-weight', '700').attr('fill', 'white')
      .text('T5');

    // Degradation arrows
    frags.append('line')
      .attr('x1', chewBack + 5).attr('y1', fragH / 4)
      .attr('x2', chewBack - 10).attr('y2', fragH / 4)
      .attr('stroke', '#ef4444').attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow-red)');

    // Labels
    frags.append('text')
      .attr('x', fragW / 2).attr('y', fragH + 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px').attr('font-weight', '600')
      .attr('fill', (d, i) => fragColors[i])
      .text((d, i) => fragLabels[i]);

    // 3' overhang label
    frags.append('text')
      .attr('x', chewBack / 2).attr('y', fragH + 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px').attr('fill', overlapColor).attr('font-weight', '600')
      .text("3' overhang");

    // Arrow marker definition
    svg.append('defs').append('marker')
      .attr('id', 'arrow-red').attr('viewBox', '0 0 10 10')
      .attr('refX', 5).attr('refY', 5)
      .attr('markerWidth', 4).attr('markerHeight', 4)
      .attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill', '#ef4444');

    // Title
    svg.append('text')
      .attr('x', w / 2).attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px').attr('font-weight', '700')
      .attr('fill', '#ef4444')
      .text('T5 Exonuclease: 5\'→3\' Degradation');
  }

  function drawStep2() {
    // Fragments coming together, overhangs annealing
    svg.selectAll('*').remove();
    const totalW = w * 0.85;
    const fragH = 28;
    const startX = (w - totalW) / 2;
    const cy = h / 2;
    const overlapW = 30;

    // Assembled fragments shown coming together
    const segW = (totalW - 2 * overlapW) / 3;

    // Fragment A
    const gA = svg.append('g').attr('transform', `translate(${startX}, ${cy - fragH})`);
    gA.append('rect').attr('x', 0).attr('y', 0).attr('width', segW + overlapW).attr('height', fragH / 2 - 1)
      .attr('rx', 3).attr('fill', fragColors[0]).attr('opacity', 0.8);
    gA.append('rect').attr('x', 0).attr('y', fragH / 2 + 1).attr('width', segW).attr('height', fragH / 2 - 1)
      .attr('rx', 3).attr('fill', fragColors[0]).attr('opacity', 0.5);

    // Fragment B
    const bX = startX + segW;
    const gB = svg.append('g').attr('transform', `translate(${bX}, ${cy - fragH})`);
    gB.append('rect').attr('x', overlapW).attr('y', 0).attr('width', segW).attr('height', fragH / 2 - 1)
      .attr('rx', 3).attr('fill', fragColors[1]).attr('opacity', 0.8);
    gB.append('rect').attr('x', 0).attr('y', fragH / 2 + 1).attr('width', segW + overlapW).attr('height', fragH / 2 - 1)
      .attr('rx', 3).attr('fill', fragColors[1]).attr('opacity', 0.5);

    // Overlap zone A-B (annealed)
    svg.append('rect')
      .attr('x', startX + segW).attr('y', cy - fragH)
      .attr('width', overlapW).attr('height', fragH - 1)
      .attr('rx', 3).attr('fill', overlapColor).attr('opacity', 0.6);

    // Fragment C
    const cX = startX + 2 * segW + overlapW;
    const gC = svg.append('g').attr('transform', `translate(${cX}, ${cy - fragH})`);
    gC.append('rect').attr('x', overlapW).attr('y', 0).attr('width', segW).attr('height', fragH / 2 - 1)
      .attr('rx', 3).attr('fill', fragColors[2]).attr('opacity', 0.8);
    gC.append('rect').attr('x', 0).attr('y', fragH / 2 + 1).attr('width', segW + overlapW).attr('height', fragH / 2 - 1)
      .attr('rx', 3).attr('fill', fragColors[2]).attr('opacity', 0.5);

    // Overlap zone B-C (annealed)
    svg.append('rect')
      .attr('x', cX).attr('y', cy - fragH)
      .attr('width', overlapW).attr('height', fragH - 1)
      .attr('rx', 3).attr('fill', overlapColor).attr('opacity', 0.6);

    // Annealing arrows
    const arrowY = cy + fragH / 2 + 12;
    [startX + segW + overlapW / 2, cX + overlapW / 2].forEach(x => {
      svg.append('text')
        .attr('x', x).attr('y', arrowY)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px').attr('fill', overlapColor).attr('font-weight', '600')
        .text('annealed');
    });

    // Gap indicators (dashed outlines showing gaps)
    svg.append('rect')
      .attr('x', startX + segW + overlapW).attr('y', cy - fragH + fragH / 2 + 1)
      .attr('width', 0).attr('height', fragH / 2 - 1)
      .attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-dasharray', '2,2');

    // Title
    svg.append('text')
      .attr('x', w / 2).attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px').attr('font-weight', '700')
      .attr('fill', '#f59e0b')
      .text('Complementary 3\' Overhangs Anneal');

    // Fragment labels below
    svg.append('text').attr('x', startX + segW / 2).attr('y', cy + fragH + 5)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('font-weight', '600')
      .attr('fill', fragColors[0]).text('A');
    svg.append('text').attr('x', bX + segW / 2 + overlapW / 2).attr('y', cy + fragH + 5)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('font-weight', '600')
      .attr('fill', fragColors[1]).text('B');
    svg.append('text').attr('x', cX + segW / 2 + overlapW / 2).attr('y', cy + fragH + 5)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('font-weight', '600')
      .attr('fill', fragColors[2]).text('C');
  }

  function drawStep3() {
    // Final assembled product
    svg.selectAll('*').remove();
    const totalW = w * 0.85;
    const fragH = 32;
    const startX = (w - totalW) / 2;
    const cy = h / 2;

    // Full assembled double-stranded DNA
    const segW = totalW / 3;

    // Top strand - continuous
    [0, 1, 2].forEach(i => {
      svg.append('rect')
        .attr('x', startX + i * segW + 1).attr('y', cy - fragH / 2)
        .attr('width', segW - 2).attr('height', fragH / 2 - 1)
        .attr('rx', i === 0 ? 3 : 0)
        .attr('fill', fragColors[i]).attr('opacity', 0.85);
    });

    // Bottom strand - continuous
    [0, 1, 2].forEach(i => {
      svg.append('rect')
        .attr('x', startX + i * segW + 1).attr('y', cy + 1)
        .attr('width', segW - 2).attr('height', fragH / 2 - 1)
        .attr('rx', i === 2 ? 3 : 0)
        .attr('fill', fragColors[i]).attr('opacity', 0.5);
    });

    // Ligation points (green stars)
    [1, 2].forEach(i => {
      const x = startX + i * segW;
      // Ligase indicator
      svg.append('circle')
        .attr('cx', x).attr('cy', cy - fragH / 4)
        .attr('r', 8).attr('fill', '#10b981').attr('opacity', 0.9);
      svg.append('text')
        .attr('x', x).attr('y', cy - fragH / 4 + 3)
        .attr('text-anchor', 'middle')
        .attr('font-size', '5px').attr('font-weight', '700').attr('fill', 'white')
        .text('LIG');

      // Polymerase indicator on bottom
      svg.append('circle')
        .attr('cx', x).attr('cy', cy + fragH / 4 + 1)
        .attr('r', 8).attr('fill', '#3b82f6').attr('opacity', 0.9);
      svg.append('text')
        .attr('x', x).attr('y', cy + fragH / 4 + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', '5px').attr('font-weight', '700').attr('fill', 'white')
        .text('POL');
    });

    // Checkmark / success indicator
    svg.append('circle')
      .attr('cx', w / 2).attr('cy', cy + fragH + 20)
      .attr('r', 14).attr('fill', '#10b981');
    svg.append('text')
      .attr('x', w / 2).attr('y', cy + fragH + 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px').attr('fill', 'white')
      .text('✓');

    // Title
    svg.append('text')
      .attr('x', w / 2).attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px').attr('font-weight', '700')
      .attr('fill', '#10b981')
      .text('Assembled Product — Gaps Filled & Nicks Sealed');

    // Fragment origin labels
    svg.append('text').attr('x', startX + segW / 2).attr('y', cy - fragH / 2 - 8)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('font-weight', '600')
      .attr('fill', fragColors[0]).text('from A');
    svg.append('text').attr('x', startX + segW * 1.5).attr('y', cy - fragH / 2 - 8)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('font-weight', '600')
      .attr('fill', fragColors[1]).text('from B');
    svg.append('text').attr('x', startX + segW * 2.5).attr('y', cy - fragH / 2 - 8)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('font-weight', '600')
      .attr('fill', fragColors[2]).text('from C');

    // Success text
    svg.append('text')
      .attr('x', w / 2).attr('y', cy + fragH + 48)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px').attr('font-weight', '500')
      .attr('fill', isDark() ? '#94a3b8' : '#64748b')
      .text('Seamless, scarless assembly of 3 fragments in a single reaction');
  }

  const drawFns = [drawStep0, drawStep1, drawStep2, drawStep3];

  function updateUI() {
    const step = steps[currentStep];
    titleEl.textContent = step.title;
    titleEl.style.color = step.color;
    descEl.textContent = step.desc;
    detailEl.textContent = step.detail;
    infoEl.style.background = step.color + '08';
    infoEl.style.borderColor = step.color + '30';

    const dk = isDark();
    progBars.forEach((bar, i) => {
      bar.style.background = i <= currentStep ? steps[i].color : (dk ? '#334155' : '#e2e8f0');
    });

    prevBtn.disabled = currentStep === 0;
    nextBtn.textContent = currentStep === steps.length - 1 ? 'Restart ↺' : 'Next Step →';

    drawFns[currentStep]();
  }

  nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
    } else {
      currentStep = 0;
    }
    updateUI();
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateUI();
    }
  });

  resetBtn.addEventListener('click', () => {
    currentStep = 0;
    updateUI();
  });

  // Initial draw
  updateUI();
}

// Support both module and global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initGibsonAnim };
} else if (typeof window !== 'undefined') {
  window.initGibsonAnim = initGibsonAnim;
}
