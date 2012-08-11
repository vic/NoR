var NoR = require('../lib/NoR.js');
var truthTable = require('../test/truthTable.js'); // for testing

// The universal NOR logic gate.
var NOR = NoR(function(a, b, g){
  g( !( a() || b() ) )
})

truthTable(NOR, 'NOR', [
  [ false, false, true  ],
  [ false, true,  false ],
  [ true,  false, false ],
  [ true,  true,  false ]
])
