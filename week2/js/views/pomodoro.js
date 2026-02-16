/**
 * Pomodoro Timer View
 * Dedicated study timer with focus sessions, breaks, and topic linking.
 */

import { store, TOPICS } from '../store.js';

export function createPomodoroView() {
  const PRESETS = [
    { label: '25/5', work: 25, short: 5, long: 15, name: 'Classic' },
    { label: '50/10', work: 50, short: 10, long: 20, name: 'Deep Focus' },
    { label: '15/3', work: 15, short: 3, long: 10, name: 'Quick Sprint' },
  ];

  let preset = 0;
  let state = 'idle'; // idle | work | short-break | long-break
  let secondsLeft = PRESETS[0].work * 60;
  let totalSeconds = PRESETS[0].work * 60;
  let interval = null;
  let sessionsCompleted = 0;
  let selectedTopic = '';
  let sessionLog = getSessionLog();

  function getSessionLog() {
    try { return JSON.parse(localStorage.getItem('htgaa-week2-pomodoro-log') || '[]'); } catch { return []; }
  }
  function saveSessionLog() { localStorage.setItem('htgaa-week2-pomodoro-log', JSON.stringify(sessionLog)); }

  function getTodaySessions() {
    const today = new Date().toDateString();
    return sessionLog.filter(s => new Date(s.timestamp).toDateString() === today);
  }

  function getTodayMinutes() {
    return getTodaySessions().reduce((sum, s) => sum + s.minutes, 0);
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getProgress() {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  }

  function startTimer() {
    if (interval) return;
    if (state === 'idle') {
      state = 'work';
      secondsLeft = PRESETS[preset].work * 60;
      totalSeconds = secondsLeft;
    }
    interval = setInterval(() => {
      secondsLeft--;
      updateDisplay();
      if (secondsLeft <= 0) {
        clearInterval(interval);
        interval = null;
        onTimerComplete();
      }
    }, 1000);
    updateDisplay();
  }

  function pauseTimer() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    updateDisplay();
  }

  function resetTimer() {
    clearInterval(interval);
    interval = null;
    state = 'idle';
    secondsLeft = PRESETS[preset].work * 60;
    totalSeconds = secondsLeft;
    updateDisplay();
  }

  function onTimerComplete() {
    // Play notification sound
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        osc2.connect(gain);
        osc2.frequency.value = 1000;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 400);
    } catch {}

    if (state === 'work') {
      sessionsCompleted++;
      sessionLog.push({
        timestamp: Date.now(),
        minutes: PRESETS[preset].work,
        topic: selectedTopic || null,
        preset: PRESETS[preset].name
      });
      saveSessionLog();

      // Log study activity
      const log = store.getStudyLog();
      const today = new Date().toISOString().slice(0, 10);
      log[today] = (log[today] || 0) + PRESETS[preset].work;
      localStorage.setItem('htgaa-week2-study-log', JSON.stringify(log));

      // Switch to break
      if (sessionsCompleted % 4 === 0) {
        state = 'long-break';
        secondsLeft = PRESETS[preset].long * 60;
      } else {
        state = 'short-break';
        secondsLeft = PRESETS[preset].short * 60;
      }
      totalSeconds = secondsLeft;
    } else {
      // Break complete, back to work
      state = 'work';
      secondsLeft = PRESETS[preset].work * 60;
      totalSeconds = secondsLeft;
    }
    updateDisplay();
  }

  function updateDisplay() {
    const timeEl = document.getElementById('pomo-time');
    const stateEl = document.getElementById('pomo-state');
    const progressEl = document.getElementById('pomo-progress');
    const startBtn = document.getElementById('pomo-start');
    const pauseBtn = document.getElementById('pomo-pause');
    const todayEl = document.getElementById('pomo-today');
    const sessionsEl = document.getElementById('pomo-sessions');
    const circleEl = document.getElementById('pomo-circle');

    if (timeEl) timeEl.textContent = formatTime(secondsLeft);
    if (stateEl) {
      const labels = { idle: 'Ready', work: 'Focus Time', 'short-break': 'Short Break', 'long-break': 'Long Break' };
      stateEl.textContent = labels[state] || '';
      stateEl.className = `text-sm font-medium ${state === 'work' ? 'text-red-500' : state.includes('break') ? 'text-green-500' : 'text-slate-400'}`;
    }
    if (circleEl) {
      const circumference = 2 * Math.PI * 90;
      const offset = circumference - (getProgress() / 100) * circumference;
      circleEl.setAttribute('stroke-dasharray', circumference);
      circleEl.setAttribute('stroke-dashoffset', offset);
    }
    if (startBtn) startBtn.classList.toggle('hidden', !!interval);
    if (pauseBtn) pauseBtn.classList.toggle('hidden', !interval);
    if (todayEl) todayEl.textContent = getTodayMinutes() + ' min';
    if (sessionsEl) sessionsEl.textContent = sessionsCompleted;
  }

  function renderHistory() {
    const el = document.getElementById('pomo-history');
    if (!el) return;
    const recent = sessionLog.slice(-10).reverse();
    if (recent.length === 0) {
      el.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">No sessions yet. Start your first focus session!</p>';
      return;
    }
    el.innerHTML = recent.map(s => {
      const time = new Date(s.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const date = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const topicName = s.topic ? TOPICS.find(t => t.id === s.topic)?.title || s.topic : 'General';
      return `<div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">${date} ${time}</span>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${s.minutes} min</span>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">${topicName}</span>
      </div>`;
    }).join('');
  }

  return {
    render() {
      const todayMins = getTodayMinutes();
      const todaySessions = getTodaySessions().length;

      return `
        <div class="max-w-3xl mx-auto px-4 py-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Pomodoro Timer</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Focused study sessions with timed breaks</p>
            </div>
            <a data-route="#/" class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Home
            </a>
          </div>

          <!-- Timer Card -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center mb-6">
            <!-- Preset selector -->
            <div class="flex justify-center gap-2 mb-6">
              ${PRESETS.map((p, i) => `
                <button class="preset-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === preset ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}" data-preset="${i}">
                  ${p.name} (${p.label})
                </button>
              `).join('')}
            </div>

            <!-- Timer circle -->
            <div class="relative inline-block mb-4">
              <svg viewBox="0 0 200 200" class="-rotate-90" style="width:200px;height:200px">
                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="6"/>
                <circle id="pomo-circle" cx="100" cy="100" r="90" fill="none" stroke="currentColor"
                        class="${state === 'work' ? 'text-red-500' : state.includes('break') ? 'text-green-500' : 'text-blue-500'}"
                        stroke-width="6" stroke-linecap="round"
                        stroke-dasharray="${2 * Math.PI * 90}" stroke-dashoffset="${2 * Math.PI * 90}"
                        style="transition: stroke-dashoffset 1s linear"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span id="pomo-time" class="text-4xl font-mono font-bold text-slate-800 dark:text-white">${formatTime(secondsLeft)}</span>
                <span id="pomo-state" class="text-sm font-medium text-slate-400">Ready</span>
              </div>
            </div>

            <!-- Controls -->
            <div class="flex justify-center gap-3 mb-4">
              <button id="pomo-start" class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                <i data-lucide="play" class="w-5 h-5"></i> Start
              </button>
              <button id="pomo-pause" class="hidden px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                <i data-lucide="pause" class="w-5 h-5"></i> Pause
              </button>
              <button id="pomo-reset" class="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors text-slate-600 dark:text-slate-300">
                <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
              </button>
            </div>

            <!-- Topic selector -->
            <div class="mt-2">
              <select id="pomo-topic" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                <option value="">General Study</option>
                ${TOPICS.map(t => `<option value="${t.id}">${t.title}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Today's Stats -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p id="pomo-today" class="text-2xl font-bold text-blue-600">${todayMins} min</p>
              <p class="text-xs text-slate-500 mt-1">Today's Focus</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p id="pomo-sessions" class="text-2xl font-bold text-green-600">${todaySessions}</p>
              <p class="text-xs text-slate-500 mt-1">Sessions</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p class="text-2xl font-bold text-purple-600">${sessionLog.length}</p>
              <p class="text-xs text-slate-500 mt-1">All Time</p>
            </div>
          </div>

          <!-- Session History -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 class="font-bold text-slate-800 dark:text-white mb-3">Recent Sessions</h3>
            <div id="pomo-history"></div>
          </div>
        </div>`;
    },

    mount(container) {
      // Preset buttons
      container.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          preset = parseInt(btn.dataset.preset);
          resetTimer();
          container.querySelectorAll('.preset-btn').forEach(b => {
            b.className = `preset-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors ${parseInt(b.dataset.preset) === preset ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`;
          });
        });
      });

      // Start/Pause/Reset
      document.getElementById('pomo-start')?.addEventListener('click', startTimer);
      document.getElementById('pomo-pause')?.addEventListener('click', pauseTimer);
      document.getElementById('pomo-reset')?.addEventListener('click', resetTimer);

      // Topic selector
      document.getElementById('pomo-topic')?.addEventListener('change', (e) => {
        selectedTopic = e.target.value;
      });

      renderHistory();
      updateDisplay();
      if (window.lucide) lucide.createIcons();
    }
  };
}
