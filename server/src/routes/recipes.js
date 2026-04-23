const express = require('express');
const router = express.Router();
const { searchRecipes, generateMealRecipeDetail } = require('../controllers/recipes');
const { supabaseAdmin } = require('../config/supabase');

function hasRecipeError(errorValue) {
  if (errorValue === null || errorValue === undefined) return false;
  const normalized = String(errorValue).trim().toLowerCase();
  return normalized !== '' && normalized !== 'null';
}

function isLikelyJumbledToken(token) {
  const clean = String(token || '').toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length < 4) return false;
  const vowelCount = (clean.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelCount / clean.length;
  if (vowelCount === 0) return true;
  if (clean.length >= 7 && vowelRatio < 0.15) return true;
  return false;
}

function isGibberish(text) {
  const tokens = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const jumbledCount = tokens.filter(isLikelyJumbledToken).length;
  return jumbledCount / tokens.length > 0.5;
}

const FOUL_WORD_PATTERN = /\b(f+u+c+k+(?:ing|er|ed|s)?|s+h+i+t+(?:ty|s)?|b+i+t+c+h+(?:es)?|c+u+n+t+|w+h+o+r+e+(?:s)?|s+l+u+t+(?:s)?|a+s+s+h+o+l+e+(?:s)?|n+i+g+g+e+r+(?:s)?|f+a+g+g+?o+t+(?:s)?|d+y+k+e+(?:s)?|r+e+t+a+r+d+(?:ed|s)?|p+e+d+o+(?:phile)?|c+h+i+l+d+p+o+r+n|p+o+r+n+o?(?:graphy)?)\b/i;

function hasFoulLanguage(text) {
  return FOUL_WORD_PATTERN.test(String(text || ''));
}

router.post('/', async (req, res) => {
  try {
    const accountId = req.user?.id;
    const profiles = req.body?.profiles;
    const rawPromptText = req.body?.promptText ?? req.body?.search_query ?? req.body?.searchQuery ?? '';
    const conversation = Array.isArray(req.body?.conversation) ? req.body.conversation : [];
    const history = Array.isArray(req.body?.history) ? req.body.history : conversation;
    const numOptions = Math.min(Number(req.body?.numOptions) || 3, 3);
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

    if (hasFoulLanguage(promptText)) {
      return res.status(400).json({ success: false, error: 'Your prompt contains inappropriate language. Please keep it respectful.' });
    }

    if (isGibberish(promptText)) {
      return res.status(400).json({ success: false, error: 'Your prompt appears to be gibberish. Please enter a valid food or recipe request.' });
    }

    // Hydrate profile details (dietary restrictions/preferences) when client only sends {id,name,avatar}.
    // This ensures prompt includes correct restrictions/allergies and the AI is constrained properly.
    let resolvedProfiles = Array.isArray(profiles) ? profiles : [];
    const profileIds = resolvedProfiles
      .map((p) => p?.id ?? p?.profile_id ?? p?.profileId ?? null)
      .filter(Boolean);

    if (profileIds.length > 0) {
      const { data: profileRows, error: profileErr } = await supabaseAdmin
        .from('profile')
        .select('id, name, dietary_restrictions, dietary_preferences')
        .eq('account_id', accountId)
        .in('id', profileIds);

      if (profileErr) {
        throw profileErr;
      }

      if (Array.isArray(profileRows) && profileRows.length > 0) {
        // Merge DB fields onto provided objects (preserve any client fields like avatar_url).
        const map = new Map(profileRows.map((p) => [String(p.id), p]));
        resolvedProfiles = resolvedProfiles.map((p) => {
          const id = p?.id ?? p?.profile_id ?? p?.profileId ?? null;
          const db = id ? map.get(String(id)) : null;
          return db ? { ...p, ...db } : p;
        });
      }
    }

    const response = await searchRecipes({
      profiles: resolvedProfiles,
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