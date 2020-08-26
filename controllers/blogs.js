const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const logger = require('../utils/logger');

blogsRouter.get('/blogs', (req, res) => {
  logger.info('fetching data from MongoDB...');
  Blog
    .find({})
    .then(blogs => {
      logger.info('data fetched.');
      res.json(blogs)
    });
});

blogsRouter.post('/blogs', (req, res) => {
  logger.info('posting data to MongoDB...');
  const blog = new Blog(req.body);

  blog
    .save()
    .then(result => {
      logger.info('data posted successfully.');
      res.status(201).json(result);
    });
});

module.exports = blogsRouter;
