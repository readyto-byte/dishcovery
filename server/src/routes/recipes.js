const express = require('express');
const router = express.Router();
const { searchRecipes, generateMealRecipeDetail } = require('../controllers/recipes');

function hasRecipeError(errorValue) {
  if (errorValue === null || errorValue === undefined) return false;
  const normalized = String(errorValue).trim().toLowerCase();
  return normalized !== '' && normalized !== 'null';
}

router.post('/', async (req, res) => {
  try {
    const accountId = req.user?.id;
    const profiles = req.body?.profiles;
    const rawPromptText = req.body?.promptText ?? req.body?.search_query ?? req.body?.searchQuery ?? '';
    const conversation = Array.isArray(req.body?.conversation) ? req.body.conversation : [];
    const history = Array.isArray(req.body?.history) ? req.body.history : conversation;
    const numOptions = Number(req.body?.numOptions) || 3;
    const resolvedAvoidTitles = Array.isArray(req.body?.avoid_titles)
      ? req.body.avoid_titles
      : (Array.isArray(req.body?.avoidTitles) ? req.body.avoidTitles : []);

    if (!accountId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const conversationLatestText = Array.isArray(conversation) && conversation.length > 0
      ? String(conversation[conversation.length - 1]?.content ?? '').trim()
      : '';
    const historyLatestText = Array.isArray(history) && history.length > 0
      ? String(history[history.length - 1]?.content ?? '').trim()
      : '';
    const promptText = String(rawPromptText || conversationLatestText || historyLatestText).trim();

    if (!promptText) {
      return res.status(400).json({ success: false, error: 'Please provide a prompt.' });
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

      return res.json({ success: true, response: blockedResponse });
    }
    // Keep generated suggestions transient; persistence happens only when user manually saves/views.
    const transientResponse = {
      ...response,
      suggestions: Array.isArray(response?.suggestions)
        ? response.suggestions.map((suggestion) => ({
            ...suggestion,
            id: null,
          }))
        : [],
    };

    res.json({ success: true, response: transientResponse });
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