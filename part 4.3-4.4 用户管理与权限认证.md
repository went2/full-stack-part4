
在关系型数据库中，有单独的表来存储资源，其关联的用户 id 以 foreign key 的形式存在资源表中。

与使用 foreign key 类似的，在文档型数据库中，用 对象 id 来refer 其他 collection 中的document。

Mongo 不支持关系型数据库中的 `join queries`，即从多张表中搜索聚合数据，但从 v3.2 开始，Mongo 开始支持 [lookup aggregation queries](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/)

在应用中，我们会用多种查询(multiple queries)的组合来实现类似`join queries`的功能。

在文档型数据库中，你要自行决定是把 notes 的引用存到 users collection 中或是把 users 的引用存到 notes collection中，或者干脆把notes 的内容存到 users 的 notes 字段中。

本教程采用将用户创建的 notes id 存到该用户的文档中，那么一个 user schema 可以定义为：
```js
const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ],
});

const User = mongoose.model('User', userSchema)
module.exports = User

```

表示用户的 document 中有个 notes 字段，是数组类型，用来存放该用户创建 notes 的 Mongo id

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWQiOiI1ZjU3NDU2ZWUzODRhYTdlYjI4ZDczZjAiLCJpYXQiOjE1OTk1NzIxOTl9.Z7Hq9tBt10ALXTwkWUYr1DhXQhPKhSc2O6899Yx1ur8

