const { supabaseAdmin } = require('../config/supabase');

// Get all profiles for an account
async function getProfiles(accountId) {
  const { data, error } = await supabaseAdmin
    .from('profile')
    .select('id, account_id, creation_date, date_of_birth, name, gender, avatar_url, dietary_restrictions, dietary_preferences, is_active, is_default')
    .eq('account_id', accountId);

  if (error) {
    throw error;
  }

  return data;
}

// Create a new profile for an account
async function createProfile(accountId, profileData) {
  const {
    name,
    dateOfBirth,
    gender = null,
    avatarUrl = null,
    isActive = true,
    isDefault = false,
    dietaryRestrictions = [],
    dietaryPreferences = []
  } = profileData;

  const payload = {
    account_id: accountId,
    name,
    gender,
    avatar_url: avatarUrl,
    is_active: isActive,
    is_default: isDefault,
    dietary_restrictions: dietaryRestrictions,
    dietary_preferences: dietaryPreferences
  };

  if (dateOfBirth !== undefined && dateOfBirth !== null && dateOfBirth !== "") {
    payload.date_of_birth = dateOfBirth;
  }

  const { data, error } = await supabaseAdmin
    .from('profile')
    .insert([payload])
    .select('id, account_id, creation_date, date_of_birth, name, gender, avatar_url, dietary_restrictions, dietary_preferences, is_active, is_default')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Update an existing profile
async function updateProfile(accountId, profileId, updates) {
  const { data, error } = await supabaseAdmin
    .from('profile')
    .update(updates)
    .eq('id', profileId)
    .eq('account_id', accountId)
    .select('id, account_id, creation_date, date_of_birth, name, gender, avatar_url, dietary_restrictions, dietary_preferences, is_active, is_default')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Delete a profile
async function deleteProfile(accountId, profileId) {
  const { data: profileToDelete, error: fetchError } = await supabaseAdmin
    .from('profile')
    .select('id, is_default')
    .eq('id', profileId)
    .eq('account_id', accountId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const { error } = await supabaseAdmin
    .from('profile')
    .delete()
    .eq('id', profileId)
    .eq('account_id', accountId);

  if (error) {
    throw error;
  }

  if (profileToDelete?.is_default) {
    const { data: replacement, error: replacementError } = await supabaseAdmin
      .from('profile')
      .select('id')
      .eq('account_id', accountId)
      .order('creation_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (replacementError) {
      throw replacementError;
    }

    if (replacement?.id) {
      await setDefaultProfile(accountId, replacement.id);
    }
  }

  return { message: 'Profile deleted successfully' };
}

async function setDefaultProfile(accountId, profileId) {
  const { error: clearError } = await supabaseAdmin
    .from('profile')
    .update({ is_default: false })
    .eq('account_id', accountId);

  if (clearError) {
    throw clearError;
  }

  const { data, error } = await supabaseAdmin
    .from('profile')
    .update({ is_default: true, is_active: true })
    .eq('id', profileId)
    .eq('account_id', accountId)
    .select('id, account_id, creation_date, date_of_birth, name, gender, avatar_url, dietary_restrictions, dietary_preferences, is_active, is_default')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function hasDefaultProfile(accountId) {
  const { count, error } = await supabaseAdmin
    .from('profile')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId)
    .eq('is_default', true);

  if (error) {
    throw error;
  }

  return Number(count || 0) > 0;
}

module.exports = {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  setDefaultProfile,
  hasDefaultProfile,
}; 