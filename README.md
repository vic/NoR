# NoR - There's No Return.

A reactive programming engine for javascript.

## Getting Started

So what's `NoR` about?, well, simply put it's just my take at what I
learned to be `reactive programming` yet i'm not an expert at all.

Even though the term `reactive` might seem like unknown, most of us
already interact with a reactive system all the time.

When you open your spreadsheet program and start using formulas that
use values from other cells, you can observe that if you change a
value in one of that cells all other cells that depend on it get
updated accordingly, well, spreadsheets are one example of
`reactive programming`.

If you ever played around with protoboards and logic gates, you can
recall that you used to connect all those little gates to achieve
something, say a counter, a clock or any other digital system, well,
that's also `reactive`, as soon as you connect all the pieces and
throw a little voltage at it, you get it to work (or not :D).

In our days, we see `reactive` systems all around, in recent web
development people are using more and more javascript, and as many
of us have found, front-end development is almost always enterely
event based, that is, when something changes, you have to `react`.
A lot of libraries handle reacting to changes, from using
[jQuery][jquery] to act upon a browser event, [Backbone.js][backbone]
and [Knockout.js][knockout] to bind your view and model, etc.

[jquery]: http://jquery.com
[knockout]: http://knokoutjs.com
[backbone]: http://backbone.org

## There's No Return

Ok, so imagine you build a little logic gate (the [NOR gate][nor])

