/**
 * HTGAA Week 2 — Lab Protocol Quick Reference View
 * Step-by-step gel electrophoresis lab guide with safety, materials, and troubleshooting.
 */

import { store, TOPICS } from '../store.js';

const LAB_CHECKS_KEY = 'htgaa-week2-lab-checks';

const SAFETY_ITEMS = [
  'Wear gloves, goggles, and lab coat at all times',
  'EtBr/SYBR staining agents are potential mutagens — handle with care',
  'UV transilluminator: never look directly at UV light',
  'Dispose of gels and buffers according to lab protocols'
];

const MATERIALS = [
  'Agarose powder (0.8-2.0% depending on fragment size)',
  '1X TAE or TBE buffer',
  'DNA samples (digested with restriction enzymes)',
  'DNA ladder (1 kb or 100 bp)',
  'Loading dye (6X)',
  'Gel casting tray and comb',
  'Electrophoresis chamber and power supply',
  'Staining solution (EtBr or SYBR Safe)',
  'UV transilluminator or blue light source',
  'Micropipettes and tips'
];

const PROTOCOL_STEPS = [
  {
    id: 'step1',
    title: 'Prepare Agarose Gel',
    time: '20-30 min',
    icon: 'flask-conical',
    substeps: [
      'Calculate agarose needed: multiply volume (mL) by percentage (e.g., 50 mL × 1% = 0.5 g)',
      'Weigh agarose powder and add to flask with buffer',
      'Microwave in 15-second bursts, swirling between, until fully dissolved (no particles)',
      'Cool to ~55°C (warm but safe to touch flask)',
      'Add gel stain if using pre-stain method (optional)',
      'Pour into casting tray with comb inserted',
      'Let solidify 20-30 min at room temperature',
      'Gel is ready when opaque and firm to touch'
    ],
    tips: [
      'Use Erlenmeyer flask — beakers can boil over',
      'Watch carefully during microwaving — boilovers make a mess',
      'If air bubbles form, gently move them to edges with pipette tip'
    ]
  },
  {
    id: 'step2',
    title: 'Prepare DNA Samples',
    time: '5-10 min',
    icon: 'droplet',
    substeps: [
      'Calculate loading volumes: typical well holds 10-20 µL',
      'Mix DNA with 6X loading dye (1:5 ratio, e.g., 2 µL dye + 8 µL DNA)',
      'Include DNA ladder in lane 1 (5-10 µL depending on ladder concentration)',
      'Vortex gently and spin down briefly',
      'Keep samples on ice until loading'
    ],
    tips: [
      'Loading dye provides density (samples sink) and tracking dye (bromophenol blue)',
      'Don\'t forget the ladder — you can\'t estimate sizes without it!',
      'Label your samples clearly to avoid mix-ups'
    ]
  },
  {
    id: 'step3',
    title: 'Load the Gel',
    time: '5 min',
    icon: 'pipette',
    substeps: [
      'Remove comb carefully by pulling straight up (avoid tearing wells)',
      'Place gel in electrophoresis chamber',
      'Add running buffer until gel is submerged 2-3 mm',
      'Check well orientation: wells should be at negative (black) electrode end',
      'Set micropipette to loading volume (e.g., 10 µL)',
      'Load ladder in first lane',
      'Load samples into remaining wells, working slowly to avoid puncturing gel',
      'Record lane numbers and sample IDs in lab notebook'
    ],
    tips: [
      'Lower pipette tip into well, then slowly release — DNA will sink',
      'If you miss a well, wait 30 sec for sample to diffuse, then try again',
      'Avoid introducing air bubbles — they disrupt migration'
    ]
  },
  {
    id: 'step4',
    title: 'Run Electrophoresis',
    time: '30-60 min',
    icon: 'zap',
    substeps: [
      'Close electrophoresis chamber lid',
      'Connect electrodes: red to red (+), black to black (-)',
      'Set voltage: 80-100V for large gels, 100-120V for mini-gels',
      'Start power supply and verify current flow (bubbles at electrodes)',
      'Run until bromophenol blue dye reaches 2/3 down the gel',
      'Typical run time: 30-45 min for mini-gel, 45-60 min for large gel',
      'Monitor periodically — don\'t let dye run off the gel'
    ],
    tips: [
      'Mnemonic: "Run to Red" — DNA migrates toward the red (+) electrode',
      'Higher voltage = faster run but more heat (can distort bands)',
      'If no bubbles appear, check electrode connections',
      'Don\'t open lid while running — electric shock hazard!'
    ]
  },
  {
    id: 'step5',
    title: 'Stain and Visualize',
    time: '15-30 min',
    icon: 'eye',
    substeps: [
      'Turn off power supply and disconnect electrodes',
      'Remove gel from chamber and place in staining tray',
      'If using post-stain: submerge gel in EtBr/SYBR Safe solution',
      'Stain for 15-30 min with gentle shaking',
      'Rinse briefly in water to reduce background (optional)',
      'Place gel on UV transilluminator or blue light box',
      'Put on UV safety goggles or shield',
      'Turn on UV light and photograph gel immediately'
    ],
    tips: [
      'Pre-stain (adding dye to gel before casting) saves time',
      'SYBR Safe is less hazardous than EtBr and uses blue light (no UV)',
      'Use gel doc system or smartphone camera — adjust exposure for best contrast',
      'Capture photo quickly — UV damages DNA over time'
    ]
  },
  {
    id: 'step6',
    title: 'Analyze Results',
    time: '10-15 min',
    icon: 'bar-chart-3',
    substeps: [
      'Identify ladder bands and label with known sizes',
      'Measure migration distance for each band of interest',
      'Plot ladder (log bp vs. distance) to create standard curve',
      'Use standard curve to estimate unknown fragment sizes',
      'Compare observed pattern to predicted digest pattern from Benchling',
      'Check for expected number of bands and approximate sizes',
      'Document discrepancies (missing bands, extra bands, wrong sizes)',
      'Record results, gel photo, and analysis in lab notebook',
      'Dispose of gel and buffers according to lab safety protocols'
    ],
    tips: [
      'Migration distance is logarithmically related to fragment size',
      'Faint bands may indicate low DNA concentration or incomplete digest',
      'Extra bands suggest star activity (non-specific cutting) or partial digest',
      'Save high-res photo — you may need to re-analyze later'
    ]
  }
];

