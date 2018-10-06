import {
  GraphQLServer
} from "graphql-yoga"

// sample data
const sampleUsers = [{
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
]

const samplePosts = [{
    id: "1",
    title: "Hello World",
    body: "What a beautiful day!",
    published: true
  },
  {
    id: "2",
    title: "I'm learning graphql",
    body: "It's fun and powerful",
    published: true
  },
  {
    id: "3",
    title: "My Next mission",
    body: "Learn how to use graphql with node and react",
    published: false
  },
]

function includeIn(str, sub) {
  return str.toLowerCase().includes(sub.toLowerCase());
}

// Type definitions (schema)
const typeDefs = `
  type Query {
    me: User!
    users(query: String): [User!]!
    post: Post!
    posts(query: String): [Post!]!
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
    users(parent, args) {
      if (!args.query) {
        return sampleUsers
      }

      return sampleUsers.filter(user => includeIn(user.name, args.query))
    },
    posts(parent, args) {
      const {
        query
      } = args;
      if (!query) {
        return samplePosts;
      }
      return samplePosts.filter(({
        title,
        body
      }) => [title, body].some(txt => includeIn(txt, query)))
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