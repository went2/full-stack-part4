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

blogsRouter.delete('/blogs/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

blogsRouter.put('/blogs/:id', async (req, res) => {
  const body = req.body;
  // console.log('接收到的待更新blog', body);
  // console.log('接收到的待更新blog的id是', req.params.id);

  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  };

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, newBlog, { new: true });

  // console.log('服务器返回的更新后的对象是', updatedBlog);
  res.json(updatedBlog);
});

module.exports = blogsRouter;
