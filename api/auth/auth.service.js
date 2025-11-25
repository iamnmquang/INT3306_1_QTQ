const prisma = require('../../utils/prisma')
const {hashToken} = require('../../utils/hash')


const AuthService = {
  //used when create a refresh token
  addRefreshTokenToWhiteList : ({ refreshToken, userId }) => {
    return prisma.refreshToken.create({
      data: {
        hashedToken: hashToken(refreshToken),
        userId,
        expireAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
  },
  
  findRefreshToken : (token) => {
    return prisma.refreshToken.findUnique({
      where: {
        hashedToken: hashToken(token),
      },
    });
  },

  //soft delete tokens after usage
  deleteRefreshTokenById: (id) => {
    return prisma.refreshToken.update({
      where: {
        id
      },
      data: {
        revoked: true,
      },
    });
  },

  revokeTokens: (userId) => {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
      },
      data: {
        revoked: true,
      },
    });
  }
}

module.exports = AuthService
