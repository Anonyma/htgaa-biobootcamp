/**
 * HTGAA Week 2 — Inline SVG Diagram Library
 * Generates educational SVG diagrams for embedding in topic content.
 */

const P = {
  bg: "#0f172a", bgLight: "#f8fafc",
  red: "#ef4444", blue: "#3b82f6", green: "#22c55e", yellow: "#eab308",
  orange: "#f97316", purple: "#a855f7", cyan: "#06b6d4", pink: "#ec4899",
  slate: "#94a3b8", dark: "#1e293b", white: "#ffffff",
  accent1: "#6366f1", accent2: "#14b8a6",
};

function wrap(svg, caption, w = 600, h = 300) {
  return `<div class="inline-diagram my-6">
    ${svg}
    <p class="text-xs text-center text-slate-400 mt-1">${caption}</p>
  </div>`;
}

function defs(extras = "") {
  return `<defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="shadow"><feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.3"/></filter>
    ${extras}
  </defs>`;
}

/* ─── 1. DNA Double Helix ─── */
export function svgDnaDoubleHelix() {
  let basePairs = "";
  const bpColors = [
    { l: P.red, r: P.blue, lb: "A", rb: "T" },
    { l: P.green, r: P.yellow, lb: "G", rb: "C" },
    { l: P.blue, r: P.red, lb: "T", rb: "A" },
    { l: P.green, r: P.yellow, lb: "G", rb: "C" },
    { l: P.red, r: P.blue, lb: "A", rb: "T" },
    { l: P.yellow, r: P.green, lb: "C", rb: "G" },
    { l: P.blue, r: P.red, lb: "T", rb: "A" },
    { l: P.red, r: P.blue, lb: "A", rb: "T" },
  ];
  for (let i = 0; i < 8; i++) {
    const y = 40 + i * 30;
    const xOff = Math.sin(i * 0.8) * 40;
    const lx = 250 + xOff, rx = 350 - xOff;
    const sc = 0.7 + Math.cos(i * 0.8) * 0.3;
    const bp = bpColors[i];
    const op = 0.5 + sc * 0.5;
    basePairs += `
      <circle cx="${lx}" cy="${y}" r="${6 * sc}" fill="${bp.l}" opacity="${op}"/>
      <circle cx="${rx}" cy="${y}" r="${6 * sc}" fill="${bp.r}" opacity="${op}"/>
      <line x1="${lx + 6 * sc}" y1="${y}" x2="${rx - 6 * sc}" y2="${y}"
        stroke="${P.slate}" stroke-width="${1.5 * sc}" stroke-dasharray="3,2" opacity="${op}"/>
      <text x="${lx}" y="${y + 4}" text-anchor="middle" fill="${P.white}"
        font-size="${9 * sc}" font-weight="bold" opacity="${op}">${bp.lb}</text>
      <text x="${rx}" y="${y + 4}" text-anchor="middle" fill="${P.white}"
        font-size="${9 * sc}" font-weight="bold" opacity="${op}">${bp.rb}</text>`;
  }
  // Backbone curves
  let leftBack = "M ", rightBack = "M ";
  for (let i = 0; i < 8; i++) {
    const y = 40 + i * 30;
    const xOff = Math.sin(i * 0.8) * 40;
    leftBack += `${i === 0 ? "" : "L "}${250 + xOff},${y} `;
    rightBack += `${i === 0 ? "" : "L "}${350 - xOff},${y} `;
  }
  const svg = `<svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    ${defs(`
      <linearGradient id="backboneL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${P.accent1}"/><stop offset="100%" stop-color="${P.purple}"/>
      </linearGradient>
      <linearGradient id="backboneR" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${P.accent2}"/><stop offset="100%" stop-color="${P.cyan}"/>
      </linearGradient>
    `)}
    <text x="300" y="22" text-anchor="middle" fill="${P.white}" font-size="14" font-weight="bold">DNA Double Helix</text>
    <path d="${leftBack}" fill="none" stroke="url(#backboneL)" stroke-width="3" stroke-linecap="round"/>
    <path d="${rightBack}" fill="none" stroke="url(#backboneR)" stroke-width="3" stroke-linecap="round"/>
    ${basePairs}
    <!-- Direction labels -->
    <text x="200" y="38" fill="${P.accent1}" font-size="11" font-weight="bold">5\u2032</text>
    <text x="200" y="268" fill="${P.accent1}" font-size="11" font-weight="bold">3\u2032</text>
    <text x="400" y="38" fill="${P.accent2}" font-size="11" font-weight="bold">3\u2032</text>
    <text x="400" y="268" fill="${P.accent2}" font-size="11" font-weight="bold">5\u2032</text>
    <!-- Legend -->
    <circle cx="80" cy="270" r="5" fill="${P.red}"/><text x="90" y="274" fill="${P.slate}" font-size="10">A</text>
    <circle cx="110" cy="270" r="5" fill="${P.blue}"/><text x="120" y="274" fill="${P.slate}" font-size="10">T</text>
    <circle cx="140" cy="270" r="5" fill="${P.green}"/><text x="150" y="274" fill="${P.slate}" font-size="10">G</text>
    <circle cx="170" cy="270" r="5" fill="${P.yellow}"/><text x="180" y="274" fill="${P.slate}" font-size="10">C</text>
    <text x="80" y="290" fill="${P.slate}" font-size="9">Sugar-phosphate backbone shown as colored strands</text>
    <!-- Arrows -->
    <line x1="205" y1="42" x2="205" y2="260" stroke="${P.accent1}" stroke-width="1.5" marker-end="url(#arr1)"/>
    <line x1="395" y1="260" x2="395" y2="42" stroke="${P.accent2}" stroke-width="1.5" marker-end="url(#arr2)"/>
    <marker id="arr1" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="${P.accent1}"/></marker>
    <marker id="arr2" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="${P.accent2}"/></marker>
  </svg>`;
  return wrap(svg, "Figure: DNA Double Helix — Base pairs (A-T, G-C) connected by hydrogen bonds between antiparallel strands");
}

