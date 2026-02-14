/**
 * HTGAA Week 2 — Interactive Concept Map
 * D3.js force-directed graph showing connections between all topics and concepts.
 */

import { store, TOPICS } from './store.js';

function createConceptMapView() {
  let simulation = null;

  return {
    render() {
      return `
        <div class="max-w-6xl mx-auto px-4 py-8">
          <header class="mb-8">
            <a data-route="#/" class="text-sm text-slate-500 hover:text-blue-500 cursor-pointer flex items-center gap-1 mb-4">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Hub
            </a>
            <h1 class="text-3xl font-extrabold mb-3 flex items-center gap-3">
              <i data-lucide="git-branch" class="w-8 h-8 text-cyan-500"></i>
              Concept Map
            </h1>
            <p class="text-slate-500">Explore how all Week 2 topics and concepts connect. Click a node to learn more.</p>
          </header>

          <!-- Filter -->
          <div class="mb-4 flex items-center gap-2 flex-wrap">
            <button class="cm-filter px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" data-filter="all">All</button>
            ${TOPICS.map(t => `
              <button class="cm-filter px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200" data-filter="${t.id}">${t.title}</button>
            `).join('')}
          </div>

          <!-- Graph Container -->
          <div id="concept-map-container" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" style="height: 600px; position: relative;">
            <div id="concept-map-svg"></div>
          </div>

          <!-- Info Panel -->
          <div id="cm-info" class="mt-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hidden">
            <h3 id="cm-info-title" class="font-bold text-lg mb-2"></h3>
            <p id="cm-info-desc" class="text-sm text-slate-600 dark:text-slate-400 mb-3"></p>
            <a id="cm-info-link" class="text-sm text-blue-500 hover:underline cursor-pointer"></a>
          </div>

          <!-- Legend -->
          <div class="mt-4 flex items-center gap-4 flex-wrap text-xs text-slate-500">
            ${TOPICS.map(t => `
              <span class="flex items-center gap-1">
                <span class="w-3 h-3 rounded-full" style="background: ${topicColor(t.id)}"></span>
                ${t.title}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    },

    mount(container) {
      buildGraph(container);

      // Filter buttons
      container.querySelectorAll('.cm-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.cm-filter').forEach(b => {
            b.className = b === btn
              ? 'cm-filter px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'cm-filter px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200';
          });
          filterGraph(container, btn.dataset.filter);
        });
      });
    },

    unmount() {
      if (simulation) {
        simulation.stop();
        simulation = null;
      }
    }
  };

  function buildGraph(container) {
    const svgContainer = container.querySelector('#concept-map-svg');
    const rect = container.querySelector('#concept-map-container').getBoundingClientRect();
    const width = rect.width;
    const height = 600;

    const { nodes, links } = getGraphData();

    const svg = d3.select(svgContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Add zoom/pan
    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Zoom controls
    const controls = document.createElement('div');
    controls.className = 'absolute top-3 right-3 flex flex-col gap-1 z-10';
    controls.innerHTML = `
      <button class="cm-zoom-btn bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600" data-zoom="in">+</button>
      <button class="cm-zoom-btn bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600" data-zoom="out">−</button>
      <button class="cm-zoom-btn bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg w-8 h-8 flex items-center justify-center text-xs shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600" data-zoom="reset">⊙</button>
    `;
    container.querySelector('#concept-map-container').appendChild(controls);
    controls.querySelectorAll('.cm-zoom-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.zoom === 'in') svg.transition().duration(300).call(zoom.scaleBy, 1.4);
        else if (btn.dataset.zoom === 'out') svg.transition().duration(300).call(zoom.scaleBy, 0.7);
        else svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
      });
    });

    // Defs for arrows
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#94a3b8');

    simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.isTopic ? 120 : 80))
      .force('charge', d3.forceManyBody().strength(d => d.isTopic ? -400 : -150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.isTopic ? 35 : 20));

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', d => d.isTopic ? 2 : 1);

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'concept-node')
      .attr('data-topic', d => d.topicId)
      .call(drag(simulation));

    // Topic nodes (larger circles)
    node.filter(d => d.isTopic)
      .append('circle')
      .attr('r', 24)
      .attr('fill', d => topicColor(d.id))
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))');

    // Concept nodes (smaller circles)
    node.filter(d => !d.isTopic)
      .append('circle')
      .attr('r', 12)
      .attr('fill', d => topicColor(d.topicId))
      .attr('fill-opacity', 0.7)
      .attr('stroke', d => topicColor(d.topicId))
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer');

    // Labels
    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.isTopic ? 38 : 22)
      .attr('font-size', d => d.isTopic ? '11px' : '9px')
      .attr('font-weight', d => d.isTopic ? '700' : '500')
      .attr('fill', isDark() ? '#e2e8f0' : '#475569')
      .attr('pointer-events', 'none');

    // Click handler
    node.on('click', (event, d) => {
      const info = container.querySelector('#cm-info');
      const title = container.querySelector('#cm-info-title');
      const desc = container.querySelector('#cm-info-desc');
      const link = container.querySelector('#cm-info-link');

      info.classList.remove('hidden');
      title.textContent = d.label;
      desc.textContent = d.description || '';

      if (d.isTopic) {
        link.textContent = `Go to ${d.label} chapter`;
        link.dataset.route = `#/topic/${d.id}`;
      } else {
        const topic = TOPICS.find(t => t.id === d.topicId);
        link.textContent = `Part of: ${topic?.title || d.topicId}`;
        link.dataset.route = `#/topic/${d.topicId}`;
      }

      // Highlight connected nodes
      const connected = new Set();
      connected.add(d.id);
      links.forEach(l => {
        if (l.source.id === d.id) connected.add(l.target.id);
        if (l.target.id === d.id) connected.add(l.source.id);
      });

      node.select('circle')
        .attr('opacity', n => connected.has(n.id) ? 1 : 0.2);
      node.select('text')
        .attr('opacity', n => connected.has(n.id) ? 1 : 0.2);

      setTimeout(() => {
        node.select('circle').attr('opacity', 1);
        node.select('text').attr('opacity', 1);
      }, 2000);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }

  function filterGraph(container, filter) {
    const nodes = container.querySelectorAll('.concept-node');
    nodes.forEach(n => {
      const topicId = n.getAttribute('data-topic');
      const show = filter === 'all' || topicId === filter;
      n.style.opacity = show ? 1 : 0.15;
    });
  }

  function drag(sim) {
    return d3.drag()
      .on('start', (event, d) => {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }
}

function topicColor(topicId) {
  const colors = {
    'sequencing': '#3b82f6',
    'synthesis': '#10b981',
    'editing': '#ef4444',
    'genetic-codes': '#8b5cf6',
    'gel-electrophoresis': '#f59e0b',
    'central-dogma': '#6366f1',
  };
  return colors[topicId] || '#94a3b8';
}

function isDark() {
  return document.documentElement.classList.contains('dark');
}

function getGraphData() {
  const nodes = [];
  const links = [];

  // Topic nodes
  TOPICS.forEach(t => {
    nodes.push({ id: t.id, label: t.title, isTopic: true, topicId: t.id, description: '' });
  });

  // Concept nodes and links
  const concepts = [
    // Sequencing concepts
    { id: 'sanger', label: 'Sanger', topicId: 'sequencing', description: 'Chain termination sequencing with ddNTPs' },
    { id: 'illumina', label: 'Illumina SBS', topicId: 'sequencing', description: 'Short-read sequencing by synthesis with reversible terminators' },
    { id: 'nanopore', label: 'Nanopore', topicId: 'sequencing', description: 'Single-molecule sequencing through protein pores' },
    { id: 'pacbio', label: 'PacBio SMRT', topicId: 'sequencing', description: 'Zero-mode waveguide real-time sequencing' },
    { id: 'spatial', label: 'Spatial Omics', topicId: 'sequencing', description: 'Sequencing with preserved tissue architecture' },

    // Synthesis concepts
    { id: 'phosphoramidite', label: 'Phosphoramidite', topicId: 'synthesis', description: '4-step chemical DNA synthesis cycle' },
    { id: 'gibson', label: 'Gibson Assembly', topicId: 'synthesis', description: 'Isothermal assembly of overlapping DNA fragments' },
    { id: 'chip-synth', label: 'Chip Synthesis', topicId: 'synthesis', description: 'Massively parallel oligo synthesis on silicon' },
    { id: 'error-correction', label: 'Error Correction', topicId: 'synthesis', description: 'MutS-based mismatch removal' },
    { id: 'dna-storage', label: 'DNA Storage', topicId: 'synthesis', description: 'Encoding digital data in DNA sequences' },

    // Editing concepts
    { id: 'crispr', label: 'CRISPR-Cas9', topicId: 'editing', description: 'RNA-guided programmable nuclease' },
    { id: 'base-editing', label: 'Base Editing', topicId: 'editing', description: 'Point mutations without double-strand breaks' },
    { id: 'prime-editing', label: 'Prime Editing', topicId: 'editing', description: 'Search-and-replace genome editing' },
    { id: 'paste', label: 'PASTE', topicId: 'editing', description: 'Large DNA insertion via integrase' },
    { id: 'mage', label: 'MAGE', topicId: 'editing', description: 'Multiplex automated genome engineering' },

    // Genetic codes concepts
    { id: 'codon-table', label: 'Codon Table', topicId: 'genetic-codes', description: '64 codons mapping to 20 amino acids' },
    { id: 'aegis', label: 'AEGIS', topicId: 'genetic-codes', description: 'Artificially expanded genetic information system' },
    { id: 'nsaa', label: 'Non-Standard AA', topicId: 'genetic-codes', description: 'Unnatural amino acids incorporated via code expansion' },
    { id: 'mirror-bio', label: 'Mirror Biology', topicId: 'genetic-codes', description: 'D-amino acid organisms and biosafety' },

    // Gel concepts
    { id: 'restriction-enzymes', label: 'Restriction Enzymes', topicId: 'gel-electrophoresis', description: 'Bacterial enzymes that cut DNA at specific sequences' },
    { id: 'gel-physics', label: 'Gel Physics', topicId: 'gel-electrophoresis', description: 'Size separation through agarose matrix' },
    { id: 'sticky-blunt', label: 'Sticky/Blunt Ends', topicId: 'gel-electrophoresis', description: 'Types of DNA ends from restriction cuts' },
    { id: 'dna-ladder', label: 'DNA Ladder', topicId: 'gel-electrophoresis', description: 'Size standards for gel calibration' },

    // Central dogma concepts
    { id: 'transcription', label: 'Transcription', topicId: 'central-dogma', description: 'DNA → mRNA by RNA polymerase' },
    { id: 'translation', label: 'Translation', topicId: 'central-dogma', description: 'mRNA → protein by ribosomes' },
    { id: 'expression-cassette', label: 'Expression Cassette', topicId: 'central-dogma', description: 'Promoter → RBS → CDS → Terminator' },
    { id: 'codon-opt', label: 'Codon Optimization', topicId: 'central-dogma', description: 'Matching codons to host tRNA abundances' },
    { id: 'metabolic-eng', label: 'Metabolic Eng.', topicId: 'central-dogma', description: 'Engineering cellular metabolism for production' },
  ];

  concepts.forEach(c => {
    nodes.push({ ...c, isTopic: false });
    links.push({ source: c.topicId, target: c.id, isTopic: false });
  });

  // Cross-topic links
  const crossLinks = [
    { source: 'sequencing', target: 'synthesis', isTopic: true },
    { source: 'sequencing', target: 'editing', isTopic: true },
    { source: 'synthesis', target: 'editing', isTopic: true },
    { source: 'synthesis', target: 'central-dogma', isTopic: true },
    { source: 'genetic-codes', target: 'central-dogma', isTopic: true },
    { source: 'gel-electrophoresis', target: 'synthesis', isTopic: true },
    { source: 'editing', target: 'genetic-codes', isTopic: true },

    // Cross-concept links
    { source: 'crispr', target: 'base-editing' },
    { source: 'crispr', target: 'prime-editing' },
    { source: 'prime-editing', target: 'paste' },
    { source: 'mage', target: 'nsaa' },
    { source: 'codon-table', target: 'codon-opt' },
    { source: 'codon-opt', target: 'expression-cassette' },
    { source: 'gibson', target: 'expression-cassette' },
    { source: 'phosphoramidite', target: 'chip-synth' },
    { source: 'phosphoramidite', target: 'error-correction' },
    { source: 'restriction-enzymes', target: 'sticky-blunt' },
    { source: 'transcription', target: 'translation' },
    { source: 'nanopore', target: 'aegis' },
    { source: 'error-correction', target: 'sequencing' },
  ];

  crossLinks.forEach(l => links.push(l));

  return { nodes, links };
}

export { createConceptMapView };
