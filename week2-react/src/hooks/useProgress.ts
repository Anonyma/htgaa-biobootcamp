import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'htgaa-week2-progress';

export interface ModuleProgress {
  quizCompleted: boolean;
  quizScore?: number;
  visited: boolean;
}

export type ProgressMap = Record<string, ModuleProgress>;

const MODULES = ['sequencing', 'synthesis', 'editing', 'genetic-codes', 'gel-electrophoresis', 'central-dogma'];

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveProgress(progress: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const markVisited = useCallback((moduleId: string) => {
    setProgress(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], visited: true }
    }));
  }, []);

  const markQuizCompleted = useCallback((moduleId: string, score: number) => {
    setProgress(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], visited: true, quizCompleted: true, quizScore: score }
    }));
  }, []);

  const completedCount = MODULES.filter(m => progress[m]?.quizCompleted).length;
  const totalModules = MODULES.length;
  const overallPercent = Math.round((completedCount / totalModules) * 100);

  const isCompleted = useCallback((moduleId: string) => {
    return progress[moduleId]?.quizCompleted ?? false;
  }, [progress]);

  const getScore = useCallback((moduleId: string) => {
    return progress[moduleId]?.quizScore;
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress,
    markVisited,
    markQuizCompleted,
    isCompleted,
    getScore,
    completedCount,
    totalModules,
    overallPercent,
    resetProgress,
  };
}
