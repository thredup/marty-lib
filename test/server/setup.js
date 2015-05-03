require('babel').register();

process.env['NODE_ENV'] = 'test';

var chai = require('chai');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);

require('../../modules/core/warnings').appIsTheFuture = false;