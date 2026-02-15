import React, { useEffect, useState } from 'react';
import { Moon, Sun, ArrowLeft, Menu, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Theme toggle logic
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo / Back */}
            <div className="flex items-center gap-4">
              <a href="/" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">HTGAA</span>
              </a>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
              <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Week 2
              </h1>
            </div>

            {/* Desktop Nav Actions */}
            <div className="hidden md:flex items-center gap-6">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                DNA Read, Write, & Edit
              </span>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden gap-4">
               <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -mr-2 text-slate-600 dark:text-slate-300"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
          >
            <div className="px-4 py-4 space-y-2">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Current Module: DNA Read, Write, & Edit
              </div>
              {/* We can add jump links here later */}
            </div>
          </motion.div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
