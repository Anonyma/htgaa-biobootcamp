/**
 * Study Tips View
 * Evidence-based study strategies tailored for bioengineering learning.
 */

import { store, TOPICS } from '../store.js';

export function createStudyTipsView() {
  const TIPS = [
    {
      category: 'Active Recall',
      icon: 'brain',
      color: 'purple',
      tips: [
        {
          title: 'Test Yourself Before Re-reading',
          description: 'Before reviewing a chapter, close the page and try to write down everything you remember. Then re-read only what you missed. This is 2-3x more effective than passive re-reading.',
          howTo: 'Use the Quick Practice or Exam Mode after each topic study session.',
          link: '#/practice'
        },
        {
          title: 'The Feynman Technique',
          description: 'Explain a concept as if teaching it to a 12-year-old. If you get stuck or need jargon, you don\'t understand it well enough. Go back and re-study that part.',
          howTo: 'Try the Discussion Prompts — many ask you to explain concepts in simple terms.',
          link: '#/discussion'
        },
        {
          title: 'Flashcard Best Practices',
          description: 'Keep cards atomic (one fact per card). Use the minimum information principle. Add context with images when possible. Review daily, even for just 5 minutes.',
          howTo: 'Use Flashcards with spaced repetition — the system automatically spaces your reviews.',
          link: '#/flashcards'
        },
      ]
    },
    {
      category: 'Spaced Repetition',
      icon: 'repeat',
      color: 'green',
      tips: [
        {
          title: 'The Spacing Effect',
          description: 'Spreading study over multiple sessions (even 3 × 20 min) produces better retention than one long session (1 × 60 min). Your brain consolidates memories during sleep.',
          howTo: 'Use the Study Planner to schedule 2-3 short sessions per day across different topics.',
          link: '#/planner'
        },
        {
          title: 'Interleaving Topics',
          description: 'Don\'t study one topic for hours. Mix topics within a session: 20 min sequencing → 20 min editing → 20 min synthesis. This forces your brain to distinguish between concepts.',
          howTo: 'Quick Practice pulls questions from random topics — great for interleaving.',
          link: '#/practice'
        },
        {
          title: 'Review at Increasing Intervals',
          description: 'Review new material after: 1 day → 3 days → 7 days → 14 days → 30 days. Each successful review doubles the interval. This is how Anki and SM-2 work.',
          howTo: 'Use the Spaced Review tool to track optimal review times for each topic.',
          link: '#/spaced-review'
        },
      ]
    },
    {
      category: 'Deep Processing',
      icon: 'layers',
      color: 'blue',
      tips: [
        {
          title: 'Make Connections',
          description: 'Link new concepts to things you already know. How does CRISPR relate to restriction enzymes? How does sequencing verify what synthesis creates? These connections build a stronger knowledge network.',
          howTo: 'Use the Concept Map to visualize how topics connect.',
          link: '#/concept-map'
        },
        {
          title: 'Draw It Out',
          description: 'Drawing diagrams (even rough ones) forces deeper processing than just reading. Sketch the CRISPR mechanism, the phosphoramidite cycle, or an expression cassette from memory.',
          howTo: 'The interactive simulations show processes step-by-step — try to reproduce them on paper.',
          link: '#/topic/editing'
        },
        {
          title: 'Elaborate with "Why" and "How"',
          description: 'Don\'t just memorize facts. Ask WHY Cas9 needs a PAM sequence. Ask HOW gel electrophoresis separates DNA by size. Answering these "why/how" questions creates deeper understanding.',
          howTo: 'Each topic has Deep Dive sections that explain the "why" behind key concepts.',
          link: null
        },
      ]
    },
    {
      category: 'Homework Strategy',
      icon: 'clipboard-list',
      color: 'orange',
      tips: [
        {
          title: 'Read the Assignment First',
          description: 'Before studying any topic, read ALL homework parts. This gives your studying purpose — you know exactly what you need to learn and why.',
          howTo: 'Check the Homework Hub for all assignment parts and their prerequisites.',
          link: '#/homework'
        },
        {
          title: 'Benchling Before Lab',
          description: 'For Part 1 (in-silico gel art), practice with Benchling before lab day. Design your restriction enzyme cuts, predict gel patterns, iterate until you\'re happy with the design.',
          howTo: 'Study Gel Electrophoresis and Lab Protocol pages before opening Benchling.',
          link: '#/topic/gel-electrophoresis'
        },
        {
          title: 'Codon Optimization for Part 3',
          description: 'The DNA design challenge requires understanding codon usage tables, reverse translation, and expression systems. Focus on the Central Dogma chapter\'s codon optimization section.',
          howTo: 'The Central Dogma topic has interactive codon tools and worked examples.',
          link: '#/topic/central-dogma'
        },
      ]
    },
    {
      category: 'Focus & Energy',
      icon: 'battery-charging',
      color: 'amber',
      tips: [
        {
          title: 'Pomodoro Technique',
          description: '25 minutes focused study → 5 minute break → repeat 4× → 15 minute break. This prevents burnout and maintains attention. One HTGAA topic section fits perfectly in one pomodoro.',
          howTo: 'Use the built-in Pomodoro Timer with topic linking.',
          link: '#/pomodoro'
        },
        {
          title: 'Eliminate Distractions',
          description: 'Phone in another room, notifications off, browser tabs closed (except this app!). Even having your phone visible reduces cognitive capacity by ~10%.',
          howTo: 'Use Focus Mode in Settings to minimize UI distractions while studying.',
          link: '#/settings'
        },
        {
          title: 'Study When Alert',
          description: 'Complex bioengineering concepts need your full attention. Study challenging topics during your peak alertness hours (morning for most people, evening for night owls).',
          howTo: 'Track your study patterns in the Study Log to find your peak hours.',
          link: '#/study-log'
        },
      ]
    },
    {
      category: 'Mnemonics & Memory',
      icon: 'lightbulb',
      color: 'yellow',
      tips: [
        {
          title: 'Create Memorable Associations',
          description: 'The weirder or more emotional the association, the better it sticks. "Cas9 is the SCISSORS, gRNA is the GPS" is more memorable than "Cas9 is the endonuclease guided by gRNA."',
          howTo: 'Browse 30+ pre-built mnemonics in Memory Aids, or create your own.',
          link: '#/mnemonics'
        },
        {
          title: 'Use the Method of Loci (Memory Palace)',
          description: 'Place concepts in familiar locations in your mind. Walk through your house: the door is the promoter, the hallway is the RBS, the kitchen is the start codon, etc.',
          howTo: 'Especially useful for the expression cassette order and the phosphoramidite cycle.',
          link: null
        },
        {
          title: 'Acronyms and Chunking',
          description: 'Break sequences into chunks: GAATTC becomes "Go Ahead And Then Try Cutting." Group related enzymes: EcoRI, HindIII, BamHI = "Every Happy Bee" (restriction enzymes that make sticky ends).',
          howTo: 'The Vocabulary Drill tests your recall and highlights terms you struggle with.',
          link: '#/vocab-drill'
        },
      ]
    },
  ];

  return {
    render() {
      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Study Tips</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Evidence-based strategies for learning bioengineering</p>
            </div>
            <a data-route="#/" class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Home
            </a>
          </div>

          <!-- Quick tip of the day -->
          <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl border border-purple-200 dark:border-purple-800 p-5 mb-6">
            <div class="flex items-start gap-3">
              <span class="text-2xl">&#x1F4A1;</span>
              <div>
                <h3 class="font-bold text-purple-800 dark:text-purple-200 mb-1">Tip of the Day</h3>
                <p class="text-sm text-purple-700 dark:text-purple-300 leading-relaxed" id="daily-tip"></p>
              </div>
            </div>
          </div>

          <!-- Categories -->
          ${TIPS.map(cat => `
            <div class="mb-6">
              <h2 class="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-3">
                <i data-lucide="${cat.icon}" class="w-5 h-5 text-${cat.color}-500"></i>
                ${cat.category}
              </h2>
              <div class="space-y-3">
                ${cat.tips.map(tip => `
                  <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">${tip.title}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">${tip.description}</p>
                    <div class="flex items-center justify-between">
                      <p class="text-xs text-${cat.color}-600 dark:text-${cat.color}-400 flex items-center gap-1">
                        <i data-lucide="arrow-right" class="w-3 h-3"></i> ${tip.howTo}
                      </p>
                      ${tip.link ? `<a data-route="${tip.link}" class="text-xs text-blue-500 hover:text-blue-600 cursor-pointer font-medium">Try it &rarr;</a>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>`;
    },

    mount(container) {
      // Random tip of the day
      const allTips = TIPS.flatMap(c => c.tips);
      const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % allTips.length;
      const tipEl = container.querySelector('#daily-tip');
      if (tipEl) tipEl.textContent = allTips[dayIndex].description;

      if (window.lucide) lucide.createIcons();
    }
  };
}
