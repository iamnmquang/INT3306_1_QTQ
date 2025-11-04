const prisma = require( '../utils/prisma.js')


 const UserService = {
    getAll: async () => {
      return await prisma.user.findMany();
    },

    getById: async (id) => {
      return await prisma.user.findUnique({where: {id}});
    },

    create: async (data) => {
      return await prisma.user.create({ data });
    },

    update: async (id, data) => {
      return await prisma.user.update({where: {id}, data});
    },

    delete: async (id) => {
    return await prisma.user.delete({ where: { id } });
  },
}

module.exports = UserService