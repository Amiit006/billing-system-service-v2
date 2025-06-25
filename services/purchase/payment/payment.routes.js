const express = require('express');
const router = express.Router();
const controller = require('./payment.controller');

// Payment APIs
router.post('/create', controller.createPayment);

module.exports = router;
