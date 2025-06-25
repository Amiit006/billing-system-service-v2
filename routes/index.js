const express = require('express');
const router = express.Router();

// Import feature-level routes
const purchaseRoutes = require('../services/purchase/purchase.routes');
const particularRoutes = require('../services/particular/particular.routes');

// Mount them
router.use('/particulars', particularRoutes);
router.use('/purchase', purchaseRoutes);

module.exports = router;
