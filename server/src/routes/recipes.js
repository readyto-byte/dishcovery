const express = require('express');
const router = express.Router();
const { searchRecipes, getCachedRecipeResponse, cacheRecipeResponse } = require('../controllers/recipes');
const { addHistoryRecord } = require('../controllers/history');

function normalizeProfileForCache(profile = {}) {
  const restrictions = Array.isArray(profile.dietary_restrictions)
    ? profile.dietary_restrictions
    : Array.isArray(profile.dietaryRestrictions)
      ? profile.dietaryRestrictions
      : [];
  const allergies = Array.isArray(profile.dietary_preferences)
    ? profile.dietary_preferences
    : Array.isArray(profile.allergies)
      ? profile.allergies
      : [];

  return {
    id: profile.id ?? null,
    name: profile.name ?? '',
    dietary_restrictions: [...restrictions].sort(),
    dietary_preferences: [...allergies].sort(),
  };
}

router.post('/', async (req, res) => {
  try {
    const accountId = req.user?.id;
    const { profiles, conversation, search_query, searchQuery } = req.body;

    if (!accountId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!conversation || conversation.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide at least one conversation message.' });
    }

    const query = search_query ?? searchQuery ?? conversation.map((msg) => msg.content).join(' ');
    const cacheContext = JSON.stringify((profiles || []).map(normalizeProfileForCache));
    const cacheQuery = `${query}||profiles:${cacheContext}`;
    const cachedResponse = await getCachedRecipeResponse(cacheQuery);

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
    const cachedRows = await cacheRecipeResponse(cacheQuery, response);

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