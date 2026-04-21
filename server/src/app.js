const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');
const { supabase } = require('./config/supabase');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const profilesRoutes = require('./routes/profiles');
const recipesRoutes = require('./routes/recipes');
const historyRoutes = require('./routes/history');
const favoritesRoutes = require('./routes/favorites');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'https://godishcovery.com',
    'https://www.godishcovery.com', 
    'https://dishcovery-nu-seven.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true,
}));
app.use(express.json());

// Auth middleware to set req.user
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Token verification failed' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', authMiddleware, accountRoutes);
app.use('/api/profiles', authMiddleware, profilesRoutes);
app.use('/api/history', authMiddleware, historyRoutes);
app.use('/api/recipes', authMiddleware, recipesRoutes);
app.use('/api/favorites', authMiddleware, favoritesRoutes);

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    res.json({ response: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));