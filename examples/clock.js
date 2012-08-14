var NoR = require('../lib/NoR.js')

var clock = new NoR(function(signal, enable){}, function(time){
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

var counter = new NoR(function(clock, count){
  count( count() + 1 )
}, function(){
  // mark the count cell so it doent
  // trigger counter execution again
  // mark it as an outputOnly cell.
  this.count.isOutput = true
})

var c = clock(true, false, 300)
var n = counter(c.signal, 0)
n.count.subscribe(function(time){
  console.log("SIGNAL on time", time, c.signal())
  if(time > 9) {
    c.enable(false)
  }
})


c.enable(true)
