
import React, { useState, useEffect } from 'react';
import { ViewState, User } from '../types';
import { Search, TrendingUp, Calendar, Clock, Bookmark, LogOut, Sparkles, Home, History } from 'lucide-react';
import { dbService } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  setView: (v: ViewState) => void;
  user: User | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearch: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeView,
  setView,
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
  onSearch
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<{ query: string, timestamp: number }[]>([]);

  useEffect(() => {
    if (user && showHistory) {
      const uid = user.id || (user as any)._id;
      dbService.getSearchHistory(uid).then(setHistory);
    }
  }, [user, showHistory]);

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
    // Use setTimeout to ensure state is updated before search
    setTimeout(() => onSearch(), 10);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setView('home')}
        >
          <div className="bg-red-600 p-2 rounded-lg group-hover:bg-red-500 transition-colors">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">CineWise</h1>
        </div>

        <div className="hidden md:flex flex-col items-center gap-1 bg-white/5 rounded-full px-4 py-2 border border-white/10 focus-within:border-red-500/50 transition-all w-1/3 relative">
          <div className="flex items-center w-full">
            <Search size={18} className="text-white/40" />
            <input
              type="text"
              placeholder="Search movies..."
              className="bg-transparent border-none outline-none text-sm w-full ml-2"
              value={searchQuery}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (onSearch(), setShowHistory(false))}
            />
          </div>

          {showHistory && user && history.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                <History size={14} className="text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Recent Searches</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHistoryClick(item.query)}
                    className="w-full text-left px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between group"
                  >
                    <span>{item.query}</span>
                    <Search size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-white/60">Hi, {user.name}</span>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView('watchlist')}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-red-600/20 uppercase tracking-wider"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-20">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-20 bottom-0 w-20 md:w-64 glass-panel border-r border-white/10 hidden sm:flex flex-col p-4 gap-2">
          <NavItem icon={<Home size={20} />} label="Discover" active={activeView === 'home'} onClick={() => setView('home')} />
          <NavItem icon={<TrendingUp size={20} />} label="Trending" active={activeView === 'trending'} onClick={() => setView('trending')} />
          <NavItem icon={<Calendar size={20} />} label="Upcoming" active={activeView === 'upcoming'} onClick={() => setView('upcoming')} />
          <NavItem icon={<Clock size={20} />} label="Last 7 Days" active={activeView === 'latest'} onClick={() => setView('latest')} />
          <div className="my-4 border-t border-white/5" />
          <NavItem icon={<Bookmark size={20} />} label="Watchlist" active={activeView === 'watchlist'} onClick={() => setView('watchlist')} />
          <NavItem icon={<Sparkles size={20} />} label="AI Recs" active={activeView === 'ai-recommend'} onClick={() => setView('ai-recommend')} />
        </aside>

        {/* Dynamic Content */}
        <main className="sm:ml-20 md:ml-64 flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 w-full glass-panel border-t border-white/10 flex justify-around p-4 z-50">
        <button onClick={() => setView('home')} className={activeView === 'home' ? 'text-red-500' : 'text-white/40'}><Home /></button>
        <button onClick={() => setView('trending')} className={activeView === 'trending' ? 'text-red-500' : 'text-white/40'}><TrendingUp /></button>
        <button onClick={() => setView('watchlist')} className={activeView === 'watchlist' ? 'text-red-500' : 'text-white/40'}><Bookmark /></button>
        <button onClick={() => setView('ai-recommend')} className={activeView === 'ai-recommend' ? 'text-red-500' : 'text-white/40'}><Sparkles /></button>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
  >
    {icon}
    <span className="hidden md:inline font-medium text-sm">{label}</span>
  </button>
);
