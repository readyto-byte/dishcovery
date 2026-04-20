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

  const { data, error } = await supabaseAdmin
    .from('profile')
    .insert([{
      account_id: accountId,
      name,
      date_of_birth: dateOfBirth,
      gender,
      avatar_url: avatarUrl,
      is_active: isActive,
      dietary_restrictions: dietaryRestrictions,
      dietary_preferences: dietaryPreferences
    }])
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