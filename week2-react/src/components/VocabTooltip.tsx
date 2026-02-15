import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import type { VocabularyItem } from '../data/content';

interface VocabTooltipProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

export function VocabTooltip({ term, definition, children }: VocabTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b-2 border-dotted border-blue-400 dark:border-blue-500 cursor-help text-blue-700 dark:text-blue-300 font-medium">
        {children || term}
      </span>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm rounded-xl shadow-xl border border-slate-700 dark:border-slate-300"
          >
            <p className="font-semibold text-blue-300 dark:text-blue-600 mb-1">{term}</p>
            <p className="leading-relaxed text-slate-200 dark:text-slate-700 text-xs">{definition}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 dark:bg-slate-100 rotate-45 -mt-1.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

interface VocabSectionProps {
  vocabulary: VocabularyItem[];
}

export function VocabSection({ vocabulary }: VocabSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full text-left"
      >
        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-bold">Vocabulary ({vocabulary.length} terms)</h3>
        <span className="ml-auto text-slate-400 text-sm">{expanded ? 'Hide' : 'Show'}</span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {vocabulary.map((v, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">{v.term}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{v.definition}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
