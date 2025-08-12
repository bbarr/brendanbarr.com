---
layout: layout.vto
title: Introducing PointerJS
date: 2014-10-13
tags:
  - post
  - technology
---

This allows for a single application state to be split into digestable pieces. Give components just what they need to know about, providing a focused view of relavent data.

Backing data is treated as immutable, making <code>shouldComponentUpdate</code> checks trivially easy to implement. It even comes with a React Mixin that looks for any props that begin with $ and assumes they consist of pointers to the only relevant data... if they don't show changes then there is no reason to update the component.
