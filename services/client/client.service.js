// client.service.js
const Client = require('./client.model');

async function getAllClients() {
  return await Client.find();
}

async function getClientById(id) {
  return await Client.findById(id);
}

async function createClient(data) {
  const existing = await Client.findOne({
    clientName: data.clientName,
    mobile: data.mobile,
    'address.zip': data.address?.zip
  });
  if (existing) throw { status: 409, message: 'Client already exists' };
  return await Client.create(data);
}

async function updateClient(id, data) {
  const client = await Client.findById(id);
  if (!client) throw { status: 404, message: 'Client not found' };
  Object.assign(client, data);
  return await client.save();
}

async function getClientsByIds(ids) {
  return await Client.find({ _id: { $in: ids } });
}

async function isClientPresentByClientId(clientId) {
  const client = await Client.findById(clientId);
  if (!client) {
    const error = new Error('Client Not Present');
    error.status = 404;
    throw error;
  }
  return true;
}

async function deleteClient(clientId) {
  const result = await Client.findByIdAndDelete(clientId);
  return result !== null;
}

async function isClientPresent(data) {
  const existing = await Client.findOne({
    _id: data.clientId,
    clientName: data.clientName,
    mobile: data.mobile
  });
  return !!existing;
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  getClientsByIds,
  isClientPresentByClientId,
  deleteClient,
  isClientPresent
};
