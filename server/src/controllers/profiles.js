const { supabase, supabaseAdmin } = require('../config/supabase');

// Get all profiles for an account
async function getProfiles(accountId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, allergies, dietary_preferences')
    .eq('account_id', accountId);

  if (error) {
    throw error;
  }

  return data;
}

// Create a new profile for an account
async function createProfile(accountId, name, allergies = [], dietaryPreferences = []) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ account_id: accountId, name, allergies, dietary_preferences: dietaryPreferences }])
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Update an existing profile
async function updateProfile(profileId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Delete a profile
async function deleteProfile(profileId) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId);

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