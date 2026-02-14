// Gel Electrophoresis Simulator — D3.js interactive visualization
// Requires D3.js v7 globally available as `d3`

function initGelSim() {
  const container = d3.select('#gel-sim');
  if (container.empty()) return;
  container.html('');

  // --- Constants ---
  const SVG_W = 600, SVG_H = 400;
  const WELL_Y = 30, WELL_H = 8;
  const GEL_TOP = WELL_Y + WELL_H + 4;
  const GEL_BOTTOM = SVG_H - 20;
  const MAX_LANES = 8;
  const LADDER = [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 750, 500, 250];
  const LANE_PAD = 40; // left padding for ruler labels

  // --- State ---
  const lanes = []; // each: { sizes: number[], label: string }
  let voltage = 100, gelPct = 1.0, runTime = 30;
  let running = false;

  // --- UI Controls ---
  const controls = container.append('div').attr('class', 'gel-controls')
    .style('margin-bottom', '12px').style('display', 'flex')
    .style('flex-wrap', 'wrap').style('gap', '8px').style('align-items', 'flex-end');

  // Fragment input
  const inputGroup = controls.append('div');
  inputGroup.append('label').text('Fragment sizes (bp): ').style('font-size', '13px');
  const sizeInput = inputGroup.append('input').attr('type', 'text')
    .attr('placeholder', '23130, 9416, 6557, 4361, 2322, 2027')
    .style('width', '280px').style('padding', '4px 6px');

  // Buttons row
  const btnGroup = controls.append('div').style('display', 'flex').style('gap', '6px');
  btnGroup.append('button').text('Load from Restriction Sim').on('click', () => {
    if (window.lastFragments && window.lastFragments.length) {
      sizeInput.property('value', window.lastFragments.join(', '));
    }
  });
  btnGroup.append('button').text('Add Lane').on('click', addLane);

  // Parameter controls
  const paramGroup = controls.append('div').style('display', 'flex').style('gap', '12px')
    .style('align-items', 'center').style('flex-wrap', 'wrap');

  // Voltage
  const vg = paramGroup.append('div');
  vg.append('label').text('Voltage: ').style('font-size', '13px');
  const voltSlider = vg.append('input').attr('type', 'range')
    .attr('min', 50).attr('max', 150).attr('value', voltage).style('width', '90px');
  const voltLabel = vg.append('span').text(voltage + 'V').style('font-size', '13px').style('margin-left', '4px');
  voltSlider.on('input', function () { voltage = +this.value; voltLabel.text(voltage + 'V'); });

  // Gel %
  const gg = paramGroup.append('div');
  gg.append('label').text('Gel %: ').style('font-size', '13px');
  const gelSel = gg.append('select');
  [0.8, 1.0, 1.5, 2.0].forEach(v => gelSel.append('option').attr('value', v).text(v + '%'));
  gelSel.property('value', gelPct);
  gelSel.on('change', function () { gelPct = +this.value; });

  // Run time
  const tg = paramGroup.append('div');
  tg.append('label').text('Time: ').style('font-size', '13px');
  const timeSlider = tg.append('input').attr('type', 'range')
    .attr('min', 10).attr('max', 60).attr('value', runTime).style('width', '90px');
  const timeLabel = tg.append('span').text(runTime + ' min').style('font-size', '13px').style('margin-left', '4px');
  timeSlider.on('input', function () { runTime = +this.value; timeLabel.text(runTime + ' min'); });

  // Run / Reset
  const actionGroup = controls.append('div').style('display', 'flex').style('gap', '6px');
  actionGroup.append('button').text('Run Gel').on('click', runGel);
  actionGroup.append('button').text('Reset').on('click', resetGel);

  // Lane list display
  const laneList = container.append('div').style('font-size', '12px').style('margin-bottom', '6px').style('min-height', '18px');

  // --- SVG Setup ---
  const svg = container.append('svg')
    .attr('width', SVG_W).attr('height', SVG_H)
    .style('border-radius', '4px').style('display', 'block');

  // SVG filters for glow
  const defs = svg.append('defs');
  const glow = defs.append('filter').attr('id', 'gel-glow');
  glow.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur');
  glow.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');
  const blur = defs.append('filter').attr('id', 'band-blur');
  blur.append('feGaussianBlur').attr('stdDeviation', '1.2');

  // Gel background
  svg.append('rect').attr('width', SVG_W).attr('height', SVG_H)
    .attr('fill', '#0a1628').attr('rx', 4);

  // Tooltip
  const tooltip = container.append('div')
    .style('position', 'absolute').style('background', 'rgba(0,0,0,0.85)')
    .style('color', '#7fffcf').style('padding', '4px 8px').style('border-radius', '4px')
    .style('font-size', '12px').style('pointer-events', 'none').style('opacity', 0)
    .style('z-index', 10);
  container.style('position', 'relative');

  // --- Helpers ---
  function laneX(i, total) {
    const usable = SVG_W - LANE_PAD - 20;
    const w = usable / total;
    return LANE_PAD + w * i + w / 2;
  }

  function bandY(bp) {
    // log-scale migration: smaller = further (lower y)
    // Adjust for gel% and voltage
    const migrationFactor = (voltage / 100) * (runTime / 30);
    const gelFactor = gelPct / 1.0; // higher gel% compresses large, spreads small
    const logMax = Math.log10(15000);
    const logMin = Math.log10(100);
    const logBp = Math.log10(Math.max(bp, 100));
    // Normalized 0 (largest) to 1 (smallest)
    let norm = (logMax - logBp) / (logMax - logMin);
    // Gel% effect: large fragments slow more in high %
    norm = Math.pow(norm, 1 / gelFactor);
    const range = (GEL_BOTTOM - GEL_TOP) * Math.min(migrationFactor, 1.4);
    return GEL_TOP + norm * range;
  }

  function bandWidth(total) {
    const usable = SVG_W - LANE_PAD - 20;
    return Math.min((usable / total) * 0.6, 50);
  }

  function bandOpacity(bp) {
    // Larger fragments slightly brighter
    return 0.55 + 0.45 * Math.min(bp / 10000, 1);
  }

  // --- Lane management ---
  function addLane() {
    if (lanes.length >= MAX_LANES - 1) return; // lane 0 reserved for ladder
    const raw = sizeInput.property('value').trim();
    if (!raw) return;
    const sizes = raw.split(/[,\s]+/).map(Number).filter(n => n > 0);
    if (!sizes.length) return;
    lanes.push({ sizes, label: 'Lane ' + (lanes.length + 2) });
    sizeInput.property('value', '');
    updateLaneList();
    drawWells();
  }

  function updateLaneList() {
    laneList.html('');
    if (!lanes.length) { laneList.text('No sample lanes added. Lane 1 is always the 1kb ladder.'); return; }
    laneList.text('Lanes: 1=Ladder, ' + lanes.map((l, i) => (i + 2) + '=[' + l.sizes.join(', ') + ']').join(', '));
  }

  function totalLanes() { return 1 + lanes.length; }

  // --- Drawing ---
  function drawWells() {
    svg.selectAll('.well').remove();
    const n = totalLanes();
    const w = bandWidth(n);
    for (let i = 0; i < n; i++) {
      svg.append('rect').attr('class', 'well')
        .attr('x', laneX(i, n) - w / 2).attr('y', WELL_Y)
        .attr('width', w).attr('height', WELL_H)
        .attr('fill', '#18293f').attr('stroke', '#3a5a7a').attr('stroke-width', 0.5);
    }
  }

  function drawRulerLabels() {
    svg.selectAll('.ruler-label').remove();
    LADDER.forEach(bp => {
      const y = bandY(bp);
      if (y < GEL_TOP || y > GEL_BOTTOM) return;
      svg.append('text').attr('class', 'ruler-label')
        .attr('x', LANE_PAD - 4).attr('y', y + 3)
        .attr('text-anchor', 'end').attr('fill', '#7fffcf')
        .attr('font-size', '9px').attr('opacity', 0.7)
        .text(bp >= 1000 ? (bp / 1000) + 'kb' : bp);
    });
  }

  function runGel() {
    if (running) return;
    running = true;
    svg.selectAll('.band, .ruler-label').remove();

    const n = totalLanes();
    const w = bandWidth(n);
    const dur = runTime * 60; // ms scale: runTime in min → animation ms

    // All lane data: index 0 = ladder, rest = user lanes
    const allLanes = [{ sizes: LADDER }].concat(lanes);

    allLanes.forEach((lane, li) => {
      lane.sizes.forEach(bp => {
        const finalY = bandY(bp);
        if (finalY < GEL_TOP || finalY > GEL_BOTTOM + 10) return;
        const cx = laneX(li, n);
        const opacity = bandOpacity(bp);
        const rect = svg.append('rect').attr('class', 'band')
          .attr('x', cx - w / 2).attr('y', WELL_Y + WELL_H)
          .attr('width', w).attr('height', 3)
          .attr('rx', 1)
          .attr('fill', '#00ffb0').attr('opacity', 0)
          .attr('filter', 'url(#gel-glow)')
          .on('mouseover', function (event) {
            tooltip.style('opacity', 1).text('~' + bp + ' bp');
          })
          .on('mousemove', function (event) {
            const bounds = container.node().getBoundingClientRect();
            tooltip.style('left', (event.clientX - bounds.left + 10) + 'px')
              .style('top', (event.clientY - bounds.top - 20) + 'px');
          })
          .on('mouseout', function () { tooltip.style('opacity', 0); });

        rect.transition().duration(dur).ease(d3.easeQuadOut)
          .attr('y', finalY - 1.5)
          .attr('opacity', opacity);
      });
    });

    // Draw ruler labels after animation
    setTimeout(() => { drawRulerLabels(); running = false; }, dur + 50);
  }

  function resetGel() {
    running = false;
    svg.selectAll('.band, .ruler-label').remove();
    lanes.length = 0;
    updateLaneList();
    drawWells();
  }

  // Init
  updateLaneList();
  drawWells();
}

function init() { initGelSim(); }
export { init, initGelSim };