/* ─── 2. Sanger Sequencing ─── */
export function svgSangerSequencing() {
  const svg = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    ${defs(`
      <linearGradient id="gelGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1e3a5f"/><stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    `)}
    <text x="300" y="22" text-anchor="middle" fill="${P.white}" font-size="14" font-weight="bold">Sanger Sequencing (Chain Termination)</text>
    <!-- Step 1: Template + Primer -->
    <text x="20" y="50" fill="${P.cyan}" font-size="11" font-weight="bold">1. Template &amp; Primer</text>
    <line x1="40" y1="65" x2="250" y2="65" stroke="${P.blue}" stroke-width="3"/>
    <text x="145" y="62" text-anchor="middle" fill="${P.slate}" font-size="9">3\u2032 — Template — 5\u2032</text>
    <line x1="40" y1="80" x2="120" y2="80" stroke="${P.green}" stroke-width="3"/>
    <text x="80" y="95" text-anchor="middle" fill="${P.green}" font-size="9">Primer</text>
    <polygon points="122,77 130,80 122,83" fill="${P.green}"/>

    <!-- Step 2: Extension with ddNTPs -->
    <text x="20" y="125" fill="${P.cyan}" font-size="11" font-weight="bold">2. Extension + ddNTP Termination</text>
    <line x1="40" y1="140" x2="250" y2="140" stroke="${P.blue}" stroke-width="3"/>
    <line x1="40" y1="155" x2="100" y2="155" stroke="${P.green}" stroke-width="2.5"/>
    <line x1="100" y1="155" x2="160" y2="155" stroke="${P.orange}" stroke-width="2.5"/>
    <rect x="158" y="149" width="12" height="12" rx="2" fill="${P.red}" opacity="0.9"/>
    <text x="164" y="158" text-anchor="middle" fill="${P.white}" font-size="7" font-weight="bold">dd</text>
    <text x="190" y="158" fill="${P.slate}" font-size="9">\u2190 Chain stops here</text>

    <!-- Multiple fragment lengths -->
    <g transform="translate(0,10)">
      <line x1="40" y1="175" x2="80" y2="175" stroke="${P.orange}" stroke-width="2"/>
      <rect x="78" y="171" width="8" height="8" rx="1" fill="${P.red}"/>
      <line x1="40" y1="188" x2="110" y2="188" stroke="${P.orange}" stroke-width="2"/>
      <rect x="108" y="184" width="8" height="8" rx="1" fill="${P.green}"/>
      <line x1="40" y1="201" x2="140" y2="201" stroke="${P.orange}" stroke-width="2"/>
      <rect x="138" y="197" width="8" height="8" rx="1" fill="${P.blue}"/>
      <line x1="40" y1="214" x2="170" y2="214" stroke="${P.orange}" stroke-width="2"/>
      <rect x="168" y="210" width="8" height="8" rx="1" fill="${P.yellow}"/>
      <text x="195" y="198" fill="${P.slate}" font-size="9">Fragments of every length</text>
    </g>

    <!-- Step 3: Gel / Capillary -->
    <text x="320" y="50" fill="${P.cyan}" font-size="11" font-weight="bold">3. Capillary Electrophoresis</text>
    <rect x="340" y="60" width="80" height="200" rx="4" fill="url(#gelGrad)" stroke="${P.slate}" stroke-width="1"/>
    <text x="380" y="75" text-anchor="middle" fill="${P.slate}" font-size="8">\u2296 Cathode</text>
    <!-- Bands -->
    <rect x="355" y="90" width="50" height="5" rx="2" fill="${P.red}" opacity="0.8"/>
    <text x="415" y="96" fill="${P.red}" font-size="9">A</text>
    <rect x="355" y="110" width="50" height="5" rx="2" fill="${P.green}" opacity="0.8"/>
    <text x="415" y="116" fill="${P.green}" font-size="9">G</text>
    <rect x="355" y="130" width="50" height="5" rx="2" fill="${P.blue}" opacity="0.8"/>
    <text x="415" y="136" fill="${P.blue}" font-size="9">C</text>
    <rect x="355" y="150" width="50" height="5" rx="2" fill="${P.yellow}" opacity="0.8"/>
    <text x="415" y="156" fill="${P.yellow}" font-size="9">T</text>
    <rect x="355" y="170" width="50" height="5" rx="2" fill="${P.red}" opacity="0.8"/>
    <text x="415" y="176" fill="${P.red}" font-size="9">A</text>
    <rect x="355" y="190" width="50" height="5" rx="2" fill="${P.green}" opacity="0.8"/>
    <text x="415" y="196" fill="${P.green}" font-size="9">G</text>
    <rect x="355" y="210" width="50" height="5" rx="2" fill="${P.blue}" opacity="0.8"/>
    <text x="415" y="216" fill="${P.blue}" font-size="9">C</text>
    <rect x="355" y="230" width="50" height="5" rx="2" fill="${P.red}" opacity="0.8"/>
    <text x="415" y="236" fill="${P.red}" font-size="9">A</text>
    <text x="380" y="255" text-anchor="middle" fill="${P.slate}" font-size="8">\u2295 Anode</text>
    <text x="380" y="272" text-anchor="middle" fill="${P.slate}" font-size="8">\u2190 Small fragments migrate further</text>

    <!-- Step 4: Chromatogram -->
    <text x="320" y="295" fill="${P.cyan}" font-size="11" font-weight="bold">4. Chromatogram Readout</text>
    <polyline points="330,340 345,320 360,350 375,310 390,345 405,315 420,355 435,325 450,340 465,320 480,350 495,330 510,340"
      fill="none" stroke="${P.green}" stroke-width="1.5" opacity="0.6"/>
    <polyline points="330,345 345,330 360,340 375,320 390,355 405,325 420,345 435,315 450,350 465,330 480,340 495,320 510,345"
      fill="none" stroke="${P.red}" stroke-width="1.5" opacity="0.6"/>
    <polyline points="330,350 345,340 360,330 375,345 390,335 405,350 420,320 435,340 450,330 465,345 480,325 495,340 510,335"
      fill="none" stroke="${P.blue}" stroke-width="1.5" opacity="0.6"/>
    <text x="330" y="375" fill="${P.slate}" font-size="9">A G C T A G C A — Sequence read</text>
    <text x="330" y="390" fill="${P.slate}" font-size="8">Read length: ~700-1000 bp (Sanger limit)</text>
  </svg>`;
  return wrap(svg, "Figure: Sanger Sequencing — ddNTP chain termination, gel separation, and base calling", 600, 400);
}

/* ─── 3. Illumina Flow Cell ─── */
export function svgIlluminaFlowCell() {
  const svg = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    ${defs(`
      <linearGradient id="flowcellGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#1e3a5f"/><stop offset="100%" stop-color="#162d4a"/>
      </linearGradient>
      <radialGradient id="clusterGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${P.green}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${P.green}" stop-opacity="0"/>
      </radialGradient>
    `)}
    <text x="300" y="22" text-anchor="middle" fill="${P.white}" font-size="14" font-weight="bold">Illumina Sequencing by Synthesis</text>

    <!-- Step 1: Library binds -->
    <text x="20" y="55" fill="${P.cyan}" font-size="11" font-weight="bold">1. Library Binding</text>
    <rect x="20" y="65" width="130" height="70" rx="4" fill="url(#flowcellGrad)" stroke="${P.slate}" stroke-width="1"/>
    <!-- Surface oligos -->
    <line x1="35" y1="135" x2="35" y2="115" stroke="${P.accent2}" stroke-width="2"/>
    <line x1="55" y1="135" x2="55" y2="115" stroke="${P.accent2}" stroke-width="2"/>
    <line x1="75" y1="135" x2="75" y2="115" stroke="${P.accent2}" stroke-width="2"/>
    <line x1="95" y1="135" x2="95" y2="115" stroke="${P.accent1}" stroke-width="2"/>
    <line x1="115" y1="135" x2="115" y2="115" stroke="${P.accent1}" stroke-width="2"/>
    <line x1="135" y1="135" x2="135" y2="115" stroke="${P.accent1}" stroke-width="2"/>
    <!-- DNA fragment binding -->
    <path d="M 55,115 Q 55,100 75,95 Q 95,90 95,115" fill="none" stroke="${P.orange}" stroke-width="2.5"/>
    <text x="75" y="88" text-anchor="middle" fill="${P.orange}" font-size="8">ssDNA</text>
    <text x="85" y="148" text-anchor="middle" fill="${P.slate}" font-size="8">Flow cell surface</text>

    <!-- Step 2: Bridge Amplification -->
    <text x="170" y="55" fill="${P.cyan}" font-size="11" font-weight="bold">2. Bridge Amplification</text>
    <rect x="170" y="65" width="130" height="70" rx="4" fill="url(#flowcellGrad)" stroke="${P.slate}" stroke-width="1"/>
    <path d="M 195,135 L 195,115 Q 195,95 215,90 Q 235,85 255,90 Q 275,95 275,115 L 275,135"
      fill="none" stroke="${P.orange}" stroke-width="2" stroke-dasharray="4,2"/>
    <path d="M 195,135 L 195,118 Q 195,100 215,95 Q 235,90 255,95 Q 275,100 275,118 L 275,135"
      fill="none" stroke="${P.green}" stroke-width="2"/>
    <text x="235" y="82" text-anchor="middle" fill="${P.slate}" font-size="8">Bridge forms</text>
    <text x="235" y="148" text-anchor="middle" fill="${P.slate}" font-size="8">\u2192 Clonal clusters</text>

    <!-- Step 3: Cluster -->
    <text x="320" y="55" fill="${P.cyan}" font-size="11" font-weight="bold">3. Cluster Generation</text>
    <rect x="320" y="65" width="130" height="70" rx="4" fill="url(#flowcellGrad)" stroke="${P.slate}" stroke-width="1"/>
    <circle cx="365" cy="105" r="20" fill="url(#clusterGlow)"/>
    <circle cx="405" cy="100" r="18" fill="url(#clusterGlow)"/>
    <circle cx="385" cy="115" r="15" fill="url(#clusterGlow)"/>
    <!-- tiny strands in cluster -->
    <g opacity="0.8">
      <line x1="358" y1="100" x2="358" y2="110" stroke="${P.green}" stroke-width="1"/>
      <line x1="362" y1="98" x2="362" y2="108" stroke="${P.green}" stroke-width="1"/>
      <line x1="366" y1="97" x2="366" y2="107" stroke="${P.green}" stroke-width="1"/>
      <line x1="370" y1="99" x2="370" y2="109" stroke="${P.green}" stroke-width="1"/>
      <line x1="398" y1="95" x2="398" y2="105" stroke="${P.green}" stroke-width="1"/>
      <line x1="402" y1="94" x2="402" y2="104" stroke="${P.green}" stroke-width="1"/>
      <line x1="406" y1="96" x2="406" y2="106" stroke="${P.green}" stroke-width="1"/>
      <line x1="410" y1="95" x2="410" y2="105" stroke="${P.green}" stroke-width="1"/>
    </g>
    <text x="385" y="148" text-anchor="middle" fill="${P.slate}" font-size="8">~1000 identical copies</text>

    <!-- Step 4: Sequencing by Synthesis -->
    <text x="470" y="55" fill="${P.cyan}" font-size="11" font-weight="bold">4. SBS</text>
    <rect x="470" y="65" width="115" height="70" rx="4" fill="url(#flowcellGrad)" stroke="${P.slate}" stroke-width="1"/>
    <!-- Fluorescent nucleotides -->
    <line x1="490" y1="135" x2="490" y2="105" stroke="${P.green}" stroke-width="2"/>
    <circle cx="490" cy="100" r="5" fill="${P.red}"/><text x="490" y="103" text-anchor="middle" fill="${P.white}" font-size="6">A</text>
    <line x1="510" y1="135" x2="510" y2="110" stroke="${P.green}" stroke-width="2"/>
    <circle cx="510" cy="105" r="5" fill="${P.blue}"/><text x="510" y="108" text-anchor="middle" fill="${P.white}" font-size="6">C</text>
    <line x1="530" y1="135" x2="530" y2="100" stroke="${P.green}" stroke-width="2"/>
    <circle cx="530" cy="95" r="5" fill="${P.yellow}"/><text x="530" y="98" text-anchor="middle" fill="${P.dark}" font-size="6">G</text>
    <line x1="550" y1="135" x2="550" y2="108" stroke="${P.green}" stroke-width="2"/>
    <circle cx="550" cy="103" r="5" fill="${P.green}"/><text x="550" y="106" text-anchor="middle" fill="${P.white}" font-size="6">T</text>
    <text x="527" y="88" text-anchor="middle" fill="${P.slate}" font-size="7">Fluorescent signal</text>
    <text x="527" y="148" text-anchor="middle" fill="${P.slate}" font-size="8">Image each cycle</text>

    <!-- Bottom: Cycle detail -->
    <text x="300" y="185" text-anchor="middle" fill="${P.white}" font-size="12" font-weight="bold">Sequencing Cycle Detail</text>
    <rect x="50" y="200" width="500" height="80" rx="6" fill="${P.dark}" stroke="${P.slate}" stroke-width="1"/>
    <!-- Cycle steps -->
    <text x="120" y="225" text-anchor="middle" fill="${P.green}" font-size="10" font-weight="bold">Add labeled dNTPs</text>
    <text x="120" y="240" text-anchor="middle" fill="${P.slate}" font-size="8">Reversible terminators</text>
    <text x="120" y="255" text-anchor="middle" fill="${P.slate}" font-size="8">One base incorporates</text>
    <polygon points="195,237 210,237 210,232 220,240 210,248 210,243 195,243" fill="${P.cyan}" opacity="0.6"/>
    <text x="300" y="225" text-anchor="middle" fill="${P.orange}" font-size="10" font-weight="bold">Image &amp; Record</text>
    <text x="300" y="240" text-anchor="middle" fill="${P.slate}" font-size="8">Laser excites fluorophore</text>
    <text x="300" y="255" text-anchor="middle" fill="${P.slate}" font-size="8">Camera captures color</text>
    <polygon points="375,237 390,237 390,232 400,240 390,248 390,243 375,243" fill="${P.cyan}" opacity="0.6"/>
    <text x="470" y="225" text-anchor="middle" fill="${P.purple}" font-size="10" font-weight="bold">Cleave &amp; Wash</text>
    <text x="470" y="240" text-anchor="middle" fill="${P.slate}" font-size="8">Remove fluorophore</text>
    <text x="470" y="255" text-anchor="middle" fill="${P.slate}" font-size="8">Remove terminator</text>

    <!-- Stats -->
    <text x="50" y="310" fill="${P.slate}" font-size="9">\u2022 Read length: 2\u00d7150 bp (paired-end) \u2022 Output: up to 6 Tb/run \u2022 Error rate: ~0.1%</text>
    <text x="50" y="330" fill="${P.slate}" font-size="9">\u2022 Cluster density: ~1 million clusters/mm\u00b2 \u2022 Most widely used NGS platform</text>

    <!-- Cycle arrow -->
    <path d="M 470,268 Q 530,290 470,300 Q 100,300 100,290 Q 60,275 120,268" fill="none"
      stroke="${P.cyan}" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>
    <text x="300" y="296" text-anchor="middle" fill="${P.cyan}" font-size="8" opacity="0.6">Repeat ~150 cycles</text>
  </svg>`;
  return wrap(svg, "Figure: Illumina Sequencing — Library binding, bridge amplification, cluster generation, and sequencing by synthesis", 600, 400);
}

