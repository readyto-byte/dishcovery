const { supabaseAdmin } = require('../config/supabase');

async function addHistoryRecord(accountId, historyData) {
  const resolvedSearchQuery = historyData.search_query ?? historyData.searchQuery;
  const resolvedRecipeId = historyData.recipe_id ?? historyData.recipeId ?? null;
  const resolvedSourceApi = historyData.source_api ?? historyData.sourceApi ?? null;
  const resolvedOutputResponse = historyData.output_response ?? historyData.outputResponse ?? null;
  const resolvedProfileId = historyData.profile_id ?? historyData.profileId ?? null;
  const resolvedSource = historyData.source ?? null;

  const payload = {
    account_id: accountId,
    search_query: resolvedSearchQuery,
    recipe_id: resolvedRecipeId,
    source_api: resolvedSourceApi,
    output_response: resolvedOutputResponse,
    searched_date: new Date().toISOString(),
    profile_id: resolvedProfileId,
    source: resolvedSource,
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
