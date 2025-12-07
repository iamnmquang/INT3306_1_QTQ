const NewsService = require('./news.service');

const NewsController = {
  // CREATE
  createNews: async (req, res) => {
    try {
      const { title, content, thumbnailUrl, isPublished } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const news = await NewsService.create({
        title,
        content,
        thumbnailUrl,
        isPublished: isPublished ?? false
      });

      res.status(201).json(news);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET ALL
  getAllNews: async (req, res) => {
    try {
      const news = await NewsService.findAll();
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET BY ID
  getNewsById: async (req, res) => {
    try {
      const id = req.params.id;
      const news = await NewsService.findById(id);

      if (!news) return res.status(404).json({ message: "News not found" });

      res.json(news);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // UPDATE
  updateNews: async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;

      const exists = await NewsService.findById(id);
      if (!exists) return res.status(404).json({ message: "News not found" });

      const updated = await NewsService.update(id, data);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // DELETE
  deleteNews: async (req, res) => {
    try {
      const id = req.params.id;

      const exists = await NewsService.findById(id);
      if (!exists) return res.status(404).json({ message: "News not found" });

      await NewsService.delete(id);
      res.json({ message: "News deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = NewsController;
