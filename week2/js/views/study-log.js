/**
 * HTGAA Week 2 — Study Log View
 * Calendar heatmap and activity timeline showing study habits over time.
 */

import { store, TOPICS } from '../store.js';

function createStudyLogView() {
  let selectedDate = null;

  return {
    render() {
      const log = store.getStudyLog();
      const activeDays = Object.keys(log).filter(d => log[d] > 0);
      const totalActivities = Object.values(log).reduce((s, v) => s + v, 0);
      const longestStreak = store.getLongestStreak();
      const fcStats = store.getFlashcardStats();
      const examScores = store.getExamScores();

      // Calculate current streak
      const today = new Date().toISOString().slice(0, 10);
      let currentStreak = 0;
      let checkDate = new Date();
      while (true) {
        const dateStr = checkDate.toISOString().slice(0, 10);
        if (log[dateStr] && log[dateStr] > 0) {
          currentStreak++;
          checkDate = new Date(checkDate - 86400000);
        } else {
          break;
        }
      }

      return `
        <div class="max-w-6xl mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <i data-lucide="calendar-check" class="w-5 h-5 text-green-600 dark:text-green-400"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold">Study Log</h1>
                <p class="text-sm text-slate-500">Track your study habits and activity</p>
              </div>
            </div>
          </header>

          <!-- Stats Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            ${renderStatCard('Total Study Days', activeDays.length, 'calendar-days', 'blue')}
            ${renderStatCard('Current Streak', `${currentStreak}d`, 'flame', currentStreak >= 3 ? 'orange' : 'blue')}
            ${renderStatCard('Longest Streak', `${longestStreak}d`, 'award', longestStreak >= 7 ? 'green' : 'amber')}
            ${renderStatCard('Total Activities', totalActivities, 'activity', 'violet')}
          </div>

          <!-- Calendar Heatmap -->
          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-8">
            <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4"></i> Last 12 Weeks
            </h2>
            ${renderHeatmap(log)}
          </section>

          <!-- Two-column layout -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <!-- Daily Breakdown -->
            <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <i data-lucide="sun" class="w-4 h-4"></i> ${selectedDate ? formatDateHeader(selectedDate) : 'Select a Day'}
              </h2>
              <div id="daily-breakdown">
                ${renderDailyBreakdown(selectedDate)}
              </div>
            </section>

            <!-- Weekly Summary -->
            <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <i data-lucide="bar-chart-2" class="w-4 h-4"></i> This Week
              </h2>
              ${renderWeeklySummary(log)}
            </section>
          </div>

          <!-- Activity Timeline -->
          <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i data-lucide="list-ordered" class="w-4 h-4"></i> Recent Activity
            </h2>
            ${renderActivityTimeline()}
          </section>
        </div>
      `;
    },

    mount(container) {
      // Wire up heatmap cell clicks
      container.querySelectorAll('.heatmap-cell').forEach(cell => {
        cell.addEventListener('click', () => {
          const date = cell.dataset.date;
          if (!date) return;
          selectedDate = date;

          // Update selected state
          container.querySelectorAll('.heatmap-cell').forEach(c => c.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-slate-900'));
          cell.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-slate-900');

          // Update daily breakdown
          const breakdown = container.querySelector('#daily-breakdown');
          if (breakdown) {
            breakdown.innerHTML = renderDailyBreakdown(date);
            if (window.lucide) lucide.createIcons();
          }

          // Update section title
          const sectionTitle = container.querySelector('#daily-breakdown').closest('section').querySelector('h2');
          if (sectionTitle) {
            sectionTitle.innerHTML = `<i data-lucide="sun" class="w-4 h-4"></i> ${formatDateHeader(date)}`;
            if (window.lucide) lucide.createIcons();
          }
        });
      });
    }
  };
}

function renderStatCard(label, value, icon, color) {
  return `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
      <i data-lucide="${icon}" class="w-5 h-5 mx-auto mb-2 text-${color}-500"></i>
      <div class="text-2xl font-bold text-${color}-600">${value}</div>
      <div class="text-xs text-slate-500 uppercase tracking-wider mt-1">${label}</div>
    </div>
  `;
}

function renderHeatmap(log) {
  // Generate last 12 weeks (84 days)
  const weeks = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 83); // 84 days ago

  // Build grid: 7 rows (days of week) × 12 columns (weeks)
  for (let week = 0; week < 12; week++) {
    const weekData = [];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + week * 7 + day);
      const dateStr = currentDate.toISOString().slice(0, 10);
      const count = log[dateStr] || 0;
      weekData.push({ date: dateStr, count, dayOfWeek: day });
    }
    weeks.push(weekData);
  }

  // Find max for color scaling
  const maxCount = Math.max(1, ...Object.values(log));

  // Month labels (show at start of each month)
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, idx) => {
    const monthStart = new Date(week[0].date).getMonth();
    if (monthStart !== lastMonth) {
      monthLabels.push({ week: idx, label: new Date(week[0].date).toLocaleDateString('en', { month: 'short' }) });
      lastMonth = monthStart;
    }
  });

  return `
    <div class="overflow-x-auto">
      <!-- Month labels -->
      <div class="flex gap-0.5 mb-1 ml-8">
        ${Array(12).fill(0).map((_, i) => {
          const label = monthLabels.find(m => m.week === i);
          return `<div class="flex-1 text-[9px] text-slate-400">${label ? label.label : ''}</div>`;
        }).join('')}
      </div>

      <!-- Grid -->
      <div class="flex gap-0.5">
        <!-- Day labels -->
        <div class="flex flex-col gap-0.5 pr-2 text-[9px] text-slate-400 justify-around">
          <div>Mon</div>
          <div></div>
          <div>Wed</div>
          <div></div>
          <div>Fri</div>
          <div></div>
          <div></div>
        </div>

        <!-- Weeks -->
        ${weeks.map(week => `
          <div class="flex flex-col gap-0.5">
            ${week.map(day => {
              const intensity = getColorIntensity(day.count, maxCount);
              return `
                <div class="heatmap-cell w-3 h-3 rounded-sm ${intensity} cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all group relative"
                     data-date="${day.date}"
                     title="${day.date}: ${day.count} activities">
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded hidden group-hover:block whitespace-nowrap z-10">
                    ${formatDateShort(day.date)}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-2 mt-3 text-[10px] text-slate-400">
        <span>Less</span>
        <div class="flex gap-1">
          <div class="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-700"></div>
          <div class="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40"></div>
          <div class="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
          <div class="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
          <div class="w-3 h-3 rounded-sm bg-green-700 dark:bg-green-400"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  `;
}

function getColorIntensity(count, max) {
  if (count === 0) return 'bg-slate-100 dark:bg-slate-700';
  const ratio = count / max;
  if (ratio <= 0.25) return 'bg-green-200 dark:bg-green-900/40';
  if (ratio <= 0.5) return 'bg-green-400 dark:bg-green-700';
  if (ratio <= 0.75) return 'bg-green-600 dark:bg-green-500';
  return 'bg-green-700 dark:bg-green-400';
}

function renderDailyBreakdown(date) {
  if (!date) {
    return `
      <div class="text-center py-8 text-slate-400 text-sm">
        <i data-lucide="mouse-pointer-click" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p>Click on a day in the calendar to view activity details</p>
      </div>
    `;
  }

  const feed = store.getActivityFeed(50);
  const dayActivities = feed.filter(a => {
    const activityDate = new Date(a.time).toISOString().slice(0, 10);
    return activityDate === date;
  });

  const log = store.getStudyLog();
  const count = log[date] || 0;

  if (count === 0 || dayActivities.length === 0) {
    return `
      <div class="text-center py-8">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <i data-lucide="calendar-off" class="w-6 h-6 text-slate-400"></i>
        </div>
        <p class="text-sm text-slate-500">No activity recorded on this day</p>
      </div>
    `;
  }

  return `
    <div class="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
      <div class="text-sm text-slate-500">${count} ${count === 1 ? 'activity' : 'activities'}</div>
    </div>
    <div class="space-y-2 max-h-64 overflow-y-auto">
      ${dayActivities.map(activity => {
        const { icon, label, color } = getActivityMeta(activity);
        return `
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div class="w-8 h-8 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center flex-shrink-0">
              <i data-lucide="${icon}" class="w-4 h-4 text-${color}-600 dark:text-${color}-400"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">${label}</div>
              <div class="text-xs text-slate-400">${formatTime(activity.time)}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderWeeklySummary(log) {
  // Get current week (Mon-Sun)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - mondayOffset + i);
    const dateStr = d.toISOString().slice(0, 10);
    weekDays.push({
      date: dateStr,
      count: log[dateStr] || 0,
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      isToday: dateStr === today.toISOString().slice(0, 10)
    });
  }

  const maxCount = Math.max(1, ...weekDays.map(d => d.count));
  const totalThisWeek = weekDays.reduce((sum, d) => sum + d.count, 0);

  return `
    <div class="mb-4 text-sm text-slate-500">
      ${totalThisWeek} ${totalThisWeek === 1 ? 'activity' : 'activities'} this week
    </div>
    <div class="flex items-end gap-2 h-32">
      ${weekDays.map(day => {
        const height = day.count > 0 ? Math.max(12, (day.count / maxCount) * 100) : 8;
        const color = day.isToday ? 'bg-blue-500' : day.count > 0 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700';
        return `
          <div class="flex-1 flex flex-col items-center justify-end h-full group relative">
            <div class="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">${day.count > 0 ? day.count : ''}</div>
            <div class="${color} rounded-t w-full transition-all" style="height: ${height}%"></div>
            <div class="text-[10px] text-slate-400 mt-1 ${day.isToday ? 'font-bold text-blue-600' : ''}">${day.label}</div>
            ${day.isToday ? '<div class="text-[8px] text-blue-600">Today</div>' : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderActivityTimeline() {
  const feed = store.getActivityFeed(30);

  if (feed.length === 0) {
    return `
      <div class="text-center py-8 text-slate-400 text-sm">
        <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p>No recent activity to display</p>
      </div>
    `;
  }

  // Group by date
  const grouped = {};
  feed.forEach(activity => {
    const date = new Date(activity.time).toISOString().slice(0, 10);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(activity);
  });

  return `
    <div class="space-y-6 max-h-96 overflow-y-auto pr-2">
      ${Object.entries(grouped).map(([date, activities]) => `
        <div>
          <div class="flex items-center gap-2 mb-3 sticky top-0 bg-white dark:bg-slate-800 py-1 z-10">
            <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            <div class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">${formatDateHeader(date)}</div>
            <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div class="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
            ${activities.map(activity => {
              const { icon, label, color } = getActivityMeta(activity);
              return `
                <div class="flex items-start gap-3 pb-2 relative">
                  <div class="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-${color}-500 border-2 border-white dark:border-slate-800"></div>
                  <div class="w-8 h-8 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="${icon}" class="w-4 h-4 text-${color}-600 dark:text-${color}-400"></i>
                  </div>
                  <div class="flex-1 pt-0.5">
                    <div class="text-sm font-medium text-slate-700 dark:text-slate-200">${label}</div>
                    <div class="text-xs text-slate-400">${formatTimeAgo(activity.time)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function getActivityMeta(activity) {
  const topic = TOPICS.find(t => t.id === activity.detail?.topicId);
  const topicTitle = topic?.title || activity.detail?.topicId || '';

  switch (activity.action) {
    case 'complete':
      return {
        icon: 'check-circle',
        label: `Completed ${topicTitle}`,
        color: 'green'
      };
    case 'quiz':
      return {
        icon: 'circle-help',
        label: `Quiz question ${activity.detail?.correct ? 'correct' : 'incorrect'}`,
        color: activity.detail?.correct ? 'green' : 'red'
      };
    case 'flashcard':
      const quality = activity.detail?.quality || 0;
      const rating = quality === 5 ? 'Easy' : quality === 4 ? 'Good' : quality === 3 ? 'Hard' : 'Again';
      return {
        icon: 'layers',
        label: `Reviewed flashcard (${rating})`,
        color: quality >= 4 ? 'violet' : quality === 3 ? 'amber' : 'blue'
      };
    case 'section':
      return {
        icon: 'book-open',
        label: `Read section in ${topicTitle}`,
        color: 'blue'
      };
    default:
      return {
        icon: 'activity',
        label: 'Study activity',
        color: 'slate'
      };
  }
}

function formatDateHeader(dateStr) {
  const d = new Date(dateStr);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDateShort(new Date(timestamp).toISOString().slice(0, 10));
}

export { createStudyLogView };
