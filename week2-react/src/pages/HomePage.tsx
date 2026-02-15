import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ScanSearch, PenTool, Scissors, Dna, FlaskConical, ArrowRightLeft, CheckCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ProgressRing } from '../components/ProgressRing';
import { useProgress } from '../hooks/useProgress';
import { content } from '../data/content';

const ICON_MAP: Record<string, React.ElementType> = {
  'scan-search': ScanSearch,
  'pen-tool': PenTool,
  'scissors': Scissors,
  'dna': Dna,
  'flask-conical': FlaskConical,
  'arrow-right-left': ArrowRightLeft,
};

const COLOR_MAP: Record<string, { bg: string; text: string; hover: string }> = {
  'scan-search':    { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:border-blue-400 dark:hover:border-blue-500' },
  'pen-tool':       { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', hover: 'hover:border-green-400 dark:hover:border-green-500' },
  'scissors':       { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', hover: 'hover:border-red-400 dark:hover:border-red-500' },
  'dna':            { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:border-purple-400 dark:hover:border-purple-500' },
  'flask-conical':  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', hover: 'hover:border-amber-400 dark:hover:border-amber-500' },
  'arrow-right-left': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:border-indigo-400 dark:hover:border-indigo-500' },
};

const ROUTE_MAP: Record<string, string> = {
  'sequencing': '/sequencing',
  'synthesis': '/synthesis',
  'editing': '/editing',
  'genetic-codes': '/genetic-codes',
  'gel-electrophoresis': '/gel-electrophoresis',
  'central-dogma': '/central-dogma',
};

export function HomePage() {
  const navigate = useNavigate();
  const { overallPercent, isCompleted } = useProgress();

  return (
    <Layout>
      {/* Hero */}
      <section className="mb-16 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Bio-Bootcamp Week 2
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Reading, Writing, & <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Editing Life
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Master the fundamental tools of synthetic biology: sequencing genomes, synthesizing DNA, and editing the code of life with CRISPR.
          </p>

          <div className="flex items-center justify-center gap-6 pt-4">
            <button
              onClick={() => navigate('/sequencing')}
              className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Start Learning <ArrowRight className="w-4 h-4" />
            </button>
            <ProgressRing percent={overallPercent} size={56} strokeWidth={5} />
          </div>
        </motion.div>
      </section>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {content.sections.map((section, idx) => {
          const Icon = ICON_MAP[section.icon] || Dna;
          const colors = COLOR_MAP[section.icon] || COLOR_MAP['dna'];
          const completed = isCompleted(section.id);
          const route = ROUTE_MAP[section.id] || '/';

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => navigate(route)}
              className={`group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${colors.hover}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  {completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {section.title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {section.keyPoints[0]}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs text-slate-400">{section.vocabulary.length} vocab &middot; {section.quizQuestions.length} quiz</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lecturers */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <h2 className="font-bold text-lg mb-4">Lecturers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold">George Church</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Reading & Writing Life — Genetic codes, sequencing, expanded alphabets, CRISPR, MAGE, genome recoding</p>
          </div>
          <div>
            <h3 className="font-semibold">Joe Jacobson</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gene Synthesis — Phosphoramidite chemistry, chip-based synthesis, error correction, Gibson assembly</p>
          </div>
          <div>
            <h3 className="font-semibold">Emily Leproust</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">DNA Synthesis Development — History of chemical synthesis, Twist Bioscience platform, oligo pools</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-slate-400 py-6">
        HTGAA Spring 2026 — How to Grow (Almost) Anything — MIT MAS.885
      </div>
    </Layout>
  );
}
