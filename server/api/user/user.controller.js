const UserService = require('./user.service.js');
const bcrypt = require('bcrypt');
const cloudinary = require('../../utils/cloudinary');

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
      const userId = req.user.id;

      const user = await UserService.getById(userId);
      delete user.password;

      res.json(user);
    } catch (err) {
      next(err);
    }
  },


  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const allowedFields = ['name', 'phone', 'address'];
      const data = {};

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          data[field] = req.body[field];
        }
      });

      const user = await UserService.update(userId, data);
      delete user.password;

      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  updateAvatar: async (req, res, next) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const uploadToCloudinary = () =>
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'avatars' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });

      const result = await uploadToCloudinary();

      const user = await UserService.update(userId, {
        avatarUrl: result.secure_url
      });

      delete user.password;
      res.json(user);
    } catch (err) {
      next(err);
    }
  },


  changePassword: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Missing password' });
      }

      const user = await UserService.getById(userId);

      const isMatch = bcrypt.compareSync(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password incorrect' });
      }

      const hashed = bcrypt.hashSync(newPassword, 12);
      await UserService.update(userId, { password: hashed });

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  },


};

module.exports = UserController
