const { supabaseAdmin } = require('../config/supabase');

async function getFavoritesByAccount(accountId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

async function addFavorite(accountId, favoriteData) {
  const {
    title,
    description,
    prep_time,
    prepTime,
    cook_time,
    cookTime,
    servings,
    difficulty,
    tags,
    type,
    time,
    ingredients,
    instructions,
  } = favoriteData;

  const payload = {
    account_id: accountId,
    title: title ?? 'Saved Recipe',
    description: description ?? null,
    prep_time: prep_time ?? prepTime ?? null,
    cook_time: cook_time ?? cookTime ?? null,
    servings: servings ?? null,
    difficulty: difficulty ?? null,
    tags: Array.isArray(tags) ? tags : [],
    type: type ?? null,
    time: time ?? null,
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    instructions: Array.isArray(instructions) ? instructions : [],
  };

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .insert([payload])
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function deleteFavoriteById(accountId, favoriteId) {
  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('account_id', accountId)
    .eq('id', favoriteId);

  if (error) {
    throw error;
  }
}

async function clearFavoritesByAccount(accountId) {
  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('account_id', accountId);

  if (error) {
    throw error;
  }
}

module.exports = {
  getFavoritesByAccount,
  addFavorite,
  deleteFavoriteById,
  clearFavoritesByAccount,
};
