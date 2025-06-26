const express = require('express');
const router = express.Router();

// Import feature-level routes
const purchaseRoutes = require('../services/purchase/purchase.routes');
const particularRoutes = require('../services/particular/particular.routes');
const clientRoutes = require('../services/client/client.routes');

// Mount them
router.use('/particulars', particularRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/clients', clientRoutes);

module.exports = router;
