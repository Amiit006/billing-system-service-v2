// services/particular/particular.service.js
const Particular = require('./particular.model');

async function getAllParticulars() {
  return await Particular.find().sort({ _id: 1 });
}

async function createParticular(name, discount) {
  const existing = await Particular.findOne({ particularName: name });
  if (existing) {
    const error = new Error('Particular already exists');
    error.status = 302;
    throw error;
  }

  const particular = new Particular({ particularName: name, discountPercentage: discount });
  return await particular.save();
}

async function createMultipleParticulars(particulars) {
  const names = particulars.map(p => p.particularName);
  const existing = await Particular.find({ particularName: { $in: names } });
  const existingNames = existing.map(e => e.particularName);

  const toInsert = particulars.filter(p => !existingNames.includes(p.particularName));
  return await Particular.insertMany(toInsert);
}

async function updateParticular(id, data) {
  const particular = await Particular.findById(id);
  if (!particular) {
    const error = new Error('Particular not found');
    error.status = 404;
    throw error;
  }

  if (data.particularName !== particular.particularName) {
    const duplicate = await Particular.findOne({ particularName: data.particularName });
    if (duplicate) {
      const error = new Error('Another particular with the same name exists');
      error.status = 400;
      throw error;
    }
  }

  particular.particularName = data.particularName;
  particular.discountPercentage = data.discountPercentage;
  return await particular.save();
}

async function createMultipleParticular(particularsList) {
  // 1. Fetch all existing particulars
  const existingParticulars = await Particular.find({}, 'particularName');
  const existingParticularNames = existingParticulars.map(p => p.particularName.toLowerCase());

  // 2. Get distinct names from input and filter new ones
  const inputNames = [...new Set(particularsList.map(p => p.particularName.toLowerCase()))];
  const newNames = inputNames.filter(name => !existingParticularNames.includes(name));

  // 3. Create new Particular objects only for new names
  const newParticulars = newNames.map(name => {
    const original = particularsList.find(p => p.particularName.toLowerCase() === name);
    return {
      particularName: name,
      discountPercentage: original.discountPercentage
    };
  });

  // 4. Insert into DB
  if (newParticulars.length > 0) {
    return await Particular.insertMany(newParticulars);
  }

  // 5. Return empty array if nothing to insert
  return [];
}

module.exports = {
  getAllParticulars,
  createParticular,
  createMultipleParticulars,
  updateParticular,
  createMultipleParticular,
};