/* ─── 4. Nanopore Sequencing ─── */
export function svgNanopore() {
  const svg = `<svg viewBox="0 0 600 350" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    ${defs(`
      <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a3728"/><stop offset="40%" stop-color="#8B6914"/>
        <stop offset="60%" stop-color="#8B6914"/><stop offset="100%" stop-color="#4a3728"/>
      </linearGradient>
      <linearGradient id="poreGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${P.purple}"/><stop offset="100%" stop-color="${P.accent1}"/>
      </linearGradient>
    `)}
    <text x="300" y="22" text-anchor="middle" fill="${P.white}" font-size="14" font-weight="bold">Nanopore Sequencing</text>

    <!-- Membrane -->
    <rect x="100" y="140" width="200" height="60" rx="3" fill="url(#memGrad)" opacity="0.8"/>
    <rect x="300" y="140" width="200" height="60" rx="3" fill="url(#memGrad)" opacity="0.8"/>
    <text x="160" y="175" text-anchor="middle" fill="${P.white}" font-size="9" opacity="0.7">Lipid Bilayer</text>
    <text x="440" y="175" text-anchor="middle" fill="${P.white}" font-size="9" opacity="0.7">Membrane</text>

    <!-- Nanopore protein -->
    <path d="M 270,140 L 265,155 Q 265,170 280,170 Q 300,170 320,170 Q 335,170 335,155 L 330,140"
      fill="url(#poreGrad)" stroke="${P.purple}" stroke-width="1.5" opacity="0.9"/>
    <path d="M 270,200 L 265,185 Q 265,170 280,170 Q 300,170 320,170 Q 335,170 335,185 L 330,200"
      fill="url(#poreGrad)" stroke="${P.purple}" stroke-width="1.5" opacity="0.9"/>
    <!-- Pore channel -->
    <rect x="290" y="155" width="20" height="30" rx="2" fill="#0a0e1a" stroke="${P.purple}" stroke-width="0.5"/>
    <text x="300" y="173" text-anchor="middle" fill="${P.purple}" font-size="7">Pore</text>

    <!-- DNA strand going through -->
    <path d="M 300,40 Q 295,60 305,80 Q 310,100 295,120 L 300,155" fill="none"
      stroke="${P.green}" stroke-width="3" stroke-linecap="round"/>
    <!-- Bases near pore -->
    <circle cx="300" cy="155" r="5" fill="${P.red}"/><text x="300" y="158" text-anchor="middle" fill="${P.white}" font-size="6">A</text>
    <circle cx="298" cy="142" r="5" fill="${P.blue}"/><text x="298" y="145" text-anchor="middle" fill="${P.white}" font-size="6">T</text>
    <circle cx="303" cy="130" r="5" fill="${P.green}"/><text x="303" y="133" text-anchor="middle" fill="${P.white}" font-size="6">G</text>
    <circle cx="296" cy="118" r="5" fill="${P.yellow}"/><text x="296" y="121" text-anchor="middle" fill="${P.dark}" font-size="6">C</text>

    <!-- DNA exiting bottom -->
    <path d="M 300,185 L 305,210 Q 310,230 295,250 Q 285,270 300,290" fill="none"
      stroke="${P.green}" stroke-width="3" stroke-linecap="round"/>

    <!-- Motor protein -->
    <ellipse cx="300" cy="135" rx="18" ry="8" fill="${P.orange}" opacity="0.7" stroke="${P.orange}" stroke-width="1"/>
    <text x="300" y="138" text-anchor="middle" fill="${P.white}" font-size="7">Motor</text>

    <!-- Current signal panel (right side) -->
    <rect x="400" y="40" width="180" height="100" rx="4" fill="${P.dark}" stroke="${P.slate}" stroke-width="1"/>
    <text x="490" y="57" text-anchor="middle" fill="${P.white}" font-size="10" font-weight="bold">Ionic Current Signal</text>
    <!-- Current trace -->
    <polyline points="415,95 425,80 430,80 435,95 440,70 445,70 450,95 455,85 460,85 465,95 470,60 475,60 480,95 485,90 490,90 495,95 500,75 505,75 510,95 520,80 525,80 530,95 540,70 545,70 555,95 560,85 565,85"
      fill="none" stroke="${P.cyan}" stroke-width="1.8"/>
    <line x1="415" y1="100" x2="565" y2="100" stroke="${P.slate}" stroke-width="0.5"/>
    <text x="490" y="115" text-anchor="middle" fill="${P.slate}" font-size="8">Time \u2192</text>
    <text x="410" y="80" fill="${P.slate}" font-size="7" transform="rotate(-90,410,80)">Current</text>
    <!-- Base labels on signal -->
    <text x="432" y="130" text-anchor="middle" fill="${P.red}" font-size="8">A</text>
    <text x="452" y="130" text-anchor="middle" fill="${P.green}" font-size="8">G</text>
    <text x="472" y="130" text-anchor="middle" fill="${P.blue}" font-size="8">T</text>
    <text x="492" y="130" text-anchor="middle" fill="${P.yellow}" font-size="8">C</text>
    <text x="512" y="130" text-anchor="middle" fill="${P.red}" font-size="8">A</text>

    <!-- Voltage arrows -->
    <text x="85" y="110" text-anchor="end" fill="${P.cyan}" font-size="10">cis (+)</text>
    <text x="85" y="235" text-anchor="end" fill="${P.cyan}" font-size="10">trans (\u2212)</text>
    <line x1="88" y1="115" x2="88" y2="225" stroke="${P.cyan}" stroke-width="1.5" stroke-dasharray="4,3"/>
    <polygon points="85,225 88,235 91,225" fill="${P.cyan}"/>
    <text x="88" y="255" text-anchor="middle" fill="${P.slate}" font-size="8">Applied voltage</text>

    <!-- Ion flow arrows -->
    <text x="260" y="225" fill="${P.cyan}" font-size="7" opacity="0.6">K\u207a ions</text>
    <path d="M 285,215 Q 300,205 315,215" fill="none" stroke="${P.cyan}" stroke-width="1" opacity="0.4" marker-end="url(#arr3)"/>
    <marker id="arr3" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="${P.cyan}" opacity="0.4"/></marker>

    <!-- Stats -->
    <text x="400" y="270" fill="${P.slate}" font-size="9">\u2022 Read length: up to 4 Mb (ultralong)</text>
    <text x="400" y="285" fill="${P.slate}" font-size="9">\u2022 Real-time sequencing (no amplification)</text>
    <text x="400" y="300" fill="${P.slate}" font-size="9">\u2022 Direct RNA sequencing possible</text>
    <text x="400" y="315" fill="${P.slate}" font-size="9">\u2022 Detects base modifications (5mC, 6mA)</text>
    <text x="400" y="330" fill="${P.slate}" font-size="9">\u2022 Portable: MinION weighs 87g</text>
  </svg>`;
  return wrap(svg, "Figure: Nanopore Sequencing — DNA translocates through a protein pore; current changes identify each base", 600, 350);
}

