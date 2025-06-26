// client.controller.js
const service = require('./client.service');

const getAllClients = async (req, res) => {
  try {
    const result = await service.getAllClients();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
};

const getClientById = async (req, res) => {
  try {
    const result = await service.getClientById(req.query.clientId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const createClient = async (req, res) => {
  try {
    const result = await service.createClient(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const result = await service.updateClient(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getClientsByIds = async (req, res) => {
  try {
    const result = await service.getClientsByIds(req.query.clientIds);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const isClientPresent = async (req, res) => {
  try {
    const present = await service.isClientPresent(req.body);
    res.json({ present });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  getClientsByIds,
  isClientPresent
};
