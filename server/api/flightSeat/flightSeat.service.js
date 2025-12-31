const prisma = require('../../utils/prisma')

const LOCK_TTL = 5 * 60 * 1000;

const FlightSeatService = {

  getAll: async () => {
    return await prisma.flightSeat.findMany({
      include: { flight: true },
    });
  },

  getById: async (id) => {
    return await prisma.flightSeat.findUnique({
      where: { id },
      include: { flight: true },
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
    await FlightSeatService.unlockExpiredSeats();

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
  lockSeats: async (userId, seatDetailIds) => {
    const now = new Date();

    return await prisma.$transaction(async (tx) => {
      //cleanup lock hết hạn
      await tx.seatDetail.updateMany({
        where: {
          isLocked: true,
          lockedAt: {
            lt: new Date(Date.now() - LOCK_TTL),
          },
        },
        data: {
          isLocked: false,
          isLockedByUserId: null,
          lockedAt: null,
        },
      });

      //lấy ghế cần lock
      const seats = await tx.seatDetail.findMany({
        where: {
          id: { in: seatDetailIds },
        },
      });

      if (seats.length !== seatDetailIds.length) {
        throw new Error("Some seats not found");
      }

      //validate từng ghế
      for (const seat of seats) {
        if (seat.isBooked) {
          throw new Error(`Seat ${seat.id} already booked`);
        }
        if (seat.isLocked && seat.isLockedByUserId !== userId) {
          throw new Error(`Seat ${seat.id} is locked by another user`);
        }
      }

      //  lock ghế
      await tx.seatDetail.updateMany({
        where: {
          id: { in: seatDetailIds },
        },
        data: {
          isLocked: true,
          isLockedByUserId: userId,
          lockedAt: now,
        },
      });

      return tx.seatDetail.findMany({
        where: {
          id: { in: seatDetailIds },
        },
      });
    });
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

  unlockExpiredSeats : async () => {
    await prisma.seatDetail.updateMany({
      where: {
        isLocked: true,
        lockedAt: {
          lt: new Date(Date.now() - LOCK_TTL),
        },
      },
      data: {
        isLocked: false,
        isLockedByUserId: null,
        lockedAt: null,
      },
    });
  },

};

module.exports = FlightSeatService;