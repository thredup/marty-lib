let log = require('./logger');
let _ = require('../mindash');


class StoreObserver {
  constructor(options) {
    options = options || {};

    this.app = options.app;
    this.component = options.component;
    this.onStoreChanged = options.onStoreChanged || _.noop;

    var stores = resolveStores(options);

    this.listeners = _.map(stores, ([store, eventKeys]) => {
      return this.listenToStore(store, eventKeys);
    });
  }

  dispose() {
    _.invoke(this.listeners, 'dispose');
  }

  listenToStore(store, eventKeys) {
    let component = this.component;
    let storeDisplayName = store.displayName || store.id;

    log.trace(
      `The ${component.displayName} component  (${component.id}) is listening to the ${storeDisplayName} store`
    );

    return store.addChangeListener((state, store, eventArgs) => {
      let storeDisplayName = store.displayName || store.id;

      if (store && store.action) {
        store.action.addComponentHandler({
          displayName: this.component.displayName
        }, store);
      }

      var logText = `${storeDisplayName} store has changed.`;

      if (!eventKeys.length || eventKeys.indexOf(eventArgs) !== -1) {
        logText += ` The ${this.component.displayName} component (${this.component.id}) is updating`;
        this.onStoreChanged(store);
      } else {
        logText += ` The ${this.component.displayName} component is !NOT! updating.` +
          ` Event "${eventArgs}" not in keys "${eventKeys}"`;
      }

      log.trace(logText);
    });
  }
}

function resolveStores(options) {
  var app = options.app;
  var stores = options.stores;

  if (stores && !_.isArray(stores)) {
    stores = [stores];
  }

  return _.map(stores, storeId => {
    if (!_.isString(storeId)) {
      throw new Error(
        'Store Id\'s must be strings. If you\'re migrating to v0.10 ' +
        'you have probably forgotten to update listenTo'
      );
    }

    if (!app) {
      throw new Error('Component not bound to an application');
    }

    var [storeName, ...eventKeys] = storeId.split(':');
    var store = _.get(app, storeName, null);
    if (!store) {
      throw new Error(`Could not find the store ${storeName}`);
    }

    return [store, eventKeys];
  });
}

module.exports = StoreObserver;
