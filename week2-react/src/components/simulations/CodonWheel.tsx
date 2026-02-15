import { useState, useMemo } from 'react';

const BASES = ['U', 'C', 'A', 'G'] as const;

const CODON_TABLE: Record<string, string> = {
  UUU:'F',UUC:'F',UUA:'L',UUG:'L',CUU:'L',CUC:'L',CUA:'L',CUG:'L',
  AUU:'I',AUC:'I',AUA:'I',AUG:'M',GUU:'V',GUC:'V',GUA:'V',GUG:'V',
  UCU:'S',UCC:'S',UCA:'S',UCG:'S',CCU:'P',CCC:'P',CCA:'P',CCG:'P',
  ACU:'T',ACC:'T',ACA:'T',ACG:'T',GCU:'A',GCC:'A',GCA:'A',GCG:'A',
  UAU:'Y',UAC:'Y',UAA:'*',UAG:'*',CAU:'H',CAC:'H',CAA:'Q',CAG:'Q',
  AAU:'N',AAC:'N',AAA:'K',AAG:'K',GAU:'D',GAC:'D',GAA:'E',GAG:'E',
  UGU:'C',UGC:'C',UGA:'*',UGG:'W',CGU:'R',CGC:'R',CGA:'R',CGG:'R',
  AGU:'S',AGC:'S',AGA:'R',AGG:'R',GGU:'G',GGC:'G',GGA:'G',GGG:'G'
};

