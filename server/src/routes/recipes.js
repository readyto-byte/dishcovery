const express = require('express');
const router = express.Router();
const { searchRecipes } = require('../controllers/recipes');

router.post('/', async (req, res) => {
  try {
    const { profiles, conversation } = req.body;

    if (!profiles || !conversation || conversation.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide profiles and at least one conversation message.' });
    }

    const response = await searchRecipes({ profiles, conversation });
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;