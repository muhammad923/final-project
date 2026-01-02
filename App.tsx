
import React, { useState, useEffect, useCallback } from 'react';
import { Movie, ViewState, User, WatchlistItem } from './types';
import { tmdbService } from './services/tmdb';
import { dbService } from './services/db';
import { geminiService } from './services/gemini';
import { Layout } from './components/Layout';
import { MovieCard } from './components/MovieCard';
import { Auth } from './components/Auth';
import { Toast } from './components/Toast';
import { Loader2, Film, Sparkles, MessageSquare, AlertCircle, RotateCw } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiRecs, setAiRecs] = useState<{ title: string, reason: string }[]>([]);
  const [generatingRecs, setGeneratingRecs] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Initialize Auth
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync Watchlist
  useEffect(() => {
    if (user) {
      const uid = user.id || (user as any)._id;
      dbService.getWatchlist(uid).then(setWatchlist);
    } else {
      setWatchlist([]);
    }
  }, [user]);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      switch (view) {
        case 'trending': data = await tmdbService.getTrending(); break;
        case 'upcoming': data = await tmdbService.getUpcoming(); break;
        case 'latest': data = await tmdbService.getLatest7Days(); break;
        case 'search': data = await tmdbService.searchMovies(searchQuery); break;
        default: data = await tmdbService.getTrending(); break;
      }
      setMovies(data.results);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch movies', 'error');
    } finally {
      setLoading(false);
    }
  }, [view, searchQuery]);

  useEffect(() => {
    if (view !== 'watchlist' && view !== 'ai-recommend') {
      fetchMovies();
    }
  }, [view, fetchMovies]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setView('search');
      if (user) {
        const uid = user.id || (user as any)._id;
        console.log('Saving search for user:', uid, 'query:', searchQuery);
        dbService.saveSearch(uid, searchQuery).catch(err => {
          console.error('Failed to save search:', err);
        });
      }
    }
  };

  const handleSave = async (movie: Movie) => {
    if (!user) {
      showToast("Please sign in to save movies!", 'error');
      // Switch to auth view if you want, but maybe just toast is enough
      // setView('watchlist'); 
      return;
    }
    try {
      const uid = user.id || (user as any)._id;
      await dbService.saveToWatchlist(uid, movie);
      const updated = await dbService.getWatchlist(uid);
      setWatchlist(updated);
      showToast(`Saved "${movie.title}" to watchlist`);
    } catch (err) {
      showToast('Failed to save movie', 'error');
    }
  };

  const handleRemove = async (movieId: number) => {
    if (!user) return;
    try {
      const uid = user.id || (user as any)._id;
      await dbService.removeFromWatchlist(uid, movieId);
      const updated = await dbService.getWatchlist(uid);
      setWatchlist(updated);
      showToast('Movie removed from watchlist');
    } catch (err) {
      showToast('Failed to remove movie', 'error');
    }
  };

  const handleAuth = (u: User) => {
    setUser(u);
    localStorage.setItem('currentUser', JSON.stringify(u));
    showToast(`Welcome back, ${u.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setView('home');
    showToast('Signed out successfully');
  };

  const generateRecs = async () => {
    if (watchlist.length === 0) return;
    setGeneratingRecs(true);
    try {
      const recs = await geminiService.getAiRecommendations(watchlist);
      setAiRecs(recs);
    } catch (err) {
      console.error(err);
      showToast('Failed to generate recommendations', 'error');
    } finally {
      setGeneratingRecs(false);
    }
  };

  const isSaved = (id: number) => watchlist.some(m => m.id === id);

  return (
    <Layout
      activeView={view}
      setView={setView}
      user={user}
      onLogout={handleLogout}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onSearch={handleSearch}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-7xl mx-auto pb-20">

        {/* Auth Page if needed */}
        {view === 'watchlist' && !user && <Auth onAuthSuccess={handleAuth} />}

        {/* Home/Discover View */}
        {(view === 'home' || view === 'trending' || view === 'upcoming' || view === 'latest' || view === 'search') && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  {view === 'home' && 'Discover Movies'}
                  {view === 'trending' && 'Trending Now'}
                  {view === 'upcoming' && 'Upcoming Releases'}
                  {view === 'latest' && 'Released Last 7 Days'}
                  {view === 'search' && `Results for "${searchQuery}"`}
                </h2>
                <p className="text-white/40 text-sm mt-1">
                  Explore the world of cinema with CineWise.
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setView('trending')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'trending' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Trending</button>
                <button onClick={() => setView('upcoming')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'upcoming' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Upcoming</button>
                <button onClick={() => setView('latest')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'latest' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>Last 7 Days</button>
                <button
                  onClick={fetchMovies}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 group"
                  title="Refresh Movies"
                >
                  <RotateCw size={18} className={`${loading ? 'animate-spin' : 'group-active:rotate-180 transition-transform duration-500'}`} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-red-600" size={48} />
                <p className="text-white/40 animate-pulse">Loading amazing films...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {movies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSaved={isSaved(movie.id)}
                    onSave={handleSave}
                    onRemove={handleRemove}
                  />
                ))}
                {movies.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <Film size={48} className="mx-auto text-white/10 mb-4" />
                    <p className="text-white/40">No movies found. Try another search!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Watchlist View */}
        {view === 'watchlist' && user && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-black uppercase tracking-tight">Your Watchlist</h2>
              <p className="text-white/40 text-sm mt-1">Your curated collection of films to watch.</p>
            </div>
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                <Film size={48} className="text-white/10 mb-4" />
                <h3 className="text-xl font-bold mb-2">Your list is empty</h3>
                <p className="text-white/40 mb-6">Start adding movies you want to see!</p>
                <button onClick={() => setView('home')} className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Explore Movies</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {watchlist.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSaved={true}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Recommendation View */}
        {view === 'ai-recommend' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-500/20 mb-6">
                <Sparkles size={18} className="text-purple-400" />
                <span className="text-xs font-black uppercase tracking-widest text-purple-200">AI Recommendation Engine</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">Personalized For You</h2>
              <p className="text-white/40 max-w-xl mx-auto">
                Our Gemini-powered engine analyzes your watchlist to suggest films that match your specific taste and mood.
              </p>
            </div>

            {watchlist.length < 3 ? (
              <div className="glass-panel p-10 rounded-3xl border border-white/10 text-center">
                <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
                <h3 className="text-xl font-bold mb-2">Need More Data</h3>
                <p className="text-white/40 mb-6">Add at least 3 movies to your watchlist so our AI can learn your preferences.</p>
                <button onClick={() => setView('home')} className="bg-white text-black px-6 py-3 rounded-xl font-bold">Go To Discover</button>
              </div>
            ) : (
              <div className="space-y-6">
                {aiRecs.length === 0 && !generatingRecs && (
                  <div className="text-center py-10">
                    <button
                      onClick={generateRecs}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-600/20 transition-all active:scale-95"
                    >
                      GENERATE AI PICKS
                    </button>
                  </div>
                )}

                {generatingRecs && (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse" />
                      <Loader2 className="animate-spin text-purple-500 relative" size={64} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-1">Gemini is Thinking...</h3>
                      <p className="text-white/40 text-sm italic">Analyzing genres, themes, and your recent saves</p>
                    </div>
                  </div>
                )}

                {aiRecs.length > 0 && !generatingRecs && (
                  <div className="space-y-4">
                    {aiRecs.map((rec, idx) => (
                      <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group">
                        <div className="flex items-start gap-4">
                          <div className="bg-purple-600/10 text-purple-400 p-3 rounded-xl">
                            <MessageSquare size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-purple-400 transition-colors mb-2">{rec.title}</h3>
                            <p className="text-white/60 leading-relaxed text-sm">"{rec.reason}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-8 text-center">
                      <button
                        onClick={generateRecs}
                        className="text-white/40 hover:text-white flex items-center gap-2 mx-auto transition-colors"
                      >
                        <Sparkles size={16} /> Regnerate Recommendations
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
