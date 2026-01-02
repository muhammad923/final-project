
import React from 'react';
import { Movie } from '../types';
import { tmdbService } from '../services/tmdb';
import { Star, Plus, Check } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  isSaved?: boolean;
  onSave?: (m: Movie) => void;
  onRemove?: (id: number) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, isSaved, onSave, onRemove }) => {
  return (
    <div className="group relative bg-[#151515] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black">
      <div className="aspect-[2/3] relative">
        <img
          src={tmdbService.getPosterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 pt-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center bg-yellow-400/90 text-black px-1.5 py-0.5 rounded text-[10px] font-bold">
              <Star size={10} className="mr-1 fill-black" />
              {movie.vote_average.toFixed(1)}
            </div>
            <div className="text-[10px] text-white/70 font-medium">
              {new Date(movie.release_date).getFullYear()}
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-black uppercase tracking-tight leading-tight text-white group-hover:text-red-500 transition-colors duration-300">
              {movie.title}
            </h3>

            <div className="h-[1.5px] w-8 bg-red-600 group-hover:w-16 transition-all duration-500 opacity-60" />

            <p className="text-[10px] text-white/50 line-clamp-4 leading-relaxed italic group-hover:text-white/80 transition-colors duration-300">
              {movie.overview}
            </p>
          </div>

          <div className="flex gap-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
            {isSaved ? (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove?.(movie.id); }}
                className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
              >
                <Check size={12} /> Saved
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onSave?.(movie); }}
                className="flex-1 bg-white text-black hover:bg-red-600 hover:text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Watchlist
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
