const { supabaseAdmin } = require('../config/supabase');
const { displayEstimatedTime } = require('../utils/recipeTime');

function normalizeHistoryOutputResponse(outputResponse) {
  if (outputResponse == null) return outputResponse;
  let obj = outputResponse;
  if (typeof outputResponse === 'string') {
    try {
      obj = JSON.parse(outputResponse);
    } catch {
      return outputResponse;
    }
  }
  if (!obj || typeof obj !== 'object') return outputResponse;
  const et = obj.estimatedTime;
  if (et !== 'Cached' && et !== 'cached') return outputResponse;
  const first = Array.isArray(obj.suggestions) ? obj.suggestions[0] : null;
  const replacement = displayEstimatedTime(et, first) || 'N/A';
  return { ...obj, estimatedTime: replacement };
}

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
    profile_id,
    profileId,
    profile_name,
    profileName,
  } = historyData;

  const rawPid = profile_id ?? profileId;
  const resolvedProfileId =
    rawPid === undefined || rawPid === null || String(rawPid).trim() === ''
      ? null
      : String(rawPid).trim();
  const resolvedProfileName = (profile_name ?? profileName ?? '').trim() || null;

  const payload = {
    account_id: accountId,
    search_query: search_query ?? searchQuery,
    recipe_id: recipe_id ?? recipeId ?? null,
    source_api: source_api ?? sourceApi ?? null,
    output_response: output_response ?? outputResponse ?? null,
    searched_date: new Date().toISOString(),
    profile_id: resolvedProfileId,
    profile_name: resolvedProfileName,
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
    .select('id, account_id, search_query, recipe_id, source_api, searched_date, output_response, profile_id, profile_name')
    .eq('account_id', accountId)
    .order('searched_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((row) => ({
    ...row,
    output_response: normalizeHistoryOutputResponse(row.output_response),
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
