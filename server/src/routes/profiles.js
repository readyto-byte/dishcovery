const express = require('express');
const router = express.Router();

const { getProfiles, createProfile, updateProfile, deleteProfile } = require('../controllers/profiles');

// Get all profiles for the authenticated account
router.get('/', async (req, res) => {
  try {
    // Assuming accountId is available from auth middleware, e.g., req.user.id
    const accountId = req.user.id; // Adjust based on your auth setup

    const profiles = await getProfiles(accountId);
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Create a new profile
router.post('/', async (req, res) => {
  try {
    const accountId = req.user.id; // Adjust based on your auth setup
    const {
      name,
      date_of_birth,
      dateOfBirth,
      gender,
      avatar_url,
      avatarUrl,
      is_active,
      isActive,
      isDefault,
      allergies,
      dietaryRestrictions,
      dietaryPreferences,
      dietary_restrictions,
      dietary_preferences
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Profile name is required' });
    }

    const resolvedDateOfBirth = date_of_birth ?? dateOfBirth;
    if (!resolvedDateOfBirth) {
      return res.status(400).json({ success: false, error: "Date of birth is required." });
    }
    const resolvedDietaryRestrictions = dietary_restrictions ?? dietaryRestrictions ?? [];
    const resolvedDietaryPreferences = dietary_preferences ?? dietaryPreferences ?? allergies ?? [];
    const profile = await createProfile(accountId, {
      name,
      dateOfBirth: resolvedDateOfBirth,
      gender: gender ?? null,
      avatarUrl: avatar_url ?? avatarUrl ?? null,
      isActive: is_active ?? isActive ?? isDefault ?? true,
      dietaryRestrictions: resolvedDietaryRestrictions,
      dietaryPreferences: resolvedDietaryPreferences
    });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update a profile
router.put('/:profileId', async (req, res) => {
  try {
    const accountId = req.user.id;
    const { profileId } = req.params;
    const {
      allergies,
      dietaryPreferences,
      dietaryRestrictions,
      isDefault,
      isActive,
      ...restUpdates
    } = req.body;
    const updates = { ...restUpdates };

    if (allergies !== undefined) {
      updates.dietary_preferences = allergies;
    }

    if (dietaryRestrictions !== undefined) {
      updates.dietary_restrictions = dietaryRestrictions;
    }

    if (dietaryPreferences !== undefined) {
      updates.dietary_preferences = dietaryPreferences;
    }

    if (isDefault !== undefined) {
      updates.is_active = isDefault;
    } else if (isActive !== undefined) {
      updates.is_active = isActive;
    }

    const profile = await updateProfile(accountId, profileId, updates);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a profile
router.delete('/:profileId', async (req, res) => {
  try {
    const accountId = req.user.id;
    const { profileId } = req.params;

    const result = await deleteProfile(accountId, profileId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;