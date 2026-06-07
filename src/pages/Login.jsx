import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, KeyRound, Mail, User, Sparkles, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, register, loginDemo, loading } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [error, setError] = useState('');

  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLoginTab) {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }
      const res = await login(email, password);
      if (!res.success) setError(res.error || 'Login failed');
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all details.');
        return;
      }
      const res = await register(name, email, password);
      if (!res.success) setError(res.error || 'Registration failed');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    const res = await loginDemo();
    if (!res.success) {
      setError(res.error || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f2] dark:bg-[#120e0c] flex items-center justify-center p-4 select-none text-[#1c1512] dark:text-[#f3eae3]">
      {/* Container Box */}
      <div className="max-w-4xl w-full bg-[#fbf6ee] dark:bg-[#1a120f] border-2 border-amber-900/10 dark:border-amber-900/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto min-h-[500px]">
        
        {/* Left Side: Editorial Banner */}
        <div className="md:w-1/2 wood-texture p-10 flex flex-col justify-between text-[#fbf6ee] select-none text-center md:text-left">
          <div className="space-y-4">
            <h1 className="text-3xl font-heading-library font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 flex items-center gap-3 justify-center md:justify-start">
              <BookOpen className="w-8 h-8 text-amber-400" />
              The Reader's Library
            </h1>
            <p className="text-sm text-amber-100/80 font-serif leading-relaxed italic">
              "A digital sanctuary where reading milestones become permanent memories, books sit on vertical shelves, and key insights build a secondary brain."
            </p>
          </div>

          <div className="mt-8 md:mt-0 space-y-4">
            {/* Highlights */}
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-xs font-semibold text-amber-200">Wood-Shelved Bookshelf View</span>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-xs font-semibold text-amber-200">Notes & Quotes Knowledge Vault</span>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-xs font-semibold text-amber-200">Chronological Reading History Timeline</span>
            </div>
          </div>

          <div className="mt-8 md:mt-0 text-[10px] text-amber-300/40 font-semibold tracking-wider uppercase">
            © 2026 The Reader's Library
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="md:w-1/2 p-8 lg:p-10 flex flex-col justify-center space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-heading-library font-bold text-amber-950 dark:text-amber-300">
              {isLoginTab ? 'Enter the Library' : 'Create Library Card'}
            </h2>
            <p className="text-xs text-[#5c4e47] dark:text-[#a6948b] mt-1 font-medium">
              {isLoginTab ? 'Please enter your library details to begin.' : 'Register details to start your custom shelves.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginTab && (
              <div className="relative">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="E.g. James Clear"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1a120f] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
                    required
                  />
                  <User className="w-4 h-4 text-[#a6948b] absolute left-3.5 top-3" />
                </div>
              </div>
            )}

            <div className="relative">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. reader@library.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1a120f] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
                  required
                />
                <Mail className="w-4 h-4 text-[#a6948b] absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1a120f] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
                  required
                />
                <KeyRound className="w-4 h-4 text-[#a6948b] absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 disabled:bg-[#8c7667] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-900/20 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{isLoginTab ? 'Sign In' : 'Sign Up'}</span>
              )}
            </button>
          </form>

          {/* Quick Demo Login trigger */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-amber-900/10 dark:border-amber-900/20"></div>
            <span className="flex-shrink mx-4 text-[10px] text-[#8c7667] dark:text-[#8e7a70] uppercase font-bold tracking-wider">Reviewer Quick Entry</span>
            <div className="flex-grow border-t border-amber-900/10 dark:border-amber-900/20"></div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 border-2 border-amber-500/30 text-amber-800 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/15" />
            <span>Explore Demo Library (One Click)</span>
          </button>

          {/* Switch tab */}
          <div className="text-center">
            <button
              onClick={() => setIsLoginTab(!isLoginTab)}
              className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
            >
              {isLoginTab ? "Don't have a library card? Sign Up" : 'Already have a library card? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
