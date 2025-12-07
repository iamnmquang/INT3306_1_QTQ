const prisma = require('../../utils/prisma')

const FlightService = {
  getAll: async () => {
    return prisma.flight.findMany({
      include: {
        departureAirport: true,
        arrivalAirport: true,
        aircraft: true,
      },
    });
  },

  getById: async (id) => {
    return prisma.flight.findUnique({
      where: { id },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        aircraft: true,
        flightSeats: true,
        tickets: true,
      },
    });
  },

  create: async (data) => {
    return prisma.flight.create({ data });
  },

  update: async (id, data) => {
    return prisma.flight.update({
      where: { id },
      data,
    });
  },

  delete: async (id) => {
    return prisma.flight.delete({ where: { id } });
  },

  searchFlights: async (departureCity, arrivalCity, departureTime, passengerNum) => {
    const startOfDay = new Date(departureTime);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(departureTime);
    endOfDay.setHours(23, 59, 59, 999);

    // return all fights matching criteria
    const flights = await prisma.flight.findMany({
      where: {
        departureAirport: { city: departureCity },
        arrivalAirport: { city: arrivalCity },
        departureTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        aircraft: true,
        flightSeats: {
          include: {
            seats: {
              select: {
                id: true,
                seatNumber: true,
                isBooked: true,
                isLocked: true,
              },
            },
          },
        },
      },
      orderBy: {
        departureTime: 'asc',
      }
    });

    // filter flights that have enough available seats
    const flightsWithAvailableSeats = flights.filter((flight) => {
      return flight.flightSeats.some((flightSeat) => {
        const bookedCount = flightSeat.seats.filter(s => s.isBooked).length;
        const lockedCount = flightSeat.seats.filter(s => s.isLocked && !s.isBooked).length;
        const availableCount = flightSeat.totalSeats - bookedCount - lockedCount;
        return availableCount >= passengerNum;
      });
    });

    const cleanedFlights = flightsWithAvailableSeats.map((flight) => {
      flight.flightSeats = flight.flightSeats.map(flightSeat => {
        const {seats, ...rest} = flightSeat;
        return rest;
      })
      return flight;
    })

    return cleanedFlights;
  },

};
module.exports = FlightService;
