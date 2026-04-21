const express = require('express');
const router = express.Router();
const { createMealPlan, listMealPlans } = require('../controllers/mealPlans');

router.get('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const limit = req.query.limit;
    const rows = await listMealPlans(accountId, limit);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const accountId = req.user.id;
    const row = await createMealPlan(accountId, req.body || {});
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
