'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var log = require('./logger');
var _ = require('../mindash');

var StoreObserver = (function () {
  function StoreObserver(options) {
    var _this = this;

    _classCallCheck(this, StoreObserver);

    options = options || {};

    this.app = options.app;
    this.component = options.component;
    this.onStoreChanged = options.onStoreChanged || _.noop;

    var stores = resolveStores(options);

    this.listeners = _.map(stores, function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var store = _ref2[0];
      var eventKeys = _ref2[1];

      return _this.listenToStore(store, eventKeys);
    });
  }

  _createClass(StoreObserver, [{
    key: 'dispose',
    value: function dispose() {
      _.invoke(this.listeners, 'dispose');
    }
  }, {
    key: 'listenToStore',
    value: function listenToStore(store, eventKeys) {
      var _this2 = this;

      var component = this.component;
      var storeDisplayName = store.displayName || store.id;

      log.trace('The ' + component.displayName + ' component  (' + component.id + ') is listening to the ' + storeDisplayName + ' store');

      return store.addChangeListener(function (state, store, eventArgs) {
        var storeDisplayName = store.displayName || store.id;

        if (store && store.action) {
          store.action.addComponentHandler({
            displayName: _this2.component.displayName
          }, store);
        }

        var logText = storeDisplayName + ' store has changed.';

        if (!eventKeys.length || eventKeys.indexOf(eventArgs) !== -1) {
          logText += ' The ' + _this2.component.displayName + ' component (' + _this2.component.id + ') is updating';
          _this2.onStoreChanged(store);
        } else {
          logText += ' The ' + _this2.component.displayName + ' component is !NOT! updating.' + (' Event "' + eventArgs + '" not in keys "' + eventKeys + '"');
        }

        log.trace(logText);
      });
    }
  }]);

  return StoreObserver;
})();

function resolveStores(options) {
  var app = options.app;
  var stores = options.stores;

  if (stores && !_.isArray(stores)) {
    stores = [stores];
  }

  return _.map(stores, function (storeId) {
    if (!_.isString(storeId)) {
      throw new Error('Store Id\'s must be strings. If you\'re migrating to v0.10 ' + 'you have probably forgotten to update listenTo');
    }

    if (!app) {
      throw new Error('Component not bound to an application');
    }

    var _storeId$split = storeId.split(':');

    var _storeId$split2 = _toArray(_storeId$split);

    var storeName = _storeId$split2[0];

    var eventKeys = _storeId$split2.slice(1);

    var store = _.get(app, storeName, null);
    if (!store) {
      throw new Error('Could not find the store ' + storeName);
    }

    return [store, eventKeys];
  });
}

module.exports = StoreObserver;