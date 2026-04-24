const express = require('express');
const router = express.Router();

const {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  setDefaultProfile,
  hasDefaultProfile,
} = require('../controllers/profiles');

// Get all profiles for the authenticated account
router.get('/', async (req, res) => {
  try {
    // Assuming accountId is available from auth middleware
    const accountId = req.user.id;

    const profiles = await getProfiles(accountId);
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Create a new profile
router.post('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const body = req.body;
    const { name, gender } = body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Profile name is required' });
    }

    const resolvedDateOfBirth = body.date_of_birth ?? body.dateOfBirth;
    if (!resolvedDateOfBirth) {
      return res.status(400).json({ success: false, error: "Date of birth is required." });
    }
    const resolvedDietaryRestrictions = body.dietary_restrictions ?? body.dietaryRestrictions ?? [];
    const resolvedDietaryPreferences = body.dietary_preferences ?? body.dietaryPreferences ?? body.allergies ?? [];
    const requestedDefault = body.is_default ?? body.isDefault ?? false;
    const defaultExists = await hasDefaultProfile(accountId);
    const shouldBeDefault = Boolean(requestedDefault) || !defaultExists;

    const profile = await createProfile(accountId, {
      name,
      dateOfBirth: resolvedDateOfBirth,
      gender: gender ?? null,
      avatarUrl: body.avatar_url ?? body.avatarUrl ?? null,
      isActive: body.is_active ?? body.isActive ?? true,
      isDefault: shouldBeDefault,
      dietaryRestrictions: resolvedDietaryRestrictions,
      dietaryPreferences: resolvedDietaryPreferences
    });

    if (shouldBeDefault) {
      const defaultProfile = await setDefaultProfile(accountId, profile.id);
      return res.json({ success: true, data: defaultProfile });
    }

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
    const body = req.body;
    const updates = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.gender !== undefined) updates.gender = body.gender;

    if (body.avatar_url !== undefined || body.avatarUrl !== undefined) {
      updates.avatar_url = body.avatar_url !== undefined ? body.avatar_url : body.avatarUrl;
    }

    if (body.date_of_birth !== undefined || body.dateOfBirth !== undefined) {
      updates.date_of_birth = body.date_of_birth ?? body.dateOfBirth;
    }

    const resolvedDietaryRestrictions = body.dietary_restrictions ?? body.dietaryRestrictions;
    if (resolvedDietaryRestrictions !== undefined) {
      updates.dietary_restrictions = resolvedDietaryRestrictions;
    }

    const resolvedDietaryPreferences = body.dietary_preferences ?? body.dietaryPreferences ?? body.allergies;
    if (resolvedDietaryPreferences !== undefined) {
      updates.dietary_preferences = resolvedDietaryPreferences;
    }

    const resolvedIsDefault = body.is_default ?? body.isDefault;
    if (resolvedIsDefault !== undefined) {
      updates.is_default = resolvedIsDefault;
    }

    const resolvedIsActive = body.is_active ?? body.isActive;
    if (resolvedIsActive !== undefined) {
      updates.is_active = resolvedIsActive;
    }

    const wantsDefault = updates.is_default === true;
    if (wantsDefault) {
      const profile = await setDefaultProfile(accountId, profileId);
      return res.json({ success: true, data: profile });
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