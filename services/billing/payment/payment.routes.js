const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

router.get('/generatePaymentId', paymentController.generatePaymentId);
router.post('/', paymentController.savePayment);
router.get('/', paymentController.getPaymentByClientId);

module.exports = router;
