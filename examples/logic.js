// This example implements most basic logic gates from the universal
// NOR gate. http://en.wikipedia.org/wiki/NOR_logic
//
// BTW, the project name was taken from this universal gate.
// And the fact that in reactive programming we need no return statements.
//
// run this from the root directory:
//
// $ node examples/logic.js

var NoR = require('../lib/NoR.js');
var truthTable = require('../test/truthTable.js'); // for testing

// The universal NOR logic gate.
var NOR = NoR(function(a, b, g){
  g( !( a() || b() ) )
})

// The NOT gate built with a NOR gate.
var NOT = NoR(function(a, g){}, function(a, g){
  NOR(a, a, g)
})

var OR = NoR(function(a, b, q){}, function(a, b, q, x){
  NOR(a, b, x)
  NOT(x, q) // same as new NOR(x, x, q)
})

var AND = NoR(function(a, b, q){}, function(a, b, q, x, y){
  NOR(a, a, x)
  NOR(b, b, y)
  NOR(x, y, q)
})

var NAND = NoR(function(a, b, q){}, function(a, b, q, x){
  AND(a, b, x)
  NOT(x, q)
})

var XOR = NoR(function(a, b, q){}, function(a, b, x, y, q){
  AND(a, b, x)
  NOR(a, b, y)
  NOR(x, y, q)
})

var XNOR = NoR(function(a, b, q){}, function(a, b, x, m, n, q){
  NOR(a, b, x)
  NOR(a, x, m)
  NOR(b, x, n)
  NOR(m, n, q)
})


var tables = {
  'NOT': [
    [true,  false],
    [false, true]
  ],
  'OR': [
    [false, false, false],
    [false, true,  true],
    [true,  false, true],
    [true,  true,  true]
  ],
  'AND': [
    [false, false, false],
    [false, true,  false],
    [true,  false, false],
    [true,  true,  true]
  ],
  'NAND': [
    [false, false, true],
    [false, true,  true],
    [true,  false, true],
    [true,  true,  false]
  ],
  'NOR': [
    [false, false, true],
    [false, true,  false],
    [true,  false, false],
    [true,  true,  false]
  ],
  'XOR': [
    [false, false, false],
    [false, true,  true],
    [true,  false, true],
    [true,  true,  false]
  ],
  'XNOR': [
    [false, false, true],
    [false, true,  false],
    [true,  false, false],
    [true,  true,  true]
  ]
}

for(var i in tables) {
  if(!tables.hasOwnProperty(i)) { continue }
  truthTable(eval(i), i, tables[i])
}
