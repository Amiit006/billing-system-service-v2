// client.service.js
const Client = require("./client.model");
const ClientAddress = require("./clientaddress.model");

async function getAllClients() {
  const clients = await Client.find().lean(); // use .lean() for plain JS objects
  const addresses = await ClientAddress.find().lean();

  // Build a lookup map for fast access
  const addressMap = {};
  addresses.forEach((addr) => {
    addressMap[addr.addressId] = addr;
  });

  // Attach the address to each client
  const result = clients.map((client) => ({
    clientId: client.clientId,
    clientName: client.clientName,
    mobile: client.mobile,
    email: client.email || "",
    gstNumber: client.gstNumber || "",
    address: addressMap[client.addressId] || null,
    active: client.isActive || false,
  }));

  return result;
}

async function getClientById(id) {
  const client = await Client.findOne({ clientId: id }).lean();
  if (!client) {
    const error = new Error("Client not found");
    error.status = 404;
    throw error;
  }

  const address = await ClientAddress.findOne({
    addressId: client.addressId,
  }).lean();

  return {
    clientId: client.clientId,
    clientName: client.clientName,
    mobile: client.mobile,
    email: client.email || "",
    gstNumber: client.gstNumber || "",
    address: address || null,
    active: client.isActive || false,
  };
}

async function createClient(data) {
  // 1. Check if the client already exists
  const existing = await Client.findOne({
    clientName: data.clientName,
    mobile: data.mobile,
    addressId: data.addressId,
  });

  if (existing) throw { status: 409, message: "Client already exists" };

  // 2. Get the current max clientId
  const last = await Client.findOne().sort({ clientId: -1 }).select("clientId");
  const newId = last?.clientId ? last.clientId + 1 : 1;

  // 3. Assign the new clientId
  const client = new Client({
    ...data,
    clientId: newId,
  });

  try {
    return await client.save();
  } catch (err) {
    if (err.code === 11000) {
      throw { status: 409, message: "Client ID conflict. Try again." };
    }
    throw err;
  }
}

async function updateClient(id, data) {
  const client = await Client.findOne({ clientId: id });
  if (!client) throw { status: 404, message: "Client not found" };

  Object.assign(client, data);
  return await client.save();
}

async function getClientsByIds(ids) {
  return await Client.find({ clientId: { $in: ids } }).populate("addressId");
}

async function isClientPresentByClientId(clientId) {
  const client = await Client.findOne({ clientId });
  if (!client) {
    const error = new Error("Client Not Present");
    error.status = 404;
    throw error;
  }
  return true;
}

async function deleteClient(clientId) {
  const result = await Client.findOneAndDelete({ clientId });
  return result !== null;
}

async function isClientPresent(data) {
  const existing = await Client.findOne({
    clientId: data.clientId,
    clientName: data.clientName,
    mobile: data.mobile,
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
  isClientPresent,
};
