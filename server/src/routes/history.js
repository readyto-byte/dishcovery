const express = require('express');
const router = express.Router();
const { addHistoryRecord, getHistoryByAccount, clearHistoryByAccount } = require('../controllers/history');

// Create a history record for the authenticated user
router.post('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const resolvedSearchQuery = req.body.search_query ?? req.body.searchQuery;
    const resolvedRecipeId = req.body.recipe_id ?? req.body.recipeId ?? null;
    const resolvedSourceApi = req.body.source_api ?? req.body.sourceApi ?? null;
    const resolvedOutputResponse = req.body.output_response ?? req.body.outputResponse ?? null;
    const resolvedProfileId = req.body.profile_id ?? req.body.profileId ?? null;
    const resolvedSource = req.body.source ?? null;

    if (!resolvedSearchQuery) {
      return res.status(400).json({ success: false, error: 'search_query is required' });
    }

    const history = await addHistoryRecord(accountId, {
      search_query: resolvedSearchQuery,
      recipe_id: resolvedRecipeId,
      source_api: resolvedSourceApi,
      output_response: resolvedOutputResponse,
      profile_id: resolvedProfileId,
      source: resolvedSource,
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
