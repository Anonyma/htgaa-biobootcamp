import { ModulePage } from '../components/ModulePage';
import { SplitScreen } from '../components/SplitScreen';
import { content } from '../data/content';
import { CentralDogmaSim } from '../components/simulations/CentralDogmaSim';
import { CassetteBuilder } from '../components/simulations/CassetteBuilder';
import { motion } from 'framer-motion';

function DogmaFlowVisual() {
  const steps = [
    { label: 'DNA', icon: '🧬', color: 'bg-blue-600' },
    { label: 'mRNA', icon: '📝', color: 'bg-orange-600' },
    { label: 'Protein', icon: '🔬', color: 'bg-purple-600' },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
      <h3 className="text-lg font-bold text-indigo-400">The Central Dogma</h3>
      <div className="flex items-center gap-3">
        {steps.map((s, i) => (
          <motion.div key={s.label} className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.3 }}
              className={`${s.color} w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1`}
            >
              <span className="text-xl">{s.icon}</span>
              <span className="text-[10px] font-bold text-white">{s.label}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.3 + 0.2 }}
                className="text-slate-400"
              >
                <span className="text-lg">→</span>
                <p className="text-[9px] text-slate-500 -mt-1">
                  {i === 0 ? 'Transcription' : 'Translation'}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500 text-center max-w-xs mt-4">
        DNA → RNA (by RNA Polymerase) → Protein (by Ribosomes)
      </p>
    </div>
  );
}

function CassetteVisual() {
  const parts = [
    { name: 'Promoter', color: 'bg-orange-500', icon: '→' },
    { name: 'RBS', color: 'bg-yellow-400', icon: '●' },
    { name: 'CDS', color: 'bg-green-500', icon: '★' },
    { name: 'Terminator', color: 'bg-red-800', icon: '⊤' },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h3 className="text-lg font-bold text-green-400">Expression Cassette</h3>
      <div className="flex items-center gap-1">
        {parts.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className={`${p.color} px-3 py-2 rounded-lg text-white text-xs font-semibold flex items-center gap-1`}
          >
            <span>{p.icon}</span>
            <span>{p.name}</span>
          </motion.div>
        ))}
      </div>
      <div className="space-y-1 text-[10px] text-slate-400 max-w-xs">
        <p><strong className="text-orange-400">Promoter:</strong> Recruits RNA Polymerase</p>
        <p><strong className="text-yellow-300">RBS:</strong> Positions ribosome at start codon</p>
        <p><strong className="text-green-400">CDS:</strong> Encodes your protein</p>
        <p><strong className="text-red-400">Terminator:</strong> Stops transcription</p>
      </div>
    </div>
  );
}

export function CentralDogmaPage() {
  const sectionData = content.sections.find(s => s.id === 'central-dogma');
  if (!sectionData) return <div>Data not found</div>;

  const items = [
    {
      id: 'dogma',
      content: (
        <div>
          <h2>Information Flow in Biology</h2>
          <p>The <strong>central dogma</strong>, articulated by Francis Crick in 1958, describes genetic information flow: <strong>DNA → RNA → Protein</strong>.</p>
          <p><strong>Transcription</strong> by RNA polymerase copies DNA to mRNA. <strong>Translation</strong> by ribosomes decodes mRNA into a polypeptide chain, reading three nucleotides (one codon) at a time.</p>
        </div>
      ),
      visual: <DogmaFlowVisual />
    },
    {
      id: 'cassette',
      content: (
        <div>
          <h2>Building an Expression Cassette</h2>
          <p>A functional expression cassette needs four elements:</p>
          <ol className="list-decimal pl-5 space-y-2 mt-4 text-slate-600 dark:text-slate-300">
            <li><strong>Promoter:</strong> Recruits RNA polymerase to initiate transcription.</li>
            <li><strong>RBS:</strong> Positions the ribosome for translation at AUG.</li>
            <li><strong>CDS:</strong> The open reading frame encoding your protein.</li>
            <li><strong>Terminator:</strong> Signals RNA polymerase to stop.</li>
          </ol>
        </div>
      ),
      visual: <CassetteVisual />
    },
  ];

  return (
    <ModulePage section={sectionData}>
      <SplitScreen items={items} />

      {/* Interactive Simulations */}
      <section className="mt-16 space-y-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Central Dogma Animation</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Step through transcription and translation. Watch DNA become mRNA become protein.
          </p>
          <CentralDogmaSim />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Expression Cassette Builder</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Drag and drop genetic parts to build a functional expression cassette. The validator checks for common assembly errors.
          </p>
          <CassetteBuilder />
        </div>
      </section>
    </ModulePage>
  );
}
