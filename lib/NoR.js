/*
 * NoR - There's No Return. A javascript reactive programming engine.
 * http://vic.github.com/NoR
 *
 * Copyright (c) 2012 Victor Borja
 * Licensed under the MIT license.
 */

(function(exports) {


  /* A cell holds a value and notify observers when it has changed */
  var cell = function(value, name) {

    var cell = function() {
      if(arguments.length === 0) {
        return value
      } else if(value !== arguments[0]) {
        notifySubscribers(value = arguments[0])
      }
    }

    var subscribers = []

    var notifySubscribers = function(value) {
      for(var i in subscribers) {
        if(subscribers[i]) { subscribers[i](value) }
      }
    }

    var addSubscriber = function(subscriber) {
      var i = subscribers.indexOf(subscriber)
      if(i < 0 ) { subscribers.push(subscriber) }
    }

    var removeSubscriber = function(subscriber) {
      var i = subscribers.indexOf(subscriber)
      if(i > -1) { subscribers[i] = null }
      // TODO: clean list when too big
    }

    cell.toString = function() { return '{'+name+':'+value+'}' }
    cell.subscribe = addSubscriber
    cell.bind = function(other) {
      cell.subscribe(other)
      other.subscribe(cell)
    }

    return cell
  }

  var gate = function(impl, self, undefined){
    var args_re = /^function\s+\(([^\)]+)\)/, sep_re = /,?\s+/
      , names = impl.toString().match(args_re)[1].split(sep_re)
      , self = self || new cell
      , cells = []
      , timeout
      , execute = function() {
        if(timeout) { clearTimeout(timeout) }
        timeout = setTimeout(function(){
          impl.apply(self(), cells)
        }, 0)
      }
      , invoke = function() {
        if(this instanceof arguments.callee){
          var g = gate(impl, self)
          for(var i in arguments){
            if(arguments[i] instanceof cell){
              arguments[i].bind(g[i])
              g[i](arguments[i]())

            } else {
              g[i](arguments[i])
            }
          }
          return g
        }
        for(var i in arguments) {
          cells[i](arguments[i])
        }
      }
    self.subscribe(execute)
    for(var i in names) {
      invoke[names[i]] = invoke[i] = cells[i] = cell(undefined, names[i])
      cells[i].subscribe(execute)
    }
    invoke.toString = function(){
      var buff = []
      for(var i in names) {
        buff.push(names[i]+':'+cells[i]())
      }
      return '{'+buff.join(', ')+'}'
    }
    return invoke
  }

  exports.NoR = function(impl, self) {
    return gate(impl, self)
  }

  exports.awesome = function() {
    return 'awesome';
  };

}(typeof exports === 'object' && exports || this));
