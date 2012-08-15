var NoR = require('../lib/NoR.js');

var add = new NoR(function(a, b, c){
  c( a() + b() )
})

add.c.subscribe(function(c){ console.log(add.toString()) })

add(1, 2) // should output 3

setTimeout(function(){
  add.a(2) // should output a 4
}, 100)

setTimeout(function(){
  add.b(5) // should output a 7
}, 200)

setTimeout(function(){
  add(12, 12) // should output the answer to the universe life and everything
}, 300)
