const express = require('express');
const router = express.Router();
const controller = require('./clientOutstanding.controller');

// Generate new invoice ID
router.get('/', controller.getClientOutstandingByClientId);

module.exports = router;
