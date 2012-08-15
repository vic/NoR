var NoR = require('../lib/NoR.js')

var clock = NoR(function(signal, enable){}, function(time){
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

var counter = NoR(function(clock, count){
  count( count() + 1 )
}, function(){
  // mark the count cell so it doent
  // trigger counter execution again
  // mark it as an outputOnly cell.
  this.count.isOutput = true
})

var c = clock(true, false, 600)
var n = counter(c.signal, 0)


c.signal.subscribe(function(high){
  process.stdout.write(high && '/' || '\\')
  process.stdout.write(high && '‾' || '_')
})

n.count.subscribe(function(time){
  if(time > 9) {
    console.log("")
    c.enable(false)
  }
})


c.enable(true)
