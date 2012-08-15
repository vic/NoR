var NoR = require('../lib/NoR.js');
var expect = require('chai').expect

describe("NoR", function(){

  describe("called as constructor", function(){

    it("should create a gate and expose its cells by name", function(){
      var n = new NoR(function(a, b, c){})
      expect(n.a).not.to.be.undefined
      expect(n.b).not.to.be.undefined
      expect(n.c).not.to.be.undefined
    })

    it("should create a gate and expose its cells by position", function(){
      var n = new NoR(function(a, b, c){})
      expect(n[0].cellName).to.equal("a")
      expect(n[1].cellName).to.equal("b")
      expect(n[2].cellName).to.equal("c")
    })

    it("should execute the wiring function", function(){
      var x
      var n = new NoR(function(){}, function(){ x = 22 })
      expect(x).to.equal(22)
    })

  })

  describe("called as a function", function(){

    it("should not create a gate untill result is called", function(){
      var x = null
      var N = NoR(function(a){}, function(a){ x = a() })
      expect(N.a).to.be.undefined
      expect(x).to.be.null
      var n = N(99)
      expect(n.a).not.to.be.undefined
      expect(x).to.equal(99)
    })

    it("should pass args to wire function when "+
       "result is called as constructor", function(){
      var c = null
      var N = NoR(function(a){}, function(b){ c = b() })
      expect(N.a).to.be.undefined
      var n = new N(24)
      expect(c).to.equal(24)
      expect(n.a()).to.be.undefined
    })

  })

  describe("gate", function(){

    it("can be null and export no cells and have length of 0", function(){
      var x = new NoR()
      expect(x.length).to.equal(0)
    })

    it("is triggered when any of the gate arguments (cells) change", function(done){
      var x = 0
      var n = new NoR(function(a, b, c){
        x += 1
      })
      expect(x).to.equal(0)
      n.a('foo')
      setTimeout(function(){
        expect(x).to.equal(1)

        n.b('bar')
        setTimeout(function(){
          expect(x).to.equal(2)

          // now try changing all of them at once.
          n(1, 2, 3)
          setTimeout(function(){
            expect(x).to.equal(3)

            done()
          }, 1)

        }, 1)
      }, 1)
    })

    describe("called as function", function(){

      it("sets its exported gates to the given values", function(done){
        var x = 0
        var n = new NoR(function(a, b, c){
          x = a() + b() + c()
        })
        expect(x).to.equal(0)
        n(1, 2, 3)
        setTimeout(function(){
          expect(x).to.equal(6)

          done()
        }, 1)
      })

    })

    describe("called as constructor", function(){

      it("creates a gate clone with new cell values", function(){
        var n = new NoR(function(a){})
        expect(n.a()).to.be.undefined
        n.a(11)
        expect(n.a()).to.equal(11)
        var m = new n(99)
        expect(n.a()).to.equal(11)
        expect(m.a()).to.equal(99)
      })

      it("creates a gate clone with new bound cell", function(){
        var m = new NoR(function(b){})
        m.b(22)
        var n = new NoR(function(a){})
        expect(n.a()).to.be.undefined
        n.a(11)
        expect(n.a()).to.equal(11)
        var o = new n(m.b)
        expect(n.a()).to.equal(11)
        expect(m.b()).to.equal(22)
        expect(o.a()).to.equal(22)
        o.a(33)
        expect(m.b()).to.equal(33)
        expect(o.a()).to.equal(33)
      })

    })

    it("is executed having this set to the gate object", function(done){
      var x
      var n = new NoR(function(a){ x = this })
      expect(x).to.be.undefined
      n.a(99)
      setTimeout(function(){
        expect(x).to.equal(n)

        done()
      }, 1)
    })

    describe("implicit self cell", function(){

      it("is undefined by default", function(){
        var n = new NoR()
        expect(n.self()).to.be.undefined
      })

      it("can be set if given third value", function(){
        var n = new NoR(null, null, 99)
        expect(n.self()).to.equal(99)
      })

      it("on change triggers gate execution", function(done){
        var x
        var n = new NoR(function(){
          x = this.self()
        }, null, 99)
        expect(n.self()).to.equal(99)
        expect(x).to.be.undefined
        n.self(88)
        setTimeout(function(){
          expect(x).to.equal(88)

          done()
        }, 1)
      })

    })

    it("exports only the gate cells not the wire function ones", function(){
      var n = new NoR(function(a){}, function(b){})
      expect(n.a).to.be.ok
      expect(n.b).to.be.undefined
    })

  })

  describe("wire function", function(){

    it("is executed having this set to the gate object", function(){
      var y
      var x = new NoR(null, function(){ y = this })
      expect(y).to.equal(x)
    })

    it("on gate creation is given exeeding arguments", function(){
      var x
      var n = NoR(function(a){}, function(b){ x = b() })
      n(10, 20)
      expect(x).to.equal(20)
    })

    it("on gate creation is given arguments if called as ctor", function(){
      var x
      var n = NoR(function(a){}, function(b){ x = b() })
      new n(10)
      expect(x).to.equal(10)
    })

    it("can bind a cell to execute the gate on change", function(done){
      var x
      var n = new NoR(function(){
        x = this.b()
      }, function(b) {
        b.subscribe(this)
        this.b = b
      })
      n.b(99)
      setTimeout(function(){
        expect(x).to.equal(99)
        done()
      }, 2)
    })

    it("can set a cell not to execute the gate on change", function(done){
      var x = 0, y
      var n = new NoR(function(a, b){
        x += 1
        y = a()
      }, function(b) {
        b.unsubscribe(this)
      })
      n.a(99)
      setTimeout(function(){
        expect(n.a()).to.equal(99)
        expect(x).to.equal(1)
        expect(y).to.equal(99)

        n.b(10)
        setTimeout(function(){
          expect(x).to.equal(1)
          expect(y).to.equal(99)
          done()
        }, 1)
      }, 1)
    })

  })

})
