import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

const BASE_COLORS: Record<string, string> = { A: '#2ecc71', T: '#e74c3c', G: '#3498db', C: '#f1c40f', U: '#e67e22' };
const COMPLEMENT: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
// RNA complement table (available for future use)
// const RNA_COMPLEMENT: Record<string, string> = { A: 'U', U: 'A', G: 'C', C: 'G' };
const CODON_TABLE: Record<string, string> = { AUG: 'Met', AAA: 'Lys', GCU: 'Ala', UAC: 'Tyr', GAA: 'Glu', UAA: '*' };
const AA_COLORS: Record<string, string> = { Met: '#9b59b6', Lys: '#8e44ad', Ala: '#6c3483', Tyr: '#a569bd', Glu: '#7d3c98' };

const codingSeq = 'ATGAAAGCTTATGAA'.split('');
const templateSeq = codingSeq.map(b => COMPLEMENT[b]);
const mRNASeq = codingSeq.map(b => b === 'T' ? 'U' : b);
const codons: string[] = [];
for (let i = 0; i < mRNASeq.length; i += 3) codons.push(mRNASeq.slice(i, i + 3).join(''));
const aminoAcids = codons.map(c => CODON_TABLE[c] || '?').filter(a => a !== '*');

const STAGES = [
  'DNA Double Strand',
  'Transcription Initiation',
  'mRNA Synthesis',
  'mRNA Complete',
  'Translation Initiation',
  'Elongation',
  'Protein Complete'
];

const DESCRIPTIONS = [
  "The DNA double strand: coding strand (5'→3') and template strand (3'→5') with complementary base pairing.",
  'RNA Polymerase binds to the promoter region. The DNA strands begin to unwind and separate.',
  "RNA Polymerase moves along the template strand, synthesizing mRNA. Uracil (U) replaces Thymine (T).",
  'Transcription is complete. RNA Polymerase detaches, DNA re-anneals, and mature mRNA is ready.',
  'The ribosome binds to the mRNA at the AUG start codon, initiating translation.',
  'tRNA molecules deliver amino acids matching each codon. The polypeptide chain grows.',
  'The ribosome reaches a stop codon. The completed protein is released.'
];

const W = 700, H = 380;
const BP = codingSeq.length;
const SPC = 32;
const X0 = 70;
const DNA_Y = 80;
const PAIR_GAP = 40;

function BaseChar({ x, y, letter, opacity = 1, size = 13 }: { x: number; y: number; letter: string; opacity?: number; size?: number }) {
  return (
    <text
      x={x} y={y}
      textAnchor="middle" dominantBaseline="central"
      fontFamily="monospace" fontSize={size} fontWeight="bold"
      fill={BASE_COLORS[letter] || '#ccc'}
      opacity={opacity}
    >
      {letter}
    </text>
  );
}

function Stage0() {
  return (
    <g>
      <text x={X0 - 40} y={DNA_Y} fill="#76d7c4" fontSize={12} fontWeight="bold">5'</text>
      <text x={X0 + BP * SPC + 8} y={DNA_Y} fill="#76d7c4" fontSize={12} fontWeight="bold">3'</text>
      <text x={X0 - 40} y={DNA_Y + PAIR_GAP} fill="#76d7c4" fontSize={12} fontWeight="bold">3'</text>
      <text x={X0 + BP * SPC + 8} y={DNA_Y + PAIR_GAP} fill="#76d7c4" fontSize={12} fontWeight="bold">5'</text>
      <text x={X0 + BP * SPC / 2} y={DNA_Y - 28} textAnchor="middle" fill="#82b1ff" fontSize={11}>Coding Strand (sense)</text>
      <text x={X0 + BP * SPC / 2} y={DNA_Y + PAIR_GAP + 28} textAnchor="middle" fill="#82b1ff" fontSize={11}>Template Strand (antisense)</text>
      {codingSeq.map((b, i) => (
        <g key={i}>
          <BaseChar x={X0 + i * SPC} y={DNA_Y} letter={b} />
          <text x={X0 + i * SPC} y={DNA_Y + PAIR_GAP / 2} textAnchor="middle" fill="#666" fontSize={10}>|</text>
          <BaseChar x={X0 + i * SPC} y={DNA_Y + PAIR_GAP} letter={templateSeq[i]} />
        </g>
      ))}
    </g>
  );
}

