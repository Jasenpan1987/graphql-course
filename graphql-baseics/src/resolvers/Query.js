import { includeIn } from "../helpers";

export const Query = {
  users(parent, args, { db }) {
    if (!args.query) {
      return db.users;
    }

    return db.users.filter(user => includeIn(user.name, args.query));
  },
  posts(parent, args, { db }) {
    const { query } = args;
    if (!query) {
      return db.posts;
    }
    return db.posts.filter(({ title, body }) =>
      [title, body].some(txt => includeIn(txt, query))
    );
  },
  comments(parent, args, { db }) {
    const { query } = args;
    if (!query) {
      return db.comments;
    }
    return db.comments.filter(({ text }) => includeIn(text, query));
  }
};
