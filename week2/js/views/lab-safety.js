/**
 * Lab Safety View
 * Essential safety guidelines for the wet lab gel electrophoresis session.
 */

import { store, TOPICS } from '../store.js';

export function createLabSafetyView() {
  const SAFETY_SECTIONS = [
    {
      id: 'ppe',
      icon: 'shield',
      title: 'Personal Protective Equipment (PPE)',
      color: 'blue',
      items: [
        { text: 'Lab coat — must be worn at all times in the wet lab', critical: true },
        { text: 'Nitrile gloves — change immediately if torn or contaminated', critical: true },
        { text: 'Safety glasses or goggles — especially when working with UV light or heated liquids', critical: true },
        { text: 'Closed-toe shoes — no sandals, flip-flops, or open-toed footwear', critical: true },
        { text: 'Long pants — no shorts in the lab', critical: false },
        { text: 'Tie back long hair — keeps it out of reagents and equipment', critical: false },
      ]
    },
    {
      id: 'chemicals',
      icon: 'flask-conical',
      title: 'Chemical Safety',
      color: 'red',
      items: [
        { text: 'Ethidium Bromide (EtBr) is a mutagen — handle ONLY with gloves, dispose in designated waste', critical: true },
        { text: 'SYBR Safe is less toxic but still treat with care — use gloves', critical: false },
        { text: 'TAE/TBE buffer — mild irritant, avoid skin contact', critical: false },
        { text: 'Agarose gel is hot when melted (~65°C) — use heat-resistant gloves or holders', critical: true },
        { text: 'Loading dye contains glycerol — not toxic but keep it off skin', critical: false },
        { text: 'Restriction enzymes are stored at -20°C — keep on ice when in use', critical: false },
        { text: 'Never pipette by mouth — always use a micropipettor', critical: true },
      ]
    },
    {
      id: 'uv',
      icon: 'sun',
      title: 'UV Light Safety',
      color: 'amber',
      items: [
        { text: 'UV transilluminators emit UV-B/UV-C — can cause eye and skin damage in seconds', critical: true },
        { text: 'ALWAYS close the UV shield/cover before turning on the transilluminator', critical: true },
        { text: 'Wear UV-protective face shield or goggles if shield is not available', critical: true },
        { text: 'Minimize exposure time — UV also damages your DNA samples', critical: false },
        { text: 'Blue light transilluminators (e.g., Safe Imager) are safer alternatives', critical: false },
      ]
    },
    {
      id: 'electrical',
      icon: 'zap',
      title: 'Electrical Safety',
      color: 'yellow',
      items: [
        { text: 'Gel electrophoresis runs at 80-150V — enough to cause injury', critical: true },
        { text: 'NEVER open the gel box while the power supply is on', critical: true },
        { text: 'Always turn off power supply before connecting/disconnecting leads', critical: true },
        { text: 'Check that electrodes are properly seated and the lid is closed before powering on', critical: false },
        { text: 'Keep water and wet hands away from power supply connections', critical: true },
        { text: 'If the gel box is cracked or leaking, do NOT use it — report to TA', critical: false },
      ]
    },
    {
      id: 'waste',
      icon: 'trash-2',
      title: 'Waste Disposal',
      color: 'green',
      items: [
        { text: 'EtBr-stained gels go in designated EtBr waste container — NEVER in regular trash', critical: true },
        { text: 'EtBr-contaminated gloves go in EtBr solid waste', critical: true },
        { text: 'Liquid EtBr waste goes in labeled liquid waste bottles', critical: true },
        { text: 'SYBR Safe gels can go in regular biohazard waste (check with your lab)', critical: false },
        { text: 'Sharps (broken glass, razor blades for gel cutting) go in sharps containers', critical: true },
        { text: 'Used pipette tips go in biohazard waste, NOT regular trash', critical: false },
      ]
    },
    {
      id: 'emergency',
      icon: 'siren',
      title: 'Emergency Procedures',
      color: 'rose',
      items: [
        { text: 'Know the location of: eye wash station, safety shower, fire extinguisher, first aid kit', critical: true },
        { text: 'Chemical splash on skin: flush with water for 15+ minutes', critical: true },
        { text: 'Chemical splash in eyes: use eye wash station for 15+ minutes, seek medical attention', critical: true },
        { text: 'EtBr skin contact: wash immediately with soap and water, report to supervisor', critical: true },
        { text: 'Spills: alert others, contain if safe, use spill kit, report to supervisor', critical: false },
        { text: 'Burns from hot agarose: run under cool water for 10+ minutes', critical: false },
        { text: 'Electric shock: do NOT touch the person — turn off power first, call for help', critical: true },
      ]
    }
  ];

  const QUIZ = [
    { q: 'What should you do FIRST if the gel electrophoresis power supply is sparking?', a: 'Turn off the power supply at the outlet/switch — never touch the apparatus while it may be live.', },
    { q: 'Can you pour hot agarose gel without gloves?', a: 'No! Always wear heat-resistant gloves or use a holder. Molten agarose (~65°C) can cause burns.', },
    { q: 'Where do EtBr-stained gels go?', a: 'In the designated EtBr waste container — never in regular trash or biohazard waste.', },
    { q: 'What is the minimum PPE for gel electrophoresis?', a: 'Lab coat, nitrile gloves, safety glasses, closed-toe shoes, and long pants.', },
    { q: 'Someone spills EtBr on their skin. What do you do?', a: 'Wash immediately with soap and water, report to supervisor. EtBr is a mutagen.', },
  ];

  let checkedItems = {};
  try { checkedItems = JSON.parse(localStorage.getItem('htgaa-week2-safety-checks') || '{}'); } catch {}

  return {
    render() {
      const totalItems = SAFETY_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
      const checkedCount = Object.values(checkedItems).filter(Boolean).length;

      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Lab Safety Guide</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Essential safety for gel electrophoresis wet lab</p>
            </div>
            <a data-route="#/" class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Home
            </a>
          </div>

          <!-- Progress -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Safety Checklist</span>
              <span class="text-sm text-slate-500">${checkedCount} / ${totalItems} reviewed</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full transition-all duration-500" style="width:${totalItems > 0 ? (checkedCount/totalItems)*100 : 0}%"></div>
            </div>
          </div>

          <!-- Warning banner -->
          <div class="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-4 mb-6">
            <div class="flex items-start gap-3">
              <i data-lucide="alert-triangle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"></i>
              <div>
                <h3 class="font-bold text-red-700 dark:text-red-300 mb-1">Safety First</h3>
                <p class="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                  This guide covers common safety procedures for gel electrophoresis labs.
                  Always follow your specific lab's safety protocols and your instructor's guidance.
                  When in doubt, ASK before proceeding.
                </p>
              </div>
            </div>
          </div>

          <!-- Safety Sections -->
          ${SAFETY_SECTIONS.map(sec => `
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 overflow-hidden">
              <div class="p-4 bg-${sec.color}-50 dark:bg-${sec.color}-900/10 border-b border-${sec.color}-200 dark:border-${sec.color}-800 flex items-center gap-3">
                <i data-lucide="${sec.icon}" class="w-5 h-5 text-${sec.color}-500"></i>
                <h2 class="font-bold text-${sec.color}-800 dark:text-${sec.color}-200">${sec.title}</h2>
              </div>
              <div class="p-4 space-y-2">
                ${sec.items.map((item, idx) => {
                  const key = sec.id + '-' + idx;
                  const checked = checkedItems[key];
                  return `
                    <label class="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <input type="checkbox" class="safety-check mt-1 rounded border-slate-300" data-key="${key}" ${checked ? 'checked' : ''} />
                      <span class="text-sm leading-relaxed ${item.critical ? 'font-medium text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}">
                        ${item.critical ? '<span class="text-red-500 font-bold">*</span> ' : ''}${item.text}
                      </span>
                    </label>`;
                }).join('')}
              </div>
            </div>
          `).join('')}

          <p class="text-xs text-slate-400 mb-6"><span class="text-red-500 font-bold">*</span> = Critical safety item</p>

          <!-- Safety Quiz -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
            <h2 class="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <i data-lucide="help-circle" class="w-5 h-5 text-blue-500"></i> Safety Quick Quiz
            </h2>
            <div class="space-y-4">
              ${QUIZ.map((q, i) => `
                <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <p class="font-medium text-sm text-slate-800 dark:text-slate-200 mb-2">${i + 1}. ${q.q}</p>
                  <button class="quiz-reveal text-xs text-blue-500 hover:text-blue-600 cursor-pointer" data-idx="${i}">Show Answer</button>
                  <div class="quiz-answer hidden mt-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800" data-idx="${i}">
                    <p class="text-sm text-green-700 dark:text-green-300">${q.a}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>`;
    },

    mount(container) {
      // Checkbox persistence
      container.querySelectorAll('.safety-check').forEach(cb => {
        cb.addEventListener('change', () => {
          checkedItems[cb.dataset.key] = cb.checked;
          localStorage.setItem('htgaa-week2-safety-checks', JSON.stringify(checkedItems));
          // Update progress bar
          const totalItems = SAFETY_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
          const checkedCount = Object.values(checkedItems).filter(Boolean).length;
          const bar = container.querySelector('.bg-green-500');
          if (bar) bar.style.width = `${(checkedCount/totalItems)*100}%`;
          const countEl = container.querySelector('.text-sm.text-slate-500');
        });
      });

      // Quiz reveal
      container.querySelectorAll('.quiz-reveal').forEach(btn => {
        btn.addEventListener('click', () => {
          const ans = container.querySelector(`.quiz-answer[data-idx="${btn.dataset.idx}"]`);
          if (ans) ans.classList.toggle('hidden');
          btn.textContent = ans && !ans.classList.contains('hidden') ? 'Hide Answer' : 'Show Answer';
        });
      });

      if (window.lucide) lucide.createIcons();
    }
  };
}
