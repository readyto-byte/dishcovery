const express = require('express');
const router = express.Router();
const {
  getFavoritesByAccount,
  addFavorite,
  deleteFavoriteById,
  clearFavoritesByAccount,
} = require('../controllers/favorites');

// Get favorites for the authenticated user
router.get('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const favorites = await getFavoritesByAccount(accountId);
    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a favorite for the authenticated user
router.post('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const favorite = await addFavorite(accountId, req.body || {});
    res.json({ success: true, data: favorite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete one favorite by id for the authenticated user
router.delete('/:favoriteId', async (req, res) => {
  try {
    const accountId = req.user.id;
    const { favoriteId } = req.params;
    await deleteFavoriteById(accountId, favoriteId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all favorites for the authenticated user
router.delete('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    await clearFavoritesByAccount(accountId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
