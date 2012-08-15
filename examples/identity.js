var NoR = require('../lib/NoR.js');

var identity = new NoR(function(a, b){}, function(a, b){ a.bind(b) })

identity.b.subscribe(function(x) { console.log("VALUE IS ", x) })

identity(1)
identity(22)
