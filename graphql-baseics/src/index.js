import { GraphQLServer } from "graphql-yoga";
import db from "./db";
import { Query, Mutation, User, Post, Comment } from "./resolvers";

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers: {
    User,
    Post,
    Comment,
    Query,
    Mutation
  },
  context: { db }
});

server.start(() => {
  console.log("Starting server...");
});
