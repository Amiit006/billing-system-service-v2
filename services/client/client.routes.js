// client.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./client.controller');

router.get('/', controller.getAllClients);
router.post('/', controller.createClient);
router.put('/:id', controller.updateClient);
router.get('/client', controller.getClientById);
router.get('/byIds', controller.getClientsByIds);
router.post('/validateClient', controller.isClientPresent);

module.exports = router;
