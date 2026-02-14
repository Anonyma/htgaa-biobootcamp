/**
 * HTGAA Week 2 — CRISPR-Cas9 Mechanism Step-Through
 * Interactive D3 animation showing CRISPR mechanism step by step.
 */

function initCrisprAnim(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const steps = [
    {
      title: '1. Guide RNA Design',
      desc: 'A ~20nt guide RNA (gRNA) is designed to match the target DNA sequence. The gRNA is combined with a tracrRNA scaffold to form a single guide RNA (sgRNA).',
      color: '#8b5cf6',
    },
    {
      title: '2. Cas9 + sgRNA Complex',
      desc: 'The sgRNA loads into the Cas9 protein, forming the ribonucleoprotein (RNP) complex. Cas9 changes shape, opening a channel for DNA scanning.',
      color: '#6366f1',
    },
    {
      title: '3. PAM Recognition',
      desc: 'Cas9 scans DNA for a PAM sequence (NGG for SpCas9). It binds transiently, checking ~3 bases at a time. Without a PAM, Cas9 slides past.',
      color: '#3b82f6',
    },
    {
      title: '4. R-loop Formation',
      desc: 'After PAM binding, the guide RNA begins base-pairing with the target strand. DNA unwinds as an R-loop forms, ~20bp from PAM to seed region.',
      color: '#0ea5e9',
    },
    {
      title: '5. Double-Strand Break',
      desc: 'Full complementarity triggers conformational change. RuvC domain cuts the non-target strand; HNH domain cuts the target strand → blunt-ended DSB, 3bp upstream of PAM.',
      color: '#ef4444',
    },
    {
      title: '6. DNA Repair',
      desc: 'The cell repairs the break via NHEJ (error-prone → knockouts) or HDR (precise → insertions/edits with a donor template). NHEJ is default; HDR requires template + cell division.',
      color: '#10b981',
    },
  ];

  let currentStep = 0;

  el.innerHTML = `
    <div class="flex flex-col gap-4">
      <!-- Step indicator pills -->
      <div class="flex gap-1.5 flex-wrap" id="crispr-pills">
        ${steps.map((s, i) => `
          <button class="crispr-step-pill px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer
            ${i === 0 ? 'text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}"
            ${i === 0 ? `style="background:${s.color}"` : ''}
            data-step="${i}">
            ${i + 1}
          </button>
        `).join('')}
      </div>

      <!-- Visualization area -->
      <div id="crispr-viz" style="width:100%; height:260px;"></div>

      <!-- Info panel -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <h4 id="crispr-title" class="font-bold text-sm mb-1" style="color:${steps[0].color}">${steps[0].title}</h4>
        <p id="crispr-desc" class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">${steps[0].desc}</p>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between">
        <button id="crispr-prev" class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30" disabled>← Previous</button>
        <button id="crispr-play" class="px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">▶ Auto-Play</button>
        <button id="crispr-next" class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Next →</button>
      </div>
    </div>
  `;

  const vizEl = el.querySelector('#crispr-viz');
  const titleEl = el.querySelector('#crispr-title');
  const descEl = el.querySelector('#crispr-desc');
  const pills = el.querySelectorAll('.crispr-step-pill');
  const prevBtn = el.querySelector('#crispr-prev');
  const nextBtn = el.querySelector('#crispr-next');
  const playBtn = el.querySelector('#crispr-play');
  let playInterval = null;

  function goToStep(idx) {
    currentStep = Math.max(0, Math.min(steps.length - 1, idx));
    const step = steps[currentStep];

    titleEl.textContent = step.title;
    titleEl.style.color = step.color;
    descEl.textContent = step.desc;

    pills.forEach((p, i) => {
      if (i === currentStep) {
        p.className = 'crispr-step-pill px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer text-white shadow-md';
        p.style.background = steps[i].color;
      } else if (i < currentStep) {
        p.className = 'crispr-step-pill px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
        p.style.background = '';
      } else {
        p.className = 'crispr-step-pill px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600';
        p.style.background = '';
      }
    });

    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === steps.length - 1;

    drawStep(vizEl, currentStep);
  }

  function drawStep(container, stepIdx) {
    container.innerHTML = '';
    const isDark = document.documentElement.classList.contains('dark');

    const margin = { top: 15, right: 15, bottom: 15, left: 15 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;
    const midY = height / 2;

    const svg = d3.select(container).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const textColor = isDark ? '#94a3b8' : '#64748b';
    const dnaColor1 = isDark ? '#60a5fa' : '#3b82f6';
    const dnaColor2 = isDark ? '#34d399' : '#10b981';
    const guideColor = '#f59e0b';
    const cas9Color = '#8b5cf6';

    // DNA double helix (always present)
    const dnaLen = width * 0.8;
    const dnaStart = (width - dnaLen) / 2;

    // Draw complementary strand (bottom)
    svg.append('line')
      .attr('x1', dnaStart).attr('y1', midY + 12)
      .attr('x2', dnaStart + dnaLen).attr('y2', midY + 12)
      .attr('stroke', dnaColor2).attr('stroke-width', 4).attr('stroke-linecap', 'round');

    // Base pair rungs
    const numRungs = 30;
    for (let i = 0; i < numRungs; i++) {
      const xPos = dnaStart + (i + 0.5) * (dnaLen / numRungs);
      let topY = midY - 12;
      let botY = midY + 12;

      // Step-specific modifications
      if (stepIdx >= 3 && i >= 15 && i <= 22) {
        // R-loop: separate strands
        topY = midY - 30;
        botY = midY + 25;
      }
      if (stepIdx >= 4 && i === 18) {
        // Cut site - skip this rung
        continue;
      }

      svg.append('line')
        .attr('x1', xPos).attr('y1', topY + 4)
        .attr('x2', xPos).attr('y2', botY - 4)
        .attr('stroke', isDark ? '#475569' : '#cbd5e1')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', (stepIdx >= 4 && (i === 17 || i === 19)) ? 0.3 : 0.6);
    }

    // Draw target strand (top) - may be broken at step 5
    if (stepIdx < 4) {
      svg.append('line')
        .attr('x1', dnaStart).attr('y1', midY - 12)
        .attr('x2', dnaStart + dnaLen).attr('y2', midY - 12)
        .attr('stroke', dnaColor1).attr('stroke-width', 4).attr('stroke-linecap', 'round');
    } else if (stepIdx === 3) {
      // R-loop opening
      const loopStart = dnaStart + 15 * (dnaLen / numRungs);
      const loopEnd = dnaStart + 22 * (dnaLen / numRungs);
      svg.append('line')
        .attr('x1', dnaStart).attr('y1', midY - 12)
        .attr('x2', loopStart).attr('y2', midY - 12)
        .attr('stroke', dnaColor1).attr('stroke-width', 4).attr('stroke-linecap', 'round');
      // Displaced strand (curved up)
      svg.append('path')
        .attr('d', `M ${loopStart} ${midY - 12} Q ${(loopStart + loopEnd) / 2} ${midY - 45} ${loopEnd} ${midY - 12}`)
        .attr('fill', 'none').attr('stroke', dnaColor1).attr('stroke-width', 4).attr('stroke-linecap', 'round');
      svg.append('line')
        .attr('x1', loopEnd).attr('y1', midY - 12)
        .attr('x2', dnaStart + dnaLen).attr('y2', midY - 12)
        .attr('stroke', dnaColor1).attr('stroke-width', 4).attr('stroke-linecap', 'round');
    } else {
      // Steps 5-6: broken strand
      const cutX = dnaStart + 18 * (dnaLen / numRungs);
      // Left fragment
      svg.append('line')
        .attr('x1', dnaStart).attr('y1', midY - 12 + (stepIdx >= 5 ? -3 : 0))
        .attr('x2', cutX - 6).attr('y2', midY - 12 + (stepIdx >= 5 ? -3 : 0))
        .attr('stroke', dnaColor1).attr('stroke-width', 4).attr('stroke-linecap', 'round');
      // Right fragment
      svg.append('line')
        .attr('x1', cutX + 6).attr('y1', midY - 12 + (stepIdx >= 5 ? -3 : 0))
        .attr('x2', dnaStart + dnaLen).attr('y2', midY - 12 + (stepIdx >= 5 ? -3 : 0))
        .attr('stroke', dnaColor1).attr('stroke-width', 4).attr('stroke-linecap', 'round');

      // Bottom strand also broken at step 5
      if (stepIdx >= 4) {
        svg.selectAll('line').filter(function() {
          return d3.select(this).attr('stroke') === dnaColor2;
        }).remove();

        svg.append('line')
          .attr('x1', dnaStart).attr('y1', midY + 12 + (stepIdx >= 5 ? 3 : 0))
          .attr('x2', cutX - 6).attr('y2', midY + 12 + (stepIdx >= 5 ? 3 : 0))
          .attr('stroke', dnaColor2).attr('stroke-width', 4).attr('stroke-linecap', 'round');
        svg.append('line')
          .attr('x1', cutX + 6).attr('y1', midY + 12 + (stepIdx >= 5 ? 3 : 0))
          .attr('x2', dnaStart + dnaLen).attr('y2', midY + 12 + (stepIdx >= 5 ? 3 : 0))
          .attr('stroke', dnaColor2).attr('stroke-width', 4).attr('stroke-linecap', 'round');

        // Cut marker (lightning bolt / scissors)
        svg.append('text')
          .attr('x', cutX).attr('y', midY + 3)
          .attr('text-anchor', 'middle').attr('font-size', '18px')
          .text('✂️');
      }
    }

    // PAM site (steps 3+)
    if (stepIdx >= 2) {
      const pamX = dnaStart + 23 * (dnaLen / numRungs);
      svg.append('rect')
        .attr('x', pamX - 12).attr('y', midY + 20)
        .attr('width', 24).attr('height', 16)
        .attr('rx', 3)
        .attr('fill', '#ef4444').attr('fill-opacity', 0.2)
        .attr('stroke', '#ef4444').attr('stroke-width', 1.5);
      svg.append('text')
        .attr('x', pamX).attr('y', midY + 31)
        .attr('text-anchor', 'middle').attr('font-size', '9px').attr('font-weight', '700')
        .attr('fill', '#ef4444')
        .text('PAM');
      svg.append('text')
        .attr('x', pamX).attr('y', midY + 46)
        .attr('text-anchor', 'middle').attr('font-size', '8px')
        .attr('fill', textColor)
        .text('NGG');
    }

    // Guide RNA (steps 1+)
    if (stepIdx >= 0) {
      const grnaY = midY - 55 - (stepIdx >= 3 ? 15 : 0);
      const grnaStart = dnaStart + 10 * (dnaLen / numRungs);
      const grnaEnd = dnaStart + 22 * (dnaLen / numRungs);
      const grnaLen = grnaEnd - grnaStart;

      // sgRNA backbone
      svg.append('path')
        .attr('d', stepIdx < 3
          ? `M ${grnaStart} ${grnaY} L ${grnaEnd} ${grnaY} Q ${grnaEnd + 20} ${grnaY} ${grnaEnd + 15} ${grnaY - 20} L ${grnaEnd + 10} ${grnaY - 35}`
          : `M ${grnaStart} ${grnaY + 20} L ${grnaEnd} ${grnaY + 20} Q ${grnaEnd + 20} ${grnaY + 20} ${grnaEnd + 15} ${grnaY} L ${grnaEnd + 10} ${grnaY - 15}`)
        .attr('fill', 'none').attr('stroke', guideColor).attr('stroke-width', 3).attr('stroke-linecap', 'round');

      // sgRNA label
      svg.append('text')
        .attr('x', grnaStart + grnaLen / 2).attr('y', (stepIdx < 3 ? grnaY : grnaY + 20) - 8)
        .attr('text-anchor', 'middle').attr('font-size', '10px').attr('font-weight', '600')
        .attr('fill', guideColor)
        .text('sgRNA');

      // Target complementarity markers (step 4+)
      if (stepIdx >= 3) {
        for (let i = 0; i < 5; i++) {
          const bpX = grnaStart + (i + 1) * (grnaLen / 6);
          svg.append('line')
            .attr('x1', bpX).attr('y1', grnaY + 23)
            .attr('x2', bpX).attr('y2', midY - 28)
            .attr('stroke', guideColor).attr('stroke-width', 1).attr('stroke-dasharray', '2,2').attr('stroke-opacity', 0.5);
        }
      }
    }

    // Cas9 protein (steps 2+)
    if (stepIdx >= 1) {
      const cas9X = dnaStart + 16 * (dnaLen / numRungs);
      const cas9Y = midY;
      const cas9W = 80;
      const cas9H = stepIdx >= 4 ? 40 : 50;

      svg.append('ellipse')
        .attr('cx', cas9X).attr('cy', cas9Y)
        .attr('rx', cas9W / 2).attr('ry', cas9H / 2)
        .attr('fill', cas9Color).attr('fill-opacity', stepIdx >= 4 ? 0.1 : 0.15)
        .attr('stroke', cas9Color).attr('stroke-width', 2).attr('stroke-dasharray', stepIdx >= 4 ? '4,4' : 'none');

      svg.append('text')
        .attr('x', cas9X).attr('y', midY + 60)
        .attr('text-anchor', 'middle').attr('font-size', '11px').attr('font-weight', '600')
        .attr('fill', cas9Color)
        .text('Cas9');

      // Domain labels (step 5)
      if (stepIdx >= 4) {
        svg.append('text')
          .attr('x', cas9X - 18).attr('y', midY - 18)
          .attr('text-anchor', 'middle').attr('font-size', '8px').attr('font-weight', '600')
          .attr('fill', '#ef4444')
          .text('HNH');
        svg.append('text')
          .attr('x', cas9X + 18).attr('y', midY + 22)
          .attr('text-anchor', 'middle').attr('font-size', '8px').attr('font-weight', '600')
          .attr('fill', '#ef4444')
          .text('RuvC');
      }
    }

    // Step 6: repair pathways
    if (stepIdx === 5) {
      // NHEJ pathway (left)
      svg.append('rect')
        .attr('x', 10).attr('y', height - 55)
        .attr('width', width / 2 - 20).attr('height', 45)
        .attr('rx', 8)
        .attr('fill', '#fef3c7').attr('stroke', '#f59e0b').attr('stroke-width', 1.5);
      svg.append('text')
        .attr('x', width / 4).attr('y', height - 35)
        .attr('text-anchor', 'middle').attr('font-size', '11px').attr('font-weight', '700')
        .attr('fill', '#b45309')
        .text('NHEJ');
      svg.append('text')
        .attr('x', width / 4).attr('y', height - 20)
        .attr('text-anchor', 'middle').attr('font-size', '9px')
        .attr('fill', '#92400e')
        .text('Error-prone → Gene Knockout');

      // HDR pathway (right)
      svg.append('rect')
        .attr('x', width / 2 + 10).attr('y', height - 55)
        .attr('width', width / 2 - 20).attr('height', 45)
        .attr('rx', 8)
        .attr('fill', '#d1fae5').attr('stroke', '#10b981').attr('stroke-width', 1.5);
      svg.append('text')
        .attr('x', 3 * width / 4).attr('y', height - 35)
        .attr('text-anchor', 'middle').attr('font-size', '11px').attr('font-weight', '700')
        .attr('fill', '#047857')
        .text('HDR');
      svg.append('text')
        .attr('x', 3 * width / 4).attr('y', height - 20)
        .attr('text-anchor', 'middle').attr('font-size', '9px')
        .attr('fill', '#065f46')
        .text('Precise → Gene Edit / Insert');
    }

    // Legend
    const legendY = 8;
    const legendItems = [
      { color: dnaColor1, label: 'Target strand' },
      { color: dnaColor2, label: 'Complement strand' },
      { color: guideColor, label: 'Guide RNA' },
    ];
    if (stepIdx >= 1) legendItems.push({ color: cas9Color, label: 'Cas9' });

    legendItems.forEach((item, i) => {
      const lx = width - 100;
      svg.append('circle')
        .attr('cx', lx).attr('cy', legendY + i * 14)
        .attr('r', 4).attr('fill', item.color);
      svg.append('text')
        .attr('x', lx + 8).attr('y', legendY + i * 14 + 3.5)
        .attr('font-size', '9px').attr('fill', textColor)
        .text(item.label);
    });
  }

  // Event handlers
  pills.forEach(p => p.addEventListener('click', () => goToStep(parseInt(p.dataset.step))));
  prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
  nextBtn.addEventListener('click', () => goToStep(currentStep + 1));

  playBtn.addEventListener('click', () => {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
      playBtn.textContent = '▶ Auto-Play';
      return;
    }
    playBtn.textContent = '⏸ Pause';
    if (currentStep >= steps.length - 1) goToStep(0);
    playInterval = setInterval(() => {
      if (currentStep >= steps.length - 1) {
        clearInterval(playInterval);
        playInterval = null;
        playBtn.textContent = '▶ Auto-Play';
        return;
      }
      goToStep(currentStep + 1);
    }, 3000);
  });

  // Initial draw
  drawStep(vizEl, 0);
}

export { initCrisprAnim };