const GEL_ART_TIPS = [
  'Plan your design on graph paper first — sketch the final gel image',
  'Each lane = one column of your image',
  'Different restriction enzymes give different band patterns',
  'Use multiple enzymes per lane for more bands (double or triple digest)',
  'Test with virtual digest in Benchling before wet lab',
  'Consider band intensity (more DNA = brighter band)',
  'Ladder spacing: 1 kb ladder gives evenly spaced bands, 100 bp gives denser pattern at bottom'
];

const TROUBLESHOOTING = [
  {
    problem: 'No bands visible',
    causes: 'DNA concentration too low, insufficient staining time, UV exposure too short',
    solutions: 'Load more DNA (up to 500 ng), increase staining time to 30-45 min, check UV lamp intensity, verify DNA quality with NanoDrop'
  },
  {
    problem: 'Smeared bands',
    causes: 'DNA degradation, too much DNA loaded, voltage too high, gel running too long',
    solutions: 'Use fresh DNA, reduce loading amount to 100-200 ng, lower voltage to 80-90V, reduce run time, check for nucleases in buffer'
  },
  {
    problem: 'Bands running wrong direction',
    causes: 'Electrode polarity reversed',
    solutions: 'Check connections: DNA runs toward positive (red) electrode. Swap connections if needed. Remember: "Run to Red"'
  },
  {
    problem: 'Uneven or wavy bands',
    causes: 'Uneven gel thickness, air bubbles in wells, uneven buffer temperature, inconsistent loading',
    solutions: 'Pour gel on level surface, remove bubbles before loading, let buffer equilibrate to room temp, use consistent pipetting technique'
  },
  {
    problem: 'Bands at wrong sizes',
    causes: 'Wrong ladder used, wrong agarose concentration, incorrect buffer',
    solutions: 'Verify ladder identity and loading amount, check agarose percentage matches fragment size range, confirm using 1X TAE/TBE (not 10X stock)'
  },
  {
    problem: 'Bands too faint',
    causes: 'Insufficient DNA loaded, under-staining, overexposure to UV (photobleaching)',
    solutions: 'Load 200-500 ng DNA per band, increase staining time, reduce UV exposure time during imaging, use fresh staining solution'
  }
];

