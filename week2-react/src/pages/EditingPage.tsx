import { ModulePage } from '../components/ModulePage';
import { SplitScreen } from '../components/SplitScreen';
import { content } from '../data/content';
import { motion } from 'framer-motion';

function CRISPRVisual() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h3 className="text-lg font-bold text-red-400">CRISPR-Cas9</h3>
      <div className="relative w-64 h-40">
        {/* DNA double strand */}
        <div className="absolute top-1/2 left-0 right-0 flex items-center">
          <div className="flex-1 h-1 bg-blue-400 rounded" />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-1"
          >
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-red-300">
              Cas9
            </div>
          </motion.div>
          <div className="flex-1 h-1 bg-blue-400 rounded" />
        </div>
        {/* Guide RNA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2"
        >
          <div className="px-2 py-1 bg-orange-500/80 rounded text-[9px] text-white font-mono">
            gRNA: AUGCAUGCAUGCAUGCAUGC
          </div>
          <div className="w-px h-4 bg-orange-400 mx-auto" />
        </motion.div>
        {/* PAM */}
        <div className="absolute bottom-4 left-1/2 translate-x-4">
          <span className="text-[10px] text-green-400 font-bold">NGG (PAM)</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 text-center max-w-xs">
        The guide RNA directs Cas9 to cut at a specific 20-nt target adjacent to the PAM sequence.
      </p>
    </div>
  );
}

function RNPScaffoldVisual() {
  const tools = [
    { name: 'CRISPRa', desc: 'Activation', color: 'bg-green-600' },
    { name: 'CRISPRi', desc: 'Repression', color: 'bg-red-600' },
    { name: 'Base Edit', desc: 'C>T or A>G', color: 'bg-blue-600' },
    { name: 'Prime Edit', desc: 'Search & replace', color: 'bg-purple-600' },
    { name: 'PASTE', desc: 'Large insertions', color: 'bg-amber-600' },
    { name: 'Epigenetic', desc: 'Methylation', color: 'bg-teal-600' },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h3 className="text-lg font-bold text-purple-400">The RNP Scaffold Toolkit</h3>
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {tools.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`${t.color} rounded-lg p-2 text-center`}
          >
            <p className="text-xs font-bold text-white">{t.name}</p>
            <p className="text-[10px] text-white/70">{t.desc}</p>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500 text-center max-w-xs mt-2">
        Same RNA-guided targeting, different enzymatic effectors.
      </p>
    </div>
  );
}

function BaseEditVisual() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h3 className="text-lg font-bold text-blue-400">Base & Prime Editing</h3>
      <div className="space-y-4 w-full max-w-xs">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-blue-700">
          <p className="text-sm font-bold text-blue-300">Cytosine Base Editor (CBE)</p>
          <div className="flex items-center gap-2 mt-2 font-mono text-sm">
            <span className="text-slate-400">C-G</span>
            <span className="text-yellow-400">→</span>
            <span className="text-green-400">T-A</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Deaminase converts C to U, read as T</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-green-700">
          <p className="text-sm font-bold text-green-300">Adenine Base Editor (ABE)</p>
          <div className="flex items-center gap-2 mt-2 font-mono text-sm">
            <span className="text-slate-400">A-T</span>
            <span className="text-yellow-400">→</span>
            <span className="text-green-400">G-C</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Evolved deoxyadenosine deaminase</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-purple-700">
          <p className="text-sm font-bold text-purple-300">Prime Editing</p>
          <p className="text-[10px] text-slate-500 mt-1">All 12 point mutations + small indels. No DSBs needed.</p>
        </div>
      </div>
    </div>
  );
}

export function EditingPage() {
  const sectionData = content.sections.find(s => s.id === 'editing');
  if (!sectionData) return <div>Data not found</div>;

  const items = [
    {
      id: 'crispr',
      content: (
        <div>
          <h2>CRISPR: Programmable Molecular Scissors</h2>
          <p>The CRISPR-Cas9 system has revolutionized genome editing since 2012. At its core, it's an <strong>RNA-guided nuclease</strong>: the Cas9 protein is directed to a specific 20-nucleotide target by a guide RNA (gRNA).</p>
          <p>The only requirement is adjacency to a <strong>PAM sequence</strong> (5'-NGG-3'). Upon binding, Cas9 creates a double-strand break, repaired by NHEJ or HDR.</p>
        </div>
      ),
      visual: <CRISPRVisual />
    },
    {
      id: 'scaffold',
      content: (
        <div>
          <h2>CRISPR as an RNP Scaffold</h2>
          <p>Church's lecture emphasized a powerful framework: CRISPR is fundamentally a <strong>ribonucleoprotein (RNP) scaffold</strong>. The guide RNA provides programmable targeting while the protein provides enzymatic function.</p>
          <p>By modifying the enzymatic domain, researchers have built an entire toolkit: CRISPRa, CRISPRi, base editors, prime editors, epigenetic modifiers, and PASTE.</p>
        </div>
      ),
      visual: <RNPScaffoldVisual />
    },
    {
      id: 'precision',
      content: (
        <div>
          <h2>Precision Editing: Beyond Cutting</h2>
          <p><strong>Base editors</strong> avoid double-strand breaks entirely. CBE converts C-G to T-A; ABE converts A-T to G-C. Perfect for correcting point mutations.</p>
          <p><strong>Prime editing</strong> is even more versatile — a Cas9 nickase fused to reverse transcriptase, guided by a pegRNA that specifies both target and edit. True "search-and-replace" for the genome.</p>
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mt-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              PASTE can insert up to ~36 kb payloads at specific sites using a CRISPR-integrase fusion.
            </p>
          </div>
        </div>
      ),
      visual: <BaseEditVisual />
    },
  ];

  return (
    <ModulePage section={sectionData}>
      <SplitScreen items={items} />
    </ModulePage>
  );
}
