'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var sinon = require('sinon');
var _ = require('../../mindash');
var expect = require('chai').expect;
var uuid = require('../../core/utils/uuid');
var buildMarty = require('../../../test/lib/buildMarty');
var describeStyles = require('../../../test/lib/describeStyles');

require('es6-promise').polyfill();

describeStyles('HttpStateSource', function (styles) {
  this.timeout(10000);

  var API, baseUrl, response, xmlContentType, accept;
  var hook1, hook2, hook3, executionOrder, jsonContentType;
  var Marty, HttpStateSource;

  beforeEach(function () {
    Marty = buildMarty();
    HttpStateSource = Marty.HttpStateSource;
    HttpStateSource.removeHook('parseJSON');

    baseUrl = '/stub/';
    xmlContentType = 'application/xml';
    jsonContentType = 'application/json';
  });

  describe('when you dont specify a baseUrl', function () {
    var url;

    beforeEach(function () {
      url = baseUrl + 'foos';

      return httpStateSource().get(url).then(storeResponse);
    });

    it('should start a get request with the given url', function () {
      expect(response).to.eql({
        url: '/stub/foos',
        method: 'GET',
        body: {}
      });
    });
  });

  describe('hooks', function () {
    var server, expectedStateSource, actualContext;

    beforeEach(function () {
      server = sinon.fakeServer.create();
      server.respondWith('GET', '/foo', [400, {}, '']);
    });

    afterEach(function () {
      server.restore();
    });

    describe('addHook', function () {
      describe('when I add a hook with no Id', function () {
        it('should throw an error', function () {
          expect(creatingAHookWithNoId).to['throw'](Error);

          function creatingAHookWithNoId() {
            HttpStateSource.addHook({
              foo: 'bar'
            });
          }
        });
      });

      describe('before', function () {
        beforeEach(function () {
          executionOrder = [];
          hook1 = {
            id: '1',
            priority: 2,
            before: sinon.spy(function () {
              actualContext = this;
              executionOrder.push(1);
            })
          };

          hook2 = {
            id: '2',
            before: sinon.spy(function () {
              executionOrder.push(2);
            })
          };

          hook3 = {
            id: '3',
            priority: 1,
            before: sinon.spy(function () {
              executionOrder.push(3);
            })
          };

          HttpStateSource.addHook(hook1);
          HttpStateSource.addHook(hook2);
          HttpStateSource.addHook(hook3);

          return get();
        });

        afterEach(function () {
          HttpStateSource.removeHook(hook1);
          HttpStateSource.removeHook(hook2);
          HttpStateSource.removeHook(hook3);
        });

        it('should call the before hook once', function () {
          _.each([hook1, hook2, hook3], function (hook) {
            expect(hook.before).to.be.calledOnce;
          });
        });

        it('should set the context to the mixin', function () {
          expect(actualContext).to.equal(expectedStateSource);
        });

        it('should execute them in priority order', function () {
          expect(executionOrder).to.eql([3, 1, 2]);
        });
      });

      describe('after', function () {
        beforeEach(function () {
          executionOrder = [];
          hook1 = {
            id: '1',
            priority: 2,
            after: sinon.spy(function () {
              actualContext = this;
              executionOrder.push(1);
            })
          };

          hook2 = {
            id: '2',
            after: sinon.spy(function () {
              executionOrder.push(2);
            })
          };

          hook3 = {
            id: '3',
            priority: 1,
            after: sinon.spy(function () {
              executionOrder.push(3);
            })
          };

          HttpStateSource.addHook(hook1);
          HttpStateSource.addHook(hook2);
          HttpStateSource.addHook(hook3);

          return get();
        });

        afterEach(function () {
          HttpStateSource.removeHook(hook1);
          HttpStateSource.removeHook(hook2);
          HttpStateSource.removeHook(hook3);
        });

        it('should call the after hook once', function () {
          _.each([hook1, hook2, hook3], function (hook) {
            expect(hook.after).to.be.calledOnce;
          });
        });

        it('should set the context to the mixin', function () {
          expect(actualContext).to.equal(expectedStateSource);
        });

        it('should execute them in priority order', function () {
          expect(executionOrder).to.eql([3, 1, 2]);
        });
      });
    });

    function get() {
      expectedStateSource = httpStateSource();

      var res = expectedStateSource.get('/foo');

      server.respond();

      return res;
    }
  });

  describe('when a request fails', function () {
    var server, expectedResponse, actualError;

    beforeEach(function () {
      server = sinon.fakeServer.create();

      server.respondWith('GET', '/foo', [400, {}, '']);

      var res = httpStateSource().get('/foo');

      server.respond();

      return res['catch'](function (error) {
        actualError = error;
      });
    });

    afterEach(function () {
      server.restore();
    });

    it('should reject with the response object', function () {
      expect(actualError).to.eql(expectedResponse);
    });
  });

  describe('#get()', function () {
    describe('when you pass in a url', function () {
      beforeEach(function () {
        return makeRequest('get', '/foos');
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'GET',
          body: {}
        });
      });
    });

    describe('when you pass in a some options', function () {
      beforeEach(function () {
        return makeRequest('get', {
          url: 'bars/baz',
          contentType: xmlContentType
        });
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/bars/baz',
          method: 'GET',
          body: {}
        });
      });
    });
  });

  describe('#dataType', function () {
    describe('json', function () {
      beforeEach(function () {
        return requestDataType('json');
      });

      it('should convert the data type to accept header', function () {
        expect(accept).to.eql('application/json');
      });
    });

    describe('xml', function () {
      beforeEach(function () {
        return requestDataType('xml');
      });

      it('should convert the data type to accept header', function () {
        expect(accept).to.eql('application/xml, text/xml');
      });
    });

    describe('text', function () {
      beforeEach(function () {
        return requestDataType('text');
      });

      it('should convert the data type to accept header', function () {
        expect(accept).to.eql('text/plain');
      });
    });

    describe('html', function () {
      beforeEach(function () {
        return requestDataType('html');
      });

      it('should convert the data type to accept header', function () {
        expect(accept).to.eql('text/html');
      });
    });

    describe('script', function () {
      beforeEach(function () {
        return requestDataType('script');
      });

      it('should convert the data type to accept header', function () {
        expect(accept).to.eql('text/javascript, application/javascript, application/x-javascript');
      });
    });

    function requestDataType(dataType) {
      return makeRequest('get', {
        url: '/stub/foos/?id=' + uuid.small(),
        dataType: dataType
      });
    }
  });

  describe('#put()', function () {
    describe('when you pass in a url', function () {
      beforeEach(function () {
        return makeRequest('put', '/foos');
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'PUT',
          body: {}
        });
      });
    });

    describe('when you pass in a some options', function () {
      var expectedBody;

      beforeEach(function () {
        expectedBody = { foo: 'bar' };

        return makeRequest('put', {
          url: 'bars/baz',
          body: expectedBody,
          contentType: jsonContentType
        });
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          method: 'PUT',
          url: '/stub/bars/baz',
          body: expectedBody
        });
      });
    });
  });

  describe('#post()', function () {
    describe('when you pass in a url', function () {
      beforeEach(function () {
        return makeRequest('post', '/foos');
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'POST',
          body: {}
        });
      });
    });

    describe('when you pass in a some options', function () {
      var expectedBody;

      beforeEach(function () {
        expectedBody = { foo: 'bar' };

        return makeRequest('post', {
          url: 'bars/baz',
          body: expectedBody,
          contentType: jsonContentType
        });
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          method: 'POST',
          url: '/stub/bars/baz',
          body: expectedBody
        });
      });
    });

    if (typeof FormData !== 'undefined') {
      describe('when request body is a FormData object', function () {
        var options;

        beforeEach(function () {
          baseUrl = baseUrl.substring(0, baseUrl.length - 1);
          API = httpStateSource(baseUrl);

          options = {
            url: 'foos',
            headers: {},
            body: new FormData()
          };

          return API.post(options);
        });

        it('should not set the Content-Type request header', function () {
          expect(options.headers['Content-Type']).to.eql(undefined);
        });
      });

      describe('when request body is not a FormData object', function () {
        var options;

        beforeEach(function () {
          baseUrl = baseUrl.substring(0, baseUrl.length - 1);

          API = httpStateSource(baseUrl);

          options = {
            url: 'foos',
            headers: {},
            body: {}
          };

          return API.post(options);
        });

        it('should default the Content-Type request header to application/json', function () {
          expect(options.headers['Content-Type']).to.eql('application/json');
        });
      });
    }
  });

  describe('#delete()', function () {
    describe('when you pass in a url', function () {
      beforeEach(function () {
        return makeRequest('delete', '/foos');
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'DELETE',
          body: {}
        });
      });
    });

    describe('when you pass in a some options', function () {
      beforeEach(function () {
        return makeRequest('delete', {
          url: 'bars/baz'
        });
      });

      it('should create some options which include the url', function () {
        expect(response).to.eql({
          url: '/stub/bars/baz',
          method: 'DELETE',
          body: {}
        });
      });
    });
  });

  describe('#baseUrl', function () {
    describe('when you have a baseUrl', function () {
      beforeEach(function () {
        API = httpStateSource(baseUrl);

        return API.get('/foos').then(storeResponse);
      });

      it('should add the / if its missing', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'GET',
          body: {}
        });
      });
    });

    describe('when you dont specify a / in the baseUrl or url', function () {
      beforeEach(function () {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);

        API = httpStateSource(baseUrl);

        return API.get('foos').then(storeResponse);
      });

      it('should add the / if its missing', function () {
        expect(response).to.eql({
          url: '/stub/foos',
          method: 'GET',
          body: {}
        });
      });
    });
  });

  function httpStateSource(baseUrl) {
    var StateSource = styles({
      classic: function classic() {
        return Marty.createStateSource({
          type: 'http',
          baseUrl: baseUrl
        });
      },
      es6: function es6() {
        return (function (_HttpStateSource) {
          _inherits(ExampleHttpStateSource, _HttpStateSource);

          function ExampleHttpStateSource() {
            _classCallCheck(this, ExampleHttpStateSource);

            _get(Object.getPrototypeOf(ExampleHttpStateSource.prototype), 'constructor', this).call(this);
            this.baseUrl = baseUrl;
          }

          return ExampleHttpStateSource;
        })(HttpStateSource);
      }
    });

    return new StateSource();
  }

  function storeResponse(res) {
    return res.json().then(function (json) {
      response = json;
      accept = response.accept;
      delete response.accept;
      return json;
    });
  }

  function makeRequest(method) {
    var args = _.rest(arguments);

    API = httpStateSource(baseUrl);

    return API[method].apply(API, args).then(storeResponse);
  }
});