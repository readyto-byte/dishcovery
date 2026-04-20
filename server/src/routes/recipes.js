const express = require('express');
const router = express.Router();
const { searchRecipes, getCachedRecipeResponse, cacheRecipeResponse } = require('../controllers/recipes');
const { addHistoryRecord } = require('../controllers/history');

router.post('/', async (req, res) => {
  try {
    const accountId = req.user?.id;
    const { profiles, conversation, search_query, searchQuery } = req.body;

    if (!accountId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!profiles || !conversation || conversation.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide profiles and at least one conversation message.' });
    }

    const query = search_query ?? searchQuery ?? conversation.map((msg) => msg.content).join(' ');
    const cachedResponse = await getCachedRecipeResponse(query);

    if (cachedResponse) {
      await addHistoryRecord(accountId, {
        search_query: query,
        recipe_id: cachedResponse.suggestions[0]?.id ?? null,
        source_api: 'cache',
        output_response: cachedResponse,
      });

      return res.json({ success: true, response: cachedResponse });
    }

    const response = await searchRecipes({ profiles, conversation });
    const cachedRows = await cacheRecipeResponse(query, response);

    await addHistoryRecord(accountId, {
      search_query: query,
      recipe_id: cachedRows?.[0]?.id ?? null,
      source_api: 'gemini-2.5-flash',
      output_response: response,
    });

    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;