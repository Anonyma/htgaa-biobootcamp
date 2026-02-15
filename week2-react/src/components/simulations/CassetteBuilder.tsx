import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Eye, EyeOff, X } from 'lucide-react';

interface Part {
  id: string;
  name: string;
  color: string;
  icon: string;
  seq: string;
  uid?: string;
}

const PARTS: Part[] = [
  { id: 'promoter', name: 'Promoter (BBa_J23106)', color: 'bg-orange-500', icon: '→', seq: 'TTTACGGCTAGCTCAGTCCTAGGTATAGTGCTAGC' },
  { id: 'rbs', name: 'RBS (BBa_B0034)', color: 'bg-yellow-400', icon: '●', seq: 'CATTAAAGAGGAGAAAGGTACC' },
  { id: 'start', name: 'Start Codon', color: 'bg-lime-400', icon: '[', seq: 'ATG' },
  { id: 'sfgfp', name: 'sfGFP (reporter)', color: 'bg-green-500', icon: '★', seq: 'ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGG' },
  { id: 'mcherry', name: 'mCherry (reporter)', color: 'bg-red-500', icon: '★', seq: 'ATGGTGAGCAAGGGCGAGGAGGATAACATGGCCATCATCAAGGAGTTCA' },
  { id: 'lacz', name: 'LacZ (reporter)', color: 'bg-blue-500', icon: '★', seq: 'ATGACCATGATTACGCCAAGCTATTTAGGTGACACTATAGAATACTCAAG' },
  { id: 'histag', name: 'His Tag (7x)', color: 'bg-purple-500', icon: '⚑', seq: 'CATCACCATCACCATCATCAC' },
  { id: 'stop', name: 'Stop Codon', color: 'bg-gray-500', icon: ']', seq: 'TAA' },
  { id: 'terminator', name: 'Terminator (BBa_B0015)', color: 'bg-red-800', icon: '⊤', seq: 'CCAGGCATCAAATAAAACGAAAGGCTCAGTCGAAAGACTGGGCCTTTCGTTTTATCTGTTGTTTGTCGGTGAACGCTCTCTACTAGAGTCACACTGGCTCACCTTCGGGTGGGCCTTTCTGCGTTTATA' },
];

const CDS_IDS = ['sfgfp', 'mcherry', 'lacz'];

function validate(construct: Part[]): string[] {
  if (construct.length === 0) return [];
  const warnings: string[] = [];
  const ids = construct.map(p => p.id);

  if (!ids.includes('promoter')) warnings.push('No promoter in construct');
  if (!ids.includes('terminator')) warnings.push('No terminator in construct');
  if (ids.includes('terminator') && ids.lastIndexOf('terminator') !== ids.length - 1)
    warnings.push('Terminator is not at the end');

  const firstCDS = ids.findIndex(id => CDS_IDS.includes(id));
  if (firstCDS !== -1) {
    const beforeCDS = ids.slice(0, firstCDS);
    if (!beforeCDS.includes('rbs')) warnings.push('No RBS before coding sequence');
    if (!beforeCDS.includes('start')) warnings.push('No start codon before coding sequence');
  }

  const lastCDS = findLastIndex(ids, id => CDS_IDS.includes(id));
  if (lastCDS !== -1) {
    const afterCDS = ids.slice(lastCDS + 1);
    if (!afterCDS.includes('stop')) warnings.push('No stop codon after coding sequence');
  }

  return warnings;
}

function findLastIndex<T>(arr: T[], fn: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) { if (fn(arr[i])) return i; }
  return -1;
}

