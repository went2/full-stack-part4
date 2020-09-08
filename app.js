const config = require('./utils/config');
const express = require('express');
const app = express();
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');

// 连接数据库
const mongoUrl = config.MONGODB_URI;
logger.info('connecting to', mongoUrl);

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true } )
  .then(() => {
    logger.info('connected to MogoDB');
  })
  .catch(err => {
    logger.error(err.message);
  });

app.use(express.json());
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use(middleware.errorHandler);

// 导出app
module.exports = app;