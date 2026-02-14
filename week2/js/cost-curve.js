/**
 * HTGAA Week 2 — Sequencing Cost Curve
 * Interactive D3 chart showing the dramatic drop in sequencing costs over time.
 */

function initCostCurve(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  // Historical data: cost per human genome
  const data = [
    { year: 2001, cost: 100000000, event: 'Human Genome Project' },
    { year: 2003, cost: 50000000, event: 'HGP completed' },
    { year: 2004, cost: 20000000, event: '' },
    { year: 2005, cost: 14000000, event: '' },
    { year: 2006, cost: 10000000, event: '454 GS20' },
    { year: 2007, cost: 8000000, event: 'Illumina GA' },
    { year: 2008, cost: 1500000, event: '' },
    { year: 2009, cost: 100000, event: '' },
    { year: 2010, cost: 50000, event: '' },
    { year: 2011, cost: 10000, event: 'HiSeq 2000' },
    { year: 2012, cost: 7000, event: '' },
    { year: 2013, cost: 5000, event: '' },
    { year: 2014, cost: 1000, event: 'HiSeq X Ten' },
    { year: 2015, cost: 1500, event: '' },
    { year: 2016, cost: 1100, event: '' },
    { year: 2017, cost: 1000, event: '' },
    { year: 2018, cost: 800, event: '' },
    { year: 2019, cost: 600, event: 'NovaSeq' },
    { year: 2020, cost: 500, event: '' },
    { year: 2021, cost: 400, event: '' },
    { year: 2022, cost: 200, event: 'Ultima, Element' },
    { year: 2023, cost: 200, event: '' },
    { year: 2024, cost: 150, event: '' },
    { year: 2025, cost: 100, event: '$100 genome era' },
  ];

  // Moore's Law comparison
  const mooresLaw = [];
  const mooreStart = 100000000;
  for (let y = 2001; y <= 2025; y++) {
    mooresLaw.push({ year: y, cost: mooreStart * Math.pow(0.5, (y - 2001) / 1.5) });
  }

  el.innerHTML = `
    <div id="cost-chart" style="width:100%; height:350px;"></div>
    <div class="flex items-center gap-6 mt-3 text-xs">
      <span class="flex items-center gap-1"><span class="w-3 h-0.5 bg-blue-500 inline-block"></span> Sequencing cost</span>
      <span class="flex items-center gap-1"><span class="w-3 h-0.5 bg-slate-400 inline-block" style="border-bottom: 2px dashed #94a3b8"></span> Moore's Law</span>
    </div>
    <p class="text-xs text-slate-400 mt-2">Data: NHGRI Genome Sequencing Costs. The cost drop outpaced Moore's Law by ~4x.</p>
  `;

  const chartEl = el.querySelector('#cost-chart');
  drawCostCurve(chartEl, data, mooresLaw);
}

function drawCostCurve(container, data, mooresLaw) {
  const margin = { top: 20, right: 30, bottom: 40, left: 70 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;
  const isDark = document.documentElement.classList.contains('dark');

  const svg = d3.select(container).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([2001, 2025]).range([0, width]);
  const y = d3.scaleLog().domain([50, 200000000]).range([height, 0]);

  // Grid lines
  svg.append('g')
    .call(d3.axisLeft(y).ticks(8, '~s').tickSize(-width))
    .selectAll('line').attr('stroke', isDark ? '#1e293b' : '#f1f5f9');

  // Axes
  const xAxis = svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format('d')));

  const yAxis = svg.append('g')
    .call(d3.axisLeft(y).ticks(8, '$~s'));

  [xAxis, yAxis].forEach(axis => {
    axis.selectAll('text').attr('fill', isDark ? '#94a3b8' : '#64748b').attr('font-size', '10px');
    axis.selectAll('.domain').attr('stroke', isDark ? '#475569' : '#e2e8f0');
    axis.selectAll('.tick line').attr('stroke', isDark ? '#334155' : '#e2e8f0');
  });

  // Axis labels
  svg.append('text')
    .attr('x', width / 2).attr('y', height + 35)
    .attr('text-anchor', 'middle').attr('font-size', '11px')
    .attr('fill', isDark ? '#94a3b8' : '#64748b')
    .text('Year');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2).attr('y', -55)
    .attr('text-anchor', 'middle').attr('font-size', '11px')
    .attr('fill', isDark ? '#94a3b8' : '#64748b')
    .text('Cost per Human Genome (USD, log scale)');

  // Moore's Law line
  const mooreLine = d3.line()
    .x(d => x(d.year))
    .y(d => y(Math.max(50, d.cost)));

  svg.append('path')
    .datum(mooresLaw)
    .attr('fill', 'none')
    .attr('stroke', isDark ? '#475569' : '#cbd5e1')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '6,4')
    .attr('d', mooreLine);

  // Sequencing cost line
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.cost))
    .curve(d3.curveMonotoneX);

  // Area under curve
  const area = d3.area()
    .x(d => x(d.year))
    .y0(height)
    .y1(d => y(d.cost))
    .curve(d3.curveMonotoneX);

  svg.append('path')
    .datum(data)
    .attr('fill', 'url(#cost-gradient)')
    .attr('d', area);

  // Gradient
  const defs = svg.append('defs');
  const gradient = defs.append('linearGradient')
    .attr('id', 'cost-gradient')
    .attr('x1', '0').attr('y1', '0')
    .attr('x2', '0').attr('y2', '1');
  gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.3);
  gradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.02);

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 3)
    .attr('d', line);

  // Data points
  svg.selectAll('.cost-dot')
    .data(data)
    .join('circle')
    .attr('class', 'cost-dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.cost))
    .attr('r', d => d.event ? 5 : 3)
    .attr('fill', d => d.event ? '#3b82f6' : 'white')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', d => d.event ? 2 : 1.5);

  // Event labels
  data.filter(d => d.event).forEach(d => {
    svg.append('text')
      .attr('x', x(d.year))
      .attr('y', y(d.cost) - 12)
      .attr('text-anchor', d.year > 2015 ? 'end' : 'start')
      .attr('font-size', '9px')
      .attr('fill', isDark ? '#94a3b8' : '#64748b')
      .text(d.event);
  });

  // Tooltip
  const tooltip = d3.select(container).append('div')
    .attr('class', 'absolute bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-2 text-xs pointer-events-none hidden')
    .style('position', 'absolute');

  svg.selectAll('.cost-dot')
    .on('mouseenter', (event, d) => {
      tooltip.classed('hidden', false)
        .html(`<strong>${d.year}</strong><br>$${d.cost.toLocaleString()}${d.event ? '<br>' + d.event : ''}`)
        .style('left', (event.offsetX + 10) + 'px')
        .style('top', (event.offsetY - 30) + 'px');
    })
    .on('mouseleave', () => tooltip.classed('hidden', true));
}

export { initCostCurve };
