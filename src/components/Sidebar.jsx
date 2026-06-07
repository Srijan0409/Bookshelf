import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Brain, 
  History, 
  BarChart3, 
  LogOut, 
  Sun, 
  Moon,
  Target,
  Edit2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout, darkMode, setDarkMode, updateGoals, stats } = useAuth();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [annualGoal, setAnnualGoal] = useState(user?.readingGoal?.annual || 12);
  const [monthlyGoal, setMonthlyGoal] = useState(user?.readingGoal?.monthly || 1);

  const navItems = [
    { id: 'shelves', label: 'Bookshelf', icon: BookOpen },
    { id: 'vault', label: 'Knowledge Vault', icon: Brain },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    updateGoals(annualGoal, monthlyGoal);
    setShowGoalModal(false);
  };

  const completedCount = stats?.summary?.completedThisYear || 0;
  const goalPercentage = Math.min(Math.round((completedCount / (user?.readingGoal?.annual || 12)) * 100), 100);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-[#24150d] text-[#fbf6ee] border-r border-[#3a2012] fixed left-0 top-0 z-20 select-none">
        {/* Library Header */}
        <div className="p-6 border-b border-[#3a2012] bg-[#1a0f09]">
          <h1 className="text-xl font-heading-library font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-amber-400" />
            The Reader's Library
          </h1>
          <p className="text-xs text-[#a6948b] mt-1 font-serif italic">My Digital Sanctuary</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#5a3219] text-[#fbf6ee] shadow-inner border-l-4 border-amber-400' 
                    : 'text-[#d8c8bf] hover:bg-[#341d11] hover:text-[#fbf6ee]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-[#a6948b]'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Reading Goal Progress widget */}
        {user && (
          <div className="mx-4 my-2 p-4 rounded-xl bg-[#1b0e07] border border-[#3d2211]">
            <div className="flex justify-between items-center text-xs text-[#d8c8bf] mb-2 font-medium">
              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-amber-400" /> Reading Goal</span>
              <button 
                onClick={() => {
                  setAnnualGoal(user.readingGoal?.annual || 12);
                  setMonthlyGoal(user.readingGoal?.monthly || 1);
                  setShowGoalModal(true);
                }} 
                className="hover:text-amber-300 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-end justify-between mb-1">
              <span className="text-lg font-semibold text-[#fbf6ee]">{completedCount}<span className="text-xs text-[#a6948b] font-normal"> / {user.readingGoal?.annual || 12} books</span></span>
              <span className="text-xs font-semibold text-amber-400">{goalPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#361c0c] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500" 
                style={{ width: `${goalPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#3a2012] bg-[#1a0f09] space-y-2">
          {/* User Details */}
          <div className="px-2 py-1 mb-2">
            <p className="text-xs text-[#a6948b]">Logged in as</p>
            <p className="text-sm font-semibold truncate text-[#fbf6ee]">{user?.name || 'Reader'}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex-1 py-2 px-3 rounded-lg border border-[#3d2211] bg-[#27150c] hover:bg-[#341d11] transition-all flex justify-center items-center gap-2 text-xs text-[#d8c8bf]"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#a6948b]" />
                  <span>Dark</span>
                </>
              )}
            </button>
            <button
              onClick={logout}
              className="py-2 px-3 rounded-lg border border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900/30 transition-all flex justify-center items-center"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#24150d] text-[#fbf6ee] border-t border-[#3a2012] z-30 flex items-center justify-around px-2 select-none shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-all duration-300 ${
                isActive ? 'text-amber-400' : 'text-[#a6948b]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setShowGoalModal(true)}
          className="flex flex-col items-center justify-center w-16 h-12 rounded-lg text-[#a6948b]"
        >
          <Target className="w-5 h-5 mb-0.5 text-[#a6948b]" />
          <span className="text-[10px] font-medium tracking-tight">Goals</span>
        </button>
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center w-16 h-12 rounded-lg text-[#a6948b]"
        >
          <LogOut className="w-5 h-5 mb-0.5 text-red-400/80" />
          <span className="text-[10px] font-medium tracking-tight">Exit</span>
        </button>
      </nav>

      {/* Reading Goals Edit Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#fbf6ee] dark:bg-[#201713] text-[#1c1512] dark:text-[#f3eae3] max-w-sm w-full rounded-2xl border-2 border-amber-600/30 overflow-hidden shadow-2xl p-6">
            <h3 className="text-xl font-heading-library font-semibold mb-4 border-b border-[#e7dfd3] dark:border-[#2d201a] pb-2 flex items-center gap-2 text-amber-800 dark:text-amber-400">
              <Target className="w-5 h-5" /> Edit Reading Goals
            </h3>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Annual Reading Goal (books/year)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={annualGoal}
                  onChange={(e) => setAnnualGoal(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1a120f] rounded-lg outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Monthly Reading Goal (books/month)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1a120f] rounded-lg outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>

              {/* Theme toggle for mobile in this modal */}
              <div className="md:hidden flex justify-between items-center py-2 border-t border-b border-[#e7dfd3] dark:border-[#2d201a] my-2">
                <span className="text-sm font-medium">Dark Theme</span>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 bg-[#24150d] text-[#fbf6ee] rounded-full"
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-2 rounded-lg border-2 border-[#e7dfd3] dark:border-[#3d2211] text-[#5c4e47] dark:text-[#a6948b] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-[#fbf6ee] transition-all text-sm font-semibold shadow-md shadow-amber-900/20"
                >
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
