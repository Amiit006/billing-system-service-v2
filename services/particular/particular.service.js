const Particular = require("./particular.model");

async function getAllParticulars() {
  return await Particular.find().sort({ particularId: 1 });
}

async function createParticular(name, discount) {
  const existing = await Particular.findOne({ particularName: name });
  if (existing) {
    const error = new Error("Particular already exists");
    error.status = 302;
    throw error;
  }

  const last = await Particular.findOne().sort({ particularId: -1 }).limit(1);
  const newId = last ? last.particularId + 1 : 1;

  const particular = new Particular({
    particularId: newId,
    particularName: name,
    discountPercentage: discount,
    isActive: true,
  });

  return await particular.save();
}

async function createMultipleParticulars(particulars) {
  const names = particulars.map((p) => p.particularName.toLowerCase());
  const existing = await Particular.find({ particularName: { $in: names } });
  const existingNames = existing.map((e) => e.particularName.toLowerCase());

  const toInsertNames = names.filter((name) => !existingNames.includes(name));

  if (toInsertNames.length === 0) return [];

  const last = await Particular.findOne().sort({ particularId: -1 }).limit(1);
  let nextId = last ? last.particularId + 1 : 1;

  const toInsert = toInsertNames.map((name) => {
    const original = particulars.find(
      (p) => p.particularName.toLowerCase() === name
    );
    return {
      particularId: nextId++,
      particularName: original.particularName,
      discountPercentage: original.discountPercentage,
      isActive: true,
    };
  });

  return await Particular.insertMany(toInsert);
}

async function updateParticular(id, data) {
  const particular = await Particular.findOne({ particularId: id });
  if (!particular) {
    const error = new Error("Particular not found");
    error.status = 404;
    throw error;
  }

  if (
    data.particularName &&
    data.particularName !== particular.particularName
  ) {
    const duplicate = await Particular.findOne({
      particularName: data.particularName,
    });
    if (duplicate) {
      const error = new Error("Another particular with the same name exists");
      error.status = 400;
      throw error;
    }
  }

  particular.particularName = data.particularName || particular.particularName;
  particular.discountPercentage =
    data.discountPercentage ?? particular.discountPercentage;
  if (typeof data.isActive === "boolean") {
    particular.isActive = data.isActive;
  }

  return await particular.save();
}

// Called from invoice module: adds only new particulars
async function createMultipleParticular(particularsList) {
  const existingParticulars = await Particular.find({}, "particularName");
  const existingNames = existingParticulars.map((p) =>
    p.particularName.toLowerCase()
  );

  const inputNames = [
    ...new Set(particularsList.map((p) => p.particularName.toLowerCase())),
  ];
  const newNames = inputNames.filter((name) => !existingNames.includes(name));

  if (newNames.length === 0) return [];

  const last = await Particular.findOne().sort({ particularId: -1 }).limit(1);
  let nextId = last ? last.particularId + 1 : 1;

  const newParticulars = newNames.map((name) => {
    const original = particularsList.find(
      (p) => p.particularName.toLowerCase() === name
    );
    return {
      particularId: nextId++,
      particularName: original.particularName,
      discountPercentage: original.discountPercentage,
      isActive: true,
    };
  });

  return await Particular.insertMany(newParticulars);
}

module.exports = {
  getAllParticulars,
  createParticular,
  createMultipleParticulars,
  updateParticular,
  createMultipleParticular,
};
