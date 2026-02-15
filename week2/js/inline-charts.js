/**
 * HTGAA Week 2 — Inline Charts & Visual Widgets
 * Renders D3 charts, process diagrams, and infographic elements
 * that replace raw data or enhance content sections.
 */

/** Initialize all inline charts found in the container */
export function initInlineCharts(container) {
  // Platform trade-offs radar chart
  const radarEl = container.querySelector('#platform-tradeoffs-chart');
  if (radarEl && !radarEl.dataset.initialized) {
    radarEl.dataset.initialized = 'true';
    renderPlatformRadar(radarEl);
  }

  // Process/pipeline visualizations
  container.querySelectorAll('.topic-content ol').forEach(ol => {
    if (ol.dataset.enhanced || ol.closest('.quiz-container')) return;
    enhanceProcessSteps(ol);
  });

  // Comparison cards from content
  enhanceComparisonLists(container);
}

/** Render a radar chart comparing sequencing platforms */
function renderPlatformRadar(el) {
  const platforms = [
    { name: 'Illumina NovaSeq X', color: '#3b82f6', values: { readLength: 3, accuracy: 9, throughput: 10, costPerBase: 9, turnaround: 5, portability: 1, modDetect: 2 } },
    { name: 'PacBio Revio', color: '#10b981', values: { readLength: 8, accuracy: 9, throughput: 5, costPerBase: 5, turnaround: 5, portability: 1, modDetect: 7 } },
    { name: 'ONT PromethION', color: '#f59e0b', values: { readLength: 10, accuracy: 7, throughput: 7, costPerBase: 6, turnaround: 8, portability: 3, modDetect: 10 } },
    { name: 'ONT MinION', color: '#ef4444', values: { readLength: 10, accuracy: 6, throughput: 2, costPerBase: 3, turnaround: 9, portability: 10, modDetect: 10 } },
    { name: 'MGI DNBSEQ-T7', color: '#8b5cf6', values: { readLength: 3, accuracy: 9, throughput: 8, costPerBase: 9, turnaround: 5, portability: 1, modDetect: 2 } },
  ];

  const metrics = [
    { key: 'readLength', label: 'Read Length' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'throughput', label: 'Throughput' },
    { key: 'costPerBase', label: 'Cost/Base' },
    { key: 'turnaround', label: 'Speed' },
    { key: 'portability', label: 'Portability' },
    { key: 'modDetect', label: 'Mod Detection' },
  ];

  let active = new Set(platforms.map(p => p.name));

  // Build UI
  el.innerHTML = `
    <h3 class="flex items-center gap-2 mb-1">
      <i data-lucide="radar" class="w-5 h-5 text-blue-500"></i>
      Platform Trade-offs Radar
    </h3>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Click platforms to toggle. Each axis is scored 1–10.</p>
    <div class="flex flex-wrap gap-2 mb-4" id="radar-toggles">
      ${platforms.map(p => `
        <button class="radar-toggle flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-2"
          data-platform="${p.name}" style="border-color:${p.color}; background:${p.color}15; color:${p.color}">
          <span class="w-2.5 h-2.5 rounded-full" style="background:${p.color}"></span>
          ${p.name}
        </button>
      `).join('')}
    </div>
    <div id="radar-chart-area" style="width:100%; height:340px;"></div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-4" id="radar-platform-cards">
      ${platforms.map(p => `
        <div class="radar-card rounded-lg p-2.5 border text-center text-xs transition-opacity" data-platform="${p.name}" style="border-color:${p.color}25; background:${p.color}06">
          <div class="font-bold mb-1" style="color:${p.color}">${p.name}</div>
          <div class="text-slate-500 dark:text-slate-400 space-y-0.5">
            ${metrics.map(m => `<div class="flex justify-between"><span>${m.label}</span><span class="font-mono font-bold" style="color:${p.color}">${p.values[m.key]}</span></div>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const chartArea = el.querySelector('#radar-chart-area');

  function draw() {
    chartArea.innerHTML = '';
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    const w = chartArea.clientWidth;
    const h = 340;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 50;
    const numAxes = metrics.length;
    const angleSlice = (2 * Math.PI) / numAxes;

    const svg = d3.select(chartArea).append('svg').attr('width', w).attr('height', h).attr('viewBox', `0 0 ${w} ${h}`).style('max-width', '100%');

    // Grid
    [2, 4, 6, 8, 10].forEach(level => {
      const r = (level / 10) * radius;
      const pts = metrics.map((_, i) => {
        const a = angleSlice * i - Math.PI / 2;
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      });
      svg.append('polygon')
        .attr('points', pts.map(p => p.join(',')).join(' '))
        .attr('fill', 'none')
        .attr('stroke', gridColor)
        .attr('stroke-width', level === 10 ? 1.5 : 0.5)
        .attr('stroke-dasharray', level === 10 ? 'none' : '2,2');
    });

    // Axes + labels
    metrics.forEach((m, i) => {
      const a = angleSlice * i - Math.PI / 2;
      const x2 = cx + Math.cos(a) * radius;
      const y2 = cy + Math.sin(a) * radius;
      svg.append('line')
        .attr('x1', cx).attr('y1', cy).attr('x2', x2).attr('y2', y2)
        .attr('stroke', gridColor).attr('stroke-width', 1);

      const lx = cx + Math.cos(a) * (radius + 24);
      const ly = cy + Math.sin(a) * (radius + 24);
      svg.append('text')
        .attr('x', lx).attr('y', ly)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('font-size', '10px').attr('font-weight', '600')
        .attr('fill', textColor).text(m.label);
    });

    // Platform polygons with animation
    platforms.forEach(p => {
      if (!active.has(p.name)) return;
      const points = metrics.map((m, i) => {
        const a = angleSlice * i - Math.PI / 2;
        const val = p.values[m.key] / 10;
        return [cx + Math.cos(a) * radius * val, cy + Math.sin(a) * radius * val];
      });

      svg.append('polygon')
        .attr('points', points.map(pt => pt.join(',')).join(' '))
        .attr('fill', p.color).attr('fill-opacity', 0.1)
        .attr('stroke', p.color).attr('stroke-width', 2.5).attr('stroke-opacity', 0.85)
        .attr('stroke-linejoin', 'round');

      points.forEach(([px, py]) => {
        svg.append('circle')
          .attr('cx', px).attr('cy', py).attr('r', 4)
          .attr('fill', p.color).attr('stroke', isDark ? '#1e293b' : '#fff').attr('stroke-width', 2);
      });
    });
  }

  // Toggle
  el.querySelectorAll('.radar-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.platform;
      const p = platforms.find(pl => pl.name === name);
      const card = el.querySelector(`.radar-card[data-platform="${name}"]`);
      if (active.has(name) && active.size > 1) {
        active.delete(name);
        btn.style.opacity = '0.35';
        btn.style.background = 'transparent';
        if (card) card.style.opacity = '0.3';
      } else {
        active.add(name);
        btn.style.opacity = '1';
        btn.style.background = p.color + '15';
        if (card) card.style.opacity = '1';
      }
      draw();
    });
  });

  // Initial draw (deferred for layout)
  requestAnimationFrame(() => {
    if (chartArea.clientWidth > 0) draw();
    else requestAnimationFrame(draw);
  });

  // Redraw on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(draw, 200);
  });

  if (window.lucide) lucide.createIcons();
}

/** Enhance ordered lists that describe sequential processes into visual step timelines */
function enhanceProcessSteps(ol) {
  const items = ol.querySelectorAll(':scope > li');
  if (items.length < 3 || items.length > 10) return;

  // Check if this looks like a process (has numbered steps with action words)
  const text = ol.textContent.toLowerCase();
  const isProcess = /\b(step|cycle|stage|phase|then|next|first|finally|after|before)\b/.test(text) ||
                    items.length >= 4;
  if (!isProcess) return;

  ol.dataset.enhanced = 'true';
  ol.classList.add('process-steps');

  // Add connecting line between steps
  items.forEach((li, i) => {
    if (i < items.length - 1) {
      li.classList.add('process-step-connected');
    }
    li.classList.add('process-step');
  });
}

/** Enhance comparison bullet lists into visual comparison cards */
function enhanceComparisonLists(container) {
  container.querySelectorAll('.topic-content ul').forEach(ul => {
    if (ul.dataset.enhanced || ul.closest('.quiz-container, .callout, .callout-insight')) return;

    const items = ul.querySelectorAll(':scope > li');
    if (items.length < 3 || items.length > 12) return;

    // Check if items start with bold labels (comparison pattern)
    let boldCount = 0;
    items.forEach(li => {
      if (/^<strong>/.test(li.innerHTML.trim())) boldCount++;
    });

    if (boldCount >= items.length * 0.7) {
      ul.dataset.enhanced = 'true';
      ul.classList.add('comparison-cards');
    }
  });
}
