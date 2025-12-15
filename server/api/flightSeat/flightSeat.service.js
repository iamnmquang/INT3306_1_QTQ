const prisma = require('../../utils/prisma')

const FlightSeatService = {
  getAll: async () => {
    return await prisma.flightSeat.findMany({
      include: { flight: true },
    });
  },

  getById: async (id) => {
    return await prisma.flightSeat.findUnique({
      where: { id },
      include: { flight: true},
    });
  },

  create: async (data) => {
    return await prisma.flightSeat.create({ data });
  },

  update: async (id, data) => {
    return await prisma.flightSeat.update({
      where: { id },
      data,
    });
  },

  delete: async (id) => {
    return await prisma.flightSeat.delete({ where: { id } });
  },

  //get all seat available for booking
  getAvailableSeatsByClass: async (flightSeatId) => {
    return await prisma.seatDetail.findMany({
      where: {
        flightSeatId,
        isBooked: false,
        isLocked: false,
      },
      orderBy: {
        seatNumber: 'asc'
      }
    });
  },

  //lock a seat (select for booking)
  lockSeats: async (userId, seatDetailIds) => {
    const now = new Date();

    await prisma.seatDetail.updateMany({
      where: {
        id: {
          in: seatDetailIds
        },
        isBooked: false,
        isLocked: false,
      },
      data: {
        isLocked: true,
        isLockedByUserId: userId,
        lockedAt: now,
      }
    })

    return prisma.seatDetail.findMany({
      where: {
        id: {
          in: seatDetailIds
        }
      }
    })

  },

  //unlock seats (when user change, expired, trasaction rollback)
  unlockSeats: async (seatDetailIds, userId) => {
    return await prisma.seatDetail.updateMany({
      where: {
        id: {
          in: seatDetailIds
        },
        isLockedByUserId: userId
      },
      data: {
        isLocked: false,
        isLockedByUserId: null,
        lockedAt: null,
      }
    });
  },

};

module.exports = FlightSeatService;