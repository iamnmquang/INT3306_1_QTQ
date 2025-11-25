const FlightSeatService = require('../../services/flightSeat.service.js');

const FlightSeatController = {
  getAll: async (req, res) => {
    try {
      const flightSeats = await FlightSeatService.getAll();
      res.json(flightSeats);
    } catch (err) {
      res.status(500).json({ message: 'Error getting flight seats', error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const seat = await FlightSeatService.getById(Number(req.params.id));
      if (!seat) return res.status(404).json({ message: 'Flight seat not found' });
      res.json(seat);
    } catch (err) {
      res.status(500).json({ message: 'Error getting flight seat', error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const seat = await FlightSeatService.create(req.body);
      res.status(201).json(seat);
    } catch (err) {
      res.status(400).json({ message: 'Error creating flight seat', error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const seat = await FlightSeatService.update(Number(req.params.id), req.body);
      res.json(seat);
    } catch (err) {
      res.status(400).json({ message: 'Error updating flight seat', error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await FlightSeatService.delete(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: 'Error deleting flight seat', error: err.message });
    }
  },
};

module.exports = FlightSeatController;
