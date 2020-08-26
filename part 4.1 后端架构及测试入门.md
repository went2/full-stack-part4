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







