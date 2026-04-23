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

function primaryProfileContext(profiles) {
  if (!Array.isArray(profiles) || profiles.length === 0) return { profile_id: null, profile_name: null };
  const p = profiles[0];
  const rawId = p?.id ?? p?.profile_id;
  const idStr = rawId === undefined || rawId === null || String(rawId).trim() === '' ? null : String(rawId).trim();
  const name = typeof p?.name === 'string' ? p.name.trim() : '';
  return {
    profile_id: idStr,
    profile_name: name || null,
  };
}

router.post('/', async (req, res) => {
  try {
    const accountId = req.user?.id;
    const b = req.body ?? {};
    const profiles = b.profiles;
    const conversation = b.conversation;
    const search_query = b.search_query ?? b.searchQuery;
    const bypass_cache = b.bypass_cache ?? b.bypassCache;
    const avoid_titles = b.avoid_titles ?? b.avoidTitles;
    const { profile_id, profile_name } = primaryProfileContext(profiles);

    if (!accountId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!conversation || conversation.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide at least one conversation message.' });
    }

    const query = search_query ?? conversation.map((msg) => msg.content).join(' ');
    const cacheContext = JSON.stringify((profiles || []).map(normalizeProfileForCache));
    const cacheQuery = `${query}||profiles:${cacheContext}`;
    const shouldBypassCache = Boolean(bypass_cache);
    const cachedResponse = shouldBypassCache ? null : await getCachedRecipeResponse(cacheQuery);

    if (cachedResponse) {
      await addHistoryRecord(accountId, {
        search_query: query,
        recipe_id: cachedResponse.suggestions[0]?.id ?? null,
        source_api: 'cache',
        output_response: cachedResponse,
        profile_id,
        profile_name,
      });

      return res.json({ success: true, response: cachedResponse });
    }

    const response = await searchRecipes({
      profiles,
      conversation,
      avoidTitles: Array.isArray(avoid_titles) ? avoid_titles : [],
    });

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
      profile_id,
      profile_name,
    });

    res.json({ success: true, response: responseWithIds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;