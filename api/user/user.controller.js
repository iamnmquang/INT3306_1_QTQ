const UserService = require('./user.service.js');

const UserController = {
  getAll: async (req, res) => {
    try {
      const users = await UserService.getAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Error getting users', error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await UserService.getById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Error getting user', error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const user = await UserService.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ message: 'Error creating user', error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const user = await UserService.update(req.params.id, req.body);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: 'Error updating user', error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await UserService.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: 'Error deleting user', error: err.message });
    }
  },

  profile: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const user = await UserService.getById(userId);
      delete user.password;
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = UserController
