const { supabaseAdmin } = require('../config/supabase');

function normalizeRecipeTitle(title) {
  return String(title || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

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

async function findExistingFavoriteByTitle(accountId, profileId, title) {
  const normalizedTarget = normalizeRecipeTitle(title);
  if (!normalizedTarget) return null;

  let query = supabaseAdmin
    .from('favorites')
    .select('id, user_id, recipe_id, saved_date, profile_id, recipes(*)')
    .eq('user_id', accountId)
    .order('saved_date', { ascending: false });

  if (profileId) {
    query = query.eq('profile_id', profileId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const match = (data || []).find((row) => {
    const recipeTitle = row?.recipes?.title ?? '';
    return normalizeRecipeTitle(recipeTitle) === normalizedTarget;
  });

  return match ? mapFavoriteRow(match) : null;
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
  let requestedTitle = String(favoriteData?.recipeData?.title || '').trim();

  if (recipeId) {
    const { data: recipeRow, error: recipeError } = await supabaseAdmin
      .from('recipes')
      .select('id, title')
      .eq('id', recipeId)
      .maybeSingle();
    if (recipeError) throw recipeError;
    if (recipeRow?.title) {
      requestedTitle = recipeRow.title;
    }
  }

  // One recipe title should only exist once in favorites per account/profile.
  if (requestedTitle) {
    const existingByTitle = await findExistingFavoriteByTitle(accountId, profileId, requestedTitle);
    if (existingByTitle) {
      return existingByTitle;
    }
  }

  if (!recipeId) {
    if (!favoriteData.recipeData) {
      throw new Error('recipe_id is required to save a favorite.');
    }
    const rd = favoriteData.recipeData;
    requestedTitle = String(rd.title || requestedTitle || '').trim();
    const parseTimeToMin = (val) => { const m = String(val || '').match(/\d+/); return m ? Number(m[0]) : null; };

    if (requestedTitle) {
      const { data: existingRecipeRows, error: existingRecipeError } = await supabaseAdmin
        .from('recipes')
        .select('id, title, cached_date')
        .ilike('title', requestedTitle)
        .order('cached_date', { ascending: false })
        .limit(1);
      if (existingRecipeError) throw existingRecipeError;
      if (existingRecipeRows && existingRecipeRows.length > 0) {
        recipeId = existingRecipeRows[0].id;
      }
    }

    if (!recipeId) {
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