/* ─── 5. PCR Cycle ─── */
export function svgPcrCycle() {
  const svg = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    ${defs(`
      <linearGradient id="hotGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${P.red}" stop-opacity="0.15"/><stop offset="100%" stop-color="${P.red}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="coolGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${P.blue}" stop-opacity="0"/><stop offset="100%" stop-color="${P.blue}" stop-opacity="0.15"/>
      </linearGradient>
    `)}
    <text x="300" y="22" text-anchor="middle" fill="${P.white}" font-size="14" font-weight="bold">PCR — Polymerase Chain Reaction</text>

    <!-- Step 1: Denature -->
    <rect x="20" y="40" width="170" height="150" rx="6" fill="url(#hotGrad)" stroke="${P.red}" stroke-width="1" opacity="0.8"/>
    <text x="105" y="60" text-anchor="middle" fill="${P.red}" font-size="12" font-weight="bold">1. Denature</text>
    <text x="105" y="75" text-anchor="middle" fill="${P.red}" font-size="10">95\u00b0C</text>
    <!-- dsDNA separating -->
    <path d="M 60,95 Q 70,105 60,115 Q 50,125 60,135 Q 70,145 60,155 Q 50,165 60,175"
      fill="none" stroke="${P.blue}" stroke-width="2.5"/>
    <path d="M 150,95 Q 140,105 150,115 Q 160,125 150,135 Q 140,145 150,155 Q 160,165 150,175"
      fill="none" stroke="${P.orange}" stroke-width="2.5"/>
    <text x="105" y="140" text-anchor="middle" fill="${P.slate}" font-size="8">H-bonds break</text>
    <path d="M 85,130 L 75,130" fill="none" stroke="${P.slate}" stroke-width="0.5" stroke-dasharray="2,2"/>
    <path d="M 125,130 L 135,130" fill="none" stroke="${P.slate}" stroke-width="0.5" stroke-dasharray="2,2"/>

    <!-- Step 2: Anneal -->
    <rect x="210" y="40" width="170" height="150" rx="6" fill="url(#coolGrad)" stroke="${P.blue}" stroke-width="1" opacity="0.8"/>
    <text x="295" y="60" text-anchor="middle" fill="${P.blue}" font-size="12" font-weight="bold">2. Anneal</text>
    <text x="295" y="75" text-anchor="middle" fill="${P.blue}" font-size="10">55\u00b0C</text>
    <!-- Template + primers -->
    <path d="M 240,95 Q 250,105 240,115 Q 230,125 240,135 Q 250,145 240,155 Q 230,165 240,175"
      fill="none" stroke="${P.blue}" stroke-width="2.5"/>
    <line x1="240" y1="95" x2="270" y2="95" stroke="${P.green}" stroke-width="3"/>
    <polygon points="270,92 278,95 270,98" fill="${P.green}"/>
    <text x="275" y="90" fill="${P.green}" font-size="7">Fwd primer</text>
    <path d="M 350,95 Q 340,105 350,115 Q 360,125 350,135 Q 340,145 350,155 Q 360,165 350,175"
      fill="none" stroke="${P.orange}" stroke-width="2.5"/>
    <line x1="350" y1="175" x2="320" y2="175" stroke="${P.green}" stroke-width="3"/>
    <polygon points="320,172 312,175 320,178" fill="${P.green}"/>
    <text x="310" y="185" fill="${P.green}" font-size="7">Rev primer</text>

    <!-- Step 3: Extend -->
    <rect x="400" y="40" width="180" height="150" rx="6" fill="${P.dark}" stroke="${P.green}" stroke-width="1" opacity="0.8"/>
    <text x="490" y="60" text-anchor="middle" fill="${P.green}" font-size="12" font-weight="bold">3. Extend</text>
    <text x="490" y="75" text-anchor="middle" fill="${P.green}" font-size="10">72\u00b0C</text>
    <!-- Template + new strand growing -->
    <path d="M 430,95 Q 440,105 430,115 Q 420,125 430,135 Q 440,145 430,155 Q 420,165 430,175"
      fill="none" stroke="${P.blue}" stroke-width="2.5"/>
    <path d="M 445,95 Q 435,105 445,115 Q 455,125 445,135 Q 435,145 445,145"
      fill="none" stroke="${P.orange}" stroke-width="2.5" stroke-dasharray="0"/>
    <line x1="430" y1="95" x2="445" y2="95" stroke="${P.green}" stroke-width="3"/>

    <path d="M 530,95 Q 520,105 530,115 Q 540,125 530,135 Q 520,145 530,155 Q 540,165 530,175"
      fill="none" stroke="${P.orange}" stroke-width="2.5"/>
    <path d="M 515,175 Q 525,165 515,155 Q 505,145 515,135 Q 525,125 515,135"
      fill="none" stroke="${P.blue}" stroke-width="2.5"/>
    <line x1="530" y1="175" x2="515" y2="175" stroke="${P.green}" stroke-width="3"/>

    <!-- Taq polymerase -->
    <circle cx="445" cy="140" r="10" fill="${P.purple}" opacity="0.6"/>
    <text x="445" y="143" text-anchor="middle" fill="${P.white}" font-size="6">Taq</text>
    <circle cx="515" cy="140" r="10" fill="${P.purple}" opacity="0.6"/>
    <text x="515" y="143" text-anchor="middle" fill="${P.white}" font-size="6">Taq</text>

    <!-- Temperature graph -->
    <text x="300" y="215" text-anchor="middle" fill="${P.white}" font-size="11" font-weight="bold">Temperature Profile (30 cycles)</text>
    <rect x="60" y="225" width="480" height="140" rx="4" fill="${P.dark}" stroke="${P.slate}" stroke-width="0.5"/>
    <!-- Y-axis -->
    <text x="55" y="245" text-anchor="end" fill="${P.slate}" font-size="8">95\u00b0</text>
    <line x1="60" y1="242" x2="540" y2="242" stroke="${P.red}" stroke-width="0.3" stroke-dasharray="3,3"/>
    <text x="55" y="290" text-anchor="end" fill="${P.slate}" font-size="8">72\u00b0</text>
    <line x1="60" y1="287" x2="540" y2="287" stroke="${P.green}" stroke-width="0.3" stroke-dasharray="3,3"/>
    <text x="55" y="320" text-anchor="end" fill="${P.slate}" font-size="8">55\u00b0</text>
    <line x1="60" y1="317" x2="540" y2="317" stroke="${P.blue}" stroke-width="0.3" stroke-dasharray="3,3"/>

    <!-- Cycle waveform (3 full cycles shown) -->
    <polyline points="80,242 100,242 110,317 140,317 150,287 190,287 200,242 220,242 230,317 260,317 270,287 310,287 320,242 340,242 350,317 380,317 390,287 430,287 440,242 460,242 470,340"
      fill="none" stroke="${P.cyan}" stroke-width="2"/>
    <!-- Cycle labels -->
    <text x="145" y="355" text-anchor="middle" fill="${P.slate}" font-size="8">Cycle 1</text>
    <text x="270" y="355" text-anchor="middle" fill="${P.slate}" font-size="8">Cycle 2</text>
    <text x="395" y="355" text-anchor="middle" fill="${P.slate}" font-size="8">Cycle 3</text>
    <text x="480" y="355" fill="${P.slate}" font-size="8">... \u00d730</text>

    <!-- Exponential note -->
    <text x="300" y="385" text-anchor="middle" fill="${P.slate}" font-size="9">30 cycles = 2\u00b3\u2070 \u2248 1 billion copies from a single template molecule</text>
  </svg>`;
  return wrap(svg, "Figure: PCR Cycle — Denature, anneal primers, extend with Taq polymerase, repeat ~30 times for exponential amplification", 600, 400);
}

/* ─── 6. Gel Electrophoresis ─── */
export function svgGelElectrophoresis() {
  const svg = `<svg viewBox="0 0 600 350" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    ${defs(`
      <linearGradient id="gelBodyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a365d" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#1a365d" stop-opacity="0.9"/>
      </linearGradient>
      <linearGradient id="bandGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${P.green}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${P.cyan}" stop-opacity="0.7"/>
      </linearGradient>
    `)}
    <text x="300" y="22" text-anchor="middle" fill="${P.white}" font-size="14" font-weight="bold">Agarose Gel Electrophoresis</text>

    <!-- Gel box outline -->
    <rect x="60" y="45" width="350" height="250" rx="6" fill="#0d1117" stroke="${P.slate}" stroke-width="1.5"/>
    <!-- Buffer -->
    <rect x="65" y="50" width="340" height="30" rx="3" fill="#1e3a5f" opacity="0.4"/>
    <text x="235" y="68" text-anchor="middle" fill="${P.cyan}" font-size="8" opacity="0.6">TAE/TBE Buffer</text>

    <!-- Wells -->
    <rect x="85" y="80" width="30" height="8" rx="1" fill="#0a0e1a" stroke="${P.slate}" stroke-width="0.5"/>
    <rect x="135" y="80" width="30" height="8" rx="1" fill="#0a0e1a" stroke="${P.slate}" stroke-width="0.5"/>
    <rect x="185" y="80" width="30" height="8" rx="1" fill="#0a0e1a" stroke="${P.slate}" stroke-width="0.5"/>
    <rect x="235" y="80" width="30" height="8" rx="1" fill="#0a0e1a" stroke="${P.slate}" stroke-width="0.5"/>
    <rect x="285" y="80" width="30" height="8" rx="1" fill="#0a0e1a" stroke="${P.slate}" stroke-width="0.5"/>
    <rect x="335" y="80" width="30" height="8" rx="1" fill="#0a0e1a" stroke="${P.slate}" stroke-width="0.5"/>
    <!-- Lane labels -->
    <text x="100" y="77" text-anchor="middle" fill="${P.slate}" font-size="7">Ladder</text>
    <text x="150" y="77" text-anchor="middle" fill="${P.slate}" font-size="7">S1</text>
    <text x="200" y="77" text-anchor="middle" fill="${P.slate}" font-size="7">S2</text>
    <text x="250" y="77" text-anchor="middle" fill="${P.slate}" font-size="7">S3</text>
    <text x="300" y="77" text-anchor="middle" fill="${P.slate}" font-size="7">S4</text>
    <text x="350" y="77" text-anchor="middle" fill="${P.slate}" font-size="7">S5</text>

    <!-- Gel body -->
    <rect x="70" y="88" width="330" height="200" rx="3" fill="url(#gelBodyGrad)"/>

    <!-- Ladder bands -->
    <rect x="85" y="105" width="30" height="4" rx="1" fill="url(#bandGlow)" opacity="0.6"/>
    <text x="78" y="110" text-anchor="end" fill="${P.green}" font-size="7">10kb</text>
    <rect x="85" y="125" width="30" height="4" rx="1" fill="url(#bandGlow)" opacity="0.65"/>
    <text x="78" y="130" text-anchor="end" fill="${P.green}" font-size="7">5kb</text>
    <rect x="85" y="150" width="30" height="4" rx="1" fill="url(#bandGlow)" opacity="0.7"/>
    <text x="78" y="155" text-anchor="end" fill="${P.green}" font-size="7">3kb</text>
    <rect x="85" y="175" width="30" height="4" rx="1" fill="url(#bandGlow)" opacity="0.75"/>
    <text x="78" y="180" text-anchor="end" fill="${P.green}" font-size="7">1.5kb</text>
    <rect x="85" y="200" width="30" height="4" rx="1" fill="url(#bandGlow)" opacity="0.8"/>
    <text x="78" y="205" text-anchor="end" fill="${P.green}" font-size="7">1kb</text>
    <rect x="85" y="230" width="30" height="4" rx="1" fill="url(#bandGlow)" opacity="0.85"/>
    <text x="78" y="235" text-anchor="end" fill="${P.green}" font-size="7">500bp</text>
    <rect x="85" y="260" width="30" height="4" rx="1" fill="url(#bandGlow)" opacity="0.9"/>
    <text x="78" y="265" text-anchor="end" fill="${P.green}" font-size="7">100bp</text>

    <!-- Sample bands (various patterns) -->
    <rect x="135" y="148" width="30" height="5" rx="1" fill="url(#bandGlow)" opacity="0.8"/>
    <rect x="135" y="228" width="30" height="5" rx="1" fill="url(#bandGlow)" opacity="0.6"/>

    <rect x="185" y="198" width="30" height="5" rx="1" fill="url(#bandGlow)" opacity="0.9"/>

    <rect x="235" y="148" width="30" height="5" rx="1" fill="url(#bandGlow)" opacity="0.8"/>
    <rect x="235" y="198" width="30" height="5" rx="1" fill="url(#bandGlow)" opacity="0.7"/>
    <rect x="235" y="258" width="30" height="5" rx="1" fill="url(#bandGlow)" opacity="0.5"/>

    <rect x="285" y="170" width="30" height="5" rx="1" fill="url(#bandGlow)" opacity="0.85"/>

    <!-- Smear in S5 (degraded DNA) -->
    <rect x="335" y="110" width="30" height="160" rx="2" fill="url(#bandGlow)" opacity="0.15"/>
    <text x="350" y="285" text-anchor="middle" fill="${P.red}" font-size="7">degraded</text>

    <!-- Electrode labels -->
    <rect x="425" y="50" width="50" height="20" rx="3" fill="${P.red}" opacity="0.2" stroke="${P.red}" stroke-width="1"/>
    <text x="450" y="64" text-anchor="middle" fill="${P.red}" font-size="10" font-weight="bold">\u2296 (−)</text>
    <rect x="425" y="270" width="50" height="20" rx="3" fill="${P.green}" opacity="0.2" stroke="${P.green}" stroke-width="1"/>
    <text x="450" y="284" text-anchor="middle" fill="${P.green}" font-size="10" font-weight="bold">\u2295 (+)</text>
    <!-- Arrow: DNA migrates toward + -->
    <line x1="450" y1="75" x2="450" y2="260" stroke="${P.cyan}" stroke-width="2" marker-end="url(#arr4)"/>
    <marker id="arr4" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="${P.cyan}"/></marker>
    <text x="450" y="170" text-anchor="middle" fill="${P.cyan}" font-size="9" transform="rotate(90,470,170)">DNA migration</text>

    <!-- Explanation -->
    <text x="440" y="120" fill="${P.slate}" font-size="8">DNA is negatively</text>
    <text x="440" y="132" fill="${P.slate}" font-size="8">charged (phosphate</text>
    <text x="440" y="144" fill="${P.slate}" font-size="8">backbone) \u2192 migrates</text>
    <text x="440" y="156" fill="${P.slate}" font-size="8">toward positive end</text>

    <text x="440" y="185" fill="${P.slate}" font-size="8">Smaller fragments</text>
    <text x="440" y="197" fill="${P.slate}" font-size="8">move faster through</text>
    <text x="440" y="209" fill="${P.slate}" font-size="8">the gel matrix</text>

    <!-- Power supply -->
    <rect x="495" y="45" width="90" height="40" rx="4" fill="${P.dark}" stroke="${P.slate}" stroke-width="1"/>
    <text x="540" y="62" text-anchor="middle" fill="${P.white}" font-size="8">Power Supply</text>
    <text x="540" y="75" text-anchor="middle" fill="${P.orange}" font-size="9">100-150V</text>

    <text x="300" y="330" text-anchor="middle" fill="${P.slate}" font-size="9">Stained with ethidium bromide or SYBR Safe \u2014 visualized under UV/blue light</text>
  </svg>`;
  return wrap(svg, "Figure: Gel Electrophoresis — DNA fragments separate by size through an agarose matrix under electric field", 600, 350);
}

/* ─── 7. Restriction Enzyme ─── */
export function svgRestrictionEnzyme() {
  const svg = `<svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    ${defs()}
    <text x="300" y="22" text-anchor="middle" fill="${P.white}" font-size="14" font-weight="bold">Restriction Enzyme — EcoRI</text>

    <!-- Before cutting -->
    <text x="50" y="55" fill="${P.cyan}" font-size="11" font-weight="bold">Recognition &amp; Cutting</text>

    <!-- Top strand 5 to 3 -->
    <text x="30" y="85" fill="${P.accent1}" font-size="10">5\u2032</text>
    <text x="50" y="85" fill="${P.slate}" font-size="11" font-family="monospace">\u2014\u2014\u2014</text>
    <text x="105" y="85" fill="${P.red}" font-size="13" font-family="monospace" font-weight="bold">G</text>
    <text x="140" y="80" fill="${P.cyan}" font-size="9">\u2193 cut</text>
    <text x="125" y="85" fill="${P.red}" font-size="13" font-family="monospace" font-weight="bold">A A T T C</text>
    <text x="230" y="85" fill="${P.slate}" font-size="11" font-family="monospace">\u2014\u2014\u2014</text>
    <text x="280" y="85" fill="${P.accent1}" font-size="10">3\u2032</text>

    <!-- Bottom strand 3 to 5 -->
    <text x="30" y="110" fill="${P.accent2}" font-size="10">3\u2032</text>
    <text x="50" y="110" fill="${P.slate}" font-size="11" font-family="monospace">\u2014\u2014\u2014</text>
    <text x="105" y="110" fill="${P.orange}" font-size="13" font-family="monospace" font-weight="bold">C T T A A</text>
    <text x="220" y="105" fill="${P.cyan}" font-size="9">\u2191 cut</text>
    <text x="210" y="110" fill="${P.orange}" font-size="13" font-family="monospace" font-weight="bold">G</text>
    <text x="230" y="110" fill="${P.slate}" font-size="11" font-family="monospace">\u2014\u2014\u2014</text>
    <text x="280" y="110" fill="${P.accent2}" font-size="10">5\u2032</text>

    <!-- Palindrome bracket -->
    <line x1="105" y1="120" x2="225" y2="120" stroke="${P.purple}" stroke-width="1"/>
    <text x="165" y="135" text-anchor="middle" fill="${P.purple}" font-size="9">Palindromic sequence: 5\u2032-GAATTC-3\u2032</text>
    <text x="165" y="148" text-anchor="middle" fill="${P.purple}" font-size="9">reads same on both strands (5\u2032\u21923\u2032)</text>

    <!-- Enzyme blob -->
    <ellipse cx="480" cy="95" rx="55" ry="35" fill="${P.purple}" opacity="0.25" stroke="${P.purple}" stroke-width="1.5"/>
    <text x="480" y="92" text-anchor="middle" fill="${P.purple}" font-size="11" font-weight="bold">EcoRI</text>
    <text x="480" y="106" text-anchor="middle" fill="${P.slate}" font-size="8">Restriction Endonuclease</text>
    <path d="M 425,95 L 300,95" fill="none" stroke="${P.purple}" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arr5)"/>
    <marker id="arr5" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="${P.purple}"/></marker>

    <!-- After cutting: sticky ends -->
    <text x="50" y="185" fill="${P.cyan}" font-size="11" font-weight="bold">Result: 5\u2032 Sticky Ends (Overhangs)</text>

    <!-- Left fragment -->
    <text x="30" y="215" fill="${P.accent1}" font-size="10">5\u2032</text>
    <text x="50" y="215" fill="${P.slate}" font-size="11" font-family="monospace">\u2014\u2014\u2014</text>
    <text x="105" y="215" fill="${P.red}" font-size="13" font-family="monospace" font-weight="bold">G</text>
    <text x="30" y="240" fill="${P.accent2}" font-size="10">3\u2032</text>
    <text x="50" y="240" fill="${P.slate}" font-size="11" font-family="monospace">\u2014\u2014\u2014</text>
    <text x="105" y="240" fill="${P.orange}" font-size="13" font-family="monospace" font-weight="bold">C T T A A</text>

    <!-- Right fragment -->
    <text x="250" y="215" fill="${P.red}" font-size="13" font-family="monospace" font-weight="bold">A A T T C</text>
    <text x="370" y="215" fill="${P.slate}" font-size="11" font-family="monospace">\u2014\u2014\u2014</text>
    <text x="420" y="215" fill="${P.accent1}" font-size="10">3\u2032</text>
    <text x="335" y="240" fill="${P.orange}" font-size="13" font-family="monospace" font-weight="bold">G</text>
    <text x="370" y="240" fill="${P.slate}" font-size="11" font-family="monospace">\u2014\u2014\u2014</text>
    <text x="420" y="240" fill="${P.accent2}" font-size="10">5\u2032</text>

    <!-- Overhang highlight -->
    <rect x="243" y="203" width="90" height="17" rx="2" fill="${P.red}" opacity="0.1" stroke="${P.red}" stroke-width="0.5" stroke-dasharray="3,2"/>
    <text x="290" y="199" text-anchor="middle" fill="${P.red}" font-size="8">5\u2032 overhang</text>
    <rect x="100" y="228" width="110" height="17" rx="2" fill="${P.orange}" opacity="0.1" stroke="${P.orange}" stroke-width="0.5" stroke-dasharray="3,2"/>
    <text x="155" y="257" text-anchor="middle" fill="${P.orange}" font-size="8">5\u2032 overhang</text>

    <!-- Notes -->
    <text x="50" y="282" fill="${P.slate}" font-size="9">\u2022 Sticky ends can re-anneal with complementary overhangs \u2192 enables cloning</text>
    <text x="50" y="296" fill="${P.slate}" font-size="9">\u2022 EcoRI: from <tspan font-style="italic">E. coli</tspan> \u2022 Thousands of restriction enzymes known \u2022 Key tool in molecular cloning</text>
  </svg>`;
  return wrap(svg, "Figure: EcoRI Restriction Enzyme — Recognizes palindromic GAATTC and cuts to produce 5\u2032 sticky ends", 600, 300);
}

/* ─── 8. CRISPR-Cas9 Mechanism ─── */
export function svgCrisprMechanism() {
  const svg = `<svg viewBox="0 0 600 350" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    <defs>
      <radialGradient id="cas9Grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.3"/>
      </radialGradient>
      <filter id="glow8"><feGaussianBlur stdDeviation="2" result="g"/>
        <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <text x="300" y="22" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">CRISPR-Cas9 Gene Editing</text>

    <!-- Target DNA double strand -->
    <line x1="50" y1="180" x2="550" y2="180" stroke="#3b82f6" stroke-width="3"/>
    <line x1="50" y1="195" x2="550" y2="195" stroke="#f97316" stroke-width="3"/>
    <text x="40" y="183" text-anchor="end" fill="#6366f1" font-size="9">5\u2032</text>
    <text x="560" y="183" fill="#6366f1" font-size="9">3\u2032</text>
    <text x="40" y="198" text-anchor="end" fill="#14b8a6" font-size="9">3\u2032</text>
    <text x="560" y="198" fill="#14b8a6" font-size="9">5\u2032</text>

    <!-- PAM site -->
    <rect x="395" y="172" width="40" height="30" rx="3" fill="#ef4444" opacity="0.2" stroke="#ef4444" stroke-width="1.5"/>
    <text x="415" y="167" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="bold">PAM</text>
    <text x="415" y="215" text-anchor="middle" fill="#ef4444" font-size="8">NGG</text>

    <!-- Target sequence highlight -->
    <rect x="200" y="172" width="195" height="12" rx="2" fill="#22c55e" opacity="0.15" stroke="#22c55e" stroke-width="0.5"/>
    <text x="297" y="170" text-anchor="middle" fill="#22c55e" font-size="8">20-nt target sequence</text>

    <!-- Cas9 protein blob -->
    <ellipse cx="310" cy="140" rx="90" ry="50" fill="url(#cas9Grad)" stroke="#a855f7" stroke-width="2"/>
    <text x="310" y="125" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold">Cas9</text>
    <text x="310" y="140" text-anchor="middle" fill="#94a3b8" font-size="8">Endonuclease</text>

    <!-- sgRNA -->
    <path d="M 200,175 Q 200,140 230,120 Q 260,100 280,80 Q 290,70 310,65 Q 340,60 360,70 Q 370,75 365,85"
      fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 365,85 Q 375,90 370,100 Q 365,108 355,105 Q 345,102 350,92 Q 355,88 365,85"
      fill="none" stroke="#22c55e" stroke-width="2"/>
    <text x="390" y="80" fill="#22c55e" font-size="9" font-weight="bold">sgRNA</text>
    <text x="390" y="93" fill="#94a3b8" font-size="8">(guide RNA)</text>

    <!-- Cut marks -->
    <line x1="260" y1="178" x2="260" y2="197" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="3,2"/>
    <text x="260" y="225" text-anchor="middle" fill="#ef4444" font-size="8">RuvC cut</text>
    <line x1="330" y1="178" x2="330" y2="197" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="3,2"/>
    <text x="330" y="225" text-anchor="middle" fill="#ef4444" font-size="8">HNH cut</text>

    <text x="295" y="250" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="bold">\u2702 Double-Strand Break (DSB)</text>

    <!-- Repair pathways -->
    <rect x="50" y="265" width="220" height="70" rx="5" fill="#1e293b" stroke="#f97316" stroke-width="1"/>
    <text x="160" y="282" text-anchor="middle" fill="#f97316" font-size="10" font-weight="bold">NHEJ Repair</text>
    <text x="160" y="296" text-anchor="middle" fill="#94a3b8" font-size="8">Non-homologous end joining</text>
    <text x="160" y="310" text-anchor="middle" fill="#94a3b8" font-size="8">Error-prone \u2192 Insertions/Deletions</text>
    <text x="160" y="324" text-anchor="middle" fill="#f97316" font-size="9">\u2192 Gene knockout</text>

    <rect x="330" y="265" width="220" height="70" rx="5" fill="#1e293b" stroke="#22c55e" stroke-width="1"/>
    <text x="440" y="282" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="bold">HDR Repair</text>
    <text x="440" y="296" text-anchor="middle" fill="#94a3b8" font-size="8">Homology-directed repair</text>
    <text x="440" y="310" text-anchor="middle" fill="#94a3b8" font-size="8">Template-guided \u2192 Precise editing</text>
    <text x="440" y="324" text-anchor="middle" fill="#22c55e" font-size="9">\u2192 Gene knock-in / correction</text>

    <line x1="250" y1="255" x2="160" y2="265" stroke="#f97316" stroke-width="1.5"/>
    <line x1="340" y1="255" x2="440" y2="265" stroke="#22c55e" stroke-width="1.5"/>

    <!-- Legend -->
    <text x="50" y="50" fill="#a855f7" font-size="9">\u25cf Cas9 protein (nuclease)</text>
    <text x="50" y="65" fill="#22c55e" font-size="9">\u25cf sgRNA (20-nt guide + scaffold)</text>
    <text x="50" y="80" fill="#ef4444" font-size="9">\u25cf PAM: 5\u2032-NGG-3\u2032 (required for binding)</text>
  </svg>`;
  return `<div class="inline-diagram my-6">${svg}<p class="text-xs text-center text-slate-400 mt-1">Figure: CRISPR-Cas9 \u2014 sgRNA guides Cas9 to target DNA adjacent to PAM; both strands are cut</p></div>`;
}

/* ─── 9. Expression Cassette ─── */
export function svgExpressionCassette() {
  const svg = `<svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    <defs>
      <marker id="arr6" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="#3b82f6" opacity="0.5"/></marker>
      <marker id="arr7" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="#6366f1"/></marker>
    </defs>
    <text x="300" y="22" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">Gene Expression Cassette</text>

    <line x1="30" y1="120" x2="570" y2="120" stroke="#94a3b8" stroke-width="2"/>

    <!-- Promoter -->
    <rect x="45" y="95" width="80" height="50" rx="5" fill="#22c55e" opacity="0.2" stroke="#22c55e" stroke-width="1.5"/>
    <text x="85" y="115" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="bold">Promoter</text>
    <text x="85" y="130" text-anchor="middle" fill="#94a3b8" font-size="7">(e.g. T7, CMV)</text>
    <path d="M 125,115 L 135,115 L 135,100 L 142,108" fill="none" stroke="#22c55e" stroke-width="1.5"/>

    <!-- RBS -->
    <rect x="145" y="100" width="45" height="40" rx="5" fill="#06b6d4" opacity="0.2" stroke="#06b6d4" stroke-width="1.5"/>
    <text x="167" y="118" text-anchor="middle" fill="#06b6d4" font-size="9" font-weight="bold">RBS</text>
    <text x="167" y="132" text-anchor="middle" fill="#94a3b8" font-size="6">Shine-Dalgarno</text>

    <!-- Start codon -->
    <rect x="195" y="105" width="35" height="30" rx="3" fill="#f97316" opacity="0.3" stroke="#f97316" stroke-width="1.5"/>
    <text x="212" y="124" text-anchor="middle" fill="#f97316" font-size="9" font-weight="bold">ATG</text>
    <text x="212" y="96" text-anchor="middle" fill="#f97316" font-size="7">Start</text>

    <!-- CDS -->
    <rect x="235" y="90" width="180" height="60" rx="5" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="325" y="115" text-anchor="middle" fill="#3b82f6" font-size="12" font-weight="bold">Coding Sequence (CDS)</text>
    <text x="325" y="132" text-anchor="middle" fill="#94a3b8" font-size="8">Gene of interest</text>
    <line x1="255" y1="140" x2="395" y2="140" stroke="#3b82f6" stroke-width="1" opacity="0.5" marker-end="url(#arr6)"/>

    <!-- Stop codon -->
    <rect x="420" y="105" width="35" height="30" rx="3" fill="#ef4444" opacity="0.3" stroke="#ef4444" stroke-width="1.5"/>
    <text x="437" y="124" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="bold">TAA</text>
    <text x="437" y="96" text-anchor="middle" fill="#ef4444" font-size="7">Stop</text>

    <!-- Terminator -->
    <rect x="465" y="95" width="80" height="50" rx="5" fill="#ef4444" opacity="0.15" stroke="#ef4444" stroke-width="1.5"/>
    <text x="505" y="115" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="bold">Terminator</text>
    <text x="505" y="130" text-anchor="middle" fill="#94a3b8" font-size="7">(e.g. rrnB T1)</text>
    <path d="M 505,135 Q 495,148 505,148 Q 515,148 505,135" fill="none" stroke="#ef4444" stroke-width="1.5"/>

    <!-- Transcription arrow -->
    <path d="M 50,170 L 530,170" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arr7)"/>
    <text x="300" y="187" text-anchor="middle" fill="#6366f1" font-size="9">Transcription direction (5\u2032 \u2192 3\u2032)</text>

    <text x="85" y="210" text-anchor="middle" fill="#22c55e" font-size="8">\u2191 RNA Pol binds</text>
    <text x="167" y="210" text-anchor="middle" fill="#06b6d4" font-size="8">\u2191 Ribosome binds</text>
    <text x="325" y="210" text-anchor="middle" fill="#3b82f6" font-size="8">\u2191 Translated to protein</text>
    <text x="505" y="210" text-anchor="middle" fill="#ef4444" font-size="8">\u2191 Transcription stops</text>

    <text x="300" y="240" text-anchor="middle" fill="#94a3b8" font-size="8">Optional: signal peptide, affinity tags (His6, GST), selectable markers (AmpR, KanR)</text>
  </svg>`;
  return `<div class="inline-diagram my-6">${svg}<p class="text-xs text-center text-slate-400 mt-1">Figure: Expression Cassette \u2014 Modular gene construct with all elements needed for protein expression</p></div>`;
}

/* ─── 10. Transcription & Translation ─── */
export function svgTranscriptionTranslation() {
  const svg = `<svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    <defs>
      <radialGradient id="ribGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#a855f7" stop-opacity="0.15"/>
      </radialGradient>
      <marker id="arr8" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="#22c55e"/></marker>
      <marker id="arr9" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="#a855f7"/></marker>
    </defs>
    <text x="300" y="22" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">Central Dogma \u2014 Transcription &amp; Translation</text>

    <!-- DNA box -->
    <rect x="30" y="55" width="160" height="60" rx="8" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" stroke-width="1.5"/>
    <path d="M 60,70 Q 70,80 60,90 Q 50,100 60,107" fill="none" stroke="#3b82f6" stroke-width="2"/>
    <path d="M 75,70 Q 65,80 75,90 Q 85,100 75,107" fill="none" stroke="#06b6d4" stroke-width="2"/>
    <text x="130" y="82" text-anchor="middle" fill="#3b82f6" font-size="14" font-weight="bold">DNA</text>
    <text x="130" y="100" text-anchor="middle" fill="#94a3b8" font-size="8">Double-stranded</text>

    <!-- Arrow: Transcription -->
    <line x1="195" y1="85" x2="240" y2="85" stroke="#22c55e" stroke-width="2.5" marker-end="url(#arr8)"/>
    <text x="217" y="78" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="bold">Transcription</text>
    <circle cx="218" cy="105" r="18" fill="#22c55e" opacity="0.2" stroke="#22c55e" stroke-width="1"/>
    <text x="218" y="102" text-anchor="middle" fill="#22c55e" font-size="6" font-weight="bold">RNA</text>
    <text x="218" y="112" text-anchor="middle" fill="#22c55e" font-size="6">Pol</text>

    <!-- mRNA box -->
    <rect x="250" y="55" width="120" height="60" rx="8" fill="#f97316" opacity="0.15" stroke="#f97316" stroke-width="1.5"/>
    <path d="M 275,75 Q 285,85 275,95 Q 265,105 275,107" fill="none" stroke="#f97316" stroke-width="2"/>
    <text x="330" y="82" text-anchor="middle" fill="#f97316" font-size="14" font-weight="bold">mRNA</text>
    <text x="330" y="100" text-anchor="middle" fill="#94a3b8" font-size="8">Single-stranded</text>

    <!-- Arrow: Translation -->
    <line x1="375" y1="85" x2="420" y2="85" stroke="#a855f7" stroke-width="2.5" marker-end="url(#arr9)"/>
    <text x="397" y="78" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="bold">Translation</text>
    <ellipse cx="398" cy="110" rx="22" ry="12" fill="url(#ribGrad)" stroke="#a855f7" stroke-width="1"/>
    <text x="398" y="113" text-anchor="middle" fill="#a855f7" font-size="7">Ribosome</text>

    <!-- Protein box -->
    <rect x="430" y="55" width="140" height="60" rx="8" fill="#6366f1" opacity="0.15" stroke="#6366f1" stroke-width="1.5"/>
    <path d="M 455,75 Q 465,68 475,78 Q 485,88 475,98 Q 465,108 455,98 Q 445,88 455,75 Z"
      fill="#6366f1" opacity="0.3" stroke="#6366f1" stroke-width="1"/>
    <text x="520" y="82" text-anchor="middle" fill="#6366f1" font-size="14" font-weight="bold">Protein</text>
    <text x="520" y="100" text-anchor="middle" fill="#94a3b8" font-size="8">Folded polypeptide</text>

    <!-- Detail panels -->
    <rect x="30" y="155" width="260" height="120" rx="5" fill="#1e293b" stroke="#22c55e" stroke-width="0.5"/>
    <text x="160" y="172" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="bold">Transcription</text>
    <text x="40" y="192" fill="#3b82f6" font-size="9">3\u2032</text>
    <text x="55" y="192" fill="#94a3b8" font-size="9" font-family="monospace">T A C G G A T T C</text>
    <text x="220" y="192" fill="#3b82f6" font-size="9">5\u2032</text>
    <text x="235" y="192" fill="#94a3b8" font-size="7">template</text>
    <text x="40" y="210" fill="#f97316" font-size="9">5\u2032</text>
    <text x="55" y="210" fill="#f97316" font-size="9" font-family="monospace">A U G C C U A A G</text>
    <text x="220" y="210" fill="#f97316" font-size="9">3\u2032</text>
    <text x="235" y="210" fill="#f97316" font-size="7">mRNA</text>
    <text x="160" y="235" text-anchor="middle" fill="#94a3b8" font-size="8">A\u2194U, T\u2194A, G\u2194C (U replaces T in RNA)</text>
    <text x="160" y="250" text-anchor="middle" fill="#94a3b8" font-size="8">5\u2032 cap and 3\u2032 poly-A tail added (eukaryotes)</text>
    <text x="160" y="265" text-anchor="middle" fill="#94a3b8" font-size="8">Introns spliced out \u2192 mature mRNA</text>

    <rect x="310" y="155" width="260" height="120" rx="5" fill="#1e293b" stroke="#a855f7" stroke-width="0.5"/>
    <text x="440" y="172" text-anchor="middle" fill="#a855f7" font-size="10" font-weight="bold">Translation</text>
    <text x="320" y="192" fill="#f97316" font-size="9" font-family="monospace">AUG | CCU | AAG</text>
    <text x="320" y="210" fill="#6366f1" font-size="9" font-family="monospace">Met    Pro    Lys</text>
    <text x="320" y="225" fill="#94a3b8" font-size="8">Each 3-letter codon = 1 amino acid</text>
    <text x="440" y="245" text-anchor="middle" fill="#94a3b8" font-size="8">tRNA brings amino acids to ribosome</text>
    <text x="440" y="260" text-anchor="middle" fill="#94a3b8" font-size="8">Peptide bonds form between amino acids</text>
    <text x="440" y="275" text-anchor="middle" fill="#94a3b8" font-size="8">Stop codon (UAA/UAG/UGA) \u2192 release</text>

    <text x="300" y="295" text-anchor="middle" fill="#94a3b8" font-size="8">\u26a0 Exception: retroviruses use reverse transcriptase (RNA \u2192 DNA)</text>
  </svg>`;
  return `<div class="inline-diagram my-6">${svg}<p class="text-xs text-center text-slate-400 mt-1">Figure: Central Dogma \u2014 DNA is transcribed to mRNA, which is translated into protein</p></div>`;
}

/* ─── 11. Gibson Assembly ─── */
export function svgGibsonAssembly() {
  const svg = `<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    <defs>
      <filter id="glow11"><feGaussianBlur stdDeviation="2" result="g"/>
        <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <text x="300" y="22" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">Gibson Assembly</text>

    <!-- Step 1 -->
    <text x="50" y="50" fill="#06b6d4" font-size="11" font-weight="bold">1. Overlapping DNA Fragments</text>
    <line x1="60" y1="75" x2="250" y2="75" stroke="#3b82f6" stroke-width="4"/>
    <line x1="60" y1="85" x2="250" y2="85" stroke="#3b82f6" stroke-width="4" opacity="0.6"/>
    <text x="155" y="72" text-anchor="middle" fill="#3b82f6" font-size="9">Fragment A</text>
    <line x1="210" y1="95" x2="400" y2="95" stroke="#f97316" stroke-width="4"/>
    <line x1="210" y1="105" x2="400" y2="105" stroke="#f97316" stroke-width="4" opacity="0.6"/>
    <text x="305" y="118" text-anchor="middle" fill="#f97316" font-size="9">Fragment B</text>
    <line x1="360" y1="75" x2="550" y2="75" stroke="#22c55e" stroke-width="4"/>
    <line x1="360" y1="85" x2="550" y2="85" stroke="#22c55e" stroke-width="4" opacity="0.6"/>
    <text x="455" y="72" text-anchor="middle" fill="#22c55e" font-size="9">Fragment C</text>
    <rect x="210" y="68" width="40" height="45" rx="2" fill="#eab308" opacity="0.1" stroke="#eab308" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="230" y="65" text-anchor="middle" fill="#eab308" font-size="7">overlap</text>
    <rect x="360" y="68" width="40" height="45" rx="2" fill="#eab308" opacity="0.1" stroke="#eab308" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="380" y="65" text-anchor="middle" fill="#eab308" font-size="7">overlap</text>

    <!-- Step 2 -->
    <text x="50" y="145" fill="#06b6d4" font-size="11" font-weight="bold">2. T5 Exonuclease Chews 5\u2032 Ends</text>
    <line x1="60" y1="170" x2="200" y2="170" stroke="#3b82f6" stroke-width="4"/>
    <line x1="60" y1="180" x2="250" y2="180" stroke="#3b82f6" stroke-width="4" opacity="0.6"/>
    <path d="M 200,170 L 250,170" stroke="#3b82f6" stroke-width="4" stroke-dasharray="2,3" opacity="0.3" fill="none"/>
    <text x="235" y="166" text-anchor="middle" fill="#ef4444" font-size="7">5\u2032 chewed</text>
    <line x1="260" y1="170" x2="350" y2="170" stroke="#f97316" stroke-width="4" stroke-dasharray="2,3" opacity="0.3"/>
    <line x1="260" y1="180" x2="400" y2="180" stroke="#f97316" stroke-width="4" opacity="0.6"/>
    <line x1="350" y1="170" x2="400" y2="170" stroke="#f97316" stroke-width="4"/>
    <rect x="200" y="163" width="60" height="22" rx="2" fill="#14b8a6" opacity="0.1" stroke="#14b8a6" stroke-width="0.5"/>
    <text x="230" y="195" text-anchor="middle" fill="#14b8a6" font-size="7">ssDNA overhangs</text>
    <ellipse cx="520" cy="175" rx="35" ry="15" fill="#ef4444" opacity="0.2" stroke="#ef4444" stroke-width="1"/>
    <text x="520" y="178" text-anchor="middle" fill="#ef4444" font-size="8">T5 Exo</text>

    <!-- Step 3 -->
    <text x="50" y="225" fill="#06b6d4" font-size="11" font-weight="bold">3. Complementary Overhangs Anneal</text>
    <line x1="60" y1="250" x2="200" y2="250" stroke="#3b82f6" stroke-width="3"/>
    <line x1="60" y1="260" x2="250" y2="260" stroke="#3b82f6" stroke-width="3" opacity="0.6"/>
    <line x1="210" y1="250" x2="350" y2="250" stroke="#f97316" stroke-width="3"/>
    <line x1="210" y1="260" x2="400" y2="260" stroke="#f97316" stroke-width="3" opacity="0.6"/>
    <line x1="350" y1="250" x2="550" y2="250" stroke="#22c55e" stroke-width="3"/>
    <line x1="400" y1="260" x2="550" y2="260" stroke="#22c55e" stroke-width="3" opacity="0.6"/>
    <rect x="200" y="246" width="10" height="4" fill="#eab308" opacity="0.5"/>
    <rect x="350" y="246" width="10" height="4" fill="#eab308" opacity="0.5"/>
    <text x="205" y="243" text-anchor="middle" fill="#eab308" font-size="7">gap</text>
    <text x="355" y="243" text-anchor="middle" fill="#eab308" font-size="7">gap</text>

    <!-- Step 4 -->
    <text x="50" y="290" fill="#06b6d4" font-size="11" font-weight="bold">4. Phusion Polymerase Fills \u2192 Taq Ligase Seals</text>
    <line x1="60" y1="315" x2="550" y2="315" stroke="#6366f1" stroke-width="4"/>
    <line x1="60" y1="325" x2="550" y2="325" stroke="#6366f1" stroke-width="4" opacity="0.6"/>
    <text x="305" y="310" text-anchor="middle" fill="#6366f1" font-size="10" font-weight="bold">Seamless Assembled Product</text>

    <ellipse cx="450" cy="290" rx="40" ry="12" fill="#22c55e" opacity="0.2" stroke="#22c55e" stroke-width="1"/>
    <text x="450" y="293" text-anchor="middle" fill="#22c55e" font-size="8">Phusion Pol</text>
    <ellipse cx="540" cy="290" rx="30" ry="12" fill="#a855f7" opacity="0.2" stroke="#a855f7" stroke-width="1"/>
    <text x="540" y="293" text-anchor="middle" fill="#a855f7" font-size="8">Taq Ligase</text>

    <text x="60" y="355" fill="#94a3b8" font-size="9">\u2022 Isothermal (50\u00b0C) \u2022 Scarless \u2022 Multiple fragments in one reaction</text>
    <text x="60" y="370" fill="#94a3b8" font-size="9">\u2022 Requires 20-40 bp overlaps \u2022 Developed by Daniel Gibson (2009)</text>
  </svg>`;
  return `<div class="inline-diagram my-6">${svg}<p class="text-xs text-center text-slate-400 mt-1">Figure: Gibson Assembly \u2014 Isothermal, scarless joining of overlapping DNA fragments using 3 enzymes</p></div>`;
}

/* ─── 12. Codon Wheel (Static) ─── */
export function svgCodonWheel() {
  // Simplified static codon table - concentric rings
  const bases = ["U","C","A","G"];
  const colors = { U:"#ef4444", C:"#3b82f6", A:"#22c55e", G:"#eab308" };
  const aas = [
    ["Phe","Phe","Leu","Leu","Ser","Ser","Ser","Ser","Tyr","Tyr","*","*","Cys","Cys","*","Trp"],
    ["Leu","Leu","Leu","Leu","Pro","Pro","Pro","Pro","His","His","Gln","Gln","Arg","Arg","Arg","Arg"],
    ["Ile","Ile","Ile","Met","Thr","Thr","Thr","Thr","Asn","Asn","Lys","Lys","Ser","Ser","Arg","Arg"],
    ["Val","Val","Val","Val","Ala","Ala","Ala","Ala","Asp","Asp","Glu","Glu","Gly","Gly","Gly","Gly"]
  ];
  const cx = 300, cy = 190;
  let ring1 = "", ring2 = "", ring3 = "", aaLabels = "";

  // 1st base ring (innermost)
  for (let i = 0; i < 4; i++) {
    const a1 = (i * 90 - 90) * Math.PI / 180;
    const a2 = ((i + 1) * 90 - 90) * Math.PI / 180;
    const r = 40;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const mid = (a1 + a2) / 2;
    const tx = cx + 25 * Math.cos(mid), ty = cy + 25 * Math.sin(mid);
    ring1 += `<path d="M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 0,1 ${x2},${y2} Z" fill="${colors[bases[i]]}" opacity="0.3" stroke="#1e293b" stroke-width="1"/>`;
    ring1 += `<text x="${tx}" y="${ty + 4}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">${bases[i]}</text>`;
  }

  // 2nd base ring (middle)
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const idx = i * 4 + j;
      const a1 = (idx * 22.5 - 90) * Math.PI / 180;
      const a2 = ((idx + 1) * 22.5 - 90) * Math.PI / 180;
      const r1 = 42, r2 = 75;
      const mid = (a1 + a2) / 2;
      const tx = cx + 58 * Math.cos(mid), ty = cy + 58 * Math.sin(mid);
      const x1i = cx + r1 * Math.cos(a1), y1i = cy + r1 * Math.sin(a1);
      const x2i = cx + r1 * Math.cos(a2), y2i = cy + r1 * Math.sin(a2);
      const x1o = cx + r2 * Math.cos(a1), y1o = cy + r2 * Math.sin(a1);
      const x2o = cx + r2 * Math.cos(a2), y2o = cy + r2 * Math.sin(a2);
      ring2 += `<path d="M ${x1i},${y1i} L ${x1o},${y1o} A ${r2},${r2} 0 0,1 ${x2o},${y2o} L ${x2i},${y2i} A ${r1},${r1} 0 0,0 ${x1i},${y1i} Z" fill="${colors[bases[j]]}" opacity="0.2" stroke="#1e293b" stroke-width="0.5"/>`;
      if (idx % 4 === 0) {
        ring2 += `<text x="${tx}" y="${ty + 3}" text-anchor="middle" fill="#ffffff" font-size="7">${bases[j]}</text>`;
      }
    }
  }

  // 3rd base + amino acid ring (outer)
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        const idx = i * 16 + j * 4 + k;
        const a1 = (idx * 5.625 - 90) * Math.PI / 180;
        const a2 = ((idx + 1) * 5.625 - 90) * Math.PI / 180;
        const r1 = 77, r2 = 120;
        const mid = (a1 + a2) / 2;
        const tx = cx + 100 * Math.cos(mid), ty = cy + 100 * Math.sin(mid);
        const aa = aas[i][j * 4 + k];
        const aaColor = aa === "*" ? "#ef4444" : aa === "Met" ? "#22c55e" : "#94a3b8";
        aaLabels += `<text x="${tx}" y="${ty + 3}" text-anchor="middle" fill="${aaColor}" font-size="5" transform="rotate(${mid * 180 / Math.PI + 90},${tx},${ty})">${aa}</text>`;
      }
    }
  }

  const svg = `<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    <text x="300" y="22" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">The Genetic Code (Codon Wheel)</text>

    <!-- Rings -->
    ${ring1}
    ${ring2}

    <!-- Outer circle border -->
    <circle cx="${cx}" cy="${cy}" r="120" fill="none" stroke="#94a3b8" stroke-width="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="77" fill="none" stroke="#94a3b8" stroke-width="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="42" fill="none" stroke="#94a3b8" stroke-width="0.5"/>

    <!-- Center label -->
    <circle cx="${cx}" cy="${cy}" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="0.5"/>
    <text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="#ffffff" font-size="6">5\u2032</text>
    <text x="${cx}" y="${cy + 7}" text-anchor="middle" fill="#94a3b8" font-size="5">1st</text>

    <!-- Ring labels -->
    <text x="${cx}" y="${cy - 48}" text-anchor="middle" fill="#94a3b8" font-size="7">2nd base</text>
    <text x="${cx}" y="${cy - 82}" text-anchor="middle" fill="#94a3b8" font-size="7">3rd base + AA</text>

    <!-- Legend at bottom -->
    <text x="60" y="335" fill="#94a3b8" font-size="9">Read from center outward: 1st base \u2192 2nd base \u2192 3rd base \u2192 Amino acid</text>
    <text x="60" y="350" fill="#94a3b8" font-size="9">\u2022 64 codons encode 20 amino acids + 3 stop codons (*)</text>
    <text x="60" y="365" fill="#22c55e" font-size="9">\u2022 AUG = Met (start codon)</text>
    <text x="260" y="365" fill="#ef4444" font-size="9">\u2022 UAA, UAG, UGA = Stop (*)</text>
  </svg>`;
  return `<div class="inline-diagram my-6">${svg}<p class="text-xs text-center text-slate-400 mt-1">Figure: Codon Wheel \u2014 64 triplet codons map to 20 amino acids (the genetic code is degenerate)</p></div>`;
}

/* ─── 13. Phosphoramidite Synthesis Cycle ─── */
export function svgPhosphoramidite() {
  const cx = 300, cy = 175, r = 100;
  const steps = [
    { angle: -90, color: "#ef4444", name: "Detritylation", reagent: "TCA in DCM", detail: "Remove 5\u2032-DMT group" },
    { angle: 0, color: "#22c55e", name: "Coupling", reagent: "Phosphoramidite + tetrazole", detail: "Add next nucleotide" },
    { angle: 90, color: "#eab308", name: "Capping", reagent: "Ac\u2082O + NMI", detail: "Block unreacted 5\u2032-OH" },
    { angle: 180, color: "#3b82f6", name: "Oxidation", reagent: "I\u2082 / H\u2082O / pyridine", detail: "P(III) \u2192 P(V)" }
  ];

  let stepsContent = "";
  for (let i = 0; i < 4; i++) {
    const a = steps[i].angle * Math.PI / 180;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    const labelX = cx + (r + 55) * Math.cos(a);
    const labelY = cy + (r + 55) * Math.sin(a);

    // Node circle
    stepsContent += `<circle cx="${x}" cy="${y}" r="22" fill="${steps[i].color}" opacity="0.2" stroke="${steps[i].color}" stroke-width="2"/>`;
    stepsContent += `<text x="${x}" y="${y - 2}" text-anchor="middle" fill="${steps[i].color}" font-size="7" font-weight="bold">${i + 1}</text>`;
    stepsContent += `<text x="${x}" y="${y + 8}" text-anchor="middle" fill="#ffffff" font-size="6">${steps[i].name.substring(0, 5)}</text>`;

    // Label outside
    const anchor = steps[i].angle === 0 ? "start" : steps[i].angle === 180 ? "end" : "middle";
    stepsContent += `<text x="${labelX}" y="${labelY - 8}" text-anchor="${anchor}" fill="${steps[i].color}" font-size="10" font-weight="bold">${steps[i].name}</text>`;
    stepsContent += `<text x="${labelX}" y="${labelY + 5}" text-anchor="${anchor}" fill="#94a3b8" font-size="8">${steps[i].reagent}</text>`;
    stepsContent += `<text x="${labelX}" y="${labelY + 17}" text-anchor="${anchor}" fill="#94a3b8" font-size="7">${steps[i].detail}</text>`;

    // Arrow to next step
    const nextA = steps[(i + 1) % 4].angle * Math.PI / 180;
    const midA = (a + nextA + (i === 3 ? -2 * Math.PI : 0)) / 2 + (i === 3 ? Math.PI : 0);
    const arcMidX = cx + (r - 5) * Math.cos(a + (nextA - a + (i === 3 ? -2 * Math.PI : 0)) * 0.3);
    const arcMidY = cy + (r - 5) * Math.sin(a + (nextA - a + (i === 3 ? -2 * Math.PI : 0)) * 0.3);
  }

  // Curved arrows between nodes
  const arrowPaths = [
    `M 300,97 A 78,78 0 0,1 378,175`,   // top to right
    `M 378,175 A 78,78 0 0,1 300,253`,   // right to bottom
    `M 300,253 A 78,78 0 0,1 222,175`,   // bottom to left
    `M 222,175 A 78,78 0 0,1 300,97`     // left to top
  ];
  const arrowColors = ["#ef4444", "#22c55e", "#eab308", "#3b82f6"];

  let arrows = "";
  for (let i = 0; i < 4; i++) {
    arrows += `<path d="${arrowPaths[i]}" fill="none" stroke="${arrowColors[i]}" stroke-width="2" opacity="0.4"
      marker-end="url(#arrowCyc${i})"/>`;
    arrows += `<marker id="arrowCyc${i}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="${arrowColors[i]}" opacity="0.6"/></marker>`;
  }

  const svg = `<svg viewBox="0 0 600 350" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    <text x="300" y="22" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">Phosphoramidite Synthesis Cycle</text>
    <text x="300" y="40" text-anchor="middle" fill="#94a3b8" font-size="9">Chemical DNA/RNA oligonucleotide synthesis (3\u2032 \u2192 5\u2032 direction)</text>

    <!-- Center -->
    <circle cx="${cx}" cy="${cy}" r="30" fill="#1e293b" stroke="#94a3b8" stroke-width="1"/>
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">Repeat</text>
    <text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="#94a3b8" font-size="8">per base</text>

    ${arrows}
    ${stepsContent}

    <!-- Bottom info -->
    <text x="50" y="310" fill="#94a3b8" font-size="9">\u2022 Synthesis is 3\u2032\u21925\u2032 (opposite of biology) on solid support (CPG beads)</text>
    <text x="50" y="325" fill="#94a3b8" font-size="9">\u2022 Coupling efficiency ~99.5% per step \u2022 Max practical length ~200 nt</text>
    <text x="50" y="340" fill="#94a3b8" font-size="9">\u2022 Final: cleave from support, remove protecting groups, purify (HPLC/PAGE)</text>
  </svg>`;
  return `<div class="inline-diagram my-6">${svg}<p class="text-xs text-center text-slate-400 mt-1">Figure: Phosphoramidite Cycle \u2014 Four chemical steps repeated for each nucleotide addition</p></div>`;
}

