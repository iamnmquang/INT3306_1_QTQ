const prisma = require('../../utils/prisma')

const AircraftService = {
  getAll: async () => {
    return await prisma.aircraft.findMany(
    );
  },

  getById: async (id) => {
    return await prisma.aircraft.findUnique({
      where: { id },
    });
  },

  create: async (data) => {
    return await prisma.aircraft.create({
      data,
    });
  },

  update: async (id, data) => {
    return await prisma.aircraft.update({
      where: { id },
      data,
    });
  },

  delete: async (id) => {
    return await prisma.aircraft.delete({
      where: { id },
    });
  },
};

module.exports = AircraftService;