const prisma = require('../utils/prisma')

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

  searchFlights: async (departureCity, arrivalCity, departureTime) => {
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
        flightSeats: true,
      },
      orderBy: {
        departureTime: 'asc',
      }
    });

    // filter flights that have at least one available seat
    const flightsWithAivailableSeats = flights.filter((flight) => {
      return flight.flightSeats.some((flightSeat) => {
        const bookedCount = flightSeat.seats.filter(s => s.isBooked).length;
        const lockedCount = flightSeat.seats.filter(s => s.isLocked && !s.isBooked).length;
        const availableCount = flightSeat.totalSeats - bookedCount - lockedCount
        return availableCount > 0
      })
    });

    return flightsWithAivailableSeats;
  },

  showFlightInfo: async (flightId, flightSeatId) => {
    const flight = prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        aircraft: true,
      },
    });

    const flightSeat = prisma.flightSeat.findUnique({
      where: {id: flightSeatId}
    })

    return {flight, flightSeat}
  },







};
module.exports = FlightService;
