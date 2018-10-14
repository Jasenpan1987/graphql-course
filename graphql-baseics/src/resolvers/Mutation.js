import uuidv4 from "uuid/v4";
import { CREATED, UPDATED, DELETED } from "./MutationTypes";

export const Mutation = {
  createUser(parent, args, { db }, info) {
    const {
      inputUser: { name, email, age }
    } = args;

    const emailTaken = db.users.some(user => user.email === email);

    if (emailTaken) {
      throw new Error("Email has been taken");
    }

    const newUser = {
      id: uuidv4(),
      name,
      email,
      age
    };
    db.users.unshift(newUser);

    return newUser;
  },

  deleteUser(parent, args, { db }, info) {
    const { userId } = args;
    const userIdx = db.users.findIndex(user => user.id === userId);

    if (userIdx === -1) {
      throw new Error("User not found");
    }

    const [deletedUser] = db.users.splice(userIdx, 1);

    // delete all the posts and comments for the deleted user
    db.posts = db.posts.filter(post => {
      const match = post.author === userId;

      if (match) {
        // delete all the comments for the post
        db.comments.filter(comment => comment.post !== post.id);
      }
      return !match;
    });

    db.comments = db.comments.filter(comment => comment.author !== userId);

    return deletedUser;
  },

  updateUser(parent, args, { db }, info) {
    const { userId, user } = args;

    const userForUpdate = db.users.find(u => u.id === userId);
    if (!userForUpdate) {
      throw new Error("User not found");
    }

    if (user.email !== undefined) {
      const emailTaken = db.users.some(u => u.email === user.email);
      if (emailTaken) {
        throw new Error("This email has been taken");
      }

      userForUpdate.email = user.email;
    }

    if (user.name !== undefined && typeof user.name === "string") {
      userForUpdate.name = user.name;
    }

    if (user.age !== undefined) {
      userForUpdate.age = user.age;
    }

    return userForUpdate;
  },

  createPost(parent, args, { db, pubsub }, info) {
    const {
      inputPost: { author, title, body, published }
    } = args;

    const userExist = db.users.some(user => user.id === author);
    if (!userExist) {
      throw new Error("User does not exist");
    }

    const newPost = {
      id: uuidv4(),
      title,
      body,
      published,
      author
    };

    db.posts.unshift(newPost);

    if (published) {
      pubsub.publish("post", {
        post: {
          mutation: CREATED,
          data: newPost
        }
      });
    }

    return newPost;
  },

  deletePost(parent, args, { db, pubsub }, info) {
    const { postId } = args;
    const postIdx = db.posts.findIndex(post => post.id === postId);

    if (postIdx === -1) {
      throw new Error("Post not found");
    }

    const [deletedPost] = db.posts.splice(postIdx, 1);
    // delete all the comments for the post
    db.comments = db.comments.filter(comment => comment.post !== postId);

    if (deletedPost.published) {
      pubsub.publish("post", {
        post: {
          mutation: DELETED,
          data: deletedPost
        }
      });
    }
    return deletedPost;
  },

  updatePost(parent, args, { db, pubsub }, info) {
    const { postId, post } = args;

    const postForUpdate = db.posts.find(p => p.id === postId);
    const originalPost = { ...postForUpdate };

    if (!postForUpdate) {
      throw new Error("Post not found");
    }

    if (post.title !== undefined && typeof post.title === "string") {
      postForUpdate.title = post.title;
    }

    if (post.body !== undefined && typeof post.body === "string") {
      postForUpdate.body = post.body;
    }

    if (post.published !== undefined && typeof post.published === "boolean") {
      postForUpdate.published = post.published;

      if (originalPost.published && !post.published) {
        // delete
        pubsub.publish("post", {
          post: {
            mutation: DELETED,
            data: originalPost
          }
        });
      } else if (!originalPost.published && post.published) {
        // create
        pubsub.publish("post", {
          post: {
            mutation: CREATED,
            data: postForUpdate
          }
        });
      }
    } else if (postForUpdate.published) {
      // update
      pubsub.publish("post", {
        post: {
          mutation: UPDATED,
          data: postForUpdate
        }
      });
    }

    return postForUpdate;
  },

  createComment(parent, args, { db, pubsub }, info) {
    const {
      inputComment: { text, author, post }
    } = args;
    const authorFound = db.users.some(user => user.id === author);
    const postFound = db.posts.find(p => p.id === post);
    if (!postFound) {
      throw new Error("Post does not exist");
    }

    if (!postFound.published) {
      throw new Error("Post is not published");
    }

    if (!authorFound) {
      throw new Error("Author not found");
    }

    const newComment = {
      id: uuidv4(),
      text,
      author,
      post
    };

    db.comments.push(newComment);
    pubsub.publish(`comment ${post}`, {
      comment: {
        mutation: CREATED,
        data: newComment
      }
    });
    return newComment;
  },

  deleteComment(parent, args, { db, pubsub }, info) {
    const { commentId } = args;

    const commentIdx = db.comments.findIndex(
      comment => comment.id === commentId
    );

    if (commentIdx === -1) {
      throw new Error("Comment not exist");
    }

    const [deletedComment] = db.comments.splice(commentIdx, 1);

    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: DELETED,
        data: deletedComment
      }
    });

    return deletedComment;
  },

  updateComment(parent, args, { db, pubsub }, info) {
    const { commentId, comment } = args;

    const commentForUpdate = db.comments.find(c => c.id === commentId);

    if (!commentForUpdate) {
      throw new Error("Comment not found");
    }

    if (comment.text !== undefined && typeof comment.text === "string") {
      commentForUpdate.text = comment.text;
    }

    pubsub.publish(`comment ${commentForUpdate.post}`, {
      comment: {
        mutation: UPDATED,
        data: commentForUpdate
      }
    });
    return commentForUpdate;
  }
};
