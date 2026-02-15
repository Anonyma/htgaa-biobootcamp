import { ModulePage } from '../components/ModulePage';
import { SplitScreen } from '../components/SplitScreen';
import { content } from '../data/content';
import { DNAHelix } from '../components/visuals/DNAHelix';
import { HistoryTimeline } from '../components/visuals/HistoryTimeline';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';

function DNAScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      <DNAHelix />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
}

function IlluminaVisual() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
      <h3 className="text-lg font-bold text-blue-400">Illumina SBS Cycle</h3>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {['1. Incorporate', '2. Image', '3. Cleave', '4. Repeat'].map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.2 }}
            className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-center"
          >
            <div className="text-2xl mb-1">{['🧬', '📸', '✂️', '🔄'][i]}</div>
            <p className="text-xs text-slate-300">{step}</p>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500 text-center max-w-xs">
        Each cycle adds one fluorescent nucleotide with a reversible terminator, images the cluster, then cleaves the block.
      </p>
    </div>
  );
}

function NanoporeVisual() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <h3 className="text-lg font-bold text-orange-400">Nanopore Sequencing</h3>
      <div className="relative w-48 h-48">
        {/* Membrane */}
        <div className="absolute left-0 right-0 top-1/2 h-3 bg-slate-600 rounded-full" />
        {/* Pore */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-amber-600 rounded-full border-2 border-amber-400" />
        {/* DNA strand going through */}
        <motion.div
          animate={{ y: [0, 80] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center gap-0.5"
        >
          {['A', 'T', 'G', 'C', 'A', 'G', 'T', 'C'].map((base, i) => (
            <span
              key={i}
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                base === 'A' ? 'bg-green-500' : base === 'T' ? 'bg-red-500' : base === 'G' ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
            >
              {base}
            </span>
          ))}
        </motion.div>
      </div>
      <p className="text-xs text-slate-500 text-center max-w-xs">
        DNA passes through a protein pore; each base disrupts ionic current differently, enabling real-time sequencing.
      </p>
    </div>
  );
}

export function SequencingPage() {
  const sectionData = content.sections.find(s => s.id === 'sequencing');
  if (!sectionData) return <div>Data not found</div>;

  const items = [
    {
      id: 'intro',
      content: (
        <div>
          <h2>The Sequencing Revolution</h2>
          <p>DNA sequencing, the ability to <strong>read</strong> the genetic code, has undergone a dramatic transformation since the Sanger method of the 1970s.</p>
          <p>Modern next-generation sequencing (NGS) platforms achieve massively parallel reads at a fraction of the original cost, enabling whole-genome sequencing for under $200.</p>
        </div>
      ),
      visual: <DNAScene />
    },
    {
      id: 'timeline',
      content: (
        <div>
          <h2>A Brief History of Reading DNA</h2>
          <p>From the first painfully slow radioactive gels to today's real-time nanopore sensing, the speed of sequencing has increased 100-million-fold.</p>
          <p>This timeline highlights the major leaps that transformed biology into a data science.</p>
        </div>
      ),
      visual: <HistoryTimeline />
    },
    {
      id: 'illumina',
      content: (
        <div>
          <h2>Short-Read Sequencing (Illumina)</h2>
          <p><strong>Illumina</strong> dominates the short-read market. Library DNA fragments are adapter-ligated, bound to a flow cell surface, and clonally amplified into clusters via bridge amplification.</p>
          <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600 dark:text-slate-300">
            <li><strong>Clonal Amplification:</strong> Creates strong signal clusters.</li>
            <li><strong>Reversible Terminators:</strong> Ensures one base per cycle.</li>
            <li><strong>4-Color Imaging:</strong> Identifies bases A, C, T, G.</li>
          </ul>
        </div>
      ),
      visual: <IlluminaVisual />
    },
    {
      id: 'nanopore',
      content: (
        <div>
          <h2>Long-Read Sequencing (Nanopore)</h2>
          <p><strong>Oxford Nanopore</strong> threads native DNA or RNA through an engineered protein pore. As bases pass through the pore, they block the ionic current in a characteristic pattern.</p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mt-4">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Key Advantage: Ultra-long reads (&gt;100 kb) and direct detection of modifications.
            </p>
          </div>
        </div>
      ),
      visual: <NanoporeVisual />
    }
  ];

  return (
    <ModulePage section={sectionData}>
      <SplitScreen items={items} />
    </ModulePage>
  );
}
