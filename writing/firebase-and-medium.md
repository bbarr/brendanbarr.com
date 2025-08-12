---
layout: layout.vto
title: Firebase and Medium
date: 2014-09-08
tags:
  - post
  - technology
---

<p class="note warning">
  Heads up! This is an old article. It contains many anachronistic ideas and syntax. I include these in the blog as a fun way to remember what our code used to look like.
</p>

I recently started sprinkling some CSP-style channels into a Firebase app. The streaming nature of
Firebase data is a perfect fit for channels.

A simple example:

```javascript

import { chan, go, put, take, sleep, repeat, repeatTake, CLOSED } from 'medium'
import Firebase from 'firebase'

var items = chan()

var fb = new Firebase('http://myfancyapp.firebaseio.com')

fb.child('items').on('child_added', (snap) => put(items, snap.val()))

repeatTake(items, someRenderFunction)

```

Now let's push a new ```item``` to Firebase every 2 seconds.

```javascript

import { chan, go, put, take, sleep, repeat, repeatTake, CLOSED } from 'medium'
import Firebase from 'firebase'

var items = chan()

var fb = new Firebase('http://myfancyapp.firebaseio.com')

fb.child('items').on('child_added', (snap) => put(items, snap.val()))

repeatTake(items, renderUIForItem)

repeat(async () => {
  await sleep(2000)
  fb.child('items').push({ createdAt: Date.now() })
})

```

Great, though it would appear that this could go on indefinitely! We can
limit it to 10 new items by using ```repeat```'s return value to populate the
next iterations arguments. This helps simplify state-management inside ```repeat```
loops.

```javascript
repeat(async (i=1) => {
  await sleep(2000)
  fb.child('items').push({ createdAt: Date.now() })
  return i === 10 ? CLOSED : i + 1
})
```

Now, let's say Firebase already had some existing items. Our renderUIForItem
would end up getting called in a burst of initial activity, and our fancy
item adding animations would suddenly look a bit jarring.

There are a few ways to do this, but let's do what needs the least explaining.

```javascript
import { chan, go, put, take, sleep, repeat, repeatTake, CLOSED } from 'medium'
import Firebase from 'firebase'

var items = chan()
var ticks = chan()

var fb = new Firebase('http://myfancyapp.firebaseio.com')

fb.child('items').on('child_added', (snap) => put(items, snap.val()))

repeatTake(items, async (item) => {
  await take(ticks)
  renderUIForItem(item)
})

repeat(async (i=1) => {
  await sleep(2000)
  fb.child('items').push({ createdAt: Date.now() })
  return i === 10 ? CLOSED : i + 1
})

repeat(async () => {
  await sleep(300)
  await put(ticks, true)
})

```

Now our ```repeatTake``` on ```items``` will have to wait for a ```tick```
before continuing to render, which slows it down to at most 1 render per 300 ms.

There is a refreshing lack of assignments and state to support this coordination,
and I think that is just the start of what can be gained by adopting channels as your primary
async abstraction.

Check out [Medium](https://github.com/bbarr/medium) for the above CSP library.
