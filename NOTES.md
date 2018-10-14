# 1. Graphql Operations

## 1.1. Graphql query

https://www.udemy.com/graphql-bootcamp/learn/v4/t/lecture/11838198?start=0

### 1.1.1 Basic query

```
query {
  # query body here
  hello
}
```

Response:

```
{
  "data": {
    "hello": "Hello world!"
  }
}
```

And you can add two field in a single query

```
query {
  hello
  courseInstructor
}
```

If you try to query some field which is not exists, it you give you an error

```
{
  "error": "Response not successful: Received status code 400"
}
```

### 1.1.2 Nested queries

Objects has types in graphql, like objects in javascript which has fields. And querying object need to passing the requested fields.

```
query {
  me{
    name
    email
  }
}
```

response:

```
{
  "data": {
    "me": {
      "name": "Andrew",
      "email": "andrew@example.com"
    }
  }
}
```

If we querying a list (array) of objects, we just do like we querying object

```
query {
  users {
    name
    email
  }
}
```

response:

```
{
  "data": {
    "users": [
      {
        "name": "Andrew",
        "email": "andrew@example.com"
      },
      {
        "name": "Sarah",
        "email": "sarah@example.com"
      },
      {
        "name": "Michael",
        "email": "michael@example.com"
      }
    ]
  }
}
```

It will give you back an array of users with selected fields.

### 1.1.3 5 Scalar types

String, Boolean, Int, Float, ID

### 1.1.4 Optional arguments that can passed into queries

- parent
- args
- ctx
- info

## 1.2 Mutation

### 1.2.1 Mutation defination

just like the `type Query`, we need to define the `type Mutation` first before any implementations.

```
  type Mutation {
    createUser(name: String!, email: String!, age: Int): User!
  }
```

To execute a mutation, you can do the similar thing as we did for query

```
mutation {
  createUser(name:"Jasen", email:"jasen@pan.com", age: 99999) {
    id
    name
    email
  }
}
```

To implement the mutation, it's also similar the queries we created earlier, all the parameters passed into the mutation is also can be access from `args`, and we can implement the logic as well as the return value.

```js
const resolvers = {
  ...,
  Query: { ... },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const {
        name,
        email,
        age
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
      }
      sampleUsers.unshift(newUser);

      return newUser;
    }
  }
}
```

### 1.2.2 Input type

In the past, when we create an user, the arguments for the mutation looks messy,

```
createUser(name:"Jasen", email:"jasen@pan.com", age: 99999)
```

Instead, we can have all the arguments in one argument, just like the arguments in javascript functions can be wrapped into one object argument. To do this we need to

1. define an input type in the type definations

```
  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID
  }
```

2. Also update our mutation definations

```
  type Mutation {
    createUser(inputUser: CreateUserInput!): User!
    ...
  }
```

Be careful, if you don't want the inputUser to be an optional argument, you need to add the `"!"` at the ned of the argument too.

3. modify our resolver function's argument

```js
Mutation: {
    createUser(parent, args, ctx, info) {
      const {
        inputUser: { name, email, age }
      } = args;
      ...
  },
  ...
}
```

Now when we run the mutation, we need to update the arguments as well

```
mutation {
  createUser(
    inputUser: {
      name: "John",
      email:"aaa@aaa.com",
      age: 18
    }
  ) {
    id
    name
    email
    age
  }
}
```

Another benefit we have after using this typed input is the input type can be reused later on, for example, if we have a mutation called `createAdminUser` which takes the exact same arguments as we have in the `createUser`, we can just say `createAdminUser(inputUser: CreateUserInput)` rather than have a list of arguments individually.

### 1.2.3 graphql file extension

When we break down the files into multiple file and directries, we can take advantage of the `graphql` file extension. All the type definitions can be saved into one or multiple `schema.graphql` files and from now on, we don't have to use the template string anymore, and for most of the ides and editors, there are plugins for the graphql files, which can give text highlight and red error lines.

When we use it in the server bootstraping step, we can give the path of the `schema.graphql` file we just created

```js
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
```

Be aware here, the path is the relative path of the root, not the relative path for the current file that uses it.

In addtion, notice we have the `context` here, this is like the dependency injection which injects the required data and / or functions into the resolver. Here, the db is the dummy data we created earlier which has also been moved to somewhere else.

In the resolver, we can access from the third argument, `context` it's much more simpler and more decoupled code, because later on, if we throw away the dummy data and move to the actual data base, we don't have to go inside every part of the resolver that has a reference to the `db`.

```js
const Query = {
  users(parent, args, context) {
    if (!args.query) {
      return context.db.users;
    }

    return context.db.users.filter(user => includeIn(user.name, args.query));
  },
  ...
}
```

## 1.3 Subscription

In graphql, you can create an subscription for the front end to listen to, and behind the scenes, it runs a websocket.

To configure the subscription on our graphql server, we need to do the following:

1. In the type defination, we add

```
type Subscription {
  count: Int!
}
```

2. In the server configuration file (`index.js` in this project),

```js
import { GraphQLServer, PubSub } from "graphql-yoga";
import db from "./db";
import {
  Query,
  Mutation,
  User,
  Post,
  Comment,
  Subscription
} from "./resolvers";

const pubsub = new PubSub();

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers: {
    User,
    Post,
    Comment,
    Query,
    Mutation,
    Subscription
  },
  context: { db, pubsub }
});

server.start(() => {
  console.log("Starting server...");
});
```

Here we added a couple of things, first, we creates an instance of `PubSub` which lives in the `graphql-yoga`. The PubSub works very similar to websocket. The subscription is the resolver we need to create next. And finally, we added the `PubSub` instance we created to the context, so that later on our resolvers can access it.

3. Create a new resolver called `Subscription`

```js
export const Subscription = {
  count: {
    subscribe(parent, args, ctx, info) {
      const { pubsub } = ctx;
      let count = 0;

      setInterval(() => {
        count += 1;
        pubsub.publish("count", {
          count
        });
      }, 1000);

      return pubsub.asyncIterator("count");
    }
  }
};
```

When we call `pubsub.publish` we need to give the channel and the data. And also, at the end, we return the `asyncIterator` which is a kind of the pubsub, and then give the channel name of `"count"`.
