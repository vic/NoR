var NoR = require('../lib/NoR.js');

var Person = function(name) {
  this.name = name
  this.hello = function(you){
    return "Hello "+you.name+" my name is "+this.name
  }
}

var victor = new Person("Victor")
var hugo = new Person("Hugo")

var hello = new NoR(function(you){
  console.log(this.self().hello(you()))
}, null, victor)

hello(hugo)

setTimeout(function(){
  hello.self(hugo)
  hello(victor)
}, 10)
