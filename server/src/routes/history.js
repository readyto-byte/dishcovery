const express = require('express');
const router = express.Router();
const { addHistoryRecord, getHistoryByAccount, clearHistoryByAccount } = require('../controllers/history');

// Create a history record for the authenticated user
router.post('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const b = req.body ?? {};
    const query = b.search_query ?? b.searchQuery;
    if (!query) {
      return res.status(400).json({ success: false, error: 'search_query is required' });
    }

    const history = await addHistoryRecord(accountId, {
      search_query: query,
      recipe_id: b.recipe_id ?? b.recipeId,
      source_api: b.source_api ?? b.sourceApi,
      output_response: b.output_response ?? b.outputResponse,
      profile_id: b.profile_id ?? b.profileId,
      profile_name: b.profile_name ?? b.profileName,
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
