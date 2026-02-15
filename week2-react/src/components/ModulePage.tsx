import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from './Layout';
import { Quiz } from './Quiz';
import { VocabSection } from './VocabTooltip';
import { useProgress } from '../hooks/useProgress';
import type { Section } from '../data/content';

interface ModulePageProps {
  section: Section;
  children: React.ReactNode;
}

export function ModulePage({ section, children }: ModulePageProps) {
  const navigate = useNavigate();
  const { markVisited, markQuizCompleted, isCompleted, getScore } = useProgress();

  useEffect(() => {
    markVisited(section.id);
  }, [section.id, markVisited]);

  const completed = isCompleted(section.id);
  const score = getScore(section.id);

  return (
    <Layout>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Overview
      </button>

      <header className="mb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-3"
        >
          {section.title}
          {completed && (
            <CheckCircle className="inline-block w-7 h-7 text-green-500 ml-3 -mt-1" />
          )}
        </motion.h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {section.keyPoints[0]}
        </p>
        {completed && score !== undefined && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            Quiz completed with {score}% score
          </p>
        )}
      </header>

      {/* Main scrollytelling content */}
      {children}

      {/* Key Concepts */}
      <section className="mt-16 mb-8">
        <h2 className="text-2xl font-bold mb-6">Key Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.keyPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{point}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vocabulary */}
      <section className="mb-8">
        <VocabSection vocabulary={section.vocabulary} />
      </section>

      {/* Quiz */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Test Your Knowledge</h2>
        <Quiz
          questions={section.quizQuestions}
          moduleId={section.id}
          onComplete={(score) => markQuizCompleted(section.id, score)}
        />
      </section>
    </Layout>
  );
}
