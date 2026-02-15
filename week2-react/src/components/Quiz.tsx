import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import type { QuizQuestion } from '../data/content';

interface QuizProps {
  questions: QuizQuestion[];
  moduleId?: string;
  onComplete?: (score: number) => void;
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === q.correctIndex;
    setScores(prev => [...prev, correct]);
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      const correctCount = scores.filter(Boolean).length;
      const pct = Math.round((correctCount / questions.length) * 100);
      onComplete?.(pct);
    }
  }

  function handleRetry() {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScores([]);
    setFinished(false);
  }

  if (finished) {
    const correctCount = scores.filter(Boolean).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center"
      >
        <div className="text-5xl font-bold mb-2">
          {pct >= 75 ? '🎉' : pct >= 50 ? '👍' : '📚'}
        </div>
        <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-1">
          You scored <span className="font-bold text-blue-600 dark:text-blue-400">{correctCount}/{questions.length}</span> ({pct}%)
        </p>
        <p className="text-sm text-slate-500 mb-6">
          {pct >= 75 ? 'Great job! You\'ve mastered this module.' : 'Review the material and try again.'}
        </p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="w-4 h-4" /> Retry Quiz
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Question {currentQ + 1} of {questions.length}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < scores.length
                  ? scores[i] ? 'bg-green-500' : 'bg-red-500'
                  : i === currentQ ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-5 leading-relaxed">{q.question}</h3>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isSelected = i === selected;
              let borderClass = 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500';
              let bgClass = '';

              if (answered) {
                if (isCorrect) {
                  borderClass = 'border-green-500';
                  bgClass = 'bg-green-50 dark:bg-green-900/20';
                } else if (isSelected && !isCorrect) {
                  borderClass = 'border-red-500';
                  bgClass = 'bg-red-50 dark:bg-red-900/20';
                } else {
                  borderClass = 'border-slate-200 dark:border-slate-800 opacity-50';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${borderClass} ${bgClass} ${
                    !answered ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{opt}</span>
                    {answered && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-auto mt-0.5" />
                    )}
                    {answered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-auto mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5"
            >
              <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                selected === q.correctIndex
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
              }`}>
                <p className="font-medium mb-1">
                  {selected === q.correctIndex ? 'Correct!' : 'Not quite.'}
                </p>
                <p>{q.explanation}</p>
              </div>

              <button
                onClick={handleNext}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
