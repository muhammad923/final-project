
import { WatchlistItem, User } from '../types';

/**
 * NOTE: In a production app, these functions would call a Node.js API 
 * that connects to a real MongoDB instance. For this standalone React app, 
 * we use LocalStorage to mimic the behavior of a persistent store.
 */

export const dbService = {
  // Authentication
  async signup(user: Omit<User, 'id'> & { password?: string }): Promise<User> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Signup failed');
    const data = await res.json();
    return { ...data, id: data._id }; // Map _id to id
  },

  async login(email: string, password: string): Promise<User | null> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    return { ...data, id: data._id }; // Map _id to id
  },

  // Watchlist
  async saveToWatchlist(userId: string, movie: any): Promise<void> {
    await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movie })
    });
  },

  async removeFromWatchlist(userId: string, movieId: number): Promise<void> {
    await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${userId}/${movieId}`, {
      method: 'DELETE'
    });
  },

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${userId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async saveSearch(userId: string, query: string): Promise<void> {
    await fetch(`${import.meta.env.VITE_API_URL}/search/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
  },

  async getSearchHistory(userId: string): Promise<{ query: string, timestamp: number }[]> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/search/${userId}`);
    if (!res.ok) return [];
    return res.json();
  }
};
