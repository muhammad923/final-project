
import { TMDBResponse } from '../types';

const API_BEARER = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const headers = {
  'Authorization': API_BEARER,
  'Content-Type': 'application/json;charset=utf-8'
};

export const tmdbService = {
  async getTrending(): Promise<TMDBResponse> {
    const res = await fetch(`${BASE_URL}/trending/movie/week`, { headers });
    return res.json();
  },

  async getUpcoming(): Promise<TMDBResponse> {
    const res = await fetch(`${BASE_URL}/movie/upcoming`, { headers });
    return res.json();
  },

  async getLatest7Days(): Promise<TMDBResponse> {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const url = `${BASE_URL}/discover/movie?primary_release_date.gte=${formatDate(lastWeek)}&primary_release_date.lte=${formatDate(today)}&sort_by=primary_release_date.desc`;
    const res = await fetch(url, { headers });
    return res.json();
  },

  async searchMovies(query: string): Promise<TMDBResponse> {
    const res = await fetch(`${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`, { headers });
    return res.json();
  },

  async getMovieDetails(id: number) {
    const res = await fetch(`${BASE_URL}/movie/${id}`, { headers });
    return res.json();
  },

  getPosterUrl(path: string, size: string = 'w500') {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://picsum.photos/500/750?grayscale';
  },

  getBackdropUrl(path: string, size: string = 'original') {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://picsum.photos/1920/1080?blur=10';
  }
};
