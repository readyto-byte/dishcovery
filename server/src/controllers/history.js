const { supabaseAdmin } = require('../config/supabase');

async function addHistoryRecord(accountId, historyData) {
  const {
    search_query,
    searchQuery,
    recipe_id,
    recipeId,
    source_api,
    sourceApi,
    output_response,
    outputResponse,
  } = historyData;

  const payload = {
    account_id: accountId,
    search_query: search_query ?? searchQuery,
    recipe_id: recipe_id ?? recipeId ?? null,
    source_api: source_api ?? sourceApi ?? null,
    output_response: output_response ?? outputResponse ?? null,
    searched_date: new Date().toISOString(),
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
    .select('id, account_id, search_query, recipe_id, source_api, searched_date, output_response')
    .eq('account_id', accountId)
    .order('searched_date', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
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
