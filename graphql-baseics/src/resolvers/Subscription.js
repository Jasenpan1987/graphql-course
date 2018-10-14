export const Subscription = {
  post: {
    subscribe(parent, args, { db, pubsub }, info) {
      return pubsub.asyncIterator("post");
    }
  },

  comment: {
    subscribe(parent, args, { db, pubsub }, info) {
      const { postId } = args;
      const post = db.posts.find(p => p.id === postId && p.published);
      if (!post) {
        throw new Error("Post does not exist");
      }

      return pubsub.asyncIterator(`comment ${postId}`); // comment 44
    }
  }
};
