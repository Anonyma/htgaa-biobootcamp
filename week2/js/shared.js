/**
 * HTGAA Week 2 - Shared Utility Module
 * Progress tracking, theme, navigation, quizzes, scroll spy, collapsibles.
 * Vanilla JS, no dependencies.
 */

const STORAGE_KEY = 'htgaa-week2-progress';
const THEME_KEY = 'htgaa-theme';
const COLLAPSIBLE_KEY = 'htgaa-week2-collapsibles';
const QUIZ_KEY = 'htgaa-week2-quizzes';

// ---------------------------------------------------------------------------
// 1. Progress Tracking
// ---------------------------------------------------------------------------

/** Returns an object mapping sectionId -> boolean for completion state. */
function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

/** Marks a section as complete and persists to localStorage. */
function markComplete(sectionId) {
  const progress = getProgress();
  progress[sectionId] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/** Returns overall completion as a percentage (0-100). */
function getOverallProgress() {
  const progress = getProgress();
  const sections = document.querySelectorAll('[data-section]');
  if (sections.length === 0) return 0;
  const completed = Array.from(sections).filter(
    (s) => progress[s.dataset.section]
  ).length;
  return Math.round((completed / sections.length) * 100);
}

// ---------------------------------------------------------------------------
// 2. Theme Management
// ---------------------------------------------------------------------------

/** Reads saved theme preference and applies it. Call on page load. */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (saved === 'light') {
    document.documentElement.classList.remove('dark');
  }
  // Wire up any toggle buttons present on the page
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });
}

/** Toggles between dark and light mode, saves preference. */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}

// ---------------------------------------------------------------------------
// 3. Navigation Helper
// ---------------------------------------------------------------------------

/** Highlights the current page link in the nav and wires the mobile menu. */
function initNav() {
  // Highlight current page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.split('/').pop() === currentPath) {
      link.classList.add('active');
    }
  });

  // Mobile menu toggle
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }
}

// ---------------------------------------------------------------------------
// 4. Quiz Engine
// ---------------------------------------------------------------------------

/** Initialises all quizzes found on the page. */
function initQuizzes() {
  const completions = getQuizCompletions();

  document.querySelectorAll('.quiz-container').forEach((container) => {
    const correctIndex = parseInt(container.dataset.correct, 10);
    const quizId = container.dataset.quizId || container.id || null;
    const explanation = container.querySelector('.quiz-explanation');
    const options = container.querySelectorAll('.quiz-option');

    // Restore previously completed state
    if (quizId && completions[quizId]) {
      markQuizAnswered(container, correctIndex, explanation);
    }

    options.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Prevent re-answering
        if (container.classList.contains('answered')) return;

        const chosen = parseInt(btn.dataset.index, 10);
        container.classList.add('answered');

        if (chosen === correctIndex) {
          btn.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
        } else {
          btn.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
          // Also highlight the correct one
          options.forEach((o) => {
            if (parseInt(o.dataset.index, 10) === correctIndex) {
              o.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
            }
          });
        }

        // Show explanation if present
        if (explanation) explanation.classList.remove('hidden');

        // Persist completion
        if (quizId) {
          completions[quizId] = true;
          localStorage.setItem(QUIZ_KEY, JSON.stringify(completions));
        }
      });
    });
  });
}

function getQuizCompletions() {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_KEY)) || {};
  } catch {
    return {};
  }
}

/** Visually marks a quiz as already answered (for restore on page load). */
function markQuizAnswered(container, correctIndex, explanation) {
  container.classList.add('answered');
  const correct = container.querySelector(`.quiz-option[data-index="${correctIndex}"]`);
  if (correct) correct.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
  if (explanation) explanation.classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// 5. Scroll Spy for TOC
// ---------------------------------------------------------------------------

/** Observes [data-section] elements and highlights the matching .toc-link. */
function initScrollSpy() {
  const sections = document.querySelectorAll('[data-section]');
  const tocLinks = document.querySelectorAll('.toc-link');
  if (sections.length === 0 || tocLinks.length === 0) return;

  // Click handler: smooth scroll
  tocLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.replace('#', '');
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // IntersectionObserver to track which section is in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.section || entry.target.id;
          tocLinks.forEach((link) => {
            const linkTarget = link.getAttribute('href')?.replace('#', '');
            link.classList.toggle('active', linkTarget === id);
          });
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

// ---------------------------------------------------------------------------
// 6. Collapsible Sections
// ---------------------------------------------------------------------------

/** Sets up collapsible sections with slide animation and persisted state. */
function initCollapsibles() {
  const saved = getCollapsibleState();

  document.querySelectorAll('.collapsible-header').forEach((header) => {
    const content = header.nextElementSibling;
    if (!content || !content.classList.contains('collapsible-content')) return;

    const id = header.dataset.collapsibleId || header.textContent.trim();

    // Restore saved state (default: collapsed)
    if (saved[id]) {
      content.style.maxHeight = content.scrollHeight + 'px';
      header.classList.add('open');
    } else {
      content.style.maxHeight = '0px';
      content.style.overflow = 'hidden';
    }
    content.style.transition = 'max-height 0.3s ease';

    header.addEventListener('click', () => {
      const isOpen = header.classList.toggle('open');
      if (isOpen) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0px';
        content.style.overflow = 'hidden';
      }
      // Persist
      const state = getCollapsibleState();
      state[id] = isOpen;
      localStorage.setItem(COLLAPSIBLE_KEY, JSON.stringify(state));
    });
  });
}

function getCollapsibleState() {
  try {
    return JSON.parse(localStorage.getItem(COLLAPSIBLE_KEY)) || {};
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// 7. Utility Functions
// ---------------------------------------------------------------------------

/** Formats a number with commas (e.g. 1234567 -> "1,234,567"). */
function formatNumber(n) {
  return Number(n).toLocaleString('en-US');
}

/** Returns a debounced version of `fn` that waits `ms` before firing. */
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ---------------------------------------------------------------------------
// Auto-Init on DOMContentLoaded
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  if (document.querySelector('.quiz-container')) initQuizzes();
  if (document.querySelector('[data-section]')) initScrollSpy();
  if (document.querySelector('.collapsible-header')) initCollapsibles();
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  getProgress,
  markComplete,
  getOverallProgress,
  initTheme,
  toggleTheme,
  initNav,
  initQuizzes,
  initScrollSpy,
  initCollapsibles,
  formatNumber,
  debounce,
};
