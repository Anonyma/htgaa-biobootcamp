/**
 * HTGAA Week 2 — Historical Timeline
 * Interactive horizontal timeline of DNA technology milestones.
 */

function initTimeline(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const events = [
    { year: 1953, title: 'DNA Structure', desc: 'Watson & Crick describe the double helix', category: 'reading' },
    { year: 1955, title: 'First Dinucleotide', desc: 'Michelson & Todd synthesize first dinucleotide', category: 'writing' },
    { year: 1956, title: 'Phosphodiester Method', desc: 'Khorana develops phosphodiester synthesis', category: 'writing' },
    { year: 1961, title: 'Genetic Code Cracked', desc: 'Nirenberg & Matthaei decode first codon (UUU = Phe)', category: 'code' },
    { year: 1965, title: 'Solid-Phase Synthesis', desc: 'Letsinger introduces solid support for DNA synthesis', category: 'writing' },
    { year: 1970, title: 'Restriction Enzymes', desc: 'Smith & Wilcox isolate first restriction enzyme (HindII)', category: 'editing' },
    { year: 1973, title: 'Recombinant DNA', desc: 'Cohen & Boyer create first recombinant DNA molecule', category: 'editing' },
    { year: 1977, title: 'Sanger Sequencing', desc: 'Sanger develops chain termination method', category: 'reading' },
    { year: 1981, title: 'Phosphoramidite Method', desc: 'Caruthers develops modern DNA synthesis chemistry', category: 'writing' },
    { year: 1983, title: 'PCR Invented', desc: 'Mullis conceives polymerase chain reaction', category: 'reading' },
    { year: 1985, title: 'First Gene Synthesizer', desc: 'Applied Biosystems releases automated DNA synthesizer', category: 'writing' },
    { year: 1990, title: 'Human Genome Project', desc: 'International effort to sequence the human genome begins', category: 'reading' },
    { year: 1996, title: 'Pyrosequencing', desc: 'Ronaghi develops pyrosequencing method', category: 'reading' },
    { year: 2003, title: 'HGP Complete', desc: 'Human genome sequenced for ~$3 billion over 13 years', category: 'reading' },
    { year: 2003, title: 'phiX174 Synthesized', desc: 'Venter synthesizes first complete viral genome from scratch', category: 'writing' },
    { year: 2005, title: '454 Sequencing', desc: 'First next-generation sequencer (massively parallel pyrosequencing)', category: 'reading' },
    { year: 2006, title: 'Illumina Solexa', desc: 'Sequencing by synthesis platform revolutionizes genomics', category: 'reading' },
    { year: 2010, title: 'Synthetic Cell', desc: 'Venter creates first self-replicating synthetic bacterial cell', category: 'writing' },
    { year: 2012, title: 'CRISPR Editing', desc: 'Doudna & Charpentier adapt CRISPR-Cas9 for genome editing', category: 'editing' },
    { year: 2012, title: 'DNA Data Storage', desc: 'Church encodes a book in DNA (5.27 MB)', category: 'writing' },
    { year: 2013, title: 'GRO Created', desc: 'Church lab replaces all 321 UAG codons in E. coli', category: 'editing' },
    { year: 2014, title: '$1000 Genome', desc: 'Illumina HiSeq X Ten breaks the $1000 genome barrier', category: 'reading' },
    { year: 2016, title: 'Base Editing', desc: 'David Liu develops cytosine base editors (CBE)', category: 'editing' },
    { year: 2017, title: 'Unnatural Base Pair', desc: 'Romesberg replicates dNaM-dTPT3 in living cells', category: 'code' },
    { year: 2019, title: 'Prime Editing', desc: 'Liu lab introduces search-and-replace prime editing', category: 'editing' },
    { year: 2022, title: 'PASTE', desc: 'Church lab develops PASTE for large DNA insertions', category: 'editing' },
    { year: 2023, title: 'Casgevy Approved', desc: 'First CRISPR therapy approved for sickle cell disease', category: 'editing' },
    { year: 2025, title: '$100 Genome', desc: 'Multiple platforms achieve sub-$100 whole genome sequencing', category: 'reading' },
  ];

  const categories = {
    reading: { color: '#3b82f6', label: 'Reading (Sequencing)' },
    writing: { color: '#10b981', label: 'Writing (Synthesis)' },
    editing: { color: '#ef4444', label: 'Editing' },
    code: { color: '#8b5cf6', label: 'Genetic Code' },
  };

  el.innerHTML = `
    <div class="mb-4 flex items-center gap-4 flex-wrap">
      ${Object.entries(categories).map(([k, v]) => `
        <label class="flex items-center gap-1.5 text-xs cursor-pointer">
          <input type="checkbox" checked class="tl-filter accent-blue-500" data-cat="${k}">
          <span class="w-2.5 h-2.5 rounded-full" style="background:${v.color}"></span>
          ${v.label}
        </label>
      `).join('')}
    </div>
    <div id="timeline-chart" style="width:100%; height:400px; overflow-x:auto;"></div>
  `;

  const chartEl = el.querySelector('#timeline-chart');
  drawTimeline(chartEl, events, categories);

  // Filters
  el.querySelectorAll('.tl-filter').forEach(cb => {
    cb.addEventListener('change', () => {
      const active = new Set();
      el.querySelectorAll('.tl-filter:checked').forEach(c => active.add(c.dataset.cat));
      const filtered = events.filter(e => active.has(e.category));
      chartEl.innerHTML = '';
      drawTimeline(chartEl, filtered, categories);
    });
  });
}

