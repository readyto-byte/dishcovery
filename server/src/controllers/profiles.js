const { supabaseAdmin } = require('../config/supabase');

// Get all profiles for an account
async function getProfiles(accountId) {
  const { data, error } = await supabaseAdmin
    .from('profile')
    .select('id, account_id, creation_date, date_of_birth, name, gender, avatar_url, dietary_restrictions, dietary_preferences, is_active')
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
    dietaryRestrictions = [],
    dietaryPreferences = []
  } = profileData;

  const payload = {
    account_id: accountId,
    name,
    gender,
    avatar_url: avatarUrl,
    is_active: isActive,
    dietary_restrictions: dietaryRestrictions,
    dietary_preferences: dietaryPreferences
  };

  if (dateOfBirth !== undefined && dateOfBirth !== null && dateOfBirth !== "") {
    payload.date_of_birth = dateOfBirth;
  }

  const { data, error } = await supabaseAdmin
    .from('profile')
    .insert([payload])
    .select('id, account_id, creation_date, date_of_birth, name, gender, avatar_url, dietary_restrictions, dietary_preferences, is_active')
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
    .select('id, account_id, creation_date, date_of_birth, name, gender, avatar_url, dietary_restrictions, dietary_preferences, is_active')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Delete a profile
async function deleteProfile(accountId, profileId) {
  const { error } = await supabaseAdmin
    .from('profile')
    .delete()
    .eq('id', profileId)
    .eq('account_id', accountId);

  if (error) {
    throw error;
  }

  return { message: 'Profile deleted successfully' };
}

module.exports = {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile
}; 