const AA_INFO: Record<string, { name: string; abbr: string; mw: number; prop: string }> = {
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

const PROP_COLORS: Record<string, string> = {
  hydrophobic: '#4a90d9',
  polar: '#5cb85c',
  positive: '#d9534f',
  negative: '#f0ad4e',
  stop: '#555'
};

const PROP_LABELS: Record<string, string> = {
  hydrophobic: 'Hydrophobic',
  polar: 'Polar uncharged',
  positive: 'Positively charged',
  negative: 'Negatively charged',
  stop: 'Stop codon'
};

function aaColor(aa: string): string {
  const info = AA_INFO[aa];
  if (!info) return '#999';
  const base = PROP_COLORS[info.prop];
  const shift = ((aa.charCodeAt(0) * 17) % 40) - 20;
  // Simple brightness shift
  const r = parseInt(base.slice(1, 3), 16);
  const g = parseInt(base.slice(3, 5), 16);
  const b = parseInt(base.slice(5, 7), 16);
  const adj = (v: number) => Math.min(255, Math.max(0, v + shift));
  return `rgb(${adj(r)},${adj(g)},${adj(b)})`;
}

function arcPath(innerR: number, outerR: number, startAngle: number, endAngle: number): string {
  const x1 = Math.sin(startAngle);
  const y1 = -Math.cos(startAngle);
  const x2 = Math.sin(endAngle);
  const y2 = -Math.cos(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${innerR * x1} ${innerR * y1}`,
    `L ${outerR * x1} ${outerR * y1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerR * x2} ${outerR * y2}`,
    `L ${innerR * x2} ${innerR * y2}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerR * x1} ${innerR * y1}`,
    'Z'
  ].join(' ');
}

function arcCentroid(innerR: number, outerR: number, startAngle: number, endAngle: number): [number, number] {
  const midAngle = (startAngle + endAngle) / 2;
  const midR = (innerR + outerR) / 2;
  return [midR * Math.sin(midAngle), -midR * Math.cos(midAngle)];
}

interface CodonData {
  codon: string;
  aa: string;
  b1Idx: number;
  b2Idx: number;
  startAngle: number;
  endAngle: number;
}

export function CodonWheel() {
  const [activeAA, setActiveAA] = useState<string | null>(null);
  const [hoverCodon, setHoverCodon] = useState<string | null>(null);
  const [infoText, setInfoText] = useState<string>('Hover over the wheel or click a codon for details.');

  const size = 480;
  const cx = size / 2;
  const r1 = [40, 90];
  const r2 = [95, 160];
  const r3 = [165, 230];

  const outerData = useMemo(() => {
    const data: CodonData[] = [];
    BASES.forEach((b1, i) => {
      BASES.forEach((b2, j) => {
        BASES.forEach((b3, k) => {
          const idx = i * 16 + j * 4 + k;
          const codon = b1 + b2 + b3;
          data.push({
            codon,
            aa: CODON_TABLE[codon],
            b1Idx: i,
            b2Idx: j,
            startAngle: idx * Math.PI / 32,
            endAngle: (idx + 1) * Math.PI / 32,
          });
        });
      });
    });
    return data;
  }, []);

  function showCodonInfo(d: CodonData) {
    const info = AA_INFO[d.aa];
    if (!info) return;
    const mwStr = info.mw > 0 ? `${info.mw} Da` : 'N/A';
    setInfoText(`Codon: ${d.codon}  |  Amino Acid: ${info.name} (${d.aa}, ${info.abbr})  |  Property: ${PROP_LABELS[info.prop]}  |  MW: ${mwStr}`);
  }

  function showAAInfo(aa: string) {
    const info = AA_INFO[aa];
    if (!info) return;
    const codons = outerData.filter(d => d.aa === aa).map(d => d.codon).join(', ');
    const mwStr = info.mw > 0 ? `${info.mw} Da` : 'N/A';
    setInfoText(`${info.name} (${aa}, ${info.abbr})  |  Property: ${PROP_LABELS[info.prop]}  |  MW: ${mwStr}  |  Codons (${outerData.filter(d => d.aa === aa).length}): ${codons}`);
  }

  function getOpacity(d: CodonData): number {
    if (activeAA) return d.aa === activeAA ? 1 : 0.15;
    if (hoverCodon) return d.codon === hoverCodon ? 1 : 0.25;
    return 1;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full cursor-pointer"
        onClick={() => { setActiveAA(null); setHoverCodon(null); setInfoText('Hover over the wheel or click a codon for details.'); }}
      >
        <g transform={`translate(${cx},${cx})`}>
          {/* Inner ring: 4 segments (1st base) */}
          {BASES.map((b, i) => {
            const startAngle = i * Math.PI / 2;
            const endAngle = (i + 1) * Math.PI / 2;
            const [tx, ty] = arcCentroid(r1[0], r1[1], startAngle, endAngle);
            return (
              <g key={`r1-${b}`}>
                <path
                  d={arcPath(r1[0], r1[1], startAngle, endAngle)}
                  fill="#e8e8e8"
                  stroke="#fff"
                  strokeWidth={1.5}
                  opacity={activeAA || hoverCodon ? 0.4 : 1}
                />
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight="bold" fill="#333" pointerEvents="none">
                  {b}
                </text>
              </g>
            );
          })}

          {/* Middle ring: 16 segments (1st+2nd base) */}
          {BASES.map((b1, i) =>
            BASES.map((b2, j) => {
              const idx = i * 4 + j;
              const startAngle = idx * Math.PI / 8;
              const endAngle = (idx + 1) * Math.PI / 8;
              const [tx, ty] = arcCentroid(r2[0], r2[1], startAngle, endAngle);
              const angle = ((startAngle + endAngle) / 2) * 180 / Math.PI;
              return (
                <g key={`r2-${b1}${b2}`}>
                  <path
                    d={arcPath(r2[0], r2[1], startAngle, endAngle)}
                    fill="#f0f0f0"
                    stroke="#fff"
                    strokeWidth={1}
                    opacity={activeAA || hoverCodon ? 0.4 : 1}
                  />
                  <text
                    x={tx} y={ty}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={10} fill="#555"
                    pointerEvents="none"
                    transform={`rotate(${angle},${tx},${ty})`}
                  >
                    {b2}
                  </text>
                </g>
              );
            })
          )}

          {/* Outer ring: 64 codons */}
          {outerData.map((d) => {
            const [tx, ty] = arcCentroid(r3[0], r3[1], d.startAngle, d.endAngle);
            const angle = ((d.startAngle + d.endAngle) / 2) * 180 / Math.PI;
            let rot = angle;
            if (rot > 90 && rot < 270) rot += 180;
            return (
              <g key={`r3-${d.codon}`}>
                <path
                  d={arcPath(r3[0], r3[1], d.startAngle, d.endAngle)}
                  fill={aaColor(d.aa)}
                  stroke="#fff"
                  strokeWidth={0.5}
                  opacity={getOpacity(d)}
                  style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    if (!activeAA) { setHoverCodon(d.codon); showCodonInfo(d); }
                  }}
                  onMouseLeave={() => { if (!activeAA) { setHoverCodon(null); setInfoText('Hover over the wheel or click a codon for details.'); } }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveAA(null);
                    setHoverCodon(d.codon);
                    showCodonInfo(d);
                  }}
                />
                <text
                  x={tx} y={ty}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={7} fill="#fff" fontWeight="bold"
                  pointerEvents="none"
                  transform={`rotate(${rot},${tx},${ty})`}
                  opacity={getOpacity(d)}
                >
                  {d.aa}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Info panel */}
      <div className="w-full max-w-lg p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-center min-h-[40px]">
        {infoText}
      </div>

      {/* Legend: property colors */}
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(PROP_LABELS).map(([key, label]) => (
          <span key={key} className="inline-flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm" style={{ background: PROP_COLORS[key] }} />
            {label}
          </span>
        ))}
      </div>

      {/* Legend: amino acid list */}
      <div className="flex flex-wrap gap-1.5 justify-center max-w-lg">
        {Object.entries(AA_INFO).map(([aa, info]) => (
          <button
            key={aa}
            onClick={(e) => {
              e.stopPropagation();
              if (activeAA === aa) {
                setActiveAA(null);
                setInfoText('Hover over the wheel or click a codon for details.');
              } else {
                setActiveAA(aa);
                setHoverCodon(null);
                showAAInfo(aa);
              }
            }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer select-none transition-all ${
              activeAA === aa ? 'ring-2 ring-slate-900 dark:ring-white bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PROP_COLORS[info.prop] }} />
            <strong>{aa}</strong> {info.abbr}
          </button>
        ))}
      </div>
    </div>
  );
}