/* ─── 14. Base Editing ─── */
export function svgBaseEditing() {
  const svg = `<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    <defs>
      <radialGradient id="beGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.2"/>
      </radialGradient>
    </defs>
    <text x="300" y="22" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">Base Editing (CBE \u2014 Cytosine Base Editor)</text>

    <!-- DNA strands -->
    <line x1="50" y1="150" x2="550" y2="150" stroke="#3b82f6" stroke-width="3"/>
    <line x1="50" y1="170" x2="550" y2="170" stroke="#f97316" stroke-width="3"/>
    <text x="40" y="153" text-anchor="end" fill="#6366f1" font-size="9">5\u2032</text>
    <text x="560" y="153" fill="#6366f1" font-size="9">3\u2032</text>
    <text x="40" y="173" text-anchor="end" fill="#14b8a6" font-size="9">3\u2032</text>
    <text x="560" y="173" fill="#14b8a6" font-size="9">5\u2032</text>

    <!-- Target C on top strand -->
    <circle cx="300" cy="150" r="12" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="300" y="154" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">C</text>
    <!-- Paired G on bottom strand -->
    <circle cx="300" cy="170" r="12" fill="#f97316" opacity="0.3" stroke="#f97316" stroke-width="1.5"/>
    <text x="300" y="174" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">G</text>

    <!-- dCas9 (catalytically dead) -->
    <ellipse cx="320" cy="110" rx="80" ry="35" fill="url(#beGrad)" stroke="#a855f7" stroke-width="1.5"/>
    <text x="320" y="100" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">dCas9</text>
    <text x="320" y="113" text-anchor="middle" fill="#94a3b8" font-size="7">(catalytically dead)</text>
    <text x="320" y="125" text-anchor="middle" fill="#94a3b8" font-size="7">No DSB!</text>

    <!-- Deaminase domain -->
    <ellipse cx="220" cy="100" rx="35" ry="20" fill="#ec4899" opacity="0.25" stroke="#ec4899" stroke-width="1.5"/>
    <text x="220" y="97" text-anchor="middle" fill="#ec4899" font-size="8" font-weight="bold">APOBEC</text>
    <text x="220" y="109" text-anchor="middle" fill="#ec4899" font-size="7">Deaminase</text>

    <!-- sgRNA -->
    <path d="M 250,148 Q 250,125 270,110 Q 290,95 310,80 Q 330,68 350,72"
      fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <text x="365" y="75" fill="#22c55e" font-size="8">sgRNA</text>

    <!-- Deamination arrow -->
    <path d="M 230,120 Q 260,135 295,140" fill="none" stroke="#ec4899" stroke-width="1.5"
      marker-end="url(#arrBE)"/>
    <marker id="arrBE" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="#ec4899"/></marker>
    <text x="265" y="128" fill="#ec4899" font-size="7">deaminates C</text>

    <!-- UGI domain -->
    <ellipse cx="420" cy="105" rx="28" ry="15" fill="#06b6d4" opacity="0.2" stroke="#06b6d4" stroke-width="1"/>
    <text x="420" y="103" text-anchor="middle" fill="#06b6d4" font-size="7" font-weight="bold">UGI</text>
    <text x="420" y="115" text-anchor="middle" fill="#94a3b8" font-size="6">Blocks UDG repair</text>

    <!-- Result panel -->
    <rect x="50" y="200" width="500" height="50" rx="5" fill="#1e293b" stroke="#94a3b8" stroke-width="0.5"/>
    <text x="300" y="218" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">Result: C\u2022G \u2192 T\u2022A conversion (no double-strand break)</text>
    <text x="300" y="235" text-anchor="middle" fill="#94a3b8" font-size="9">C \u2192 U (deamination) \u2192 reads as T after replication</text>

    <!-- Chemical detail -->
    <text x="75" y="272" fill="#3b82f6" font-size="11" font-weight="bold">Before:</text>
    <text x="140" y="272" fill="#94a3b8" font-size="11" font-family="monospace">...T A <tspan fill="#3b82f6" font-weight="bold">C</tspan> G A...</text>
    <text x="140" y="290" fill="#94a3b8" font-size="11" font-family="monospace">...A T <tspan fill="#f97316" font-weight="bold">G</tspan> C T...</text>

    <text x="350" y="272" fill="#22c55e" font-size="11" font-weight="bold">After:</text>
    <text x="405" y="272" fill="#94a3b8" font-size="11" font-family="monospace">...T A <tspan fill="#ef4444" font-weight="bold">T</tspan> G A...</text>
    <text x="405" y="290" fill="#94a3b8" font-size="11" font-family="monospace">...A T <tspan fill="#22c55e" font-weight="bold">A</tspan> C T...</text>

    <text x="300" y="313" text-anchor="middle" fill="#94a3b8" font-size="8">ABE (Adenine Base Editor): similar concept using TadA deaminase for A\u2022T \u2192 G\u2022C conversion</text>
  </svg>`;
  return `<div class="inline-diagram my-6">${svg}<p class="text-xs text-center text-slate-400 mt-1">Figure: Base Editing \u2014 dCas9-deaminase fusion converts C\u2192T without cutting DNA</p></div>`;
}

