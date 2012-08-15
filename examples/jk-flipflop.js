// http://hyperphysics.phy-astr.gsu.edu/hbase/electronic/jkflipflop.html#c3
var NoR = require('../lib/NoR.js')

var NAND = NoR(function(a, b, q){
  q( !( a() && b() ) )
}, function(){
  this.q.isOutput = true // dont trigger execution if q changes
})

var NAND3 = NoR(function(a, b, c, q){
  q( !( a() && b() && c() ) )
}, function(){
  this.q.isOutput = true // dont trigger execution if q changes
})


var JK = NoR(function(clock, j, k, q, Q){}, function(clock, j, k, q, Q){

  var A = NAND3(), B = NAND3(), C = NAND(), D = NAND()

  A.a.bind(clock)
  A.b.bind(j)
  A.c.bind(Q)

  B.a.bind(clock)
  B.b.bind(k)
  B.c.bind(q)

  C.a.bind(A.q)
  C.b.bind(D.q)
  C.q.bind(q)

  D.a.bind(B.q)
  D.b.bind(C.q)
  D.q.bind(Q)

})


var Clock = NoR(function(signal, enable){}, function(time){
  var timeout, enable = this.enable, signal = this.signal
  tick = function() {
    signal(! signal() )
    timeout = setTimeout(tick, time())
  }
  enable.subscribe(function(enable){
    if(enable) {
      tick()
    } else if(timeout){
      clearTimeout(timeout)
    }
  })
})

var clock = Clock(false, false, 800)
var jk = JK(clock.signal)

clock.signal.subscribe(function(){
  console.log("CLOCK SIGNAL", jk)
})

clock.enable(true)

var set = function(j, k, should, after){
  setTimeout(function(){
    console.log("\n\nSetting J="+j+" K="+k+" ... q="+should)
    jk.j(j)
    jk.k(k)
  }, after)
}

set(false, true, false, 2000) // reset
set(true, false, true, 4000)  // set
set(true, true, "be toggling", 8000)  // toggle
set(true, true, "be toggling", 10000)  // toggle
set(true, false, true, 12000)  // set


setTimeout(function(){
  console.log("\n\nOk, done.")
  clock.enable(false)
}, 15000)
