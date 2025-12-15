const AircraftService = require('./aircraft.service');

const AircraftController = {
  // Lấy danh sách toàn bộ máy bay
  getAll: async (req, res) => {
    try {
      const aircrafts = await AircraftService.getAll();
      res.json(aircrafts);
    } catch (err) {
      res.status(500).json({ message: 'Error getting aircrafts', error: err.message });
    }
  },

  // Lấy chi tiết 1 máy bay theo ID
  getById: async (req, res) => {
    try {
      const aircraft = await AircraftService.getById(parseInt(req.params.id));
      if (!aircraft) return res.status(404).json({ message: 'Aircraft not found' });
      res.json(aircraft);
    } catch (err) {
      res.status(500).json({ message: 'Error getting aircraft', error: err.message });
    }
  },

  // Tạo mới máy bay
  create: async (req, res) => {
    try {
      const aircraft = await AircraftService.create(req.body);
      res.status(201).json(aircraft);
    } catch (err) {
      res.status(400).json({ message: 'Error creating aircraft', error: err.message });
    }
  },

  // Cập nhật thông tin máy bay
  update: async (req, res) => {
    try {
      const aircraft = await AircraftService.update(parseInt(req.params.id), req.body);
      res.json(aircraft);
    } catch (err) {
      res.status(400).json({ message: 'Error updating aircraft', error: err.message });
    }
  },

  // Xóa máy bay
  delete: async (req, res) => {
    try {
      await AircraftService.delete(parseInt(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: 'Error deleting aircraft', error: err.message });
    }
  },
};

module.exports = AircraftController;
