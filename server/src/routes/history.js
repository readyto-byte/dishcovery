const express = require('express');
const router = express.Router();
const { addHistoryRecord, getHistoryByAccount, clearHistoryByAccount } = require('../controllers/history');

// Create a history record for the authenticated user
router.post('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const { search_query, searchQuery, recipe_id, recipeId, source_api, sourceApi, output_response, outputResponse } = req.body;

    const query = search_query ?? searchQuery;
    if (!query) {
      return res.status(400).json({ success: false, error: 'search_query is required' });
    }

    const history = await addHistoryRecord(accountId, {
      search_query: query,
      recipe_id,
      recipeId,
      source_api,
      sourceApi,
      output_response,
      outputResponse,
    });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get history records for the authenticated user
router.get('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const history = await getHistoryByAccount(accountId);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all history records for the authenticated user
router.delete('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    await clearHistoryByAccount(accountId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
