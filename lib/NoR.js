/*
 * NoR - There's No Return. A javascript reactive programming engine.
 * http://vic.github.com/NoR
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
      } else if(cell.shouldPropagate.apply(undefined, arguments)){
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
      if(subscriber === cell) { return }
      var i = subscribers.indexOf(subscriber)
      if(i < 0 ) { subscribers.push(subscriber) }
    }

    var removeSubscriber = function(subscriber) {
      var i = subscribers.indexOf(subscriber)
      if(i > -1) { subscribers[i] = null }
      // TODO: clean list when too big
    }

    cell.constructor = Cell
    cell.cellName = name
    cell.toString = function() { return '{'+name+':'+value+'}' }
    cell.subscribe = addSubscriber
    cell.bind = function(other) {
      cell.subscribe(other)
      other.subscribe(cell)
    }
    cell.clearSubscribers = function() { subscribers = [] }
    cell.unSubscribe = removeSubscriber
    cell.shouldPropagate = function(){
      return value !== arguments[0] || arguments.length > 1
    }

    return cell
  }

  var Gate = function(create, impl, wire, _self){
    var rest = Array.prototype.slice.apply(arguments, [4])
      , impl =  typeof impl === 'function' ? impl : function(){}
      , names = {}
      , cells = argCells(impl, names)
      , self = names['self'] = cellWrap(Cell('self', _self))
      , timeout
      , execute = function() {
        if(timeout) { clearTimeout(timeout) }
        timeout = setTimeout(function(){
          impl.apply(invoke, cells)
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
    if(!create){ return clone }
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

    cells.forEach(function(cell, i){
      invoke[cell.cellName] = invoke[i] = cell
      if( i < rest.length ) {
        if(typeof rest[i] === 'function' && rest[i].constructor === Cell) {
          cell( rest[i]() )
          rest[i].bind(cell)
        } else {
          cell( rest[i] )
        }
      }
    })

    if(wire){
      var wireCells = argCells(wire, names)
      wireCells.forEach(function(cell, i){
        var j = cells.length + i
        if( j < rest.length ) {
          if(typeof rest[j] === 'function' && rest[j].constructor === Cell) {
            cell( rest[j]() )
            rest[j].bind(cell)
          } else {
            cell( rest[j] )
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

  var cellWrap = function(cell){
    return cell // TODO wrap
    var wrap = function(){
      var self = this, args = arguments
      return cell.apply(this, arguments)
    }
    wrap.cellName = cell.cellName
    return wrap
  }

  var argCells = function(impl, store){
    var names = impl.toString().match(ARGS_RE)
      , names = names && names[1].split(SEP_RE) || []
      , cells = []
      , store = store || {}
    names.forEach(function(name, i){
      if(! store[name]) {
        store[name] = cellWrap(Cell(name))
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
