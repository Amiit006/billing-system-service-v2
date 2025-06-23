// services/particular/particular.routes.js
const express = require('express');
const router = express.Router();
const service = require('./particular.service');

// GET all
router.get('/', async (req, res) => {
  try {
    const data = await service.getAllParticulars();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get particulars' });
  }
});

// POST single
router.post('/', async (req, res) => {
  const { particularName, discountPercentage } = req.body;
  try {
    const result = await service.createParticular(particularName, discountPercentage);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST bulk
router.post('/bulkCreate', async (req, res) => {
  try {
    const result = await service.createMultipleParticulars(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const result = await service.updateParticular(req.params.id, req.body);
    res.status(201).json({ message: 'Successfully updated', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
