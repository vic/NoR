var NoR = require('../lib/NoR.js');
var truthTable = require('../test/truthTable.js'); // for testing

// The universal NOR logic gate.
var NOR = NoR(function(a, b, g){
  g( !( a() || b() ) )
})

// The NOT gate built with a NOR gate.
var NOT = NoR(function(a, g){}, function(a, g){
  new NOR(a, a, g)
})

var tables = {
  'NOT': [
    [true,  false],
    [false, true]
  ]
}


for(var i in tables) {
  if(!tables.hasOwnProperty(i)) { continue }
  truthTable(eval(i), i, tables[i])
}
