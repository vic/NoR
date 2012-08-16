/*
 * NoR - There's No Return. A javascript reactive programming engine.
 * http://vic.github.com/NoR
 *
 * This file implements the NoR function.
 *
 * Copyright (c) 2012 Victor Borja
 * Licensed under the MIT license.
 */
;(function(exports, undefined) {

  /* A cell holds a value and notify observers when it has changed */
  var Cell = function(name, value) {

    var cell = function() {
      var args = arguments
      if(arguments.length === 0) {
        return value
      } else if(cell.transitory || cell.hasChanged(arguments[0], value)){
        var old = value
        value = arguments[0]
        notifySubscribers(value, old, cell)
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
      if(subscriber.constructor === Gate) {
        subscriber = subscriber.execute
      }
      if(subscriber === cell) { return }
      if(arguments.length > 1) {
        var s = subscriber
          , a = Array.prototype.slice.apply(arguments, [1])
        subscriber = function(){
          s.apply(null, a)
        }
      }
      var i = subscribers.indexOf(subscriber)
      if(i < 0 ) { subscribers.push(subscriber) }
    }

    var removeSubscriber = function(subscriber) {
      if(subscriber.constructor === Gate) {
        subscriber = subscriber.execute
      }
      var i = subscribers.indexOf(subscriber)
      if(i > -1) { subscribers[i] = null }
      // TODO: clean list when too big
    }

    var clearSubscribers = function(){
      subscribers = []
    }

    var subscriberCount = function(){
      subscribers.length
    }

    var bind = function(other) {
      cell.subscribe(other)
      other.subscribe(cell)
    }

    var unbind = function(other){
      cell.unsubscribe(other)
      other.unsubscribe(cell)
    }
    var hasChanged = function(value, old){
      return value !== old
    }

    Object.defineProperty(cell, 'constructor', {value: Cell})
    Object.defineProperty(cell, 'cellName', {value: name})
    Object.defineProperty(cell, 'subscribe', {value: addSubscriber})
    Object.defineProperty(cell, 'unsubscribe', {value: removeSubscriber})
    Object.defineProperty(cell, 'bind', {value: bind})
    Object.defineProperty(cell, 'unbind', {value: unbind})
    Object.defineProperty(cell, 'notify', {value: notifySubscribers})
    Object.defineProperty(cell, 'hasChanged', {value: hasChanged})
    Object.defineProperty(cell, 'subscriberCount', {get: subscriberCount})

    cell.toString = function() { return '{'+name+':'+value+'}' }

    return cell
  }

  var Gate = function(create, impl, wire, _self){
    var rest = Array.prototype.slice.apply(arguments, [4])
      , impl =  typeof impl === 'function' ? impl : function(){}
      , names = {}
      , timeout
      , changedCells = []
      , execute = function(newVal, oldVal, cell) {
        cell.changed = function() { oldVal }
        changedCells.push(cell)
        if(timeout) { clearTimeout(timeout) }
        timeout = setTimeout(function(){
          impl.apply(invoke, cells)
          changedCells.forEach(function(cell){
            delete cell.changed
          })
          changedCells = []
        }, 0)
      }
      , clone = function(){
        var args = [], l = cells.length
        if(this instanceof arguments.callee){
          Array.prototype.forEach.apply(arguments, [function(arg, i){
            args[i + l] = arg
          }])
        } else {
          args = Array.prototype.slice.apply(arguments, [])
        }
        return Gate.apply(undefined, [true, impl, wire, _self].concat(args))
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
      , self = names['self'] = Cell('self', _self)
      , cells = argCells(impl, names)

    if(!create){ return clone }

    Object.defineProperty(invoke, 'constructor', {value: Gate})
    Object.defineProperty(invoke, 'execute', {value: execute})
    Object.defineProperty(invoke, 'clone', {value: clone})
    Object.defineProperty(invoke, 'self', {value: self})
    Object.defineProperty(invoke, 'newCell', {value: Cell})

    invoke.toString = function(){
      var buff = []
      cells.forEach(function(cell){
        buff.push(cell.cellName+":"+cell())
      })
      return '{'+buff.join(', ')+'}'
    }

    cells.forEach(function(cell, i){

      Object.defineProperty(invoke, cell.cellName, {value: cell})
      Object.defineProperty(invoke, i, {value: cell})

      if( i < rest.length ) {
        if(typeof rest[i] === 'function' && rest[i].constructor === Cell) {
          cell( rest[i]() )
          if(rest[i].transitory) {
            cell.transitory = rest[i].transitory
            rest[i].subscribe(cell)
          } else {
            rest[i].bind(cell)
          }
        } else {
          cell( rest[i] )
        }
      }
    })

    self.subscribe(execute)
    cells.forEach(function(cell){cell.subscribe(execute)})

    if(wire){
      var wireCells = argCells(wire, names)
      wireCells.forEach(function(cell, i){
        var j = cells.length + i
        if( j < rest.length ) {
          if(typeof rest[j] === 'function' && rest[j].constructor === Cell) {
            cell( rest[j]() )
            if(rest[i].transitory) {
              cell.transitory = rest[i].transitory
              rest[i].subscribe(cell)
            } else {
              rest[j].bind(cell)
            }
          } else {
            cell( rest[j] )
          }
        }
      })
      wire.apply(invoke, wireCells)
    }

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
        store[name] = Cell(name)
      }
      cells[i] = store[name]
    })
    return cells
  }

  exports(function(){
    var self = this
      , args = Array.prototype.slice.apply(arguments, [])
      , create = this instanceof arguments.callee
    return Gate.apply(this, [create].concat(args))
  })

}(typeof module === 'object' &&
  function(v){ module.exports = v } || function(v){ NoR = v }));