function Stage1() {
  const separateN = 6;
  return (
    <g>
      {codingSeq.map((b, i) => {
        const offset = i < separateN ? -12 : 0;
        return (
          <g key={i}>
            <BaseChar x={X0 + i * SPC} y={DNA_Y + offset} letter={b} />
            {i >= separateN && <text x={X0 + i * SPC} y={DNA_Y + PAIR_GAP / 2} textAnchor="middle" fill="#666" fontSize={10}>|</text>}
            <BaseChar x={X0 + i * SPC} y={DNA_Y + PAIR_GAP - offset} letter={templateSeq[i]} />
          </g>
        );
      })}
      {/* RNA Polymerase */}
      <ellipse cx={X0 + 5 * SPC} cy={DNA_Y + PAIR_GAP / 2} rx={40} ry={22} fill="#e67e22" opacity={0.85} stroke="#f39c12" strokeWidth={1.5} />
      <text x={X0 + 5 * SPC} y={DNA_Y + PAIR_GAP / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={10} fontWeight="bold">RNA Pol</text>
      <text x={X0 + 5 * SPC + 50} y={DNA_Y + PAIR_GAP / 2} fill="#e67e22" fontSize={14}>→</text>
    </g>
  );
}

function Stage2() {
  const synthN = 9;
  const mRNAY = DNA_Y + PAIR_GAP / 2 + 4;
  return (
    <g>
      {codingSeq.map((b, i) => (
        <g key={i}>
          <BaseChar x={X0 + i * SPC} y={DNA_Y - 12} letter={b} opacity={0.4} />
          <BaseChar x={X0 + i * SPC} y={DNA_Y + PAIR_GAP + 12} letter={templateSeq[i]} />
        </g>
      ))}
      <ellipse cx={X0 + 8 * SPC} cy={DNA_Y + PAIR_GAP / 2} rx={40} ry={22} fill="#e67e22" opacity={0.85} stroke="#f39c12" strokeWidth={1.5} />
      <text x={X0 + 8 * SPC} y={DNA_Y + PAIR_GAP / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={10} fontWeight="bold">RNA Pol</text>
      {mRNASeq.slice(0, synthN).map((b, i) => (
        <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.12 }}>
          <BaseChar x={X0 + i * SPC} y={mRNAY} letter={b} />
        </motion.g>
      ))}
      <text x={X0 + synthN * SPC / 2} y={mRNAY + 24} textAnchor="middle" fill="#e67e22" fontSize={11} fontStyle="italic">mRNA (growing)</text>
    </g>
  );
}

function Stage3() {
  const mY = 200;
  return (
    <g>
      {/* DNA re-annealed (dimmed) */}
      {codingSeq.map((b, i) => (
        <g key={i}>
          <BaseChar x={X0 + i * SPC} y={40} letter={b} opacity={0.4} />
          <text x={X0 + i * SPC} y={60} textAnchor="middle" fill="#444" fontSize={10}>|</text>
          <BaseChar x={X0 + i * SPC} y={80} letter={templateSeq[i]} opacity={0.4} />
        </g>
      ))}
      <text x={X0 + BP * SPC / 2} y={25} textAnchor="middle" fill="#555" fontSize={11}>DNA (re-annealed)</text>
      {/* mRNA */}
      <text x={X0 - 40} y={mY} fill="#e67e22" fontSize={12} fontWeight="bold">5'</text>
      <text x={X0 + BP * SPC + 8} y={mY} fill="#e67e22" fontSize={12} fontWeight="bold">3'</text>
      {mRNASeq.map((b, i) => <BaseChar key={i} x={X0 + i * SPC} y={mY} letter={b} />)}
      <text x={X0 + BP * SPC / 2} y={mY - 20} textAnchor="middle" fill="#e67e22" fontSize={12} fontWeight="bold">Mature mRNA</text>
      {codons.map((c, ci) => (
        <text key={ci} x={X0 + ci * 3 * SPC + SPC} y={mY + 18} textAnchor="middle" fill="#888" fontSize={10}>{c}</text>
      ))}
    </g>
  );
}

