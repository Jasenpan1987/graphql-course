import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";

// sample data
let sampleUsers = [
  {
    id: "abc123",
    name: "Foo bar",
    email: "foo@bar.com",
    age: null
  },
  {
    id: "def456",
    name: "Baz Boo",
    email: "baz@boo.com",
    age: 10
  },
  {
    id: "ghi789",
    name: "John Doe",
    email: "john@doe.com",
    age: 80
  }
];

let samplePosts = [
  {
    id: "1",
    title: "Hello World",
    body: "What a beautiful day!",
    published: true,
    author: "abc123"
  },
  {
    id: "2",
    title: "I'm learning graphql",
    body: "It's fun and powerful",
    published: true,
    author: "abc123"
  },
  {
    id: "3",
    title: "My Next mission",
    body: "Learn how to use graphql with node and react",
    published: false,
    author: "def456"
  }
];

let sampleComments = [
  {
    id: "1",
    text: "This is awesome",
    author: "def456",
    post: "1"
  },
  {
    id: "2",
    text: "This is good",
    author: "def456",
    post: "2"
  },
  {
    id: "3",
    text: "This is ok",
    author: "ghi789",
    post: "3"
  },
  {
    id: "4",
    text: "This is bad",
    author: "abc123",
    post: "1"
  },
  {
    id: "5",
    text: "This is garbage",
    author: "ghi789",
    post: "2"
  }
];

function includeIn(str, sub) {
  return str.toLowerCase().includes(sub.toLowerCase());
}

// Type definitions (schema)
const typeDefs = `
  type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments(query: String): [Comment!]!
  }

  type Mutation {
    createUser(inputUser: CreateUserInput!): User!
    deleteUser(userId: ID!): User!
    createPost(inputPost: CreatePostInput!): Post!
    deletePost(postId: ID!): Post!
    createComment(inputComment: CreateCommentInput!): Comment!
    deleteComment(commentId: ID!): Comment!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }

  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID
  }

  input CreateCommentInput {
    text: String!
    author: ID!
    post: ID!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`;
// Resolvers
const resolvers = {
  User: {
    posts(parent, args) {
      return samplePosts.filter(post => post.author === parent.id);
    },
    comments(parent, args) {
      return sampleComments.filter(comment => comment.author === parent.id);
    }
  },
  Post: {
    author(parent, args) {
      // parent refers to the Post it currently running
      return sampleUsers.find(user => user.id === parent.author);
    },
    comments(parent, args) {
      return sampleComments.filter(comment => comment.post === parent.id);
    }
  },
  Comment: {
    author(parent, args) {
      return sampleUsers.find(user => user.id === parent.author);
    },
    post(parent, args) {
      return samplePosts.find(post => post.id === parent.post);
    }
  },

  Query: {
    users(parent, args) {
      if (!args.query) {
        return sampleUsers;
      }

      return sampleUsers.filter(user => includeIn(user.name, args.query));
    },
    posts(parent, args) {
      const { query } = args;
      if (!query) {
        return samplePosts;
      }
      return samplePosts.filter(({ title, body }) =>
        [title, body].some(txt => includeIn(txt, query))
      );
    },
    comments(parent, args) {
      const { query } = args;
      if (!query) {
        return sampleComments;
      }
      return sampleComments.filter(({ text }) => includeIn(text, query));
    }
  },

  Mutation: {
    createUser(parent, args, ctx, info) {
      const {
        inputUser: { name, email, age }
      } = args;

      const emailTaken = sampleUsers.some(user => user.email === email);

      if (emailTaken) {
        throw new Error("Email has been taken");
      }

      const newUser = {
        id: uuidv4(),
        name,
        email,
        age
      };
      sampleUsers.unshift(newUser);

      return newUser;
    },

    deleteUser(parent, args, ctx, info) {
      const { userId } = args;
      const userIdx = sampleUsers.findIndex(user => user.id === userId);

      if (userIdx === -1) {
        throw new Error("User not found");
      }

      const deletedUsers = sampleUsers.splice(userIdx, 1);

      // delete all the posts and comments for the deleted user
      samplePosts = samplePosts.filter(post => {
        const match = post.author === userId;

        if (match) {
          // delete all the comments for the post
          sampleComments.filter(comment => comment.post !== post.id);
        }
        return !match;
      });

      sampleComments = sampleComments.filter(
        comment => comment.author !== userId
      );

      return deletedUsers[0];
    },

    createPost(parent, args, ctx, info) {
      const {
        inputPost: { author, title, body, published }
      } = args;

      const userExist = sampleUsers.some(user => user.id === author);
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

      samplePosts.unshift(newPost);

      return newPost;
    },

    deletePost(parent, args, ctx, info) {
      const { postId } = args;
      const postIdx = samplePosts.findIndex(post => post.id === postId);

      if (postIdx === -1) {
        throw new Error("Post not found");
      }

      const deletedPosts = samplePosts.splice(postIdx, 1);

      // delete all the comments for the post
      sampleComments = sampleComments.filter(
        comment => comment.post !== postId
      );
      return deletedPosts[0];
    },

    createComment(parent, args, ctx, info) {
      const {
        inputComment: { text, author, post }
      } = args;
      const authorFound = sampleUsers.some(user => user.id === author);
      const postFound = samplePosts.find(p => p.id === post);
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

      sampleComments.push(newComment);

      return newComment;
    },

    deleteComment(parent, args, ctx, info) {
      const { commentId } = args;

      const commentIdx = sampleComments.findIndex(
        comment => comment.id === commentId
      );

      if (commentIdx === -1) {
        throw new Error("Comment not exist");
      }

      const deletedComment = sampleComments.splice(commentIdx, 1)[0];

      return deletedComment;
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(() => {
  console.log("Starting server...");
});
