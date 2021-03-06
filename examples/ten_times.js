var NoR = require('../lib/NoR.js')

var show = new NoR(function(time){
  console.log("Ok, time is "+time())
})

var bye = new NoR(function(time){
  console.log("Bye, my time is up "+time())
})

var thenElse = NoR(function(value, predicate, then, otherwise){
  if( predicate() ){
    then( value() )
  } else {
    otherwise( value() )
  }
})

var inc = new NoR(function(a, b){ b( a() + 1 ) })
var odd = new NoR(function(a, b){ b( a() % 2 == 0 ) })
var ten = new NoR(function(a, b){ b( a() < 10 ) })

var defer = new NoR(function(value, q){
  setTimeout(function(){
    q( value() )
  }, 100)
})

// this gate has no impl, we use it to create a time cell
// and wire everything to it.
new NoR(null, function(time, oddTime){

  // if time is odd, show it
  odd.a.bind(time)
  thenElse(time, odd.b, oddTime)
  show.time.bind(oddTime)

  // if time is less than 10 defer an increment to it
  ten.a.bind(time)
  inc.a.bind(time)
  thenElse(inc.b, ten.b, defer.value, bye.time)
  defer.q.bind(time)

  time(0)
})

