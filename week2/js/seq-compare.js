/**
 * HTGAA Week 2 — Sequencing Platform Comparison
 * Interactive radar/bar chart comparing sequencing platforms.
 */

function initSeqCompare(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const platforms = [
    {
      name: 'Sanger',
      color: '#6366f1',
      readLength: 95,    // ~900bp (normalized 0-100)
      accuracy: 99,      // 99.99%
      throughput: 5,     // Very low
      cost: 85,          // Medium-high per base
      speed: 60,         // Hours
      desc: '~900bp reads, 99.99% accuracy, gold standard for validation'
    },
    {
      name: 'Illumina',
      color: '#3b82f6',
      readLength: 30,    // 150-300bp
      accuracy: 95,      // 99.9%
      throughput: 98,    // Very high
      cost: 95,          // Very cheap per base
      speed: 30,         // Days
      desc: '150-300bp reads, highest throughput, $200/genome'
    },
    {
      name: 'PacBio HiFi',
      color: '#10b981',
      readLength: 80,    // 15-25kb
      accuracy: 97,      // 99.9%+ (HiFi)
      throughput: 50,    // Medium
      cost: 40,          // Expensive
      speed: 55,         // Hours-day
      desc: '15-25kb reads, 99.9%+ HiFi, resolves structural variants'
    },
    {
      name: 'Oxford Nanopore',
      color: '#f59e0b',
      readLength: 100,   // Unlimited (100kb+)
      accuracy: 75,      // ~97% raw (improving)
      throughput: 60,    // Medium-high
      cost: 60,          // Medium
      speed: 95,         // Real-time, minutes
      desc: '100kb+ reads, real-time, portable (MinION), ~97% raw accuracy'
    },
  ];

  const metrics = [
    { key: 'readLength', label: 'Read Length' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'throughput', label: 'Throughput' },
    { key: 'cost', label: 'Cost Efficiency' },
    { key: 'speed', label: 'Speed' },
  ];

  let activePlatforms = new Set(platforms.map(p => p.name));
  let chartMode = 'radar';

  el.innerHTML = `
    <div class="flex flex-col gap-4">
      <!-- Platform toggle buttons -->
      <div class="flex flex-wrap gap-2" id="seq-toggles">
        ${platforms.map(p => `
          <button class="seq-toggle flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-2"
            data-platform="${p.name}" style="border-color:${p.color}; background:${p.color}15; color:${p.color}">
            <span class="w-2.5 h-2.5 rounded-full" style="background:${p.color}"></span>
            ${p.name}
          </button>
        `).join('')}
        <button id="seq-mode" class="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          Switch to Bar
        </button>
      </div>

      <!-- Chart -->
      <div id="seq-chart" style="width:100%; height:300px;"></div>

      <!-- Platform details -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2" id="seq-details">
        ${platforms.map(p => `
          <div class="seq-detail rounded-lg p-3 border text-center text-xs" data-platform="${p.name}" style="border-color:${p.color}30; background:${p.color}08">
            <p class="font-bold mb-1" style="color:${p.color}">${p.name}</p>
            <p class="text-slate-500 dark:text-slate-400 leading-relaxed">${p.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const chartEl = el.querySelector('#seq-chart');
  const toggles = el.querySelectorAll('.seq-toggle');
  const modeBtn = el.querySelector('#seq-mode');

  function draw() {
    chartEl.innerHTML = '';
    if (chartMode === 'radar') drawRadar(); else drawBar();
  }

  function drawRadar() {
    const margin = 40;
    const w = chartEl.clientWidth;
    const h = 300;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - margin;
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const svg = d3.select(chartEl).append('svg')
      .attr('width', w).attr('height', h).attr('viewBox', `0 0 ${w} ${h}`).style('max-width', '100%');

    const numAxes = metrics.length;
    const angleSlice = (2 * Math.PI) / numAxes;

    // Grid circles
    [20, 40, 60, 80, 100].forEach(level => {
      const r = (level / 100) * radius;
      svg.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', isDark ? '#334155' : '#e2e8f0')
        .attr('stroke-width', level === 100 ? 1.5 : 0.5);

      if (level % 40 === 0) {
        svg.append('text')
          .attr('x', cx + 4).attr('y', cy - r + 4)
          .attr('font-size', '8px').attr('fill', textColor).attr('opacity', 0.5)
          .text(level);
      }
    });

    // Axes
    metrics.forEach((m, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x2 = cx + Math.cos(angle) * radius;
      const y2 = cy + Math.sin(angle) * radius;

      svg.append('line')
        .attr('x1', cx).attr('y1', cy).attr('x2', x2).attr('y2', y2)
        .attr('stroke', isDark ? '#334155' : '#e2e8f0').attr('stroke-width', 1);

      // Label
      const lx = cx + Math.cos(angle) * (radius + 18);
      const ly = cy + Math.sin(angle) * (radius + 18);
      svg.append('text')
        .attr('x', lx).attr('y', ly)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('font-size', '10px').attr('font-weight', '600')
        .attr('fill', textColor)
        .text(m.label);
    });

    // Platform polygons
    platforms.forEach(p => {
      if (!activePlatforms.has(p.name)) return;

      const points = metrics.map((m, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const val = p[m.key] / 100;
        return [
          cx + Math.cos(angle) * radius * val,
          cy + Math.sin(angle) * radius * val,
        ];
      });

      // Fill
      svg.append('polygon')
        .attr('points', points.map(pt => pt.join(',')).join(' '))
        .attr('fill', p.color).attr('fill-opacity', 0.12)
        .attr('stroke', p.color).attr('stroke-width', 2).attr('stroke-opacity', 0.8);

      // Dots
      points.forEach(([px, py]) => {
        svg.append('circle')
          .attr('cx', px).attr('cy', py).attr('r', 3.5)
          .attr('fill', p.color).attr('stroke', 'white').attr('stroke-width', 1.5);
      });
    });
  }

  function drawBar() {
    const margin = { top: 20, right: 15, bottom: 40, left: 90 };
    const w = chartEl.clientWidth - margin.left - margin.right;
    const h = 300 - margin.top - margin.bottom;
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const totalW = w + margin.left + margin.right;
    const totalH = h + margin.top + margin.bottom;
    const svg = d3.select(chartEl).append('svg')
      .attr('width', totalW)
      .attr('height', totalH)
      .attr('viewBox', `0 0 ${totalW} ${totalH}`)
      .style('max-width', '100%')
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const active = platforms.filter(p => activePlatforms.has(p.name));
    const y0 = d3.scaleBand().domain(metrics.map(m => m.label)).range([0, h]).padding(0.25);
    const y1 = d3.scaleBand().domain(active.map(p => p.name)).range([0, y0.bandwidth()]).padding(0.08);
    const x = d3.scaleLinear().domain([0, 100]).range([0, w]);

    svg.append('g')
      .call(d3.axisLeft(y0).tickSize(0))
      .selectAll('text').attr('fill', textColor).attr('font-size', '10px');
    svg.selectAll('.domain').attr('stroke', 'none');

    // Grid lines
    [25, 50, 75, 100].forEach(v => {
      svg.append('line')
        .attr('x1', x(v)).attr('y1', 0).attr('x2', x(v)).attr('y2', h)
        .attr('stroke', isDark ? '#334155' : '#e2e8f0').attr('stroke-width', 0.5);
    });

    metrics.forEach(m => {
      active.forEach(p => {
        svg.append('rect')
          .attr('x', 0)
          .attr('y', y0(m.label) + y1(p.name))
          .attr('width', x(p[m.key]))
          .attr('height', y1.bandwidth())
          .attr('rx', 3)
          .attr('fill', p.color).attr('fill-opacity', 0.75);
      });
    });

    // Legend
    active.forEach((p, i) => {
      svg.append('circle')
        .attr('cx', w - 80).attr('cy', i * 16 + 5)
        .attr('r', 4).attr('fill', p.color);
      svg.append('text')
        .attr('x', w - 72).attr('y', i * 16 + 9)
        .attr('font-size', '10px').attr('fill', textColor)
        .text(p.name);
    });
  }

  // Toggle platforms
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.platform;
      const p = platforms.find(pl => pl.name === name);
      if (activePlatforms.has(name) && activePlatforms.size > 1) {
        activePlatforms.delete(name);
        btn.style.background = 'transparent';
        btn.style.opacity = '0.4';
      } else {
        activePlatforms.add(name);
        btn.style.background = p.color + '15';
        btn.style.opacity = '1';
      }
      draw();
    });
  });

  modeBtn.addEventListener('click', () => {
    chartMode = chartMode === 'radar' ? 'bar' : 'radar';
    modeBtn.textContent = chartMode === 'radar' ? 'Switch to Bar' : 'Switch to Radar';
    draw();
  });

  draw();
}

export { initSeqCompare };
