const prisma = require('../utils/prisma')

const FlightSeatService = {
  getAll: async () => {
    return prisma.flightSeat.findMany({
      include: { flight: true },
    });
  },

  getById: async (id) => {
    return prisma.flightSeat.findUnique({
      where: { id },
      include: { flight: true, tickets: true },
    });
  },

  create: async (data) => {
    return prisma.flightSeat.create({ data });
  },

  update: async (id, data) => {
    return prisma.flightSeat.update({
      where: { id },
      data,
    });
  },

  delete: async (id) => {
    return prisma.flightSeat.delete({ where: { id } });
  },
};

module.exports = FlightSeatService;