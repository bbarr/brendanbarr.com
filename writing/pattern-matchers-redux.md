---
layout: layout.vto
title: Redux with Pattern Matched Reducers
date: 2014-12-23
tags:
  - post
  - technology
---

<p class="note warning">
  Heads up! This is an old article. It contains many anachronistic ideas and syntax. I include these in the blog as a fun way to remember what our code used to look like.
</p>

Let's start by looking at a reducer example given in the Redux documentation:

```javascript
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case COMPLETE_TODO:
      return [
        ...state.slice(0, action.index),
        Object.assign({}, state[action.index], {
          completed: true
        }),
        ...state.slice(action.index + 1)
      ]
    default:
      return state
  }
}
```

Now, using pattern-matching:

```javascript
const todos = matcher(

  { type: ADD_TODO },
  ({ text }, state) => ([
    ...state,
    {
      text: text,
      completed: false
    }
  ]),

  { type: COMPLETE_TODO },
  ({ index }, state) => ([
    ...state.slice(0, index),
    Object.assign({}, state[index], {
      completed: true
    }),
    ...state.slice(index + 1)
  ]),

  (_, state) => state
)
```

The advantages should be clear: less "noise", and the ability to independantly destructure the given action. Also, you can match on
multiple properties of the action, without nesting your conditions.

For an example of this more granular matching, let's say we wanted to allow a user to duplicate the last task by simply entering "!!".

```javascript

const todos = matcher(

  { type: ADD_TODO },
  ({ text }, state) => ([
    ...state,
    {
      text: text,
      completed: false
    }
  ]),

  { type: ADD_TODO, text: "!!" },
  ({ text }, state) => ([
    ...state,
    Object.assign({}, last(state))
  ]),

  { type: COMPLETE_TODO },
  ({ index }, state) => ([
    ...state.slice(0, index),
    Object.assign({}, state[index], {
      completed: true
    }),
    ...state.slice(index + 1)
  ]),

  (_, state) => state || []
)
```

To achieve this using the default Redux example, of course, would mean either breaking the handler out to a separate function or doing something like:

```javascript
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      if (action.text) {
        return [
          ...state,
          Object.assign({}, last(state))
        ]
      } else {
        return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    }
    case COMPLETE_TODO:
      return [
        ...state.slice(0, action.index),
        Object.assign({}, state[action.index], {
          completed: true
        }),
        ...state.slice(action.index + 1)
      ]
    default:
      return state
  }
}
```

Now, noone would write code like this, I'm sure, but with pattern-matching your reducers are ready to scale with new requirements.

The above ```matcher``` function is made by combining a argument reverser with my [kismatch](http://github.com/bbarr/kismatch) library.

```javascript
import km from 'kismatch'
let reverse = (fn) => (...args) => fn(...args.reverse())
let matcher = (...pairs) => reverse(km(...pairs))
```

The reversing of arguments is necessary because reducers in Redux receive ```(state, action)```, and
```kismatch``` takes the pattern to match (which we want to be the action) first.

```kismatch``` also supports generic match values via an API based on React's PropTypes (via another library [kisschema](http://github.com/bbarr/kisschema)).

For example:

```javascript
import km from 'kismatch'

const fn = km(

  { a: km.types.string },
  ({ a }) => console.log(a),

  { a: 'bar', b: km.types.number.isRequired },
  ({ a }) => console.log('foo', a)
)

fn({ a: 'hai there' }) // logs: 'hai there'
fn({ a: 'bar' }) // logs 'bar'
fn({ a: 'bar', b: 1 }) // logs 'foo', 'bar'
```

With this ability to compose larger functions from more granular ones, and using pattern matching to handle the logic, we can get reducers that are more
flexible, resilient, and readable.
