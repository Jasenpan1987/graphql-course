import {
  GraphQLServer
} from "graphql-yoga"

// Type definitions (schema)
const typeDefs = `
  type Query {
    greeting(name: String, initial: String): String!
    me: User!
    post: Post!
    add(a: Float!, b: Float!): Float!
    grades: [Int!]!
    sum(numbers: [Float!]!): Float!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }

  type Post {
    id: ID!
    title: String!
    body: String
    published: Boolean!
  }
`
// Resolvers
const resolvers = {
  Query: {
    add(parent, {
      a,
      b
    }) {
      return a + b
    },
    greeting(parent, args) {
      return `Hello ${!args.name? "user": args.initial ? args.initial+ " " + args.name : args.name}`
    },
    me() {
      return {
        id: "abc123",
        name: "Foo bar",
        email: "foo@bar.com",
        age: null
      }
    },
    post() {
      return {
        id: "post_1",
        title: "My awesome post",
        body: undefined,
        published: true
      }
    },
    grades(parent, args) {
      return [12, 99, 31, 82, 100]
    },
    sum(parent, args) {
      return args.numbers.reduce((total, num) => total + num, 0)
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