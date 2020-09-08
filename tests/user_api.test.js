const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');


describe('初始化数据库 1 个用户', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('secret', 10);
    const user = new User({
      username: 'root',
      name: 'Groot',
      passwordHash
    });
    
    await user.save();
  });

  test('新建一个用户', async () => {
    const userAtStart = await helper.usersInDb();

    const newUser = {
      username: 'asdb',
      name: 'Eric',
      password: 'eric123'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const userAtEnd = await helper.usersInDb();
    expect(userAtEnd).toHaveLength(userAtStart.length + 1);

    const usernames = userAtEnd.map(u => u.username);
    expect(usernames).toContain('asdb');
  });

  test('用户名已存在则创建失败，返回400', async () => {
    const userAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'superman',
      password: 'eric123'
    };

    console.log('【准备发送同用户名用户...】');

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    //console.log('【验证失败后，收到响应：】', result);
    
    expect(result.body.error).toContain('`username` to be unique');

    const userAtEnd = await helper.usersInDb();
    expect(userAtEnd).toHaveLength(userAtStart.length);
  });

});

afterAll(done => {
  mongoose.connection.close();
  done();
});
