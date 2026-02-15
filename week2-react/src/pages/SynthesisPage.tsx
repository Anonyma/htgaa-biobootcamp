import { ModulePage } from '../components/ModulePage';
import { SplitScreen } from '../components/SplitScreen';
import { content } from '../data/content';
import { motion } from 'framer-motion';

function PhosphoramiditeVisual() {
  const steps = [
    { name: 'Deprotect', icon: '🔓', color: 'bg-red-500', desc: 'Remove DMT group with acid' },
    { name: 'Couple', icon: '🔗', color: 'bg-green-500', desc: 'Add next phosphoramidite' },
    { name: 'Cap', icon: '🧢', color: 'bg-blue-500', desc: 'Block unreacted sites' },
    { name: 'Oxidize', icon: '⚡', color: 'bg-yellow-500', desc: 'Stabilize phosphate bond' },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <h3 className="text-lg font-bold text-green-400">Synthesis Cycle</h3>
      <div className="relative">
        {steps.map((step, i) => (
          <motion.div
            key={step.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center text-lg`}>
              {step.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-white">{step.name}</p>
              <p className="text-xs text-slate-400">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="absolute left-5 mt-10 w-0.5 h-3 bg-slate-600" style={{ top: i * 52 + 40 }} />
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">~99% coupling efficiency per cycle</p>
    </div>
  );
}

function GibsonVisual() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h3 className="text-lg font-bold text-blue-400">Gibson Assembly</h3>
      <div className="space-y-3 w-full max-w-xs">
        {[
          { enzyme: 'T5 Exonuclease', role: 'Creates 3\' overhangs', color: 'border-red-500' },
          { enzyme: 'Phusion Polymerase', role: 'Fills gaps', color: 'border-green-500' },
          { enzyme: 'Taq Ligase', role: 'Seals nicks', color: 'border-blue-500' },
        ].map((e, i) => (
          <motion.div
            key={e.enzyme}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className={`p-3 rounded-lg border-l-4 ${e.color} bg-slate-800/50`}
          >
            <p className="text-sm font-semibold text-white">{e.enzyme}</p>
            <p className="text-xs text-slate-400">{e.role}</p>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">Isothermal at 50 C, single reaction</p>
    </div>
  );
}

function ChipVsColumnVisual() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
      <h3 className="text-lg font-bold text-purple-400">Column vs Chip Synthesis</h3>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
          <div className="text-3xl mb-2">🧪</div>
          <p className="text-sm font-bold text-white">Column</p>
          <p className="text-xs text-slate-400 mt-1">1 oligo/column</p>
          <p className="text-xs text-slate-400">Higher quantity</p>
          <p className="text-xs text-amber-400 mt-2">~$0.10/base</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-purple-700 text-center">
          <div className="text-3xl mb-2">💻</div>
          <p className="text-sm font-bold text-white">Chip (Twist)</p>
          <p className="text-xs text-slate-400 mt-1">~1M oligos/chip</p>
          <p className="text-xs text-slate-400">Massively parallel</p>
          <p className="text-xs text-green-400 mt-2">~$0.0001/base</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">~1000x cost reduction with chip-based synthesis</p>
    </div>
  );
}

export function SynthesisPage() {
  const sectionData = content.sections.find(s => s.id === 'synthesis');
  if (!sectionData) return <div>Data not found</div>;

  const items = [
    {
      id: 'intro',
      content: (
        <div>
          <h2>The Art of DNA Writing</h2>
          <p>DNA synthesis is the ability to construct arbitrary DNA sequences from scratch. Joseph Jacobson framed cells as <strong>programmable factories</strong> whose instruction sets we can now write from first principles.</p>
          <p>Emily Leproust traced the history from Michelson and Todd's first dinucleotide synthesis in 1955 through today's massively parallel chip-based synthesis.</p>
        </div>
      ),
      visual: <PhosphoramiditeVisual />
    },
    {
      id: 'chemistry',
      content: (
        <div>
          <h2>Phosphoramidite Chemistry</h2>
          <p>Nearly all commercial DNA synthesis uses <strong>phosphoramidite chemistry</strong> on a solid support. The synthesis cycle has four steps:</p>
          <ol className="list-decimal pl-5 space-y-2 mt-4 text-slate-600 dark:text-slate-300">
            <li><strong>Deprotection:</strong> Remove the 5'-DMT protecting group with acid.</li>
            <li><strong>Coupling:</strong> Activate and attach the next nucleotide. 98-99.5% efficiency.</li>
            <li><strong>Capping:</strong> Block unreacted sites to prevent deletions.</li>
            <li><strong>Oxidation:</strong> Stabilize the phosphite to phosphate triester.</li>
          </ol>
        </div>
      ),
      visual: <ChipVsColumnVisual />
    },
    {
      id: 'assembly',
      content: (
        <div>
          <h2>Gene Assembly & Error Correction</h2>
          <p>Since we can only synthesize short oligos (~200-300 nt) efficiently, genes are built by assembling overlapping fragments.</p>
          <p><strong>Gibson Assembly</strong> is the gold standard: T5 exonuclease creates sticky ends, oligos anneal, Phusion polymerase fills gaps, and Taq ligase seals them.</p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 mt-4">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Chemical synthesis error rate: ~1:100. Biological replication: ~1:1,000,000. Error correction with MutS is vital.
            </p>
          </div>
        </div>
      ),
      visual: <GibsonVisual />
    },
  ];

  return (
    <ModulePage section={sectionData}>
      <SplitScreen items={items} />
    </ModulePage>
  );
}
