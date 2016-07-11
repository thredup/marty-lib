var sinon = require('sinon');
var expect = require('chai').expect;
var StoreObserver = require('../storeObserver');
var buildMarty = require('../../../test/lib/buildMarty');

describe('StoreObserver', () => {
  var Marty;

  beforeEach(() => {
    Marty = buildMarty();
  });

  describe('when `stores` contains strings', () => {
    describe('when you dont pass in an application', () => {
      it('should throw an error', () => {
        expect(notPassingInAnApplication).to.throw(Error);

        function notPassingInAnApplication() {
          return new StoreObserver({
            stores: ['foo']
          });
        }
      });
    });

    describe('when you have an id that isn\'t in the application', () => {
      it('should throw an error', () => {
        expect(listeningToAStoreThatDoesntExist).to.throw(Error);

        function listeningToAStoreThatDoesntExist() {
          return new StoreObserver({
            stores: ['foo'],
            app: new Marty.Application()
          });
        }
      });
    });

    describe('when you have an id that is registered to the application', () => {
      var onStoreChanged;

      beforeEach(() => {
        onStoreChanged = sinon.spy();

        var app = new Marty.Application();

        app.register('foo', Marty.Store);

        new StoreObserver({ // jshint ignore:line
          app: app,
          component: { },
          stores: ['foo'],
          onStoreChanged: onStoreChanged
        });

        app.foo.hasChanged();
      });

      it('should listen to that store', () => {
        expect(onStoreChanged).to.be.calledOnce;
      });
    });

    describe('when you have an id that is registered to the application with matching event key', () => {
      var onStoreChanged;

      beforeEach(() => {
        onStoreChanged = sinon.spy();

        var app = new Marty.Application();

        app.register('foo', Marty.Store);

        new StoreObserver({ // jshint ignore:line
          app: app,
          component: { },
          stores: ['foo:bar'],
          onStoreChanged: onStoreChanged
        });

        app.foo.hasChanged('bar');
      });

      it('should trigger onStoreChanged', () => {
        expect(onStoreChanged).to.be.calledOnce;
      });
    });

    describe('when you have an id that is registered to the application with mismatched event keys', () => {
      var onStoreChanged;

      beforeEach(() => {
        onStoreChanged = sinon.spy();

        var app = new Marty.Application();

        app.register('foo', Marty.Store);

        new StoreObserver({ // jshint ignore:line
          app: app,
          component: { },
          stores: ['foo:bar'],
          onStoreChanged: onStoreChanged
        });

        app.foo.hasChanged('baz');
      });

      it('should NOT trigger onStoreChanged', () => {
        expect(onStoreChanged).to.be.notCalled;
      });
    });
  });
});