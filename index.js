import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cinewise';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        const maskedUri = MONGO_URI.replace(/:([^@]+)@/, ':****@');
        console.log(`Successfully connected to MongoDB Atlas: ${maskedUri}`);
    })
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes

// Signup
app.post('/api/signup', async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const newUser = new User({ email, name, password });
        await newUser.save();
        // Return user without password
        const { password: _, ...userWithoutPass } = newUser.toObject();
        res.json(userWithoutPass);
    } catch (err) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // In a real app, compare hashed password here
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // In a real app, compare hashed password here
        // const { password: _, ...userWithoutPass } = user.toObject();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Get Watchlist
app.get('/api/watchlist/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.watchlist);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching watchlist' });
    }
});

// Add to Watchlist
app.post('/api/watchlist/:userId', async (req, res) => {
    try {
        const { movie } = req.body;
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if exists
        if (!user.watchlist.find(m => m.id === movie.id)) {
            user.watchlist.push({ ...movie, savedAt: Date.now() });
            await user.save();
        }
        res.json(user.watchlist);
    } catch (err) {
        res.status(500).json({ error: 'Error saving to watchlist' });
    }
});

// Remove from Watchlist
app.delete('/api/watchlist/:userId/:movieId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.watchlist = user.watchlist.filter(m => m.id !== parseInt(req.params.movieId));
        await user.save();
        res.json(user.watchlist);
    } catch (err) {
        res.status(500).json({ error: 'Error removing from watchlist' });
    }
});

// Add to Search History
app.post('/api/search/:userId', async (req, res) => {
    console.log(`Received search save request for user: ${req.params.userId}, query: ${req.body.query}`);
    try {
        const { query } = req.body;
        const user = await User.findById(req.params.userId);
        if (!user) {
            console.error(`User not found for search save: ${req.params.userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        user.searchHistory.push({ query, timestamp: Date.now() });
        if (user.searchHistory.length > 50) {
            user.searchHistory.shift();
        }
        await user.save();
        console.log(`Successfully saved search for user: ${user.email}`);
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving search:', err);
        res.status(500).json({ error: 'Error saving search' });
    }
});

// Get Search History
app.get('/api/search/:userId', async (req, res) => {
    console.log(`Received search history fetch for user: ${req.params.userId}`);
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const history = [...user.searchHistory]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);

        res.json(history);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Error fetching search history' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
