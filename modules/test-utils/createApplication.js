'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('../mindash');
var DEFAULT_OPTIONS = {
  include: [],
  exclude: [],
  stub: {}
};

function createApplication(Application, options) {
  var _$defaults = _.defaults(options || {}, DEFAULT_OPTIONS);

  var include = _$defaults.include;
  var exclude = _$defaults.exclude;
  var stub = _$defaults.stub;

  // Inherit from application so we modify prototype

  var TestApplication = (function (_Application) {
    _inherits(TestApplication, _Application);

    function TestApplication() {
      _classCallCheck(this, TestApplication);

      _get(Object.getPrototypeOf(TestApplication.prototype), 'constructor', this).apply(this, arguments);
    }

    return TestApplication;
  })(Application);

  var _register = TestApplication.prototype.register;

  if (!_.isArray(include)) {
    include = [include];
  }

  if (!_.isArray(exclude)) {
    exclude = [exclude];
  }

  var stubIds = _.keys(stub);

  TestApplication.prototype.register = function stubRegister(key, value) {
    if (!_.isString(key)) {
      _register.apply(this, arguments);
    } else if (stub[key]) {
      this[key] = stub[key];
      stubIds = _.difference(stubIds, [key]);
    } else if (include.length) {
      if (include.indexOf(key) !== -1) {
        _register.call(this, key, value);
      }
    } else if (exclude.length) {
      if (include.indexOf(key) === -1) {
        _register.call(this, key, value);
      }
    }
  };

  var app = new TestApplication();

  app.dispatcher.dispatchedActions = [];
  app.dispatcher.register(function (action) {
    app.dispatcher.dispatchedActions.push(action);
  });

  // If any properties have not been registered
  // then just re-assign them
  _.each(stubIds, function (id) {
    return app[id] = stub[id];
  });

  return app;
}

module.exports = createApplication;