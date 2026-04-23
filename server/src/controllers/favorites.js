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

async function getFavoritesByAccount(accountId, profileId) {
  let query = supabaseAdmin
    .from('favorites')
    .select('id, user_id, recipe_id, saved_date, profile_id, recipes(*)')
    .eq('user_id', accountId)
    .order('saved_date', { ascending: false });

  if (profileId) {
    query = query.eq('profile_id', profileId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map(mapFavoriteRow);
}

async function addFavorite(accountId, favoriteData) {
  let recipeId = favoriteData.recipe_id ?? favoriteData.recipeId ?? null;
  const profileId = favoriteData.profile_id ?? favoriteData.profileId ?? null;

  if (!recipeId) {
    if (!favoriteData.recipeData) {
      throw new Error('recipe_id is required to save a favorite.');
    }
    const rd = favoriteData.recipeData;
    const parseTimeToMin = (val) => { const m = String(val || '').match(/\d+/); return m ? Number(m[0]) : null; };
    const recipePayload = {
      title: rd.title,
      source_api: 'gemini-2.5-flash',
      prep_time_min: parseTimeToMin(rd.prepTime),
      cook_time_min: parseTimeToMin(rd.cookTime),
      servings: rd.servings ?? null,
      instructions: JSON.stringify({
        title: rd.title,
        description: rd.description ?? '',
        keyIngredients: rd.ingredients ?? [],
        instructions: rd.instructions ?? [],
        nutritionalInfo: rd.nutritionalInfo ?? null,
      }),
      nutritional_info: rd.nutritionalInfo ? JSON.stringify(rd.nutritionalInfo) : null,
      cached_date: new Date().toISOString(),
    };
    const { data: savedRecipes, error: saveError } = await supabaseAdmin
      .from('recipes')
      .insert([recipePayload])
      .select('id');
    if (saveError) throw saveError;
    recipeId = savedRecipes[0].id;
  }

  let existingQuery = supabaseAdmin
    .from('favorites')
    .select('id, user_id, recipe_id, saved_date, profile_id, recipes(*)')
    .eq('user_id', accountId)
    .eq('recipe_id', recipeId);

  if (profileId) {
    existingQuery = existingQuery.eq('profile_id', profileId);
  }

  const { data: existingRows, error: existingError } = await existingQuery.limit(1);

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
    profile_id: profileId,
  };

  const { error } = await supabaseAdmin
    .from('favorites')
    .insert([payload]);

  if (error) {
    throw error;
  }

  let insertedQuery = supabaseAdmin
    .from('favorites')
    .select('id, user_id, recipe_id, saved_date, profile_id, recipes(*)')
    .eq('user_id', accountId)
    .eq('recipe_id', recipeId)
    .order('saved_date', { ascending: false });

  if (profileId) {
    insertedQuery = insertedQuery.eq('profile_id', profileId);
  }

  const { data: insertedRows, error: insertedError } = await insertedQuery.limit(1);

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

async function clearFavoritesByAccount(accountId, profileId) {
  let query = supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', accountId);

  if (profileId) {
    query = query.eq('profile_id', profileId);
  }

  const { error } = await query;

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
