const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

const getTokenFrom = req => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

blogsRouter.get('/', async (req, res) => {
  logger.info('fetching data from MongoDB...');

  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1});
  res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  const body = req.body
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({
      error: 'token missing or invalid'
    })
  }

  if (!('title' in body) && !('url' in body)) {
    return res.status(400).send('Bad Request');
  }

  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.hasOwnProperty('likes') ? body.likes : 0,
    user: user._id
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  res.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

blogsRouter.put('/:id', async (req, res) => {
  const body = req.body;

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
