export const User = {
  posts(parent, args, { db }) {
    return db.posts.filter(post => post.author === parent.id);
  },
  comments(parent, args, { db }) {
    return db.comments.filter(comment => comment.author === parent.id);
  }
};
