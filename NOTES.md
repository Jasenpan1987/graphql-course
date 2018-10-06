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