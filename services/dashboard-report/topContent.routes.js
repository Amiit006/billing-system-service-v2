const express = require('express');
const topContentController = require('./topContent.controller');

const router = express.Router();

router.get('/topProduct', topContentController.getTopSellingProduct);
router.get('/topBuyer', topContentController.getTopBuyer);
router.get('/sellCollectionStats', topContentController.getSellCollectionStats);
router.get('/monthlySellStats', topContentController.getMonthlySellStats);
router.get('/sells', topContentController.getSellStats);
router.get('/collection', topContentController.getCollectionStats);
router.get('/client', topContentController.getSellCollectionStatsByClientId);
router.get('/clientOutstanding', topContentController.getClientOutstanding);
router.get('/sells/byDay', topContentController.getSellForOneYearByDayReport);

module.exports = router;