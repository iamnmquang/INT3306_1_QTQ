const FlightSeatService = require('./flightSeat.service');


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

  getAvailableSeats: async (req, res) => {
    try {
      const { flightSeatId } = req.params;

      if (!flightSeatId) {
        return res.status(400).json({ message: 'flightSeatId is required' });
      }

      const seats = await FlightSeatService.getAvailableSeatsByClass(Number(flightSeatId));

      if (seats.length === 0) {
        return res.status(404).json({ message: 'No available seats for this flight class' });
      }

      res.json({
        count: seats.length,
        seats
      })

    } catch (err) {
      res.status(500).json({ message: 'Error getting available seats', error: err.message });
    }
  },

  lockSeats: async (req, res) => {
    try {
      const { userId } = req.payload;
      const { seatDetailIds } = req.body;

      if (!Array.isArray(seatDetailIds) || seatDetailIds.length === 0) {
        return res.status(400).json({ message: 'seatDetailIds must be a non-empty array' });
      }

      const lockedSeats = await FlightSeatService.lockSeats(userId, seatDetailIds)

      return res.status(201).json({
        message: `${lockedSeats.length} seats locked for 10 minutes`,
        seats: lockedSeats,
      });
    } catch (err) {
      res.status(400).json({ message: 'Error locking seats', error: err.message });
    }
  },

  unlockSeats: async (req, res) => {
    try {
      const { userId } = req.payload;
      const { seatDetailIds } = req.body;

      if (!Array.isArray(seatDetailIds) || seatDetailIds.length === 0) {
        return res.status(400).json({ message: 'seatDetailIds must be a non-empty array' });
      }

      await FlightSeatService.unlockSeats(seatDetailIds, userId);

      res.json({ message: `${seatDetailIds.length} seats unlocked` });
    } catch (err) {
      res.status(400).json({ message: 'Error unlocking seats', error: err.message });
    }
  },
 
};


module.exports = FlightSeatController;
