// Interactive Codon Wheel - D3.js SVG visualization
// Shows 3 concentric rings (1st base, 2nd base, 3rd base) mapping codons to amino acids

function initCodonWheel() {
  const container = d3.select('#codon-wheel');
  if (container.empty()) return;
  container.html('');

  // --- Data ---
  const bases = ['U', 'C', 'A', 'G'];

  const codonTable = {
    UUU:'F',UUC:'F',UUA:'L',UUG:'L',CUU:'L',CUC:'L',CUA:'L',CUG:'L',
    AUU:'I',AUC:'I',AUA:'I',AUG:'M',GUU:'V',GUC:'V',GUA:'V',GUG:'V',
    UCU:'S',UCC:'S',UCA:'S',UCG:'S',CCU:'P',CCC:'P',CCA:'P',CCG:'P',
    ACU:'T',ACC:'T',ACA:'T',ACG:'T',GCU:'A',GCC:'A',GCA:'A',GCG:'A',
    UAU:'Y',UAC:'Y',UAA:'*',UAG:'*',CAU:'H',CAC:'H',CAA:'Q',CAG:'Q',
    AAU:'N',AAC:'N',AAA:'K',AAG:'K',GAU:'D',GAC:'D',GAA:'E',GAG:'E',
    UGU:'C',UGC:'C',UGA:'*',UGG:'W',CGU:'R',CGC:'R',CGA:'R',CGG:'R',
    AGU:'S',AGC:'S',AGA:'R',AGG:'R',GGU:'G',GGC:'G',GGA:'G',GGG:'G'
  };

  const aaInfo = {
    F:{name:'Phenylalanine',abbr:'Phe',mw:165.19,prop:'hydrophobic'},
    L:{name:'Leucine',abbr:'Leu',mw:131.17,prop:'hydrophobic'},
    I:{name:'Isoleucine',abbr:'Ile',mw:131.17,prop:'hydrophobic'},
    M:{name:'Methionine (Start)',abbr:'Met',mw:149.21,prop:'hydrophobic'},
    V:{name:'Valine',abbr:'Val',mw:117.15,prop:'hydrophobic'},
    A:{name:'Alanine',abbr:'Ala',mw:89.09,prop:'hydrophobic'},
    W:{name:'Tryptophan',abbr:'Trp',mw:204.23,prop:'hydrophobic'},
    P:{name:'Proline',abbr:'Pro',mw:115.13,prop:'hydrophobic'},
    S:{name:'Serine',abbr:'Ser',mw:105.09,prop:'polar'},
    T:{name:'Threonine',abbr:'Thr',mw:119.12,prop:'polar'},
    N:{name:'Asparagine',abbr:'Asn',mw:132.12,prop:'polar'},
    Q:{name:'Glutamine',abbr:'Gln',mw:146.15,prop:'polar'},
    Y:{name:'Tyrosine',abbr:'Tyr',mw:181.19,prop:'polar'},
    C:{name:'Cysteine',abbr:'Cys',mw:121.16,prop:'polar'},
    G:{name:'Glycine',abbr:'Gly',mw:75.03,prop:'polar'},
    K:{name:'Lysine',abbr:'Lys',mw:146.19,prop:'positive'},
    R:{name:'Arginine',abbr:'Arg',mw:174.20,prop:'positive'},
    H:{name:'Histidine',abbr:'His',mw:155.16,prop:'positive'},
    D:{name:'Aspartate',abbr:'Asp',mw:133.10,prop:'negative'},
    E:{name:'Glutamate',abbr:'Glu',mw:147.13,prop:'negative'},
    '*':{name:'Stop codon',abbr:'Ter',mw:0,prop:'stop'}
  };

  const propColors = {
    hydrophobic: '#4a90d9',
    polar: '#5cb85c',
    positive: '#d9534f',
    negative: '#f0ad4e',
    stop: '#555'
  };

  const propLabels = {
    hydrophobic: 'Hydrophobic',
    polar: 'Polar uncharged',
    positive: 'Positively charged',
    negative: 'Negatively charged',
    stop: 'Stop codon'
  };

  // Slightly vary shade per amino acid within a property group
  function aaColor(aa) {
    const info = aaInfo[aa];
    if (!info) return '#999';
    const base = d3.color(propColors[info.prop]);
    // Create slight variation based on character code
    const shift = ((aa.charCodeAt(0) * 17) % 40) - 20;
    return base.brighter(shift / 80).toString();
  }

  // --- Layout ---
  const width = 500, height = 500;
  const cx = width / 2, cy = height / 2;
  const r1 = [40, 90];   // inner ring (1st base)
  const r2 = [95, 160];  // middle ring (2nd base)
  const r3 = [165, 235]; // outer ring (3rd base / amino acid)

  const svg = container.append('svg')
    .attr('width', width).attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('max-width', '100%');

  const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

  // Arc generators
  const arcGen = (innerR, outerR) => d3.arc().innerRadius(innerR).outerRadius(outerR);

  // --- Draw rings ---
  // Inner ring: 4 segments (1st base)
  const innerArc = arcGen(r1[0], r1[1]);
  const innerData = bases.map((b, i) => ({
    base: b, ring: 1,
    startAngle: i * Math.PI / 2,
    endAngle: (i + 1) * Math.PI / 2
  }));

  g.selectAll('.ring1').data(innerData).enter().append('path')
    .attr('class', 'ring1 base-seg')
    .attr('d', d => innerArc(d))
    .attr('fill', '#e8e8e8').attr('stroke', '#fff').attr('stroke-width', 1.5)
    .on('mouseover', function() { d3.select(this).attr('fill', '#d0d0d0'); })
    .on('mouseout', function() { d3.select(this).attr('fill', '#e8e8e8'); });

  g.selectAll('.ring1-label').data(innerData).enter().append('text')
    .attr('class', 'ring1-label')
    .attr('transform', d => {
      const [x, y] = innerArc.centroid(d);
      return `translate(${x},${y})`;
    })
    .attr('text-anchor', 'middle').attr('dy', '0.35em')
    .attr('font-size', '16px').attr('font-weight', 'bold').attr('fill', '#333')
    .attr('pointer-events', 'none')
    .text(d => d.base);

  // Middle ring: 16 segments (1st + 2nd base)
  const midArc = arcGen(r2[0], r2[1]);
  const midData = [];
  bases.forEach((b1, i) => {
    bases.forEach((b2, j) => {
      const idx = i * 4 + j;
      midData.push({
        base: b2, bases: b1 + b2, ring: 2, b1Idx: i,
        startAngle: idx * Math.PI / 8,
        endAngle: (idx + 1) * Math.PI / 8
      });
    });
  });

  g.selectAll('.ring2').data(midData).enter().append('path')
    .attr('class', 'ring2 base-seg')
    .attr('d', d => midArc(d))
    .attr('fill', '#f0f0f0').attr('stroke', '#fff').attr('stroke-width', 1)
    .on('mouseover', function() { d3.select(this).attr('fill', '#ddd'); })
    .on('mouseout', function() { d3.select(this).attr('fill', '#f0f0f0'); });

  g.selectAll('.ring2-label').data(midData).enter().append('text')
    .attr('class', 'ring2-label')
    .attr('transform', d => {
      const [x, y] = midArc.centroid(d);
      return `translate(${x},${y}) rotate(${(d.startAngle + d.endAngle) / 2 * 180 / Math.PI})`;
    })
    .attr('text-anchor', 'middle').attr('dy', '0.35em')
    .attr('font-size', '10px').attr('fill', '#555')
    .attr('pointer-events', 'none')
    .text(d => d.base);

  // Outer ring: 64 segments (full codon -> amino acid)
  const outerArc = arcGen(r3[0], r3[1]);
  const outerData = [];
  bases.forEach((b1, i) => {
    bases.forEach((b2, j) => {
      bases.forEach((b3, k) => {
        const idx = i * 16 + j * 4 + k;
        const codon = b1 + b2 + b3;
        const aa = codonTable[codon];
        outerData.push({
          codon, aa, base: b3, ring: 3, b1Idx: i, b2Idx: j,
          startAngle: idx * Math.PI / 32,
          endAngle: (idx + 1) * Math.PI / 32
        });
      });
    });
  });

  const outerPaths = g.selectAll('.ring3').data(outerData).enter().append('path')
    .attr('class', 'ring3 codon-seg')
    .attr('d', d => outerArc(d))
    .attr('fill', d => aaColor(d.aa))
    .attr('stroke', '#fff').attr('stroke-width', 0.5)
    .style('cursor', 'pointer');

  g.selectAll('.ring3-label').data(outerData).enter().append('text')
    .attr('class', 'ring3-label')
    .attr('transform', d => {
      const angle = (d.startAngle + d.endAngle) / 2;
      const r = (r3[0] + r3[1]) / 2;
      const x = r * Math.sin(angle);
      const y = -r * Math.cos(angle);
      let rot = angle * 180 / Math.PI;
      if (rot > 90 && rot < 270) rot += 180;
      return `translate(${x},${y}) rotate(${rot})`;
    })
    .attr('text-anchor', 'middle').attr('dy', '0.35em')
    .attr('font-size', '7px').attr('fill', '#fff').attr('font-weight', 'bold')
    .attr('pointer-events', 'none')
    .text(d => d.aa);

  // --- Info panel ---
  const infoDiv = container.append('div')
    .attr('class', 'codon-info-panel')
    .style('margin-top', '12px')
    .style('min-height', '60px')
    .style('padding', '10px 14px')
    .style('background', '#f8f9fa')
    .style('border-radius', '8px')
    .style('border', '1px solid #dee2e6')
    .style('font-size', '14px')
    .style('line-height', '1.6')
    .html('<em>Hover over the wheel or click a codon for details.</em>');

  function showInfo(d) {
    const info = aaInfo[d.aa];
    if (!info) return;
    const mwStr = info.mw > 0 ? `${info.mw} Da` : 'N/A';
    infoDiv.html(
      `<strong>Codon:</strong> ${d.codon} &nbsp;|&nbsp; ` +
      `<strong>Amino Acid:</strong> ${info.name} (${d.aa}, ${info.abbr}) &nbsp;|&nbsp; ` +
      `<strong>Property:</strong> ${propLabels[info.prop]} &nbsp;|&nbsp; ` +
      `<strong>MW:</strong> ${mwStr}`
    );
  }

  // --- Highlight helpers ---
  let activeAA = null;

  function highlightCodon(d) {
    // Dim everything
    g.selectAll('.codon-seg').attr('opacity', 0.25);
    g.selectAll('.base-seg').attr('opacity', 0.3);
    // Highlight matching outer segment
    g.selectAll('.codon-seg').filter(o => o.codon === d.codon).attr('opacity', 1);
    // Highlight matching middle and inner segments
    g.selectAll('.ring2').filter(o => o.b1Idx === d.b1Idx && bases.indexOf(o.base) === d.b2Idx)
      .attr('opacity', 1);
    g.selectAll('.ring1').filter(o => bases.indexOf(o.base) === d.b1Idx)
      .attr('opacity', 1);
  }

  function highlightAA(aa) {
    activeAA = aa;
    g.selectAll('.codon-seg').attr('opacity', d => d.aa === aa ? 1 : 0.15);
    g.selectAll('.base-seg').attr('opacity', 0.4);
    // Show info for first codon of this AA
    const first = outerData.find(d => d.aa === aa);
    if (first) {
      const info = aaInfo[aa];
      const codons = outerData.filter(d => d.aa === aa).map(d => d.codon).join(', ');
      const mwStr = info.mw > 0 ? `${info.mw} Da` : 'N/A';
      infoDiv.html(
        `<strong>${info.name}</strong> (${aa}, ${info.abbr}) &nbsp;|&nbsp; ` +
        `<strong>Property:</strong> ${propLabels[info.prop]} &nbsp;|&nbsp; ` +
        `<strong>MW:</strong> ${mwStr}<br>` +
        `<strong>Codons (${outerData.filter(d => d.aa === aa).length}):</strong> ${codons}`
      );
    }
  }

  function resetHighlight() {
    if (activeAA) return;
    g.selectAll('.codon-seg').attr('opacity', 1);
    g.selectAll('.base-seg').attr('opacity', 1);
    infoDiv.html('<em>Hover over the wheel or click a codon for details.</em>');
  }

  // --- Events ---
  outerPaths
    .on('mouseover', function(event, d) {
      if (!activeAA) {
        highlightCodon(d);
        showInfo(d);
      }
    })
    .on('mouseout', function() {
      if (!activeAA) resetHighlight();
    })
    .on('click', function(event, d) {
      activeAA = null;
      legendItems.style('outline', 'none');
      highlightCodon(d);
      showInfo(d);
      // Clicking same codon toggles off
      event.stopPropagation();
    });

  svg.on('click', function() {
    activeAA = null;
    legendItems.style('outline', 'none');
    resetHighlight();
  });

  // --- Legend ---
  const legendDiv = container.append('div')
    .style('display', 'flex').style('flex-wrap', 'wrap')
    .style('gap', '6px 16px').style('margin-top', '12px');

  // Property color boxes
  const propDiv = legendDiv.append('div').style('width', '100%')
    .style('display', 'flex').style('flex-wrap', 'wrap').style('gap', '8px 18px')
    .style('margin-bottom', '6px');

  Object.entries(propLabels).forEach(([key, label]) => {
    propDiv.append('span')
      .style('display', 'inline-flex').style('align-items', 'center').style('gap', '5px')
      .style('font-size', '13px')
      .html(`<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${propColors[key]}"></span>${label}`);
  });

  // Amino acid list - clickable for reverse lookup
  const aaListDiv = legendDiv.append('div').style('width', '100%')
    .style('display', 'flex').style('flex-wrap', 'wrap').style('gap', '4px 6px')
    .style('margin-top', '4px');

  const aaKeys = Object.keys(aaInfo);
  const legendItems = aaListDiv.selectAll('.aa-legend').data(aaKeys).enter()
    .append('span')
    .attr('class', 'aa-legend')
    .style('display', 'inline-flex').style('align-items', 'center').style('gap', '3px')
    .style('padding', '2px 7px').style('border-radius', '4px')
    .style('font-size', '12px').style('cursor', 'pointer')
    .style('background', '#f0f0f0').style('user-select', 'none')
    .html(d => {
      const info = aaInfo[d];
      return `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${propColors[info.prop]}"></span><strong>${d}</strong> ${info.abbr}`;
    })
    .on('click', function(event, aa) {
      event.stopPropagation();
      if (activeAA === aa) {
        activeAA = null;
        legendItems.style('outline', 'none');
        resetHighlight();
      } else {
        legendItems.style('outline', 'none');
        d3.select(this).style('outline', '2px solid #333');
        highlightAA(aa);
      }
    });
}

function init() { initCodonWheel(); }
export { init, initCodonWheel };