export function CassetteBuilder() {
  const [construct, setConstruct] = useState<Part[]>([]);
  const [showSeq, setShowSeq] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragSrcIndex, setDragSrcIndex] = useState<number | null>(null);
  const laneRef = useRef<HTMLDivElement>(null);

  const sequence = construct.map(p => p.seq).join('');
  const warnings = validate(construct);

  function handlePaletteDragStart(e: React.DragEvent, part: Part) {
    setDragSrcIndex(null);
    e.dataTransfer.setData('text/plain', part.id);
    e.dataTransfer.effectAllowed = 'copy';
  }

  function handleConstructDragStart(e: React.DragEvent, index: number) {
    setDragSrcIndex(index);
    e.dataTransfer.setData('text/plain', construct[index].id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function getDropIndex(clientX: number): number {
    if (!laneRef.current) return construct.length;
    const children = Array.from(laneRef.current.children).filter(
      (c) => (c as HTMLElement).draggable
    );
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (clientX < rect.left + rect.width / 2) return i;
    }
    return construct.length;
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropIndex = getDropIndex(e.clientX);

    if (dragSrcIndex !== null) {
      const newConstruct = [...construct];
      const [moved] = newConstruct.splice(dragSrcIndex, 1);
      const insertAt = dropIndex > dragSrcIndex ? dropIndex - 1 : dropIndex;
      newConstruct.splice(insertAt, 0, moved);
      setConstruct(newConstruct);
    } else {
      const partId = e.dataTransfer.getData('text/plain');
      const tpl = PARTS.find(p => p.id === partId);
      if (!tpl) return;
      const newConstruct = [...construct];
      newConstruct.splice(dropIndex, 0, { ...tpl, uid: crypto.randomUUID() });
      setConstruct(newConstruct);
    }
    setDragSrcIndex(null);
  }

  function removePart(index: number) {
    setConstruct(prev => prev.filter((_, i) => i !== index));
  }

  function copySequence() {
    navigator.clipboard.writeText(sequence).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Palette */}
        <div className="lg:w-64 shrink-0">
          <h3 className="text-lg font-bold mb-3">Parts Palette</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {PARTS.map(part => (
              <div
                key={part.id}
                draggable
                onDragStart={e => handlePaletteDragStart(e, part)}
                className={`${part.color} text-white text-sm font-medium rounded-lg px-3 py-2 cursor-grab select-none flex items-center gap-2 hover:brightness-110 transition active:cursor-grabbing`}
              >
                <span className="text-lg leading-none">{part.icon}</span>
                <span className="truncate">{part.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Construct */}
        <div className="flex-1 min-w-0 space-y-4">
          <h3 className="text-lg font-bold">Construct</h3>

          {/* Drop zone */}
          <div
            ref={laneRef}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = dragSrcIndex !== null ? 'move' : 'copy'; }}
            onDrop={handleDrop}
            className="min-h-[72px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3 flex items-center gap-1 overflow-x-auto bg-slate-50 dark:bg-slate-800/50 transition-colors"
          >
            {construct.length === 0 ? (
              <span className="text-slate-400 italic m-auto text-sm">Drag parts here to build your cassette</span>
            ) : (
              construct.map((part, i) => (
                <div key={part.uid || i} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <div className="w-3 h-0.5 bg-slate-400 shrink-0" />}
                  <div
                    draggable
                    onDragStart={e => handleConstructDragStart(e, i)}
                    className={`${part.color} text-white text-xs font-semibold rounded-lg px-3 py-3 cursor-grab select-none flex items-center gap-1.5 relative group shrink-0 hover:brightness-110 active:cursor-grabbing`}
                  >
                    <span className="text-base leading-none">{part.icon}</span>
                    <span className="whitespace-nowrap">{part.name}</span>
                    <button
                      onClick={() => removePart(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 border border-slate-600 rounded-full text-[10px] text-slate-300 hidden group-hover:flex items-center justify-center hover:bg-red-600 hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Validation */}
          <div className={`rounded-xl p-3 text-sm ${
            warnings.length === 0 && construct.length > 0
              ? 'bg-green-50 dark:bg-green-900/20'
              : construct.length === 0
              ? 'bg-slate-50 dark:bg-slate-800/50'
              : 'bg-amber-50 dark:bg-amber-900/20'
          }`}>
            {construct.length === 0 ? (
              <p className="text-slate-400 italic">Add parts to see validation</p>
            ) : warnings.length === 0 ? (
              <p className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Valid expression cassette
              </p>
            ) : (
              warnings.map((w, i) => (
                <p key={i} className="text-amber-600 dark:text-amber-400">⚠ {w}</p>
              ))
            )}
          </div>

          {/* Export */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSeq(!showSeq)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showSeq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSeq ? 'Hide' : 'Show'} Sequence
            </button>
            <button
              onClick={copySequence}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Sequence'}
            </button>
            <span className="text-sm text-slate-500 ml-auto">{sequence.length} bp</span>
          </div>

          <AnimatePresence>
            {showSeq && (
              <motion.pre
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-slate-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto break-all whitespace-pre-wrap font-mono max-h-40 overflow-y-auto"
              >
                {sequence || '(empty)'}
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