function createLabProtocolView() {
  return {
    render() {
      const checks = loadChecks();
      const totalSteps = PROTOCOL_STEPS.length;
      const completedSteps = PROTOCOL_STEPS.filter(step => checks[step.id]).length;
      const pct = Math.round((completedSteps / totalSteps) * 100);

      const totalMaterials = MATERIALS.length;
      const checkedMaterials = MATERIALS.filter((_, i) => checks[`material-${i}`]).length;
      const materialsPct = Math.round((checkedMaterials / totalMaterials) * 100);

      return `
        <div class="max-w-5xl mx-auto px-4 py-8">
          <header class="mb-10">
            <a data-route="#/homework" class="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1 mb-4">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Homework
            </a>
            <h1 class="text-3xl font-extrabold mb-3 flex items-center gap-3">
              <i data-lucide="test-tubes" class="w-8 h-8 text-purple-500"></i>
              Lab Protocol
            </h1>
            <div class="flex items-center justify-between">
              <p class="text-slate-600 dark:text-slate-300 max-w-2xl">Gel Electrophoresis Wet Lab — Step-by-step guide for creating gel art (Homework Part 2)</p>
              <button onclick="window.print()" class="print:hidden px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 flex-shrink-0">
                <i data-lucide="printer" class="w-4 h-4"></i> Print
              </button>
            </div>

            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Progress -->
              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-1">
                  <i data-lucide="check-circle" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i>
                  <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Protocol Progress</span>
                </div>
                <div class="text-lg font-bold text-blue-900 dark:text-blue-200">${completedSteps}/${totalSteps} steps</div>
                <div class="w-full h-2 bg-blue-200 dark:bg-blue-900/50 rounded-full mt-2 overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full transition-all duration-300" style="width:${pct}%"></div>
                </div>
              </div>

              <!-- Materials -->
              <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-1">
                  <i data-lucide="package" class="w-4 h-4 text-green-600 dark:text-green-400"></i>
                  <span class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">Materials Ready</span>
                </div>
                <div class="text-lg font-bold text-green-900 dark:text-green-200">${checkedMaterials}/${totalMaterials} items</div>
                <div class="w-full h-2 bg-green-200 dark:bg-green-900/50 rounded-full mt-2 overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full transition-all duration-300" style="width:${materialsPct}%"></div>
                </div>
              </div>
            </div>
          </header>

          <!-- Safety First Callout -->
          <div class="mb-8 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-5">
            <h2 class="text-lg font-bold mb-3 flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>
              Safety First
            </h2>
            <ul class="space-y-2">
              ${SAFETY_ITEMS.map(item => `
                <li class="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200">
                  <i data-lucide="shield-alert" class="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0"></i>
                  <span>${item}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Materials Checklist -->
          <div class="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <i data-lucide="clipboard-check" class="w-5 h-5 text-green-500"></i>
              Materials Checklist
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${MATERIALS.map((item, i) => {
                const checkId = `material-${i}`;
                const checked = checks[checkId];
                return `
                  <label class="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors ${checked ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700' : ''}">
                    <input type="checkbox" class="material-check mt-0.5 w-4 h-4 rounded accent-green-500" data-check-id="${checkId}" ${checked ? 'checked' : ''}>
                    <span class="text-sm ${checked ? 'text-green-700 dark:text-green-300 font-medium' : 'text-slate-700 dark:text-slate-300'}">${item}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Protocol Steps -->
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <i data-lucide="list-ordered" class="w-6 h-6 text-blue-500"></i>
              Protocol Steps
            </h2>
            <div class="space-y-4">
              ${PROTOCOL_STEPS.map((step, idx) => renderStep(step, idx, checks)).join('')}
            </div>
          </div>

          <!-- Gel Art Design Tips -->
          <div class="mb-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-5">
            <h2 class="text-lg font-bold mb-3 flex items-center gap-2 text-blue-900 dark:text-blue-200">
              <i data-lucide="palette" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
              Gel Art Design Tips
            </h2>
            <p class="text-sm text-blue-800 dark:text-blue-200 mb-3">Specific guidance for creating artistic gel banding patterns (HTGAA homework):</p>
            <ul class="space-y-2">
              ${GEL_ART_TIPS.map(tip => `
                <li class="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-200">
                  <i data-lucide="sparkles" class="w-4 h-4 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0"></i>
                  <span>${tip}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Troubleshooting Guide -->
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <i data-lucide="wrench" class="w-6 h-6 text-orange-500"></i>
              Troubleshooting Guide
            </h2>
            <div class="space-y-3">
              ${TROUBLESHOOTING.map(item => `
                <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <i data-lucide="alert-circle" class="w-4 h-4 text-red-600 dark:text-red-400"></i>
                    </div>
                    <div class="flex-1">
                      <h3 class="font-bold text-slate-800 dark:text-slate-200 mb-1">${item.problem}</h3>
                      <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <span class="font-semibold text-orange-600 dark:text-orange-400">Causes:</span> ${item.causes}
                      </div>
                      <div class="text-sm text-slate-600 dark:text-slate-400">
                        <span class="font-semibold text-green-600 dark:text-green-400">Solutions:</span> ${item.solutions}
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Quick Links -->
          <div class="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <i data-lucide="link" class="w-5 h-5 text-cyan-500"></i>
              Quick Links
            </h2>
            <div class="flex flex-wrap gap-3">
              <a data-route="#/topic/gel-electrophoresis" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer">
                <i data-lucide="flask-conical" class="w-4 h-4 text-yellow-500"></i>
                <span class="font-medium text-slate-800 dark:text-slate-200">Gel Electrophoresis Chapter</span>
              </a>
              <a data-route="#/homework" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all cursor-pointer">
                <i data-lucide="clipboard-list" class="w-4 h-4 text-orange-500"></i>
                <span class="font-medium text-slate-800 dark:text-slate-200">Homework Hub</span>
              </a>
              <a data-route="#/resources" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all cursor-pointer">
                <i data-lucide="book-open" class="w-4 h-4 text-purple-500"></i>
                <span class="font-medium text-slate-800 dark:text-slate-200">Resources</span>
              </a>
            </div>
          </div>
        </div>
      `;
    },

    mount(container) {
      // Wire up material checkboxes
      container.querySelectorAll('.material-check').forEach(cb => {
        cb.addEventListener('change', () => {
          const checks = loadChecks();
          checks[cb.dataset.checkId] = cb.checked;
          saveChecks(checks);
        });
      });

      // Wire up step checkboxes
      container.querySelectorAll('.step-check').forEach(cb => {
        cb.addEventListener('change', () => {
          const checks = loadChecks();
          checks[cb.dataset.checkId] = cb.checked;
          saveChecks(checks);
        });
      });

      // Wire up step accordion
      container.querySelectorAll('.step-header').forEach(header => {
        header.addEventListener('click', (e) => {
          // Don't toggle if clicking checkbox
          if (e.target.closest('.step-check')) return;

          const stepId = header.dataset.stepId;
          const content = container.querySelector(`#${stepId}-content`);
          const chevron = header.querySelector('.chevron-icon');

          if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            chevron.style.transform = 'rotate(180deg)';
          } else {
            content.classList.add('hidden');
            chevron.style.transform = 'rotate(0deg)';
          }
        });
      });

      // Initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    },

    unmount() {}
  };
}

function renderStep(step, idx, checks) {
  const checked = checks[step.id];
  const statusColor = checked ? 'green' : 'blue';

  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <!-- Step Header -->
      <div class="step-header p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors" data-step-id="${step.id}">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-4 flex-1">
            <div class="flex items-center gap-3">
              <input type="checkbox" class="step-check w-5 h-5 rounded accent-green-500 cursor-pointer" data-check-id="${step.id}" ${checked ? 'checked' : ''}>
              <div class="w-10 h-10 rounded-lg bg-${statusColor}-100 dark:bg-${statusColor}-900/30 flex items-center justify-center flex-shrink-0">
                <i data-lucide="${step.icon}" class="w-5 h-5 text-${statusColor}-600 dark:text-${statusColor}-400"></i>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                Step ${idx + 1}: ${step.title}
              </h3>
              <div class="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div class="flex items-center gap-1">
                  <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                  ${step.time}
                </div>
                <div class="flex items-center gap-1">
                  <i data-lucide="list" class="w-3.5 h-3.5"></i>
                  ${step.substeps.length} substeps
                </div>
              </div>
            </div>
          </div>
          <i data-lucide="chevron-down" class="chevron-icon w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0"></i>
        </div>
      </div>

      <!-- Step Content (expandable) -->
      <div id="${step.id}-content" class="hidden">
        <!-- Substeps -->
        <div class="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Procedure:</h4>
          <ol class="space-y-2">
            ${step.substeps.map((substep, i) => `
              <li class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex-shrink-0 mt-0.5">${i + 1}</span>
                <span class="flex-1">${substep}</span>
              </li>
            `).join('')}
          </ol>
        </div>

        <!-- Tips -->
        ${step.tips && step.tips.length > 0 ? `
        <div class="px-5 py-4 bg-blue-50 dark:bg-blue-900/10 border-t border-slate-200 dark:border-slate-700">
          <h4 class="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
            <i data-lucide="lightbulb" class="w-4 h-4"></i>
            Helpful Tips
          </h4>
          <ul class="space-y-1.5">
            ${step.tips.map(tip => `
              <li class="text-sm text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <i data-lucide="arrow-right" class="w-3.5 h-3.5 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0"></i>
                <span>${tip}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function loadChecks() {
  try {
    return JSON.parse(localStorage.getItem(LAB_CHECKS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveChecks(checks) {
  localStorage.setItem(LAB_CHECKS_KEY, JSON.stringify(checks));
}

export { createLabProtocolView };
