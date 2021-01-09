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
}, 30000);

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
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400);
}, 30000)

});

describe('删除和更新', () => {
  test('删除成功，返回204', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];
    console.log('将要删除的blog是', blogToDelete, '其id是',blogToDelete.id )

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204);
    
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

    const titles = blogsAtEnd.map(blog => blog.title);
    expect(titles).not.toContain(blogToDelete.title);

  });

  test('返回更新后的blog', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    
    const newBlog = {
      author: blogToUpdate.author,
      title: blogToUpdate.title,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 1
    }

    const response = await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog);
    const updatedBlog = response.body;

    // console.log('测试端接收到的更新后的对象是：', updatedBlog);
    
    expect(updatedBlog.likes).toBe(newBlog.likes);

  });

});




afterAll(done => {
  mongoose.connection.close();
  done();
});
