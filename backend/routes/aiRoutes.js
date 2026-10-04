const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

router.post('/query', authMiddleware, aiController.queryAI);

module.exports = router;
