import React, { useEffect, useState } from 'react';
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
  const { stats } = useAuth();
  const [chartView, setChartView] = useState('books'); // 'books' or 'pages'

  // Trigger luxury gold confetti on 100% completion
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
          colors: ['#c9a66b', '#f4e8d0', '#1a1411']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#c9a66b', '#f4e8d0', '#1a1411']
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
      <div className="flex items-center justify-center py-20 text-[#c9a66b]">
        <span className="animate-pulse font-semibold">Compiling library catalog logs...</span>
      </div>
    );
  }

  const { summary, goals, monthlyHistory, genreDistribution, activityCounts } = stats;

  const renderHeatmap = () => {
    const cols = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const checkDate = new Date(startDate);
    
    for (let w = 0; w < 53; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dStr = checkDate.toISOString().split('T')[0];
        const count = activityCounts[dStr] || 0;
        
        let colorClass = 'bg-[#c9a66b]/5 dark:bg-white/2'; // no activity
        if (count === 1) colorClass = 'bg-[#b08d57]/30 text-white';
        if (count === 2) colorClass = 'bg-[#c9a66b]/60 text-white';
        if (count >= 3) colorClass = 'bg-[#c9a66b] shadow-[0_0_6px_rgba(201,166,107,0.5)] text-white';

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
          <div className="flex flex-col justify-around text-[9px] font-bold text-[#a48e82] pr-2 uppercase">
            <span>Sun</span>
            <span>Wed</span>
            <span>Sat</span>
          </div>
          
          {cols.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={`w-3.5 h-3.5 rounded-sm transition-colors duration-200 cursor-pointer ${day.colorClass}`}
                  title={`${day.date.toLocaleDateString()}: ${day.count} catalog updates`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 text-[9px] font-bold text-[#a48e82] mt-3 uppercase tracking-wider">
          <span>Passive study</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#c9a66b]/5"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#b08d57]/30"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#c9a66b]/60"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#c9a66b]"></div>
          <span>Active Reading</span>
        </div>
      </div>
    );
  };

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetAnnual = circumference - (goals.annualProgress / 100) * circumference;
  const strokeDashoffsetMonthly = circumference - (goals.monthlyProgress / 100) * circumference;

  return (
    <div className="space-y-6 pb-24 md:pb-6 text-[#f4e8d0] select-none relative z-10">
      {/* Page Header */}
      <div className="border-b border-[#c9a66b]/10 pb-4">
        <h1 className="text-2xl lg:text-3xl font-serif-book font-bold text-[#c9a66b] flex items-center gap-3">
          <Trophy className="w-7 h-7 text-[#c9a66b]" />
          Collector Analytics
        </h1>
        <p className="text-[11px] text-[#a48e82] font-serif italic mt-0.5">
          "Numbers mirror the discipline of the reading mind."
        </p>
      </div>

      {/* Quick Stats Grid - 5 column layout */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Books Completed */}
        <div className="bg-black/20 p-4 rounded-2xl border border-[#c9a66b]/10 shadow-lg flex items-center gap-3">
          <div className="p-2.5 bg-[#c9a66b]/10 text-[#c9a66b] rounded-xl flex-shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[7.5px] font-bold uppercase tracking-widest text-[#a48e82] mb-0.5 truncate">Volumes Read</span>
            <span className="text-lg font-bold font-serif-book block truncate">{summary.totalBooksCompleted} books</span>
          </div>
        </div>

        {/* Total Pages Read */}
        <div className="bg-black/20 p-4 rounded-2xl border border-[#c9a66b]/10 shadow-lg flex items-center gap-3">
          <div className="p-2.5 bg-[#c9a66b]/10 text-[#c9a66b] rounded-xl flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[7.5px] font-bold uppercase tracking-widest text-[#a48e82] mb-0.5 truncate">Pages Read</span>
            <span className="text-lg font-bold font-serif-book block truncate">{summary.totalPagesRead} pages</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-black/20 p-4 rounded-2xl border border-[#c9a66b]/10 shadow-lg flex items-center gap-3">
          <div className="p-2.5 bg-[#c9a66b]/10 text-[#c9a66b] rounded-xl flex-shrink-0">
            <Flame className="w-5 h-5 text-[#c9a66b] animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="block text-[7.5px] font-bold uppercase tracking-widest text-[#a48e82] mb-0.5 truncate">Reading Streak</span>
            <span className="text-lg font-bold font-serif-book block truncate">{summary.readingStreak} days</span>
          </div>
        </div>

        {/* Reading Velocity */}
        <div className="bg-black/20 p-4 rounded-2xl border border-[#c9a66b]/10 shadow-lg flex items-center gap-3">
          <div className="p-2.5 bg-[#c9a66b]/10 text-[#c9a66b] rounded-xl flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[7.5px] font-bold uppercase tracking-widest text-[#a48e82] mb-0.5 truncate">Velocity (30d)</span>
            <span className="text-lg font-bold font-serif-book block truncate">{summary.readingVelocity || 0} pgs/day</span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-black/20 p-4 rounded-2xl border border-[#c9a66b]/10 shadow-lg flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="p-2.5 bg-[#c9a66b]/10 text-[#c9a66b] rounded-xl flex-shrink-0">
            <Star className="w-5 h-5 fill-[#c9a66b]/10" />
          </div>
          <div className="min-w-0">
            <span className="block text-[7.5px] font-bold uppercase tracking-widest text-[#a48e82] mb-0.5 truncate">Avg Rating</span>
            <span className="text-lg font-bold font-serif-book block truncate">{summary.averageRating} / 5</span>
          </div>
        </div>
      </div>

      {/* Goals progress rings & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Rings Card */}
        <div className="bg-black/20 p-6 rounded-2xl border border-[#c9a66b]/10 shadow-lg space-y-6 flex flex-col justify-center">
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#c9a66b] flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" /> Goal Progress Rings
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-around py-2">
            {/* Annual goal ring */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" strokeWidth="6" stroke="rgba(201, 166, 107, 0.08)" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    strokeWidth="6" 
                    stroke="#c9a66b" 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffsetAnnual}
                    className="progress-ring-circle"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none select-none">
                  <span className="text-xl font-bold text-[#c9a66b]">{goals.annualProgress}%</span>
                  <span className="text-[7.5px] uppercase font-bold text-[#a48e82] tracking-wider mt-0.5">Annual</span>
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-center mt-1 text-[#e8dcc6]/85">
                {summary.completedThisYear} / {goals.annual} books
              </p>
            </div>

            {/* Monthly goal ring */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" strokeWidth="6" stroke="rgba(176, 141, 87, 0.1)" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    strokeWidth="6" 
                    stroke="#b08d57" 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffsetMonthly}
                    className="progress-ring-circle"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none select-none">
                  <span className="text-xl font-bold text-[#b08d57]">{goals.monthlyProgress}%</span>
                  <span className="text-[7.5px] uppercase font-bold text-[#a48e82] tracking-wider mt-0.5">Monthly</span>
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-center mt-1 text-[#e8dcc6]/85">
                {summary.completedThisMonth} / {goals.monthly} books
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Completion/Pages SVG Bar Chart */}
        <div className="bg-black/20 p-6 rounded-2xl border border-[#c9a66b]/10 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#c9a66b] flex items-center gap-2">
              <Activity className="w-4 h-4" /> Monthly Progress
            </h3>
            <div className="flex gap-1 bg-black/30 p-0.5 rounded-md border border-[#c9a66b]/10 select-none">
              <button 
                onClick={() => setChartView('books')} 
                className={`px-2 py-0.5 text-[8px] uppercase font-bold rounded transition-all cursor-pointer ${
                  chartView === 'books' ? 'bg-[#c9a66b] text-black' : 'text-[#a48e82] hover:text-[#f4e8d0]'
                }`}
              >
                Books
              </button>
              <button 
                onClick={() => setChartView('pages')} 
                className={`px-2 py-0.5 text-[8px] uppercase font-bold rounded transition-all cursor-pointer ${
                  chartView === 'pages' ? 'bg-[#c9a66b] text-black' : 'text-[#a48e82] hover:text-[#f4e8d0]'
                }`}
              >
                Pages
              </button>
            </div>
          </div>
          
          <div className="h-44 flex items-end justify-between px-2 pt-6 border-b border-[#c9a66b]/15 relative">
            {monthlyHistory.map((item, idx) => {
              const value = chartView === 'books' ? item.count : (item.pages || 0);
              const maxVal = Math.max(...monthlyHistory.map(h => chartView === 'books' ? h.count : (h.pages || 0)), 1);
              const heightPercent = Math.max((value / maxVal) * 100, 5);

              return (
                <div key={idx} className="flex flex-col items-center gap-2 w-10 group cursor-pointer relative z-10">
                  <span className="text-[9px] font-bold text-[#c9a66b] opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1">
                    {value}
                  </span>
                  <div 
                    className="w-5 rounded-t-sm bg-gradient-to-t from-[#b08d57] to-[#c9a66b] shadow-[0_0_8px_rgba(201,166,107,0.2)] group-hover:to-amber-300 transition-all duration-500 ease-out" 
                    style={{ height: `${heightPercent * 0.9}px` }}
                  />
                  <span className="text-[8px] uppercase font-bold text-[#a48e82] py-1 tracking-widest">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Favorite Genres breakdown */}
        <div className="bg-black/20 p-6 rounded-2xl border border-[#c9a66b]/10 shadow-lg space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#c9a66b] flex items-center gap-2">
            <FolderHeart className="w-4 h-4" /> Subject Genre Distribution
          </h3>

          <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
            {genreDistribution.map((item, idx) => {
              const maxVal = Math.max(...genreDistribution.map(g => g.value), 1);
              const widthPct = (item.value / maxVal) * 100;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold leading-none select-none">
                    <span className="truncate pr-4 font-serif-book text-[#e8dcc6]">{item.name}</span>
                    <span className="text-[#c9a66b] font-bold">{item.value} {item.value === 1 ? 'book' : 'books'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#c9a66b]/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#b08d57] to-[#c9a66b]"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {genreDistribution.length === 0 && (
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#a48e82]/50 py-10 text-center">
                Catalog books with genres to build distribution datasets.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reading Contribution Heatmap */}
      <div className="bg-black/20 p-6 rounded-2xl border border-[#c9a66b]/10 shadow-lg space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-bold text-[#c9a66b] flex items-center gap-2">
          <Activity className="w-4 h-4" /> Cataloging Activity Grid (Past 365 Days)
        </h3>
        {renderHeatmap()}
      </div>
    </div>
  );
}
