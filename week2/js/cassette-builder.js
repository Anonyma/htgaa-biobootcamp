// Expression Cassette Builder — drag-and-drop genetic construct designer
// Requires Tailwind CSS via CDN on the host page

const PARTS = [
  { id: 'promoter',    name: 'Promoter (BBa_J23106)', color: 'bg-orange-500',  icon: '→',  seq: 'TTTACGGCTAGCTCAGTCCTAGGTATAGTGCTAGC' },
  { id: 'rbs',         name: 'RBS (BBa_B0034)',       color: 'bg-yellow-400',  icon: '●',  seq: 'CATTAAAGAGGAGAAAGGTACC' },
  { id: 'start',       name: 'Start Codon',           color: 'bg-lime-400',    icon: '[',  seq: 'ATG' },
  { id: 'sfgfp',       name: 'sfGFP (reporter)',      color: 'bg-green-500',   icon: '★',  seq: 'ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGG' },
  { id: 'mcherry',     name: 'mCherry (reporter)',    color: 'bg-red-500',     icon: '★',  seq: 'ATGGTGAGCAAGGGCGAGGAGGATAACATGGCCATCATCAAGGAGTTCA' },
  { id: 'lacz',        name: 'LacZ (reporter)',       color: 'bg-blue-500',    icon: '★',  seq: 'ATGACCATGATTACGCCAAGCTATTTAGGTGACACTATAGAATACTCAAG' },
  { id: 'histag',      name: 'His Tag (7×)',          color: 'bg-purple-500',  icon: '⚑',  seq: 'CATCACCATCACCATCATCAC' },
  { id: 'stop',        name: 'Stop Codon',            color: 'bg-gray-500',    icon: ']',  seq: 'TAA' },
  { id: 'terminator',  name: 'Terminator (BBa_B0015)',color: 'bg-red-800',     icon: '⊤',  seq: 'CCAGGCATCAAATAAAACGAAAGGCTCAGTCGAAAGACTGGGCCTTTCGTTTTATCTGTTGTTTGTCGGTGAACGCTCTCTACTAGAGTCACACTGGCTCACCTTCGGGTGGGCCTTTCTGCGTTTATA' },
];

const CDS_IDS = ['sfgfp', 'mcherry', 'lacz'];

