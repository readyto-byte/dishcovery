const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
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
    const profileId = req.query.profileId ?? req.query.profile_id ?? null;
    const row = await getActiveMealPlan(accountId, profileId);
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/deactivate-active', async (req, res) => {
  try {
    const accountId = req.user.id;
    const profileId = req.body?.profileId ?? req.body?.profile_id ?? req.query?.profileId ?? req.query?.profile_id ?? null;
    await deactivateActiveMealPlans(accountId, profileId);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const limit = req.query.limit;
    const profileId = req.query.profileId ?? req.query.profile_id ?? null;
    const rows = await listMealPlans(accountId, limit, profileId);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const profileId = req.body?.profileId ?? req.body?.profile_id ?? null;
    const row = await createMealPlan(accountId, req.body || {}, profileId);
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const body = req.body || {};
    const profileId = body?.profileId ?? body?.profile_id ?? req.query?.profileId ?? req.query?.profile_id ?? null;

    let profiles = [];
    if (profileId) {
      const { data: profileRow, error: profileErr } = await supabaseAdmin
        .from('profile')
        .select('id, name, dietary_restrictions, dietary_preferences')
        .eq('account_id', accountId)
        .eq('id', profileId)
        .maybeSingle();

      if (profileErr) {
        throw profileErr;
      }
      if (profileRow) {
        profiles = [profileRow];
      }
    } else if (Array.isArray(body?.profiles)) {
      profiles = body.profiles;
    }

    const response = await generateAiMealPlan(body, profiles);
    const saved = await createMealPlan(accountId, { ...body, response }, profileId);
    res.json({ success: true, response, saved });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
