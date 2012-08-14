/*
 * NoR - There's No Return. A javascript reactive programming engine.
 * http://vic.github.com/NoR
 *
 * Copyright (c) 2012 Victor Borja
 * Licensed under the MIT license.
 */
;(function(exports, undefined) {

  /* A cell holds a value and notify observers when it has changed */
  var cell = function(name, value) {

    var port = function() {
      var args = arguments
      if(arguments.length === 0) {
        return value
      } else if(port.shouldPropagate.apply(undefined, arguments)){
        value = arguments[0]
        notifySubscribers(value)
        //notifySubscribers.apply(undefined, args)
      }
    }

    var subscribers = []

    var notifySubscribers = function() {
      var args = arguments
      subscribers.forEach(function(subscriber){
        if(subscriber) {
          subscriber.apply(undefined, args)
        }
      })
    }

    var addSubscriber = function(subscriber) {
      if(subscriber === port) { return }
      var i = subscribers.indexOf(subscriber)
      if(i < 0 ) { subscribers.push(subscriber) }
    }

    var removeSubscriber = function(subscriber) {
      var i = subscribers.indexOf(subscriber)
      if(i > -1) { subscribers[i] = null }
      // TODO: clean list when too big
    }

    port.constructor = cell
    port.cellName = name
    port.toString = function() { return '{'+name+':'+value+'}' }
    port.subscribe = addSubscriber
    port.bind = function(other) {
      port.subscribe(other)
      other.subscribe(port)
    }
    port.clearSubscribers = function() { subscribers = [] }
    port.unSubscribe = removeSubscriber
    port.shouldPropagate = function(){
      return value !== arguments[0] || arguments.length > 1
    }

    return port
  }

  var Gate = function(impl, wire, _self){
    var rest = Array.prototype.slice.apply(arguments, [3])
      , proto = (this instanceof arguments.callee) || impl === false
      , impl =  typeof impl === 'function' ? impl : function(){}
      , names = {}
      , cells = argCells(impl, names)
      , self = names['self'] = cell('self', _self)
      , timeout
      , execute = function() {
        if(timeout) { clearTimeout(timeout) }
        timeout = setTimeout(function(){
          impl.apply(self(), cells)
        }, 0)
      }
      , clone = function(){
        var args = Array.prototype.slice.apply(arguments, [])
        return Gate.apply(undefined, [impl, wire, _self].concat(args))
      }
      , invoke = function() {
        if(this instanceof arguments.callee){
          return clone.apply(undefined, arguments)
        }
        Array.prototype.forEach.apply(arguments, [function(arg, i){
          if(cells[i]) { cells[i](arg) }
        }])
        return arguments.callee
      }
    if(proto){ return clone }
    invoke.clone = clone
    invoke.self = self
    invoke.length = cells.length
    invoke.toString = function(){
      var buff = []
      cells.forEach(function(cell){
        buff.push(cell.cellName+":"+cell())
      })
      return '{'+buff.join(', ')+'}'
    }

    cells.forEach(function(port, i){
      invoke[port.cellName] = invoke[i] = port
      if( i < rest.length ) {
        if(typeof rest[i] === 'function' && rest[i].constructor === cell) {
          port( rest[i]() )
          rest[i].bind(port)
        } else {
          port( rest[i] )
        }
      }
    })

    if(wire){
      var wireCells = argCells(wire, names)
      wireCells.forEach(function(port, i){
        var j = cells.length + i
        if( j < rest.length ) {
          if(typeof rest[j] === 'function' && rest[j].constructor === cell) {
            port( rest[j]() )
            rest[j].bind(port)
          } else {
            port( rest[j] )
          }
        }
      })
      wire.apply(invoke, wireCells)
    }

    [self].concat(cells).forEach(function(cell){
      if(!cell.isOutput) {
        cell.subscribe(execute)
      }
    })

    return invoke
  }

  var ARGS_RE = /^function\s+\(([^\)]+)\)/, SEP_RE = /,?\s+/

  var argCells = function(impl, store){
    var names = impl.toString().match(ARGS_RE)
      , names = names && names[1].split(SEP_RE) || []
      , cells = []
      , store = store || {}
    names.forEach(function(name, i){
      if(! store[name]) {
        store[name] = cell(name)
      }
      cells[i] = store[name]
    })
    return cells
  }

  exports(function(){
    var self = this, args = arguments
    Gate.apply(this, args)
  })

}(typeof module === 'object' &&
  function(v){ module.exports = v } || function(v){ NoR = v }));