![The NOR logic gate](http://upload.wikimedia.org/wikipedia/commons/c/c6/NOR_ANSI_Labelled.svg)

If we try to implement it on javascript, provably it would be like this:

```javascript
var NOR = function(a, b){
  var q = !(a || b); // just for you to see a, b and q
  return q;
}
```

so far so good, well, implementing the `NOR` gate is a trivial
program. But what happens with more complex functions that can
possibly fail, in you javascript programming, have you ever seen
functions like the following?:

```javascript
var complex = function(some, thing){
   // if everything goes fine, we return a value
   // otherwise the make function will just
   // throw an exception, how else do we handle failure?
   return make(some, thing, strange)
}
```

the bad thing about functions like this is that its users need to
know that it can possibly throw an exception as means of handling
failure, (would you really throw an exception just because some value
doesnt have the form you expected? please dont!). To fix this, most
people give the complex function a callback (or a pair of callbacks)
to be called on success and/or error.

```javascript
var complex = function(some, thing, callback){
   if(everythingGoesFine) {
     callback(successValue, null)
   } else {
     callback(null, errorValue)
   }
}
```

You see? now *There's No Return*. All the function does is do its
amazing stuff and invoke the callback accordingly. But again as user
of this function you need to know that callback can take two arguments
and not just only one, or you can make the complex function take two
callbacks one for success and one for error. That is a callback for
each output the function can have.

How does this all relates to `NoR` and `reactive programming`?, read on.

[nor]: http://en.wikipedia.org/wiki/NOR_logic

## Reacting to change

Suppose we try to implement our `NOR` logic gate again wihout using
return.

```javascript
var NOR = function(a, b, q) {
  q( !( a || b ) )
}
```

So now our function takes two values `a` and `b` and a callback
function `q`. *Every time you invoke* this function you give it two
values and maybe a different callback. It doenst still reacts to
change automatically, whenever the value of `a` or `b` change you
have to apply them to the function.

The logic gates (or the spreadsheet formulas) react to changes on
their input, and automatically produce a new value for them.

Now image our same NOR implementation, but this time with `a` and
`b` also being functions. These functions if given no arguments just
give you the current *state* of each input, and our function looks like:

```javascript
var NOR = function(a, b, q) {
  q( !( a() || b() ) )
}
```

## How it works

Using the `NoR` function to create a *gate* that reacts
to changes on its inputs, and our NOR gate is:

```javascript
var NOR = NoR(function(a, b, q){
  q( !( a() || b() ) )
})
```

Looks pretty much like our previous implementation, the only
difference being that the function is wrapped with `NoR`.
What `NoR` does is creating a *cell* for each function parameter.

A *cell* is just something that looks like a function and serves to
hold a value. When a cell is given no arguments, it just returns its
current value, but when an argument is given to it, it sets its new
value and notifies everyone interested on that cell of its change.

In our example, `a`, `b` and `c` are cells, but only the first two are
used as inputs, the third as an output.

The return value of the `NoR` function also looks like a function:

```
; setting a = false b = true
NOR(false, true) ; => undefined
```

However it doesnt act as one of those functions that return values or
accept callbacks. What we have just did is simply setting the `a` *cell*
to `true` and the `b` *cell* to `false`. The result of the operation is
asynchronous, that is, we cant be sure in what exact second we have the
response.

Just like with *promises* we have something that represents a value in
the future, we dont know exactly when, but it *will* hold the response
value.

So what we do for using the value of `c` is to listen for changes
on `c` by *subscribing* to it.

For example:

```javascript
NOR.c.subscribe(function(newC){
  console.log("OK, the new value of c is", newC)
})

NOR.b(false) // here we are changing the value of the b cell

// sometime in the future we see
// a message printed to stdout.
```

The `NoR` function form is:

```javascript
NoR(gate, wiring, self)
```

Where `gate` is a function that receives *cells* and is invoked
whenever one of them changes. An `wiring` function can be specified
that receives the same *cells* than `gate` for the sake of setting up
cell subscriptions or creating inner gates. If a value for
`self` if given it will be wrapped on an special *cell* named
`self` and its value will be used as `this` whenever `gate` gets
called, of course changing the gate's self will trigger its evaluation.

For example, to build an `XOR` gate using just the universal `NOR`
gate, you can do:

![Implementing a XNOR gate using NOR gates](http://upload.wikimedia.org/wikipedia/commons/f/f8/XNOR_using_NOR.svg)

```javascript

// The universal NOR logic gate.
var NOR = NoR(function(a, b, g){
  g( !( a() || b() ) )
})

// the gate has no implementation as it's actually
// the result of the combination of several NOR gates
// and their outputs. We wire all of them on
// the setup function.
//
// Note that the XNOR gate exposes just three ports:
// a, b and q.
//
// However the gates wired inside use some others like
// x, m and n. Follow the image above.
var XNOR = NoR(function(a, b, q){}, function(a, b, x, m, n, q){
  // Using the new operator on a gate
  // simply cretes a copy of that gate
  // and we assign each its ports.
  new NOR(a, b, x)
  new NOR(a, x, m)
  new NOR(b, x, n)
  new NOR(m, n, q)
})

```

### On the server
Install the module with: `npm install NoR`

```javascript
var NoR = require('NoR');
NoR.awesome(); // "awesome"
```

### In the browser
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/vic/NoR/master/dist/NoR.min.js
[max]: https://raw.github.com/vic/NoR/master/dist/NoR.js

In your web page:

```html
<script src="dist/NoR.min.js"></script>
```

## Documentation

Use our [wiki][wiki].

[wiki]: https://github.com/vic/NoR/wiki

## Examples

See the [examples/][examples] directory and try running some of them.

```shell
$ node examples/ten_times.js
```

An example on how to implement a [JK flip-flop][jk] can be found [here][jke]

![JK flip flip](http://hyperphysics.phy-astr.gsu.edu/hbase/electronic/ietron/jk2.gif)

[jk]: http://hyperphysics.phy-astr.gsu.edu/hbase/electronic/jkflipflop.html#c2
[examples]: https://github.com/vic/NoR/tree/master/examples
[jke]: https://github.com/vic/NoR/blob/master/examples/jk-flipflop.js

## Contributing

All contributions are welcome, of course you [fork][fork] the proyect
do some changes on what you are interested, new features, typos,
tests, examples or anything you want and finally you can send a
[pull request][pulls] and I'll be more than grateful to you.

[fork]: https://github.com/vic/NoR/fork_select
[pulls]: https://github.com/vic/NoR/pulls

## Developing

First get a [fork][fork] of `NoR` and install its development
dependencies.

```shell
$ npm install
```

To run specs use the `npm test` command.

## License
Copyright (c) 2012 Victor Borja
Licensed under the MIT license.
