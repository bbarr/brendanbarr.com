---
layout: layout.vto
title: Introducing PointerJS
date: 2014-10-13
tags:
  - post
  - technology
---

<p class="note warning">
  Heads up! This is an old article. It contains many anachronistic ideas and syntax. I include these in the blog as a fun way to remember what our code used to look like.
</p>

This allows for a single application state to be split into digestable pieces. Give components just what they need to know about, providing a focused
view of relavent data.

Backing data is treated as immutable, making `shouldComponentUpdate` checks trivially easy to implement. It even comes with a React Mixin that
looks for any props that begin with `$` and assumes they consist of pointers to the only relevant data... if they don't show changes then there is
no reason to update the component.


Some examples:

```javascript

var state = { list: [], person: { name: 'brendan', age: 30 } }

var $state = pointer(state, function(newState) {

  // do stuff with new state... like, rerender your app!
  // Note, a pointer is persistent here, what actually changes is underlying data
  React.renderComponent(App({ $state: $state }), document.body)
})

var $person = $state.refine('person')

$person.deref() //=> { name: 'brendan', age: 30 }
$person.get('name') //=> 'brendan'

$person.update({ age: { $set: 31 } }) // causes above callback to fire

var BioComponent = React.createClass({

  mixins: [ pointer.util.changeDetectorMixin ],

  /* rest of class omitted */

})

var App = React.createClass({
  render: function() {
    return BioComponent({ $person: this.props.$state.refine('person') })
  }
})

$state.update({ person: { age: { $set: 31 } } }) // BioComponent will be rerendered
$state.update({ list: { $push: [ {} ] } }) // BioComponent will NOT be rerendered


```

This has become my favorite way of triggering App rerenders with React. I avoid mutating state, can implement undo/redo easily, and have very little trouble
reasoning about what my UI is doing, and why it is doing it.

And since it is pretty short, here is the entire source:

```javascript


var React = require('react/addons')

var util = {

  changeDetectorMixin: {

    shouldComponentUpdate: function(props) {
      var pointerKeys = Object.keys(props).filter(function(k) { return k.charAt(0) === '$' })
      if (pointerKeys.length === 0) return true

      return pointerKeys.reduce(function(bool, key) {
        if (bool) return bool
        if (!props[key].isChanged) return bool
        return props[key].isChanged()
      }, false)
    }
  },

  pick: function(data, path, defaultish) {
    if (!data) return defaultish
    if (path.length == 0) return data
    var pathArray = (typeof path === 'string') ? path.split('.') : path
    var failed = false
    return pathArray.reduce(function(memo, segment) {
      if (failed) return defaultish
      var next = memo[segment]
      if (!next) failed = true
      return next
    }, data)
  },

  nest: function(path, nestee) {
    if (!path.length) return nestee
    var pathArray = (typeof path === 'string') ? path.split('.') : path
    var lastI = pathArray.length - 1
    var leadUp = pathArray.slice(0, lastI)
    var nestKey = pathArray[lastI]
    var base = {}
    var nestPoint = leadUp.reduce(function(memo, key, i) {
      return memo[key] = {}
    }, base)
    nestPoint[nestKey] = nestee
    return base
  }
}

module.exports = function(data, cb) {

  // all subs maintain closure link to "root"
  function subPointer(path) {

    return {

      _refresh: function() {
        var current = util.pick(root.data, path)
        this._previous = this._current
        this._current = current
      },

      isChanged: function() { return this._previous !== this._current },

      refine: function(ext) {
        var newPath = path.concat(typeof ext == 'string' ? ext.split('.') : ext)
        var newPathString = newPath.join('.')
        var existing = root.subs[newPathString]
        var sub = existing || (root.subs[newPathString] = subPointer(newPath))
        !existing && sub._refresh()
        return sub
      },

      fromRoot: function(ext) {
        return root.refine(ext)
      },

      deref: function(orDefault) {
        return typeof this._current !== 'undefined' ? this._current : orDefault
      },

      update: function(delta) {
        var deltaForRoot = util.nest(path, delta)
        var newData = React.addons.update(root.data, deltaForRoot)
        root.swap(newData)
      },

      get: function(path) {
        return util.pick(this.deref(), path)
      },

      set: function(val) {
        return this.update({ $set: val })
      }
    }
  }

  // build root pointer, with extra magix
  var root = subPointer([])
  root._current = root.data = data
  root.subs = {}
  root.swap = function(newData) {
    root.data = newData
    root._refresh()
    Object.keys(this.subs).forEach(function(k) { root.subs[k]._refresh() })
    cb && cb()
  }

  return root
}

module.exports.util = util

```

[http://github.com/bbarr/pointer-js](http://github.com/bbarr/pointer-js)