function initCassetteBuilder() {
  const root = document.getElementById('cassette-builder');
  if (!root) return;

  let construct = []; // array of part objects (cloned from PARTS)
  let dragSrcIndex = null; // index within construct when reordering

  // ── Render ────────────────────────────────────────────────────────
  function render() {
    root.innerHTML = '';
    root.className = 'flex flex-col lg:flex-row gap-6';

    // — Palette —
    const palette = el('div', 'w-full lg:w-64 shrink-0');
    palette.appendChild(el('h3', 'text-lg font-bold mb-3 text-gray-200', 'Parts Palette'));
    const grid = el('div', 'grid grid-cols-2 lg:grid-cols-1 gap-2');
    PARTS.forEach(p => {
      const chip = el('div',
        `${p.color} text-white text-sm font-medium rounded-lg px-3 py-2 cursor-grab select-none flex items-center gap-2 hover:brightness-110 transition`);
      chip.draggable = true;
      chip.dataset.partId = p.id;
      chip.innerHTML = `<span class="text-lg leading-none">${p.icon}</span><span class="truncate">${p.name}</span>`;
      chip.addEventListener('dragstart', e => {
        dragSrcIndex = null;
        e.dataTransfer.setData('text/plain', p.id);
        e.dataTransfer.effectAllowed = 'copy';
      });
      grid.appendChild(chip);
    });
    palette.appendChild(grid);

    // — Right column —
    const right = el('div', 'flex-1 min-w-0 flex flex-col gap-4');

    // Drop zone
    right.appendChild(el('h3', 'text-lg font-bold text-gray-200', 'Construct'));
    const lane = el('div',
      'min-h-[72px] border-2 border-dashed border-gray-600 rounded-xl p-3 flex items-center gap-1 overflow-x-auto bg-gray-800/50 transition');
    lane.id = 'construct-lane';

    lane.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = dragSrcIndex !== null ? 'move' : 'copy'; lane.classList.add('border-cyan-400'); });
    lane.addEventListener('dragleave', () => lane.classList.remove('border-cyan-400'));
    lane.addEventListener('drop', e => {
      e.preventDefault();
      lane.classList.remove('border-cyan-400');
      const dropIndex = getDropIndex(lane, e.clientX);

      if (dragSrcIndex !== null) {
        // reorder
        const [moved] = construct.splice(dragSrcIndex, 1);
        const insertAt = dropIndex > dragSrcIndex ? dropIndex - 1 : dropIndex;
        construct.splice(insertAt, 0, moved);
      } else {
        const partId = e.dataTransfer.getData('text/plain');
        const tpl = PARTS.find(p => p.id === partId);
        if (!tpl) return;
        construct.splice(dropIndex, 0, { ...tpl, uid: crypto.randomUUID() });
      }
      render();
    });

    if (construct.length === 0) {
      lane.appendChild(el('span', 'text-gray-500 italic m-auto', 'Drag parts here to build your cassette'));
    } else {
      construct.forEach((p, i) => {
        if (i > 0) {
          const conn = el('div', 'w-4 h-0.5 bg-gray-500 shrink-0 self-center');
          lane.appendChild(conn);
        }
        const block = el('div',
          `${p.color} text-white text-xs font-semibold rounded-lg px-3 py-3 cursor-grab select-none flex items-center gap-1.5 relative group shrink-0 hover:brightness-110`);
        block.draggable = true;
        block.innerHTML = `<span class="text-base leading-none">${p.icon}</span><span class="whitespace-nowrap">${p.name}</span>`;

        // remove button
        const xBtn = el('button',
          'absolute -top-2 -right-2 w-5 h-5 bg-gray-900 border border-gray-600 rounded-full text-[10px] text-gray-300 hidden group-hover:flex items-center justify-center hover:bg-red-600 hover:text-white transition',
          '✕');
        xBtn.addEventListener('click', ev => { ev.stopPropagation(); construct.splice(i, 1); render(); });
        block.appendChild(xBtn);

        block.addEventListener('dragstart', e => {
          dragSrcIndex = i;
          e.dataTransfer.setData('text/plain', p.id);
          e.dataTransfer.effectAllowed = 'move';
        });
        block.addEventListener('dragend', e => {
          // if dropped outside lane, remove
          if (e.dataTransfer.dropEffect === 'none') { construct.splice(i, 1); render(); }
          dragSrcIndex = null;
        });
        lane.appendChild(block);
      });
    }
    right.appendChild(lane);

    // Validation
    const msgs = validate();
    const vPanel = el('div', 'rounded-xl p-3 text-sm space-y-1 ' + (msgs.length ? 'bg-gray-800/60' : 'bg-green-900/40'));
    if (msgs.length === 0 && construct.length > 0) {
      vPanel.appendChild(el('p', 'text-green-400 font-medium', '✓ Valid expression cassette'));
    } else if (construct.length === 0) {
      vPanel.appendChild(el('p', 'text-gray-500 italic', 'Add parts to see validation'));
    } else {
      msgs.forEach(m => vPanel.appendChild(el('p', 'text-yellow-400', '⚠ ' + m)));
    }
    right.appendChild(vPanel);

    // Export
    const exportBar = el('div', 'flex flex-wrap items-center gap-3');
    const showBtn = btn('Show Sequence', () => {
      seqBox.classList.toggle('hidden');
      seqBox.textContent = getSequence();
    });
    const copyBtn = btn('Copy Sequence', () => {
      navigator.clipboard.writeText(getSequence()).then(() => { copyBtn.textContent = 'Copied!'; setTimeout(() => copyBtn.textContent = 'Copy Sequence', 1500); });
    });
    const lenLabel = el('span', 'text-gray-400 text-sm ml-auto', `${getSequence().length} bp`);
    exportBar.append(showBtn, copyBtn, lenLabel);
    right.appendChild(exportBar);

    const seqBox = el('pre', 'hidden bg-gray-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto break-all whitespace-pre-wrap font-mono max-h-40');
    right.appendChild(seqBox);

    root.append(palette, right);
  }

  // ── Validation ────────────────────────────────────────────────────
  function validate() {
    if (construct.length === 0) return [];
    const warnings = [];
    const ids = construct.map(p => p.id);

    if (!ids.includes('promoter')) warnings.push('No promoter in construct');
    if (!ids.includes('terminator')) warnings.push('No terminator in construct');
    if (ids.includes('terminator') && ids.lastIndexOf('terminator') !== ids.length - 1)
      warnings.push('Terminator is not at the end of the construct');

    const firstCDS = ids.findIndex(id => CDS_IDS.includes(id));
    if (firstCDS !== -1) {
      const beforeCDS = ids.slice(0, firstCDS);
      if (!beforeCDS.includes('rbs')) warnings.push('No RBS before coding sequence');
      if (!beforeCDS.includes('start')) warnings.push('No start codon before coding sequence');
    }

    const lastCDS = findLastIndex(ids, id => CDS_IDS.includes(id));
    if (lastCDS !== -1) {
      const afterCDS = ids.slice(lastCDS + 1);
      if (!afterCDS.includes('stop')) warnings.push('No stop codon after coding sequence');
    }

    return warnings;
  }

  // ── Helpers ───────────────────────────────────────────────────────
  function getSequence() { return construct.map(p => p.seq).join(''); }

  function getDropIndex(lane, clientX) {
    const children = [...lane.children].filter(c => c.draggable);
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (clientX < rect.left + rect.width / 2) return i;
    }
    return construct.length;
  }

  function findLastIndex(arr, fn) {
    for (let i = arr.length - 1; i >= 0; i--) { if (fn(arr[i])) return i; }
    return -1;
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function btn(label, onClick) {
    const b = el('button',
      'bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition', label);
    b.addEventListener('click', onClick);
    return b;
  }

  // ── Init ──────────────────────────────────────────────────────────
  render();
}
