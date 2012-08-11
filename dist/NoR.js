/*! NoR - v0.0.0 - 2012-08-11
* http://vic.github.com/NoR
* Copyright (c) 2012 Victor Borja; Licensed MIT */

;(function(exports, undefined) {

  /* A cell holds a value and notify observers when it has changed */
  var cell = function(name, value) {

    var zell = function() {
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
      if(subscriber === zell) { return }
      var i = subscribers.indexOf(subscriber)
      if(i < 0 ) { subscribers.push(subscriber) }
    }

    var removeSubscriber = function(subscriber) {
      var i = subscribers.indexOf(subscriber)
      if(i > -1) { subscribers[i] = null }
      // TODO: clean list when too big
    }

    zell.constructor = cell
    zell.cellName = name
    zell.toString = function() { return '{'+name+':'+value+'}' }
    zell.subscribe = addSubscriber
    zell.bind = function(other) {
      zell.subscribe(other)
      other.subscribe(zell)
    }

    return zell
  }

  var gate = function(impl, setup, self){
    var args = arguments
      , names = {}
      , cells = argCells(impl, names)
      , timeout
      , execute = function() {
        if(timeout) { clearTimeout(timeout) }
        timeout = setTimeout(function(){
          impl.apply(self(), cells)
        }, 0)
      }
      , invoke = function() {
        if(this instanceof arguments.callee){
          var g = gate.apply(undefined, args)
          for(var i in arguments){
            if(arguments[i] && arguments[i].constructor === cell){
              arguments[i].bind(g[i])
            } else {
              g[i](arguments[i])
            }
          }
          return g
        }
        for(var i in arguments) {
          cells[i](arguments[i])
        }
        return arguments.callee
      }
    self = names['self'] = cell('self', self)
    for(var i in cells) {
      invoke[cells[i].cellName] = invoke[i] = cells[i]
    }
    invoke.self = self
    invoke.length = cells.length
    invoke.toString = function(){
      var buff = []
      for(var i in cells) {
        buff.push(cells[i].cellName+':'+cells[i]())
      }
      return '{'+buff.join(', ')+'}'
    }
    if(setup){
      var innerCells = argCells(setup, names)
      setup.apply(self(), innerCells)
    }
    self.subscribe(execute)
    for(var i in cells) {
      cells[i].subscribe(execute)
    }
    return invoke
  }

  var ARGS_RE = /^function\s+\(([^\)]+)\)/, SEP_RE = /,?\s+/

  var argCells = function(impl, store){
    var names = impl.toString().match(ARGS_RE)[1].split(SEP_RE)
      , cells = []
      , store = store || {}
    for(var i in names){
      if(! store[names[i]]) {
        store[names[i]] = cell(names[i])
      }
      cells[i] = store[names[i]]
    }
    return cells
  }

  exports(gate)

}(typeof module === 'object' &&
  function(v){ module.exports = v } || function(v){ NoR = v }));