function drawTimeline(container, events, categories) {
  const isDark = document.documentElement.classList.contains('dark');
  const margin = { top: 30, right: 40, bottom: 30, left: 40 };
  const totalWidth = Math.max(container.clientWidth, events.length * 60 + margin.left + margin.right);
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('width', totalWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([d3.min(events, d => d.year) - 2, d3.max(events, d => d.year) + 2])
    .range([0, totalWidth - margin.left - margin.right]);

  // Timeline axis
  svg.append('line')
    .attr('x1', 0).attr('y1', height / 2)
    .attr('x2', totalWidth - margin.left - margin.right).attr('y2', height / 2)
    .attr('stroke', isDark ? '#475569' : '#e2e8f0')
    .attr('stroke-width', 3);

  // Year markers
  const years = d3.range(1955, 2030, 5);
  svg.selectAll('.year-tick')
    .data(years)
    .join('g')
    .attr('class', 'year-tick')
    .attr('transform', d => `translate(${x(d)},${height / 2})`)
    .each(function(d) {
      const g = d3.select(this);
      g.append('line')
        .attr('y1', -8).attr('y2', 8)
        .attr('stroke', isDark ? '#64748b' : '#cbd5e1')
        .attr('stroke-width', 1);
      g.append('text')
        .attr('y', 22)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', isDark ? '#94a3b8' : '#64748b')
        .text(d);
    });

  // Event dots and labels
  const eventGroups = svg.selectAll('.event')
    .data(events)
    .join('g')
    .attr('class', 'event')
    .attr('transform', (d, i) => {
      const yOffset = (i % 2 === 0 ? -1 : 1) * (40 + (i % 3) * 30);
      return `translate(${x(d.year)},${height / 2 + yOffset})`;
    })
    .style('cursor', 'pointer');

  // Connector lines to axis
  eventGroups.append('line')
    .attr('x1', 0)
    .attr('y1', (d, i) => {
      const yOffset = (i % 2 === 0 ? -1 : 1) * (40 + (i % 3) * 30);
      return -yOffset;
    })
    .attr('x2', 0).attr('y2', 0)
    .attr('stroke', d => categories[d.category]?.color || '#94a3b8')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '3,3');

  // Dots
  eventGroups.append('circle')
    .attr('r', 6)
    .attr('fill', d => categories[d.category]?.color || '#94a3b8')
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

  // Year label
  eventGroups.append('text')
    .attr('y', -12)
    .attr('text-anchor', 'middle')
    .attr('font-size', '9px')
    .attr('font-weight', '700')
    .attr('fill', d => categories[d.category]?.color || '#94a3b8')
    .text(d => d.year);

  // Title label
  eventGroups.append('text')
    .attr('y', 16)
    .attr('text-anchor', 'middle')
    .attr('font-size', '8px')
    .attr('fill', isDark ? '#e2e8f0' : '#334155')
    .attr('font-weight', '600')
    .text(d => d.title.length > 18 ? d.title.slice(0, 16) + '...' : d.title);

  // Tooltip
  const tooltip = d3.select(container).append('div')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .attr('class', 'bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 text-xs hidden')
    .style('max-width', '200px');

  eventGroups
    .on('mouseenter', (event, d) => {
      tooltip.classed('hidden', false)
        .html(`<strong style="color:${categories[d.category]?.color}">${d.year}: ${d.title}</strong><br>${d.desc}`)
        .style('left', (event.offsetX + 15) + 'px')
        .style('top', (event.offsetY - 10) + 'px');
    })
    .on('mouseleave', () => tooltip.classed('hidden', true));
}

export { initTimeline };
