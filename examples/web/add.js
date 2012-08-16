(function($, NoR, $$, undefined){

  var add = new NoR(function(a, b, c){
    if (a() != undefined && b() != undefined) c( a() + b() )
  })

  var validate = NoR(function(self, valid, invalid, message){
    var n = Number( self() )
    if (Number.isNaN(n) || self().trim() == '') invalid(message())
    else valid(n)
  }, function(message){
    this.valid.transitory = true
    this.invalid.transitory = true
  })

  var validateA = new validate("First number is invalid")
  var validateB = new validate("Second number is invalid")

  var numberA = NoR(null, function(element){
    $$.val($$.on(element, 'keyup change', element).target, validateA.self)
    validateA.valid.subscribe(add.a)
  })

  var numberB = NoR(null, function(element){
    $$.val($$.on(element, 'keyup change', element).target, validateB.self)
    var dis = $$.at(element, 'prop:disabled')
    validateA.invalid.subscribe(dis.value)
    validateA.valid.subscribe(dis.value, false)
    validateB.valid.subscribe(add.b)
  })

  var result = NoR(null, function(element, value){
    $$.text(element, value)
    validateA.invalid.subscribe(value)
    validateB.invalid.subscribe(value)
    add.c.subscribe(value)
  })

  var bindings = {
    a: numberA,
    b: numberB,
    c: result
  }

  $(function(){$$.bind(bindings)})


}).apply({}, [jQuery, NoR, NoR.$])
