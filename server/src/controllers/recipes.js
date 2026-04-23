const { GoogleGenAI } = require("@google/genai");
const { supabaseAdmin } = require('../config/supabase');
const crypto = require('crypto');
const { parseMinutes, estimatedTimeLabelFromSuggestions } = require('../utils/recipeTime');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GENERATION_MAX_RETRIES = 3;
const RETRYABLE_ERROR_PATTERNS = /(unavailable|high demand|try again later|503|429|rate limit|resource exhausted|quota exceeded|too many requests)/i;

function buildConversationText(conversation = []) {
  if (!conversation || conversation.length === 0) return '';
  return conversation.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
}

function buildCacheKey(searchQuery) {
  const normalized = (searchQuery || '').trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function toCsvOrNone(values) {
  const list = asArray(values).map((item) => String(item).trim()).filter(Boolean);
  return list.length > 0 ? list.join(', ') : 'none';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonObject(text = '') {
  const trimmed = String(text || '').replace(/```json\n?|\n?```/g, '').trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return trimmed;
  }
  return trimmed.slice(firstBrace, lastBrace + 1);
}

function isRetryableAiError(error) {
  const message = String(error?.message || '');
  const statusCode = Number(error?.status ?? error?.code ?? 0);
  return statusCode === 429 || statusCode === 503 || RETRYABLE_ERROR_PATTERNS.test(message);
}

function getRetryDelayMs(error, attempt) {
  const message = String(error?.message || '');
  const retryAfterMatch = message.match(/retry in\s+([\d.]+)\s*s/i);
  if (retryAfterMatch) {
    const seconds = Number(retryAfterMatch[1]);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.ceil(seconds * 1000) + 250;
    }
  }

  const exponentialBackoffMs = 750 * (2 ** attempt);
  const jitterMs = Math.floor(Math.random() * 250);
  return exponentialBackoffMs + jitterMs;
}

function isFreeTierQuotaError(error) {
  const message = String(error?.message || '');
  return /free_tier|quota exceeded.*free tier|generate_content_free_tier_requests/i.test(message);
}

async function searchRecipes({ profiles, conversation = [], avoidTitles = [] }) {
  console.log('searchRecipes input:', { profileCount: profiles?.length ?? 0, conversationCount: conversation?.length ?? 0, avoidTitlesCount: avoidTitles?.length ?? 0 });
  let profileInfo = 'No profiles specified.';
  if (profiles && profiles.length > 0) {
    profileInfo = profiles.map((p) => {
      const dietaryRestrictions = p.dietary_restrictions ?? p.dietaryRestrictions ?? [];
      const allergies = p.dietary_preferences ?? p.allergies ?? [];
      return `${p.name || 'Unknown profile'}: Dietary Restrictions - ${toCsvOrNone(dietaryRestrictions)}; Allergies - ${toCsvOrNone(allergies)}`;
    }).join('; ');
  }

  const conversationText = buildConversationText(conversation);
  const avoidTitlesText = Array.isArray(avoidTitles) && avoidTitles.length > 0
    ? avoidTitles.map((title) => `- ${String(title)}`).join('\n')
    : '- none';

  const prompt = `You are an AI recipe chatbot. Your role is to help users find delicious recipes based on their needs in a conversational way.

Who's eating: ${profileInfo}

Conversation history:
${conversationText}

Avoid repeating these already-shown recipe titles:
${avoidTitlesText}

Respond as a friendly expert chef chatbot that is giving recipes to a not very proficient user in cooking.
PRIORITY: The latest user request in the conversation is the top instruction and must be followed exactly unless it conflicts with safety constraints.
If this is the first message, acknowledge the profiles and the user's prompt, suggest 2-3 recipe ideas. For follow-up messages, continue the conversation naturally, refine suggestions based on new info, and provide more recipes if needed.

CRITICAL SAFETY REQUIREMENT:
- Never suggest ingredients that conflict with listed dietary restrictions.
- Never include allergens listed for any profile.
- If the request conflicts with restrictions/allergies, explain briefly and provide safe alternatives.

Always include recipe recommendations at the end of your response when appropriate.

Return ONLY a valid JSON object with this exact structure:
{
  "header": "Short compliment under 7 words",
  "message": "Your chatbot response here",
  "estimatedTime": "Estimated total prep/cook time, e.g. 30 minutes",
  "suggestions": [
    {
      "title": "Recipe Title",
      "description": "Brief description under 100 words",
      "keyIngredients": ["1/4 cup flour", "2 large eggs"],
      "whyItFits": "Why this recipe matches their needs",
      "instructions": ["Step 1", "Step 2", ...],
      "tips": "Any special tips",
      "nutritionalInfo": {
        "calories": 250,
        "protein": "15g",
        "carbs": "30g",
        "fat": "8g",
        "fiber": "5g"
      }
    }
  ]
}

- ALWAYS include "header" as a friendly compliment or short response.
- "header" must be fewer than 7 words.
- Examples of valid "header": "Great choice!", "Lovely taste!", "Quick and easy!".
- Always return exactly 3 suggestions.
- Each recipe must include ingredient measurements in "keyIngredients" (for example, "1/4 cup", "2 tsp", "3 slices").
- Keep each recipe "description" under 100 words.
- ALWAYS include nutritionalInfo with calories (as number), protein, carbs, fat, and fiber (as strings with units like "15g").
- Estimate nutritional values per serving based on the recipe.
- If no new suggestions are appropriate, set "suggestions" to an empty array, but still return "estimatedTime" and "message".
- Do not include any text outside the JSON object.`;

  let result = null;
  let lastError = null;

  for (let attempt = 0; attempt <= GENERATION_MAX_RETRIES; attempt += 1) {
    try {
      result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      if (attempt >= GENERATION_MAX_RETRIES || !isRetryableAiError(error)) {
        break;
      }
      const backoffMs = getRetryDelayMs(error, attempt);
      await sleep(backoffMs);
    }
  }

  if (!result && lastError) {
    if (isFreeTierQuotaError(lastError)) {
      throw new Error(
        'Gemini free-tier request quota reached for this API key/project. ' +
        'If you already have prepaid credits, make sure this key is attached to a billed project/tier (not free-tier only), or wait for quota reset.'
      );
    }
    throw lastError;
  }

  const usage = result?.usageMetadata || {};
  console.log('Token usage:', usage);
  console.log('Input tokens:', usage.promptTokenCount ?? null);
  console.log('Output tokens:', usage.candidatesTokenCount ?? null);
  console.log('Total tokens:', usage.totalTokenCount ?? null);

  const text = result.text;

  try {
    const cleaned = extractJsonObject(text);
    const response = JSON.parse(cleaned);
    return response;
  } catch (error) {
    throw new Error('Failed to parse chatbot response from AI: ' + text);
  }
}

