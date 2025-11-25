const prisma = require('../utils/prisma')

const PassengerService = {
  getAll: async () => {
    return await prisma.passenger.findMany({
      include: { tickets: true },
    });
  },

  getById: async (id) => {
    return await prisma.passenger.findUnique({
      where: { id },
      include: { tickets: true },
    });
  },

  create: async (data) => {
    return await prisma.passenger.create({
      data,
    });
  },

  update: async (id, data) => {
    return await prisma.passenger.update({
      where: { id },
      data,
    });
  },

  delete: async (id) => {
    return await prisma.passenger.delete({
      where: { id },
    });
  },
};

module.exports = PassengerService;
