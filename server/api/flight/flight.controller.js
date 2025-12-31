const FlightService = require('./flight.service');
const ChatService = require('../chat/chat.service')


const FlightController = {
  getAll: async (req, res) => {
    try {
      const flights = await FlightService.getAll();
      res.json(flights);
    } catch (err) {
      res.status(500).json({ message: 'Error getting flights', error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const flight = await FlightService.getById(req.params.id);
      if (!flight) return res.status(404).json({ message: 'Flight not found' });
      res.json(flight);
    } catch (err) {
      res.status(500).json({ message: 'Error getting flight', error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const flight = await FlightService.create(req.body);
      res.status(201).json(flight);
    } catch (err) {
      console.error(err);
      res.status(400).json({
        message: err.message,
        prisma: err
      });
    }
  },

  update: async (req, res) => {
    try {
      const flight = await FlightService.update(req.params.id, req.body);
      res.json(flight);
    } catch (err) {
      res.status(400).json({ message: 'Error updating flight', error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await FlightService.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: 'Error deleting flight', error: err.message });
    }
  },

  searchFlights: async (req, res) => {
    try {
      const { departureCity, arrivalCity, departureTime, passengerNum } = req.body;

      if (!departureCity || !arrivalCity || !departureTime || !passengerNum) {
        return res.status(400).json({
          message: 'Missing required parameters: departureCity, arrivalCity, departureTime, passengerNum',
        });
      }
      const flights = await FlightService.searchFlights(departureCity, arrivalCity, departureTime, passengerNum);

      if (flights.length === 0) {
        return res.status(404).json({
          message: 'No flights found for the given criteria',
        });
      }
      res.json(flights)
    } catch (err) {
      res.status(500).json({ message: 'Error getting flight', error: err.message });
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      const { roomId } = req.params
      const count = await ChatService.getUnreadCountByRoom(roomId, req.user.id)
      res.json({ unread: count })
    } catch (err) {
      res.status(500).json({ message: 'Error getting unread count' })
    }
  },

  getUnreadForAdmin: async (req, res) => {
    try {
      const data = await ChatService.getUnreadCountsForAdmin()
      res.json(data)
    } catch (err) {
      res.status(500).json({ message: 'Error getting unread counts' })
    }
  }


};

module.exports = FlightController;
