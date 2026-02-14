/**
 * HTGAA Week 2 — DNA Data Storage Calculator
 * Interactive visualization showing DNA's data storage potential.
 * Converts file sizes to DNA bases, physical weight, and comparison charts.
 */

function initStorageCalc(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  el.innerHTML = `
    <div class="space-y-6">
      <!-- Hero callout -->
      <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center">
        <p class="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">The Ultimate Storage Medium</p>
        <p class="text-2xl font-extrabold text-purple-900 dark:text-purple-100">All the world's data (~33 ZB) could fit in ~1 gram of DNA</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">DNA stores ~215 petabytes per gram at the theoretical limit</p>
      </div>

      <!-- Input controls -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2">File Size</label>
          <div class="flex gap-2">
            <input type="number" id="sc-size-input" min="1" max="99999" value="1" step="1"
              class="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <select id="sc-unit-select"
              class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB" selected>GB</option>
              <option value="TB">TB</option>
              <option value="PB">PB</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Quick Presets</label>
          <div class="flex flex-wrap gap-1.5">
            <button class="sc-preset px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-size="5" data-unit="MB">Photo (5MB)</button>
            <button class="sc-preset px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-size="4" data-unit="GB">Movie (4GB)</button>
            <button class="sc-preset px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-size="700" data-unit="GB">Human Genome (700GB)</button>
            <button class="sc-preset px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-size="120" data-unit="PB">All YouTube (120PB)</button>
          </div>
        </div>
      </div>

      <!-- Slider -->
      <div>
        <label class="block text-sm font-semibold mb-2">Adjust with slider: <span id="sc-slider-label" class="text-blue-600 dark:text-blue-400">1 GB</span></label>
        <input type="range" id="sc-slider" min="0" max="100" value="30" step="1" class="w-full accent-blue-500">
        <div class="flex justify-between text-xs text-slate-400 mt-1">
          <span>1 KB</span>
          <span>1 MB</span>
          <span>1 GB</span>
          <span>1 TB</span>
          <span>1 PB</span>
        </div>
      </div>

      <!-- Stats callouts -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
          <p class="text-lg font-bold text-blue-600 dark:text-blue-400" id="sc-bits">--</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Total bits</p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
          <p class="text-lg font-bold text-green-600 dark:text-green-400" id="sc-bases">--</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">DNA bases needed</p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
          <p class="text-lg font-bold text-purple-600 dark:text-purple-400" id="sc-weight">--</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">DNA weight</p>
        </div>
        <div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
          <p class="text-lg font-bold text-amber-600 dark:text-amber-400" id="sc-oligos">--</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">200-nt oligos</p>
        </div>
      </div>

      <!-- Encoding explainer -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Encoding Scheme: 2 bits per base</p>
        <div class="flex items-center justify-center gap-4 sm:gap-8 font-mono text-sm">
          <span class="flex items-center gap-1.5"><span class="w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs">A</span> = 00</span>
          <span class="flex items-center gap-1.5"><span class="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">T</span> = 01</span>
          <span class="flex items-center gap-1.5"><span class="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-xs">G</span> = 10</span>
          <span class="flex items-center gap-1.5"><span class="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">C</span> = 11</span>
        </div>
      </div>

      <!-- Comparison bar chart -->
      <div>
        <p class="text-sm font-semibold mb-3">Physical Size Comparison</p>
        <div id="sc-chart" style="width:100%; height:220px;"></div>
        <p class="text-xs text-slate-400 mt-1">Volume/weight comparison of storage media needed for the same data</p>
      </div>
    </div>
  `;

  // References
  const sizeInput = el.querySelector('#sc-size-input');
  const unitSelect = el.querySelector('#sc-unit-select');
  const slider = el.querySelector('#sc-slider');
  const sliderLabel = el.querySelector('#sc-slider-label');
  const bitsEl = el.querySelector('#sc-bits');
  const basesEl = el.querySelector('#sc-bases');
  const weightEl = el.querySelector('#sc-weight');
  const oligosEl = el.querySelector('#sc-oligos');
  const chartEl = el.querySelector('#sc-chart');
  const presets = el.querySelectorAll('.sc-preset');

  // Unit multipliers in bytes
  const UNIT_BYTES = {
    'KB': 1024,
    'MB': 1024 ** 2,
    'GB': 1024 ** 3,
    'TB': 1024 ** 4,
    'PB': 1024 ** 5,
  };

  // Slider is logarithmic: 0=1KB, 100=1PB
  // log scale: 10 (1KB) -> 50 (1PB) in powers of 1024
  const SLIDER_MIN_EXP = 10;   // 2^10 = 1KB
  const SLIDER_MAX_EXP = 50;   // 2^50 = 1PB

  function sliderToBytes(val) {
    const exp = SLIDER_MIN_EXP + (val / 100) * (SLIDER_MAX_EXP - SLIDER_MIN_EXP);
    return Math.pow(2, exp);
  }

  function bytesToSlider(bytes) {
    if (bytes <= 0) return 0;
    const exp = Math.log2(bytes);
    return Math.max(0, Math.min(100, ((exp - SLIDER_MIN_EXP) / (SLIDER_MAX_EXP - SLIDER_MIN_EXP)) * 100));
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes.toFixed(0) + ' B';
    if (bytes < UNIT_BYTES.MB) return (bytes / UNIT_BYTES.KB).toFixed(1) + ' KB';
    if (bytes < UNIT_BYTES.GB) return (bytes / UNIT_BYTES.MB).toFixed(1) + ' MB';
    if (bytes < UNIT_BYTES.TB) return (bytes / UNIT_BYTES.GB).toFixed(1) + ' GB';
    if (bytes < UNIT_BYTES.PB) return (bytes / UNIT_BYTES.TB).toFixed(1) + ' TB';
    return (bytes / UNIT_BYTES.PB).toFixed(1) + ' PB';
  }

  function formatLargeNumber(n) {
    if (n < 1e3) return n.toFixed(0);
    if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
    if (n < 1e9) return (n / 1e6).toFixed(1) + 'M';
    if (n < 1e12) return (n / 1e9).toFixed(1) + 'B';
    if (n < 1e15) return (n / 1e12).toFixed(1) + 'T';
    return (n / 1e15).toFixed(1) + 'P';
  }

  function formatWeight(grams) {
    if (grams < 1e-12) return (grams * 1e15).toFixed(2) + ' fg';
    if (grams < 1e-9) return (grams * 1e12).toFixed(2) + ' pg';
    if (grams < 1e-6) return (grams * 1e9).toFixed(2) + ' ng';
    if (grams < 1e-3) return (grams * 1e6).toFixed(2) + ' ug';
    if (grams < 1) return (grams * 1e3).toFixed(2) + ' mg';
    if (grams < 1000) return grams.toFixed(2) + ' g';
    return (grams / 1000).toFixed(2) + ' kg';
  }

  let currentBytes = UNIT_BYTES.GB; // default 1 GB
  let updatingFromSlider = false;
  let updatingFromInput = false;

  function getBytes() {
    const size = parseFloat(sizeInput.value) || 1;
    const unit = unitSelect.value;
    return size * UNIT_BYTES[unit];
  }

  function update() {
    const bytes = currentBytes;
    const bits = bytes * 8;
    const bases = bits / 2; // 2 bits per base
    // Average molecular weight of a nucleotide: ~330 Da (g/mol)
    // Weight in grams = bases * 330 / (6.022e23)
    const weightGrams = (bases * 330) / 6.022e23;
    // Number of 200-nt oligos needed
    const numOligos = Math.ceil(bases / 200);

    bitsEl.textContent = formatLargeNumber(bits);
    basesEl.textContent = formatLargeNumber(bases);
    weightEl.textContent = formatWeight(weightGrams);
    oligosEl.textContent = formatLargeNumber(numOligos);

    drawComparisonChart(chartEl, bytes);
  }

  function syncInputFromBytes() {
    const bytes = currentBytes;
    // Pick best unit
    let bestUnit = 'KB';
    let bestVal = bytes / UNIT_BYTES.KB;
    for (const [unit, mult] of Object.entries(UNIT_BYTES)) {
      const val = bytes / mult;
      if (val >= 1 && val < 10000) {
        bestUnit = unit;
        bestVal = val;
      }
    }
    sizeInput.value = Math.round(bestVal * 10) / 10;
    unitSelect.value = bestUnit;
  }

  // Slider change
  slider.addEventListener('input', () => {
    updatingFromSlider = true;
    currentBytes = sliderToBytes(parseFloat(slider.value));
    sliderLabel.textContent = formatBytes(currentBytes);
    syncInputFromBytes();
    update();
    updatingFromSlider = false;
  });

  // Input/select change
  function onInputChange() {
    if (updatingFromSlider) return;
    updatingFromInput = true;
    currentBytes = getBytes();
    slider.value = bytesToSlider(currentBytes);
    sliderLabel.textContent = formatBytes(currentBytes);
    update();
    updatingFromInput = false;
  }

  sizeInput.addEventListener('input', onInputChange);
  unitSelect.addEventListener('change', onInputChange);

  // Presets
  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      const size = parseFloat(btn.dataset.size);
      const unit = btn.dataset.unit;
      sizeInput.value = size;
      unitSelect.value = unit;
      onInputChange();
    });
  });

  function drawComparisonChart(container, bytes) {
    container.innerHTML = '';

    const isDark = document.documentElement.classList.contains('dark');
    const margin = { top: 10, right: 80, bottom: 30, left: 70 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;

    if (width <= 0) return;

    const svg = d3.select(container).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const gigabytes = bytes / UNIT_BYTES.GB;

    // Storage media weight/volume per GB (approximate physical weight in grams)
    // USB flash drive: ~10g per 128GB = 0.078 g/GB
    // HDD: ~500g per 2TB = 0.244 g/GB
    // SSD: ~50g per 1TB = 0.049 g/GB
    // Blu-ray: ~16g per 25GB = 0.64 g/GB
    // DNA: ~215 PB per gram -> 1 gram / 215e6 GB = 4.65e-9 g/GB
    const media = [
      { name: 'Blu-ray', gramsPerGB: 0.64, color: '#8b5cf6' },
      { name: 'HDD', gramsPerGB: 0.244, color: '#f59e0b' },
      { name: 'USB Drive', gramsPerGB: 0.078, color: '#3b82f6' },
      { name: 'SSD', gramsPerGB: 0.049, color: '#10b981' },
      { name: 'DNA', gramsPerGB: 4.65e-9, color: '#ef4444' },
    ];

    const data = media.map(m => ({
      name: m.name,
      weight: m.gramsPerGB * gigabytes,
      color: m.color,
    }));

    // Use log scale for the massive range
    const maxWeight = d3.max(data, d => d.weight);
    const minWeight = d3.min(data, d => d.weight);

    const x = d3.scaleLog()
      .domain([Math.max(1e-15, minWeight * 0.1), maxWeight * 10])
      .range([0, width])
      .clamp(true);

    const y = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height])
      .padding(0.3);

    // Grid lines
    svg.append('g')
      .call(d3.axisBottom(x).ticks(5, '~s').tickSize(height))
      .attr('class', 'grid-lines')
      .selectAll('line')
      .attr('stroke', isDark ? '#1e293b' : '#f1f5f9');

    svg.selectAll('.grid-lines .domain').remove();
    svg.selectAll('.grid-lines text').remove();

    // X axis
    const xAxis = svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5, '~s'));

    xAxis.selectAll('text')
      .attr('fill', isDark ? '#94a3b8' : '#64748b')
      .attr('font-size', '10px');
    xAxis.selectAll('.domain').attr('stroke', isDark ? '#475569' : '#e2e8f0');
    xAxis.selectAll('.tick line').attr('stroke', isDark ? '#334155' : '#e2e8f0');

    // X label
    svg.append('text')
      .attr('x', width / 2).attr('y', height + 25)
      .attr('text-anchor', 'middle').attr('font-size', '10px')
      .attr('fill', isDark ? '#94a3b8' : '#64748b')
      .text('Weight of storage medium (grams, log scale)');

    // Y axis
    const yAxis = svg.append('g')
      .call(d3.axisLeft(y));

    yAxis.selectAll('text')
      .attr('fill', isDark ? '#94a3b8' : '#64748b')
      .attr('font-size', '11px')
      .attr('font-weight', '600');
    yAxis.selectAll('.domain').attr('stroke', 'none');
    yAxis.selectAll('.tick line').attr('stroke', 'none');

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.name))
      .attr('width', d => Math.max(2, x(Math.max(1e-15, d.weight))))
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .attr('opacity', 0.85);

    // Weight labels at end of bars
    svg.selectAll('.bar-label')
      .data(data)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => Math.max(2, x(Math.max(1e-15, d.weight))) + 6)
      .attr('y', d => y(d.name) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', isDark ? '#e2e8f0' : '#334155')
      .text(d => formatWeight(d.weight));
  }

  // Initialize
  slider.value = bytesToSlider(currentBytes);
  sliderLabel.textContent = formatBytes(currentBytes);
  update();
}

export { initStorageCalc };
