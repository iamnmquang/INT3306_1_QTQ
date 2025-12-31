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
    return prisma.flight.create({
      data: {
        flightNumber: data.flightNumber,
        aircraftId: data.aircraftId, // UUID → OK
        departureAirportId: Number(data.departureAirportId),
        arrivalAirportId: Number(data.arrivalAirportId),
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
        status: data.status || 'SCHEDULED',
      },
    });
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

    // Build flexible airport match by querying airports first
    const buildAirportMatch = async (val) => {
      if (!val) return [];
      const v = val.trim().toUpperCase();
      const airports = await prisma.airport.findMany({
        where: {
          OR: [
            { city: { contains: v } },
            { iataCode: { contains: v } },
          ],
        },
        select: { id: true },
      });
      return airports.map(a => a.id);
    };

    const departureAirportIds = await buildAirportMatch(departureCity);
    const arrivalAirportIds = await buildAirportMatch(arrivalCity);

    // Debug: Log airport IDs found
    console.log('Departure airport IDs:', departureAirportIds);
    console.log('Arrival airport IDs:', arrivalAirportIds);

    // If no airports found, throw error
    if (departureAirportIds.length === 0 || arrivalAirportIds.length === 0) {
      throw new Error(`No airports found. Departure: ${departureCity}, Arrival: ${arrivalCity}`);
    }

    // return all flights matching criteria
    const flights = await prisma.flight.findMany({
      where: {
        ...(departureAirportIds.length > 0 ? { departureAirportId: { in: departureAirportIds } } : {}),
        ...(arrivalAirportIds.length > 0 ? { arrivalAirportId: { in: arrivalAirportIds } } : {}),
        departureTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
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
      },
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
        const { seats, ...rest } = flightSeat;
        return rest;
      });
      return flight;
    });

    return cleanedFlights;
  }
};
module.exports = FlightService;
