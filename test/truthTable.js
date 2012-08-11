var expect = require('chai').expect

// For testing a row of a truth table.
var truthRow = function(gate, name) {
  var args = Array.prototype.slice.apply(arguments, [2])
  var expected = args.pop()
  var assert = function(g) {
    expect(g).to.equal(expected)
    console.log(name+' '+x.toString())
  }
  var x = new gate()
  x[args.length].subscribe(assert)
  x.apply(null, args)
}

// Creating a truth table test for a gate.
var truthTable = function(gate, name, table) {
  for(var i in table){
    truthRow.apply(null, [gate, name].concat(table[i]))
  }
}

module.exports = truthTable
