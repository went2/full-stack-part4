const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');
const helper = require('./test_helper');


beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog));
  const promiseArray = blogObjects.map(blog => blog.save());
  await Promise.all(promiseArray);

  console.log('初始化测试数据库成功');
});

describe('Get /api/blogs：初始blogs条目', () => {
  test('共有6条blogs', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  }, 30000);
  
  test('测试其中包含某条特定blog', async () => {
    const response = await api.get('/api/blogs');
    const titles = response.body.map(r => r.title);
    expect(titles).toContain('React patterns');
  }, 30000);
  
  test('测试响应中是否包含id属性', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].id).toBeDefined();
  }, 30000);
});

describe('POST /api/blogs', () => {
  test('POST一条blog后总数加1', async () => {
    const newBlog = {
      title: "How to create your first app using React part 2",
      author: "James Fisher",
      url: "www.google.com",
      likes: 4
    };
  
    const postResponse = await api.post('/api/blogs').send(newBlog);
    // console.log(postResponse);
    
    expect(postResponse.body.author).toContain('James Fisher');
  
    const getResponse = await api.get('/api/blogs');
    expect(getResponse.body).toHaveLength(7);
  }, 30000);
  
  test('判断：如果没有likes则设为0', async () => {
    const newBlog = {
      title: "How to create your first app no likes",
      author: "James Fisher2",
      url: "www.google.com"
    };
  
    const response = await api.post('/api/blogs').send(newBlog);
    expect(response.body.likes).toBe(0);
  
  }, 30000);

  test('判断：如果没有title和url，返回400', async () => {
  const newBlog = {
    "author": "James Fisher",
    "likes": 10
  };
  const response = await api.post('/api/blogs').send(newBlog);
  // console.log(response);
  expect(response.statusCode).toBe(400);
}, 30000)

});


afterAll(() => {
  mongoose.connection.close();
});
