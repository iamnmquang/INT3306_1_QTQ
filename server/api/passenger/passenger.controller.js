const PassengerService = require('../../services/passenger.service.js');

const PassengerController = {
  // Lấy tất cả hành khách
  getAll: async (req, res) => {
    try {
      const passengers = await PassengerService.getAll();
      res.json(passengers);
    } catch (err) {
      res.status(500).json({ message: 'Error getting passengers', error: err.message });
    }
  },

  // Lấy hành khách theo ID
  getById: async (req, res) => {
    try {
      const passenger = await PassengerService.getById(req.params.id);
      if (!passenger) return res.status(404).json({ message: 'Passenger not found' });
      res.json(passenger);
    } catch (err) {
      res.status(500).json({ message: 'Error getting passenger', error: err.message });
    }
  },

  // Tạo mới hành khách
  create: async (req, res) => {
    try {
      const passenger = await PassengerService.create(req.body);
      res.status(201).json(passenger);
    } catch (err) {
      res.status(400).json({ message: 'Error creating passenger', error: err.message });
    }
  },

  // Cập nhật thông tin hành khách
  update: async (req, res) => {
    try {
      const passenger = await PassengerService.update(req.params.id, req.body);
      res.json(passenger);
    } catch (err) {
      res.status(400).json({ message: 'Error updating passenger', error: err.message });
    }
  },

  // Xóa hành khách
  delete: async (req, res) => {
    try {
      await PassengerService.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: 'Error deleting passenger', error: err.message });
    }
  },
};

module.exports = PassengerController;
