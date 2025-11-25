const prisma = require('../../utils/prisma')

const TicketService = {
  getAll: async () => {
    return prisma.ticket.findMany({
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  getById: async (id) => {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  getByBookingReference: async (bookingReference) => {
    return prisma.ticket.findUnique({
      where: { bookingReference },
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  getTicketsByUserId: async (userId) => {
    return prisma.ticket.findMany({
      where: { bookedById: userId },
      include: {
        flight: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  create: async (data) => {
    return prisma.ticket.create({
      data,
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  update: async (id, data) => {
    return prisma.ticket.update({
      where: { id },
      data,
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  cancel: async (id, cancelCode) => {
    return prisma.ticket.update({
      where: { id },
      data: {
        isCancelled: true,
        cancelCode,
      },
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  delete: async (id) => {
    return prisma.ticket.delete({ where: { id } });
  },
};

module.exports = TicketService;