function Stage4() {
  const mY = 160;
  const ribX = X0 + SPC;
  return (
    <g>
      {/* mRNA */}
      <line x1={X0 - 8} y1={mY} x2={X0 + (BP - 1) * SPC + 8} y2={mY} stroke="#e67e22" strokeWidth={1.5} opacity={0.3} />
      {mRNASeq.map((b, i) => <BaseChar key={i} x={X0 + i * SPC} y={mY} letter={b} />)}
      {codons.map((c, ci) => (
        <text key={ci} x={X0 + ci * 3 * SPC + SPC} y={mY + 18} textAnchor="middle" fill="#888" fontSize={9}>{c}</text>
      ))}
      <text x={X0 + BP * SPC / 2} y={mY - 18} textAnchor="middle" fill="#e67e22" fontSize={11}>mRNA</text>
      {/* Ribosome */}
      <rect x={ribX - 48} y={mY - 54} width={96} height={34} rx={12} fill="#5d6d7e" stroke="#85929e" strokeWidth={1.5} />
      <text x={ribX} y={mY - 35} textAnchor="middle" fill="#eee" fontSize={9}>Large subunit</text>
      <rect x={ribX - 38} y={mY + 22} width={76} height={26} rx={10} fill="#7f8c8d" stroke="#95a5a6" strokeWidth={1.5} />
      <text x={ribX} y={mY + 38} textAnchor="middle" fill="#eee" fontSize={9}>Small subunit</text>
      <text x={ribX} y={mY - 62} textAnchor="middle" fill="#76d7c4" fontSize={11}>Start codon: AUG</text>
    </g>
  );
}

function Stage5() {
  const mY = 160;
  const showAA = 4;
  const ribCodon = showAA;
  const ribX = X0 + ribCodon * 3 * SPC + SPC;
  const chainY = mY - 80;
  const chainX0 = X0 + 40;

  return (
    <g>
      {/* mRNA */}
      <line x1={X0 - 8} y1={mY} x2={X0 + (BP - 1) * SPC + 8} y2={mY} stroke="#e67e22" strokeWidth={1.5} opacity={0.3} />
      {mRNASeq.map((b, i) => <BaseChar key={i} x={X0 + i * SPC} y={mY} letter={b} />)}
      {codons.map((c, ci) => (
        <text key={ci} x={X0 + ci * 3 * SPC + SPC} y={mY + 18} textAnchor="middle" fill="#888" fontSize={9}>{c}</text>
      ))}
      {/* Ribosome */}
      <rect x={ribX - 48} y={mY - 54} width={96} height={34} rx={12} fill="#5d6d7e" stroke="#85929e" strokeWidth={1.5} />
      <text x={ribX} y={mY - 35} textAnchor="middle" fill="#eee" fontSize={9}>Large subunit</text>
      <rect x={ribX - 38} y={mY + 22} width={76} height={26} rx={10} fill="#7f8c8d" stroke="#95a5a6" strokeWidth={1.5} />
      <text x={ribX} y={mY + 38} textAnchor="middle" fill="#eee" fontSize={9}>Small subunit</text>
      {/* tRNA */}
      <line x1={ribX} y1={mY + 48} x2={ribX} y2={mY + 88} stroke="#2ecc71" strokeWidth={3} />
      <line x1={ribX - 18} y1={mY + 48} x2={ribX + 18} y2={mY + 48} stroke="#2ecc71" strokeWidth={3} />
      <circle cx={ribX} cy={mY + 96} r={12} fill={AA_COLORS[aminoAcids[ribCodon]] || '#999'} stroke="#fff" strokeWidth={1} />
      <text x={ribX} y={mY + 96} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={8} fontWeight="bold">{aminoAcids[ribCodon] || '?'}</text>
      <text x={ribX + 30} y={mY + 68} fill="#2ecc71" fontSize={10}>tRNA</text>
      {/* Amino acid chain */}
      {Array.from({ length: showAA }).map((_, a) => {
        const cx = chainX0 + a * 36;
        return (
          <g key={a}>
            <motion.circle
              cx={cx} cy={chainY} r={14}
              fill={AA_COLORS[aminoAcids[a]] || '#999'} stroke="#fff" strokeWidth={1}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: a * 0.1 }}
            />
            <text x={cx} y={chainY} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={9} fontWeight="bold">{aminoAcids[a]}</text>
            {a < showAA - 1 && <line x1={cx + 14} y1={chainY} x2={cx + 22} y2={chainY} stroke="#aaa" strokeWidth={2} />}
          </g>
        );
      })}
      <text x={chainX0 + (showAA - 1) * 18} y={chainY - 22} textAnchor="middle" fill="#bb8fce" fontSize={11}>Growing polypeptide</text>
    </g>
  );
}

