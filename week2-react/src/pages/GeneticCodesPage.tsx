import { ModulePage } from '../components/ModulePage';
import { SplitScreen } from '../components/SplitScreen';
import { content } from '../data/content';
import { CodonWheel } from '../components/simulations/CodonWheel';
import { motion } from 'framer-motion';

function DegeneracyVisual() {
  const examples = [
    { aa: 'Leu (L)', codons: ['UUA', 'UUG', 'CUU', 'CUC', 'CUA', 'CUG'], count: 6, color: 'text-blue-400' },
    { aa: 'Ser (S)', codons: ['UCU', 'UCC', 'UCA', 'UCG', 'AGU', 'AGC'], count: 6, color: 'text-green-400' },
    { aa: 'Met (M)', codons: ['AUG'], count: 1, color: 'text-purple-400' },
    { aa: 'Trp (W)', codons: ['UGG'], count: 1, color: 'text-purple-400' },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h3 className="text-lg font-bold text-purple-400">Codon Degeneracy</h3>
      <div className="space-y-3 w-full max-w-sm">
        {examples.map((ex, i) => (
          <motion.div
            key={ex.aa}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg"
          >
            <span className={`font-bold text-sm w-16 ${ex.color}`}>{ex.aa}</span>
            <div className="flex flex-wrap gap-1 flex-1">
              {ex.codons.map(c => (
                <span key={c} className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] font-mono text-slate-300">{c}</span>
              ))}
            </div>
            <span className="text-xs text-slate-500">{ex.count}x</span>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">64 codons map to 20 amino acids + 3 stops</p>
    </div>
  );
}

function AEGISVisual() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h3 className="text-lg font-bold text-amber-400">Expanded Genetic Alphabet</h3>
      <div className="space-y-3 w-full max-w-xs">
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm font-bold text-white mb-2">Natural Base Pairs</p>
          <div className="flex gap-4 justify-center">
            <div className="flex items-center gap-1">
              <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">A</span>
              <span className="text-slate-500">=</span>
              <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">T</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">G</span>
              <span className="text-slate-500">=</span>
              <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white">C</span>
            </div>
          </div>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg border border-amber-700">
          <p className="text-sm font-bold text-amber-300 mb-2">AEGIS Synthetic Pairs</p>
          <div className="flex gap-4 justify-center">
            <div className="flex items-center gap-1">
              <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white">Z</span>
              <span className="text-slate-500">=</span>
              <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white">P</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-xs font-bold text-white">S</span>
              <span className="text-slate-500">=</span>
              <span className="w-6 h-6 bg-lime-500 rounded-full flex items-center justify-center text-xs font-bold text-white">B</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">4 → 8 letters: exponentially more information per position</p>
    </div>
  );
}

export function GeneticCodesPage() {
  const sectionData = content.sections.find(s => s.id === 'genetic-codes');
  if (!sectionData) return <div>Data not found</div>;

  const items = [
    {
      id: 'code',
      content: (
        <div>
          <h2>The Universal Genetic Code</h2>
          <p>The genetic code maps 64 nucleotide triplets (codons) to 20 amino acids and 3 stop signals. It is <strong>degenerate</strong> — most amino acids are encoded by 2-6 synonymous codons.</p>
          <p>This redundancy buffers against point mutations: many third-position (wobble) changes are silent.</p>
        </div>
      ),
      visual: <DegeneracyVisual />
    },
    {
      id: 'aegis',
      content: (
        <div>
          <h2>Expanding the Alphabet: AEGIS</h2>
          <p><strong>AEGIS</strong> (Artificially Expanded Genetic Information System) creates synthetic nucleotides forming orthogonal base pairs. Z-P and S-B pairs don't cross-react with natural bases.</p>
          <p>This expands the alphabet from 4 to 8+ letters, increasing information density. Already used in FDA-approved diagnostics.</p>
        </div>
      ),
      visual: <AEGISVisual />
    },
    {
      id: 'wheel',
      content: (
        <div>
          <h2>Interactive Codon Wheel</h2>
          <p>Explore the genetic code interactively. The wheel shows three concentric rings: the first base (inner), second base (middle), and third base (outer) with the resulting amino acid.</p>
          <p>Click any segment to see details, or click an amino acid in the legend below to highlight all its codons.</p>
        </div>
      ),
      visual: <CodonWheel />
    },
  ];

  return (
    <ModulePage section={sectionData}>
      <SplitScreen items={items} />
    </ModulePage>
  );
}
