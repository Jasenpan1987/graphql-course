const users = [
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

const posts = [
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

const comments = [
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

const db = { users, posts, comments };

export default db;
