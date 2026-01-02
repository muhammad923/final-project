import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        // In a real app, this should be hashed. 
        // For this simple demo as requested, we might store it or omit if using simple auth. 
        // Based on the frontend simple auth (just email/name), we might not need password or it's optional.
        // Let's add it as optional for now since the frontend form has it.
        required: false
    },
    watchlist: [{
        id: Number,
        title: String,
        overview: String,
        poster_path: String,
        backdrop_path: String,
        release_date: String,
        vote_average: Number,
        savedAt: {
            type: Number,
            default: () => Date.now()
        }
    }],
    searchHistory: [{
        query: String,
        timestamp: {
            type: Number,
            default: () => Date.now()
        }
    }]
});

export const User = mongoose.model('User', UserSchema);
