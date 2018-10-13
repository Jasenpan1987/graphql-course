export const Post = {
  author(parent, args, { db }) {
    // parent refers to the Post it currently running
    return db.users.find(user => user.id === parent.author);
  },
  comments(parent, args, { db }) {
    return db.comments.filter(comment => comment.post === parent.id);
  }
};
