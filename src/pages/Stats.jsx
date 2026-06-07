import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  BookOpen, 
  Flame, 
  Star, 
  Sparkles, 
  Activity, 
  BookMarked,
  FolderHeart
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Stats() {
  const { stats, user } = useAuth();

  // Trigger goal success confetti
  useEffect(() => {
    if (stats?.goals?.annualProgress >= 100) {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#d4af37', '#fbf6ee', '#6b3e1c']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#d4af37', '#fbf6ee', '#6b3e1c']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [stats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20 text-amber-800 dark:text-amber-400">
        <span className="animate-pulse font-semibold">Gathering library analytics...</span>
      </div>
    );
  }

  const { summary, goals, monthlyHistory, genreDistribution, activityCounts } = stats;

  // Render heat map calendar grid helper
  const renderHeatmap = () => {
    // Generate dates for the last 365 days grouped by columns (weeks)
    const cols = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364); // 52 weeks ago
    
    // Adjust to starting Sunday of that week
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const checkDate = new Date(startDate);
    
    // Build 53 columns (weeks), each containing 7 cells (days)
    for (let w = 0; w < 53; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dStr = checkDate.toISOString().split('T')[0];
        const count = activityCounts[dStr] || 0;
        
        // Intensity mapping
        let colorClass = 'bg-[#f4eae1]/40 dark:bg-amber-950/20'; // no activity
        if (count === 1) colorClass = 'bg-amber-600/30 text-white';
        if (count === 2) colorClass = 'bg-amber-600/60 text-white';
        if (count >= 3) colorClass = 'bg-amber-500 fill-amber-500 shadow-md text-white';

        weekDays.push({
          date: new Date(checkDate),
          dateStr: dStr,
          count,
          colorClass
        });
        
        checkDate.setDate(checkDate.getDate() + 1);
      }
      cols.push(weekDays);
    }

    return (
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex gap-1 min-w-[720px] select-none py-1">
          {/* Days indicators */}
          <div className="flex flex-col justify-around text-[9px] font-bold text-[#8c7667] dark:text-[#a6948b] pr-2 uppercase">
            <span>Sun</span>
            <span>Wed</span>
            <span>Sat</span>
          </div>
          
          {/* Calendar blocks */}
          {cols.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={`w-3.5 h-3.5 rounded-sm transition-colors duration-200 cursor-pointer ${day.colorClass}`}
                  title={`${day.date.toLocaleDateString()}: ${day.count} reading events`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 text-[9px] font-bold text-[#8c7667] dark:text-[#a6948b] mt-3 uppercase">
          <span>Less reading</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#f4eae1]/40 dark:bg-amber-950/20"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-600/30"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-600/60"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500"></div>
          <span>More reading</span>
        </div>
      </div>
    );
  };

  // Compute SVG Dashboard progress rings
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetAnnual = circumference - (goals.annualProgress / 100) * circumference;
  const strokeDashoffsetMonthly = circumference - (goals.monthlyProgress / 100) * circumference;

  return (
    <div className="space-y-6 pb-24 md:pb-6 text-[#1c1512] dark:text-[#f3eae3] select-none">
      {/* Page Header */}
      <div className="border-b border-amber-900/10 dark:border-amber-900/20 pb-4">
        <h1 className="text-2xl lg:text-3xl font-heading-library font-bold text-amber-950 dark:text-amber-300 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-800 dark:text-amber-400" />
          Reading Analytics
        </h1>
        <p className="text-xs text-[#5c4e47] dark:text-[#a6948b] font-serif italic mt-0.5">
          "Numbers mirror the discipline of the reading mind."
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Books Completed */}
        <div className="bg-[#fdfaf6] dark:bg-[#201713] p-5 rounded-2xl border-2 border-amber-900/5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-800/10 dark:bg-amber-400/10 text-amber-850 dark:text-amber-400 rounded-xl">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-[#8c7667] dark:text-[#a6948b]">Completions</span>
            <span className="text-xl lg:text-2xl font-bold font-heading-library">{summary.totalBooksCompleted} books</span>
          </div>
        </div>

        {/* Total Pages Read */}
        <div className="bg-[#fdfaf6] dark:bg-[#201713] p-5 rounded-2xl border-2 border-amber-900/5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-800/10 dark:bg-amber-400/10 text-amber-850 dark:text-amber-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-[#8c7667] dark:text-[#a6948b]">Pages Read</span>
            <span className="text-xl lg:text-2xl font-bold font-heading-library">{summary.totalPagesRead} pages</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-[#fdfaf6] dark:bg-[#201713] p-5 rounded-2xl border-2 border-amber-900/5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-800/10 dark:bg-amber-400/10 text-amber-850 dark:text-amber-400 rounded-xl">
            <Flame className="w-6 h-6 text-amber-600 animate-pulse fill-amber-500/10" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-[#8c7667] dark:text-[#a6948b]">Reading Streak</span>
            <span className="text-xl lg:text-2xl font-bold font-heading-library">{summary.readingStreak} days</span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-[#fdfaf6] dark:bg-[#201713] p-5 rounded-2xl border-2 border-amber-900/5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-800/10 dark:bg-amber-400/10 text-amber-850 dark:text-amber-400 rounded-xl">
            <Star className="w-6 h-6 fill-amber-500/15" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-[#8c7667] dark:text-[#a6948b]">Avg Rating</span>
            <span className="text-xl lg:text-2xl font-bold font-heading-library">{summary.averageRating} / 5</span>
          </div>
        </div>
      </div>

      {/* Goals progress rings & Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Rings Card */}
        <div className="bg-[#fdfaf6] dark:bg-[#201713] p-6 rounded-2xl border-2 border-amber-900/5 shadow-sm space-y-6 flex flex-col justify-center">
          <h3 className="text-sm uppercase tracking-wider font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" /> Reading Goal Tracker
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-around py-4">
            {/* Annual goal ring */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" strokeWidth="8" stroke="rgba(212, 175, 55, 0.1)" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    strokeWidth="8" 
                    stroke="#d4af37" 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffsetAnnual}
                    className="progress-ring-circle"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none select-none">
                  <span className="text-xl font-bold text-amber-800 dark:text-amber-400">{goals.annualProgress}%</span>
                  <span className="text-[8px] uppercase font-bold text-[#8c7667] dark:text-[#8e7a70] mt-0.5">Annual</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-center mt-1">
                {summary.completedThisYear} / {goals.annual} books read
              </p>
            </div>

            {/* Monthly goal ring */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" strokeWidth="8" stroke="rgba(139, 90, 43, 0.15)" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    strokeWidth="8" 
                    stroke="#8b5a2b" 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffsetMonthly}
                    className="progress-ring-circle"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none select-none">
                  <span className="text-xl font-bold text-amber-900 dark:text-amber-300">{goals.monthlyProgress}%</span>
                  <span className="text-[8px] uppercase font-bold text-[#8c7667] dark:text-[#8e7a70] mt-0.5">Monthly</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-center mt-1">
                {summary.completedThisMonth} / {goals.monthly} books read
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Completions SVG Bar Chart */}
        <div className="bg-[#fdfaf6] dark:bg-[#201713] p-6 rounded-2xl border-2 border-amber-900/5 shadow-sm space-y-4">
          <h3 className="text-sm uppercase tracking-wider font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Monthly Completions (Past 6 Months)
          </h3>
          
          <div className="h-44 flex items-end justify-between px-2 pt-6 border-b border-amber-900/10 dark:border-amber-900/25">
            {monthlyHistory.map((item, idx) => {
              // Calculate relative height
              const maxCount = Math.max(...monthlyHistory.map(h => h.count), 1);
              const heightPercent = Math.max((item.count / maxCount) * 100, 5); // min 5% for styling visual representation

              return (
                <div key={idx} className="flex flex-col items-center gap-2 w-10 group cursor-pointer">
                  {/* Tooltip counter */}
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  {/* Bar */}
                  <div 
                    className="w-6 rounded-t-md bg-gradient-to-t from-amber-800 to-amber-500 shadow-inner group-hover:from-amber-700 group-hover:to-amber-300 transition-all duration-300" 
                    style={{ height: `${heightPercent * 0.9}px` }}
                  />
                  <span className="text-[9px] uppercase font-bold text-[#8c7667] dark:text-[#a6948b] py-1">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Favorite Genres breakdown */}
        <div className="bg-[#fdfaf6] dark:bg-[#201713] p-6 rounded-2xl border-2 border-amber-900/5 shadow-sm space-y-4">
          <h3 className="text-sm uppercase tracking-wider font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
            <FolderHeart className="w-4 h-4" /> Favorite Genres Distribution
          </h3>

          <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
            {genreDistribution.map((item, idx) => {
              const maxVal = Math.max(...genreDistribution.map(g => g.value), 1);
              const widthPct = (item.value / maxVal) * 100;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold leading-none">
                    <span className="truncate pr-4">{item.name}</span>
                    <span className="text-amber-800 dark:text-amber-400">{item.value} {item.value === 1 ? 'book' : 'books'}</span>
                  </div>
                  <div className="w-full h-2.5 bg-amber-900/5 dark:bg-amber-400/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {genreDistribution.length === 0 && (
              <p className="text-xs text-[#5c4e47]/60 dark:text-[#a6948b]/40 italic py-10 text-center">
                Catalog books with genres to see analytical representations here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reading Calendar Heatmap panel */}
      <div className="bg-[#fdfaf6] dark:bg-[#201713] p-6 rounded-2xl border-2 border-amber-900/5 shadow-sm space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
          <Activity className="w-4 h-4 animate-pulse" /> Reading & Cataloging Activity (Past 365 Days)
        </h3>
        {renderHeatmap()}
      </div>
    </div>
  );
}
