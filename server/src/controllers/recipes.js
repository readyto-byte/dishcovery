const { GoogleGenAI } = require("@google/genai");
const { supabaseAdmin } = require('../config/supabase');
const crypto = require('crypto');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

async function searchRecipes({ profiles, conversation = [] }) {
  let profileInfo = 'No profiles specified.';
  if (profiles && profiles.length > 0) {
    profileInfo = profiles.map((p) => {
      return `${p.name}: Dietary Restrictions - ${p.dietary_restrictions || 'none'}, Preferences - ${p.dietary_preferences || 'none'}`;
    }).join('; ');
  }

  const conversationText = buildConversationText(conversation);

  const prompt = `You are an AI recipe chatbot. Your role is to help users find delicious recipes based on their needs in a conversational way.

Who's eating: ${profileInfo}

Conversation history:
${conversationText}

Respond as a friendly expert chef chatbot that is giving recipes to a not very proficient user in cooking. If this is the first message, acknowledge the profiles and the user's prompt, suggest 2-3 recipe ideas. For follow-up messages, continue the conversation naturally, refine suggestions based on new info, and provide more recipes if needed.

Always include recipe recommendations at the end of your response when appropriate.

Return ONLY a valid JSON object with this exact structure:
{
  "message": "Your chatbot response here",
  "estimatedTime": "Estimated total prep/cook time, e.g. 30 minutes",
  "suggestions": [
    {
      "title": "Recipe Title",
      "description": "Brief description",
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

- Always return between 2 and 3 suggestions.
- Each recipe must include ingredient measurements in "keyIngredients" (for example, "1/4 cup", "2 tsp", "3 slices").
- ALWAYS include nutritionalInfo with calories (as number), protein, carbs, fat, and fiber (as strings with units like "15g").
- Estimate nutritional values per serving based on the recipe.
- If no new suggestions are appropriate, set "suggestions" to an empty array, but still return "estimatedTime" and "message".
- Do not include any text outside the JSON object.`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });

  console.log('Token usage:', result.usageMetadata);
  console.log('Input tokens:', result.usageMetadata.promptTokenCount);
  console.log('Output tokens:', result.usageMetadata.candidatesTokenCount);
  console.log('Total tokens:', result.usageMetadata.totalTokenCount);

  const text = result.text;

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
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

  return {
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
    instructions: JSON.stringify(suggestion),
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