function Stage6() {
  const mY = 220;
  const chainY = 80;
  const chainX0 = 160;
  return (
    <g>
      {/* Dimmed mRNA */}
      <line x1={X0 - 8} y1={mY} x2={X0 + (BP - 1) * SPC + 8} y2={mY} stroke="#e67e22" strokeWidth={1.5} opacity={0.12} />
      {mRNASeq.map((b, i) => <BaseChar key={i} x={X0 + i * SPC} y={mY} letter={b} opacity={0.4} />)}
      {/* Detached ribosome */}
      <rect x={520} y={mY - 20} width={70} height={30} rx={8} fill="#5d6d7e" opacity={0.5} stroke="#85929e" />
      <text x={555} y={mY - 2} textAnchor="middle" fill="#aaa" fontSize={9}>Ribosome</text>
      {/* Complete protein */}
      <text x={W / 2} y={chainY - 35} textAnchor="middle" fill="#bb8fce" fontSize={14} fontWeight="bold">Completed Protein</text>
      {aminoAcids.map((aa, a) => {
        const cx = chainX0 + a * 50;
        return (
          <g key={a}>
            <motion.circle
              cx={cx} cy={chainY} r={18}
              fill={AA_COLORS[aa] || '#999'} stroke="#fff" strokeWidth={2}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: a * 0.15 }}
            />
            <text x={cx} y={chainY} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={11} fontWeight="bold">{aa}</text>
            {a < aminoAcids.length - 1 && <line x1={cx + 18} y1={chainY} x2={cx + 32} y2={chainY} stroke="#ccc" strokeWidth={2} />}
          </g>
        );
      })}
      {/* Stop codon */}
      <text x={X0 + (codons.length - 1) * 3 * SPC + SPC} y={mY + 24} textAnchor="middle" fill="#e74c3c" fontSize={11} fontWeight="bold">STOP (UAA)</text>
      <text x={W / 2} y={H - 20} textAnchor="middle" fill="#76d7c4" fontSize={13}>DNA → mRNA → Protein: The Central Dogma</text>
    </g>
  );
}

const RENDERERS = [Stage0, Stage1, Stage2, Stage3, Stage4, Stage5, Stage6];

export function CentralDogmaSim() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const stepForward = useCallback(() => {
    setStage(prev => {
      if (prev < STAGES.length - 1) return prev + 1;
      setPlaying(false);
      return prev;
    });
  }, []);

  const stepBack = useCallback(() => {
    setStage(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(stepForward, 2500 / speed);
    return () => clearInterval(interval);
  }, [playing, speed, stepForward]);

  const StageRenderer = RENDERERS[stage];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setPlaying(false); setStage(0); }}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setPlaying(false); stepBack(); }}
          disabled={stage === 0}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
          title="Back"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => { setPlaying(false); stepForward(); }}
          disabled={stage === STAGES.length - 1}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
          title="Next"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-slate-500">Speed:</span>
          <select
            value={speed}
            onChange={e => setSpeed(+e.target.value)}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 ml-auto">
          Stage {stage}/{STAGES.length - 1}: {STAGES[stage]}
        </span>
      </div>

      {/* Stage indicator dots */}
      <div className="flex gap-1.5 justify-center">
        {STAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPlaying(false); setStage(i); }}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === stage ? 'bg-blue-500' : i < stage ? 'bg-blue-300 dark:bg-blue-700' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* SVG */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block mx-auto" style={{ background: '#1a1a2e', borderRadius: 8, maxWidth: '100%' }}>
          <StageRenderer />
        </svg>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[40px]">
        {DESCRIPTIONS[stage]}
      </p>
    </div>
  );
}
