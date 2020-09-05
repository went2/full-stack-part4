const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const logger = require('../utils/logger');


blogsRouter.get('/blogs', async (req, res) => {
  logger.info('fetching data from MongoDB...');

  const blogs = await Blog.find({});
  logger.info('data fetched.');
  res.json(blogs);
});

blogsRouter.post('/blogs', async (req, res) => {

  // test blog property
  // logger.info('original req body:', req.body, 'blog after Schemaed:', blog, '【 author in req.body? 】', 'author' in req.body ,'【 req.body hasOwnProperty author? 】', req.body.hasOwnProperty('author'), '【 typeof req.body.author !== undefined】', typeof(req.body.author) !== undefined);

  if (!('title' in req.body) && !('url' in req.body)) {
    return res.status(400).send('Bad Request');
  } else if(!req.body.hasOwnProperty('likes')) {
    req.body.likes = 0;
  }

  const blog = new Blog(req.body);

  const result = await blog.save();
  res.status(201).json(result);
});

module.exports = blogsRouter;
