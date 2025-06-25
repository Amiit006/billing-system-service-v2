const express = require('express');
const router = express.Router();
const controller = require('./season.controller');

router.get('/', controller.getAllSeasons);
router.post('/create', controller.createSeason);
router.put('/edit', controller.updateSeason);

module.exports = router;
