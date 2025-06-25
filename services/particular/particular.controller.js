// services/particular/particular.controller.js
const particularService = require('./particular.service');

const getAllParticulars = async (req, res) => {
  try {
    const result = await particularService.getAllParticulars();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSingleParticular = async (req, res) => {
  const { particularName, discountPercentage } = req.body;
  try {
    const created = await particularService.createParticular(particularName, discountPercentage);
    res.status(201).json(created);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const createMultipleParticular = async (req, res) => {
  try {
    const result = await particularService.createMultipleParticular(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const updateSingleParticular = async (req, res) => {
  const id = parseInt(req.params.id);
  const updatedData = req.body;
  try {
    await particularService.updateParticular(id, updatedData);
    res.status(200).json({ message: 'Successfully updated.' });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

module.exports = {
  getAllParticulars,
  createSingleParticular,
  createMultipleParticular,
  updateSingleParticular,
};
