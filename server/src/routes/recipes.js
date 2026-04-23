const express = require('express');
const router = express.Router();
const { searchRecipes, getCachedRecipeResponse, cacheRecipeResponse, generateMealRecipeDetail } = require('../controllers/recipes');
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
    const profiles = req.body?.profiles;
    const promptText = req.body?.promptText ?? '';
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const numOptions = Number(req.body?.numOptions) || 3;
    const resolvedSearchQuery = req.body?.search_query ?? req.body?.searchQuery;
    const resolvedBypassCache = Boolean(req.body?.bypass_cache ?? req.body?.bypassCache);
    const resolvedAvoidTitles = Array.isArray(req.body?.avoid_titles)
      ? req.body.avoid_titles
      : (Array.isArray(req.body?.avoidTitles) ? req.body.avoidTitles : []);

    if (!accountId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!promptText.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a prompt.' });
    }

    const query = resolvedSearchQuery ?? promptText;
    const cacheContext = JSON.stringify((profiles || []).map(normalizeProfileForCache));
    const cacheQuery = `${query}||profiles:${cacheContext}`;
    const cachedResponse = resolvedBypassCache ? null : await getCachedRecipeResponse(cacheQuery);

    if (cachedResponse) {
      return res.json({ success: true, response: cachedResponse });
    }

    const response = await searchRecipes({
      profiles,
      promptText,
      history,
      numOptions,
      avoidTitles: resolvedAvoidTitles,
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
        profile_id: profiles?.[0]?.id ?? null,
        source: 'error',
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

    res.json({ success: true, response: responseWithIds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/meal-detail', async (req, res) => {
  try {
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { title } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'A meal title is required.' });
    }

    const detail = await generateMealRecipeDetail(title);
    res.json({ success: true, detail });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;