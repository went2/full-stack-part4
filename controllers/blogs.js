const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getTokenFrom = req => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

blogsRouter.get('/', async(req, res) => {
  // logger.info('fetching data from MongoDB...');
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1});
  res.json(blogs);
});

blogsRouter.post('/', async(req, res) => {
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
    user: user._id,
    comments: []
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  res.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async(req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// 更新一条blog
blogsRouter.put('/:id', async (req, res) => {
  const body = req.body;

  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    comments: body.comments
  };

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, newBlog, { new: true }).populate('user', { username: 1, name: 1});

  // console.log('服务器返回的更新后的对象是', updatedBlog);
  res.json(updatedBlog);
});

// 新增一条评论:在当前的评论数组中push一条用户输入的评论
blogsRouter.put('/:id/comments', async (req, res) => {
  const body = req.body;
  const newComment = [...body.blog.comments, body.comment];

  const newBlog = {
    title: body.blog.title,
    author: body.blog.author,
    url: body.blog.url,
    likes: body.blog.likes,
    comments: newComment
  };

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, newBlog, {new: true}).populate('user', {username: 1, name: 1});

  res.json(updatedBlog);
});

module.exports = blogsRouter;
