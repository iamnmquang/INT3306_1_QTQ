const prisma = require('../../utils/prisma.js')
const bcrypt = require('bcrypt');


const UserService = {
  getAll: async () => {
    return await prisma.user.findMany();
  },

  getById: async (id) => {
    return await prisma.user.findUnique({ where: { id } });
  },

  getbyEmail: async (email) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  create: async (data) => {
    const { password, email, ...rest } = data;
    const hashedPassword = bcrypt.hashSync(password, 12)
    return await prisma.user.create({
      data: {
        ...rest,
        email: email,
        password: hashedPassword,
      }
    });
  },

  update: async (id, data) => {
    return await prisma.user.update({ where: { id }, data });
  },

  delete: async (id) => {
    return await prisma.user.delete({ where: { id } });
  },

  updatePasswordByEmail: async(email, newPassword) => {
    const hashedPassword = bcrypt.hashSync(newPassword,12);
    return await prisma.user.update({where: {email},
      data: {
        password: hashedPassword
      }
    })
  },

  updateByEmail: async (email, data) => {
     return await prisma.user.update({ where: { email }, data });
  }
}

module.exports = UserService