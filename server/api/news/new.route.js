const express = require('express');
const NewsController = require('./news.controller');
const { isAuthenticated, authorizeRole } = require('../../utils/middlewares');

const newsRouter = express.Router();

newsRouter.post('/',
  isAuthenticated,
  authorizeRole('ADMIN'),
  NewsController.createNews);

newsRouter.get('/',
  NewsController.getAllNews);

newsRouter.get('/:id',
  NewsController.getNewsById);

newsRouter.put('/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  NewsController.updateNews);

newsRouter.delete('/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  NewsController.deleteNews);

module.exports = newsRouter;
