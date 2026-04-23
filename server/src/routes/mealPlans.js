const express = require('express');
const router = express.Router();
const {
  createMealPlan,
  listMealPlans,
  getActiveMealPlan,
  deactivateActiveMealPlans,
  generateAiMealPlan,
} = require('../controllers/mealPlans');

router.get('/active', async (req, res) => {
  try {
    const accountId = req.user.id;
    const profile_id = req.query.profile_id ?? req.query.profileId ?? null;
    const row = await getActiveMealPlan(accountId, profile_id);
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/deactivate-active', async (req, res) => {
  try {
    const accountId = req.user.id;
    const profile_id = req.body?.profile_id ?? req.body?.profileId ?? req.query?.profile_id ?? req.query?.profileId ?? null;
    await deactivateActiveMealPlans(accountId, profile_id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const limit = req.query.limit;
    const profile_id = req.query.profile_id ?? req.query.profileId ?? null;
    const rows = await listMealPlans(accountId, limit, profile_id);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const profile_id = req.body?.profile_id ?? req.body?.profileId ?? null;
    const row = await createMealPlan(accountId, req.body || {}, profile_id);
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const response = await generateAiMealPlan(req.body || {}, req.body?.profiles || []);
    res.json({ success: true, response });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