/* ─── 15. Prime Editing ─── */
export function svgPrimeEditing() {
  const svg = `<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg" style="background:#0f172a">
    <defs>
      <radialGradient id="peGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#a855f7" stop-opacity="0.2"/>
      </radialGradient>
    </defs>
    <text x="300" y="22" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">Prime Editing</text>
    <text x="300" y="40" text-anchor="middle" fill="#94a3b8" font-size="9">\u201cSearch and replace\u201d for the genome \u2014 all 12 base-to-base changes, small indels</text>

    <!-- Target DNA -->
    <line x1="50" y1="160" x2="550" y2="160" stroke="#3b82f6" stroke-width="3"/>
    <line x1="50" y1="180" x2="550" y2="180" stroke="#f97316" stroke-width="3"/>
    <text x="40" y="163" text-anchor="end" fill="#6366f1" font-size="9">5\u2032</text>
    <text x="560" y="163" fill="#6366f1" font-size="9">3\u2032</text>
    <text x="40" y="183" text-anchor="end" fill="#14b8a6" font-size="9">3\u2032</text>
    <text x="560" y="183" fill="#14b8a6" font-size="9">5\u2032</text>

    <!-- Nick on non-target strand -->
    <line x1="320" y1="176" x2="320" y2="184" stroke="#ef4444" stroke-width="2"/>
    <text x="320" y="196" text-anchor="middle" fill="#ef4444" font-size="7">Nick (non-target strand)</text>

    <!-- Cas9 nickase (H840A) -->
    <ellipse cx="310" cy="120" rx="75" ry="35" fill="url(#peGrad)" stroke="#6366f1" stroke-width="1.5"/>
    <text x="310" y="110" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">Cas9 Nickase</text>
    <text x="310" y="123" text-anchor="middle" fill="#94a3b8" font-size="7">(H840A \u2014 cuts one strand only)</text>

    <!-- Reverse Transcriptase domain -->
    <ellipse cx="430" cy="115" rx="40" ry="22" fill="#14b8a6" opacity="0.25" stroke="#14b8a6" stroke-width="1.5"/>
    <text x="430" y="112" text-anchor="middle" fill="#14b8a6" font-size="8" font-weight="bold">RT</text>
    <text x="430" y="124" text-anchor="middle" fill="#94a3b8" font-size="6">Rev. Transcriptase</text>

    <!-- pegRNA (extends from Cas9) -->
    <path d="M 250,155 Q 240,130 230,110 Q 220,90 240,75 Q 260,62 280,68"
      fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <!-- Spacer part -->
    <text x="210" y="90" fill="#22c55e" font-size="7">Spacer (binds target)</text>

    <!-- PBS + RT template extending down -->
    <path d="M 320,180 Q 340,200 380,200 Q 420,200 440,185"
      fill="none" stroke="#ec4899" stroke-width="2.5" stroke-linecap="round"/>
    <text x="430" y="215" fill="#ec4899" font-size="8" font-weight="bold">pegRNA 3\u2032 extension</text>

    <!-- PBS label -->
    <rect x="320" y="200" width="45" height="16" rx="3" fill="#ec4899" opacity="0.15" stroke="#ec4899" stroke-width="0.5"/>
    <text x="342" y="211" text-anchor="middle" fill="#ec4899" font-size="7">PBS</text>
    <text x="342" y="227" text-anchor="middle" fill="#94a3b8" font-size="6">Primer Binding Site</text>

    <!-- RT template label -->
    <rect x="370" y="200" width="70" height="16" rx="3" fill="#a855f7" opacity="0.15" stroke="#a855f7" stroke-width="0.5"/>
    <text x="405" y="211" text-anchor="middle" fill="#a855f7" font-size="7">RT template</text>
    <text x="405" y="227" text-anchor="middle" fill="#94a3b8" font-size="6">Contains the edit</text>

    <!-- Mechanism steps -->
    <rect x="50" y="245" width="500" height="120" rx="5" fill="#1e293b" stroke="#94a3b8" stroke-width="0.5"/>
    <text x="300" y="262" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">Prime Editing Mechanism</text>

    <text x="70" y="282" fill="#22c55e" font-size="9">1.</text>
    <text x="85" y="282" fill="#94a3b8" font-size="9">pegRNA spacer guides Cas9 nickase to target; nicks non-target strand</text>

    <text x="70" y="300" fill="#ec4899" font-size="9">2.</text>
    <text x="85" y="300" fill="#94a3b8" font-size="9">PBS hybridizes to nicked strand; RT uses template to synthesize new DNA with edit</text>

    <text x="70" y="318" fill="#a855f7" font-size="9">3.</text>
    <text x="85" y="318" fill="#94a3b8" font-size="9">Edited 3\u2032 flap competes with original 5\u2032 flap; cellular repair installs the edit</text>

    <text x="70" y="336" fill="#6366f1" font-size="9">4.</text>
    <text x="85" y="336" fill="#94a3b8" font-size="9">PE3: second nick on opposite strand biases repair toward edited strand</text>

    <!-- Key advantage -->
    <text x="300" y="370" text-anchor="middle" fill="#94a3b8" font-size="8">\u2022 No DSB \u2022 No donor template needed \u2022 All 12 point mutations + small insertions (up to 44bp) and deletions (up to 80bp)</text>
  </svg>`;
  return `<div class="inline-diagram my-6">${svg}<p class="text-xs text-center text-slate-400 mt-1">Figure: Prime Editing \u2014 Cas9 nickase + reverse transcriptase writes new sequences directly into the genome</p></div>`;
}
