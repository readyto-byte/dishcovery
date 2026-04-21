const express = require('express');
const router = express.Router();

const { getAccountById, updateAccountById } = require('../controllers/account');

router.get('/me', async (req, res) => {
  try {
    const account = await getAccountById(req.user.id);
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/me', async (req, res) => {
  try {
    const account = await updateAccountById(req.user.id, req.body ?? {});
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
