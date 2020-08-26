const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
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

// 使用中间件
// app.use(cors);
app.use(express.json());
// app.use(middleware.unknownEndpoint);
app.use('/api', blogsRouter);

// 导出app
module.exports = app;