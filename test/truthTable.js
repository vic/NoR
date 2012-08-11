var expect = require('chai').expect

var runAsExample = typeof describe !== 'function'

if(runAsExample){
  describe =  function(n, f){
    f()
  }
  it = function(n, f){ f() }
}

// For testing a row of a truth table.
var truthRow = function(gate, name) {
  var args = Array.prototype.slice.apply(arguments, [2])
  var expected = args.pop()
  var assert = function(g) {
    if(runAsExample) {
      console.log(name+' '+x.toString())
      try {
        expect(g).to.equal(expected)
      } catch(e) {
        console.error("^^^ "+e.message)
      }
    } else {
      expect(g).to.equal(expected)
    }
  }
  var x = new gate()
  x[args.length].subscribe(assert)
  x.apply(null, args)
}

// Creating a truth table test for a gate.
var truthTable = function(gate, name, table) {
  describe(name, function(){
    for(var i in table){
      it("when applied "+table[i], function() {
        truthRow.apply(null, [gate, name].concat(table[i]))
      })
    }
  })
}

module.exports = truthTable
