const express = require('express');
const reportController = require('./report.controller');

const router = express.Router();

// Report routes (equivalent to /report mapping)
router.get('/sells', reportController.getSellsReport);
router.get('/collection', reportController.getCollectionsReport);
router.get('/client', reportController.getClientReport);
router.get('/tradebook', reportController.getTradeBookReport);
router.get('/particulars', reportController.getParticularsReport);
router.get('/clientOutstanding', reportController.getClientOutstandingReport);
router.get('/clientTradeBook', reportController.getClientTradeBookReport);

module.exports = router;