async function getCachedRecipeResponse(searchQuery) {
  const cacheKey = buildCacheKey(searchQuery);
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select('*')
    .eq('external_id', cacheKey)
    .eq('source_api', 'gemini-2.5-flash')
    .order('cached_date', { ascending: false });

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const suggestions = data.map((row) => {
    try {
      const parsed = JSON.parse(row.instructions);
      if (parsed && typeof parsed === 'object' && parsed.title) {
        const nutritionalInfo = row.nutritional_info ? JSON.parse(row.nutritional_info) : null;
        return { id: row.id, ...parsed, nutritionalInfo };
      }
    } catch (err) {
      // ignore parse errors and fall back to field mapping
    }

    let nutritionalInfo = null;
    try {
      nutritionalInfo = row.nutritional_info ? JSON.parse(row.nutritional_info) : null;
    } catch (err) {
      // ignore
    }

    return {
      id: row.id,
      title: row.title,
      description: '',
      keyIngredients: [],
      whyItFits: '',
      instructions: row.instructions ? (Array.isArray(row.instructions) ? row.instructions : [row.instructions]) : [],
      tips: '',
      imageUrl: row.image_url || null,
      prepTimeMin: row.prep_time_min || null,
      cookTimeMin: row.cook_time_min || null,
      servings: row.servings || null,
      nutritionalInfo,
    };
  });

  const headerFromInstructions = suggestions.find((item) => typeof item.header === 'string' && item.header.trim())?.header;
  const estimatedTime = estimatedTimeLabelFromSuggestions(suggestions) ?? 'N/A';

  return {
    header: headerFromInstructions ?? 'Great choice!',
    message: 'Cached recipe response',
    estimatedTime,
    suggestions,
  };
}

async function cacheRecipeResponse(searchQuery, response) {
  if (!response || !Array.isArray(response.suggestions) || response.suggestions.length === 0) {
    return null;
  }

  const cacheKey = buildCacheKey(searchQuery);
  const records = response.suggestions.map((suggestion) => ({
    title: suggestion.title,
    source_api: 'gemini-2.5-flash',
    external_id: cacheKey,
    image_url: suggestion.imageUrl ?? null,
    prep_time_min: parseMinutes(suggestion.prepTimeMin ?? suggestion.prep_time_min ?? suggestion.estimatedTime),
    cook_time_min: parseMinutes(suggestion.cookTimeMin ?? suggestion.cook_time_min),
    servings: suggestion.servings ?? null,
    instructions: JSON.stringify({
      ...suggestion,
      header: response.header ?? null,
    }),
    nutritional_info: suggestion.nutritionalInfo ? JSON.stringify(suggestion.nutritionalInfo) : null,
    cached_date: new Date().toISOString(),
  }));

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .insert(records)
    .select('*');

  if (error) {
    throw error;
  }

  return data;
}

module.exports = {
  searchRecipes,
  getCachedRecipeResponse,
  cacheRecipeResponse,
};