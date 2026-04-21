const express = require('express');
const router = express.Router();
const { generateText } = require('../controllers/generate');

router.post('/', generateText);

module.exports = router;
