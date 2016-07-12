'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('../mindash');
var findApp = require('../core/findApp');
var uuid = require('../core/utils/uuid');
var getFetchResult = require('./getFetchResult');
var appProperty = require('../core/appProperty');
var StoreObserver = require('../core/storeObserver');
var getClassName = require('../core/utils/getClassName');

var RESERVED_FUNCTIONS = ['contextTypes', 'componentDidMount', 'componentWillReceiveProps', 'onStoreChanged', 'componentWillUnmount', 'getInitialState', 'getState', 'render'];

module.exports = function (React) {
  var DEFAULT_CONTEXT_TYPES = {
    app: React.PropTypes.object
  };

  function injectApp(Component) {
    Component.contextTypes = _.extend({}, DEFAULT_CONTEXT_TYPES, Component.contextTypes);

    appProperty(Component.prototype);
  }

  function createContainer(InnerComponent, config) {
    config = config || {};

    if (!InnerComponent) {
      throw new Error('Must specify an inner component');
    }

    var id = uuid.type('Component');
    var innerComponentDisplayName = InnerComponent.displayName || getClassName(InnerComponent);
    var contextTypes = _.extend({}, DEFAULT_CONTEXT_TYPES, config.contextTypes);

    injectApp(InnerComponent);

    var specification = {
      contextTypes: contextTypes,
      childContextTypes: DEFAULT_CONTEXT_TYPES,
      getChildContext: function getChildContext() {
        return { app: findApp(this) };
      },
      componentDidMount: function componentDidMount() {
        var component = {
          id: id,
          displayName: innerComponentDisplayName
        };

        this.observer = new StoreObserver({
          app: this.app,
          component: component,
          stores: this.listenTo,
          onStoreChanged: this.onStoreChanged
        });
      },
      componentWillReceiveProps: function componentWillReceiveProps(props) {
        this.props = props;
        this.setState(this.getState(props));
      },
      onStoreChanged: function onStoreChanged() {
        this.setState(this.getState());
      },
      componentWillUnmount: function componentWillUnmount() {
        if (this.observer) {
          this.observer.dispose();
        }
      },
      getInitialState: function getInitialState() {
        appProperty(this);
        return this.getState();
      },
      getState: function getState() {
        return {
          result: getFetchResult(this)
        };
      },
      done: function done(results) {
        return React.createElement(InnerComponent, _extends({ ref: 'innerComponent' }, this.props, results, { app: this.app }));
      },
      getInnerComponent: function getInnerComponent() {
        return this.refs.innerComponent;
      },
      render: function render() {
        var container = this;
        var result = this.state.result;

        return result.when({
          done: function done(results) {
            if (_.isFunction(container.done)) {
              return container.done(results);
            }

            throw new Error('The `done` handler must be a function');
          },
          pending: function pending() {
            if (_.isFunction(container.pending)) {
              return container.pending(result.result);
            }

            return false;
          },
          failed: function failed(error) {
            if (_.isFunction(container.failed)) {
              return container.failed(error);
            }

            throw error;
          }
        });
      }
    };

    // This will add in lifecycle hooks, accessors, statics, and other
    // options to be passed into React.createClass.
    _.extend(specification, _.omit(config, RESERVED_FUNCTIONS));

    // Include lifecycle methods if specified in config. We don't need to
    // explicitly handle the ones that aren't in RESERVED_FUNCTIONS.
    specification.componentDidMount = callBoth(specification.componentDidMount, config.componentDidMount);

    specification.componentWillReceiveProps = callBothWithProps(specification.componentWillReceiveProps, config.componentWillReceiveProps);

    specification.componentWillUnmount = callBoth(specification.componentWillUnmount, config.componentWillUnmount);

    var Container = React.createClass(specification);

    Container.InnerComponent = InnerComponent;
    Container.displayName = innerComponentDisplayName + 'Container';

    return Container;

    function callBoth(func1, func2) {
      if (_.isFunction(func2)) {
        return function () {
          func1.call(this);
          func2.call(this);
        };
      } else {
        return func1;
      }
    }

    function callBothWithProps(func1, func2) {
      if (_.isFunction(func2)) {
        return function (props) {
          func1.call(this, props);
          func2.call(this, props);
        };
      } else {
        return func1;
      }
    }
  }

  return { injectApp: injectApp, createContainer: createContainer };
};