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

function hasRecipeError(errorValue) {
  if (errorValue === null || errorValue === undefined) return false;
  const normalized = String(errorValue).trim().toLowerCase();
  return normalized !== '' && normalized !== 'null';
}

router.post('/', async (req, res) => {
  try {
    const accountId = req.user?.id;
    const { profiles, conversation, search_query, searchQuery, bypass_cache, bypassCache, avoid_titles, avoidTitles } = req.body;

    if (!accountId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!conversation || conversation.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide at least one conversation message.' });
    }

    const query = search_query ?? searchQuery ?? conversation.map((msg) => msg.content).join(' ');
    const cacheContext = JSON.stringify((profiles || []).map(normalizeProfileForCache));
    const cacheQuery = `${query}||profiles:${cacheContext}`;
    const shouldBypassCache = Boolean(bypass_cache ?? bypassCache);
    const cachedResponse = shouldBypassCache ? null : await getCachedRecipeResponse(cacheQuery);

    if (cachedResponse) {
      await addHistoryRecord(accountId, {
        search_query: query,
        recipe_id: cachedResponse.suggestions[0]?.id ?? null,
        source_api: 'cache',
        output_response: cachedResponse,
      });

      return res.json({ success: true, response: cachedResponse });
    }

    const response = await searchRecipes({
      profiles,
      conversation,
      avoidTitles: Array.isArray(avoid_titles) ? avoid_titles : (Array.isArray(avoidTitles) ? avoidTitles : []),
    });

    if (hasRecipeError(response?.error)) {
      const blockedResponse = {
        ...response,
        suggestions: [],
      };

      await addHistoryRecord(accountId, {
        search_query: query,
        recipe_id: null,
        source_api: 'gemini-2.5-flash',
        output_response: blockedResponse,
      });

      return res.json({ success: true, response: blockedResponse });
    }

    const cachedRows = await cacheRecipeResponse(cacheQuery, response);
    const responseWithIds = {
      ...response,
      suggestions: Array.isArray(response?.suggestions)
        ? response.suggestions.map((suggestion, index) => ({
            ...suggestion,
            id: cachedRows?.[index]?.id ?? suggestion?.id ?? null,
          }))
        : [],
    };

    await addHistoryRecord(accountId, {
      search_query: query,
      recipe_id: cachedRows?.[0]?.id ?? null,
      source_api: 'gemini-2.5-flash',
      output_response: responseWithIds,
    });

    res.json({ success: true, response: responseWithIds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;