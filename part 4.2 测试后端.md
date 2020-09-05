## 测试后端

### 零、前言

原来 part 4.1 只是用几个例子简单介绍了单元测试，这节开始才正式开始写后端的测试程序。第一次接触单元测试，4.1 的最后三个练习题挺难的，花了不少时间思(谷)考(哥)。对我来说最大的难题是，想出解题的思路或者说算法，我认为这是解题的第一步。有了解题步骤，再去寻找 JS 提供 method。比如有对象组成的数组：

```js
const blogs = [
{title: 'Go To Statement',author: 'Edsger',likes: 5},
{title: 'Tomorrow will be better',author: 'Ano',likes: 12},
//{...}{...}
]
```

这是个 blogs 列表，其中每个对象表示一条 blog：

1. 统计这个列表中有最多 like 的blog

思路是，在一个对象数组中，筛选出某个对象属性值最大的那个对象。利用数组的sort()方法就能完成。sort()接受一个回调函数，返回经过回调函数处理后的原数组。回调函数的参数是两个待比较的数组元素，需要返回数值。返回的数值大于0，则 b 在前。如`list.sort((a,b) => a-b)`，小的在前，所以返回升序排列的原数组。

2. 统计每个作者写的 blog 数量

这题的思路是，统计“作者”这个字段在这个列表出现的次数就可以。具体实现是：
导出一个“作者”数组（map()）——>统计数组中每个元素出现的频率（Lodash库的`._countBy`方法）——>找出对象中属性值的最大的那个属性（Object.keys().reduce()）

3. 统计拥有最多 like 的作者

这题一开始想了1个多小时没思路，出门吃饭的时候想到，如果用人工来统计步骤是什么呢？嗯，这就好比`唱票`的操作了，数组中的每一个对象是一张选票，上面写了选举人、票数，唱票的时候，拿出一张选票，找到票中的选举人，在记录总票数的地方，给那个选举人加上1票。

所以这题大致的思路是，有一个记录板专门记录所有作者的 like 数量（可以用对象）——>遍历blogs数组，对于其中的每个对象，找到记录板中相应的作者，加上相应的票数（可以用for循环）——>找出记录板中 like 数量最大的那个作者（reduce()），和第 2 题的最后一步同。

以上是对前一天 part 4.1 的回顾，接下来学习 part 4.2 测试后端

---

> 在这次测试中被 Jest timeout 的问题困扰良久，原因是测试文件无法连接到服务器，用 Postman 测试也无法一直无法脸上。而连接数据库都是没问题的。
> 经排查，在 `app.js` 中把 `app.use(cors)` 注释掉，就能正确请求到数据。

有些情况下会用 `mongo-mock` 库来模拟数据库进行测试

当前应用的后端相对简单，没什么好做单元测试的，这节课就是要测试数据库在内的整个 REST API 应用。整体测试多个系统组件的方式叫集成测试（integration testing）

我们之前在 `controllers/blogs.js` 中写了路由处理函数，所以这一章的主要测试工作是两点：
1. 这些路由处理函数能否正常工作
2. 数据库能否正确返回数据
3. 额外的：把异步函数 asycn/await 改写
4. 额外的：扩展应用的路由功能

### 一、构建一个测试环境

我们用 `NODE_ENV` 环境变量来定义应用的执行模式，一般会把开发模式和测试模式分开。做法是在 package.json 修改 script：
```js
"scripts": {
	"start": "NODE_ENV=production node index.js",
	"dev": "NODE_ENV=development nodemon index.js",
	"test": "NODE_ENV=test jest --verbose --runInBand"
}
```
`runInBand` 选项会防止 Jest 并行执行测试。

在配置应用环境的文件也要做相应修改，在 `utils/config.js`中增加 ：
```js
if (process.env.NODE_ENV === 'test') {
  MONGODB_URI = process.env.TEST_MONGODB_URI
}
```

保存环境变量值的 `.env` 文件现在有了不同的变量来区分开发和测试模式，所以增加测试数据库地址：
```js
TEST_MONGODB_URI=mongodb+srv://fullstack:secret@cluster0-ostce.mongodb.net/note-app-test?retryWrites=true
```

我们把 `npm run dev`定义为使用 nodemon 启动的开发模式， `npm start` 定义为生产模式。

> 在 Windows 平台上，要安装 cross-env 库，然后在语句前加 cross-env
> 如："start": "cross-env NODE_ENV=production node index.js"

这样修改后，我们就可以进行两种模式，此外，还可以为测试模式定义另一个独立的测试数据库。但如果多人同时开发一个应用，不同开发者最好用本地数据库进行测试，如在内存中运行 Mongo，或者使用 Docker container。

综上构建测试环境就只需要改以上三处即可：
1. package.json 文件中增加 NODE_ENV 变量来区分不同模式；
2. `utils/config.js`，config 模块中增加读取测试环境变量数值的语句；
3. `.env`文件中增加测试服务器地址

### 二、初始化测试数据库

