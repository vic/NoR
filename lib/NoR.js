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


    cell.cellName = name
    cell.toString = function() { return '{'+name+':'+value+'}' }
    cell.subscribe = addSubscriber
    cell.bind = function(other) {
      cell.subscribe(other)
      other.subscribe(cell)
    }

    return cell
  }

  var gate = function(){
    var args = Array.prototype.slice.apply(arguments, [])
      , impl = args.shift()
      , names = {}
      , cells = argCells(impl, names)
      , timeout
      , execute = function() {
        if(timeout) { clearTimeout(timeout) }
        timeout = setTimeout(function(){
          impl.apply(undefined, cells)
        }, 0)
      }
      , invoke = function() {
        if(this instanceof arguments.callee){
          var g = gate.apply(undefined, [impl].concat(args))
          for(var i in arguments){
            if(arguments[i] instanceof cell){
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
    for(var i in cells) {
      invoke[cells[i].cellName] = invoke[i] = cells[i]
      cells[i].subscribe(execute)
    }
    invoke.toString = function(){
      var buff = []
      for(var i in cells) {
        buff.push(cells[i].name+':'+cells[i]())
      }
      return '{'+buff.join(', ')+'}'
    }
    if(args.length > 0){
      for(var i in args){
        var innerCells = argCells(args[i], names)
        args[i].apply(undefined, innerCells)
      }
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
        store[names[i]] = new cell(names[i])
      }
      cells[i] = store[names[i]]
    }
    return cells
  }

  exports(gate)

}(typeof module === 'object' &&
  function(v){ module.exports = v } || function(v){ NoR = v }));
