const express = require('express');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');
const { supabase } = require('./config/supabase');
const authRoutes = require('./routes/auth');
const profilesRoutes = require('./routes/profiles');
const recipesRoutes = require('./routes/recipes');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'public')));

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
app.use('/api/profiles', authMiddleware, profilesRoutes);
app.use('/api/recipes', recipesRoutes);

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

// Catch-all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));