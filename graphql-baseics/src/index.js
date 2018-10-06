import {
  GraphQLServer
} from "graphql-yoga"

// Type definitions (schema)
const typeDefs = `
  type Query {
    title: String!
    price: Float!
    releasedYear: Int
    rating: Float
    inStock: Boolean
  }
`
// Resolvers
const resolvers = {
  Query: {
    title: () => "Awesome book",
    price: () => 39.99,
    releasedYear: () => 2009,
    rating: () => 4.8,
    inStock: () => false
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
})

server.start(() => {
  console.log("Starting server...")
})