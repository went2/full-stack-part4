## 后端应用结构及测试入门

### 一、 项目结构

把 “打印到 console” 的功能写到单独模块中 `utils/logger.js`

`index.js` 文件只用于创建应用并启动服务器。从`app.js`中导入应用，然后运行`listen`方法。

环境变量放到 `utils/config.js` 中。文件中引用 `dotenv`来管理环境变量，包括 PORT 和 MONGODB_URI。

定义数据库模型的逻辑写在 `models/blog.js`中。数据库逻辑文件最终要导出一个数据  `model` 供 `app.js`使用。 

处理路由的代码放到  `controllers/blogs.js` 中。第一行需要引入一个路由对象：
const blogsRouter = require('express').Router();
用该对象来实现get、post 等方法，最后把它导出：
modules.exports = blogsRouter;

这个路由对象实际上是个中间件，它只定义路由的相对地址：
原来：app.get('/api/blogs/:id', callbackfun)
现在：blogsRouter.get('/:id', callbackfun)

中间件写到`utils/middleware.js`中

`app.js` 用来作各种调用，如连接数据库、使用中间件等。除了 `app.js` 文件以外，其他文件都是声明类型的，做各种定义并导出，然后在app中导入并执行异步操作。



### 练习 4.1 - 4.2

本章练习要构建一个博客列表应用，允许用户保存从互联网摘录的博客，每条博客信息包括作者、标题、url 以及 用户的点赞数。

#### 4.1 博客列表项目 步骤一

目前已有博客的后端路由逻辑文档，为它建一个 npm 项目。

用 nodemon、数据库，并能用 VS Code REST client 测试成功。

**初始化一个 nodejs 项目包含哪些必须依赖？**

```js
// 1.初始化npm
`npm init` 初始化项目模板，在目录中生成 package.json，修改其中的 “script” 字段,增加 "start": "node index.js"

// 2.安装 express 框架
`npm install express --save`

// 3.安装 nodemon 
`npm install --save-dev nodemon`

nodemon 会监视用它启动的目录中的文件，如果任何文件发生更改，nodemon 将自动重启节点应用。

用 nodemon 启动应用的命令：
`node_modules/.bin/nodemon index.js`

在 package.json 的“script”字段添加快捷启动入口

`"sript":{
	...
	"dev": "nodemon index.js"
}`

之后可用以下命令启动服务器：

`npm run dev`，不能漏掉 `run`

// 4. 安装 cors 中间件，规避同源策略

SOP(Same origin policy)是一种实现在浏览器端的安全策略，浏览器在接收加载资源之前对其来源进行检查，然后限制加载。一般情况下，同源策略默认禁止“跨域”请求，特别是ajax请求。（跨域请求如，在 www.test.com 域名下的页面，向 www.domian.com 下的 a.php 发送 ajax 请求）

解决办法是在响应头中添加 Access-Control-Allow-Origin：当前域名

CORS(Cross origin resource sharing)叫跨来源资源共享，它是一种允许网页上的受限资源，从提供一手资源来源域名以外的另一个域名被请求的机制。

通过 node 中间件 `cors` 允许来自其他源的请求

`npm install cors --save`

const cors = require('cors');
app.use(cors());

// 5.安装 Mongoose 库来使用MondoDB
`npm install mongoose --save`

// 6.安装 dotenv 使用本地环境变量
`npm install dotenv --save`，然后在根目录新建 .env 文件，记录端口号和数据库地址。别忘了把 .env 文件放到 .gitignore 中

```

**注：如果使用了一个无效的端口号，那么发送请求将无任何响应。换个端口号即可**

Restful HTTP API 的约定俗成：

- 单个实体叫做 resource （如，一条便签，一条博客条目，一条通讯录）
- 由 resource 的类型名称和其唯一标志符来创建它的唯一地址。例如：`www.example.com/api/notes/10` ，其中 `www.example.com/api` 是服务器的根URL，`notes`是类型名称，`10`是一条便签的唯一标志符。

之后就可以对资源进行由 HTTP 定义的动词动作：GET、POST、PUT、DELETE等

接下来便是具体请求的写法。

#### 4.2 博客列表项目 步骤二

将整个应用的代码按照第一部分的要求进行模块化。

### 测试 Node 应用 

测试函数放到 `utils/` 文件夹下，在文件的最后进行导出。

用 Facebook 的 jest 测试库进行测试，`npm install --save-dev jest`，安装完成后修改快捷启动并在 package.json 文件最后添加环境node环境指定：
```js
"script" :{
	//...
	"test": "jest --verbose"
}


// 在 package.json 文件最后添加
{
	//...
	"jest": {
		"testEnvironment": "node"
	}
}
```

指定环境也可以这样操作，新建名为 `jest.config.js`的配置文件，在里面定义执行环境，Jest 会自动配置文件中的设置 ：
```js
module.exports = {
	testEnvironment: 'node'
}
```

建立单路的目录用于测试如 tests，里面放置测试文件，如 palindrome.test.js，测试文件需要有.test 的后缀

测试文件的典型格式：
```js
const average = require('../utils/for_testing').average

describe('average', () => {
  test('of one value is the value itself', () => {
    expect(average([1])).toBe(1)
  })

  test('of many is calculated right', () => {
    expect(average([1, 2, 3, 4, 5, 6])).toBe(3.5)
  })

  test('of empty array is zero', () => {
    expect(average([])).toBe(0)
  })
})

```

`describe` 块用于包裹测试用例，测试用例用 `test` 函数定义，函数第一个参数是用来描述测试的字符串，第二个参数是函数，定义测试功能。第二个函数的一般是以下格式：先执行待测试的函数，然后用 `expect` 函数验证测试结果，`expect` 函数会把测试结果包裹在对象中，该对象提供一系列用于匹配正确结果的函数，如`toBe`。

