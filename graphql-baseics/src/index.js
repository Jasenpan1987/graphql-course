import {
  GraphQLServer
} from "graphql-yoga"

// Type definitions (schema)
const typeDefs = `
  type Query {
    hello: String!
    name: String
    age: Int
    location: String
  }
`
// Resolvers
const resolvers = {
  Query: {
    hello() {
      return "My first query..."
    },
    name() {
      return "Foo bar"
    },
    age() {
      return 100
    },
    location() {
      return "Somewhere"
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
})

server.start(() => {
  console.log("Starting server...")
})