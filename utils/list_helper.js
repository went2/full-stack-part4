const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogList) => {
  const reducer = (sum, item) => {
    return sum + item.likes;
  }

  return blogList.length === 0 
    ? 0 
    : blogList.reduce(reducer, 0);

};

const favoriteBlog = (blogList) => {
  const newList = blogList.slice().sort((a,b) => (a.likes > b.likes ? -1 : 1));

  return {
    title: newList[0].title,
    author: newList[0].author,
    likes: newList[0].likes
  };
};

const mostBlogs = (blogList) => {
  const authorsArr = blogList.map(blog => blog.author);
  const authorsObj = _.countBy(authorsArr);
  return Object.keys(authorsObj).reduce((a, b) => 
    authorsObj[a] > authorsObj[b] 
    ? {author:a, blogs:authorsObj[a]} 
    : {author:b, blogs:authorsObj[b]});
};

const mostlikes = (blogs) => {
  const authorArr = _.uniq(blogs.map(blog => blog.author));
  let allLikes = {};

  for(let i=0, len=authorArr.length;i<len;i++) {
    allLikes[authorArr[i]] = 0;
  }
  
  for (let i=0,len=blogs.length;i<len;i++){
    allLikes[blogs[i].author] += blogs[i].likes; 
  }

  const mostLikesAuthor = authorArr.reduce((a,b) => allLikes[a] > allLikes[b] ? a : b);

  return {
	  author: mostLikesAuthor,
	  likes: allLikes[mostLikesAuthor]
  };
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostlikes };