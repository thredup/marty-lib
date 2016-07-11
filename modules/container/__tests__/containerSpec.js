'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var sinon = require('sinon');
var _ = require('../../mindash');
var expect = require('chai').expect;
var _fetch = require('../../store/fetch');
var buildMarty = require('../../../test/lib/buildMarty');

var renderIntoDocument = require('react/addons').addons.TestUtils.renderIntoDocument;

describe('Container', function () {
  var Marty, InnerComponent, ContainerComponent, expectedProps, element, context, app;
  var initialProps, updatedProps, handler, handlerContext, initialContext, innerFunctionContext;

  beforeEach(function () {
    context = {
      foo: 'bar'
    };

    handler = sinon.spy(function () {
      handlerContext = this;
      return React.createElement('div', null);
    });

    Marty = buildMarty();

    app = new Marty.Application();

    app.register('store', Marty.createStore({
      getInitialState: function getInitialState() {
        return {};
      },
      addFoo: function addFoo(foo) {
        this.state[foo.id] = foo;
        this.hasChanged();
      },
      getFoo: function getFoo(id) {
        return this.state[id];
      }
    }));

    InnerComponent = React.createClass({
      displayName: 'InnerComponent',

      contextTypes: Marty.contextTypes,
      render: function render() {
        return React.createElement('div');
      },
      getInitialState: function getInitialState() {
        innerFunctionContext = this;
        initialContext = this.context;
        initialProps = withoutApp(this.props);
        return {};
      },
      componentWillReceiveProps: function componentWillReceiveProps(props) {
        updatedProps = withoutApp(props);
      },
      foo: function foo() {
        return { bar: 'baz' };
      }
    });
  });

  describe('when I dont pass in an inner component', function () {
    it('should throw an error', function () {
      expect(createContainerWithNoInnerComponent).to['throw'](Error);

      function createContainerWithNoInnerComponent() {
        Marty.createContainer();
      }
    });
  });

  describe('component lifecycle', function () {
    var ParentComponent;
    var componentWillReceiveProps;
    var componentWillUpdate;
    var componentDidUpdate;
    var componentDidMount;
    var componentWillUnmount;
    var componentWillMount;

    beforeEach(function () {
      componentWillReceiveProps = sinon.spy();
      componentWillUpdate = sinon.spy();
      componentDidUpdate = sinon.spy();
      componentDidMount = sinon.spy();
      componentWillUnmount = sinon.spy();
      componentWillMount = sinon.spy();

      ContainerComponent = wrap(InnerComponent, {
        componentWillReceiveProps: componentWillReceiveProps,
        componentWillUpdate: componentWillUpdate,
        componentDidUpdate: componentDidUpdate,
        componentDidMount: componentDidMount,
        componentWillUnmount: componentWillUnmount,
        componentWillMount: componentWillMount
      });

      ParentComponent = React.createClass({
        displayName: 'ParentComponent',

        render: function render() {
          return React.createElement(
            'div',
            null,
            React.createElement(ContainerComponent, { foo: this.state.foo })
          );
        },
        getInitialState: function getInitialState() {
          return {
            foo: 'bar'
          };
        }
      });

      element = renderIntoDocument(React.createElement(ParentComponent, { app: app }));

      element.setState({
        foo: 'baz'
      });

      React.unmountComponentAtNode(element.getDOMNode().parentNode);
    });

    it('should call componentWillReceiveProps if passed in', function () {
      expect(componentWillReceiveProps).to.be.calledOnce;
    });

    it('should call componentWillUpdate if passed in', function () {
      expect(componentWillUpdate).to.be.calledOnce;
    });

    it('should call componentDidUpdate if passed in', function () {
      expect(componentDidUpdate).to.be.calledOnce;
    });

    it('should call componentDidMount if passed in', function () {
      expect(componentDidMount).to.be.calledOnce;
    });

    it('should call componentWillUnmount if passed in', function () {
      expect(componentWillUnmount).to.be.calledOnce;
    });

    it('should call componentWillMount if passed in', function () {
      expect(componentWillMount).to.be.calledOnce;
    });
  });

  describe('when the component is bound to an application', function () {
    var actualApplication = undefined;

    beforeEach(function () {
      app = new Marty.Application();

      var TestComponent = (function (_React$Component) {
        _inherits(TestComponent, _React$Component);

        function TestComponent(props, context) {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).call(this, props, context);
          actualApplication = props.app;
        }

        _createClass(TestComponent, [{
          key: 'render',
          value: function render() {
            return false;
          }
        }]);

        return TestComponent;
      })(React.Component);

      var WrappedComponent = Marty.createContainer(TestComponent);

      renderIntoDocument(React.createElement(WrappedComponent, { app: app }));
    });

    it('should pass the app down through the props', function () {
      expect(actualApplication).to.equal(app);
    });
  });

  describe('when I pass in a simple component', function () {
    beforeEach(function () {
      ContainerComponent = Marty.createContainer(InnerComponent);
    });

    it('should return a renderable component', function () {
      render(ContainerComponent);
    });

    it('should make the original component accessible at InnerComponent', function () {
      expect(ContainerComponent.InnerComponent).to.equal(InnerComponent);
    });

    it('should set the display name on classical React components', function () {
      expect(render(ContainerComponent).constructor.displayName).to.eql('InnerComponentContainer');
    });

    it('should set the display name on ES6 React components', function () {
      var ES6InnerComponent = (function (_React$Component2) {
        _inherits(ES6InnerComponent, _React$Component2);

        function ES6InnerComponent() {
          _classCallCheck(this, ES6InnerComponent);

          _get(Object.getPrototypeOf(ES6InnerComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(ES6InnerComponent, [{
          key: 'render',
          value: function render() {
            return React.createElement('div');
          }
        }]);

        return ES6InnerComponent;
      })(React.Component);

      var ContainerES6Component = wrap(ES6InnerComponent);

      expect(render(ContainerES6Component).constructor.displayName).to.eql('ES6InnerComponentContainer');
    });
  });

  describe('when fetch is a function', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: function fetch() {
          return {
            foo: 'bar',
            bar: _fetch.done({ baz: 'bam' })
          };
        }
      }));
    });

    it('should pass each of them to the inner component via props', function () {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });
  });

  describe('#getInnerComponent()', function () {
    beforeEach(function () {
      ContainerComponent = wrap(InnerComponent, {
        something: function something() {
          return this.getInnerComponent();
        }
      });
      element = renderIntoDocument(React.createElement(ContainerComponent, { app: app }));
    });

    it('should return the inner component', function () {
      expect(element.getInnerComponent()).to.equal(element.refs.innerComponent);
    });

    it('should be accessible inside other functions', function () {
      expect(element.something()).to.equal(element.refs.innerComponent);
    });
  });

  describe('when I pass in contextTypes', function () {
    beforeEach(function () {
      element = wrap(InnerComponent, {
        contextTypes: {
          foo: React.PropTypes.object
        }
      });
    });

    it('should include them in the containers contextTypes', function () {
      expect(element.contextTypes.foo).to.eql(React.PropTypes.object);
    });
  });

  describe('when I pass props to the container component', function () {
    beforeEach(function () {
      expectedProps = { foo: 'bar' };
      element = render(wrap(InnerComponent), expectedProps);
    });

    it('should pass them through to the inner component', function () {
      expect(initialProps).to.eql(expectedProps);
    });
  });

  describe('when I fetch a simple value', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return 'bar';
          }
        }
      }));
    });

    it('should pass that value to the inner component via props', function () {
      expect(initialProps).to.eql({ foo: 'bar' });
    });
  });

  describe('when the parent updates its props then it should update its children\'s', function () {
    var ParentComponent, fetch;

    beforeEach(function () {
      fetch = sinon.spy();
      ContainerComponent = wrap(InnerComponent, {
        fetch: {
          bar: function bar() {
            fetch(this.props);
            return 'bam';
          }
        }
      });

      ParentComponent = React.createClass({
        displayName: 'ParentComponent',

        getInitialState: function getInitialState() {
          return {
            foo: 'bar'
          };
        },
        render: function render() {
          return React.createElement(
            'div',
            null,
            React.createElement(ContainerComponent, { foo: this.state.foo })
          );
        }
      });

      var element = renderIntoDocument(React.createElement(ParentComponent, { app: app }));

      element.replaceState({
        foo: 'baz'
      });
    });

    it('should update the inner components props', function () {
      expect(updatedProps).to.eql({
        foo: 'baz',
        bar: 'bam'
      });
    });

    it('should refresh the props', function () {
      expect(fetch).to.be.calledWith({
        foo: 'baz'
      });
    });
  });

  describe('when I fetch multiple values', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return 'bar';
          },
          bar: function bar() {
            return { baz: 'bam' };
          }
        }
      }));
    });

    it('should pass each of them to the inner component via props', function () {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });
  });

  describe('when all of the fetchs are done and a done handler is not implemented', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.done('bar');
          },
          bar: function bar() {
            return _fetch.done({ baz: 'bam' });
          }
        }
      }));
    });

    it('should pass that value through to the child', function () {
      expect(initialProps).to.eql({
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      });
    });
  });

  describe('when you are fetching from a store', function () {
    var finishQuery, expectedId;

    beforeEach(function (done) {
      expectedId = 456;
      app.register('barStore', Marty.createStore({
        id: 'BarContainerStore',
        getInitialState: function getInitialState() {
          return {};
        },
        addBar: function addBar(bar) {
          this.state[bar.id] = bar;
          this.hasChanged();
        },
        getBar: function getBar(id) {
          return this.fetch({
            id: 'bar-' + id,
            locally: function locally() {
              return this.state[id];
            },
            remotely: function remotely() {
              return new Promise((function (resolve) {
                this.addBar({ id: id });
                finishQuery = resolve;
              }).bind(this));
            }
          });
        }
      }));

      ContainerComponent = wrap(InnerComponent, {
        listenTo: 'barStore',
        fetch: {
          bar: function bar() {
            return this.app.barStore.getBar(expectedId);
          }
        }
      });

      element = renderIntoDocument(React.createElement(ContainerComponent, { app: app }));

      finishQuery();

      setTimeout(done, 1);
    });

    it('should render the inner component when the fetch is complete', function () {
      expect(initialProps).to.eql({
        bar: { id: expectedId }
      });
    });
  });

  describe('when you pass in other functions', function () {
    beforeEach(function () {
      ContainerComponent = wrap(InnerComponent, {
        something: function something() {
          return [this, 'foo'];
        },

        statics: {
          somethingElse: function somethingElse() {
            return [this, 'bar'];
          }
        }
      });

      element = renderIntoDocument(React.createElement(ContainerComponent, { app: app }));
    });

    it('should expose the function with the element as the context', function () {
      expect(element.something()).to.eql([element, 'foo']);
    });

    it('should expose the static function on the component class', function () {
      expect(ContainerComponent.somethingElse()).to.eql([ContainerComponent, 'bar']);
    });
  });

  describe('when the component is bound to an application', function () {
    var actualApplication;

    beforeEach(function () {
      app = new Marty.Application();
      ContainerComponent = wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            actualApplication = this.app;

            return {};
          }
        }
      });

      element = renderIntoDocument(React.createElement(ContainerComponent, { app: app }));
    });

    it('should make the application accessible on `this.app`', function () {
      expect(actualApplication).to.equal(app);
    });
  });

  describe('when all of the fetchs are done and a done handler is implemented', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.done('bar');
          },
          bar: function bar() {
            return _fetch.done({ baz: 'bam' });
          }
        },
        done: handler
      }));
    });

    it('should call the handler with the results and component', function () {
      var expectedResults = {
        foo: 'bar',
        bar: {
          baz: 'bam'
        }
      };

      expect(handler).to.be.calledWith(expectedResults);
    });
  });

  describe('when a fetch is pending and there is a pending handler', function () {
    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.done('bar');
          },
          bar: function bar() {
            return _fetch.pending();
          },
          baz: function baz() {
            return _fetch.done('bam');
          }
        },
        pending: handler
      }));
    });

    it('should call the handler with the fetches and component', function () {
      expect(handler).to.be.calledOnce;
    });

    it('should pass in all the fetch results that have finished', function () {
      expect(handler).to.be.calledWith({
        foo: 'bar',
        baz: 'bam'
      });
    });
  });

  describe('when a fetch failed and there is a failed handler', function () {
    var fooError, barError;

    beforeEach(function () {
      fooError = new Error('foo');
      barError = new Error('bar');

      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.failed(fooError);
          },
          bar: function bar() {
            return _fetch.failed(barError);
          },
          baz: function baz() {
            return _fetch.done({});
          },
          bam: function bam() {
            return _fetch.pending();
          }
        },
        failed: handler
      }));
    });

    it('should call the handler with the errors and component', function () {
      var expectedErrors = {
        foo: fooError,
        bar: barError
      };

      expect(handler).to.be.calledWith(expectedErrors);
    });
  });

  describe('when a fetch failed and there is no failed handler', function () {
    var fooError;

    beforeEach(function () {
      fooError = new Error('foo');
    });

    it('should throw an error', function () {
      expect(noFailedHandler).to['throw']({
        foo: fooError
      });

      function noFailedHandler() {
        render(wrap(InnerComponent, {
          fetch: {
            foo: function foo() {
              return _fetch.failed(fooError);
            }
          }
        }));
      }
    });
  });

  describe('when I listen to the id of a store', function () {
    var expectedResult;

    beforeEach(function () {
      app = new Marty.Application();

      app.register('fooStore', Marty.createStore({
        getInitialState: function getInitialState() {
          return {};
        },
        addFoo: function addFoo(foo) {
          this.state[foo.id] = foo;
          this.hasChanged();
        },
        getFoo: function getFoo(id) {
          return this.state[id];
        }
      }));

      element = render(wrap(InnerComponent, {
        listenTo: 'fooStore',
        fetch: {
          foo: function foo() {
            return this.app.fooStore.getFoo(123);
          }
        }
      }));

      expectedResult = { id: 123 };
      app.fooStore.addFoo(expectedResult);
    });

    it('should update the inner components props when the store changes', function () {
      expect(updatedProps).to.eql({
        foo: expectedResult
      });
    });
  });

  describe('when I listen to the id of a store with mismatched event key', function () {
    var expectedResult;

    beforeEach(function () {
      app = new Marty.Application();

      updatedProps = { old: 'props' };

      app.register('fooStore', Marty.createStore({
        getInitialState: function getInitialState() {
          return {};
        },
        addFoo: function addFoo(foo) {
          this.state[foo.id] = foo;
          this.hasChanged('bar');
        },
        getFoo: function getFoo(id) {
          return this.state[id];
        }
      }));

      element = render(wrap(InnerComponent, {
        listenTo: 'fooStore:baz',
        fetch: {
          foo: function foo() {
            return this.app.fooStore.getFoo(123);
          }
        }
      }));

      expectedResult = { id: 123 };
      app.fooStore.addFoo(expectedResult);
    });

    it('should NOT update the inner components props when the store changes', function () {
      expect(updatedProps).to.eql({
        old: 'props'
      });
    });
  });

  describe('when I listen to the id of a store with a matching event key', function () {
    var expectedResult;

    beforeEach(function () {
      app = new Marty.Application();

      updatedProps = { old: 'props' };

      app.register('fooStore', Marty.createStore({
        getInitialState: function getInitialState() {
          return {};
        },
        addFoo: function addFoo(foo) {
          this.state[foo.id] = foo;
          this.hasChanged('bar');
        },
        getFoo: function getFoo(id) {
          return this.state[id];
        }
      }));

      element = render(wrap(InnerComponent, {
        listenTo: 'fooStore:bar',
        fetch: {
          foo: function foo() {
            return this.app.fooStore.getFoo(123);
          }
        }
      }));

      expectedResult = { id: 123 };
      app.fooStore.addFoo(expectedResult);
    });

    it('should update the inner components props when the store changes', function () {
      expect(updatedProps).to.eql({
        foo: expectedResult
      });
    });
  });

  describe('when I listen to a store', function () {
    var expectedResult;

    beforeEach(function () {
      element = render(wrap(InnerComponent, {
        listenTo: 'store',
        fetch: {
          foo: function foo() {
            return this.app.store.getFoo(123);
          }
        }
      }));

      expectedResult = { id: 123 };
      app.store.addFoo(expectedResult);
    });

    it('should update the inner components props when the store changes', function () {
      expect(updatedProps).to.eql({
        foo: expectedResult
      });
    });
  });

  describe('when calling a fetch handler', function () {
    var expectedResult, _failed;

    beforeEach(function () {
      _failed = sinon.spy();
      expectedResult = { id: 123 };
      element = render(wrap(InnerComponent, {
        fetch: {
          foo: function foo() {
            return _fetch.pending();
          }
        },
        result: expectedResult,
        pending: function pending() {
          return this.failed();
        },
        failed: function failed() {
          _failed(this.result);
          return this.done();
        }
      }));
    });

    it('should allow me to call anything else in the config', function () {
      expect(_failed).to.be.calledWith(expectedResult);
    });
  });

  describe('injectApp', function () {
    it('should inject app as a property on the component', function () {
      var Component = (function (_React$Component3) {
        _inherits(Component, _React$Component3);

        function Component() {
          _classCallCheck(this, Component);

          _get(Object.getPrototypeOf(Component.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(Component, [{
          key: 'render',
          value: function render() {
            return null;
          }
        }]);

        return Component;
      })(React.Component);

      Marty.injectApp(Component);

      expect(render(Component).app).to.eql(app);
    });
  });

  function withoutApp(props) {
    return _.omit(props, 'app');
  }

  function wrap(InnerComponent, containerOptions) {
    return Marty.createContainer(InnerComponent, containerOptions);
  }

  function render(Component, props) {
    return renderIntoDocument(React.createElement(Component, _extends({ app: app }, props)));
  }
});