import uuidv4 from "uuid/v4";

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

    const deletedUsers = db.users.splice(userIdx, 1);

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

    return deletedUsers[0];
  },

  createPost(parent, args, { db }, info) {
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

    return newPost;
  },

  deletePost(parent, args, { db }, info) {
    const { postId } = args;
    const postIdx = db.posts.findIndex(post => post.id === postId);

    if (postIdx === -1) {
      throw new Error("Post not found");
    }

    const deletedPosts = db.posts.splice(postIdx, 1);

    // delete all the comments for the post
    db.comments = db.comments.filter(comment => comment.post !== postId);
    return deletedPosts[0];
  },

  createComment(parent, args, { db }, info) {
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

    return newComment;
  },

  deleteComment(parent, args, { db }, info) {
    const { commentId } = args;

    const commentIdx = db.comments.findIndex(
      comment => comment.id === commentId
    );

    if (commentIdx === -1) {
      throw new Error("Comment not exist");
    }

    const deletedComment = db.comments.splice(commentIdx, 1)[0];

    return deletedComment;
  }
};
