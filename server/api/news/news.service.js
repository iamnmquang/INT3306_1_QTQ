const prisma = require('../../utils/prisma');

const NewsService = {
  // Create
  create: async (data) => {
    return await prisma.news.create({
      data,
    });
  },

  // Get all
  findAll: async () => {
    return await prisma.news.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },

  // Get by ID
  findById: async (id) => {
    return await prisma.news.findUnique({
      where: { id: Number(id) },
    });
  },

  // Update
  update: async (id, data) => {
    return await prisma.news.update({
      where: { id: Number(id) },
      data,
    });
  },

  // Delete
  delete: async (id) => {
    return await prisma.news.delete({
      where: { id: Number(id) },
    });
  }
};

module.exports = NewsService;
