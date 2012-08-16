/*
 * NoR - There's No Return. A javascript reactive programming engine.
 * http://vic.github.com/NoR
 *
 * This file implement basic NoR gates that rely on a jQuery like $
 * object to provide functionality suitable for reactive programming
 * on the web. It is tested an mostly intended to be used with jQuery
 * but most of this should just work with Zepto or other frameworks.
 *
 * Copyright (c) 2012 Victor Borja
 * Licensed under the MIT license.
 */
;(function($, NoR, undefined){

  // Out NoR.$ namespace
  var $$ = {}

  /*
   * @namespace NoR.$
   * @method on
   * @param {self} An element or selector to listen events in
   * @param {eventName} The name of an event
   * @param {init} The initial value to set {target} to
   * @param {target} Set to the event.currentTarget when event is fired
   * @param {event} The triggered event itself
   */
  $$.on = NoR(null , function(self, eventName, init, target, event){
    target(init())
    target.transitory = true
    this.target     = target
    this.event      = event
    $( self() ).on( eventName(), event )
    event.subscribe(function(e){ target(e.currentTarget) })
  })

  /*
   * @namespace NoR.$
   * @method at
   * @param {self} The element to read/set value from.
   * @param {attr} Can be any jQuery element accessor, like:
   *               'val', 'text', 'html'
   *               or composed like: 'css:color', 'attr:href'
   * @param {value} A cell to read from or set value to.
   */
  $$.at = NoR(function(self, attr, value){
    var $this = $( self() )
      , second = attr().split(':', 2)
      , first = second.shift()
      , second  = second.shift()
      , accessor = $this[first]
      , setter = value.changed
      , args = second && [second] || []
      , args = setter && args.concat(value()) || args
      , val = accessor.apply($this, args)
      , val = setter || value( val )
  })


  /* Accessor for an element value */
  $$.val = NoR(null, function(self, value){
    $$.at( this.self = self, 'val', this.value = value )
  })

  /* Accessor for an element text */
  $$.text = NoR(null, function(self, value){
    $$.at( this.self = self, 'text', this.value = value )
  })

  /* Accessor for an element html */
  $$.html = NoR(null, function(self, value){
    $$.at( this.self = self, 'html', this.value = value )
  })

  /* Accessor for an element css property */
  $$.cssProp = NoR(null, function(self, property, value){
    var css = this.newCell('css', 'css:'+property())
    property.subscribe(function(p){ css('css:'+p) })
    $$.at( this.self = self, css, this.value = value )
  })

  /* Accessor for an element css class */
  $$.cssClass = NoR(function(self, className, isSet){
    this.isSet = isSet
    $this = $(self())
    if (isSet.changed) {
      if (isSet() === undefined) $this.toggleClass(className())
      else if(isSet()) $this.addClass(className())
      else $this.removeClass(className())
    } else isSet( $this.hasClass(className()) )
  })

  /* Accessor for showing/hiding an element, uses $.show */
  $$.visible = NoR(null, function(self, isVisible, speed){
    this.isVisible = isVisible
    this.speed = speed
    var $this = $(self())
    if (isVisible.changed || speed.changed)
      $this[isVisible() && 'show' || 'hide'].apply($this, [speed()])
    else isVisible( $this.is(':visible') )
  })

  /*
   * Bind elements from context having a data-bind attribute
   * with the corresponding function/gate from bindings.
   */
  $$.bind = function(bindings, context){
    $('[data-gate]', context).each(function(){
      var self = this
      $.map( $(self).attr('data-gate').split(/[ ,]+/), function(name) {
        if (bindings[name]) bindings[name](self)
      })
    })
  }

  // Export NoR jQuery gates
  NoR.$ = $$

})($, NoR)
