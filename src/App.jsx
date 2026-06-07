import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import BookDrawer from './components/BookDrawer';

// Pages
import Login from './pages/Login';
import Bookshelf from './pages/Bookshelf';
import KnowledgeVault from './pages/KnowledgeVault';
import Timeline from './pages/Timeline';
import Stats from './pages/Stats';

// Loading screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#fcf8f2] dark:bg-[#120e0c] flex flex-col items-center justify-center text-amber-900 dark:text-amber-400 select-none">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-amber-900/10 dark:border-amber-400/10"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-amber-800 dark:border-t-amber-400 animate-spin"></div>
      </div>
      <p className="font-serif italic text-sm animate-pulse">Entering the library sanctuary...</p>
    </div>
  );
}

// Inner app controller
function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('shelves');

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#fcf8f2] dark:bg-[#120e0c] flex transition-all duration-300">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
      <main className="flex-1 md:pl-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
          {activeTab === 'shelves' && <Bookshelf />}
          {activeTab === 'vault' && <KnowledgeVault />}
          {activeTab === 'timeline' && <Timeline />}
          {activeTab === 'stats' && <Stats />}
        </div>
      </main>

      {/* Global Book Detail slide-out Drawer */}
      <BookDrawer />
    </div>
  );
}

// Root Wrapper
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
