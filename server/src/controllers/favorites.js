const { supabaseAdmin } = require('../config/supabase');

function mapFavoriteRow(row = {}) {
  const recipe = row.recipes || {};

  let parsedInstructionPayload = {};
  try {
    parsedInstructionPayload = recipe.instructions ? JSON.parse(recipe.instructions) : {};
  } catch (error) {
    parsedInstructionPayload = {};
  }

  return {
    id: row.id,
    user_id: row.user_id,
    recipe_id: row.recipe_id,
    saved_date: row.saved_date,
    title: parsedInstructionPayload.title || recipe.title || 'Saved Recipe',
    description: parsedInstructionPayload.description || '',
    ingredients: Array.isArray(parsedInstructionPayload.keyIngredients) ? parsedInstructionPayload.keyIngredients : [],
    instructions: Array.isArray(parsedInstructionPayload.instructions) ? parsedInstructionPayload.instructions : [],
    tips: parsedInstructionPayload.tips || '',
    nutritionalInfo: parsedInstructionPayload.nutritionalInfo || null,
    image_url: recipe.image_url || null,
    prep_time_min: recipe.prep_time_min ?? null,
    cook_time_min: recipe.cook_time_min ?? null,
    servings: recipe.servings ?? null,
    type: 'Saved Recipe',
    difficulty: 'Medium',
    time: recipe.prep_time_min ? `${recipe.prep_time_min} min` : 'N/A',
    tags: ['favorite', 'dishcovery'],
  };
}

async function getFavoritesByAccount(accountId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('id, user_id, recipe_id, saved_date, recipes(*)')
    .eq('user_id', accountId)
    .order('saved_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(mapFavoriteRow);
}

async function addFavorite(accountId, favoriteData) {
  const recipeId = favoriteData.recipe_id ?? favoriteData.recipeId ?? null;
  if (!recipeId) {
    throw new Error('recipe_id is required to save a favorite.');
  }

  const { data: existingRows, error: existingError } = await supabaseAdmin
    .from('favorites')
    .select('id, user_id, recipe_id, saved_date, recipes(*)')
    .eq('user_id', accountId)
    .eq('recipe_id', recipeId)
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  if (existingRows && existingRows.length > 0) {
    return mapFavoriteRow(existingRows[0]);
  }

  const payload = {
    user_id: accountId,
    recipe_id: recipeId,
    saved_date: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('favorites')
    .insert([payload]);

  if (error) {
    throw error;
  }

  const { data: insertedRows, error: insertedError } = await supabaseAdmin
    .from('favorites')
    .select('id, user_id, recipe_id, saved_date, recipes(*)')
    .eq('user_id', accountId)
    .eq('recipe_id', recipeId)
    .order('saved_date', { ascending: false })
    .limit(1);

  if (insertedError) {
    throw insertedError;
  }

  return insertedRows && insertedRows[0] ? mapFavoriteRow(insertedRows[0]) : null;
}

async function deleteFavoriteById(accountId, favoriteId) {
  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', accountId)
    .eq('id', favoriteId);

  if (error) {
    throw error;
  }
}

async function clearFavoritesByAccount(accountId) {
  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', accountId);

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
