import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const LADDER = [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 750, 500, 250];
const SVG_W = 600, SVG_H = 400;
const WELL_Y = 30, WELL_H = 8;
const GEL_TOP = WELL_Y + WELL_H + 4;
const GEL_BOTTOM = SVG_H - 20;
const MAX_LANES = 8;
const LANE_PAD = 50;

interface Lane {
  sizes: number[];
  label: string;
}

function bandY(bp: number, voltage: number, gelPct: number, runTime: number): number {
  const migrationFactor = (voltage / 100) * (runTime / 30);
  const logMax = Math.log10(15000);
  const logMin = Math.log10(100);
  const logBp = Math.log10(Math.max(bp, 100));
  let norm = (logMax - logBp) / (logMax - logMin);
  norm = Math.pow(norm, 1 / gelPct);
  const range = (GEL_BOTTOM - GEL_TOP) * Math.min(migrationFactor, 1.4);
  return GEL_TOP + norm * range;
}

function bandOpacity(bp: number): number {
  return 0.55 + 0.45 * Math.min(bp / 10000, 1);
}

export function GelSim() {
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [voltage, setVoltage] = useState(100);
  const [gelPct, setGelPct] = useState(1.0);
  const [runTime, setRunTime] = useState(30);
  const [running, setRunning] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const totalLanes = 1 + lanes.length; // lane 0 is always ladder

  const laneX = useCallback((i: number) => {
    const usable = SVG_W - LANE_PAD - 20;
    const w = usable / totalLanes;
    return LANE_PAD + w * i + w / 2;
  }, [totalLanes]);

  const bw = useCallback(() => {
    const usable = SVG_W - LANE_PAD - 20;
    return Math.min((usable / totalLanes) * 0.6, 50);
  }, [totalLanes]);

  function addLane() {
    if (lanes.length >= MAX_LANES - 1) return;
    const raw = sizeInput.trim();
    if (!raw) return;
    const sizes = raw.split(/[,\s]+/).map(Number).filter(n => n > 0);
    if (!sizes.length) return;
    setLanes(prev => [...prev, { sizes, label: `Lane ${prev.length + 2}` }]);
    setSizeInput('');
  }

  function runGel() {
    setRunning(true);
  }

  function resetGel() {
    setRunning(false);
    setLanes([]);
  }

  const allLanes: Lane[] = [{ sizes: LADDER, label: 'Ladder' }, ...lanes];
  const w = bw();
  const dur = runTime * 40; // animation ms

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Fragment sizes (bp)</label>
          <input
            type="text"
            value={sizeInput}
            onChange={e => setSizeInput(e.target.value)}
            placeholder="23130, 9416, 6557, 4361, 2322, 2027"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && addLane()}
          />
        </div>
        <button onClick={addLane} className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Add Lane
        </button>
      </div>

      {/* Parameters */}
      <div className="flex flex-wrap gap-4 items-center text-sm">
        <div className="flex items-center gap-2">
          <label className="text-slate-500">Voltage:</label>
          <input type="range" min={50} max={150} value={voltage} onChange={e => setVoltage(+e.target.value)} className="w-20" />
          <span className="text-slate-600 dark:text-slate-300 w-10">{voltage}V</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-500">Gel %:</label>
          <select value={gelPct} onChange={e => setGelPct(+e.target.value)} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm">
            {[0.8, 1.0, 1.5, 2.0].map(v => <option key={v} value={v}>{v}%</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-500">Time:</label>
          <input type="range" min={10} max={60} value={runTime} onChange={e => setRunTime(+e.target.value)} className="w-20" />
          <span className="text-slate-600 dark:text-slate-300 w-14">{runTime} min</span>
        </div>
        <button onClick={runGel} disabled={running} className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40">
          Run Gel
        </button>
        <button onClick={resetGel} className="px-4 py-1.5 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-500 transition-colors">
          Reset
        </button>
      </div>

      {/* Lane list */}
      <p className="text-xs text-slate-500">
        {lanes.length === 0
          ? 'Lane 1 is always the 1kb ladder. Add sample lanes above.'
          : `Lanes: 1=Ladder, ${lanes.map((l, i) => `${i + 2}=[${l.sizes.join(', ')}]`).join(', ')}`
        }
      </p>

      {/* Gel SVG */}
      <div className="relative overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="block mx-auto" style={{ borderRadius: 8 }}>
          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="#0a1628" rx={8} />

          {/* Wells */}
          {Array.from({ length: totalLanes }).map((_, i) => (
            <rect
              key={`well-${i}`}
              x={laneX(i) - w / 2}
              y={WELL_Y}
              width={w}
              height={WELL_H}
              fill="#18293f"
              stroke="#3a5a7a"
              strokeWidth={0.5}
            />
          ))}

          {/* Bands */}
          {running && allLanes.map((lane, li) =>
            lane.sizes.map((bp, bi) => {
              const finalY = bandY(bp, voltage, gelPct, runTime);
              if (finalY < GEL_TOP || finalY > GEL_BOTTOM + 10) return null;
              const cx = laneX(li);
              return (
                <motion.rect
                  key={`band-${li}-${bi}`}
                  x={cx - w / 2}
                  initial={{ y: WELL_Y + WELL_H, opacity: 0, height: 3 }}
                  animate={{ y: finalY - 1.5, opacity: bandOpacity(bp), height: 3 }}
                  transition={{ duration: dur / 1000, ease: 'easeOut' }}
                  width={w}
                  rx={1}
                  fill="#00ffb0"
                  filter="url(#gel-glow)"
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 24, text: `~${bp} bp` });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })
          )}

          {/* Ruler labels */}
          {running && LADDER.map(bp => {
            const y = bandY(bp, voltage, gelPct, runTime);
            if (y < GEL_TOP || y > GEL_BOTTOM) return null;
            return (
              <motion.text
                key={`ruler-${bp}`}
                x={LANE_PAD - 8}
                y={y + 3}
                textAnchor="end"
                fill="#7fffcf"
                fontSize={9}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: dur / 1000 + 0.1 }}
              >
                {bp >= 1000 ? `${bp / 1000}kb` : bp}
              </motion.text>
            );
          })}

          {/* Glow filter */}
          <defs>
            <filter id="gel-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-black/85 text-green-300 px-2 py-1 rounded text-xs pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
