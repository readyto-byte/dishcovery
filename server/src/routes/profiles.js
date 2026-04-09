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
    const { name, allergies, dietaryPreferences } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Profile name is required' });
    }

    const profile = await createProfile(accountId, name, allergies, dietaryPreferences);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update a profile
router.put('/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const updates = req.body;

    const profile = await updateProfile(profileId, updates);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a profile
router.delete('/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;

    const result = await deleteProfile(profileId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;