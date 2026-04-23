const { supabaseAdmin } = require('../config/supabase');

function parseMinutes(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
}

async function createRecipeFromHistoryPayload(sourceApi, outputResponse) {
  const suggestion = outputResponse?.suggestions?.[0];
  if (!suggestion || !suggestion.title) {
    return null;
  }

  const normalizedSuggestion = {
    ...suggestion,
    // Keep field naming consistent for consumers that expect `keyIngredients`.
    keyIngredients: suggestion.keyIngredients ?? suggestion.key_ingredients ?? [],
  };

  const recipeRecord = {
    title: suggestion.title,
    source_api: sourceApi || 'gemini-2.5-flash',
    external_id: null,
    image_url: suggestion.imageUrl ?? null,
    prep_time_min: parseMinutes(suggestion.prepTimeMin ?? suggestion.prep_time_min ?? outputResponse?.estimatedTime),
    cook_time_min: parseMinutes(suggestion.cookTimeMin ?? suggestion.cook_time_min),
    servings: suggestion.servings ?? null,
    // `instructions` is a text column; store the full suggestion as JSON string.
    instructions: JSON.stringify(normalizedSuggestion),
    // `nutritional_info` is a JSON column; store as object (not string).
    nutritional_info: suggestion.nutritionalInfo ?? null,
    cached_date: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .insert([recipeRecord])
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

async function addHistoryRecord(accountId, historyData) {
  const resolvedSearchQuery = historyData.search_query ?? historyData.searchQuery;
  const resolvedSourceApi = historyData.source_api ?? historyData.sourceApi ?? null;
  const resolvedSource = historyData.source ?? null;
  const resolvedOutputResponse = historyData.output_response ?? historyData.outputResponse ?? null;
  const resolvedProfileId = historyData.profile_id ?? historyData.profileId ?? null;
  let resolvedRecipeId = historyData.recipe_id ?? historyData.recipeId ?? null;

  if (!resolvedRecipeId && resolvedOutputResponse) {
    resolvedRecipeId = await createRecipeFromHistoryPayload(resolvedSourceApi, resolvedOutputResponse);
  }

  const payload = {
    account_id: accountId,
    search_query: resolvedSearchQuery,
    recipe_id: resolvedRecipeId,
    source_api: resolvedSourceApi,
    source: resolvedSource,
    output_response: resolvedOutputResponse,
    searched_date: new Date().toISOString(),
    profile_id: resolvedProfileId,
  };

  const { data, error } = await supabaseAdmin
    .from('history')
    .insert([payload])
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function getHistoryByAccount(accountId) {
  const { data, error } = await supabaseAdmin
    .from('history')
    .select('id, account_id, search_query, recipe_id, source_api, searched_date, output_response, profile_id, source')
    .eq('account_id', accountId)
    .order('searched_date', { ascending: false });

  if (error) {
    throw error;
  }

  const { data: profileRows } = await supabaseAdmin
    .from('profile')
    .select('id, name, avatar_url')
    .eq('account_id', accountId);

  const profileMap = {};
  (profileRows || []).forEach((p) => {
    profileMap[String(p.id)] = { name: p.name, avatar_url: p.avatar_url };
  });

  return (data || []).map((row) => ({
    ...row,
    profiles: row.profile_id ? (profileMap[String(row.profile_id)] ?? null) : null,
  }));
}

async function clearHistoryByAccount(accountId) {
  const { error } = await supabaseAdmin
    .from('history')
    .delete()
    .eq('account_id', accountId);

  if (error) {
    throw error;
  }
}

module.exports = {
  addHistoryRecord,
  getHistoryByAccount,
  clearHistoryByAccount,
};
