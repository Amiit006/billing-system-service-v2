// services/particular/particular.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./particular.controller');

router.get('/', controller.getAllParticulars);
router.post('/', controller.createSingleParticular);
router.post('/bulkCreate', controller.createMultipleParticular);
router.put('/:id', controller.updateSingleParticular);

module.exports = router;
