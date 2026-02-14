/**
 * HTGAA Week 2 — Coupling Efficiency Calculator
 * Interactive D3 visualization showing how coupling efficiency affects oligo yield.
 */

function initCouplingCalc(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  el.innerHTML = `
    <div class="mb-4">
      <label class="block text-sm font-semibold mb-2">Coupling Efficiency: <span id="cc-eff-val">99.0</span>%</label>
      <input type="range" id="cc-eff" min="95" max="99.9" step="0.1" value="99.0" class="w-full accent-blue-500">
    </div>
    <div class="mb-4">
      <label class="block text-sm font-semibold mb-2">Oligo Length: <span id="cc-len-val">200</span> nt</label>
      <input type="range" id="cc-len" min="20" max="500" step="10" value="200" class="w-full accent-green-500">
    </div>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
        <p class="text-2xl font-bold text-blue-600" id="cc-yield">13.3%</p>
        <p class="text-xs text-slate-500">Full-length yield</p>
      </div>
      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
        <p class="text-2xl font-bold text-green-600" id="cc-molecules">1 in <span id="cc-ratio">7.5</span></p>
        <p class="text-xs text-slate-500">Molecules are correct</p>
      </div>
    </div>
    <div id="cc-chart" style="width:100%; height:250px;"></div>
    <p class="text-xs text-slate-400 mt-2">Formula: Yield = (coupling efficiency)<sup>N</sup> where N = oligo length</p>
  `;

  const effSlider = el.querySelector('#cc-eff');
  const lenSlider = el.querySelector('#cc-len');
  const effVal = el.querySelector('#cc-eff-val');
  const lenVal = el.querySelector('#cc-len-val');
  const yieldEl = el.querySelector('#cc-yield');
  const ratioEl = el.querySelector('#cc-ratio');
  const chartEl = el.querySelector('#cc-chart');

  function update() {
    const eff = parseFloat(effSlider.value) / 100;
    const len = parseInt(lenSlider.value);
    effVal.textContent = effSlider.value;
    lenVal.textContent = len;

    const y = Math.pow(eff, len) * 100;
    yieldEl.textContent = y.toFixed(1) + '%';
    ratioEl.textContent = (100 / y).toFixed(1);

    drawChart(chartEl, eff, len);
  }

  function drawChart(container, efficiency, maxLen) {
    container.innerHTML = '';

    const margin = { top: 10, right: 20, bottom: 35, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(container).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate data for multiple efficiencies
    const efficiencies = [0.95, 0.97, 0.98, 0.99, 0.995];
    const lengths = d3.range(1, 501, 5);
    const isDark = document.documentElement.classList.contains('dark');

    const x = d3.scaleLinear().domain([0, 500]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll('text').attr('fill', isDark ? '#94a3b8' : '#64748b');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .selectAll('text').attr('fill', isDark ? '#94a3b8' : '#64748b');

    svg.selectAll('.domain, .tick line').attr('stroke', isDark ? '#475569' : '#e2e8f0');

    // Axis labels
    svg.append('text')
      .attr('x', width / 2).attr('y', height + 30)
      .attr('text-anchor', 'middle').attr('font-size', '11px')
      .attr('fill', isDark ? '#94a3b8' : '#64748b')
      .text('Oligo Length (nt)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -35)
      .attr('text-anchor', 'middle').attr('font-size', '11px')
      .attr('fill', isDark ? '#94a3b8' : '#64748b')
      .text('Full-Length Yield');

    const colors = ['#ef4444', '#f59e0b', '#eab308', '#3b82f6', '#10b981'];

    // Lines for each efficiency
    efficiencies.forEach((eff, i) => {
      const line = d3.line()
        .x(d => x(d))
        .y(d => y(Math.pow(eff, d) * 100));

      svg.append('path')
        .datum(lengths)
        .attr('fill', 'none')
        .attr('stroke', colors[i])
        .attr('stroke-width', eff === efficiency ? 3 : 1.5)
        .attr('stroke-opacity', eff === efficiency ? 1 : 0.5)
        .attr('d', line);

      // Label
      const labelY = Math.pow(eff, 60) * 100;
      svg.append('text')
        .attr('x', x(65))
        .attr('y', y(labelY) - 5)
        .attr('font-size', '9px')
        .attr('fill', colors[i])
        .attr('font-weight', eff === efficiency ? '700' : '400')
        .text((eff * 100).toFixed(1) + '%');
    });

    // Current point marker
    const currentYield = Math.pow(efficiency, maxLen) * 100;
    svg.append('circle')
      .attr('cx', x(maxLen))
      .attr('cy', y(currentYield))
      .attr('r', 6)
      .attr('fill', '#3b82f6')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Dotted lines to axes
    svg.append('line')
      .attr('x1', x(maxLen)).attr('y1', y(currentYield))
      .attr('x2', x(maxLen)).attr('y2', y(0))
      .attr('stroke', '#3b82f6').attr('stroke-dasharray', '4,4').attr('stroke-opacity', 0.5);

    svg.append('line')
      .attr('x1', 0).attr('y1', y(currentYield))
      .attr('x2', x(maxLen)).attr('y2', y(currentYield))
      .attr('stroke', '#3b82f6').attr('stroke-dasharray', '4,4').attr('stroke-opacity', 0.5);
  }

  effSlider.addEventListener('input', update);
  lenSlider.addEventListener('input', update);
  update();
}

export { initCouplingCalc };
