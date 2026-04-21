const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const profilesRoutes = require('./routes/profiles');
const recipesRoutes = require('./routes/recipes');
const historyRoutes = require('./routes/history');
const favoritesRoutes = require('./routes/favorites');
const generateRoutes = require('./routes/generate');
const authMiddleware = require('./middleware/auth');

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', authMiddleware, accountRoutes);
app.use('/api/profiles', authMiddleware, profilesRoutes);
app.use('/api/history', authMiddleware, historyRoutes);
app.use('/api/recipes', authMiddleware, recipesRoutes);
app.use('/api/favorites', authMiddleware, favoritesRoutes);
app.use('/api/generate', generateRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));