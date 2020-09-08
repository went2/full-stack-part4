const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', { 
    title: 1, author: 1, url: 1
  });
  res.json(users);
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body;
  
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);
  
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    });
  
    const savedUser = await user.save();
    res.json(savedUser);

  } catch(exception) {
    next(exception);
  }

});

module.exports = usersRouter;