每次测试的第一步，是清空测试数据库里的内容，然后存入预先设定的数据——一个对象数组。

用 `beforeEach()` 方法完成第一步的操作，它会在任何测试执行之前运行。

如何一次性完成多个存储数据库的异步操作？用 map() 方法遍历数据并存入数据库，这个异步操作会返回一个 Promise 数组，用`Promise.all`方法把 Promise 数组合并成一个 Promise，等待其中所有的 Promise resolved 后，它也会fulfilled。

```js
beforeEach(async () => {
  await Note.deleteMany({})

  const noteObjects = helper.initialNotes
    .map(note => new Note(note))
  const promiseArray = noteObjects.map(note => note.save())
  await Promise.all(promiseArray)
})
```
明明`const promiseArray = noteObjects.map(note => note.save())`是异步操作为什么不在这里写 await？说明异步操作会立马返回一个 promise，其状态会随着异步操作的结果进行改变，await 是为了等待 promise 的状态为 fulfilled 为止。

### 三、用 supertest 包测试 API

1. 安装
`npm install --save-dev supertest`

在项目根目录创建文件`jest.config.js`：
```js
module.exports = {
  testEnvironment: 'node'
}
```

#### 一个接一个做测试
因为在`test`目录中会写很多测试文件，每次测试的时候我们希望只执行指定的测试，方法如下：
```js
// 1. 执行指定测试文件中的全部测试
npm test -- tests/blog_api.test.js

// 2. 用 -t 指定执行某个名称的测试
npm test -- -t 'a specific note is within the returned notes'

// 3. 执行名称中包含某个关键词的测试
npm test -- -t 'notes'
```

### 四、async/await

把回调函数形式的异步代码写成“同步”形态的代码。

```js
// 用 promise chain 写异步
Note.find({})
	.then(notes => {
		return notes[0].remove()
	})
	.then(res => {
		console.log('the first one is removed')
		//...
	});
	
// 用 async/await 改写
const main = async () => {
	const notes = await Note.find({});
	const res = await notes[0].remove();
	console.log('the first one is removed');
}
main();
```

用 async/await 改写后的代码就像“同步”形态的代码，代码执行到`const notes = await Note.find({})` 时会停下来，直到相应的 promise fulfilled 为止，然后接着执行下一行，相应的 promise 会附到 `notes`变量上。执行`const res = await notes[0].remove()`时再停下来，等待 promise fulfilled。

await 不能随便写，只能在 async 关键词声明的函数中运行，上面的`main`函数被声明为异步函数。

我们可以把所有的路由处理函数写成 async 函数的形式，如：
```js
notesRouter.get('/', async (request, response) => { 
  const notes = await Note.find({});
  response.json(notes);
})
```

### 五、用 async/await 重构后端代码

### 六、异常处理

用 `express-async-errors` 代替 `try/catch` 语句。如果在 `async`路由中发生了异常，则自动转入错误处理中间件执行。

### 七、练习4.8-4.12

#### 4.8 测试 HTTP GET /api/blogs

验证其能正确返回正确数量 JSON 格式的blog列表。

测试结束后用  async/await 语法改写路由处理函数。

```js
beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog));
  const promiseArray = blogObjects.map(blog => blog.save());
  await Promise.all(promiseArray);

  console.log('初始化测试数据库成功');
});

test('共有6条blogs', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(helper.initialBlogs.length);
}, 30000);
```

Jest 的test()方法接收三个参数，依次是：测试名称、测试函数、延迟。这里在延迟的参数上写了 30000，是因为运行测试时有时遇到 Jest timeout 的问题，默认timeount 时间是 5000 ms，调整成 30000 ms 后这个问题没再遇到。

#### 4.9 写个测试函数验证其唯一标志符叫id

数据库默认为`_id`，对代码做相应修改使其通过测试，用`toBeDefined` 验证一个属性是否存在。

我们测试的是连同数据库连接在内的路由是否正确工作，**测试文件做其实是类似浏览器、Postman 的工作**，所以第一要把应用启动起来，这样才能处理测试文件发出的请求，第二其通信的流程大致如下：
（1.测试文件）：发送 http get 'api/blogs' 异步请求
（2.服务器端路由处理）：处理 get 'api/blogs' 的路由，给数据库发送异步请求获取数据，收到数据后用调用 response 参数的 json 方法，返回处理后的数据，给测试文件。
（3.测试文件）：用 `toBeDefined` 验证收到的数据中是否包含 `id` 属性。

注：将数据库返回对象中的`_id`属性名称修改成`id`，是通过在 Schema 层次定义 toJSON 方法来实现的：
```js
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
});

```

#### 4.10 测试 HTTP POST /api/blogs

验证其能成功创建一条新的 blog ，至少验证系统中的 blogs 总数增加了 1 ，也可以验证其内容被正确地存储到了数据库中。

测试结束后用  async/await 语法改写路由处理函数。