写完后执行 `npm test`，jest 会显示测试结果。




#### 4.3 帮助函数及单元测试 步骤一

写一个dummy 测试函数，使之通过以下验证：
```js
test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})
```

参数是一个数组，返回数字1。

#### 4.4 帮助函数及单元测试 步骤二

写一个 `totalLikes`函数，接收 blog 列表作为参数，返回所有blog中的点赞数。

测试用例分三种情况：
1. 空列表返回0；
2. 只有一个blog时，点赞数量即改blog的点赞数；
3. 有多个blog，正确返回它们的点赞数之和。

blog列表的格式：
```js
const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]
```

只运行某一条测试：

`npm test -- -t 'when list has only one blog, equals the likes of that'`

#### 4.5 帮助函数及单元测试 步骤三

写一个 `favoriteBlog` 函数，接收一个blogs 列表作为参数，找到其中最多点赞的blog，如果有多个最多喜欢，返回其中一个即可。

返回的格式：
```js
{
  title: "Canonical string reduction",
  author: "Edsger W. Dijkstra",
  likes: 12
}	
```

由于 toBe 方法只能比较两个值，比较对象用 toEqual 方法。在新的 describe 块中测试该函数。

可以从数组排序的角度来解这个题，根据对象的某个属性值大小，对一个由对象构成的数据进行排序。

用到数组的 sort()方法：
```js
// sort()接受一个回调函数
// 回调函数的参数是两个待比较的元素，需要返回数值。返回的数值大于0，则 b 在前。
// list.sort((a,b) => a-b)，小的在前，返回升序排列的原数组。
// 用slice()返回原数组的拷贝

list.slice().sort((a, b) => (a.likes > b.likes ? -1 : 1))
```

#### 4.6 帮助函数及单元测试 步骤4-5

一、写一个 `mostBlogs`函数，接收 blogs 列表作为参数，返回拥有最多blogs 的作者，返回格式如下：

```js
{
	author: "Robert C. Martin",
	blogs: 3
}

```

可以考虑使用 `Lodash` 库。

blogs 列表中的每一个对象即表示一个blog，因此可以遍历这个数组，找出其中所有的作者及次数，形成一个作者名称列表，统计其中每个作者出现的次数，找出次数最多者及次数即可。

```js

const authorsArr = blogs.map(blog => blog.author);
// 得到数组：['haha', 'abd', 'abd', 'haha', 'haha']

const authorObj = _.countBy(authorsArr);
// 统计数组中元素出现的频率，用了Lodash库，得到对象 {abd: 2, haha: 3}

return Object.keys(authorsObj).reduce((a, b) => authorsObj[a] > authorsObj[b] 
? {author:a, likes:authorsObj[a]} 
: {author:b, likes:authorsObj[b]});
// 返回{ author: "haha", likes: 3 }

```

二、写一个 `mostlikes`函数，接收 blogs 列表作为参数，返回拥有最多 likes 的作者，返回格式如下：

```js
{
	author: "Edsger W. Dijkstra",
	likes: 17 
}

```

第二题，一种思路是对blogs 数组下手。哪怕人工统计，也可以找出数组中每个对象的 author 和对应的 likes，单独写到一个地方。可以迭代这个blogs数组，把这对数据单独保存到一个新建对象中。

```js
const blogs = [{author:'Andy', likes:12},{author:'Andy', likes:2},{author:'Bob', likes:24},{author:'Lucy', likes:9},{author:'Lucy', likes:19}]

// 1.获得去重后的作者列表，用_.uniq()方法对数组去重
let authorArr = _.uniq(blogs.map(blog => blog.author));
let allLikes = {};

// 2.allLikes 单独保存作者的所有赞，使最初的赞数为0
for(let i=0, len=authorArr.length;i<len;i++) {
	allLikes[authorArr[i]] = 0;
}

for (let i=0,len=blogs.length;i<len;i++){
	allLikes[blogs[i].author] += blogs[i].likes; 
}

// 得到结果{Andy: 14, Bob: 24, Lucy: 28}
// 3.找出对象中具有最大值的属性。最后两步可连起来写在 reduce 函数内
const mostLikesAuthor = authorArr.reduce((a,b) => allLikes[a] > allLikes[b] ? a : b);

return {
	author: mostLikesAuthor,
	likes: allLikes[mostLikesAuthor]
}

```

测试的时候一直在第二步遇到问题，如果不把 allLikes 设置好初始三个为0的属性值，让它直接在 for 循环中新增属性并增加属性值的话，循环结束后 allLikes 就是这样 { Andy: NaN, Bob: NaN, Lucy: NaN }，看来新增属性与修改属性值不能放在一步操作。

还有一种做法应该可行，但是我测试时一直没通过：
在 for 循环中增加判断，如果属性存在，则修改它，如果不存在则设为0。

判断对象中是否有某个属性的三个方法：
```js
// 1.hasOwnProperty() 
const hero = {
  name: 'Batman'
};

hero.hasOwnProperty('name');     // => true
hero.hasOwnProperty('realName'); // => false

// 2. in 操作符
// in 操作符会检查对象和它的原型链，如果能找到属性，就返回true
const hero = {
  name: 'Batman'
};

'toString' in hero;              // => true
hero.hasOwnProperty('toString'); // => false

// 3.和 undefined 比较，不存在的属性，其值返回 undefined
// 但是，如果属性存在，其值为undefined，这个方法就失效了
const hero = {
  name: 'Batman'
};
hero.name !== undefined;     // => true
hero.realName !== undefined; // => false

```










