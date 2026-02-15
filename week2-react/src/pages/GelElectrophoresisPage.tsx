import { ModulePage } from '../components/ModulePage';
import { SplitScreen } from '../components/SplitScreen';
import { content } from '../data/content';
import { RestrictionSim } from '../components/simulations/RestrictionSim';
import { GelSim } from '../components/simulations/GelSim';
import { motion } from 'framer-motion';

function GelPrincipleVisual() {
  const fragments = [
    { size: '10 kb', y: 15, opacity: 0.9 },
    { size: '5 kb', y: 30, opacity: 0.85 },
    { size: '3 kb', y: 45, opacity: 0.8 },
    { size: '1 kb', y: 65, opacity: 0.7 },
    { size: '500 bp', y: 80, opacity: 0.6 },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h3 className="text-lg font-bold text-amber-400">Gel Electrophoresis</h3>
      <div className="relative w-40 h-64 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg border border-slate-600 overflow-hidden">
        {/* Cathode (-) */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-red-900/50 flex items-center justify-center">
          <span className="text-[9px] text-red-400 font-bold">(-) Cathode</span>
        </div>
        {/* Wells */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-12 h-2 bg-slate-700 rounded-sm" />
        {/* Bands */}
        {fragments.map((f, i) => (
          <motion.div
            key={f.size}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: `${f.y}%` }}
          >
            <div
              className="w-12 h-1.5 bg-green-400 rounded-sm shadow-[0_0_6px_rgba(0,255,180,0.5)]"
              style={{ opacity: f.opacity }}
            />
            <span className="absolute -right-14 top-0 text-[9px] text-green-300/70">{f.size}</span>
          </motion.div>
        ))}
        {/* Anode (+) */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-blue-900/50 flex items-center justify-center">
          <span className="text-[9px] text-blue-400 font-bold">(+) Anode</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 text-center max-w-xs">
        Smaller fragments migrate faster through the agarose matrix. DNA is negatively charged (phosphate backbone).
      </p>
    </div>
  );
}

function RestrictionEnzymeVisual() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h3 className="text-lg font-bold text-red-400">Restriction Enzymes</h3>
      <div className="space-y-2 w-full max-w-sm">
        {[
          { name: 'EcoRI', seq: "5'-G↓AATTC-3'", type: "5' sticky", color: 'border-blue-500' },
          { name: 'EcoRV', seq: "5'-GAT↓ATC-3'", type: 'Blunt', color: 'border-green-500' },
          { name: 'KpnI', seq: "5'-GGTAC↓C-3'", type: "3' sticky", color: 'border-amber-500' },
        ].map((e, i) => (
          <motion.div
            key={e.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`p-3 bg-slate-800/50 rounded-lg border-l-4 ${e.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{e.name}</span>
              <span className="text-[10px] text-slate-400 bg-slate-700 px-2 py-0.5 rounded">{e.type}</span>
            </div>
            <p className="text-xs font-mono text-slate-300 mt-1">{e.seq}</p>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">Palindromic recognition sequences, 4-8 bp</p>
    </div>
  );
}

export function GelElectrophoresisPage() {
  const sectionData = content.sections.find(s => s.id === 'gel-electrophoresis');
  if (!sectionData) return <div>Data not found</div>;

  const items = [
    {
      id: 'gel-principles',
      content: (
        <div>
          <h2>Gel Electrophoresis: Separating DNA by Size</h2>
          <p><strong>Agarose gel electrophoresis</strong> separates DNA fragments by size. DNA is negatively charged (phosphate backbone) and migrates toward the positive electrode.</p>
          <p>The gel acts as a <strong>molecular sieve</strong>: smaller fragments navigate pores faster. Agarose concentration determines resolution range.</p>
        </div>
      ),
      visual: <GelPrincipleVisual />
    },
    {
      id: 'restriction',
      content: (
        <div>
          <h2>Restriction Enzymes: Molecular Scissors</h2>
          <p><strong>Restriction enzymes</strong> recognize specific palindromic DNA sequences (4-8 bp) and cut the phosphodiester backbone. They evolved as bacterial defense against phages.</p>
          <p>Some produce <strong>sticky ends</strong> (overhangs), useful for cloning. Others produce <strong>blunt ends</strong>.</p>
          <p className="mt-4">Try the interactive restriction enzyme simulator below to visualize cutting and fragment separation.</p>
        </div>
      ),
      visual: <RestrictionEnzymeVisual />
    },
  ];

  return (
    <ModulePage section={sectionData}>
      <SplitScreen items={items} />

      {/* Interactive Simulations */}
      <section className="mt-16 space-y-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Restriction Enzyme Simulator</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Enter a DNA sequence and select an enzyme to find recognition sites and simulate cutting.
          </p>
          <RestrictionSim />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Gel Electrophoresis Simulator</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Add DNA fragment sizes, adjust voltage and gel percentage, then run the gel to see band migration.
          </p>
          <GelSim />
        </div>
      </section>
    </ModulePage>
  );
}
