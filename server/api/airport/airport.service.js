const prisma = require('../../utils/prisma')

const AirportService = {
  getAll: async () => {
    return prisma.airport.findMany();
  },

  getById: async (id) => {
    return await prisma.airport.findUnique({where: {id}});
  },

  create: async (data) => {
    return await prisma.airport.create({data})
  },

  update: async (id, data) => {
    return await prisma.airport.update({where: {id}, data})
  },

  delete: async (id) => {
    return await prisma.airport.delete({ where: {id}});
  },
}

module.exports = AirportService