```js
// test post
test('POST一条blog后总数加1', async () => {
  const newBlog = {
    title: "How to create your first app using React part 2",
    author: "James Fisher",
    url: "www.google.com",
    likes: 4
  }
  const postResponse = await api.post('/api/blogs', newBlog);
  // 用 test 进行 post 测试，收到的响应只有id属性如{ "id":'5f51f811755fa743dd5935cc' }，用 Postman 测试，收到的响应是个完整的 blog 对象。是 Jest 做了处理？。
  // （查文档后）不是，是我请求没发送成功，post官方写法是api.post('/api/blogs').send(newBlog) ：
  const postResponse = await api.post('/api/blogs').send(newBlog);

  const getResponse = await api.get('/api/blogs');
  expect(getResponse.body).toHaveLength(7);
});
```

#### 4.11 测试 like 属性是否存在

如果请求中没有 like 属性，则默认将之设置为0。

在应用的post 路由 处理中加一处判断即可：
```js
blogsRouter.post('/blogs', async (req, res) => {
  logger.info('posting data to MongoDB...');
  const blog = new Blog(req.body);
  if(!blog.hasOwnProperty('likes')) {
    blog.likes = 0;
  }

  const result = await blog.save();
  res.status(201).json(result);
});
```

#### 4.12 测试 /api/blogs endpoint

在创建新 blogs 时，如果请求数据中没有 title 和 url 属性，后端返回状态码 400 bad request。

0905注：
测试完成，在应用的 post 路由处理中再加一处判断，如果对象中既没有 title 也没有 url 属性，让程序走返回400状态码的逻辑。实现的过程中遇到一个困难，困扰了2天。最终结论是：
【一、用请求中的 body 作为判断对象】
【二、检查对象某个属性是否存在，首选 hasOwnProperty 方法】

期间 struggle 的过程简要如下：

实现这题时遇到让我抓狂的问题，几乎就要放弃了，问题表现为这题添加判断后和4.11的代码不兼容。一开始以为只要，在应用的 post 路由处理中再加一处判断，如果对象中既没有 title 也没有 url 属性，则走返回400状态码的逻辑：
```js
 if( !blog.hasOwnProperty('title') && !blog.hasOwnProperty('url') ) { return res.status(400).send('Bad Request') }
// ...接下去是将blog保存到数据库的代码
```

然而测试时，hasOwnProperty 方法出乎意料给出了相反的结果。表现在，如果既没有 title 也没有 url 属性，不走返回400状态这条路，反而会走保存到数据库逻辑，说明 if 判断出问题，进而是判断对象是否拥有某个属性出问题。

接着把 `in`操作符、`hasOwnProperty`方法和 `typeof(x.property !== undefined)` 都测试一遍，结果让我迷惑：

POST 请求主体的对象一直固定不变，一个简单对象：

```js
  const newBlog = {
    "author": "James Fisher",
    "likes": 10
  };
```

在服务器POST路由处理函数中，把接收到的请求body打印出来，并用 mongoose schema 实例化，然后判断实例化后对象中的属性存在情况：

1. 测试对象中没有的属性 title：

源码：
```js
blogsRouter.post('/blogs', async (req, res) => {
  const blog = new Blog(req.body);

  // test blog property
  console.log('original req body:', req.body, 'blog after Schemaed:', blog, '【 title in blog? 】', 'title' in blog ,'【 blog hasOwnProperty title? 】', blog.hasOwnProperty('title'), '【 typeof blog.title !== undefined】', typeof(blog.title) !== undefined);
}
```
结果：

![test-obj-pro1](/Users/tom/Desktop/full-stack-part4/article-img/test-obj-pro1.jpg)

`hasOwnProperty`给出了 `false` 判断，`in`操作符和 `typeof(blog.title) !== undefined` 给出了 `true`

2. 测试对象中存在的属性 author：

源码，将上述的title 替换成 author。
结果：

![test-obj-pro1](/Users/tom/Desktop/full-stack-part4/article-img/test-obj-pro1.jpg)

`hasOwnProperty`给出了 `false` 判断，`in`操作符和 `typeof(blog.title) !== undefined` 给出了 `true`

写着写着想到，为什么要用mongoose Schema 的实例对象来测？
于是换成请求 body 对象进行测试。

3. 测试不存在的属性 title

源码：1 的源码中把 `blog` 换成 `req.body`

结果：

![test-obj-pro3](/Users/tom/Desktop/full-stack-part4/article-img/test-obj-pro3.jpg)

除了 typeof 方法，其他都给出正确答案 false

4. 测试存在的属性 author

源码：2 的源码中把 `blog` 换成 `req.body`

结果：

![test-obj-pro4](/Users/tom/Desktop/full-stack-part4/article-img/test-obj-pro4.jpg)

都给出了正确答案 `true`

有结论：
【一、用请求中的 body 作为判断对象】
【二、检查对象某个属性是否存在，首选 hasOwnProperty 方法】

有疑问：
为什么 new 出来的 mongoose Schema 对象用来做属性判断时有问题？






