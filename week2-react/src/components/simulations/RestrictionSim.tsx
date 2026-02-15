import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { enzymes, LAMBDA_EXCERPT, type Enzyme } from '../../data/enzymes';

const COMPLEMENT: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
const FRAG_COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
  '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'];

function cleanSeq(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[^ATGC]/g, '');
  return s.length > 0 ? s : null;
}

function complement(seq: string): string {
  return seq.split('').map(b => COMPLEMENT[b] || 'N').join('');
}

interface Fragment {
  sense: string;
  size: number;
  color: string;
}

export function RestrictionSim() {
  const [seqInput, setSeqInput] = useState('');
  const [selectedEnzyme, setSelectedEnzyme] = useState<Enzyme | null>(null);
  const [cutSites, setCutSites] = useState<number[]>([]);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [showCut, setShowCut] = useState(false);
  const [message, setMessage] = useState('');

  const seq = useMemo(() => cleanSeq(seqInput), [seqInput]);

  function findSites() {
    if (!seq) { setMessage('Enter a valid DNA sequence (A, T, G, C only).'); return; }
    if (!selectedEnzyme) { setMessage('Select a restriction enzyme first.'); return; }

    const rec = selectedEnzyme.recognition;
    const sites: number[] = [];
    let i = seq.indexOf(rec);
    while (i !== -1) {
      sites.push(i);
      i = seq.indexOf(rec, i + 1);
    }
    setCutSites(sites);
    setShowCut(false);
    setFragments([]);

    if (sites.length === 0) {
      setMessage(`No ${selectedEnzyme.name} sites found in this sequence.`);
    } else {
      setMessage(`Found ${sites.length} ${selectedEnzyme.name} site(s). Press Cut! to digest.`);
    }
  }

  function doCut() {
    if (!seq || !selectedEnzyme || cutSites.length === 0) return;

    const senseCuts = cutSites.map(s => s + selectedEnzyme.cutSense).sort((a, b) => a - b);
    const boundaries = [0, ...senseCuts, seq.length];
    const frags: Fragment[] = [];
    for (let i = 0; i < boundaries.length - 1; i++) {
      const start = boundaries[i];
      const end = boundaries[i + 1];
      frags.push({
        sense: seq.slice(start, end),
        size: end - start,
        color: FRAG_COLORS[i % FRAG_COLORS.length],
      });
    }
    setFragments(frags);
    setShowCut(true);

    const overhangLabel = selectedEnzyme.overhang === 'blunt' ? 'Blunt ends'
      : selectedEnzyme.overhang === 'sticky-5prime' ? "5' sticky ends"
      : "3' sticky ends";
    setMessage(`${selectedEnzyme.name} digest: ${cutSites.length} cut(s), ${frags.length} fragments, ${overhangLabel}`);
  }

  const recLen = selectedEnzyme?.recognition.length || 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">DNA Sequence</label>
          <textarea
            value={seqInput}
            onChange={e => setSeqInput(e.target.value)}
            placeholder="Paste a DNA sequence (A/T/G/C only)..."
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSeqInput(LAMBDA_EXCERPT)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Load Lambda
          </button>
          <select
            value={selectedEnzyme?.name || ''}
            onChange={e => setSelectedEnzyme(enzymes.find(x => x.name === e.target.value) || null)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
          >
            <option value="">Select enzyme</option>
            {enzymes.map(e => (
              <option key={e.name} value={e.name}>{e.name} ({e.recognition})</option>
            ))}
          </select>
          <button
            onClick={findSites}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find Sites
          </button>
          <button
            onClick={doCut}
            disabled={cutSites.length === 0}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cut!
          </button>
        </div>
      </div>

      {/* Enzyme info */}
      {selectedEnzyme && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {selectedEnzyme.name}: {selectedEnzyme.recognition} | {selectedEnzyme.overhang.replace('-', ' ')} | {selectedEnzyme.temperature}°C | {selectedEnzyme.notes}
        </div>
      )}

      {/* Sequence display with highlights */}
      {seq && selectedEnzyme && cutSites.length > 0 && (
        <div className="overflow-x-auto">
          <pre className="text-xs font-mono leading-relaxed p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="text-slate-400">5' </span>
            {seq.split('').map((base, i) => {
              const inSite = cutSites.some(s => i >= s && i < s + recLen);
              return (
                <span key={i} className={inSite ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 font-bold' : ''}>
                  {base}
                </span>
              );
            })}
            <span className="text-slate-400"> 3'</span>
            {'\n'}
            <span className="text-slate-400">   </span>
            {seq.split('').map((_, i) => {
              const inSite = cutSites.some(s => i >= s && i < s + recLen);
              return <span key={i} className={inSite ? 'text-yellow-500' : 'text-slate-400'}>|</span>;
            })}
            {'\n'}
            <span className="text-slate-400">3' </span>
            {complement(seq).split('').map((base, i) => {
              const inSite = cutSites.some(s => i >= s && i < s + recLen);
              return (
                <span key={i} className={inSite ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 font-bold' : ''}>
                  {base}
                </span>
              );
            })}
            <span className="text-slate-400"> 5'</span>
          </pre>
        </div>
      )}

      {/* Fragment animation */}
      <AnimatePresence>
        {showCut && fragments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-x-auto"
          >
            <svg width="100%" height="100" viewBox={`0 0 ${Math.max(600, fragments.length * 120)} 100`} className="block">
              {fragments.map((frag, i) => {
                const totalBp = fragments.reduce((s, f) => s + f.size, 0);
                const gap = 20;
                const availW = Math.max(560, fragments.length * 100);
                const scale = (availW - gap * (fragments.length - 1)) / totalBp;
                let x = 20;
                for (let j = 0; j < i; j++) x += fragments[j].size * scale + gap;
                const w = frag.size * scale;
                return (
                  <motion.g
                    key={i}
                    initial={{ x: x - gap * i, opacity: 0.5 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                  >
                    <rect x={x} y={15} width={w} height={40} rx={4} fill={frag.color} opacity={0.85} />
                    <text x={x + w / 2} y={35} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold" fontFamily="monospace">
                      {frag.sense.length <= Math.floor(w / 7) ? frag.sense : frag.sense.slice(0, Math.max(3, Math.floor(w / 7) - 2)) + '..'}
                    </text>
                    <text x={x + w / 2} y={72} textAnchor="middle" fill="currentColor" fontSize={11} className="text-slate-600 dark:text-slate-300">
                      {frag.size} bp
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {message && (
        <div className="text-sm text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          {message}
          {showCut && fragments.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              Fragment sizes (bp): {fragments.map(f => f.size).sort((a, b) => b - a).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
