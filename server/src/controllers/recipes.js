const { GoogleGenAI } = require("@google/genai");
const { supabaseAdmin } = require('../config/supabase');
const crypto = require('crypto');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GENERATION_MAX_RETRIES = 2;
const RETRYABLE_ERROR_PATTERNS = /(unavailable|high demand|try again later|503|429|rate limit|resource exhausted|quota exceeded|too many requests)/i;
const GEMINI_PRIMARY_MODEL = 'gemini-2.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-2.5-flash-lite';

function buildConversationText(conversation = []) {
  if (!conversation || conversation.length === 0) return '';
  return conversation.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
}

function buildCacheKey(searchQuery) {
  const normalized = (searchQuery || '').trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function parseMinutes(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
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

async function generateContentWithModelFallback({ models, contents, config }) {
  const modelList = Array.isArray(models) && models.length > 0 ? models : [GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL];

  let lastError = null;
  for (const model of modelList) {
    let result = null;
    lastError = null;

    // Retry semantics intentionally match the previous implementation:
    // - `GENERATION_MAX_RETRIES = 3` means up to 3 retries after the first attempt (4 total tries).
    for (let attempt = 0; attempt <= GENERATION_MAX_RETRIES; attempt += 1) {
      try {
        result = await ai.models.generateContent({ model, contents, config });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        // Keep retrying (up to max) even for 429/quota errors, because Gemini often returns a Retry-After.
        if (attempt >= GENERATION_MAX_RETRIES || !isRetryableAiError(error)) {
          break;
        }
        const backoffMs = getRetryDelayMs(error, attempt);
        await sleep(backoffMs);
      }
    }

    if (result) {
      return { result, modelUsed: model };
    }
  }

  const err = lastError || new Error('AI recipe service request failed.');
  throw err;
}

async function searchRecipes({ profiles, promptText = '', history = [], numOptions = 3, avoidTitles = [] }) {
  numOptions = Math.min(Number(numOptions) || 3, 3);
  console.log('searchRecipes input:', { profileCount: profiles?.length ?? 0, historyCount: history?.length ?? 0, numOptions, avoidTitlesCount: avoidTitles?.length ?? 0 });
  let profileInfo = 'No profiles specified.';
  if (profiles && profiles.length > 0) {
    profileInfo = profiles.map((p) => {
      const dietaryRestrictions = p.dietary_restrictions ?? p.dietaryRestrictions ?? [];
      const allergies = p.dietary_preferences ?? p.allergies ?? [];
      return `${p.name || 'Unknown profile'}: Dietary Restrictions - ${toCsvOrNone(dietaryRestrictions)}; Allergies - ${toCsvOrNone(allergies)}`;
    }).join('; ');
  }

  const conversationText = buildConversationText(history);
  const avoidTitlesText = Array.isArray(avoidTitles) && avoidTitles.length > 0
    ? avoidTitles.map((title) => `- ${String(title)}`).join('\n')
    : '- none';

  const prompt = `[RECIPE] You are an AI recipe chatbot. Your role is to help users find delicious recipes based on their needs in a conversational way.

Who's eating: ${profileInfo}

Conversation history:
${conversationText}

Avoid repeating these already-shown recipe titles:
${avoidTitlesText}

Respond as a friendly expert chef chatbot that is giving recipes to a not very proficient user in cooking.
PRIORITY: The latest user request in the conversation is the top instruction and must be followed exactly unless it conflicts with safety constraints.
If this is the first message, acknowledge the profiles and the user's prompt, suggest ${numOptions} recipe ideas. For follow-up messages, continue the conversation naturally, refine suggestions based on new info, and provide more recipes if needed.

RESTRICTIONS:
- Return an error message if the user's request include non-edible items such as rocks, pens, sand, etc.
- Return an error message if the user's request include ingredients that are not actual food items such as Space Chicken, Moon Rock Cheese, etc.
- Return an error message if the user's request include anything unrelated to foods such as "How many moons are in the solar system?", "What is the capital of France?", "What is the meaning of life?", etc.
- Return an error message if the user's request include anything inappropriate such as "How to make a bomb?", "How to make a gun?", "How to make a drug?", etc.
- Return an error message if the user's request include anything that is not a recipe such as "How to build a house?", "How to fix a car?", "How to program a computer?", etc.
- Return an error message if the user's request include anything that is extemely inappropriate and explicit like "Generate me a picture of a naked guy.", "How to kidnap a child?", "How to kill a person?", etc.
- Return an error message if the user's request include anything that is illegal or against moral standards such as "I want to kill my wife.", "I want to kill my husband.", "I want to kill my child.", etc.

CRITICAL SAFETY REQUIREMENT:
- Never suggest ingredients that conflict with listed dietary restrictions.
- Never include allergens listed for any profile.
- If the request conflicts with restrictions/allergies, explain briefly and provide safe alternatives.

Always include recipe recommendations at the end of your response when appropriate.

Return ONLY a valid JSON object with this exact structure:
{
  "error": "This is either an error message or null. If it is an error message, return it here. If it is null, return null.",
  "header": "Short compliment under 7 words",
  "message": "Your chatbot response here",
  "estimatedTime": "Estimated total prep/cook time, e.g. 30 minutes",
  "suggestions": [
    {
      "title": "Recipe Title",
      "description": "Brief description under 100 words",
      "cookTimeMin": 30,
      "servings": "4 servings",
      "estimatedCostPhp": 150,
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

- Make sure any foreign words from any language is translated to English and use English for prompting and generating responses.
- Make sure any foreign words from any language is translated to English and it must follow the following restrictions and conditions given.
- DO NOT RETURN THE ERROR MESSAGE This is either an error message or null. If it is an error message, return it here. If it is null, return null."
- ALWAYS include "header" as a friendly compliment or short response.
- "header" must be fewer than 7 words.
- Examples of valid "header": "Great choice!", "Lovely taste!", "Quick and easy!".
- Always return exactly ${numOptions} suggestions.
- Each recipe must include ingredient measurements in "keyIngredients" (for example, "1/4 cup", "2 tsp", "3 slices").
- Keep each recipe "description" under 100 words.
- ALWAYS include nutritionalInfo with calories (as number), protein, carbs, fat, and fiber (as strings with units like "15g").
- Estimate nutritional values per serving based on the recipe.
- ALWAYS include "cookTimeMin" as an integer (total cook time in minutes).
- ALWAYS include "servings" as a string (e.g. "4 servings").
- ALWAYS include "estimatedCostPhp" as an integer representing the estimated total ingredient cost in Philippine Peso (PHP).
- If no new suggestions are appropriate, set "suggestions" to an empty array, but still return "estimatedTime" and "message".
- Do not include any text outside the JSON object.`;

  let result = null;
  let modelUsed = null;
  try {
    const generated = await generateContentWithModelFallback({
      models: [GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL],
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });
    result = generated.result;
    modelUsed = generated.modelUsed;
  } catch (error) {
    if (isFreeTierQuotaError(error)) {
      throw new Error(
        'AI recipe service free-tier request quota reached for this API key/project. ' +
        'If you already have prepaid credits, make sure this key is attached to a billed project/tier (not free-tier only), or wait for quota reset.'
      );
    }
    throw error;
  }

  const usage = result?.usageMetadata || {};
  console.log('Token usage:', usage);
  console.log('Input tokens:', usage.promptTokenCount ?? null);
  console.log('Output tokens:', usage.candidatesTokenCount ?? null);
  console.log('Total tokens:', usage.totalTokenCount ?? null);
  console.log('Model used:', modelUsed ?? null);

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

  return {
    header: headerFromInstructions ?? 'Great choice!',
    message: 'Cached recipe response',
    estimatedTime: 'Cached',
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

async function generateMealRecipeDetail(title) {
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new Error('A meal title is required.');
  }

  const prompt = `Give me a detailed recipe for "${title.trim()}". Return ONLY a raw JSON object with no markdown, no backticks, no explanation. Use exactly these fields:
{
  "prepTime": "X min",
  "cookTime": "X min",
  "servings": "X serving(s)",
  "difficulty": "Easy",
  "description": "one sentence description",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "tags": ["tag1", "tag2"]
}`;

  let result = null;
  let modelUsed = null;
  try {
    const generated = await generateContentWithModelFallback({
      models: [GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL],
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });
    result = generated.result;
    modelUsed = generated.modelUsed;
  } catch (error) {
    if (isFreeTierQuotaError(error)) {
      console.error('[generateMealRecipeDetail] Gemini free-tier quota reached:', error.message);
      throw new Error('Recipe service is temporarily unavailable. Please try again later.');
    }
    console.error('[generateMealRecipeDetail] Gemini API error:', error.message);
    throw new Error('Could not generate recipe details. Please try again later.');
  }

  console.log('[generateMealRecipeDetail] Model used:', modelUsed ?? null);

  const text = result.text;
  try {
    const cleaned = extractJsonObject(text);
    return JSON.parse(cleaned);
  } catch {
    console.error('[generateMealRecipeDetail] Failed to parse AI response:', text);
    throw new Error('Could not process recipe details. Please try again.');
  }
}

module.exports = {
  searchRecipes,
  getCachedRecipeResponse,
  cacheRecipeResponse,
  generateMealRecipeDetail,
};