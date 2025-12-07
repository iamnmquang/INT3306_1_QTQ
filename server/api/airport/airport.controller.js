const AirportService = require('./airport.service');

const AirportController = {
  getAll: async (req, res) => {
    try {
      const airports = await AirportService.getAll();
      res.json(airports);
    } catch (err) {
      res.status(500).json({ message: 'Error getting airports', error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const airport = await AirportService.getById(req.params.id);
      if (!airport) return res.status(404).json({ message: 'Airport not found' });
      res.json(airport);
    } catch (err) {
      res.status(500).json({ message: 'Error getting airport', error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const airport = await AirportService.create(req.body);
      res.status(201).json(airport);
    } catch (err) {
      res.status(400).json({ message: 'Error creating airport', error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const airport = await AirportService.update(req.params.id, req.body);
      res.json(airport);
    } catch (err) {
      res.status(400).json({ message: 'Error updating airport', error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await AirportService.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: 'Error deleting airport', error: err.message });
    }
  },
};

module.exports = AirportController;
